(() => {
  "use strict";

  const PLAN_DATA = window.KaoyanPlanData;
  if (!PLAN_DATA) throw new Error("逐日计划数据未加载");

  const STORAGE_KEY = "shoreline-kaoyan-27-v2";
  const LEGACY_STORAGE_KEY = "shoreline-kaoyan-27-v1";
  const SCHEMA_VERSION = 4;
  const PLAN_CONTENT_VERSION = PLAN_DATA.CONTENT_VERSION;
  const PLAN_START = PLAN_DATA.PLAN_START;
  const DEFAULT_PLAN_END = PLAN_DATA.DETAILED_PLAN_END;
  const MAX_PLAN_END = PLAN_DATA.MAX_PLAN_END;
  const FOCUS_SECONDS = 50 * 60;
  const VALID_SUBJECTS = new Set(["math", "english", "cs", "sport", "review", "admin"]);
  const VALID_INTENSITIES = new Set(["light", "standard", "sprint"]);
  const CONFLICT_BACKUP_PREFIX = "shoreline-kaoyan-conflict-";

  const subjectMeta = {
    math: { label: "数学一", code: "MATH Ⅰ", color: "#b43d2b" },
    english: { label: "英语一", code: "ENGLISH Ⅰ", color: "#b98217" },
    cs: { label: "408", code: "CS 408", color: "#4d839b" },
    sport: { label: "运动", code: "MOVE", color: "#56796e" },
    review: { label: "复盘", code: "REVIEW", color: "#687680" },
    admin: { label: "报名事项", code: "APPLICATION", color: "#7e5948" }
  };

  const intensityNames = {
    light: "轻量日",
    standard: "标准日",
    sprint: "冲刺日"
  };

  const phaseData = [
    {
      name: "补齐基础",
      date: "07.18 — 08.31",
      headline: "先让所有科目入场，再谈速度",
      description: "45 天内完成高数剩余内容、线代首轮与概率主体，并让 408 的计组、操作系统和计网接续推进。每天留可验证的产出，不用“听完了”代替“会做了”。",
      subjects: [
        {
          type: "math", index: "M", title: "数学一 · 三线会师",
          items: [
            "07.18–07.26：高数第十一、十二章剩余内容收口并完成闭卷测验",
            "07.27–08.12：线代首轮，按行列式、矩阵、方程组、特征值推进",
            "08.13–08.31：概率首轮推进到参数估计，并开始三模块混合检测",
            "完成标准：基础题正确率 ≥ 80%，章节框架能闭卷说出"
          ]
        },
        {
          type: "english", index: "E", title: "英语一 · 从词到篇",
          items: [
            "词汇每天明确新词、到期词和抽测正确率，不用浏览次数代替掌握",
            "7 月用 2005—2006 真题交替训练长难句、阅读、翻译与新题型",
            "8 月按年份推进 2007—2011 真题：限时、定位、选项归因四步闭环",
            "每篇只沉淀 5–8 个高频词和一个主要错因"
          ]
        },
        {
          type: "cs", index: "4", title: "408 · 四科接力",
          items: [
            "07.18–08.05：计组首轮收尾，第 4 章起同步做选择与计算题",
            "08.06–08.20：操作系统首轮，重点画进程、内存与 I/O 流程",
            "08.21–08.31：计网启动；数据结构每周手写 2 道算法题",
            "每章结束用一张空白纸闭卷画框架，暴露真正的断点"
          ]
        }
      ]
    },
    {
      name: "强化成网",
      date: "09.01 — 10.15",
      headline: "题目负责暴露断点，报名准备同步启动",
      description: "用专题题组把章节连起来，不再从头抄笔记。9 月中下旬开始逐项核对院校招生简章、专业目录、报考条件和报考点，为 10 月报名留出纠错时间。",
      subjects: [
        {
          type: "math", index: "M", title: "数学一 · 专题强化",
          items: [
            "高数、线代、概率轮换专题，每题标注知识点与错误类型",
            "概念错误、方法未识别、计算失误分开处理",
            "每周一次模块混合训练，开始建立时间边界",
            "错题至少隔天回做一次，正确后再进入归档"
          ]
        },
        {
          type: "english", index: "E", title: "英语一 · 真题精读",
          items: [
            "每周 4–6 篇阅读：先限时，再精读与选项归因",
            "每周加入 1–2 次翻译或新题型训练",
            "积累的是定位方式与陷阱类型，不是整篇中文翻译",
            "10 月上旬开始整理作文素材与个人表达库"
          ]
        },
        {
          type: "cs", index: "4", title: "408 · 二轮强化",
          items: [
            "9 月上旬完成计网首轮，随后四科按专题二刷",
            "计组计算、OS PV/地址转换、计网协议流程集中突破",
            "选择题每日保持手感，综合题每周至少 4 道",
            "数据结构算法题必须手写并能说明复杂度"
          ]
        }
      ]
    },
    {
      name: "真题与报名",
      date: "10.16 — 11.15",
      headline: "把知识变成分数，也把报名真正落地",
      description: "这 31 天开始成套或模块限时真题，同时完成正式报名、缴费、报名号留存与网上确认。2027 日期未官宣，日历中的报名窗口均标为预计提醒。",
      subjects: [
        {
          type: "math", index: "M", title: "数学一 · 真题检验",
          items: [
            "先用 2010—2017 真题从模块过渡到整卷，每周约 2 套，保留更新年份",
            "次日订正并回做同类题，避免只看解析",
            "固定选择填空与大题时间边界，训练果断跳题",
            "11 月 15 日前形成可快速翻阅的错题压缩版"
          ]
        },
        {
          type: "english", index: "E", title: "英语一 · 套卷与写作",
          items: [
            "阅读继续坚持证据定位，逐步加入整套时间分配",
            "大小作文形成自己的结构与常用表达，每周各写 1 篇",
            "翻译与新题型维持每周训练，不让小题型断档",
            "保留较新的真题，不在本轮一次用完"
          ]
        },
        {
          type: "cs", index: "4", title: "408 · 真题闭环",
          items: [
            "先用 2010—2017 真题成套训练并记录四科失分结构",
            "综合题写完整步骤，尤其是算法、地址计算与 PV 题",
            "薄弱点回到专题补 10–20 题，不整章重学",
            "报名日适当降学习量，先确保信息、缴费与材料无误"
          ]
        }
      ]
    }
  ];

  const progressGroups = [
    {
      key: "math",
      title: "数学一",
      items: [
        { key: "gaoshu", label: "高等数学", weight: 0.6 },
        { key: "xiandai", label: "线性代数", weight: 0.2 },
        { key: "gailv", label: "概率论", weight: 0.2 }
      ]
    },
    {
      key: "english",
      title: "英语一",
      items: [
        { key: "vocab", label: "词汇首轮", weight: 0.35 },
        { key: "reading", label: "阅读 / 长难句", weight: 0.45 },
        { key: "writing", label: "翻译 / 写作", weight: 0.2 }
      ]
    },
    {
      key: "cs",
      title: "408",
      items: [
        { key: "ds", label: "数据结构", weight: 0.3 },
        { key: "co", label: "计算机组成", weight: 0.3 },
        { key: "os", label: "操作系统", weight: 0.233 },
        { key: "network", label: "计算机网络", weight: 0.167 }
      ]
    }
  ];

  const weekBlocks = [
    { key: "morning", label: "上午", time: "07:00–11:59" },
    { key: "afternoon", label: "下午 A", time: "12:00–15:19" },
    { key: "english", label: "下午 B", time: "15:20–16:59" },
    { key: "sport", label: "运动", time: "17:00–19:00" },
    { key: "evening", label: "晚间", time: "19:00 以后" }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  const registrationEvents = PLAN_DATA.registrationEvents;

  const defaultState = {
    schemaVersion: SCHEMA_VERSION,
    planContentVersion: PLAN_CONTENT_VERSION,
    planEndDate: DEFAULT_PLAN_END,
    intensity: "standard",
    progress: {
      gaoshu: 92,
      xiandai: 0,
      gailv: 0,
      vocab: 35,
      reading: 0,
      writing: 0,
      ds: 65,
      co: 45,
      os: 0,
      network: 0
    },
    tasks: [],
    generatedDates: [],
    planIntensityByDate: {},
    studyLog: {},
    reviews: {}
  };

  let state = loadState();
  let selectedDateISO = clampPlanDate(todayISO);
  let weekViewStartISO = startOfWeekISO(selectedDateISO);
  let selectedReviewWeekStartISO = startOfWeekISO(todayISO);
  let expandedTaskId = null;
  let editingTaskId = null;
  let draggedTaskId = null;
  let focusSeconds = FOCUS_SECONDS;
  let focusRunning = false;
  let focusInterval = null;
  let focusEndsAt = 0;
  let toastTimer = null;

  init();

  function init() {
    ensureFullPlan();
    renderDates();
    renderCountdown();
    renderAgenda();
    renderCalendar();
    renderPhase(phaseIndexForDate(today));
    renderProgressControls();
    renderWeekTable();
    renderReview();
    updateAllStats();
    bindEvents();
    setupSectionObserver();
    updatePageProgress();
    window.requestAnimationFrame(() => scrollToCalendarDate(selectedDateISO, "auto"));
  }

  function loadState() {
    try {
      const currentRaw = localStorage.getItem(STORAGE_KEY);
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      const saved = JSON.parse(currentRaw || legacyRaw);
      if (!saved || typeof saved !== "object") return structuredClone(defaultState);
      const migratingLegacy = !currentRaw && Boolean(legacyRaw);
      if (Number(saved.planContentVersion || 0) < PLAN_CONTENT_VERSION) {
        preserveStateDataBackup(saved, "逐日计划升级前自动备份");
      }
      return normalizeState(saved, migratingLegacy);
    } catch {
      return structuredClone(defaultState);
    }
  }

  function normalizeState(saved, migratingLegacy = false) {
    const source = isPlainObject(saved) ? saved : {};
    const planEndDate = isValidISODate(source.planEndDate)
      && source.planEndDate >= PLAN_START
      && source.planEndDate <= MAX_PLAN_END
      ? source.planEndDate
      : DEFAULT_PLAN_END;
    const progress = Object.fromEntries(Object.keys(defaultState.progress).map(key => [
      key,
      clampNumber(source.progress?.[key], 0, 100, defaultState.progress[key])
    ]));
    const seenTaskIds = new Set();
    let tasks = (Array.isArray(source.tasks) ? source.tasks : [])
      .slice(0, 5000)
      .map(normalizeTask)
      .filter(Boolean)
      .filter(task => {
        if (migratingLegacy && task.generated) return false;
        if (seenTaskIds.has(task.id)) task.id = uid();
        seenTaskIds.add(task.id);
        return true;
      });
    let generatedDates = migratingLegacy ? [] : [...new Set(
      (Array.isArray(source.generatedDates) ? source.generatedDates : [])
        .filter(dateValue => isValidISODate(dateValue) && dateValue >= PLAN_START && dateValue <= MAX_PLAN_END)
    )];
    const requiresPlanRefresh = Number(source.planContentVersion || 0) < PLAN_CONTENT_VERSION;
    if (requiresPlanRefresh) {
      tasks = tasks.filter(task => !task.generated || task.customized);
      generatedDates = [];
    }
    const planIntensityByDate = {};
    if (!migratingLegacy && isPlainObject(source.planIntensityByDate)) {
      Object.entries(source.planIntensityByDate).forEach(([dateValue, intensity]) => {
        if (isValidISODate(dateValue) && VALID_INTENSITIES.has(intensity)) planIntensityByDate[dateValue] = intensity;
      });
    }
    const studyLog = {};
    if (isPlainObject(source.studyLog)) {
      Object.entries(source.studyLog).forEach(([dateValue, hours]) => {
        if (isValidISODate(dateValue)) studyLog[dateValue] = clampNumber(hours, 0, 16, 0, 1);
      });
    }
    const reviews = {};
    if (isPlainObject(source.reviews)) {
      Object.entries(source.reviews).forEach(([weekStart, review]) => {
        if (isValidISODate(weekStart)) reviews[startOfWeekISO(weekStart)] = normalizeReview(review);
      });
    }
    if (isPlainObject(source.review)) {
      reviews[startOfWeekISO(todayISO)] = normalizeReview(source.review);
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      planContentVersion: PLAN_CONTENT_VERSION,
      planEndDate: migratingLegacy ? DEFAULT_PLAN_END : planEndDate,
      intensity: VALID_INTENSITIES.has(source.intensity) ? source.intensity : defaultState.intensity,
      progress,
      tasks,
      generatedDates,
      planIntensityByDate,
      studyLog,
      reviews
    };
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function clampNumber(value, minimum, maximum, fallback, decimals = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    const clamped = Math.max(minimum, Math.min(maximum, number));
    return Number(clamped.toFixed(decimals));
  }

  function safeText(value, maximum = 500) {
    return typeof value === "string" ? value.trim().slice(0, maximum) : "";
  }

  function isValidISODate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = parseLocalDate(value);
    return !Number.isNaN(parsed.getTime()) && toISODate(parsed) === value;
  }

  function isValidTime(value) {
    if (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return false;
    return true;
  }

  function normalizeTask(rawTask) {
    if (!isPlainObject(rawTask)) return null;
    const date = isValidISODate(rawTask.date) ? rawTask.date : "";
    const start = isValidTime(rawTask.start) ? rawTask.start : "";
    const end = isValidTime(rawTask.end) ? rawTask.end : "";
    const title = safeText(rawTask.title, 160);
    if (!date || date < PLAN_START || date > MAX_PLAN_END || !start || !end || timeToMinutes(end) <= timeToMinutes(start) || !title) return null;
    const subject = VALID_SUBJECTS.has(rawTask.subject) ? rawTask.subject : "review";
    const steps = (Array.isArray(rawTask.steps) ? rawTask.steps : [])
      .map(step => safeText(step, 240))
      .filter(Boolean)
      .slice(0, 12);
    const stepDone = (Array.isArray(rawTask.stepDone) ? rawTask.stepDone : [])
      .slice(0, steps.length || 12)
      .map(Boolean);
    const generated = Boolean(rawTask.generated);
    const contentVersion = clampNumber(rawTask.contentVersion, 0, PLAN_CONTENT_VERSION, 0);
    const customized = !generated
      || Boolean(rawTask.customized)
      || Boolean(rawTask.done)
      || Boolean(safeText(rawTask.note, 2000))
      || stepDone.some(Boolean)
      || (contentVersion === 0 && Boolean(
        safeText(rawTask.objective, 800)
        || safeText(rawTask.doneWhen, 800)
        || steps.length
      ));
    return {
      id: safeText(rawTask.id, 120) || uid(),
      templateKey: safeText(rawTask.templateKey, 180),
      contentVersion,
      date,
      start,
      end,
      subject,
      title,
      done: Boolean(rawTask.done),
      fixed: subject === "sport" && Boolean(rawTask.fixed),
      generated,
      customized,
      registration: subject === "admin" && Boolean(rawTask.registration),
      objective: safeText(rawTask.objective, 800),
      doneWhen: safeText(rawTask.doneWhen, 800),
      steps,
      stepDone,
      note: safeText(rawTask.note, 2000)
    };
  }

  function normalizeReview(rawReview) {
    const review = isPlainObject(rawReview) ? rawReview : {};
    return {
      mood: ["tight", "steady", "great"].includes(review.mood) ? review.mood : "steady",
      wins: safeText(review.wins, 3000),
      fix: safeText(review.fix, 3000)
    };
  }

  function saveState() {
    const saveIndicator = $("#saveState");
    saveIndicator?.classList.add("saving");
    if (saveIndicator) saveIndicator.lastChild.textContent = " 保存中…";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const cloudWillHandle = Boolean(window.KaoyanCloud?.queueSave?.(structuredClone(state)));
    window.setTimeout(() => {
      if (cloudWillHandle || document.body.classList.contains("cloud-locked")) return;
      saveIndicator?.classList.remove("saving");
      if (saveIndicator) saveIndicator.lastChild.textContent = " 已存于本机";
    }, 380);
  }

  function replaceStateFromCloud(nextState) {
    if (!nextState || typeof nextState !== "object" || Array.isArray(nextState)) {
      throw new TypeError("云端计划数据格式无效");
    }
    if (Number(nextState.planContentVersion || 0) < PLAN_CONTENT_VERSION) {
      preserveStateDataBackup(nextState, "云端逐日计划升级前自动备份");
    }
    state = normalizeState(nextState);
    selectedDateISO = clampPlanDate(selectedDateISO);
    weekViewStartISO = startOfWeekISO(selectedDateISO);
    if (selectedReviewWeekStartISO > startOfWeekISO(state.planEndDate)) selectedReviewWeekStartISO = startOfWeekISO(state.planEndDate);
    expandedTaskId = null;
    editingTaskId = null;
    ensureFullPlan();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderDates();
    renderCountdown();
    renderAgenda();
    renderCalendar();
    renderPhase(phaseIndexForDate(today));
    renderProgressControls();
    renderWeekTable();
    renderReview();
    updateAllStats();
    updatePageProgress();
    window.requestAnimationFrame(() => scrollToCalendarDate(selectedDateISO, "auto"));
  }

  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseLocalDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function addDaysISO(value, amount) {
    const date = parseLocalDate(value);
    date.setDate(date.getDate() + amount);
    return toISODate(date);
  }

  function startOfWeekISO(value) {
    const date = parseLocalDate(value);
    const mondayOffset = date.getDay() === 0 ? -6 : 1 - date.getDay();
    date.setDate(date.getDate() + mondayOffset);
    return toISODate(date);
  }

  function clampPlanDate(value) {
    if (value < PLAN_START) return PLAN_START;
    if (value > (state?.planEndDate || DEFAULT_PLAN_END)) return state?.planEndDate || DEFAULT_PLAN_END;
    return value;
  }

  function eachPlanDate() {
    const dates = [];
    const cursor = parseLocalDate(PLAN_START);
    const safeEnd = isValidISODate(state.planEndDate) && state.planEndDate <= MAX_PLAN_END
      ? state.planEndDate
      : DEFAULT_PLAN_END;
    const end = parseLocalDate(safeEnd);
    while (cursor <= end) {
      dates.push(toISODate(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function timeToMinutes(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function taskDuration(task) {
    return Math.max(0, timeToMinutes(task.end) - timeToMinutes(task.start));
  }

  function learningProgress(tasks) {
    const learningTasks = tasks.filter(task => ["math", "english", "cs"].includes(task.subject));
    const totalMinutes = learningTasks.reduce((sum, task) => sum + taskDuration(task), 0);
    const doneTasks = learningTasks.filter(task => task.done);
    const doneMinutes = doneTasks.reduce((sum, task) => sum + taskDuration(task), 0);
    return {
      totalCount: learningTasks.length,
      doneCount: doneTasks.length,
      totalMinutes,
      doneMinutes,
      percent: totalMinutes ? Math.round((doneMinutes / totalMinutes) * 100) : 0
    };
  }

  function formatMinuteAmount(value) {
    const minutes = Math.max(0, Math.ceil(value));
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours ? `${hours} 小时` : ""}${hours && remainder ? " " : ""}${remainder ? `${remainder} 分钟` : ""}` || "0 分钟";
  }

  function overlaps(startA, endA, startB, endB) {
    return Math.max(timeToMinutes(startA), timeToMinutes(startB)) < Math.min(timeToMinutes(endA), timeToMinutes(endB));
  }

  function dailyTemplate(intensity = state.intensity, dateValue = todayISO) {
    const effectiveIntensity = parseLocalDate(dateValue).getDay() === 0 ? "light" : intensity;
    return PLAN_DATA.buildDay(dateValue, effectiveIntensity).map(template => ({
      ...template,
      id: uid(),
      done: false,
      fixed: Boolean(template.fixed),
      generated: true,
      customized: false,
      stepDone: [],
      note: ""
    }));
  }

  function ensureFullPlan() {
    let changed = false;
    eachPlanDate().forEach(dateValue => {
      if (state.generatedDates.includes(dateValue)) return;
      const date = parseLocalDate(dateValue);
      const dayIntensity = date.getDay() === 0
        ? "light"
        : state.planIntensityByDate[dateValue] || state.intensity;
      const existing = state.tasks.filter(task => task.date === dateValue);
      dailyTemplate(dayIntensity, dateValue).forEach(candidate => {
        const collision = existing.some(task => task.templateKey && task.templateKey === candidate.templateKey)
          || existing.some(task => task.start === candidate.start && task.subject === candidate.subject);
        if (!collision) {
          state.tasks.push(candidate);
          existing.push(candidate);
        }
      });
      state.generatedDates.push(dateValue);
      state.planIntensityByDate[dateValue] = dayIntensity;
      changed = true;
    });
    state.generatedDates = [...new Set(state.generatedDates)];
    if (changed) saveState();
  }

  function generateSelectedDate() {
    const additions = dailyTemplate(state.intensity, selectedDateISO);
    const existing = state.tasks.filter(task => task.date === selectedDateISO);
    additions.forEach(candidate => {
      if (candidate.fixed && existing.some(task => task.fixed && task.subject === "sport")) return;
      if (!existing.some(task => task.start === candidate.start && task.subject === candidate.subject)) state.tasks.push(candidate);
    });
    if (!state.generatedDates.includes(selectedDateISO)) state.generatedDates.push(selectedDateISO);
    state.planIntensityByDate[selectedDateISO] = state.intensity;
    saveState();
    renderAgenda();
    renderCalendar(true);
    renderWeekTable();
    updateAllStats();
  }

  function renderDates() {
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const shortDate = new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(today);
    $("#headerDate").textContent = `${shortDate} · ${weekdays[today.getDay()]}`;
    const selected = parseLocalDate(selectedDateISO);
    $("#todayFullDate").textContent = `${selected.getFullYear()} 年 ${selected.getMonth() + 1} 月 ${selected.getDate()} 日 · ${weekdays[selected.getDay()]}`;
    $("#today-title").textContent = selectedDateISO === todayISO ? "今日执行面" : `${selected.getMonth() + 1} 月 ${selected.getDate()} 日执行面`;
    $("#taskDate").value = selectedDateISO;
    $("#previousPlanDate").disabled = selectedDateISO <= PLAN_START;
    $("#nextPlanDate").disabled = selectedDateISO >= state.planEndDate;
  }

  function renderCountdown() {
    const planEnd = parseLocalDate(state.planEndDate);
    const days = Math.max(0, Math.ceil((planEnd - today) / 86400000));
    $("#daysLeft").textContent = days;
    $("#planEndDateText").textContent = state.planEndDate.replaceAll("-", ".");

    const phaseIndex = phaseIndexForDate(today);
    $("#currentPhaseText").textContent = `${phaseData[phaseIndex].name}期`;

    const startDate = parseLocalDate(PLAN_START);
    const totalDays = Math.max(1, (planEnd - startDate) / 86400000);
    const elapsedDays = Math.max(0, Math.min(totalDays, (today - startDate) / 86400000));
    const routePercent = (elapsedDays / totalDays) * 100;
    $(".route-done").style.width = `${routePercent}%`;
    $("#routeMarker").style.left = `calc(${routePercent}% - 5px)`;
    const currentWeek = Math.max(1, Math.min(Math.ceil(totalDays / 7), Math.floor(elapsedDays / 7) + 1));
    $("#weekLabel").textContent = `第 ${currentWeek} 周 / 共 ${Math.ceil(totalDays / 7)} 周`;

    const monthDay = (today.getMonth() + 1) * 100 + today.getDate();
    const anchor = monthDay < 901
      ? ["08.31", "三科基础完成会师"]
      : monthDay < 1010
        ? ["10.10", "预计预报名窗口"]
        : monthDay < 1016
          ? ["10.16", "预计正式报名开启"]
          : monthDay < 1101
            ? ["11月上旬", "网上确认以报考点为准"]
            : ["11.15", "本轮详细计划收官"];
    $("#nextAnchorDate").textContent = anchor[0];
    $("#nextAnchorText").textContent = anchor[1];
  }

  function phaseIndexForDate(date) {
    const monthDay = (date.getMonth() + 1) * 100 + date.getDate();
    if (monthDay <= 831) return 0;
    if (monthDay <= 1015) return 1;
    return 2;
  }

  function taskGuidance(task) {
    const guidance = {
      math: {
        objective: "把知识点转成能独立识别、落笔并检查的题型入口。",
        doneWhen: "核心题不看答案完成；错题写明错因，并安排隔日回做。",
        steps: ["5 分钟闭卷回忆框架", "限时独立完成例题或题组", "按概念 / 方法 / 计算标错因", "选 1–2 题隔日回做"]
      },
      english: {
        objective: "从句子结构与原文证据出发，不用模糊中文语感做题。",
        doneWhen: "每个答案能指出定位句；错误选项能说清陷阱类型。",
        steps: ["先限时完成，不边做边查词", "回原文标出定位句", "拆解关键长难句主干", "记录 5–8 个词与一个错因"]
      },
      cs: {
        objective: "形成可调用的知识框架，并把概念落实到选择或综合题步骤。",
        doneWhen: "能闭卷复述本节结构，题目错因能定位到具体知识节点。",
        steps: ["闭卷画出本节框架", "学习新内容并补全框架", "完成对应选择 / 综合题", "口头复述并标出薄弱点"]
      },
      sport: {
        objective: "恢复精力、保护长期学习状态，不追求每天极限强度。",
        doneWhen: "完成热身、主体运动与拉伸，19:00 后身体状态稳定。",
        steps: ["10 分钟热身", "完成当日主体运动", "补水与放松拉伸", "洗漱并正常进餐"]
      },
      review: {
        objective: "把今天的偏差压缩成明天可以直接执行的一步。",
        doneWhen: "写清完成量、一个主要问题和明天打开书后的第一动作。",
        steps: ["记录有效学习时长", "标出今日最大断点", "写下明日第一任务"]
      },
      admin: {
        objective: "让报名流程留痕、可复核，不因信息或材料问题影响考试资格。",
        doneWhen: "信息核验完成，关键页面截图，报名号与材料保存在两个位置。",
        steps: ["只从研招网与目标院校官网进入", "逐项核对个人与报考信息", "完成缴费或材料上传", "截图并双重保存报名号 / 结果"]
      }
    };
    const fallback = guidance[task.subject] || guidance.review;
    return {
      objective: safeText(task.objective, 800) || fallback.objective,
      doneWhen: safeText(task.doneWhen, 800) || fallback.doneWhen,
      steps: Array.isArray(task.steps) && task.steps.length
        ? task.steps.map(step => safeText(step, 240)).filter(Boolean)
        : fallback.steps
    };
  }

  function renderAgenda() {
    const agenda = $("#dailyAgenda");
    const tasks = state.tasks
      .filter(task => task.date === selectedDateISO)
      .sort((a, b) => a.start.localeCompare(b.start));
    $("#emptyAgenda").hidden = tasks.length > 0;
    agenda.hidden = tasks.length === 0;

    agenda.innerHTML = tasks.map(task => {
      const meta = subjectMeta[task.subject] || subjectMeta.review;
      const guidance = taskGuidance(task);
      const isExpanded = expandedTaskId === task.id;
      const stepDone = Array.isArray(task.stepDone) ? task.stepDone : [];
      const minutes = taskDuration(task);
      const duration = minutes >= 60 && minutes % 60 === 0
        ? `${minutes / 60}h`
        : minutes >= 60
          ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
          : `${minutes}m`;
      return `
        <article class="agenda-item ${task.done ? "done" : ""} ${task.fixed ? "sport-task" : ""} ${task.subject === "admin" ? "admin-task" : ""} ${isExpanded ? "expanded" : ""}" data-task-id="${escapeHTML(task.id)}" style="--task-color:${meta.color}">
          <div class="agenda-time">${escapeHTML(task.start)}<small>${escapeHTML(task.end)}</small></div>
          <button class="task-toggle" type="button" data-action="toggle" aria-label="${task.done ? "标记未完成" : "标记完成"}" aria-pressed="${task.done}"></button>
          <div class="task-body" data-action="expand" role="button" tabindex="0" aria-expanded="${isExpanded}">
            <span class="task-tag">${meta.code}${task.fixed ? '<b class="fixed-lock">◆ 固定</b>' : ""}</span>
            <h3 class="task-title">${escapeHTML(task.title)}</h3>
          </div>
          <div class="task-tail">
            <span class="task-duration">${duration}</span>
            ${task.fixed ? "" : '<button class="delete-task" type="button" data-action="delete" aria-label="删除任务">×</button>'}
            <button class="expand-task" type="button" data-action="expand" aria-label="${isExpanded ? "收起详情" : "展开详情"}" aria-expanded="${isExpanded}">⌄</button>
          </div>
          <div class="task-details" ${isExpanded ? "" : "hidden"}>
            <div class="detail-grid">
              <div><span>这一块要解决什么</span><p>${escapeHTML(guidance.objective)}</p></div>
              <div><span>怎样才算完成</span><p>${escapeHTML(guidance.doneWhen)}</p></div>
            </div>
            <div class="task-step-list">
              <span>执行步骤</span>
              ${guidance.steps.map((step, index) => `
                <label><input type="checkbox" data-task-step="${index}" ${stepDone[index] ? "checked" : ""} /><i></i><em>${escapeHTML(step)}</em></label>
              `).join("")}
            </div>
            <label class="task-note-field">
              <span>这块的随手记录</span>
              <textarea rows="2" data-task-note placeholder="写下卡点、正确率或下次从哪里继续……">${escapeHTML(task.note || "")}</textarea>
            </label>
            <div class="detail-actions">
              <button type="button" data-action="edit">编辑任务内容</button>
              ${task.fixed ? "" : '<button type="button" class="detail-delete" data-action="delete">删除任务</button>'}
              <small>修改会保存到本机，并在联网时同步到其他设备</small>
            </div>
          </div>
        </article>
      `;
    }).join("");

    updateFocusTask();
  }

  function isRegistrationWindow(dateValue) {
    return (dateValue >= "2026-10-10" && dateValue <= "2026-10-27") || (dateValue >= "2026-11-01" && dateValue <= "2026-11-05");
  }

  function renderCalendar(preserveScroll = false) {
    const viewport = $("#calendarViewport");
    const previousScroll = preserveScroll && viewport ? viewport.scrollLeft : 0;
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    $("#calendarTrack").innerHTML = eachPlanDate().map(dateValue => {
      const date = parseLocalDate(dateValue);
      const tasks = state.tasks.filter(task => task.date === dateValue).sort((a, b) => a.start.localeCompare(b.start));
      const studyMinutes = tasks.filter(task => !["sport", "admin"].includes(task.subject)).reduce((sum, task) => sum + taskDuration(task), 0);
      const progress = learningProgress(tasks);
      const registrationDay = tasks.some(task => task.subject === "admin");
      return `
        <article class="calendar-day ${dateValue === todayISO ? "is-today" : ""} ${dateValue === selectedDateISO ? "is-selected" : ""} ${isRegistrationWindow(dateValue) ? "registration-window" : ""}" data-calendar-date="${dateValue}">
          <button class="calendar-day-select" data-action="select-date" type="button" aria-label="查看 ${dateValue} 计划">
            <span class="calendar-date-stack"><span>${String(date.getMonth() + 1).padStart(2, "0")} /</span><strong>${String(date.getDate()).padStart(2, "0")}</strong></span>
            <span class="calendar-day-meta">${weekdays[date.getDay()]}<small>${Number((studyMinutes / 60).toFixed(1))}h · ${tasks.length} 项</small></span>
          </button>
          ${registrationDay ? '<div class="calendar-milestone">报名提醒 · 待官宣</div>' : ""}
          <div class="calendar-day-tasks">
            ${tasks.map(task => {
              const meta = subjectMeta[task.subject] || subjectMeta.review;
              return `
                <button class="calendar-task ${task.done ? "done" : ""} ${task.fixed ? "fixed" : ""}" type="button" draggable="${task.fixed ? "false" : "true"}" data-calendar-task-id="${escapeHTML(task.id)}" style="--calendar-task-color:${meta.color}" title="${escapeHTML(task.title)}">
                  <span>${task.start} · ${meta.label}</span><strong>${escapeHTML(task.title)}</strong>${task.fixed ? "<i>LOCK</i>" : ""}
                </button>
              `;
            }).join("")}
          </div>
          <footer><span>${progress.doneCount}/${progress.totalCount}</span><i><b style="width:${progress.percent}%"></b></i><em>${progress.percent}%</em></footer>
        </article>
      `;
    }).join("");
    if (preserveScroll && viewport) viewport.scrollLeft = previousScroll;
  }

  function scrollToCalendarDate(dateValue, behavior = "smooth") {
    const viewport = $("#calendarViewport");
    const column = $(`[data-calendar-date="${dateValue}"]`, viewport);
    if (!viewport || !column) return;
    viewport.scrollTo({ left: Math.max(0, column.offsetLeft - 24), behavior });
  }

  function selectPlanDate(dateValue, moveToAgenda = false) {
    selectedDateISO = clampPlanDate(dateValue);
    weekViewStartISO = startOfWeekISO(selectedDateISO);
    expandedTaskId = null;
    renderDates();
    renderAgenda();
    renderCalendar(true);
    renderWeekTable();
    updateAllStats();
    scrollToCalendarDate(selectedDateISO);
    if (moveToAgenda) $("#today").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderPhase(index) {
    const phase = phaseData[index];
    $$(".phase-tab").forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    $("#phaseContent").innerHTML = `
      <div class="phase-overview">
        <div><span>PHASE ${String(index + 1).padStart(2, "0")} / ${phase.date}</span><h3>${phase.headline}</h3></div>
        <p>${phase.description}</p>
      </div>
      <div class="phase-subjects">
        ${phase.subjects.map(subject => `
          <article class="phase-subject ${subject.type}">
            <span>${subject.index}</span>
            <h4>${subject.title}</h4>
            <ul>${subject.items.map(item => `<li>${item}</li>`).join("")}</ul>
          </article>
        `).join("")}
      </div>
    `;

    if ($("#phaseContent").animate) {
      $("#phaseContent").animate(
        [{ opacity: 0.35, transform: "translateX(12px)" }, { opacity: 1, transform: "translateX(0)" }],
        { duration: 280, easing: "ease-out" }
      );
    }
  }

  function groupProgress(group) {
    return Math.round(group.items.reduce((sum, item) => sum + state.progress[item.key] * item.weight, 0));
  }

  function renderProgressControls() {
    $("#subjectProgress").innerHTML = progressGroups.map(group => `
      <article class="subject-column" data-progress-group="${group.key}">
        <header><h4>${group.title}</h4><strong data-group-total>${groupProgress(group)}%</strong></header>
        ${group.items.map(item => `
          <div class="progress-control">
            <label for="progress-${item.key}">${item.label}</label>
            <input id="progress-${item.key}" type="range" min="0" max="100" step="1" value="${state.progress[item.key]}" data-progress-key="${item.key}" data-progress-group-key="${group.key}" aria-label="${item.label}完成度" />
            <output for="progress-${item.key}">${state.progress[item.key]}%</output>
          </div>
        `).join("")}
      </article>
    `).join("");

    $$('input[type="range"][data-progress-key]').forEach(input => setRangeFill(input));
  }

  function setRangeFill(input) {
    input.style.background = `linear-gradient(to right, var(--red) 0%, var(--red) ${input.value}%, var(--paper-dark) ${input.value}%, var(--paper-dark) 100%)`;
  }

  function renderWeekTable() {
    const table = $("#weekTable");
    const previousWeekScroll = $(".week-table-wrap")?.scrollLeft || 0;
    const dayNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    const weekDates = Array.from({ length: 7 }, (_, index) => addDaysISO(weekViewStartISO, index));
    const weekTasks = state.tasks.filter(task => weekDates.includes(task.date));
    const doneCount = weekTasks.filter(task => task.done).length;
    const cells = ['<div class="week-cell header-cell"><strong>时段</strong><span>BLOCK</span></div>'];

    weekDates.forEach((dateValue, index) => {
      const date = parseLocalDate(dateValue);
      const inPlan = dateValue >= PLAN_START && dateValue <= state.planEndDate;
      cells.push(`
        <div class="week-cell header-cell ${dateValue === todayISO ? "today-column" : ""} ${dateValue === selectedDateISO ? "selected-column" : ""} ${inPlan ? "" : "outside-plan"}">
          <button type="button" data-week-action="select-date" data-week-date="${dateValue}" ${inPlan ? "" : "disabled"}>
            <strong>${dayNames[index]}</strong><span>${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}</span>
          </button>
        </div>
      `);
    });

    weekBlocks.forEach(block => {
      cells.push(`<div class="week-cell time-cell"><span>${block.label}</span><small>${block.time}</small></div>`);
      weekDates.forEach(dateValue => {
        const inPlan = dateValue >= PLAN_START && dateValue <= state.planEndDate;
        const tasks = weekTasks
          .filter(task => task.date === dateValue && weekBlockForTask(task) === block.key)
          .sort((a, b) => a.start.localeCompare(b.start));
        cells.push(`
          <div class="week-cell ${block.key === "sport" ? "sport-cell" : "study-cell"} ${dateValue === todayISO ? "today-column" : ""} ${dateValue === selectedDateISO ? "selected-column" : ""} ${inPlan ? "" : "outside-plan"}">
            <div class="week-task-list">
              ${tasks.map(task => {
                const meta = subjectMeta[task.subject] || subjectMeta.review;
                return `
                  <article class="week-task-chip ${task.done ? "done" : ""}" style="--cell-color:${meta.color}">
                    <button class="week-task-toggle" type="button" data-week-action="toggle" data-week-task-id="${escapeHTML(task.id)}" aria-label="${task.done ? "标记未完成" : "标记完成"}" aria-pressed="${task.done}"></button>
                    <button class="week-task-main" type="button" data-week-action="edit" data-week-task-id="${escapeHTML(task.id)}">
                      <small>${escapeHTML(task.start)} · ${meta.code}${task.fixed ? " · 固定" : ""}</small>
                      <strong>${escapeHTML(task.title)}</strong>
                    </button>
                  </article>
                `;
              }).join("")}
              ${inPlan && block.key !== "sport" ? `<button class="week-add-task" type="button" data-week-action="add" data-week-date="${dateValue}" data-week-block="${block.key}" aria-label="在 ${dateValue} ${block.label}添加任务">＋</button>` : ""}
            </div>
          </div>
        `);
      });
    });
    table.innerHTML = cells.join("");
    $("#weekRangeLabel").textContent = `${formatShortDate(weekDates[0])}—${formatShortDate(weekDates[6])}`;
    $("#weekTaskSummary").textContent = `${doneCount} / ${weekTasks.length} 项完成`;
    $("#previousWeek").disabled = addDaysISO(weekViewStartISO, -1) < PLAN_START;
    $("#nextWeek").disabled = addDaysISO(weekViewStartISO, 7) > state.planEndDate;
    window.requestAnimationFrame(() => {
      const wrap = $(".week-table-wrap");
      const selectedHeader = $(`[data-week-date="${selectedDateISO}"][data-week-action="select-date"]`, table)?.closest(".week-cell");
      if (!wrap || wrap.scrollWidth <= wrap.clientWidth) return;
      wrap.scrollLeft = selectedHeader
        ? Math.max(0, selectedHeader.offsetLeft - Math.max(94, (wrap.clientWidth - selectedHeader.offsetWidth) / 2))
        : previousWeekScroll;
    });
  }

  function weekBlockForTask(task) {
    const start = timeToMinutes(task.start);
    if (task.subject === "sport" && (task.fixed || (start >= 17 * 60 && start < 19 * 60))) return "sport";
    if (start < 12 * 60) return "morning";
    if (start < 15 * 60 + 20) return "afternoon";
    if (start < 17 * 60) return "english";
    return "evening";
  }

  function weekAddDefaults(blockKey) {
    return {
      morning: { start: "09:00", end: "10:00", subject: "math" },
      afternoon: { start: "14:00", end: "15:00", subject: "cs" },
      english: { start: "15:30", end: "16:30", subject: "english" },
      evening: { start: "19:30", end: "20:30", subject: "review" }
    }[blockKey] || { start: "15:00", end: "16:00", subject: "math" };
  }

  function formatShortDate(value) {
    const date = parseLocalDate(value);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function renderReview() {
    const options = [];
    for (let cursor = startOfWeekISO(PLAN_START); cursor <= startOfWeekISO(state.planEndDate); cursor = addDaysISO(cursor, 7)) options.push(cursor);
    if (!options.includes(selectedReviewWeekStartISO)) selectedReviewWeekStartISO = options.includes(startOfWeekISO(todayISO)) ? startOfWeekISO(todayISO) : options.at(-1);
    $("#reviewWeekSelect").innerHTML = options.map(weekStart => {
      const selected = weekStart === selectedReviewWeekStartISO ? "selected" : "";
      return `<option value="${weekStart}" ${selected}>${formatShortDate(weekStart)}—${formatShortDate(addDaysISO(weekStart, 6))}</option>`;
    }).join("");
    const review = state.reviews[selectedReviewWeekStartISO] || normalizeReview({});
    $("#weeklyWins").value = review.wins;
    $("#weeklyFix").value = review.fix;
    $$("#moodOptions input[data-mood]").forEach(input => {
      input.checked = input.dataset.mood === review.mood;
    });
    $("#todayHoursInput").value = state.studyLog[todayISO] ?? 0;
    renderChart();
  }

  function renderChart() {
    const labels = ["一", "二", "三", "四", "五", "六", "日"];
    const values = [];
    const html = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const key = addDaysISO(selectedReviewWeekStartISO, offset);
      const value = Number(state.studyLog[key] || 0);
      values.push(value);
      const height = Math.max(2, Math.min(100, (value / 12) * 100));
      html.push(`
        <div class="bar-item ${key === todayISO ? "today" : ""}" style="--bar-height:${height}%" title="${key} · ${value} 小时">
          <span>${value ? `${value}h` : "–"}</span><i></i><small>周${labels[offset]}</small>
        </div>
      `);
    }
    $("#studyChart").innerHTML = html.join("");
    const total = values.reduce((sum, value) => sum + value, 0);
    $("#weekHoursTotal").textContent = `${Number(total.toFixed(1))}h`;
  }

  function currentOverallProgress() {
    const math = groupProgress(progressGroups[0]);
    const english = groupProgress(progressGroups[1]);
    const cs = groupProgress(progressGroups[2]);
    return Math.round(math * 0.375 + english * 0.25 + cs * 0.375);
  }

  function updateAllStats() {
    const todayTasks = state.tasks.filter(task => task.date === todayISO).sort((a, b) => a.start.localeCompare(b.start));
    const selectedTasks = state.tasks.filter(task => task.date === selectedDateISO).sort((a, b) => a.start.localeCompare(b.start));
    const studyMinutes = todayTasks
      .filter(task => !["sport", "admin"].includes(task.subject))
      .reduce((sum, task) => sum + taskDuration(task), 0);
    const todayProgress = learningProgress(todayTasks);
    const selectedProgress = learningProgress(selectedTasks);

    $("#todayHours").innerHTML = `${Number((studyMinutes / 60).toFixed(1))}<small>h</small>`;
    const todayPlanIntensity = state.planIntensityByDate[todayISO] || state.intensity;
    $("#intensityLabel").textContent = intensityNames[todayPlanIntensity];
    $("#todayDone").innerHTML = `${todayProgress.doneCount}<small>/ ${todayProgress.totalCount}</small>`;
    $("#dayPercent").textContent = `${selectedProgress.percent}%`;
    $("#dayProgressBar").style.width = `${selectedProgress.percent}%`;
    $("#dayProgressLabel").textContent = selectedDateISO === todayISO ? "今日推进率" : "所选日推进率";
    $("#overallProgress").innerHTML = `${currentOverallProgress()}<small>%</small>`;

    const completionLabel = todayProgress.percent === 100
      ? "今日已收口"
      : todayProgress.percent >= 60
        ? "主线已经守住"
        : todayProgress.doneCount > 0
          ? "继续完成下一格"
          : "先完成第一格";
    $("#completionLabel").textContent = completionLabel;
    const remainingToPass = Math.max(0, selectedProgress.totalMinutes * 0.6 - selectedProgress.doneMinutes);
    $("#dayProgressCopy").textContent = selectedProgress.percent === 100
      ? "这一天已经完整关账，可以放心翻篇。"
      : selectedProgress.percent >= 60
        ? "学业主线已越过 60%，继续按数学、408、英语的优先级逐项收口。"
        : `再完成约 ${formatMinuteAmount(remainingToPass)}的学业任务，主线推进率就会越过 60%。`;
    updateCoachMessage();
  }

  function updateCoachMessage() {
    let message;
    const dayPlan = PLAN_DATA.resolvePlan(selectedDateISO);
    if (registrationEvents[selectedDateISO]) {
      message = "这是报名提醒日：先核验真实官方窗口，再按卡片清单操作。报名、缴费、报名号与确认结果都要截图留存；行政任务未收口前不追加学习量。";
    } else if (dayPlan?.kind === "recovery") {
      message = "今天不推进新课。完成数学与 408 周检后，只允许补一个 45 分钟内能收口的断点，其余问题写入下周，不把周日变成滚动欠账日。";
    } else if (dayPlan?.kind === "study") {
      message = `今天只守三条主线：数学“${dayPlan.math.scope}”，408“${dayPlan.cs.scope}”，英语“${dayPlan.english.scope}”。先达到卡片完成标准，再决定是否加量。`;
    } else {
      message = "按任务卡的完成标准执行；少看进度条，多看正确率、限时表现和重复错因。";
    }
    $("#coachMessage").textContent = message;
  }

  function updateFocusTask() {
    const next = state.tasks
      .filter(task => task.date === selectedDateISO && !task.done && !["sport", "review"].includes(task.subject))
      .sort((a, b) => a.start.localeCompare(b.start))[0];
    $("#focusTask").textContent = next ? `${subjectMeta[next.subject].label} · ${next.title}` : "所选日期主线已完成 · 允许收工";
  }

  function bindEvents() {
    $("#generateToday").addEventListener("click", () => selectPlanDate(todayISO, true));
    $("#emptyAgenda").addEventListener("click", event => {
      if (event.target.closest('[data-action="generate"]')) generateSelectedDate();
    });

    $("#previousPlanDate").addEventListener("click", () => {
      const date = parseLocalDate(selectedDateISO);
      date.setDate(date.getDate() - 1);
      selectPlanDate(toISODate(date));
    });
    $("#nextPlanDate").addEventListener("click", () => {
      const date = parseLocalDate(selectedDateISO);
      date.setDate(date.getDate() + 1);
      selectPlanDate(toISODate(date));
    });

    $("#dailyAgenda").addEventListener("click", event => {
      const item = event.target.closest(".agenda-item");
      if (!item) return;
      const task = state.tasks.find(entry => entry.id === item.dataset.taskId);
      if (!task) return;

      if (event.target.closest('[data-action="toggle"]')) {
        task.done = !task.done;
        task.customized = true;
        saveState();
        renderAgenda();
        renderCalendar(true);
        renderWeekTable();
        updateAllStats();
        if (task.done) showToast(`完成：${task.title}`);
        return;
      }

      if (event.target.closest('[data-action="delete"]')) {
        deleteTask(task);
        return;
      }

      if (event.target.closest('[data-action="edit"]')) {
        openTaskDialog(task);
        return;
      }

      if (event.target.closest('[data-action="expand"]') || !event.target.closest(".task-details")) {
        expandedTaskId = expandedTaskId === task.id ? null : task.id;
        renderAgenda();
      }
    });

    $("#dailyAgenda").addEventListener("keydown", event => {
      if (!["Enter", " "].includes(event.key)) return;
      const trigger = event.target.closest('[data-action="expand"]');
      if (!trigger) return;
      event.preventDefault();
      const item = trigger.closest(".agenda-item");
      expandedTaskId = expandedTaskId === item.dataset.taskId ? null : item.dataset.taskId;
      renderAgenda();
    });

    $("#dailyAgenda").addEventListener("change", event => {
      const checkbox = event.target.closest("[data-task-step]");
      if (!checkbox) return;
      const item = checkbox.closest(".agenda-item");
      const task = state.tasks.find(entry => entry.id === item.dataset.taskId);
      if (!task) return;
      task.stepDone = Array.isArray(task.stepDone) ? task.stepDone : [];
      task.stepDone[Number(checkbox.dataset.taskStep)] = checkbox.checked;
      task.customized = true;
      saveState();
    });

    $("#dailyAgenda").addEventListener("input", event => {
      const note = event.target.closest("[data-task-note]");
      if (!note) return;
      const item = note.closest(".agenda-item");
      const task = state.tasks.find(entry => entry.id === item.dataset.taskId);
      if (!task) return;
      task.note = note.value;
      task.customized = true;
      saveState();
    });

    $("#addTaskButton").addEventListener("click", () => openTaskDialog());
    $("#taskForm").addEventListener("submit", handleTaskSubmit);
    $("#taskDeleteButton").addEventListener("click", () => {
      const task = state.tasks.find(entry => entry.id === editingTaskId);
      if (task) deleteTask(task, true);
    });
    $("#taskDialog .modal-close").addEventListener("click", () => closeDialog($("#taskDialog")));

    $$(".phase-tab").forEach(button => {
      button.addEventListener("click", () => renderPhase(Number(button.dataset.phase)));
    });

    let calendarPanning = false;
    let calendarStartX = 0;
    let calendarStartScroll = 0;
    let calendarMoved = false;
    const calendarViewport = $("#calendarViewport");

    calendarViewport.addEventListener("pointerdown", event => {
      if (event.target.closest(".calendar-task")) return;
      calendarPanning = true;
      calendarMoved = false;
      calendarStartX = event.clientX;
      calendarStartScroll = calendarViewport.scrollLeft;
      calendarViewport.classList.add("is-dragging");
      calendarViewport.setPointerCapture?.(event.pointerId);
    });
    calendarViewport.addEventListener("pointermove", event => {
      if (!calendarPanning) return;
      const distance = event.clientX - calendarStartX;
      if (Math.abs(distance) > 5) calendarMoved = true;
      calendarViewport.scrollLeft = calendarStartScroll - distance;
    });
    const stopCalendarPan = event => {
      if (!calendarPanning) return;
      calendarPanning = false;
      calendarViewport.classList.remove("is-dragging");
      calendarViewport.releasePointerCapture?.(event.pointerId);
      window.setTimeout(() => { calendarMoved = false; }, 0);
    };
    calendarViewport.addEventListener("pointerup", stopCalendarPan);
    calendarViewport.addEventListener("pointercancel", stopCalendarPan);

    calendarViewport.addEventListener("click", event => {
      if (calendarMoved) return;
      const taskCard = event.target.closest("[data-calendar-task-id]");
      if (taskCard) {
        const task = state.tasks.find(entry => entry.id === taskCard.dataset.calendarTaskId);
        if (!task) return;
        selectedDateISO = task.date;
        weekViewStartISO = startOfWeekISO(selectedDateISO);
        expandedTaskId = task.id;
        renderDates();
        renderAgenda();
        renderCalendar(true);
        renderWeekTable();
        updateAllStats();
        $("#today").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const dayHeader = event.target.closest('[data-action="select-date"]');
      if (dayHeader) selectPlanDate(dayHeader.closest("[data-calendar-date]").dataset.calendarDate, true);
    });

    calendarViewport.addEventListener("keydown", event => {
      if (!['Enter', ' '].includes(event.key)) return;
      const dayHeader = event.target.closest('[data-action="select-date"]');
      if (!dayHeader) return;
      event.preventDefault();
      selectPlanDate(dayHeader.closest("[data-calendar-date]").dataset.calendarDate, true);
    });

    calendarViewport.addEventListener("dragstart", event => {
      const card = event.target.closest("[data-calendar-task-id]");
      if (!card) return;
      const task = state.tasks.find(entry => entry.id === card.dataset.calendarTaskId);
      if (!task || task.fixed) {
        event.preventDefault();
        return;
      }
      draggedTaskId = task.id;
      card.classList.add("is-moving");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", task.id);
    });
    calendarViewport.addEventListener("dragover", event => {
      const day = event.target.closest("[data-calendar-date]");
      if (!day || !draggedTaskId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      $$(".calendar-day.drop-target", calendarViewport).forEach(entry => entry.classList.remove("drop-target"));
      day.classList.add("drop-target");
    });
    calendarViewport.addEventListener("drop", event => {
      const day = event.target.closest("[data-calendar-date]");
      if (!day || !draggedTaskId) return;
      event.preventDefault();
      const task = state.tasks.find(entry => entry.id === draggedTaskId);
      if (!task) return;
      const oldDate = task.date;
      task.date = day.dataset.calendarDate;
      task.customized = true;
      selectedDateISO = task.date;
      weekViewStartISO = startOfWeekISO(selectedDateISO);
      expandedTaskId = task.id;
      draggedTaskId = null;
      saveState();
      renderDates();
      renderAgenda();
      renderCalendar(true);
      renderWeekTable();
      updateAllStats();
      showToast(`已把“${task.title}”从 ${oldDate.slice(5)} 移到 ${task.date.slice(5)}。`);
    });
    calendarViewport.addEventListener("dragend", () => {
      draggedTaskId = null;
      $$(".calendar-day.drop-target", calendarViewport).forEach(entry => entry.classList.remove("drop-target"));
      $$(".calendar-task.is-moving", calendarViewport).forEach(entry => entry.classList.remove("is-moving"));
    });

    $$("[data-calendar-jump]").forEach(button => button.addEventListener("click", () => scrollToCalendarDate(clampPlanDate(button.dataset.calendarJump))));
    $("#jumpCalendarToday").addEventListener("click", () => scrollToCalendarDate(clampPlanDate(todayISO)));
    $("#calendarPrevious").addEventListener("click", () => calendarViewport.scrollBy({ left: -760, behavior: "smooth" }));
    $("#calendarNext").addEventListener("click", () => calendarViewport.scrollBy({ left: 760, behavior: "smooth" }));

    $("#subjectProgress").addEventListener("input", event => {
      const input = event.target.closest("[data-progress-key]");
      if (!input) return;
      state.progress[input.dataset.progressKey] = Number(input.value);
      input.nextElementSibling.textContent = `${input.value}%`;
      setRangeFill(input);
      const group = progressGroups.find(entry => entry.key === input.dataset.progressGroupKey);
      const groupElement = input.closest("[data-progress-group]");
      $("[data-group-total]", groupElement).textContent = `${groupProgress(group)}%`;
      updateAllStats();
      saveState();
    });

    $("#previousWeek").addEventListener("click", () => {
      weekViewStartISO = addDaysISO(weekViewStartISO, -7);
      renderWeekTable();
    });
    $("#currentWeek").addEventListener("click", () => {
      weekViewStartISO = startOfWeekISO(clampPlanDate(todayISO));
      renderWeekTable();
    });
    $("#nextWeek").addEventListener("click", () => {
      weekViewStartISO = addDaysISO(weekViewStartISO, 7);
      renderWeekTable();
    });
    $("#weekTable").addEventListener("click", event => {
      const trigger = event.target.closest("[data-week-action]");
      if (!trigger) return;
      const action = trigger.dataset.weekAction;
      if (action === "select-date") {
        selectPlanDate(trigger.dataset.weekDate, true);
        return;
      }
      if (action === "add") {
        const defaults = weekAddDefaults(trigger.dataset.weekBlock);
        openTaskDialog(null, { date: trigger.dataset.weekDate, ...defaults });
        return;
      }
      const task = state.tasks.find(entry => entry.id === trigger.dataset.weekTaskId);
      if (!task) return;
      if (action === "toggle") {
        task.done = !task.done;
        task.customized = true;
        saveState();
        renderAgenda();
        renderCalendar(true);
        renderWeekTable();
        updateAllStats();
        return;
      }
      if (action === "edit") openTaskDialog(task);
    });

    $("#moodOptions").addEventListener("change", event => {
      const input = event.target.closest("input[data-mood]");
      if (!input) return;
      state.reviews[selectedReviewWeekStartISO] = state.reviews[selectedReviewWeekStartISO] || normalizeReview({});
      state.reviews[selectedReviewWeekStartISO].mood = input.dataset.mood;
      saveState();
    });

    $("#reviewWeekSelect").addEventListener("change", event => {
      selectedReviewWeekStartISO = event.target.value;
      renderReview();
    });

    $("#saveHours").addEventListener("click", () => {
      const value = Math.max(0, Math.min(16, Number($("#todayHoursInput").value) || 0));
      state.studyLog[todayISO] = Number(value.toFixed(1));
      $("#todayHoursInput").value = state.studyLog[todayISO];
      saveState();
      renderChart();
      showToast("今天的有效学习时长已记录。", "short");
    });

    $("#saveReview").addEventListener("click", () => {
      state.reviews[selectedReviewWeekStartISO] = state.reviews[selectedReviewWeekStartISO] || normalizeReview({});
      state.reviews[selectedReviewWeekStartISO].wins = safeText($("#weeklyWins").value, 3000);
      state.reviews[selectedReviewWeekStartISO].fix = safeText($("#weeklyFix").value, 3000);
      saveState();
      showToast("本周复盘已保存。下周只修正一个最重要的问题。", "short");
    });

    $("#timerToggle").addEventListener("click", toggleTimer);
    $("#timerReset").addEventListener("click", resetTimer);

    $("#openSettings").addEventListener("click", openSettings);
    $("#editPlanEnd").addEventListener("click", openSettings);
    $("#settingsForm").addEventListener("submit", handleSettingsSubmit);
    $("#settingsDialog .modal-close").addEventListener("click", () => closeDialog($("#settingsDialog")));

    [$("#taskDialog"), $("#settingsDialog")].forEach(dialog => {
      dialog.addEventListener("click", event => {
        const rect = dialog.getBoundingClientRect();
        const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
        if (outside) closeDialog(dialog);
      });
      dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
    });

    $("#exportData").addEventListener("click", exportData);
    $("#importData").addEventListener("click", () => $("#importDataFile").click());
    $("#importDataFile").addEventListener("change", importData);
    $("#conflictBackups").addEventListener("click", event => {
      const button = event.target.closest("[data-restore-backup]");
      if (button) restoreConflictBackup(button.dataset.restoreBackup);
    });
    window.addEventListener("scroll", updatePageProgress, { passive: true });
  }

  function openTaskDialog(task = null, defaults = {}) {
    editingTaskId = task?.id || null;
    $("#taskForm").reset();
    const draft = task || {
      date: defaults.date || selectedDateISO,
      subject: defaults.subject || "math",
      start: defaults.start || "15:00",
      end: defaults.end || "16:00",
      title: ""
    };
    const guidance = taskGuidance(draft);
    $("#taskDialogTitle").textContent = task ? "编辑这段日程" : "添加一段日程";
    $("#taskSubmitButton").textContent = task ? "保存修改" : "加入时间轴";
    $("#taskTitle").value = draft.title || "";
    $("#taskDate").min = PLAN_START;
    $("#taskDate").max = state.planEndDate;
    $("#taskDate").value = draft.date;
    $("#taskSubject").value = draft.subject;
    $("#taskStart").value = draft.start;
    $("#taskEnd").value = draft.end;
    $("#taskObjective").value = guidance.objective;
    $("#taskDoneWhen").value = guidance.doneWhen;
    $("#taskSteps").value = guidance.steps.join("\n");
    $("#taskNote").value = task?.note || "";
    [$("#taskDate"), $("#taskSubject"), $("#taskStart"), $("#taskEnd")].forEach(input => { input.disabled = Boolean(task?.fixed); });
    $("#taskDeleteButton").hidden = !task || Boolean(task.fixed);
    $("#taskFormHint").classList.remove("error");
    $("#taskFormHint").textContent = task?.fixed
      ? "固定运动块可编辑名称、目标、步骤与记录；日期和时间保持 17:00–19:00。"
      : "17:00–19:00 已锁定为运动时间，其他学习任务不能与它重叠。";
    openDialog($("#taskDialog"));
    window.setTimeout(() => $("#taskTitle").focus(), 120);
  }

  function handleTaskSubmit(event) {
    event.preventDefault();
    const existingTask = editingTaskId ? state.tasks.find(entry => entry.id === editingTaskId) : null;
    const title = safeText($("#taskTitle").value, 160);
    const date = existingTask?.fixed ? existingTask.date : $("#taskDate").value;
    const subject = existingTask?.fixed ? existingTask.subject : $("#taskSubject").value;
    const start = existingTask?.fixed ? existingTask.start : $("#taskStart").value;
    const end = existingTask?.fixed ? existingTask.end : $("#taskEnd").value;
    const objective = safeText($("#taskObjective").value, 800);
    const doneWhen = safeText($("#taskDoneWhen").value, 800);
    const steps = $("#taskSteps").value.split(/\r?\n/).map(step => safeText(step, 240)).filter(Boolean).slice(0, 12);
    const note = safeText($("#taskNote").value, 2000);
    const hint = $("#taskFormHint");

    if (!title || !date || !start || !end) return;
    if (date < PLAN_START || date > state.planEndDate) {
      hint.textContent = `日期需要在 ${PLAN_START} 到 ${state.planEndDate} 之间。`;
      hint.classList.add("error");
      return;
    }
    if (timeToMinutes(end) <= timeToMinutes(start)) {
      hint.textContent = "结束时间必须晚于开始时间。";
      hint.classList.add("error");
      return;
    }
    if (subject !== "sport" && overlaps(start, end, "17:00", "19:00")) {
      hint.textContent = "这段时间与 17:00–19:00 运动块重叠，请换一个时段。";
      hint.classList.add("error");
      return;
    }

    if (existingTask) {
      const previousSteps = taskGuidance(existingTask).steps;
      const previousDone = Array.isArray(existingTask.stepDone) ? existingTask.stepDone : [];
      const stepDone = steps.map((step, index) => previousSteps[index] === step && Boolean(previousDone[index]));
      Object.assign(existingTask, { date, start, end, subject, title, objective, doneWhen, steps, stepDone, note, customized: true });
    } else {
      state.tasks.push({
        id: uid(), date, start, end, subject, title,
        done: false, fixed: false, generated: false, customized: true,
        objective, doneWhen, steps, stepDone: steps.map(() => false), note
      });
    }
    saveState();
    closeDialog($("#taskDialog"));
    editingTaskId = null;
    selectedDateISO = date;
    weekViewStartISO = startOfWeekISO(date);
    expandedTaskId = existingTask?.id || state.tasks.at(-1)?.id || null;
    renderDates();
    renderAgenda();
    renderCalendar(true);
    renderWeekTable();
    updateAllStats();
    showToast(existingTask ? "日程修改已保存。" : `任务已保存到 ${date}。`, "short");
  }

  function deleteTask(task, closeTaskDialog = false) {
    if (!task || task.fixed) return;
    state.tasks = state.tasks.filter(entry => entry.id !== task.id);
    if (expandedTaskId === task.id) expandedTaskId = null;
    if (editingTaskId === task.id) editingTaskId = null;
    saveState();
    if (closeTaskDialog) closeDialog($("#taskDialog"));
    renderAgenda();
    renderCalendar(true);
    renderWeekTable();
    updateAllStats();
    showToast("任务已移出时间轴。", "short");
  }

  function openSettings() {
    $("#planEndDateInput").value = state.planEndDate;
    $("#planEndDateInput").min = PLAN_START;
    $("#planEndDateInput").max = MAX_PLAN_END;
    $("#intensityInput").value = state.intensity;
    renderConflictBackups();
    openDialog($("#settingsDialog"));
  }

  function handleSettingsSubmit(event) {
    event.preventDefault();
    const planEndDate = $("#planEndDateInput").value;
    const intensity = $("#intensityInput").value;
    if (!isValidISODate(planEndDate) || planEndDate < PLAN_START || planEndDate > MAX_PLAN_END || parseLocalDate(planEndDate) <= today) {
      showToast(`计划截止日需要晚于今天，且不能超过 ${MAX_PLAN_END}。`, "short");
      return;
    }
    state.planEndDate = planEndDate;
    state.intensity = VALID_INTENSITIES.has(intensity) ? intensity : "standard";
    selectedDateISO = clampPlanDate(selectedDateISO);
    ensureFullPlan();
    saveState();
    renderDates();
    renderCountdown();
    renderAgenda();
    renderCalendar();
    renderWeekTable();
    renderReview();
    updateAllStats();
    closeDialog($("#settingsDialog"));
    showToast("设置已保存；计划范围与横向日历已同步。", "short");
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.body.classList.add("modal-open");
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("modal-open");
  }

  function toggleTimer() {
    if (focusRunning) {
      window.clearInterval(focusInterval);
      focusSeconds = Math.max(0, Math.ceil((focusEndsAt - Date.now()) / 1000));
      focusRunning = false;
      focusEndsAt = 0;
      $("#timerToggle").textContent = "继续专注";
      $("#timerStatus").textContent = "已暂停";
      return;
    }

    if (focusSeconds <= 0) focusSeconds = FOCUS_SECONDS;
    focusRunning = true;
    focusEndsAt = Date.now() + focusSeconds * 1000;
    $("#timerToggle").textContent = "暂停一下";
    $("#timerStatus").textContent = "进行中";
    const tick = () => {
      focusSeconds = Math.max(0, Math.ceil((focusEndsAt - Date.now()) / 1000));
      renderTimer();
      if (focusSeconds <= 0) {
        window.clearInterval(focusInterval);
        focusRunning = false;
        focusEndsAt = 0;
        $("#timerToggle").textContent = "再来一轮";
        $("#timerStatus").textContent = "本轮完成";
        showToast("50 分钟专注完成。起身喝水，休息 10 分钟。", "long");
      }
    };
    tick();
    focusInterval = window.setInterval(tick, 250);
  }

  function resetTimer() {
    window.clearInterval(focusInterval);
    focusRunning = false;
    focusSeconds = FOCUS_SECONDS;
    focusEndsAt = 0;
    $("#timerToggle").textContent = "开始专注";
    $("#timerStatus").textContent = "待开始";
    renderTimer();
  }

  function renderTimer() {
    const safeSeconds = Math.max(0, Math.min(FOCUS_SECONDS, Math.ceil(focusSeconds)));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    $("#timerDisplay").textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    const degrees = ((FOCUS_SECONDS - safeSeconds) / FOCUS_SECONDS) * 360;
    $("#timerRing").style.setProperty("--timer-progress", `${degrees}deg`);
  }

  function exportData() {
    const exportObject = {
      exportedAt: new Date().toISOString(),
      app: "岸线 · 27 考研作战手册",
      data: state
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `考研计划备份-${todayISO}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("备份文件已导出。", "short");
  }

  async function importData(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new RangeError("备份文件超过 10 MB 上限");
      const parsed = JSON.parse(await file.text());
      const imported = isPlainObject(parsed?.data) ? parsed.data : parsed;
      if (!isPlainObject(imported)) throw new TypeError("备份根节点不是对象");
      preserveCurrentStateBackup("导入前自动备份");
      replaceStateFromCloud(imported);
      saveState();
      showToast("备份已导入，并进入云同步队列。", "long");
    } catch (error) {
      showToast(`导入失败：${safeText(error?.message || error, 120) || "文件格式无效"}`, "long");
    }
  }

  function preserveCurrentStateBackup(reason) {
    return preserveStateDataBackup(state, reason);
  }

  function preserveStateDataBackup(data, reason) {
    const key = `${CONFLICT_BACKUP_PREFIX}${Date.now()}`;
    localStorage.setItem(key, JSON.stringify({ savedAt: new Date().toISOString(), reason, data }));
    return key;
  }

  function conflictBackups() {
    const backups = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(CONFLICT_BACKUP_PREFIX)) continue;
      try {
        const record = JSON.parse(localStorage.getItem(key));
        if (isPlainObject(record?.data)) backups.push({ key, savedAt: record.savedAt, reason: record.reason });
      } catch {
        // Ignore malformed legacy backup entries; they remain untouched for manual recovery.
      }
    }
    return backups.sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
  }

  function renderConflictBackups() {
    const container = $("#conflictBackups");
    const backups = conflictBackups();
    container.innerHTML = backups.length ? backups.map(backup => {
      const date = backup.savedAt ? new Date(backup.savedAt).toLocaleString("zh-CN", { hour12: false }) : "时间未知";
      return `<div><span><strong>${escapeHTML(backup.reason || "同步冲突备份")}</strong><small>${escapeHTML(date)}</small></span><button type="button" data-restore-backup="${escapeHTML(backup.key)}">恢复</button></div>`;
    }).join("") : "<p>暂无冲突或导入前备份。</p>";
  }

  function restoreConflictBackup(key) {
    try {
      const record = JSON.parse(localStorage.getItem(key));
      if (!isPlainObject(record?.data)) throw new TypeError("备份内容无效");
      preserveCurrentStateBackup("恢复前自动备份");
      replaceStateFromCloud(record.data);
      saveState();
      renderConflictBackups();
      showToast("备份已恢复，并进入云同步队列。", "long");
    } catch (error) {
      showToast(`恢复失败：${safeText(error?.message || error, 120)}`, "long");
    }
  }

  function showToast(message, duration = "normal") {
    const toast = $("#toast");
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    const delay = duration === "short" ? 1800 : duration === "long" ? 4200 : 3000;
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), delay);
  }

  function updatePageProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    $("#pageProgress").style.width = `${progress}%`;
  }

  function setupSectionObserver() {
    const links = $$(".section-nav a");
    const sections = links.map(link => $(link.getAttribute("href"))).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
    }, { rootMargin: "-20% 0px -65%", threshold: [0, 0.15, 0.4] });
    sections.forEach(section => observer.observe(section));
  }

  window.KaoyanPlanner = Object.freeze({
    getState: () => structuredClone(state),
    replaceState: replaceStateFromCloud,
    storageKey: STORAGE_KEY
  });
})();
