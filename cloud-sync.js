(() => {
  "use strict";

  const SUPABASE_URL = "https://wsxflndffdymmmekxxqu.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jth5vjSpBQzK0uiErGRucw_GId1_WEO";
  const TABLE_NAME = "kaoyan_planner_state";
  const META_KEY = "shoreline-kaoyan-cloud-meta-v1";
  const SAVE_DELAY = 900;
  const RECONCILE_DELAY = 180;
  const FALLBACK_POLL_MS = 30000;

  const planner = window.KaoyanPlanner;
  const gate = document.querySelector("#cloudGate");
  const loginForm = document.querySelector("#cloudLoginForm");
  const loginButton = document.querySelector("#cloudLoginButton");
  const loginMessage = document.querySelector("#cloudLoginMessage");
  const conflictPanel = document.querySelector("#cloudConflict");
  const useCloudButton = document.querySelector("#useCloudButton");
  const useLocalButton = document.querySelector("#useLocalButton");
  const accountEmail = document.querySelector("#cloudAccountEmail");
  const settingsStatus = document.querySelector("#cloudSettingsStatus");
  const syncNowButton = document.querySelector("#cloudSyncNow");
  const signOutButton = document.querySelector("#cloudSignOut");
  const saveIndicator = document.querySelector("#saveState");

  let client = null;
  let session = null;
  let user = null;
  let active = false;
  let suppressPush = false;
  let syncing = false;
  let pendingState = null;
  let pendingVersion = 0;
  let remoteRevision = 0;
  let saveTimer = null;
  let activeToken = "";
  let hydrationPromise = null;
  let hydratingToken = "";
  let conflictResolver = null;
  let localOnly = false;
  let realtimeChannel = null;
  let realtimeUserId = "";
  let reconcileTimer = null;
  let pollTimer = null;

  window.KaoyanCloud = Object.freeze({
    queueSave,
    syncNow: () => syncNow(true),
    isActive: () => active
  });

  init();

  async function init() {
    bindCloudEvents();

    if (!planner) {
      enterLocalOnlyMode("计划程序已打开，但云同步初始化失败；当前修改仍会保存在本机。", true);
      return;
    }

    if (!window.supabase?.createClient) {
      enterLocalOnlyMode("云同步组件未加载；已进入本机模式。网络恢复后刷新页面即可重新连接云端。", true);
      return;
    }

    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    client.auth.onAuthStateChange((event, nextSession) => {
      window.setTimeout(() => {
        if (event === "INITIAL_SESSION" && !nextSession) return;
        if (event === "SIGNED_OUT" || !nextSession) {
          deactivateSession("已退出登录。再次登录后可继续同步。");
          return;
        }
        if (["SIGNED_IN", "TOKEN_REFRESHED", "INITIAL_SESSION", "USER_UPDATED"].includes(event)) {
          activateSession(nextSession).catch(handleActivationError);
        }
      }, 0);
    });

    const { data, error } = await client.auth.getSession();
    if (error) {
      if (isNetworkError(error)) {
        enterLocalOnlyMode("无法连接云端；已进入本机模式，修改会在下次登录后继续同步。");
        return;
      }
      setGateMessage(readableAuthError(error), true);
      return;
    }
    if (data.session) {
      await activateSession(data.session).catch(handleActivationError);
    } else if (!navigator.onLine) {
      enterLocalOnlyMode("当前离线且没有可用登录会话；已进入本机模式，修改会留待下次登录同步。");
    } else {
      deactivateSession("请输入你在 27plan 项目中创建的唯一账号。", false);
    }
  }

  function bindCloudEvents() {
    loginForm?.addEventListener("submit", handleLogin);
    syncNowButton?.addEventListener("click", () => syncNow(true));
    signOutButton?.addEventListener("click", handleSignOut);

    useCloudButton?.addEventListener("click", () => resolveConflict("cloud"));
    useLocalButton?.addEventListener("click", () => resolveConflict("local"));

    window.addEventListener("online", () => {
      if (localOnly) {
        if (client && session) activateSession(session).catch(handleActivationError);
        else if (client) deactivateSession("网络已恢复。请登录一次，把本机修改同步到其他设备。", false);
        else {
          setIndicator("本机修改待刷新同步", "offline");
          if (settingsStatus) settingsStatus.textContent = "网络已恢复；刷新页面后可重新连接云端";
        }
        return;
      }
      if (active) syncNow(false);
    });

    window.addEventListener("offline", () => {
      if (active) setIndicator("离线 · 已存本机", "offline");
    });

    window.addEventListener("focus", () => {
      if (active && navigator.onLine) syncNow(false);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && active && navigator.onLine) syncNow(false);
    });
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!client) return;

    const email = document.querySelector("#cloudEmail").value.trim();
    const password = document.querySelector("#cloudPassword").value;
    loginButton.disabled = true;
    loginButton.textContent = "正在验证……";
    setGateMessage("正在验证账号并读取云端计划……");

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    document.querySelector("#cloudPassword").value = "";
    loginButton.disabled = false;
    loginButton.textContent = "进入作战手册";

    if (error) {
      setGateMessage(readableAuthError(error), true);
      return;
    }

    await activateSession(data.session).catch(handleActivationError);
  }

  async function activateSession(nextSession) {
    if (!nextSession) {
      deactivateSession("登录已失效，请重新登录。", true);
      return;
    }

    if (active && user?.id === nextSession.user?.id) {
      session = nextSession;
      activeToken = nextSession.access_token;
      startRealtimeSubscription();
      return;
    }
    if (active && activeToken === nextSession.access_token) return;
    if (hydrationPromise && hydratingToken === nextSession.access_token) return hydrationPromise;

    hydratingToken = nextSession.access_token;
    hydrationPromise = hydrateSession(nextSession).finally(() => {
      hydrationPromise = null;
      hydratingToken = "";
    });
    return hydrationPromise;
  }

  async function hydrateSession(nextSession) {
    session = nextSession;
    const cachedUser = nextSession.user;
    setGateMessage("登录成功，正在校验账号与云端版本……");
    setIndicator("读取云端…", "saving");

    if (!navigator.onLine) {
      user = cachedUser;
      activeToken = nextSession.access_token;
      active = true;
      localOnly = false;
      remoteRevision = Number(getUserMeta(user.id)?.revision || 0);
      unlockGate();
      startRealtimeSubscription();
      startFallbackPolling();
      setIndicator("离线 · 已存本机", "offline");
      return;
    }

    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) throw userError || new Error("无法校验登录账号");
    user = userData.user;

    const remote = await fetchRemoteRow();
    const local = planner.getState();
    const meta = getUserMeta(user.id);
    const localOnlyDirty = Boolean(readMetaStore().localOnlyDirty);
    const localDirty = Boolean(meta?.dirty || localOnlyDirty);

    if (!remote) {
      const created = await insertRemoteState(local);
      acceptSyncedRow(created);
    } else if (localDirty && (localOnlyDirty || Number(meta?.revision || 0) !== Number(remote.revision))) {
      const choice = await askConflict();
      if (choice === "local") {
        const uploaded = await updateRemoteState(local, Number(remote.revision));
        if (!uploaded) throw new Error("云端版本刚刚变化，请重新同步");
        acceptSyncedRow(uploaded);
      } else {
        preserveConflictBackup(local);
        applyRemoteRow(remote);
      }
    } else if (localDirty) {
      const uploaded = await updateRemoteState(local, Number(remote.revision));
      if (!uploaded) throw new Error("云端版本刚刚变化，请重新同步");
      acceptSyncedRow(uploaded);
    } else {
      applyRemoteRow(remote);
    }

    activeToken = nextSession.access_token;
    active = true;
    localOnly = false;
    unlockGate();
    startRealtimeSubscription();
    startFallbackPolling();
    setIndicator("已云同步", "cloud");
  }

  function deactivateSession(message, isError = false) {
    stopRealtimeSubscription();
    stopFallbackPolling();
    active = false;
    localOnly = false;
    activeToken = "";
    session = null;
    user = null;
    remoteRevision = 0;
    pendingState = null;
    window.clearTimeout(saveTimer);
    document.body.classList.add("cloud-locked");
    setPageLocked(true);
    if (gate) gate.hidden = false;
    if (loginForm) loginForm.hidden = false;
    if (conflictPanel) conflictPanel.hidden = true;
    if (accountEmail) accountEmail.textContent = "尚未登录";
    if (settingsStatus) settingsStatus.textContent = "登录后自动同步全部计划";
    setGateMessage(message, isError);
    setIndicator("等待登录", isError ? "error" : "offline");
  }

  function unlockGate() {
    document.body.classList.remove("cloud-locked");
    setPageLocked(false);
    if (gate) gate.hidden = true;
    if (loginForm) loginForm.hidden = false;
    if (conflictPanel) conflictPanel.hidden = true;
    if (accountEmail) accountEmail.textContent = user?.email || "已登录账号";
    if (settingsStatus) settingsStatus.textContent = navigator.onLine ? "已连接 · 自动保存到云端" : "离线中 · 暂存于本机";
    if (syncNowButton) syncNowButton.disabled = false;
    if (signOutButton) signOutButton.disabled = false;
  }

  function enterLocalOnlyMode(message, isError = false) {
    stopRealtimeSubscription();
    stopFallbackPolling();
    active = false;
    localOnly = true;
    activeToken = "";
    user = null;
    document.body.classList.remove("cloud-locked");
    setPageLocked(false);
    if (gate) gate.hidden = true;
    if (accountEmail) accountEmail.textContent = "本机模式";
    if (settingsStatus) settingsStatus.textContent = message;
    if (syncNowButton) syncNowButton.disabled = true;
    if (signOutButton) signOutButton.disabled = true;
    setGateMessage(message, isError);
    setIndicator("本机模式 · 自动保存", isError ? "error" : "offline");
  }

  function queueSave(nextState) {
    if (suppressPush) return true;
    if (localOnly) {
      setRootMeta({ localOnlyDirty: true, localUpdatedAt: new Date().toISOString() });
      setIndicator(navigator.onLine ? "本机修改待登录同步" : "离线 · 已存本机", "offline");
      return true;
    }
    if (!active || !user) return false;

    pendingState = nextState;
    pendingVersion += 1;
    setUserMeta(user.id, {
      dirty: true,
      revision: remoteRevision,
      localUpdatedAt: new Date().toISOString()
    });

    window.clearTimeout(saveTimer);
    if (!navigator.onLine) {
      setIndicator("离线 · 已存本机", "offline");
      return true;
    }

    setIndicator("等待云同步…", "saving");
    saveTimer = window.setTimeout(() => flushPending(), SAVE_DELAY);
    return true;
  }

  async function flushPending() {
    if (!active || !user || syncing || !pendingState) return false;
    if (!navigator.onLine) {
      setIndicator("离线 · 已存本机", "offline");
      return false;
    }

    window.clearTimeout(saveTimer);
    syncing = true;
    setIndicator("同步中…", "saving");

    try {
      while (pendingState && active && user && navigator.onLine) {
        const snapshot = pendingState;
        const snapshotVersion = pendingVersion;
        let uploaded = await updateRemoteState(snapshot, remoteRevision);
        if (!uploaded) {
          const remote = await fetchRemoteRow();
          if (!remote) throw new Error("云端版本不存在，请刷新后重试");
          const choice = await askConflict();
          if (choice === "local") {
            uploaded = await updateRemoteState(snapshot, Number(remote.revision));
            if (!uploaded) throw new Error("另一设备仍在修改，请稍后重试");
            unlockGate();
          } else {
            preserveConflictBackup(pendingState || planner.getState());
            pendingState = null;
            applyRemoteRow(remote);
            unlockGate();
            setIndicator("已载入最新云端", "cloud");
            return true;
          }
        }

        const snapshotIsLatest = pendingVersion === snapshotVersion && pendingState === snapshot;
        if (snapshotIsLatest) pendingState = null;
        acceptSyncedRow(uploaded, Boolean(pendingState));
        if (pendingState) {
          setIndicator("继续同步新修改…", "saving");
        } else {
          setIndicator("已云同步", "cloud");
        }
      }
      return !pendingState;
    } catch (error) {
      setUserMeta(user.id, { dirty: true, revision: remoteRevision });
      if (active) unlockGate();
      setIndicator(isNetworkError(error) ? "网络异常 · 已存本机" : "同步失败 · 已存本机", "error");
      if (settingsStatus) settingsStatus.textContent = readableSyncError(error);
      return false;
    } finally {
      syncing = false;
      if (pendingState && active && navigator.onLine) {
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(() => flushPending(), SAVE_DELAY);
      }
    }
  }

  async function syncNow(showFeedback = false) {
    if (!active || !user) return false;
    if (!navigator.onLine) {
      setIndicator("离线 · 已存本机", "offline");
      return false;
    }
    const meta = getUserMeta(user.id);
    let successful = true;
    if (meta?.dirty || pendingState) {
      if (!pendingState) {
        pendingState = planner.getState();
        pendingVersion += 1;
      }
      await flushPending();
      successful = !getUserMeta(user.id)?.dirty && !pendingState;
    }
    if (successful && !pendingState) {
      successful = await pullIfNewer();
    }
    if (showFeedback && settingsStatus && active) {
      settingsStatus.textContent = navigator.onLine ? "刚刚完成双向校验" : "当前离线，已保存在本机";
    }
    return successful;
  }

  async function pullIfNewer() {
    if (!active || !user || syncing || !navigator.onLine) return false;
    syncing = true;
    try {
      const remote = await fetchRemoteRow();
      if (!remote || Number(remote.revision) <= remoteRevision) return true;

      const meta = getUserMeta(user.id);
      if (meta?.dirty || pendingState) {
        const local = pendingState || planner.getState();
        const localVersion = pendingVersion;
        const choice = await askConflict();
        if (choice === "local") {
          const uploaded = await updateRemoteState(local, Number(remote.revision));
          if (!uploaded) throw new Error("云端版本再次变化，请稍后重试");
          if (pendingVersion === localVersion && pendingState === local) pendingState = null;
          acceptSyncedRow(uploaded, Boolean(pendingState));
          unlockGate();
        } else {
          preserveConflictBackup(local);
          pendingState = null;
          applyRemoteRow(remote);
          unlockGate();
        }
      } else {
        applyRemoteRow(remote);
      }
      setIndicator("已载入最新云端", "cloud");
      return true;
    } catch (error) {
      if (active) unlockGate();
      setIndicator("云端校验失败", "error");
      if (settingsStatus) settingsStatus.textContent = readableSyncError(error);
      return false;
    } finally {
      syncing = false;
      if (pendingState && active && navigator.onLine) {
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(() => flushPending(), SAVE_DELAY);
      }
    }
  }

  async function fetchRemoteRow() {
    const { data, error } = await client
      .from(TABLE_NAME)
      .select("payload, revision, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function insertRemoteState(payload) {
    const { data, error } = await client
      .from(TABLE_NAME)
      .insert({
        user_id: user.id,
        payload,
        revision: 1,
        updated_at: new Date().toISOString()
      })
      .select("payload, revision, updated_at")
      .single();
    if (error) throw error;
    return data;
  }

  async function updateRemoteState(payload, expectedRevision) {
    const { data, error } = await client
      .from(TABLE_NAME)
      .update({
        payload,
        revision: expectedRevision + 1,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id)
      .eq("revision", expectedRevision)
      .select("payload, revision, updated_at")
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  function applyRemoteRow(row) {
    suppressPush = true;
    try {
      planner.replaceState(row.payload);
    } finally {
      suppressPush = false;
    }
    acceptSyncedRow(row, false);
  }

  function acceptSyncedRow(row, keepDirty = false) {
    if (!row) throw new TypeError("云端返回了空版本");
    remoteRevision = Number(row.revision);
    setUserMeta(user.id, {
      dirty: keepDirty,
      revision: remoteRevision,
      lastSyncedAt: row.updated_at || new Date().toISOString()
    });
    if (!keepDirty) setRootMeta({ localOnlyDirty: false, lastSyncedAt: row.updated_at || new Date().toISOString() });
    if (settingsStatus) settingsStatus.textContent = `云端版本 ${remoteRevision} · 自动同步已开启`;
  }

  function askConflict() {
    document.body.classList.add("cloud-locked");
    setPageLocked(true);
    if (gate) gate.hidden = false;
    if (loginForm) loginForm.hidden = true;
    if (conflictPanel) conflictPanel.hidden = false;
    setGateMessage("请选择要保留的版本。使用云端前，本机版本会自动留一份冲突备份。");
    return new Promise(resolve => {
      conflictResolver = resolve;
    });
  }

  function resolveConflict(choice) {
    if (!conflictResolver) return;
    const resolve = conflictResolver;
    conflictResolver = null;
    if (conflictPanel) conflictPanel.hidden = true;
    if (loginForm) loginForm.hidden = false;
    resolve(choice);
  }

  function preserveConflictBackup(localState) {
    const key = `shoreline-kaoyan-conflict-${Date.now()}`;
    localStorage.setItem(key, JSON.stringify({ savedAt: new Date().toISOString(), reason: "同步冲突自动备份", data: localState }));
  }

  async function handleSignOut() {
    if (!client) return;
    signOutButton.disabled = true;
    await syncNow();
    const stillDirty = Boolean(user && (getUserMeta(user.id)?.dirty || pendingState));
    const { error } = await client.auth.signOut({ scope: "local" });
    signOutButton.disabled = false;
    if (error) {
      if (settingsStatus) settingsStatus.textContent = readableAuthError(error);
      setIndicator("退出失败", "error");
      return;
    }
    const settingsDialog = document.querySelector("#settingsDialog");
    if (settingsDialog?.open) settingsDialog.close();
    document.body.classList.remove("modal-open");
    deactivateSession(stillDirty
      ? "已退出。本机仍保留尚未上传的修改，下次登录会继续同步。"
      : "已从这台设备退出，最新修改已保存到云端。", false);
  }

  function handleActivationError(error) {
    if (session?.user && isNetworkError(error)) {
      user = session.user;
      active = true;
      localOnly = false;
      activeToken = session.access_token;
      remoteRevision = Number(getUserMeta(user.id)?.revision || 0);
      unlockGate();
      startRealtimeSubscription();
      startFallbackPolling();
      setIndicator("网络异常 · 使用本机", "offline");
      return;
    }
    deactivateSession(readableSyncError(error), true);
  }

  function readMetaStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(META_KEY));
      return parsed && typeof parsed === "object" ? parsed : { users: {} };
    } catch {
      return { users: {} };
    }
  }

  function getUserMeta(userId) {
    if (!userId) return null;
    return readMetaStore().users?.[userId] || null;
  }

  function setUserMeta(userId, patch) {
    if (!userId) return;
    const store = readMetaStore();
    store.users = store.users || {};
    store.users[userId] = { ...(store.users[userId] || {}), ...patch };
    localStorage.setItem(META_KEY, JSON.stringify(store));
  }

  function setRootMeta(patch) {
    const store = readMetaStore();
    Object.assign(store, patch);
    store.users = store.users || {};
    localStorage.setItem(META_KEY, JSON.stringify(store));
  }

  function startRealtimeSubscription() {
    if (!client || !active || !user) return;
    if (realtimeChannel && realtimeUserId === user.id) return;
    stopRealtimeSubscription();
    realtimeUserId = user.id;
    realtimeChannel = client
      .channel(`kaoyan-planner-${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: TABLE_NAME,
        filter: `user_id=eq.${user.id}`
      }, payload => {
        const incomingRevision = Number(payload?.new?.revision || 0);
        if (incomingRevision <= remoteRevision && !getUserMeta(user.id)?.dirty && !pendingState) return;
        scheduleReconcile();
      })
      .subscribe(status => {
        if (status === "SUBSCRIBED") {
          if (settingsStatus) settingsStatus.textContent = `云端版本 ${remoteRevision} · 实时同步已连接`;
          return;
        }
        if (["CHANNEL_ERROR", "TIMED_OUT"].includes(status)) {
          if (settingsStatus) settingsStatus.textContent = "实时连接正在重试；30 秒轮询仍在工作";
        }
      });
  }

  function stopRealtimeSubscription() {
    window.clearTimeout(reconcileTimer);
    reconcileTimer = null;
    realtimeUserId = "";
    if (client && realtimeChannel) client.removeChannel(realtimeChannel).catch(() => {});
    realtimeChannel = null;
  }

  function scheduleReconcile(delay = RECONCILE_DELAY) {
    window.clearTimeout(reconcileTimer);
    reconcileTimer = window.setTimeout(() => {
      if (!active || !navigator.onLine) return;
      if (syncing) {
        scheduleReconcile(400);
        return;
      }
      syncNow(false);
    }, delay);
  }

  function startFallbackPolling() {
    stopFallbackPolling();
    pollTimer = window.setInterval(() => {
      if (active && navigator.onLine && document.visibilityState !== "hidden") syncNow(false);
    }, FALLBACK_POLL_MS);
  }

  function stopFallbackPolling() {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }

  function setIndicator(text, mode = "cloud") {
    if (!saveIndicator) return;
    saveIndicator.classList.remove("saving", "cloud", "offline", "error");
    if (mode) saveIndicator.classList.add(mode);
    if (saveIndicator.lastChild) saveIndicator.lastChild.textContent = ` ${text}`;
  }

  function setPageLocked(locked) {
    document.querySelectorAll(".site-header, main, .site-footer").forEach(element => {
      element.toggleAttribute("inert", locked);
      if (locked) element.setAttribute("aria-hidden", "true");
      else element.removeAttribute("aria-hidden");
    });
  }

  function setGateMessage(message, isError = false) {
    if (!loginMessage) return;
    loginMessage.textContent = message;
    loginMessage.classList.toggle("error", isError);
  }

  function readableAuthError(error) {
    const message = String(error?.message || error || "");
    if (/invalid login credentials/i.test(message)) return "邮箱或密码不正确。若尚未建账号，请先在 Supabase 的 Authentication → Users 中添加用户。";
    if (/email not confirmed/i.test(message)) return "邮箱尚未确认，请先完成 Supabase 验证。";
    if (isNetworkError(error)) return "无法连接 Supabase，请检查网络后重试。";
    return `登录失败：${message || "未知错误"}`;
  }

  function readableSyncError(error) {
    const message = String(error?.message || error || "未知错误");
    if (isNetworkError(error)) return "网络暂不可用；修改已安全保存在本机。";
    if (/row-level security|permission denied|42501/i.test(message)) return "云端权限校验失败，请联系维护者检查 RLS。";
    return `云同步失败：${message}`;
  }

  function isNetworkError(error) {
    return !navigator.onLine || /failed to fetch|network|load failed|fetch/i.test(String(error?.message || error || ""));
  }
})();
