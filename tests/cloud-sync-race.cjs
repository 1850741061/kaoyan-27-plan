const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("cloud-sync.js", "utf8");
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const clone = value => structuredClone(value);

const server = {
  row: {
    payload: { marker: "initial" },
    revision: 1,
    updated_at: new Date().toISOString()
  },
  subscribers: new Set(),
  updateDelay: 80,
  updateLog: []
};

function createClassList() {
  const values = new Set();
  return {
    add: (...names) => names.forEach(name => values.add(name)),
    remove: (...names) => names.forEach(name => values.delete(name)),
    toggle: (name, force) => force === undefined
      ? (values.has(name) ? (values.delete(name), false) : (values.add(name), true))
      : (force ? values.add(name) : values.delete(name), force),
    contains: name => values.has(name)
  };
}

function createElement() {
  return {
    hidden: false,
    disabled: false,
    open: false,
    value: "",
    textContent: "",
    lastChild: { textContent: "" },
    classList: createClassList(),
    addEventListener() {},
    toggleAttribute() {},
    setAttribute() {},
    removeAttribute() {},
    close() { this.open = false; }
  };
}

function createStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    key: index => [...values.keys()][index] || null,
    get length() { return values.size; }
  };
}

function createQuery(deviceName) {
  let operation = "select";
  let body = null;
  const filters = {};
  const query = {
    select() { return query; },
    insert(value) { operation = "insert"; body = value; return query; },
    update(value) { operation = "update"; body = value; return query; },
    eq(key, value) { filters[key] = value; return query; },
    async single() {
      if (operation !== "insert") return { data: clone(server.row), error: null };
      server.row = { payload: clone(body.payload), revision: body.revision, updated_at: body.updated_at };
      return { data: clone(server.row), error: null };
    },
    async maybeSingle() {
      if (operation === "select") return { data: clone(server.row), error: null };
      await delay(server.updateDelay);
      if (Number(filters.revision) !== Number(server.row.revision)) return { data: null, error: null };
      server.row = { payload: clone(body.payload), revision: body.revision, updated_at: body.updated_at };
      server.updateLog.push({ deviceName, revision: body.revision, marker: body.payload.marker });
      const payload = { eventType: "UPDATE", new: clone(server.row) };
      setTimeout(() => server.subscribers.forEach(subscription => subscription.callback(payload)), 0);
      return { data: clone(server.row), error: null };
    }
  };
  return query;
}

function createClient(deviceName, session) {
  return {
    auth: {
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
      async getSession() { return { data: { session }, error: null }; },
      async getUser() { return { data: { user: session.user }, error: null }; },
      async signInWithPassword() { return { data: { session }, error: null }; },
      async signOut() { return { error: null }; }
    },
    from() { return createQuery(deviceName); },
    channel() {
      const channel = {
        callback: null,
        on(_event, _filter, callback) { channel.callback = callback; return channel; },
        subscribe(statusCallback) {
          server.subscribers.add(channel);
          setTimeout(() => statusCallback("SUBSCRIBED"), 0);
          return channel;
        }
      };
      return channel;
    },
    removeChannel(channel) {
      server.subscribers.delete(channel);
      return Promise.resolve();
    }
  };
}

async function createDevice(name) {
  const elements = new Map();
  const elementFor = selector => {
    if (!elements.has(selector)) elements.set(selector, createElement());
    return elements.get(selector);
  };
  const body = createElement();
  body.classList.add("cloud-locked");
  const document = {
    body,
    visibilityState: "visible",
    querySelector: elementFor,
    querySelectorAll: () => [],
    addEventListener() {}
  };
  const localStorage = createStorage();
  const session = {
    access_token: `token-${name}`,
    user: { id: "00000000-0000-0000-0000-000000000027", email: "only-user@example.com" }
  };
  let plannerState = { marker: "initial" };
  const planner = {
    getState: () => clone(plannerState),
    replaceState: next => { plannerState = clone(next); }
  };
  const listeners = new Map();
  const window = {
    KaoyanPlanner: planner,
    supabase: { createClient: () => createClient(name, session) },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    addEventListener: (event, callback) => listeners.set(event, callback)
  };
  const context = vm.createContext({
    window,
    document,
    navigator: { onLine: true },
    localStorage,
    structuredClone,
    console,
    Date,
    Promise,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  });
  vm.runInContext(source, context, { filename: "cloud-sync.js" });
  await delay(40);
  return {
    name,
    planner,
    cloud: window.KaoyanCloud,
    setState(next) { plannerState = clone(next); },
    getState() { return clone(plannerState); },
    getMeta() { return JSON.parse(localStorage.getItem("shoreline-kaoyan-cloud-meta-v1")); }
  };
}

(async () => {
  const deviceA = await createDevice("A");
  const deviceB = await createDevice("B");

  deviceA.setState({ marker: "A-first" });
  deviceA.cloud.queueSave(deviceA.getState());
  const firstSync = deviceA.cloud.syncNow();
  await delay(20);
  deviceA.setState({ marker: "A-latest" });
  deviceA.cloud.queueSave(deviceA.getState());
  await firstSync;
  await delay(350);

  const racePassed = server.row.payload.marker === "A-latest"
    && server.updateLog.some(entry => entry.marker === "A-first")
    && server.updateLog.some(entry => entry.marker === "A-latest")
    && deviceA.getMeta().users["00000000-0000-0000-0000-000000000027"].dirty === false;
  const realtimePassed = deviceB.getState().marker === "A-latest";

  const result = {
    racePassed,
    realtimePassed,
    remote: server.row,
    deviceBState: deviceB.getState(),
    updateLog: server.updateLog
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(racePassed && realtimePassed ? 0 : 1);
})();
