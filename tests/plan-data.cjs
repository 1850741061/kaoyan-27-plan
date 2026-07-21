const assert = require("node:assert/strict");
const plan = require("../plan-data.js");

const minutes = value => {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
};

const academicMinutes = tasks => tasks
  .filter(task => !["sport", "admin"].includes(task.subject))
  .reduce((total, task) => total + minutes(task.end) - minutes(task.start), 0);

const dates = [];
for (let date = plan.PLAN_START; date <= plan.DETAILED_PLAN_END; date = plan.addDays(date, 1)) dates.push(date);
assert.equal(dates.length, 121, "默认详细计划必须覆盖 121 天");

const seenKeys = new Set();
let totalTasks = 0;
let registrationTasks = 0;
let sundayCount = 0;

for (const date of dates) {
  const tasks = plan.buildDay(date, "standard");
  assert.ok(tasks.length >= 7, `${date} 至少需要 7 个时间块`);
  totalTasks += tasks.length;

  const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay();
  const sports = tasks.filter(task => task.subject === "sport");
  assert.equal(sports.length, 1, `${date} 必须且只能有一个运动块`);
  assert.equal(sports[0].start, "17:00", `${date} 运动开始时间错误`);
  assert.equal(sports[0].end, "19:00", `${date} 运动结束时间错误`);
  assert.equal(sports[0].fixed, true, `${date} 运动块必须锁定`);

  for (const task of tasks) {
    assert.ok(task.templateKey, `${date} 存在无模板键任务`);
    assert.ok(!seenKeys.has(task.templateKey), `模板键重复：${task.templateKey}`);
    seenKeys.add(task.templateKey);
    assert.ok(task.title && task.title.length <= 160, `${task.templateKey} 标题无效`);
    assert.ok(task.objective && task.objective.length <= 800, `${task.templateKey} 缺少目标`);
    assert.ok(task.doneWhen && task.doneWhen.length <= 800, `${task.templateKey} 缺少完成标准`);
    assert.ok(Array.isArray(task.steps) && task.steps.length >= 3 && task.steps.length <= 12, `${task.templateKey} 步骤无效`);
    assert.ok(task.steps.every(step => step.length <= 240), `${task.templateKey} 存在过长步骤`);
    assert.ok(minutes(task.end) > minutes(task.start), `${task.templateKey} 时间无效`);
    assert.ok(!/高数后续内容|当日题组|新词 \+ 间隔复习/.test(task.title), `${task.templateKey} 仍使用旧的模糊任务名`);
    if (task.subject === "admin") registrationTasks += 1;
  }

  for (let index = 1; index < tasks.length; index += 1) {
    assert.ok(minutes(tasks[index - 1].end) <= minutes(tasks[index].start), `${date} 存在时间冲突：${tasks[index - 1].title} / ${tasks[index].title}`);
  }

  const plannedMinutes = academicMinutes(tasks);
  if (dayOfWeek === 0) {
    sundayCount += 1;
    assert.ok(plannedMinutes <= 330, `${date} 周日学习量超过 5.5 小时`);
    assert.ok(tasks.some(task => task.title.startsWith("数学周检")), `${date} 周日缺数学周检`);
    assert.ok(tasks.some(task => task.title.startsWith("唯一补缺")), `${date} 周日缺唯一补缺`);
    assert.ok(!tasks.some(task => task.title.startsWith("新课收口")), `${date} 周日不应推进新课`);
  } else {
    assert.ok(plannedMinutes >= 450 && plannedMinutes <= 540, `${date} 标准日学习量不在 7.5—9 小时范围`);
  }
}

assert.equal(sundayCount, 18, "默认计划应包含 18 个恢复周日");
assert.equal(registrationTasks, 8, "报名提醒数量错误");
assert.equal(totalTasks, 947, "默认计划任务总数发生意外变化");

const expectedBoundaries = {
  "2026-07-27": ["行列式定义", "流水线性能"],
  "2026-08-06": ["齐次与非齐次方程组", "操作系统概念"],
  "2026-08-13": ["随机事件", "读者—写者"],
  "2026-08-21": ["条件分布", "计网体系结构"],
  "2026-09-07": ["数学基础阶段", "DNS"],
  "2026-10-19": ["2011 年数学一整卷", "数据结构树与图"],
  "2026-11-15": ["真题得分曲线", "四科框架验收"]
};

for (const [date, fragments] of Object.entries(expectedBoundaries)) {
  const combined = plan.buildDay(date).map(task => task.title).join("\n");
  for (const fragment of fragments) assert.ok(combined.includes(fragment), `${date} 缺少阶段边界内容：${fragment}`);
}

const vocabTask = plan.buildDay("2026-07-21").find(task => task.templateKey.endsWith(":english-vocabulary"));
assert.ok(vocabTask.doneWhen.includes("新词 50 个"), "词汇任务缺少明确数量");
assert.ok(!vocabTask.doneWhen.includes("定位句"), "词汇任务错误套用了阅读完成标准");

for (const intensity of ["light", "standard", "sprint"]) {
  for (let date = plan.PLAN_START; date <= plan.MAX_PLAN_END; date = plan.addDays(date, 1)) {
    const tasks = plan.buildDay(date, intensity);
    assert.ok(tasks.length >= 7, `${date} ${intensity} 扩展计划为空`);
    for (let index = 1; index < tasks.length; index += 1) {
      assert.ok(minutes(tasks[index - 1].end) <= minutes(tasks[index].start), `${date} ${intensity} 存在时间冲突`);
    }
  }
}

console.log(JSON.stringify({
  passed: true,
  days: dates.length,
  totalTasks,
  sundayCount,
  registrationTasks,
  firstDay: plan.buildDay(plan.PLAN_START).map(task => task.title),
  finalDay: plan.buildDay(plan.DETAILED_PLAN_END).map(task => task.title)
}, null, 2));
