(() => {
  "use strict";

  const SUPABASE_URL = "https://wsxflndffdymmmekxxqu.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jth5vjSpBQzK0uiErGRucw_GId1_WEO";
  const TABLE_NAME = "kaoyan_planner_state";
  const META_KEY = "shoreline-kaoyan-cloud-meta-v1";
  const SAVE_DELAY = 900;

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
  let remoteRevision = 0;
  let saveTimer = null;
  let activeToken = "";
  let hydrationPromise = null;
  let hydratingToken = "";
  let conflictResolver = null;

  window.KaoyanCloud = Object.freeze({
    queueSave,
    syncNow: () => syncNow(true),
    isActive: () => active
  });

  init();

  async function init() {
    bindCloudEvents();

    if (!planner || !window.supabase?.createClient) {
      setGateMessage("云同步组件加载失败，请检查网络后刷新页面。", true);
      setIndicator("云组件不可用", "error");
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
      setGateMessage(readableAuthError(error), true);
      return;
    }
    if (data.session) {
      await activateSession(data.session).catch(handleActivationError);
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
      if (!active) return;
      const meta = getUserMeta(user?.id);
      if (meta?.dirty) {
        pendingState = planner.getState();
        flushPending();
      } else {
        pullIfNewer();
      }
    });

    window.addEventListener("offline", () => {
      if (active) setIndicator("离线 · 已存本机", "offline");
    });

    window.addEventListener("focus", () => {
      if (active && navigator.onLine) pullIfNewer();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && active && navigator.onLine) pullIfNewer();
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
      remoteRevision = Number(getUserMeta(user.id)?.revision || 0);
      unlockGate();
      setIndicator("离线 · 已存本机", "offline");
      return;
    }

    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) throw userError || new Error("无法校验登录账号");
    user = userData.user;

    const remote = await fetchRemoteRow();
    const local = planner.getState();
    const meta = getUserMeta(user.id);

    if (!remote) {
      const created = await insertRemoteState(local);
      acceptSyncedRow(created);
    } else if (meta?.dirty && Number(meta.revision || 0) !== Number(remote.revision)) {
      const choice = await askConflict();
      if (choice === "local") {
        const uploaded = await updateRemoteState(local, Number(remote.revision));
        acceptSyncedRow(uploaded);
      } else {
        preserveConflictBackup(local);
        applyRemoteRow(remote);
      }
    } else if (meta?.dirty) {
      const uploaded = await updateRemoteState(local, Number(remote.revision));
      acceptSyncedRow(uploaded);
    } else {
      applyRemoteRow(remote);
    }

    activeToken = nextSession.access_token;
    active = true;
    unlockGate();
    setIndicator("已云同步", "cloud");
  }

  function deactivateSession(message, isError = false) {
    active = false;
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
  }

  function queueSave(nextState) {
    if (suppressPush) return true;
    if (!active || !user) return false;

    pendingState = nextState;
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
    if (!active || !user || syncing || !pendingState) return;
    if (!navigator.onLine) {
      setIndicator("离线 · 已存本机", "offline");
      return;
    }

    window.clearTimeout(saveTimer);
    syncing = true;
    const snapshot = pendingState;
    setIndicator("同步中…", "saving");

    try {
      const uploaded = await updateRemoteState(snapshot, remoteRevision);
      if (!uploaded) {
        const remote = await fetchRemoteRow();
        if (!remote) throw new Error("云端版本不存在，请刷新后重试");
        const choice = await askConflict();
        if (choice === "local") {
          const retried = await updateRemoteState(snapshot, Number(remote.revision));
          if (!retried) throw new Error("另一设备仍在修改，请稍后重试");
          acceptSyncedRow(retried);
        } else {
          preserveConflictBackup(snapshot);
          applyRemoteRow(remote);
        }
      } else {
        acceptSyncedRow(uploaded);
      }
      pendingState = null;
      setIndicator("已云同步", "cloud");
    } catch (error) {
      pendingState = snapshot;
      setUserMeta(user.id, { dirty: true, revision: remoteRevision });
      setIndicator(isNetworkError(error) ? "网络异常 · 已存本机" : "同步失败 · 已存本机", "error");
      if (settingsStatus) settingsStatus.textContent = readableSyncError(error);
    } finally {
      syncing = false;
    }
  }

  async function syncNow(showFeedback = false) {
    if (!active || !user) return;
    const meta = getUserMeta(user.id);
    if (meta?.dirty) {
      pendingState = planner.getState();
      await flushPending();
    } else {
      await pullIfNewer();
    }
    if (showFeedback && settingsStatus && active) {
      settingsStatus.textContent = navigator.onLine ? "刚刚完成双向校验" : "当前离线，已保存在本机";
    }
  }

  async function pullIfNewer() {
    if (!active || !user || syncing || !navigator.onLine) return;
    syncing = true;
    try {
      const remote = await fetchRemoteRow();
      if (!remote || Number(remote.revision) <= remoteRevision) return;

      const meta = getUserMeta(user.id);
      if (meta?.dirty || pendingState) {
        const local = pendingState || planner.getState();
        const choice = await askConflict();
        if (choice === "local") {
          const uploaded = await updateRemoteState(local, Number(remote.revision));
          if (!uploaded) throw new Error("云端版本再次变化，请稍后重试");
          acceptSyncedRow(uploaded);
          pendingState = null;
        } else {
          preserveConflictBackup(local);
          pendingState = null;
          applyRemoteRow(remote);
        }
      } else {
        applyRemoteRow(remote);
      }
      setIndicator("已载入最新云端", "cloud");
    } catch (error) {
      setIndicator("云端校验失败", "error");
      if (settingsStatus) settingsStatus.textContent = readableSyncError(error);
    } finally {
      syncing = false;
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
    acceptSyncedRow(row);
  }

  function acceptSyncedRow(row) {
    remoteRevision = Number(row.revision);
    setUserMeta(user.id, {
      dirty: false,
      revision: remoteRevision,
      lastSyncedAt: row.updated_at || new Date().toISOString()
    });
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
    localStorage.setItem(key, JSON.stringify({ savedAt: new Date().toISOString(), data: localState }));
  }

  async function handleSignOut() {
    if (!client) return;
    signOutButton.disabled = true;
    await syncNow();
    await client.auth.signOut({ scope: "local" });
    signOutButton.disabled = false;
    const settingsDialog = document.querySelector("#settingsDialog");
    if (settingsDialog?.open) settingsDialog.close();
    document.body.classList.remove("modal-open");
    deactivateSession("已从这台设备退出。云端数据仍安全保留。", false);
  }

  function handleActivationError(error) {
    if (session?.user && isNetworkError(error)) {
      user = session.user;
      active = true;
      activeToken = session.access_token;
      remoteRevision = Number(getUserMeta(user.id)?.revision || 0);
      unlockGate();
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
