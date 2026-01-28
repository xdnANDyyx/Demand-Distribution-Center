if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LAUNCH = "onLaunch";
  const ON_LOAD = "onLoad";
  const ON_READY = "onReady";
  const ON_UNLOAD = "onUnload";
  const ON_REACH_BOTTOM = "onReachBottom";
  const ON_PULL_DOWN_REFRESH = "onPullDownRefresh";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onHide = /* @__PURE__ */ createLifeCycleHook(
    ON_HIDE,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLaunch = /* @__PURE__ */ createLifeCycleHook(
    ON_LAUNCH,
    1
    /* HookFlags.APP */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const onReady = /* @__PURE__ */ createLifeCycleHook(
    ON_READY,
    2
    /* HookFlags.PAGE */
  );
  const onUnload = /* @__PURE__ */ createLifeCycleHook(
    ON_UNLOAD,
    2
    /* HookFlags.PAGE */
  );
  const onReachBottom = /* @__PURE__ */ createLifeCycleHook(
    ON_REACH_BOTTOM,
    2
    /* HookFlags.PAGE */
  );
  const onPullDownRefresh$1 = /* @__PURE__ */ createLifeCycleHook(
    ON_PULL_DOWN_REFRESH,
    2
    /* HookFlags.PAGE */
  );
  const IP = "115.190.38.218";
  const ENV = {
    development: {
      baseURL: "https://" + IP + "/api/api/v1",
      // 需要加  /api
      socketURL: "ws://" + IP + "/api/v1/ws",
      staticURL: "https://" + IP + "/static",
      debug: true
    },
    production: {
      baseURL: "https://" + IP + "/api/api/v1",
      socketURL: "ws://" + IP + "/api/api/v1/ws",
      staticURL: "https://" + IP + "/static",
      debug: false
    }
  };
  const isMobileApp = typeof plus !== "undefined";
  if (isMobileApp) {
    ENV.development.baseURL = "https://" + IP + "/api/api/v1";
    ENV.development.socketURL = "ws://" + IP + "/api/api/v1/ws";
    ENV.production.baseURL = "https://" + IP + "/api/api/v1";
    ENV.production.socketURL = "ws://" + IP + "/api/api/v1/ws";
  }
  const currentEnv = "development";
  formatAppLog("log", "at config/index.js:44", "当前环境:", currentEnv);
  formatAppLog("log", "at config/index.js:45", "是否为移动应用:", isMobileApp);
  formatAppLog("log", "at config/index.js:46", "API基础URL:", ENV[currentEnv].baseURL);
  const APP_CONFIG = {
    // 应用信息
    APP_NAME: "国中宝",
    APP_VERSION: "1.0.0",
    // API配置
    API_BASE_URL: ENV[currentEnv].baseURL,
    API_TIMEOUT: 1e4,
    API_WITH_CREDENTIALS: true,
    // 静态资源
    STATIC_URL: ENV[currentEnv].staticURL,
    // 调试模式
    DEBUG: ENV[currentEnv].debug
  };
  const WS_CONFIG = {
    URL: ENV[currentEnv].socketURL,
    RECONNECT_INTERVAL: 5e3,
    // 重连间隔（毫秒）
    MAX_RECONNECT_COUNT: 5,
    // 最大重连次数
    HEARTBEAT_INTERVAL: 3e4,
    // 心跳间隔（毫秒）
    CONNECTION_TIMEOUT: 1e4
    // 连接超时时间（毫秒）
  };
  const config = {
    baseURL: APP_CONFIG.API_BASE_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    header: {
      "Content-Type": "application/json"
    }
  };
  formatAppLog("log", "at utils/request.js:15", "当前API基础URL:", config.baseURL);
  function requestInterceptor(options) {
    const token = uni.getStorageSync("token");
    if (token) {
      options.header = {
        ...options.header,
        "Authorization": `Bearer ${token}`
      };
    }
    if (options.url.indexOf("?") === -1) {
      options.url = `${options.url}?_t=${Date.now()}`;
    } else {
      options.url = `${options.url}&_t=${Date.now()}`;
    }
    return options;
  }
  function responseInterceptor(response) {
    var _a, _b;
    if (response.statusCode === 200 && (response.data.code === 0 || response.data.code === 200)) {
      return response.data.data;
    }
    const backendMessage = ((_a = response.data) == null ? void 0 : _a.message) || "请求失败";
    const error = new Error(backendMessage);
    error.statusCode = response.statusCode;
    error.code = (_b = response.data) == null ? void 0 : _b.code;
    if (response.statusCode === 401) {
      uni.removeStorageSync("token");
      uni.removeStorageSync("userInfo");
    }
    return Promise.reject(error);
  }
  function errorHandler(error) {
    if (error.errMsg && error.errMsg.indexOf("request:fail") !== -1) {
      uni.showToast({
        title: "网络连接失败，请检查网络设置",
        icon: "none"
      });
    } else {
      uni.showToast({
        title: error.message || "请求失败",
        icon: "none"
      });
    }
    return Promise.reject(error);
  }
  function request(options) {
    const mergedOptions = {
      ...config,
      ...options,
      header: {
        ...config.header,
        ...options.header || {}
      }
    };
    const interceptedOptions = requestInterceptor(mergedOptions);
    if (!interceptedOptions.url.startsWith("http")) {
      interceptedOptions.url = `${config.baseURL}${interceptedOptions.url.startsWith("/") ? "" : "/"}${interceptedOptions.url}`;
    }
    formatAppLog("log", "at utils/request.js:130", "发送请求:", interceptedOptions.url);
    return new Promise((resolve, reject) => {
      uni.request({
        ...interceptedOptions,
        success: (response) => {
          try {
            formatAppLog("log", "at utils/request.js:138", "请求成功:", interceptedOptions.url, response.statusCode);
            const result = responseInterceptor(response);
            resolve(result);
          } catch (error) {
            formatAppLog("error", "at utils/request.js:142", "响应处理错误:", error);
            reject(error);
          }
        },
        fail: (error) => {
          formatAppLog("error", "at utils/request.js:147", "请求失败:", interceptedOptions.url, error);
          errorHandler(error);
          reject(error);
        }
      });
    });
  }
  function get(url, params = {}, options = {}) {
    const queryString = Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
    const requestUrl = queryString ? `${url}?${queryString}` : url;
    formatAppLog("log", "at utils/request.js:171", "请求的url是什么？：", requestUrl);
    return request({
      url: requestUrl,
      method: "GET",
      ...options
    });
  }
  function post(url, data = {}, options = {}) {
    return request({
      url,
      method: "POST",
      data,
      ...options
    });
  }
  function put(url, data = {}, options = {}) {
    return request({
      url,
      method: "PUT",
      data,
      ...options
    });
  }
  function upload(url, filePath, name = "file", formData = {}, options = {}) {
    const token = uni.getStorageSync("token");
    const header = {
      ...config.header,
      "Content-Type": "multipart/form-data"
    };
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
    let fullUrl = url;
    if (!url.startsWith("http")) {
      fullUrl = `${config.baseURL}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    formatAppLog("log", "at utils/request.js:256", "上传文件请求:", fullUrl);
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: fullUrl,
        filePath,
        name,
        formData,
        header,
        success: (response) => {
          try {
            formatAppLog("log", "at utils/request.js:267", "上传文件成功:", response.statusCode);
            const data = JSON.parse(response.data);
            if (response.statusCode === 200 && data.code === 200) {
              resolve(data.data);
            } else {
              const error = new Error(data.message || `上传失败，状态码：${response.statusCode}`);
              error.statusCode = response.statusCode;
              error.code = data.code;
              reject(error);
            }
          } catch (error) {
            formatAppLog("error", "at utils/request.js:280", "解析上传响应失败:", error);
            reject(new Error("解析上传响应失败"));
          }
        },
        fail: (error) => {
          formatAppLog("error", "at utils/request.js:285", "上传文件失败:", error);
          errorHandler(error);
          reject(error);
        }
      });
    });
  }
  function getUnreadNotificationCount() {
    return get("/user/notifications/unread-count");
  }
  function getNotifications(params = {}) {
    return get("/user/notifications", params);
  }
  function markNotificationsAsRead$1(notificationIds) {
    return post("/user/notifications/read", { notification_ids: notificationIds });
  }
  function markAllNotificationsAsRead() {
    return post("/user/notifications/read-all");
  }
  function getSubscriptionNotifications(params = {}) {
    return get("notifications/subscriptions", params);
  }
  var isVue2 = false;
  function set(target, key, val) {
    if (Array.isArray(target)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val;
    }
    target[key] = val;
    return val;
  }
  function del(target, key) {
    if (Array.isArray(target)) {
      target.splice(key, 1);
      return;
    }
    delete target[key];
  }
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * pinia v2.1.7
   * (c) 2023 Eduardo San Martin Morote
   * @license MIT
   */
  let activePinia;
  const setActivePinia = (pinia) => activePinia = pinia;
  const getActivePinia = () => vue.hasInjectionContext() && vue.inject(piniaSymbol) || activePinia;
  const piniaSymbol = Symbol("pinia");
  function isPlainObject(o) {
    return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
  }
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const USE_DEVTOOLS = IS_CLIENT;
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    try {
      xhr.send();
    } catch (e) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a = document.createElement("a");
    a.download = name;
    a.rel = "noopener";
    if (typeof blob === "string") {
      a.href = blob;
      if (a.origin !== location.origin) {
        if (corsEnabled(a.href)) {
          download(blob, name, opts);
        } else {
          a.target = "_blank";
          click(a);
        }
      } else {
        click(a);
      }
    } else {
      a.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a.href);
      }, 4e4);
      setTimeout(function() {
        click(a);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a = document.createElement("a");
        a.href = blob;
        a.target = "_blank";
        setTimeout(function() {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url = reader.result;
        if (typeof url !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url;
        } else {
          location.assign(url);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url);
      else
        location.href = url;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o) {
    return "_a" in o && "install" in o;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error) {
    if (error instanceof Error && error.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia, JSON.parse(await navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalSaveState(pinia) {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia) {
    try {
      const open2 = getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  function loadStoresState(pinia, state) {
    for (const key in state) {
      const storeState = pinia.state.value[key];
      if (storeState) {
        Object.assign(storeState, state[key]);
      } else {
        pinia.state.value[key] = state[key];
      }
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree(store) {
    return isPinia(store) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store.$id,
      label: store.$id
    };
  }
  function formatStoreForInspectorState(store) {
    if (isPinia(store)) {
      const storeNames = Array.from(store._s.keys());
      const storeMap = store._s;
      const state2 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store2 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store2._getters.reduce((getters, key) => {
              getters[key] = store2[key];
              return getters;
            }, {})
          };
        })
      };
      return state2;
    }
    const state = {
      state: Object.keys(store.$state).map((key) => ({
        editable: true,
        key,
        value: store.$state[key]
      }))
    };
    if (store._getters && store._getters.length) {
      state.getters = store._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store[getterName]
      }));
    }
    if (store._customProperties.size) {
      state.customProperties = Array.from(store._customProperties).map((key) => ({
        editable: true,
        key,
        value: store[key]
      }));
    }
    return state;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID = "pinia:mutations";
  const INSPECTOR_ID = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api) => {
      if (typeof api.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api.addInspector({
        id: INSPECTOR_ID,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: 'Reset the state (with "$reset")',
            action: (nodeId) => {
              const store = pinia._s.get(nodeId);
              if (!store) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (typeof store.$reset !== "function") {
                toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
              } else {
                store.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store) => {
            payload.instanceData.state.push({
              type: getStoreType(store.$id),
              key: "state",
              editable: true,
              value: store._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store.$state).reduce((state, key) => {
                  state[key] = store.$state[key];
                  return state;
                }, {})
              )
            });
            if (store._getters && store._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store.$id),
                key: "getters",
                editable: false,
                value: store._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store[key];
                  } catch (error) {
                    getters[key] = error;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          let stores = [pinia];
          stores = stores.concat(Array.from(pinia._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store) => "$id" in store ? store.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
        }
      });
      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            payload.state = formatStoreForInspectorState(inspectedStore);
          }
        }
      });
      api.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store = pinia._s.get(storeId);
          if (!store) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store) {
    if (!componentStateTypes.includes(getStoreType(store.$id))) {
      componentStateTypes.push(getStoreType(store.$id));
    }
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api) => {
      const now2 = typeof api.now === "function" ? api.now.bind(api) : Date.now;
      store.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store.$id),
                action: formatDisplay(name),
                args,
                error
              },
              groupId
            }
          });
        });
      }, true);
      store._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store[name]), (newValue, oldValue) => {
          api.notifyComponentUpdate();
          api.sendInspectorState(INSPECTOR_ID);
          if (isTimelineActive) {
            api.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store.$subscribe(({ events, type }, state) => {
        api.notifyComponentUpdate();
        api.sendInspectorState(INSPECTOR_ID);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store._hotUpdate;
      store._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🔥 " + store.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
      });
      const { $dispose } = store;
      store.$dispose = () => {
        $dispose();
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.getSettings().logStoreChanges && toastMessage(`Disposed "${store.$id}" store 🗑`);
      };
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID);
      api.sendInspectorState(INSPECTOR_ID);
      api.getSettings().logStoreChanges && toastMessage(`"${store.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store, actionNames, wrapWithProxy) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = wrapWithProxy ? new Proxy(store, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        }) : store;
        activeAction = _actionId;
        const retValue = actions[actionName].apply(trackedStore, arguments);
        activeAction = void 0;
        return retValue;
      };
    }
  }
  function devtoolsPlugin({ app, store, options }) {
    if (store.$id.startsWith("__hot:")) {
      return;
    }
    store._isOptionsAPI = !!options.state;
    patchActionForGrouping(store, Object.keys(options.actions), store._isOptionsAPI);
    const originalHotUpdate = store._hotUpdate;
    vue.toRaw(store)._hotUpdate = function(newStore) {
      originalHotUpdate.apply(this, arguments);
      patchActionForGrouping(store, Object.keys(newStore._hmrPayload.actions), !!store._isOptionsAPI);
    };
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia = vue.markRaw({
      install(app) {
        setActivePinia(pinia);
        {
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state
    });
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
      pinia.use(devtoolsPlugin);
    }
    return pinia;
  }
  const isUseStore = (fn) => {
    return typeof fn === "function" && typeof fn.$id === "string";
  };
  function patchObject(newState, oldState) {
    for (const key in oldState) {
      const subPatch = oldState[key];
      if (!(key in newState)) {
        continue;
      }
      const targetValue = newState[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        newState[key] = patchObject(targetValue, subPatch);
      } else {
        {
          newState[key] = subPatch;
        }
      }
    }
    return newState;
  }
  function acceptHMRUpdate(initialUseStore, hot) {
    return (newModule) => {
      const pinia = hot.data.pinia || initialUseStore._pinia;
      if (!pinia) {
        return;
      }
      hot.data.pinia = pinia;
      for (const exportName in newModule) {
        const useStore = newModule[exportName];
        if (isUseStore(useStore) && pinia._s.has(useStore.$id)) {
          const id = useStore.$id;
          if (id !== initialUseStore.$id) {
            console.warn(`The id of the store changed from "${initialUseStore.$id}" to "${id}". Reloading.`);
            return hot.invalidate();
          }
          const existingStore = pinia._s.get(id);
          if (!existingStore) {
            console.log(`[Pinia]: skipping hmr because store doesn't exist yet`);
            return;
          }
          useStore(pinia, existingStore);
        }
      }
    };
  }
  const noop = () => {
  };
  function addSubscription$1(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription2 = () => {
      const idx = subscriptions.indexOf(callback);
      if (idx > -1) {
        subscriptions.splice(idx, 1);
        onCleanup();
      }
    };
    if (!detached && vue.getCurrentScope()) {
      vue.onScopeDispose(removeSubscription2);
    }
    return removeSubscription2;
  }
  function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
      callback(...args);
    });
  }
  const fallbackRunWithContext = (fn) => fn();
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    }
    if (target instanceof Set && patchToApply instanceof Set) {
      patchToApply.forEach(target.add, target);
    }
    for (const key in patchToApply) {
      if (!patchToApply.hasOwnProperty(key))
        continue;
      const subPatch = patchToApply[key];
      const targetValue = target[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function skipHydrate(obj) {
    return Object.defineProperty(obj, skipHydrateSymbol, {});
  }
  function shouldHydrate(obj) {
    return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
  }
  const { assign } = Object;
  function isComputed(o) {
    return !!(vue.isRef(o) && o.effect);
  }
  function createOptionsStore(id, options, pinia, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia.state.value[id];
    let store;
    function setup() {
      if (!initialState && !hot) {
        {
          pinia.state.value[id] = state ? state() : {};
        }
      }
      const localState = hot ? (
        // use ref() to unwrap refs inside state TODO: check if this is still necessary
        vue.toRefs(vue.ref(state ? state() : {}).value)
      ) : vue.toRefs(pinia.state.value[id]);
      return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (name in localState) {
          console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
        }
        computedGetters[name] = vue.markRaw(vue.computed(() => {
          setActivePinia(pinia);
          const store2 = pinia._s.get(id);
          return getters[name].call(store2, store2);
        }));
        return computedGetters;
      }, {}));
    }
    store = createSetupStore(id, setup, options, pinia, hot, true);
    return store;
  }
  function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = assign({ actions: {} }, options);
    if (!pinia._e.active) {
      throw new Error("Pinia destroyed");
    }
    const $subscribeOptions = {
      deep: true
      // flush: 'post',
    };
    {
      $subscribeOptions.onTrigger = (event) => {
        if (isListening) {
          debuggerEvents = event;
        } else if (isListening == false && !store._hotUpdating) {
          if (Array.isArray(debuggerEvents)) {
            debuggerEvents.push(event);
          } else {
            console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
          }
        }
      };
    }
    let isListening;
    let isSyncListening;
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia.state.value[$id];
    if (!isOptionsStore && !initialState && !hot) {
      {
        pinia.state.value[$id] = {};
      }
    }
    const hotState = vue.ref({});
    let activeListener;
    function $patch(partialStateOrMutator) {
      let subscriptionMutation;
      isListening = isSyncListening = false;
      {
        debuggerEvents = [];
      }
      if (typeof partialStateOrMutator === "function") {
        partialStateOrMutator(pinia.state.value[$id]);
        subscriptionMutation = {
          type: MutationType.patchFunction,
          storeId: $id,
          events: debuggerEvents
        };
      } else {
        mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
        subscriptionMutation = {
          type: MutationType.patchObject,
          payload: partialStateOrMutator,
          storeId: $id,
          events: debuggerEvents
        };
      }
      const myListenerId = activeListener = Symbol();
      vue.nextTick().then(() => {
        if (activeListener === myListenerId) {
          isListening = true;
        }
      });
      isSyncListening = true;
      triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
    }
    const $reset = isOptionsStore ? function $reset2() {
      const { state } = options;
      const newState = state ? state() : {};
      this.$patch(($state) => {
        assign($state, newState);
      });
    } : (
      /* istanbul ignore next */
      () => {
        throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
      }
    );
    function $dispose() {
      scope.stop();
      subscriptions = [];
      actionSubscriptions = [];
      pinia._s.delete($id);
    }
    function wrapAction(name, action) {
      return function() {
        setActivePinia(pinia);
        const args = Array.from(arguments);
        const afterCallbackList = [];
        const onErrorCallbackList = [];
        function after(callback) {
          afterCallbackList.push(callback);
        }
        function onError(callback) {
          onErrorCallbackList.push(callback);
        }
        triggerSubscriptions(actionSubscriptions, {
          args,
          name,
          store,
          after,
          onError
        });
        let ret;
        try {
          ret = action.apply(this && this.$id === $id ? this : store, args);
        } catch (error) {
          triggerSubscriptions(onErrorCallbackList, error);
          throw error;
        }
        if (ret instanceof Promise) {
          return ret.then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          }).catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
        }
        triggerSubscriptions(afterCallbackList, ret);
        return ret;
      };
    }
    const _hmrPayload = /* @__PURE__ */ vue.markRaw({
      actions: {},
      getters: {},
      state: [],
      hotState
    });
    const partialStore = {
      _p: pinia,
      // _s: scope,
      $id,
      $onAction: addSubscription$1.bind(null, actionSubscriptions),
      $patch,
      $reset,
      $subscribe(callback, options2 = {}) {
        const removeSubscription2 = addSubscription$1(subscriptions, callback, options2.detached, () => stopWatcher());
        const stopWatcher = scope.run(() => vue.watch(() => pinia.state.value[$id], (state) => {
          if (options2.flush === "sync" ? isSyncListening : isListening) {
            callback({
              storeId: $id,
              type: MutationType.direct,
              events: debuggerEvents
            }, state);
          }
        }, assign({}, $subscribeOptions, options2)));
        return removeSubscription2;
      },
      $dispose
    };
    const store = vue.reactive(assign(
      {
        _hmrPayload,
        _customProperties: vue.markRaw(/* @__PURE__ */ new Set())
        // devtools custom properties
      },
      partialStore
      // must be added later
      // setupStore
    ));
    pinia._s.set($id, store);
    const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
    const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(setup)));
    for (const key in setupStore) {
      const prop = setupStore[key];
      if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
        if (hot) {
          set(hotState.value, key, vue.toRef(setupStore, key));
        } else if (!isOptionsStore) {
          if (initialState && shouldHydrate(prop)) {
            if (vue.isRef(prop)) {
              prop.value = initialState[key];
            } else {
              mergeReactiveObjects(prop, initialState[key]);
            }
          }
          {
            pinia.state.value[$id][key] = prop;
          }
        }
        {
          _hmrPayload.state.push(key);
        }
      } else if (typeof prop === "function") {
        const actionValue = hot ? prop : wrapAction(key, prop);
        {
          setupStore[key] = actionValue;
        }
        {
          _hmrPayload.actions[key] = prop;
        }
        optionsForPlugin.actions[key] = prop;
      } else {
        if (isComputed(prop)) {
          _hmrPayload.getters[key] = isOptionsStore ? (
            // @ts-expect-error
            options.getters[key]
          ) : prop;
          if (IS_CLIENT) {
            const getters = setupStore._getters || // @ts-expect-error: same
            (setupStore._getters = vue.markRaw([]));
            getters.push(key);
          }
        }
      }
    }
    {
      assign(store, setupStore);
      assign(vue.toRaw(store), setupStore);
    }
    Object.defineProperty(store, "$state", {
      get: () => hot ? hotState.value : pinia.state.value[$id],
      set: (state) => {
        if (hot) {
          throw new Error("cannot set hotState");
        }
        $patch(($state) => {
          assign($state, state);
        });
      }
    });
    {
      store._hotUpdate = vue.markRaw((newStore) => {
        store._hotUpdating = true;
        newStore._hmrPayload.state.forEach((stateKey) => {
          if (stateKey in store.$state) {
            const newStateTarget = newStore.$state[stateKey];
            const oldStateSource = store.$state[stateKey];
            if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
              patchObject(newStateTarget, oldStateSource);
            } else {
              newStore.$state[stateKey] = oldStateSource;
            }
          }
          set(store, stateKey, vue.toRef(newStore.$state, stateKey));
        });
        Object.keys(store.$state).forEach((stateKey) => {
          if (!(stateKey in newStore.$state)) {
            del(store, stateKey);
          }
        });
        isListening = false;
        isSyncListening = false;
        pinia.state.value[$id] = vue.toRef(newStore._hmrPayload, "hotState");
        isSyncListening = true;
        vue.nextTick().then(() => {
          isListening = true;
        });
        for (const actionName in newStore._hmrPayload.actions) {
          const action = newStore[actionName];
          set(store, actionName, wrapAction(actionName, action));
        }
        for (const getterName in newStore._hmrPayload.getters) {
          const getter = newStore._hmrPayload.getters[getterName];
          const getterValue = isOptionsStore ? (
            // special handling of options api
            vue.computed(() => {
              setActivePinia(pinia);
              return getter.call(store, store);
            })
          ) : getter;
          set(store, getterName, getterValue);
        }
        Object.keys(store._hmrPayload.getters).forEach((key) => {
          if (!(key in newStore._hmrPayload.getters)) {
            del(store, key);
          }
        });
        Object.keys(store._hmrPayload.actions).forEach((key) => {
          if (!(key in newStore._hmrPayload.actions)) {
            del(store, key);
          }
        });
        store._hmrPayload = newStore._hmrPayload;
        store._getters = newStore._getters;
        store._hotUpdating = false;
      });
    }
    if (USE_DEVTOOLS) {
      const nonEnumerable = {
        writable: true,
        configurable: true,
        // avoid warning on devtools trying to display this property
        enumerable: false
      };
      ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p) => {
        Object.defineProperty(store, p, assign({ value: store[p] }, nonEnumerable));
      });
    }
    pinia._p.forEach((extender) => {
      if (USE_DEVTOOLS) {
        const extensions = scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        }));
        Object.keys(extensions || {}).forEach((key) => store._customProperties.add(key));
        assign(store, extensions);
      } else {
        assign(store, scope.run(() => extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        })));
      }
    });
    if (store.$state && typeof store.$state === "object" && typeof store.$state.constructor === "function" && !store.$state.constructor.toString().includes("[native code]")) {
      console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store.$id}".`);
    }
    if (initialState && isOptionsStore && options.hydrate) {
      options.hydrate(store.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store;
  }
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    if (typeof idOrOptions === "string") {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    } else {
      options = idOrOptions;
      id = idOrOptions.id;
      if (typeof id !== "string") {
        throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
      }
    }
    function useStore(pinia, hot) {
      const hasContext = vue.hasInjectionContext();
      pinia = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      pinia || (hasContext ? vue.inject(piniaSymbol, null) : null);
      if (pinia)
        setActivePinia(pinia);
      if (!activePinia) {
        throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
      }
      pinia = activePinia;
      if (!pinia._s.has(id)) {
        if (isSetupStore) {
          createSetupStore(id, setup, options, pinia);
        } else {
          createOptionsStore(id, options, pinia);
        }
        {
          useStore._pinia = pinia;
        }
      }
      const store = pinia._s.get(id);
      if (hot) {
        const hotId = "__hot:" + id;
        const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
        hot._hotUpdate(newStore);
        delete pinia.state.value[hotId];
        pinia._s.delete(hotId);
      }
      if (IS_CLIENT) {
        const currentInstance = vue.getCurrentInstance();
        if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
        !hot) {
          const vm = currentInstance.proxy;
          const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
          cache[id] = store;
        }
      }
      return store;
    }
    useStore.$id = id;
    return useStore;
  }
  let mapStoreSuffix = "Store";
  function setMapStoreSuffix(suffix) {
    mapStoreSuffix = suffix;
  }
  function mapStores(...stores) {
    if (Array.isArray(stores[0])) {
      console.warn(`[🍍]: Directly pass all stores to "mapStores()" without putting them in an array:
Replace
	mapStores([useAuthStore, useCartStore])
with
	mapStores(useAuthStore, useCartStore)
This will fail in production if not fixed.`);
      stores = stores[0];
    }
    return stores.reduce((reduced, useStore) => {
      reduced[useStore.$id + mapStoreSuffix] = function() {
        return useStore(this.$pinia);
      };
      return reduced;
    }, {});
  }
  function mapState(useStore, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = function() {
        return useStore(this.$pinia)[key];
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = function() {
        const store = useStore(this.$pinia);
        const storeKey = keysOrMapper[key];
        return typeof storeKey === "function" ? storeKey.call(this, store) : store[storeKey];
      };
      return reduced;
    }, {});
  }
  const mapGetters = mapState;
  function mapActions(useStore, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = function(...args) {
        return useStore(this.$pinia)[key](...args);
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = function(...args) {
        return useStore(this.$pinia)[keysOrMapper[key]](...args);
      };
      return reduced;
    }, {});
  }
  function mapWritableState(useStore, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = {
        get() {
          return useStore(this.$pinia)[key];
        },
        set(value) {
          return useStore(this.$pinia)[key] = value;
        }
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = {
        get() {
          return useStore(this.$pinia)[keysOrMapper[key]];
        },
        set(value) {
          return useStore(this.$pinia)[keysOrMapper[key]] = value;
        }
      };
      return reduced;
    }, {});
  }
  function storeToRefs(store) {
    {
      store = vue.toRaw(store);
      const refs = {};
      for (const key in store) {
        const value = store[key];
        if (vue.isRef(value) || vue.isReactive(value)) {
          refs[key] = // ---
          vue.toRef(store, key);
        }
      }
      return refs;
    }
  }
  const PiniaVuePlugin = function(_Vue) {
    _Vue.mixin({
      beforeCreate() {
        const options = this.$options;
        if (options.pinia) {
          const pinia = options.pinia;
          if (!this._provided) {
            const provideCache = {};
            Object.defineProperty(this, "_provided", {
              get: () => provideCache,
              set: (v) => Object.assign(provideCache, v)
            });
          }
          this._provided[piniaSymbol] = pinia;
          if (!this.$pinia) {
            this.$pinia = pinia;
          }
          pinia._a = this;
          if (IS_CLIENT) {
            setActivePinia(pinia);
          }
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(pinia._a, pinia);
          }
        } else if (!this.$pinia && options.parent && options.parent.$pinia) {
          this.$pinia = options.parent.$pinia;
        }
      },
      destroyed() {
        delete this._pStores;
      }
    });
  };
  const Pinia = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    get MutationType() {
      return MutationType;
    },
    PiniaVuePlugin,
    acceptHMRUpdate,
    createPinia,
    defineStore,
    getActivePinia,
    mapActions,
    mapGetters,
    mapState,
    mapStores,
    mapWritableState,
    setActivePinia,
    setMapStoreSuffix,
    skipHydrate,
    storeToRefs
  }, Symbol.toStringTag, { value: "Module" }));
  const useUserStore$1 = defineStore("user", {
    state: () => ({
      token: "",
      userInfo: null
    }),
    getters: {
      hasLogin() {
        return !!this.token && !!this.userInfo;
      },
      userId() {
        return this.userInfo ? this.userInfo.id : null;
      },
      userRole() {
        return this.userInfo ? this.userInfo.role : null;
      }
    },
    actions: {
      // 检查登录状态
      async checkLoginStatus() {
        try {
          const token = uni.getStorageSync("token");
          const userInfo = uni.getStorageSync("userInfo");
          if (token && userInfo) {
            this.token = token;
            this.userInfo = userInfo;
            formatAppLog("log", "at store/user.js:35", "恢复登录状态:", userInfo);
          } else {
            formatAppLog("log", "at store/user.js:48", "用户未登录");
            this.token = "";
            this.userInfo = null;
          }
        } catch (error) {
          formatAppLog("error", "at store/user.js:54", "检查登录状态失败:", error);
          this.token = "";
          this.userInfo = null;
        }
      },
      // 登录
      async login(credentials) {
        formatAppLog("log", "at store/user.js:63", "到底有没有执行");
        try {
          const response = await post("/users/login", credentials);
          this.token = response.token;
          this.userInfo = response.user;
          uni.setStorageSync("token", response.token);
          uni.setStorageSync("userInfo", response.user);
          formatAppLog("log", "at store/user.js:76", "登录成功:", response.user);
          return response;
        } catch (error) {
          formatAppLog("error", "at store/user.js:79", "登录失败111:", error);
          throw error;
        }
      },
      // 注册
      async register(userData) {
        try {
          const response = await post("/users/register", userData);
          this.token = response.token;
          this.userInfo = response.user;
          uni.setStorageSync("token", response.token);
          uni.setStorageSync("userInfo", response.user);
          formatAppLog("log", "at store/user.js:97", "注册成功:", response.user);
          return response;
        } catch (error) {
          formatAppLog("error", "at store/user.js:100", "注册失败:", error);
          throw error;
        }
      },
      // 获取用户信息
      async getUserInfo() {
        try {
          const response = await get("/users/profile");
          this.userInfo = response;
          uni.setStorageSync("userInfo", response);
          formatAppLog("log", "at store/user.js:114", "获取用户信息成功:", response);
          return response;
        } catch (error) {
          formatAppLog("error", "at store/user.js:117", "获取用户信息失败:", error);
          throw error;
        }
      },
      // 更新用户信息
      async updateUserInfo(userData) {
        try {
          const response = await put("/users/profile", userData);
          this.userInfo = response;
          uni.setStorageSync("userInfo", response);
          formatAppLog("log", "at store/user.js:131", "更新用户信息成功:", response);
          return response;
        } catch (error) {
          formatAppLog("error", "at store/user.js:134", "更新用户信息失败:", error);
          throw error;
        }
      },
      // 登出
      logout() {
        this.token = "";
        this.userInfo = null;
        uni.removeStorageSync("token");
        uni.removeStorageSync("userInfo");
        formatAppLog("log", "at store/user.js:148", "用户已登出");
      },
      // 修改密码
      async changePassword(passwordData) {
        try {
          const response = await post("/users/change-password", passwordData);
          formatAppLog("log", "at store/user.js:155", "密码修改成功");
          return response;
        } catch (error) {
          formatAppLog("error", "at store/user.js:158", "密码修改失败:", error);
          throw error;
        }
      },
      async getmybidslist(resquestParams) {
        try {
          const response = await get("/user/bids", resquestParams);
          return response;
        } catch (error) {
          formatAppLog("error", "at store/user.js:169", "获取投标列表失败:", error);
          throw error;
        }
      }
    }
  });
  const LOGIN_REQUIRED_PAGES = [
    "/pages/projects/publish",
    "/pages/projects/category-select",
    "/pages/user/index",
    "/pages/user/projects",
    "/pages/user/orders",
    "/pages/messages/index",
    "/pages/messages/chat",
    "/pages/orders/index",
    "/pages/orders/detail",
    "/pages/notifications/index",
    "/pages/user/verify",
    "/pages/user/settings"
    // ... 添加其他需要登录的页面路径
  ];
  const LOGIN_PAGE = "/pages/login/index";
  const navigateToWithLoginCheck = (options, forceLoginCheck = false) => {
    const userStore = useUserStore$1();
    const targetPath = options.url.split("?")[0];
    if (LOGIN_REQUIRED_PAGES.includes(targetPath) || forceLoginCheck) {
      if (!userStore.hasLogin) {
        formatAppLog("log", "at config/routeGuard.js:39", `[路由守卫] 尝试访问 ${targetPath}，但用户未登录，重定向到登录页`);
        uni.navigateTo({ url: `${LOGIN_PAGE}?redirect=${encodeURIComponent(options.url)}` });
        return Promise.resolve();
      } else {
        formatAppLog("log", "at config/routeGuard.js:47", `[路由守卫] 用户已登录，允许访问 ${targetPath}`);
        return uni.navigateTo(options);
      }
    } else {
      formatAppLog("log", "at config/routeGuard.js:52", `[路由守卫] 页面 ${targetPath} 不在受保护列表中，直接跳转`);
      return uni.navigateTo(options);
    }
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$w = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const currentTime = vue.ref("00:00");
      const updateTime = () => {
        const now2 = /* @__PURE__ */ new Date();
        const hours = now2.getHours().toString().padStart(2, "0");
        const minutes = now2.getMinutes().toString().padStart(2, "0");
        currentTime.value = `${hours}:${minutes}`;
      };
      const categories = vue.ref([
        { id: 1, name: "工业标单", icon: "/static/icons/industry.jpg" },
        { id: 2, name: "餐饮美食", icon: "/static/icons/food.jpg" },
        { id: 3, name: "休闲娱乐", icon: "/static/icons/recreation.jpg" },
        { id: 4, name: "手机电脑", icon: "/static/icons/computer.png" },
        { id: 5, name: "家电需求", icon: "/static/icons/appliances.png" },
        { id: 6, name: "家居需求", icon: "/static/icons/fitting.png" },
        { id: 7, name: "汽车需求", icon: "/static/icons/car.jpg" },
        { id: 8, name: "房产需求", icon: "/static/icons/house.jpg" },
        { id: 9, name: "服装鞋帽", icon: "/static/icons/clothing.jpg" },
        { id: 10, name: "家装装修", icon: "/static/icons/decoration.jpg" },
        { id: 11, name: "生活服务", icon: "/static/icons/Live.png" },
        { id: 12, name: "二手物品", icon: "/static/icons/secondhand.png" },
        { id: 13, name: "人力服务", icon: "/static/icons/hr.png" },
        { id: 14, name: "医疗就医", icon: "/static/icons/Health.jpg" },
        { id: 15, name: "艺术奢饰", icon: "/static/icons/zuan.png" },
        { id: 16, name: "交友相亲", icon: "/static/icons/love.jpg" }
      ]);
      const unreadNotifications = vue.ref(0);
      let notificationTimer = null;
      let timeUpdateTimer = null;
      const getUnreadNotifications = async () => {
        if (!userStore.hasLogin)
          return;
        try {
          const response = await getUnreadNotificationCount();
          let count = 0;
          if (response && response.code === 0 && response.data) {
            count = response.data.count || 0;
          } else if (typeof response === "number") {
            count = response;
          } else if (response && typeof response.count === "number") {
            count = response.count;
          }
          if (count > unreadNotifications.value && unreadNotifications.value !== 0) {
            playNotificationSound2();
            vibrateDevice();
          }
          unreadNotifications.value = count;
        } catch (error) {
          formatAppLog("error", "at pages/home/index.vue:118", "获取未读通知数量失败:", error);
        }
      };
      const playNotificationSound2 = () => {
        const innerAudioContext = uni.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        innerAudioContext.src = "/static/sounds/notification.mp3";
        innerAudioContext.onError((res) => {
          formatAppLog("error", "at pages/home/index.vue:129", "播放通知提示音失败:", res);
        });
      };
      const vibrateDevice = () => {
        try {
          if (typeof uni.vibrate === "function") {
            uni.vibrate({
              success: function() {
                formatAppLog("log", "at pages/home/index.vue:140", "震动成功");
              },
              fail: function(err) {
                formatAppLog("log", "at pages/home/index.vue:143", "震动失败", err);
                try {
                  if (typeof uni.vibrateLong === "function") {
                    uni.vibrateLong({
                      fail: (err2) => formatAppLog("log", "at pages/home/index.vue:148", "长震动也失败", err2)
                    });
                  }
                } catch (e) {
                  formatAppLog("log", "at pages/home/index.vue:152", "长震动异常", e);
                }
              }
            });
          } else {
            formatAppLog("log", "at pages/home/index.vue:158", "vibrate 方法不存在，尝试使用 vibrateLong");
            if (typeof uni.vibrateLong === "function") {
              uni.vibrateLong({
                fail: (err) => formatAppLog("log", "at pages/home/index.vue:161", "长震动失败", err)
              });
            } else {
              formatAppLog("log", "at pages/home/index.vue:164", "设备不支持震动功能");
            }
          }
        } catch (error) {
          formatAppLog("log", "at pages/home/index.vue:168", "震动功能异常", error);
        }
      };
      const goToUserCenter = () => {
        uni.navigateTo({
          url: "/pages/user/index"
        });
      };
      const selectCategory = (category) => {
        try {
          uni.setStorageSync("selectedMainCategory", category);
        } catch (e) {
          formatAppLog("error", "at pages/home/index.vue:189", "保存分类信息失败:", e);
        }
        navigateToWithLoginCheck({
          url: `/pages/projects/category-select?mainCategoryId=${category.id}&mainCategoryName=${encodeURIComponent(category.name)}&comfrom=projects`
        });
      };
      vue.onMounted(() => {
        updateTime();
        getUnreadNotifications();
      });
      onShow(() => {
        updateTime();
        getUnreadNotifications();
        try {
          plus.navigator.setFullscreen(true);
        } catch (e) {
          formatAppLog("log", "at pages/home/index.vue:227", "设置全屏失败", e);
        }
      });
      onUnload(() => {
        if (notificationTimer) {
          clearInterval(notificationTimer);
        }
        if (timeUpdateTimer) {
          clearInterval(timeUpdateTimer);
        }
        try {
          plus.navigator.setFullscreen(false);
        } catch (e) {
          formatAppLog("log", "at pages/home/index.vue:244", "退出全屏失败", e);
        }
      });
      const __returned__ = { userStore, currentTime, updateTime, categories, unreadNotifications, get notificationTimer() {
        return notificationTimer;
      }, set notificationTimer(v) {
        notificationTimer = v;
      }, get timeUpdateTimer() {
        return timeUpdateTimer;
      }, set timeUpdateTimer(v) {
        timeUpdateTimer = v;
      }, getUnreadNotifications, playNotificationSound: playNotificationSound2, vibrateDevice, goToUserCenter, selectCategory, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get onShow() {
        return onShow;
      }, get onUnload() {
        return onUnload;
      }, get getUnreadNotificationCount() {
        return getUnreadNotificationCount;
      }, get useUserStore() {
        return useUserStore$1;
      }, get navigateToWithLoginCheck() {
        return navigateToWithLoginCheck;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$w(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "home-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-top" }, [
          vue.createElementVNode("view", { class: "logo" }, [
            vue.createTextVNode("需求直"),
            vue.createElementVNode("b", { style: { "color": "rebeccapurple" } }, "发"),
            vue.createTextVNode("！")
          ]),
          vue.createElementVNode("view", { class: "header-actions" }, [
            vue.createElementVNode("view", { class: "gradient-text" }, "速效直达 没有中间商！")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "main-content" }, [
        vue.createElementVNode("view", { class: "categories-section fade-in-up" }, [
          vue.createElementVNode("view", { class: "categories-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.categories, (category) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: category.id,
                  class: "category-card",
                  onClick: ($event) => $setup.selectCategory(category)
                }, [
                  vue.createElementVNode("view", { class: "category-icon" }, [
                    vue.createElementVNode("image", {
                      src: category.icon,
                      mode: "aspectFit",
                      class: "category-icon"
                    }, null, 8, ["src"])
                  ]),
                  vue.createElementVNode(
                    "view",
                    { class: "category-title" },
                    vue.toDisplayString(category.name),
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])
    ]);
  }
  const PagesHomeIndex = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["render", _sfc_render$w], ["__scopeId", "data-v-4978fed5"], ["__file", "F:/new/success/uniappandroid/pages/home/index.vue"]]);
  const useMessageStore = defineStore("message", {
    state: () => ({
      chatList: [],
      notifications: [],
      unreadChatCount: 0,
      unreadNotificationCount: 0
    }),
    getters: {
      totalUnreadCount() {
        return this.unreadChatCount + this.unreadNotificationCount;
      }
    },
    actions: {
      // 创建或获取聊天会话
      async createChat(targetUserId, options = {}) {
        try {
          const requestData = {
            target_user_id: targetUserId
          };
          if (options.projectId) {
            requestData.project_id = Number(options.projectId);
          }
          if (options.bidId) {
            requestData.bid_id = Number(options.bidId);
          }
          const res = await post("/chats", requestData);
          return {
            id: res.chat_id || res.id,
            targetUserId,
            ...res
          };
        } catch (error) {
          formatAppLog("error", "at store/message.js:50", "创建聊天会话失败:", error);
          throw error;
        }
      },
      // 获取聊天列表
      async getChatList() {
        try {
          const data = await get("/chats");
          formatAppLog("log", "at store/message.js:61", "获取聊天列表成功:", data);
          this.setChatList(Array.isArray(data) ? data : []);
          this.updateUnreadChatCount();
          return data;
        } catch (error) {
          formatAppLog("error", "at store/message.js:67", "获取聊天列表失败:", error);
          throw error;
        }
      },
      // 获取通知列表
      async getNotifications(params = { page: 1, size: 20 }) {
        try {
          const response = await getNotifications(params);
          formatAppLog("log", "at store/message.js:78", "获取通知列表成功:", response);
          let notificationData = [];
          if (response && response.list) {
            notificationData = response.list || [];
          } else if (response && response.code === 0 && response.data) {
            notificationData = response.data.list || [];
          } else if (Array.isArray(response)) {
            notificationData = response;
          }
          formatAppLog("log", "at store/message.js:93", "提取的通知数据:", notificationData);
          this.setNotifications(notificationData);
          this.updateUnreadNotificationCount();
          return notificationData;
        } catch (error) {
          formatAppLog("error", "at store/message.js:99", "获取通知列表失败:", error);
          throw error;
        }
      },
      // 获取聊天记录
      async getChatMessages(chatId, beforeId = null) {
        try {
          let url = `/chats/${chatId}/messages`;
          if (beforeId) {
            url += `?before_id=${beforeId}`;
          }
          const res = await get(url);
          return res;
        } catch (error) {
          formatAppLog("error", "at store/message.js:114", "获取聊天记录失败:", error);
          throw error;
        }
      },
      // 发送消息
      async sendMessage(chatId, messageData) {
        try {
          formatAppLog("log", "at store/message.js:125", "发送消息到聊天:", chatId, messageData);
          if (isSocketConnected()) {
            formatAppLog("log", "at store/message.js:129", "使用WebSocket发送消息");
            const socketMessage = {
              type: "send_message",
              data: {
                chat_id: chatId,
                content: messageData.content,
                content_type: messageData.content_type || 0
              }
            };
            formatAppLog("log", "at store/message.js:139", "发送了什么消息？", socketMessage);
            const success = sendSocketMessage(socketMessage);
            if (success) {
              formatAppLog("log", "at store/message.js:143", "WebSocket消息发送成功");
              return {
                id: Date.now(),
                chat_id: chatId,
                ...messageData,
                created_at: (/* @__PURE__ */ new Date()).toISOString()
              };
            } else {
              formatAppLog("warn", "at store/message.js:152", "WebSocket发送失败，回退到HTTP请求");
            }
          } else {
            formatAppLog("warn", "at store/message.js:155", "WebSocket未连接，使用HTTP请求发送消息");
          }
          const res = await post(`/chats/${chatId}/messages`, messageData);
          formatAppLog("log", "at store/message.js:160", "HTTP消息发送成功:", res);
          return res;
        } catch (error) {
          formatAppLog("error", "at store/message.js:165", "发送消息失败:", error);
          throw error;
        }
      },
      // 标记消息为已读
      async readMessage(userId) {
        try {
          const result = await post(`/messages/read/${userId}`);
          const chatList = [...this.chatList];
          const chatIndex = chatList.findIndex((chat) => chat.user_id === userId);
          if (chatIndex !== -1) {
            chatList[chatIndex].unread_count = 0;
            this.setChatList(chatList);
            this.updateUnreadChatCount();
          }
          return result;
        } catch (error) {
          formatAppLog("error", "at store/message.js:188", "标记消息已读失败:", error);
          throw error;
        }
      },
      // 标记通知为已读
      async readNotification(notificationIds) {
        try {
          const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
          const result = await markNotificationsAsRead$1(ids);
          const notifications = [...this.notifications];
          ids.forEach((id) => {
            const notificationIndex = notifications.findIndex((notification) => notification.id === id);
            if (notificationIndex !== -1) {
              notifications[notificationIndex].is_read = true;
            }
          });
          this.setNotifications(notifications);
          this.updateUnreadNotificationCount();
          return result;
        } catch (error) {
          formatAppLog("error", "at store/message.js:216", "标记通知已读失败:", error);
          throw error;
        }
      },
      // 标记所有通知为已读
      async readAllNotifications() {
        try {
          const result = await markAllNotificationsAsRead();
          const notifications = this.notifications.map((notification) => ({
            ...notification,
            is_read: true
          }));
          this.setNotifications(notifications);
          this.updateUnreadNotificationCount();
          return result;
        } catch (error) {
          formatAppLog("error", "at store/message.js:238", "标记所有通知已读失败:", error);
          throw error;
        }
      },
      // 获取未读通知数量
      async fetchUnreadNotificationCount() {
        try {
          const response = await getUnreadNotificationCount();
          let count = 0;
          if (response && response.code === 0 && response.data) {
            count = response.data.count || 0;
          } else if (typeof response === "number") {
            count = response;
          } else if (response && typeof response.count === "number") {
            count = response.count;
          }
          this.unreadNotificationCount = count;
          return count;
        } catch (error) {
          formatAppLog("error", "at store/message.js:262", "获取未读通知数量失败:", error);
          return 0;
        }
      },
      // 处理新消息（WebSocket推送）
      updateChatWithNewMessage(data) {
        const { chat_id, message } = data;
        const chatList = [...this.chatList];
        const chatIndex = chatList.findIndex((chat) => chat.id === chat_id);
        if (chatIndex !== -1) {
          chatList[chatIndex] = {
            ...chatList[chatIndex],
            last_message: message.content,
            last_time: message.created_at,
            unread_count: (chatList[chatIndex].unread_count || 0) + 1
          };
          const updatedChat = chatList.splice(chatIndex, 1)[0];
          chatList.unshift(updatedChat);
        } else {
          chatList.unshift({
            id: chat_id,
            target_user: {
              id: message.sender_id,
              username: `用户${message.sender_id}`,
              avatar: ""
            },
            last_message: message.content,
            last_time: message.created_at,
            unread_count: 1
          });
        }
        this.setChatList(chatList);
        this.updateUnreadChatCount();
      },
      // 处理新通知（WebSocket推送）
      addNotification(notification) {
        const existingIndex = this.notifications.findIndex((n) => n.id === notification.id);
        if (existingIndex === -1) {
          const notifications = [notification, ...this.notifications];
          this.setNotifications(notifications);
          this.updateUnreadNotificationCount();
        }
      },
      // 更新聊天列表
      updateChatList(userId, lastMessage) {
        const chatList = [...this.chatList];
        const chatIndex = chatList.findIndex((chat) => chat.user_id === userId);
        if (chatIndex !== -1) {
          chatList[chatIndex] = {
            ...chatList[chatIndex],
            last_message: lastMessage,
            last_time: (/* @__PURE__ */ new Date()).toISOString()
          };
        } else {
          chatList.unshift({
            id: Date.now(),
            user_id: userId,
            username: `用户${userId}`,
            avatar: "https://via.placeholder.com/100",
            last_message: lastMessage,
            last_time: (/* @__PURE__ */ new Date()).toISOString(),
            unread_count: 0
          });
        }
        chatList.sort((a, b) => new Date(b.last_time) - new Date(a.last_time));
        this.setChatList(chatList);
      },
      // 设置聊天列表
      setChatList(chatList) {
        this.chatList = chatList;
      },
      // 设置通知列表
      setNotifications(notifications) {
        this.notifications = notifications;
      },
      // 更新未读聊天数
      updateUnreadChatCount() {
        this.unreadChatCount = this.chatList.reduce((count, chat) => count + (chat.unread_count || 0), 0);
      },
      // 更新未读通知数
      updateUnreadNotificationCount() {
        this.unreadNotificationCount = this.notifications.filter((notification) => !notification.is_read).length;
      }
    }
  });
  function getPublisherBids(params = {}) {
    return get("/publisher/bids", params);
  }
  function getUserBids(params = {}) {
    return get("/api/user/bids", params);
  }
  function getProjectBids(projectId, params = {}) {
    return get(`/projects/${projectId}/bids`, params);
  }
  function submitBid(projectId, bidData) {
    return post(`/projects/${projectId}/bids`, bidData);
  }
  function selectBid(bidId, data = {}) {
    return post(`/bids/${bidId}/select`, data);
  }
  function cancelBid(bidId) {
    return post(`/bids/${bidId}/cancel`);
  }
  function updateBid(bidId, bidData) {
    return post(`/bids/${bidId}/update`, bidData);
  }
  const useProjectStore = defineStore("project", {
    state: () => ({
      projectList: [],
      currentProject: null,
      totalCount: 0,
      loading: false
    }),
    actions: {
      // 获取项目列表
      async getProjectList(params = {}) {
        try {
          this.loading = true;
          const res = await get("/projects", params);
          this.setProjectList(res.list || []);
          this.setTotalCount(res.total || 0);
          return res;
        } catch (error) {
          formatAppLog("error", "at store/project.js:33", "获取项目列表失败:", error);
          throw error;
        } finally {
          this.loading = false;
        }
      },
      // 获取项目详情
      async getProjectDetail(id) {
        try {
          const project = await get(`/projects/${id}`);
          this.setCurrentProject(project);
          return project;
        } catch (error) {
          formatAppLog("error", "at store/project.js:47", "获取项目详情失败:", error);
          throw error;
        }
      },
      // 获取项目投标列表
      async getBidList(projectId) {
        try {
          const res = await getProjectBids(projectId);
          formatAppLog("log", "at store/project.js:58", "获取项目投标列表:", res);
          return res;
        } catch (error) {
          formatAppLog("error", "at store/project.js:61", "获取投标列表失败:", error);
          throw error;
        }
      },
      // 获取用户投标列表
      async getUserBids(params = {}) {
        var _a;
        try {
          const userStore = useUserStore$1();
          if (!params.user_id && ((_a = userStore == null ? void 0 : userStore.userInfo) == null ? void 0 : _a.id)) {
            params.user_id = userStore.userInfo.id;
          }
          const res = await getUserBids(params);
          formatAppLog("log", "at store/project.js:79", "获取用户投标列表:", res);
          return res;
        } catch (error) {
          formatAppLog("error", "at store/project.js:82", "获取用户投标列表失败:", error);
          throw error;
        }
      },
      // 获取发布者的项目投标列表
      async getPublisherBids(params = {}) {
        try {
          const res = await getPublisherBids(params);
          formatAppLog("log", "at store/project.js:93", "获取发布者投标列表:", res);
          return res;
        } catch (error) {
          formatAppLog("error", "at store/project.js:96", "获取发布者投标列表失败:", error);
          throw error;
        }
      },
      // 发布项目
      async publishProject(projectData) {
        try {
          const project = await post("/projects/", projectData);
          return project;
        } catch (error) {
          formatAppLog("error", "at store/project.js:110", "发布项目失败:", error);
          throw error;
        }
      },
      // 提交投标
      async submitBid(projectId, bidData) {
        try {
          const bid = await submitBid(projectId, bidData);
          return bid;
        } catch (error) {
          formatAppLog("error", "at store/project.js:123", "提交投标失败:", error);
          throw error;
        }
      },
      // 选择投标 projectId, , { project_id: projectId }
      async selectBid(bidId) {
        try {
          const result = await selectBid(bidId);
          return { success: true };
        } catch (error) {
          formatAppLog("error", "at store/project.js:136", "选择投标失败:", error);
          throw error;
        }
      },
      // 取消项目
      async cancelProject(projectId) {
        try {
          const result = await post(`/projects/${projectId}/cancel`, {});
          return { success: true };
        } catch (error) {
          formatAppLog("error", "at store/project.js:147", "取消项目失败:", error);
          throw error;
        }
      },
      // 完成项目
      async completeProject(projectId) {
        try {
          const result = await post(`/projects/${projectId}/complete`, {});
          return { success: true };
        } catch (error) {
          formatAppLog("error", "at store/project.js:158", "完成项目失败:", error);
          throw error;
        }
      },
      // 设置项目列表
      setProjectList(list) {
        this.projectList = list;
      },
      // 设置当前项目
      setCurrentProject(project) {
        this.currentProject = project;
      },
      // 设置总数
      setTotalCount(count) {
        this.totalCount = count;
      }
    }
  });
  const SOUND_FILES = {
    DEFAULT: "/static/sounds/notification.mp3",
    IMPORTANT: "/static/sounds/notification.mp3"
    // 可以根据需要添加不同的声音文件
  };
  function triggerShortVibration() {
    try {
      if (uni.getSystemInfoSync().platform === "android") {
        uni.vibrateShort({
          success: () => {
            formatAppLog("log", "at utils/notificationUtils.js:20", "震动提醒触发成功");
          },
          fail: (error) => {
            formatAppLog("error", "at utils/notificationUtils.js:23", "震动提醒触发失败:", error);
          }
        });
        return true;
      } else {
        formatAppLog("log", "at utils/notificationUtils.js:28", "非安卓平台，不触发震动提醒");
        return false;
      }
    } catch (error) {
      formatAppLog("error", "at utils/notificationUtils.js:32", "触发震动时发生错误:", error);
      return false;
    }
  }
  function triggerLongVibration() {
    try {
      if (uni.getSystemInfoSync().platform === "android") {
        uni.vibrateLong({
          success: () => {
            formatAppLog("log", "at utils/notificationUtils.js:48", "长震动提醒触发成功");
          },
          fail: (error) => {
            formatAppLog("error", "at utils/notificationUtils.js:51", "长震动提醒触发失败:", error);
          }
        });
        return true;
      } else {
        formatAppLog("log", "at utils/notificationUtils.js:56", "非安卓平台，不触发震动提醒");
        return false;
      }
    } catch (error) {
      formatAppLog("error", "at utils/notificationUtils.js:60", "触发长震动时发生错误:", error);
      return false;
    }
  }
  function triggerVibrationByType(messageType) {
    switch (messageType) {
      case "bid_accepted":
      case "bid_won":
        return triggerLongVibration();
      case "new_message":
      case "new_bid":
      case "project_update":
      default:
        return triggerShortVibration();
    }
  }
  function playNotificationSound(soundType = "DEFAULT") {
    try {
      if (uni.getSystemInfoSync().platform === "android") {
        const innerAudioContext = uni.createInnerAudioContext();
        innerAudioContext.src = SOUND_FILES[soundType] || SOUND_FILES.DEFAULT;
        innerAudioContext.onEnded(() => {
          innerAudioContext.destroy();
          formatAppLog("log", "at utils/notificationUtils.js:101", "通知声音播放完成");
        });
        innerAudioContext.onError((error) => {
          formatAppLog("error", "at utils/notificationUtils.js:106", "播放通知声音失败:", error);
          innerAudioContext.destroy();
        });
        innerAudioContext.play();
        formatAppLog("log", "at utils/notificationUtils.js:112", "通知声音开始播放");
        return true;
      } else {
        formatAppLog("log", "at utils/notificationUtils.js:115", "非安卓平台，不播放通知声音");
        return false;
      }
    } catch (error) {
      formatAppLog("error", "at utils/notificationUtils.js:119", "播放通知声音时发生错误:", error);
      return false;
    }
  }
  function playSoundByType(messageType) {
    switch (messageType) {
      case "bid_accepted":
      case "bid_won":
        return playNotificationSound("IMPORTANT");
      case "new_message":
      case "new_bid":
      case "project_update":
      default:
        return playNotificationSound("DEFAULT");
    }
  }
  function triggerNotification(messageType) {
    triggerVibrationByType(messageType);
    playSoundByType(messageType);
  }
  let socket = null;
  let reconnectTimer = null;
  let heartbeatTimer = null;
  let reconnectCount = 0;
  let isConnecting = false;
  const maxReconnectCount = 5;
  const reconnectInterval = 5e3;
  const heartbeatInterval = 3e4;
  const SOCKET_STATUS = {
    CONNECTING: 0,
    // 连接中
    OPEN: 1,
    // 已连接
    CLOSING: 2,
    // 关闭中
    CLOSED: 3
    // 已关闭
  };
  const log = (level, message, data = null) => {
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    const prefix = `[WebSocket ${timestamp}]`;
    switch (level) {
      case "info":
        formatAppLog("log", "at utils/socket.js:31", `${prefix} ℹ️ ${message}`, data || "");
        break;
      case "warn":
        formatAppLog("warn", "at utils/socket.js:34", `${prefix} ⚠️ ${message}`, data || "");
        break;
      case "error":
        formatAppLog("error", "at utils/socket.js:37", `${prefix} ❌ ${message}`, data || "");
        break;
      case "success":
        formatAppLog("log", "at utils/socket.js:40", `${prefix} ✅ ${message}`, data || "");
        break;
      default:
        formatAppLog("log", "at utils/socket.js:43", `${prefix} ${message}`, data || "");
    }
  };
  const connectWebSocket = (token) => {
    return new Promise((resolve, reject) => {
      log("info", "开始初始化WebSocket连接");
      if (typeof uni === "undefined" || !uni.connectSocket) {
        log("error", "uni-app WebSocket API不可用");
        reject(new Error("uni-app WebSocket API不可用"));
        return;
      }
      if (!token) {
        log("warn", "用户未登录，无法建立WebSocket连接");
        reject(new Error("用户未登录，无法建立WebSocket连接"));
        return;
      }
      log("info", "用户已登录，准备建立WebSocket连接");
      if (isConnecting) {
        log("warn", "WebSocket正在连接中，跳过重复连接");
        reject(new Error("WebSocket正在连接中"));
        return;
      }
      if (socket && socket.readyState === SOCKET_STATUS.OPEN) {
        log("info", "WebSocket已连接，无需重复连接");
        resolve(socket);
        return;
      }
      if (socket) {
        log("info", "关闭旧的WebSocket连接");
        disconnectWebSocket();
      }
      try {
        isConnecting = true;
        if (!WS_CONFIG || !WS_CONFIG.URL) {
          log("error", "WebSocket配置不完整", { config: WS_CONFIG });
          isConnecting = false;
          reject(new Error("WebSocket配置不完整"));
          return;
        }
        const wsUrl = `${WS_CONFIG.URL}?token=${encodeURIComponent(token)}`;
        log("info", "正在连接WebSocket服务器", {
          url: wsUrl.replace(/token=[^&]+/, "token=***")
        });
        socket = {
          readyState: SOCKET_STATUS.CONNECTING,
          socketTask: null,
          send: function(data) {
            if (this.socketTask) {
              this.socketTask.send({
                data,
                success: () => {
                  log("info", "WebSocket消息发送成功");
                },
                fail: (error) => {
                  log("error", "WebSocket消息发送失败", error);
                }
              });
            } else {
              log("error", "无法发送消息，socketTask不存在");
            }
          },
          close: function(code, reason) {
            if (this.socketTask) {
              this.socketTask.close({
                code: code || 1e3,
                reason: reason || "主动关闭",
                success: () => {
                  log("info", "WebSocket连接关闭成功");
                },
                fail: (error) => {
                  log("error", "WebSocket连接关闭失败", error);
                }
              });
            }
          }
        };
        socket.socketTask = uni.connectSocket({
          url: wsUrl,
          complete: () => {
          }
        });
        if (socket.socketTask) {
          socket.socketTask.onOpen(() => {
            socket.readyState = SOCKET_STATUS.OPEN;
            isConnecting = false;
            reconnectCount = 0;
            log("success", "WebSocket连接成功建立");
            if (reconnectTimer) {
              clearTimeout(reconnectTimer);
              reconnectTimer = null;
            }
            startHeartbeat();
            handleConnectionSuccess();
            resolve(socket);
          });
          socket.socketTask.onMessage((res) => {
            try {
              const data = JSON.parse(res.data);
              log("info", "收到WebSocket消息", {
                type: data.type,
                dataSize: res.data.length
              });
              handleMessage(data);
            } catch (error) {
              log("error", "WebSocket消息解析失败", {
                error: error.message,
                rawData: res.data
              });
            }
          });
          socket.socketTask.onClose((res) => {
            socket.readyState = SOCKET_STATUS.CLOSED;
            isConnecting = false;
            log("warn", "WebSocket连接关闭", {
              code: res.code,
              reason: res.reason,
              reconnectCount
            });
            stopHeartbeat();
            if (reconnectCount < maxReconnectCount) {
              log("info", `准备进行第${reconnectCount + 1}次重连`);
              reconnectTimer = setTimeout(() => {
                reconnectCount++;
                log("info", `开始第${reconnectCount}次重连`);
                connectWebSocket(token).catch((err) => {
                  log("error", "重连失败", err);
                });
              }, reconnectInterval);
            } else if (reconnectCount >= maxReconnectCount) {
              log("error", "已达到最大重连次数，停止重连");
            }
          });
          socket.socketTask.onError((error) => {
            socket.readyState = SOCKET_STATUS.CLOSED;
            isConnecting = false;
            log("error", "WebSocket连接发生错误", error);
            reject(error);
          });
        } else {
          log("error", "无法设置WebSocket事件监听，socketTask不存在");
          isConnecting = false;
          reject(new Error("无法设置WebSocket事件监听"));
          return;
        }
        setTimeout(() => {
          if (socket && socket.readyState === SOCKET_STATUS.CONNECTING) {
            log("error", "WebSocket连接超时");
            disconnectWebSocket();
            reject(new Error("WebSocket连接超时"));
          }
        }, WS_CONFIG.CONNECTION_TIMEOUT || 1e4);
      } catch (error) {
        isConnecting = false;
        log("error", "WebSocket初始化失败", {
          error: error.message,
          stack: error.stack
        });
        reject(error);
      }
    });
  };
  const startHeartbeat = () => {
    log("info", "启动WebSocket心跳");
    heartbeatTimer = setInterval(() => {
      if (socket && socket.readyState === SOCKET_STATUS.OPEN) {
        const heartbeatMsg = {
          type: "heartbeat",
          timestamp: Date.now()
        };
        socket.send(JSON.stringify(heartbeatMsg));
        log("info", "发送心跳包");
      } else {
        log("warn", "心跳检测发现连接异常，停止心跳");
        stopHeartbeat();
      }
    }, heartbeatInterval);
  };
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
      log("info", "停止WebSocket心跳");
    }
  };
  const handleConnectionSuccess = () => {
    log("info", "处理WebSocket连接成功事件");
    const userStore = useUserStore$1();
    if (userStore.userInfo) {
      sendSocketMessage({
        type: "user_online",
        data: {
          user_id: userStore.userInfo.id,
          username: userStore.userInfo.username
        }
      });
    }
    sendSocketMessage({
      type: "get_offline_messages",
      data: {}
    });
  };
  let messageCallbacks = [];
  const onNewMessage = (callback) => {
    if (callback === null) {
      messageCallbacks = [];
    } else if (typeof callback === "function") {
      messageCallbacks.push(callback);
    }
  };
  const handleMessage = (data) => {
    log("info", `处理消息类型: ${data.type}`);
    useMessageStore();
    useProjectStore();
    switch (data.type) {
      case "message":
        log("info", "处理聊天消息");
        handleChatMessage(data.data);
        break;
      case "notification":
        log("info", "处理通知消息");
        handleNotification(data.data);
        break;
      case "status":
        log("info", "处理状态更新");
        handleStatusUpdate(data.data);
        break;
      case "system":
        log("info", "处理系统消息");
        handleSystemMessage(data.data);
        break;
      case "heartbeat_response":
        log("info", "收到心跳响应");
        break;
      default:
        log("warn", "收到未知消息类型", {
          type: data.type
        });
    }
  };
  const handleChatMessage = (data) => {
    var _a;
    log("info", "处理聊天消息", {
      chatId: data.chat_id,
      senderId: data.message.sender_id,
      content: data.message.content
    });
    const messageStore = useMessageStore();
    messageStore.updateChatWithNewMessage(data);
    log("info", `准备调用${messageCallbacks.length}个消息回调`);
    messageCallbacks.forEach((callback) => {
      try {
        log("info", "调用消息回调");
        callback(data);
      } catch (error) {
        log("error", "执行消息回调时出错", error);
      }
    });
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      const currentRoute = currentPage.route;
      const isInCurrentChat = currentRoute.includes("messages/chat") && ((_a = currentPage.options) == null ? void 0 : _a.id) == data.chat_id;
      if (!isInCurrentChat) {
        uni.showToast({
          title: "收到新消息",
          icon: "none",
          duration: 2e3
        });
        triggerNotification("new_message");
      }
    }
  };
  const handleNotification = (data) => {
    log("info", "处理通知消息", {
      type: data.type,
      title: data.title
    });
    const messageStore = useMessageStore();
    messageStore.addNotification(data);
    let messageType = "default";
    if (data.type === "bid") {
      messageType = "new_bid";
    } else if (data.type === "project") {
      messageType = "project_update";
    }
    triggerNotification(messageType);
    uni.showToast({
      title: data.title || "收到新通知",
      icon: "none",
      duration: 2e3
    });
  };
  const handleStatusUpdate = (data) => {
    const { event_type, id, status } = data;
    log("info", "处理状态更新", {
      event_type,
      id,
      status
    });
    switch (event_type) {
      case "project_update":
        log("info", `项目${id}状态更新为${status}`);
        handleProjectStatusUpdate(id, status);
        break;
      case "bid_update":
        log("info", `投标${id}状态更新为${status}`);
        handleBidStatusUpdate(id, status);
        break;
      case "order_update":
        log("info", `订单${id}状态更新为${status}`);
        handleOrderStatusUpdate(id, status);
        break;
      default:
        log("warn", "未知的状态更新类型", { event_type });
    }
  };
  const handleProjectStatusUpdate = (projectId, status) => {
    var _a;
    const projectStore = useProjectStore();
    if (((_a = projectStore.currentProject) == null ? void 0 : _a.id) === projectId) {
      projectStore.updateProjectStatus(projectId, status);
    }
    const statusText = getProjectStatusText(status);
    uni.showToast({
      title: `项目状态: ${statusText}`,
      icon: "none",
      duration: 2e3
    });
  };
  const handleBidStatusUpdate = (bidId, status) => {
    let messageType = "project_update";
    if (status === 2) {
      messageType = "bid_accepted";
    } else if (status === 3) {
      messageType = "bid_won";
    }
    triggerNotification(messageType);
    const statusText = getBidStatusText(status);
    uni.showToast({
      title: `投标状态: ${statusText}`,
      icon: "none",
      duration: 2e3
    });
  };
  const handleOrderStatusUpdate = (orderId, status) => {
    const statusText = getOrderStatusText(status);
    uni.showToast({
      title: `订单状态: ${statusText}`,
      icon: "none",
      duration: 2e3
    });
  };
  const handleSystemMessage = (data) => {
    log("info", "处理系统消息");
    if (data.message) {
      uni.showToast({
        title: data.message,
        icon: "none",
        duration: 2e3
      });
    }
  };
  const getProjectStatusText = (status) => {
    const statusMap = {
      0: "招标中",
      1: "已选标",
      2: "进行中",
      3: "已完成",
      4: "已取消"
    };
    return statusMap[status] || "未知状态";
  };
  const getBidStatusText = (status) => {
    const statusMap = {
      0: "待审核",
      1: "已拒绝",
      2: "已接受",
      3: "已中标",
      4: "已取消"
    };
    return statusMap[status] || "未知状态";
  };
  const getOrderStatusText = (status) => {
    const statusMap = {
      0: "待支付",
      1: "进行中",
      2: "待验收",
      3: "已完成",
      4: "已取消",
      5: "已退款"
    };
    return statusMap[status] || "未知状态";
  };
  const sendSocketMessage = (message) => {
    if (socket && socket.readyState === SOCKET_STATUS.OPEN) {
      const messageStr = JSON.stringify(message);
      socket.send(messageStr);
      log("info", "发送WebSocket消息", {
        type: message.type
      });
      return true;
    } else {
      log("error", "WebSocket未连接，无法发送消息", {
        socketExists: !!socket,
        readyState: socket == null ? void 0 : socket.readyState
      });
      return false;
    }
  };
  const disconnectWebSocket = () => {
    log("info", "主动关闭WebSocket连接");
    if (socket) {
      if (socket.socketTask) {
        socket.socketTask.close({
          code: 1e3,
          reason: "主动断开",
          success: () => {
            log("success", "WebSocket连接关闭成功");
          },
          fail: (error) => {
            log("error", "WebSocket连接关闭失败", error);
          }
        });
      }
      socket = null;
    }
    stopHeartbeat();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectCount = 0;
    isConnecting = false;
    log("success", "WebSocket连接已关闭");
  };
  const isSocketConnected = () => {
    return socket && socket.readyState === SOCKET_STATUS.OPEN;
  };
  const joinChatRoom = (chatId) => {
    log("info", "加入聊天房间", { chatId });
    return sendSocketMessage({
      type: "join_chat",
      data: { chat_id: chatId }
    });
  };
  const leaveChatRoom = (chatId) => {
    log("info", "离开聊天房间", { chatId });
    return sendSocketMessage({
      type: "leave_chat",
      data: { chat_id: chatId }
    });
  };
  const markMessagesRead = (chatId) => {
    log("info", "标记消息已读", { chatId });
    return sendSocketMessage({
      type: "mark_read",
      data: { chat_id: chatId }
    });
  };
  const _imports_1$7 = "/static/icons/user.png";
  const _imports_2$4 = "/static/icons/lock.png";
  const _imports_2$3 = "/static/icons/help.png";
  const _imports_1$6 = "/static/icons/phone.png";
  const _sfc_main$v = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const loginForm = vue.ref({
        username: "",
        password: "",
        remember: false,
        // 隐私与用户协议勾选，默认不勾选，满足应用商店要求
        agreePolicy: false
      });
      const handleLogin = async () => {
        if (!loginForm.value.username) {
          uni.showToast({ title: "请输入用户名", icon: "none" });
          return;
        }
        if (!loginForm.value.password) {
          uni.showToast({ title: "请输入密码", icon: "none" });
          return;
        }
        if (!loginForm.value.agreePolicy) {
          uni.showToast({ title: "请先阅读并同意隐私政策和用户协议", icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: "登录中..." });
          const credentials = {
            username: loginForm.value.username,
            password: loginForm.value.password
          };
          await userStore.login(credentials);
          uni.hideLoading();
          uni.showToast({ title: "登录成功", icon: "success" });
          try {
            formatAppLog("log", "at pages/login/index.vue:121", "登录成功，开始初始化WebSocket");
            connectWebSocket(userStore.token);
          } catch (socketError) {
            formatAppLog("warn", "at pages/login/index.vue:124", "WebSocket初始化失败:", socketError);
          }
          setTimeout(() => {
            uni.switchTab({ url: "/pages/home/index" });
          }, 1500);
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/login/index.vue:134", "登录失败:", error);
          const errorMsg = error.message || error.errMsg || "登录失败，请重试";
          uni.showToast({ title: errorMsg, icon: "none" });
        }
      };
      const toggleAgreePolicy = () => {
        loginForm.value.agreePolicy = !loginForm.value.agreePolicy;
      };
      const goToPrivacyPolicy = () => uni.navigateTo({ url: "/pages/common/privacy-policy" });
      const goToUserAgreement = () => uni.navigateTo({ url: "/pages/common/user-agreement" });
      const goToRegister = () => uni.navigateTo({ url: "/pages/register/index" });
      const goToForgetPassword = () => uni.navigateTo({ url: "/pages/login/forget-password" });
      const goToHelp = () => uni.showToast({ title: "763705036@qq.com", icon: "none" });
      const contactCustomerService = () => uni.showToast({ title: "763705036@qq.com", icon: "none" });
      const __returned__ = { userStore, loginForm, handleLogin, toggleAgreePolicy, goToPrivacyPolicy, goToUserAgreement, goToRegister, goToForgetPassword, goToHelp, contactCustomerService, ref: vue.ref, get useUserStore() {
        return useUserStore$1;
      }, get APP_CONFIG() {
        return APP_CONFIG;
      }, get connectWebSocket() {
        return connectWebSocket;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$v(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "brand-name" }, "国中宝"),
        vue.createElementVNode("text", { class: "brand-slogan" }, "一站式招投标服务平台")
      ]),
      vue.createElementVNode("view", { class: "login-form-container" }, [
        vue.createElementVNode("view", { class: "glass-effect" }, [
          vue.createElementVNode("text", { class: "welcome-text" }, "欢迎回来"),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "用户名"),
            vue.createElementVNode("view", { class: "input-container" }, [
              vue.createElementVNode("image", {
                class: "input-icon",
                src: _imports_1$7
              }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  type: "text",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.loginForm.username = $event),
                  placeholder: "请输入用户名"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.loginForm.username]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "密码"),
            vue.createElementVNode("view", { class: "input-container" }, [
              vue.createElementVNode("image", {
                class: "input-icon",
                src: _imports_2$4
              }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  type: "password",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.loginForm.password = $event),
                  placeholder: "请输入密码"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.loginForm.password]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-options" }, [
            vue.createElementVNode("view", { class: "remember-pwd" }, [
              vue.createElementVNode("checkbox", {
                checked: $setup.loginForm.remember,
                onClick: _cache[2] || (_cache[2] = ($event) => $setup.loginForm.remember = !$setup.loginForm.remember),
                style: { "transform": "scale(0.7)" }
              }, null, 8, ["checked"]),
              vue.createElementVNode("text", null, "记住密码")
            ]),
            vue.createElementVNode("text", {
              class: "forget-pwd",
              onClick: $setup.goToForgetPassword
            }, "忘记密码?")
          ]),
          vue.createElementVNode("view", { class: "agreement-row" }, [
            vue.createElementVNode("checkbox", {
              checked: $setup.loginForm.agreePolicy,
              onClick: $setup.toggleAgreePolicy,
              style: { "transform": "scale(0.7)" }
            }, null, 8, ["checked"]),
            vue.createElementVNode("text", { class: "agreement-text" }, [
              vue.createTextVNode(" 我已阅读并同意 "),
              vue.createElementVNode("text", {
                class: "agreement-link",
                onClick: $setup.goToPrivacyPolicy
              }, "《隐私政策》"),
              vue.createTextVNode(" 和 "),
              vue.createElementVNode("text", {
                class: "agreement-link",
                onClick: $setup.goToUserAgreement
              }, "《用户协议》")
            ])
          ]),
          vue.createElementVNode("button", {
            class: "login-btn",
            onClick: $setup.handleLogin
          }, "登录"),
          vue.createElementVNode("view", { class: "register-link" }, [
            vue.createElementVNode("text", null, "还没有账号? "),
            vue.createElementVNode("text", {
              class: "link-text",
              onClick: $setup.goToRegister
            }, "立即注册")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "footer" }, [
        vue.createElementVNode("view", {
          class: "footer-btn",
          onClick: $setup.goToHelp
        }, [
          vue.createElementVNode("image", {
            class: "footer-icon",
            src: _imports_2$3
          }),
          vue.createElementVNode("text", { class: "footer-text" }, "帮助")
        ]),
        vue.createElementVNode("view", {
          class: "footer-btn",
          onClick: $setup.contactCustomerService
        }, [
          vue.createElementVNode("image", {
            class: "footer-icon",
            src: _imports_1$6
          }),
          vue.createElementVNode("text", { class: "footer-text" }, "客服")
        ])
      ])
    ]);
  }
  const PagesLoginIndex = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["render", _sfc_render$v], ["__file", "F:/new/success/uniappandroid/pages/login/index.vue"]]);
  function validatePhone(phone) {
    const reg = /^1[3-9]\d{9}$/;
    return reg.test(phone);
  }
  const _sfc_main$u = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const loading = vue.ref(false);
      const showPassword = vue.ref(false);
      const showConfirmPassword = vue.ref(false);
      const agreeTerms = vue.ref(false);
      const confirmPassword = vue.ref("");
      const codeCountdown = vue.ref(0);
      let countdownTimer = null;
      const usernameError = vue.ref("");
      const phoneError = vue.ref("");
      const codeError = vue.ref("");
      const passwordError = vue.ref("");
      const confirmPasswordError = vue.ref("");
      const registerForm = vue.ref({
        username: "",
        password: "",
        phone: "",
        code: "000000"
      });
      const canSendCode = vue.computed(() => {
        return validatePhone(registerForm.value.phone);
      });
      const canRegister = vue.computed(() => {
        const isUsernameValid = registerForm.value.username.trim().length >= 3;
        const isPhoneValid = validatePhone(registerForm.value.phone);
        const isPasswordValid = registerForm.value.password.length >= 6;
        const isConfirmPasswordValid = confirmPassword.value === registerForm.value.password;
        const isAgreeTerms = agreeTerms.value;
        return isUsernameValid && isPhoneValid && // isCodeValid && 
        isPasswordValid && isConfirmPasswordValid && isAgreeTerms;
      });
      const validateUsername = () => {
        const username = registerForm.value.username.trim();
        if (!username) {
          usernameError.value = "请输入用户名";
        } else if (username.length < 3) {
          usernameError.value = "用户名至少需要3个字符";
        } else if (username.length > 20) {
          usernameError.value = "用户名不能超过20个字符";
        } else {
          usernameError.value = "";
        }
      };
      const validatePhoneNumber = () => {
        const phone = registerForm.value.phone.trim();
        if (!phone) {
          phoneError.value = "请输入手机号";
        } else if (!validatePhone(phone)) {
          phoneError.value = "请输入正确的手机号";
        } else {
          phoneError.value = "";
        }
      };
      const validatePassword = () => {
        const password = registerForm.value.password;
        if (!password) {
          passwordError.value = "请输入密码";
        } else if (password.length < 6) {
          passwordError.value = "密码至少需要6个字符";
        } else if (password.length > 20) {
          passwordError.value = "密码不能超过20个字符";
        } else {
          passwordError.value = "";
        }
        if (confirmPassword.value) {
          validateConfirmPassword();
        }
      };
      const validateConfirmPassword = () => {
        if (!confirmPassword.value) {
          confirmPasswordError.value = "请确认密码";
        } else if (confirmPassword.value !== registerForm.value.password) {
          confirmPasswordError.value = "两次输入的密码不一致";
        } else {
          confirmPasswordError.value = "";
        }
      };
      const togglePassword = () => {
        showPassword.value = !showPassword.value;
      };
      const toggleConfirmPassword = () => {
        showConfirmPassword.value = !showConfirmPassword.value;
      };
      const toggleAgreeTerms = (e) => {
        if (e && e.detail && Array.isArray(e.detail.value)) {
          agreeTerms.value = e.detail.value.includes("agree");
        } else {
          agreeTerms.value = !agreeTerms.value;
        }
        formatAppLog("log", "at pages/register/index.vue:243", "协议同意状态:", agreeTerms.value);
      };
      const handleRegister = async () => {
        if (!canRegister.value || loading.value) {
          if (!registerForm.value.username.trim()) {
            uni.showToast({
              title: "请输入用户名",
              icon: "none"
            });
          } else if (registerForm.value.username.trim().length < 3) {
            uni.showToast({
              title: "用户名至少需要3个字符",
              icon: "none"
            });
          } else if (!validatePhone(registerForm.value.phone)) {
            uni.showToast({
              title: "请输入正确的手机号",
              icon: "none"
            });
          } else if (registerForm.value.password.length < 6) {
            uni.showToast({
              title: "密码至少6个字符",
              icon: "none"
            });
          } else if (confirmPassword.value !== registerForm.value.password) {
            uni.showToast({
              title: "两次输入的密码不一致",
              icon: "none"
            });
          } else if (!agreeTerms.value) {
            uni.showToast({
              title: "请同意用户协议和隐私政策",
              icon: "none"
            });
          }
          return;
        }
        try {
          loading.value = true;
          const registerData = {
            username: registerForm.value.username,
            password: registerForm.value.password,
            phone: registerForm.value.phone,
            code: registerForm.value.code
          };
          const result = await userStore.register(registerData);
          uni.showToast({
            title: "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateTo({
              url: "/pages/login/index"
            });
          }, 1500);
        } catch (error) {
          uni.showToast({
            title: error.message || "注册失败，请稍后重试",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const goToLogin = () => {
        uni.navigateTo({
          url: "/pages/login/index"
        });
      };
      const showUserAgreement = () => {
        uni.navigateTo({ url: "/pages/common/user-agreement" });
      };
      const showPrivacyPolicy = () => {
        uni.navigateTo({ url: "/pages/common/privacy-policy" });
      };
      const __returned__ = { userStore, loading, showPassword, showConfirmPassword, agreeTerms, confirmPassword, codeCountdown, get countdownTimer() {
        return countdownTimer;
      }, set countdownTimer(v) {
        countdownTimer = v;
      }, usernameError, phoneError, codeError, passwordError, confirmPasswordError, registerForm, canSendCode, canRegister, validateUsername, validatePhoneNumber, validatePassword, validateConfirmPassword, togglePassword, toggleConfirmPassword, toggleAgreeTerms, handleRegister, goToLogin, showUserAgreement, showPrivacyPolicy, ref: vue.ref, computed: vue.computed, watch: vue.watch, get useUserStore() {
        return useUserStore$1;
      }, get validatePhone() {
        return validatePhone;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$u(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "brand-name" }, "直求"),
        vue.createElementVNode("text", { class: "brand-slogan" }, "一站式招投标服务平台")
      ]),
      vue.createElementVNode("view", { class: "register-form-container" }, [
        vue.createElementVNode("view", { class: "glass-effect" }, [
          vue.createElementVNode("text", { class: "welcome-text" }, "创建账号"),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "用户名"),
            vue.createElementVNode("view", { class: "input-container" }, [
              vue.createElementVNode("image", {
                class: "input-icon",
                src: _imports_1$7
              }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  type: "text",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.registerForm.username = $event),
                  onBlur: $setup.validateUsername,
                  placeholder: "请输入用户名(至少6个字符)"
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [vue.vModelText, $setup.registerForm.username]
              ])
            ]),
            $setup.usernameError ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.usernameError),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "手机号"),
            vue.createElementVNode("view", { class: "input-container" }, [
              vue.createElementVNode("image", {
                class: "input-icon",
                src: _imports_1$6
              }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  type: "number",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.registerForm.phone = $event),
                  onBlur: $setup.validatePhoneNumber,
                  placeholder: "请输入手机号"
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [vue.vModelText, $setup.registerForm.phone]
              ])
            ]),
            $setup.phoneError ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.phoneError),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "设置密码"),
            vue.createElementVNode("view", { class: "input-container" }, [
              vue.createElementVNode("image", {
                class: "input-icon",
                src: _imports_2$4
              }),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                type: $setup.showPassword ? "text" : "password",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.registerForm.password = $event),
                onBlur: $setup.validatePassword,
                placeholder: "请设置密码"
              }, null, 40, ["type"]), [
                [vue.vModelDynamic, $setup.registerForm.password]
              ]),
              vue.createElementVNode("view", {
                class: "password-toggle",
                onClick: $setup.togglePassword
              }, [
                vue.createElementVNode("image", {
                  class: "toggle-icon",
                  src: $setup.showPassword ? "/static/icons/eye-open.png" : "/static/icons/eye-closed.png"
                }, null, 8, ["src"])
              ])
            ]),
            $setup.passwordError ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.passwordError),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "确认密码"),
            vue.createElementVNode("view", { class: "input-container" }, [
              vue.createElementVNode("image", {
                class: "input-icon",
                src: _imports_2$4
              }),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                type: $setup.showConfirmPassword ? "text" : "password",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.confirmPassword = $event),
                onBlur: $setup.validateConfirmPassword,
                placeholder: "请再次输入密码"
              }, null, 40, ["type"]), [
                [vue.vModelDynamic, $setup.confirmPassword]
              ]),
              vue.createElementVNode("view", {
                class: "password-toggle",
                onClick: $setup.toggleConfirmPassword
              }, [
                vue.createElementVNode("image", {
                  class: "toggle-icon",
                  src: $setup.showConfirmPassword ? "/static/icons/eye-open.png" : "/static/icons/eye-closed.png"
                }, null, 8, ["src"])
              ])
            ]),
            $setup.confirmPasswordError ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "error-text"
              },
              vue.toDisplayString($setup.confirmPasswordError),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "agreement-section" }, [
            vue.createElementVNode("view", {
              class: "agreement-wrapper",
              onClick: $setup.toggleAgreeTerms
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["custom-checkbox", { checked: $setup.agreeTerms }])
                },
                [
                  $setup.agreeTerms ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "checkbox-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode("text", { class: "agreement-text" }, [
                vue.createTextVNode(" 我已阅读并同意 "),
                vue.createElementVNode("text", {
                  class: "agreement-link",
                  onClick: $setup.showUserAgreement
                }, "《用户协议》"),
                vue.createTextVNode(" 和 "),
                vue.createElementVNode("text", {
                  class: "agreement-link",
                  onClick: $setup.showPrivacyPolicy
                }, "《隐私政策》")
              ])
            ])
          ]),
          vue.createElementVNode("button", {
            class: vue.normalizeClass(["register-btn", { disabled: !$setup.canRegister }]),
            disabled: !$setup.canRegister || $setup.loading,
            onClick: $setup.handleRegister
          }, [
            $setup.loading ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "注册中...")) : (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "注册"))
          ], 10, ["disabled"]),
          vue.createElementVNode("view", { class: "login-link" }, [
            vue.createElementVNode("text", null, "已有账号? "),
            vue.createElementVNode("text", {
              class: "link-text",
              onClick: $setup.goToLogin
            }, "立即登录")
          ])
        ])
      ])
    ]);
  }
  const PagesRegisterIndex = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$u], ["__file", "F:/new/success/uniappandroid/pages/register/index.vue"]]);
  const _imports_0$7 = "/static/icons/arrow_left.png";
  const _sfc_main$t = {
    __name: "forget-password",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const username = vue.ref("");
      const newPassword = vue.ref("");
      const confirmPassword = vue.ref("");
      const showNewPassword = vue.ref(false);
      const goBack = () => {
        uni.navigateBack();
      };
      const handleSubmit = async () => {
        if (!showNewPassword.value) {
          if (!username.value) {
            uni.showToast({ title: "请输入用户名", icon: "none" });
            return;
          }
          showNewPassword.value = true;
          return;
        }
        if (!newPassword.value) {
          uni.showToast({ title: "请输入新密码", icon: "none" });
          return;
        }
        if (newPassword.value.length < 6) {
          uni.showToast({ title: "密码长度不能少于6位", icon: "none" });
          return;
        }
        if (newPassword.value !== confirmPassword.value) {
          uni.showToast({ title: "两次输入的密码不一致", icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: "重置密码中..." });
          await userStore.changePassword({
            username: username.value,
            new_password: newPassword.value
          });
          uni.hideLoading();
          uni.showToast({ title: "密码重置成功", icon: "success" });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          uni.hideLoading();
          const errorMsg = error.message || error.errMsg || "密码重置失败，请重试";
          uni.showToast({ title: errorMsg, icon: "none" });
        }
      };
      const __returned__ = { userStore, username, newPassword, confirmPassword, showNewPassword, goBack, handleSubmit, ref: vue.ref, get useUserStore() {
        return useUserStore$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$t(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "forget-password-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            class: "back-icon",
            src: _imports_0$7
          })
        ]),
        vue.createElementVNode("text", { class: "page-title" }, "找回密码")
      ]),
      vue.createElementVNode("view", { class: "form-container" }, [
        vue.createElementVNode("view", { class: "glass-effect" }, [
          vue.createElementVNode("text", { class: "instruction-text" }, "请输入您的用户名，我们将为您重置密码"),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "用户名"),
            vue.createElementVNode("view", { class: "input-container" }, [
              vue.createElementVNode("image", {
                class: "input-icon",
                src: _imports_1$7
              }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  type: "text",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.username = $event),
                  placeholder: "请输入您的用户名"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.username]
              ])
            ])
          ]),
          $setup.showNewPassword ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "form-item"
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "新密码"),
            vue.createElementVNode("view", { class: "input-container" }, [
              vue.createElementVNode("image", {
                class: "input-icon",
                src: _imports_2$4
              }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  type: "password",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.newPassword = $event),
                  placeholder: "请输入新密码"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.newPassword]
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true),
          $setup.showNewPassword ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "form-item"
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "确认密码"),
            vue.createElementVNode("view", { class: "input-container" }, [
              vue.createElementVNode("image", {
                class: "input-icon",
                src: _imports_2$4
              }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "form-input",
                  type: "password",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.confirmPassword = $event),
                  placeholder: "请再次输入新密码"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.confirmPassword]
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode(
            "button",
            {
              class: "submit-btn",
              onClick: $setup.handleSubmit
            },
            vue.toDisplayString($setup.showNewPassword ? "重置密码" : "下一步"),
            1
            /* TEXT */
          )
        ])
      ])
    ]);
  }
  const PagesLoginForgetPassword = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$t], ["__file", "F:/new/success/uniappandroid/pages/login/forget-password.vue"]]);
  const projectCategories = [
    // 1. 工业标单需求（已存在）
    {
      id: 1,
      name: "工业标单需求",
      icon: "/static/icons/industry.png",
      subCategories: [
        {
          id: 101,
          name: "机械加工",
          children: [
            { id: 10101, name: "零件" },
            { id: 10102, name: "数控加工" },
            { id: 10103, name: "电加工" },
            { id: 10104, name: "普通机床" },
            { id: 10105, name: "非标产品" }
          ]
        },
        {
          id: 102,
          name: "模具检具",
          children: [
            { id: 10201, name: "冲压模具" },
            { id: 10202, name: "注塑模具" },
            { id: 10203, name: "工装检具" },
            { id: 10204, name: "橡胶模具" },
            { id: 10205, name: "压制模具" }
          ]
        },
        {
          id: 103,
          name: "自动化",
          children: [
            { id: 10301, name: "机械与自动化设备" },
            { id: 10302, name: "机器人技术" },
            { id: 10303, name: "电子与电器工程" },
            { id: 10304, name: "自动化控制系统" }
          ]
        },
        {
          id: 104,
          name: "机床设备",
          children: [
            { id: 10401, name: "数控机床" },
            { id: 10402, name: "普通机床" }
          ]
        },
        {
          id: 105,
          name: "设计检测",
          children: [
            { id: 10501, name: "产品设计" },
            { id: 10502, name: "3D扫描" },
            { id: 10503, name: "制图" },
            { id: 10504, name: "测绘" }
          ]
        },
        {
          id: 106,
          name: "五金配件",
          children: [
            { id: 10601, name: "模具标准件" },
            { id: 10602, name: "工具" },
            { id: 10603, name: "测量工具" }
          ]
        },
        {
          id: 107,
          name: "工业耗材",
          children: [
            { id: 10701, name: "材料" },
            { id: 10702, name: "刀具" },
            { id: 10703, name: "劳保" },
            { id: 10704, name: "其它" }
          ]
        }
      ]
    },
    // 2. 餐饮美食需求
    {
      id: 2,
      name: "餐饮美食需求",
      icon: "/static/icons/Restaurant.png",
      subCategories: [
        {
          id: 201,
          name: "中餐馆",
          children: [
            { id: 20101, name: "火锅" },
            { id: 20102, name: "烤串烧烤" },
            { id: 20103, name: "家常餐馆" },
            { id: 20104, name: "回民餐馆" },
            { id: 20105, name: "自助餐" }
          ]
        },
        {
          id: 202,
          name: "地方菜",
          children: [
            { id: 20201, name: "东北菜" },
            { id: 20202, name: "粤菜" },
            { id: 20203, name: "湘菜" },
            { id: 20204, name: "苏帮菜" },
            { id: 20205, name: "川菜" },
            { id: 20206, name: "鲁菜" },
            { id: 20207, name: "闽菜" },
            { id: 20208, name: "徽菜" }
          ]
        },
        {
          id: 203,
          name: "外国餐厅",
          children: [
            { id: 20301, name: "西餐厅" },
            { id: 20302, name: "韩餐厅" },
            { id: 20303, name: "日餐厅" },
            { id: 20304, name: "南洋餐馆" },
            { id: 20305, name: "印度餐" },
            { id: 20306, name: "中东餐厅" }
          ]
        }
      ]
    },
    // 3. 休闲娱乐需求
    {
      id: 3,
      name: "休闲娱乐需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 301,
          name: "洗浴按摩",
          children: [
            { id: 30101, name: "温泉洗浴" },
            { id: 30102, name: "按摩足疗" },
            { id: 30103, name: "养生" }
          ]
        },
        {
          id: 302,
          name: "KTV酒吧",
          children: [
            { id: 30201, name: "KTV" },
            { id: 30202, name: "酒吧" }
          ]
        },
        {
          id: 303,
          name: "体育场馆",
          children: [
            { id: 30301, name: "健身房" },
            { id: 30302, name: "羽毛球馆" },
            { id: 30303, name: "游泳馆" },
            { id: 30304, name: "场地需求" }
          ]
        },
        {
          id: 304,
          name: "影院演出",
          children: [
            { id: 30401, name: "电影院" },
            { id: 30402, name: "演唱会" },
            { id: 30403, name: "演出" }
          ]
        },
        {
          id: 305,
          name: "景区门票",
          children: [
            { id: 30501, name: "景区门票" }
          ]
        }
      ]
    },
    // 4. 手机需求
    {
      id: 4,
      name: "手机需求",
      icon: "/static/icons/phone.png",
      subCategories: [
        {
          id: 401,
          name: "手机电脑",
          children: [
            { id: 40101, name: "小米" },
            { id: 40102, name: "华为" },
            { id: 40103, name: "苹果" },
            { id: 40104, name: "OPPO" },
            { id: 40105, name: "vivo" },
            { id: 40106, name: "三星" },
            { id: 40107, name: "其他" }
          ]
        },
        {
          id: 402,
          name: "电脑需求",
          children: [
            { id: 40201, name: "平板" },
            { id: 40202, name: "台式机" },
            { id: 40203, name: "笔记本" }
          ]
        }
      ]
    },
    // 5. 家电需求
    {
      id: 5,
      name: "家电需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 501,
          name: "电视",
          children: [
            { id: 50101, name: "索尼" },
            { id: 50102, name: "三星" },
            { id: 50103, name: "小米" },
            { id: 50104, name: "华为" },
            { id: 50105, name: "TCL" },
            { id: 50106, name: "海尔" },
            { id: 50107, name: "长虹" },
            { id: 50108, name: "海信" },
            { id: 50109, name: "其他品牌" }
          ]
        },
        {
          id: 502,
          name: "冰箱",
          children: [
            { id: 50201, name: "三星" },
            { id: 50202, name: "海尔" },
            { id: 50203, name: "小米" },
            { id: 50204, name: "美菱" },
            { id: 50205, name: "奥克斯" },
            { id: 50206, name: "卡萨帝" },
            { id: 50207, name: "美的" },
            { id: 50208, name: "其他品牌" }
          ]
        },
        {
          id: 503,
          name: "洗衣机",
          children: [
            { id: 50301, name: "三星" },
            { id: 50302, name: "海尔" },
            { id: 50303, name: "小米" },
            { id: 50304, name: "小天鹅" },
            { id: 50305, name: "西门子" },
            { id: 50306, name: "美的" },
            { id: 50307, name: "LG" },
            { id: 50308, name: "其他品牌" }
          ]
        },
        {
          id: 504,
          name: "空调",
          children: [
            { id: 50401, name: "三星" },
            { id: 50402, name: "海尔" },
            { id: 50403, name: "小米" },
            { id: 50404, name: "格力" },
            { id: 50405, name: "美的" },
            { id: 50406, name: "LG" },
            { id: 50407, name: "大金" },
            { id: 50408, name: "TCL" },
            { id: 50409, name: "其他品牌" }
          ]
        },
        {
          id: 505,
          name: "热水器",
          children: [
            { id: 50501, name: "海尔" },
            { id: 50502, name: "美的" },
            { id: 50503, name: "卡萨帝" },
            { id: 50504, name: "AO史密斯" },
            { id: 50505, name: "万家乐" },
            { id: 50506, name: "其他品牌" }
          ]
        },
        {
          id: 506,
          name: "厨房家电",
          children: [
            { id: 50601, name: "电饭煲" },
            { id: 50602, name: "集成灶" },
            { id: 50603, name: "蒸烤箱" },
            { id: 50604, name: "燃气炉具" },
            { id: 50605, name: "空气炸锅" },
            { id: 50606, name: "榨汁机" }
          ]
        },
        {
          id: 507,
          name: "清洁家电",
          children: [
            { id: 50701, name: "智能拖把" },
            { id: 50702, name: "扫地机器人" },
            { id: 50703, name: "吸尘器" },
            { id: 50704, name: "清洗机" }
          ]
        },
        {
          id: 508,
          name: "数码游戏",
          children: [
            { id: 50801, name: "数码相机" },
            { id: 50802, name: "PS游戏机" },
            { id: 50803, name: "XBOX游戏机" }
          ]
        }
      ]
    },
    // 6. 家居需求
    {
      id: 6,
      name: "家居需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 601,
          name: "家具",
          children: [
            { id: 60101, name: "床" },
            { id: 60102, name: "橱柜衣柜" },
            { id: 60103, name: "沙发" },
            { id: 60104, name: "茶几" },
            { id: 60105, name: "电视柜" },
            { id: 60106, name: "餐桌座椅" }
          ]
        },
        {
          id: 602,
          name: "家纺",
          children: [
            { id: 60201, name: "床上用品" },
            { id: 60202, name: "窗帘" }
          ]
        },
        {
          id: 603,
          name: "灯具装饰",
          children: [
            { id: 60301, name: "灯具" },
            { id: 60302, name: "家装摆件" },
            { id: 60303, name: "墙上装饰" }
          ]
        },
        {
          id: 604,
          name: "厨卫用品",
          children: [
            { id: 60401, name: "浴室柜" },
            { id: 60402, name: "马桶" },
            { id: 60403, name: "淋浴" }
          ]
        },
        {
          id: 605,
          name: "建材",
          children: [
            { id: 60501, name: "五金" },
            { id: 60502, name: "其他" }
          ]
        },
        {
          id: 606,
          name: "办公家具",
          children: [
            { id: 60601, name: "办公座椅" },
            { id: 60602, name: "其它" }
          ]
        }
      ]
    },
    // 7. 汽车需求
    {
      id: 7,
      name: "汽车需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 701,
          name: "新能源汽车",
          children: [
            { id: 70101, name: "特斯拉" },
            { id: 70102, name: "小米" },
            { id: 70103, name: "比亚迪" },
            { id: 70104, name: "华为" },
            { id: 70105, name: "理想" },
            { id: 70106, name: "其他" }
          ]
        },
        {
          id: 702,
          name: "燃油车",
          children: [
            { id: 70201, name: "国产燃油车" },
            { id: 70202, name: "德系燃油车" },
            { id: 70203, name: "美系燃油车" },
            { id: 70204, name: "日系燃油车" },
            { id: 70205, name: "其他" }
          ]
        },
        {
          id: 703,
          name: "货运车",
          children: [
            { id: 70301, name: "微型车辆" },
            { id: 70302, name: "小型货车" },
            { id: 70303, name: "中大型货运车辆" }
          ]
        }
      ]
    },
    // 8. 房产需求
    {
      id: 8,
      name: "房产需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 801,
          name: "新房",
          children: [
            { id: 80101, name: "商品房" },
            { id: 80102, name: "公寓" },
            { id: 80103, name: "商铺" }
          ]
        },
        {
          id: 802,
          name: "出售二手房",
          children: [
            { id: 80201, name: "商品房" },
            { id: 80202, name: "公寓" },
            { id: 80203, name: "商铺" }
          ]
        },
        {
          id: 803,
          name: "房东出租",
          children: [
            { id: 80301, name: "整租" },
            { id: 80302, name: "合租" },
            { id: 80303, name: "单间" },
            { id: 80304, name: "商铺" }
          ]
        },
        {
          id: 804,
          name: "中介服务",
          children: [
            { id: 80401, name: "过户代办" }
          ]
        },
        {
          id: 805,
          name: "客户租房",
          children: [
            { id: 80501, name: "整租" },
            { id: 80502, name: "合租" },
            { id: 80503, name: "单间" },
            { id: 80504, name: "商铺" }
          ]
        },
        {
          id: 806,
          name: "需要购买二手房",
          children: [
            { id: 80601, name: "商品房" },
            { id: 80602, name: "公寓" },
            { id: 80603, name: "商铺" }
          ]
        }
      ]
    },
    // 9. 服装鞋帽需求
    {
      id: 9,
      name: "服装鞋帽需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 901,
          name: "个性需求",
          children: [
            { id: 90101, name: "男装鞋帽" },
            { id: 90102, name: "女装鞋帽" }
          ]
        },
        {
          id: 902,
          name: "男装需求",
          children: [
            { id: 90201, name: "男装" },
            { id: 90202, name: "男鞋" },
            { id: 90203, name: "帽子饰品" }
          ]
        },
        {
          id: 903,
          name: "女装需求",
          children: [
            { id: 90301, name: "女装" },
            { id: 90302, name: "女鞋" },
            { id: 90303, name: "帽子饰品" }
          ]
        },
        {
          id: 904,
          name: "设计师需求",
          children: [
            { id: 90401, name: "服装" },
            { id: 90402, name: "鞋帽" },
            { id: 90403, name: "饰品" }
          ]
        }
      ]
    },
    // 10. 家装装修需求
    {
      id: 10,
      name: "家装装修需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 1001,
          name: "整包装修",
          children: [
            { id: 100101, name: "家装" },
            { id: 100102, name: "商铺装修" }
          ]
        },
        {
          id: 1002,
          name: "分包装修",
          children: [
            { id: 100201, name: "基础装修" },
            { id: 100202, name: "油木工定制" },
            { id: 100203, name: "装修工人" }
          ]
        },
        {
          id: 1003,
          name: "绿化工程",
          children: [
            { id: 100301, name: "基础工程" }
          ]
        }
      ]
    },
    // 11. 生活服务需求
    {
      id: 11,
      name: "生活服务需求",
      icon: "/static/icons/live.png",
      subCategories: [
        {
          id: 1101,
          name: "酒店",
          children: [
            { id: 110101, name: "五星酒店" },
            { id: 110102, name: "豪华酒店" },
            { id: 110103, name: "快捷酒店" },
            { id: 110104, name: "民宿" },
            { id: 110105, name: "钟点房" }
          ]
        },
        {
          id: 1102,
          name: "出行",
          children: [
            { id: 110201, name: "机票" },
            { id: 110202, name: "火车票" },
            { id: 110203, name: "货车" },
            { id: 110204, name: "专车" }
          ]
        },
        {
          id: 1103,
          name: "旅游",
          children: [
            { id: 110301, name: "国内游" },
            { id: 110302, name: "国际游" },
            { id: 110303, name: "省内游" }
          ]
        },
        {
          id: 1104,
          name: "保险",
          children: [
            { id: 110401, name: "车险" },
            { id: 110402, name: "寿险" },
            { id: 110403, name: "商业险" }
          ]
        },
        {
          id: 1105,
          name: "教育培训",
          children: [
            { id: 110501, name: "舞蹈培训" },
            { id: 110502, name: "技能培训" }
          ]
        },
        {
          id: 1106,
          name: "综合服务",
          children: [
            { id: 110601, name: "母婴" },
            { id: 110602, name: "婚庆" },
            { id: 110603, name: "养老" },
            { id: 110604, name: "丧葬" },
            { id: 110605, name: "宠物用品" },
            { id: 110606, name: "美容美发" },
            { id: 110607, name: "搬家公司" }
          ]
        }
      ]
    },
    // 12. 二手物品需求
    {
      id: 12,
      name: "二手物品需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 1201,
          name: "二手车",
          children: [
            { id: 120101, name: "德系二手车" },
            { id: 120102, name: "美系二手车" },
            { id: 120103, name: "日系二手车" },
            { id: 120104, name: "国产二手车" },
            { id: 120105, name: "其他" }
          ]
        },
        {
          id: 1202,
          name: "二手手机",
          children: [
            { id: 120201, name: "小米" },
            { id: 120202, name: "华为" },
            { id: 120203, name: "苹果" },
            { id: 120204, name: "OPPO" },
            { id: 120205, name: "vivo" },
            { id: 120206, name: "三星" },
            { id: 120207, name: "其他" }
          ]
        },
        {
          id: 1203,
          name: "二手电脑",
          children: [
            { id: 120301, name: "笔记本" },
            { id: 120302, name: "台式机" },
            { id: 120303, name: "平板" }
          ]
        },
        {
          id: 1204,
          name: "二手家电",
          children: [
            { id: 120401, name: "电视" },
            { id: 120402, name: "冰箱" },
            { id: 120403, name: "洗衣机" },
            { id: 120404, name: "空调" },
            { id: 120405, name: "热水器" },
            { id: 120406, name: "小家电" },
            { id: 120407, name: "其他" }
          ]
        },
        {
          id: 1205,
          name: "二手家具",
          children: [
            { id: 120501, name: "床" },
            { id: 120502, name: "衣柜" },
            { id: 120503, name: "沙发" },
            { id: 120504, name: "茶几" },
            { id: 120505, name: "电视柜" },
            { id: 120506, name: "其他" }
          ]
        },
        {
          id: 1206,
          name: "二手奢饰品",
          children: [
            { id: 120601, name: "箱包" },
            { id: 120602, name: "饰品" },
            { id: 120603, name: "鞋帽" },
            { id: 120604, name: "服装" }
          ]
        }
      ]
    },
    // 13. 人力服务需求
    {
      id: 13,
      name: "人力服务需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 1301,
          name: "企业直聘",
          children: [
            { id: 130101, name: "技术工" },
            { id: 130102, name: "普通工人" },
            { id: 130103, name: "工程师" }
          ]
        },
        {
          id: 1302,
          name: "技工兼职",
          children: [
            { id: 130201, name: "设计" },
            { id: 130202, name: "制图" },
            { id: 130203, name: "技工" },
            { id: 130204, name: "装修工人" },
            { id: 130205, name: "普通人员" }
          ]
        },
        {
          id: 1303,
          name: "服务型人员",
          children: [
            { id: 130301, name: "月嫂" },
            { id: 130302, name: "保姆" },
            { id: 130303, name: "陪护" },
            { id: 130304, name: "管家" }
          ]
        },
        {
          id: 1304,
          name: "设计师",
          children: [
            { id: 130401, name: "服装" },
            { id: 130402, name: "产品" },
            { id: 130403, name: "机械" },
            { id: 130404, name: "珠宝" },
            { id: 130405, name: "IT" },
            { id: 130406, name: "建筑" }
          ]
        }
      ]
    },
    // 14. 医疗就医需求
    {
      id: 14,
      name: "医疗就医需求",
      icon: "/static/icons/Health.png",
      subCategories: [
        {
          id: 1401,
          name: "医疗服务",
          children: [
            { id: 140101, name: "家庭医生" },
            { id: 140102, name: "上门换药" },
            { id: 140103, name: "临床陪护" }
          ]
        },
        {
          id: 1402,
          name: "医疗用品",
          children: [
            { id: 140201, name: "医疗器械" },
            { id: 140202, name: "卫生用品" }
          ]
        },
        {
          id: 1403,
          name: "求诊",
          children: [
            { id: 140301, name: "外科" },
            { id: 140302, name: "内科" },
            { id: 140303, name: "中医" },
            { id: 140304, name: "妇产科" },
            { id: 140305, name: "儿科" },
            { id: 140306, name: "心脑科" },
            { id: 140307, name: "牙齿口腔" },
            { id: 140308, name: "皮肤美容" },
            { id: 140309, name: "精神科" }
          ]
        }
      ]
    },
    // 15. 艺术品奢饰品需求
    {
      id: 15,
      name: "艺术品奢饰品需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 1501,
          name: "珠宝腕表",
          children: [
            { id: 150101, name: "珠宝" },
            { id: 150102, name: "腕表" }
          ]
        },
        {
          id: 1502,
          name: "箱包配饰",
          children: [
            { id: 150201, name: "箱包" },
            { id: 150202, name: "配饰" },
            { id: 150203, name: "衣装" },
            { id: 150204, name: "鞋帽" },
            { id: 150205, name: "设计师" }
          ]
        },
        {
          id: 1503,
          name: "绘画雕塑类",
          children: [
            { id: 150301, name: "西洋画" },
            { id: 150302, name: "国画" },
            { id: 150303, name: "书法" },
            { id: 150204, name: "雕塑" }
          ]
        },
        {
          id: 1504,
          name: "古董类",
          children: [
            { id: 150401, name: "瓷器" },
            { id: 150402, name: "玉器宝石" },
            { id: 150403, name: "字画" }
          ]
        },
        {
          id: 1505,
          name: "家居类",
          children: [
            { id: 150501, name: "家装摆件" },
            { id: 150502, name: "家具" }
          ]
        }
      ]
    },
    // 16. 交友相亲需求
    {
      id: 16,
      name: "交友相亲需求",
      icon: "/static/icons/help.png",
      subCategories: [
        {
          id: 1601,
          name: "按性别分",
          children: [
            { id: 160101, name: "男" },
            { id: 160102, name: "女" }
          ]
        }
      ]
    }
  ];
  const _imports_1$5 = "/static/icons/bids.png";
  const _imports_0$6 = "/static/icons/deadline.png";
  const _sfc_main$s = {
    __name: "ProjectCard",
    props: {
      project: {
        type: Object,
        required: true
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const formattedDeadline = vue.computed(() => {
        if (!props.project.deadline)
          return "N/A";
        return props.project.deadline.split("T")[0];
      });
      const __returned__ = { props, formattedDeadline, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$s(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "project-card-glass" }, [
      vue.createElementVNode("view", { class: "card-header" }, [
        vue.createElementVNode(
          "text",
          { class: "project-title" },
          vue.toDisplayString($props.project.title),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "budget-tag" }, [
          vue.createElementVNode(
            "text",
            null,
            "¥" + vue.toDisplayString($props.project.budget_min) + "-¥" + vue.toDisplayString($props.project.budget_max),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "card-body" }, [
        vue.createElementVNode(
          "text",
          { class: "project-description" },
          vue.toDisplayString($props.project.description),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "card-footer" }, [
        vue.createElementVNode("view", { class: "footer-item" }, [
          vue.createElementVNode("image", {
            class: "footer-icon",
            src: _imports_1$5
          }),
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($props.project.bid_count || 0) + "人投标",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "footer-item" }, [
          vue.createElementVNode("image", {
            class: "footer-icon",
            src: _imports_0$6
          }),
          vue.createElementVNode(
            "text",
            null,
            "截止: " + vue.toDisplayString($setup.formattedDeadline),
            1
            /* TEXT */
          )
        ])
      ])
    ]);
  }
  const ProjectCard = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$s], ["__scopeId", "data-v-05ca8cb4"], ["__file", "F:/new/success/uniappandroid/components/ProjectCard.vue"]]);
  const _imports_1$4 = "/static/images/empty-box.png";
  const _sfc_main$r = {
    __name: "list",
    setup(__props, { expose: __expose }) {
      __expose();
      const projectStore = useProjectStore();
      const projects = vue.ref([]);
      const loading = vue.ref(false);
      const hasMore = vue.ref(true);
      const queryParams = vue.reactive({
        page: 1,
        size: 10,
        keyword: "",
        // 修改：使用 categoryId 进行筛选
        category_id: null,
        sort: "latest"
      });
      const mainCategories = vue.ref(projectCategories);
      const subCategories = vue.ref([]);
      const childCategories = vue.ref([]);
      const mainCategoryIndex = vue.ref(-1);
      const subCategoryIndex = vue.ref(-1);
      const childCategoryIndex = vue.ref(-1);
      const category_id = vue.ref(0);
      const selectedMainCategory = vue.computed(() => {
        return mainCategoryIndex.value >= 0 ? mainCategories.value[mainCategoryIndex.value] : null;
      });
      const selectedSubCategory = vue.computed(() => {
        return subCategoryIndex.value >= 0 ? subCategories.value[subCategoryIndex.value] : null;
      });
      const selectedChildCategory = vue.computed(() => {
        return childCategoryIndex.value >= 0 ? childCategories.value[childCategoryIndex.value] : null;
      });
      const onMainCategoryChange = (e) => {
        const index = parseInt(e.detail.value);
        mainCategoryIndex.value = index;
        subCategoryIndex.value = -1;
        childCategoryIndex.value = -1;
        queryParams.category_id = null;
        if (selectedMainCategory.value && selectedMainCategory.value.subCategories) {
          subCategories.value = selectedMainCategory.value.subCategories;
        } else {
          subCategories.value = [];
        }
        childCategories.value = [];
        loadData(true);
      };
      const onSubCategoryChange = (e) => {
        const index = parseInt(e.detail.value);
        subCategoryIndex.value = index;
        childCategoryIndex.value = -1;
        queryParams.category_id = null;
        if (selectedSubCategory.value && selectedSubCategory.value.children) {
          childCategories.value = selectedSubCategory.value.children;
        } else {
          childCategories.value = [];
        }
        loadData(true);
      };
      const onChildCategoryChange = (e) => {
        const index = parseInt(e.detail.value);
        childCategoryIndex.value = index;
        if (selectedChildCategory.value) {
          queryParams.category_id = selectedChildCategory.value.id;
        } else {
          queryParams.category_id = null;
        }
        loadData(true);
      };
      const resetCategoryFilter = () => {
        mainCategoryIndex.value = -1;
        subCategoryIndex.value = -1;
        childCategoryIndex.value = -1;
        subCategories.value = [];
        childCategories.value = [];
        queryParams.category_id = null;
        loadData(true);
      };
      const sortOptions = vue.ref([
        { value: "latest", label: "最新发布" },
        { value: "budget_desc", label: "预算从高到低" },
        { value: "budget_asc", label: "预算从低到高" }
      ]);
      const sortIndex = vue.ref(0);
      const loadData = async (refresh = false) => {
        if (loading.value)
          return;
        loading.value = true;
        if (refresh) {
          queryParams.page = 1;
          queryParams.category_id = category_id.value;
          projects.value = [];
          hasMore.value = true;
        }
        try {
          const res = await projectStore.getProjectList(queryParams);
          if (res.list && res.list.length > 0) {
            projects.value = [...projects.value, ...res.list];
            queryParams.page++;
            hasMore.value = res.list.length === queryParams.size;
          } else {
            hasMore.value = false;
          }
        } catch (error) {
          formatAppLog("error", "at pages/projects/list.vue:226", "加载项目列表失败:", error);
          uni.showToast({ title: "加载失败", icon: "none" });
        } finally {
          loading.value = false;
        }
      };
      onLoad((option) => {
        try {
          formatAppLog("log", "at pages/projects/list.vue:235", "option里面有什么？", option);
          const receivedKeyword = decodeURIComponent(option.keyword || "");
          queryParams.keyword = receivedKeyword;
          const storedCategoryPath = uni.getStorageSync("selectedBidsID");
          if (storedCategoryPath) {
            formatAppLog("log", "at pages/projects/list.vue:240", "要找到它的分类", storedCategoryPath);
            category_id.value = storedCategoryPath.childCategory.id;
            formatAppLog("log", "at pages/projects/list.vue:243", "分类直达", storedCategoryPath.childCategory.id);
          }
        } catch (e) {
          formatAppLog("error", "at pages/projects/list.vue:246", "Failed to get stored category path:", e);
        }
        loadData(true);
      });
      onReachBottom(() => {
        if (hasMore.value && !loading.value) {
          loadData();
        }
      });
      const handleSearch = () => {
        loadData(true);
      };
      const bindSortChange = (e) => {
        sortIndex.value = e.detail.value;
        queryParams.sort = sortOptions.value[e.detail.value].value;
        loadData(true);
      };
      const goToProjectDetail = (id) => {
        uni.navigateTo({ url: `/pages/projects/detail?id=${id}` });
      };
      const __returned__ = { projectStore, projects, loading, hasMore, queryParams, mainCategories, subCategories, childCategories, mainCategoryIndex, subCategoryIndex, childCategoryIndex, category_id, selectedMainCategory, selectedSubCategory, selectedChildCategory, onMainCategoryChange, onSubCategoryChange, onChildCategoryChange, resetCategoryFilter, sortOptions, sortIndex, loadData, handleSearch, bindSortChange, goToProjectDetail, ref: vue.ref, reactive: vue.reactive, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onReachBottom() {
        return onReachBottom;
      }, get useProjectStore() {
        return useProjectStore;
      }, get projectCategories() {
        return projectCategories;
      }, ProjectCard };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$r(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b, _c, _d;
    return vue.openBlock(), vue.createElementBlock("view", { class: "list-container" }, [
      vue.createElementVNode("view", { class: "header-fixed" }, [
        vue.createElementVNode("view", { class: "search-bar-glass" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.queryParams.keyword = $event),
              placeholder: "搜索项目关键词",
              onConfirm: $setup.handleSearch
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $setup.queryParams.keyword]
          ])
        ]),
        vue.createElementVNode("view", { class: "filter-sort-bar" }, [
          vue.createElementVNode("view", { class: "category-cascader-wrapper" }, [
            vue.createElementVNode("picker", {
              onChange: $setup.onMainCategoryChange,
              value: $setup.mainCategoryIndex,
              range: $setup.mainCategories,
              "range-key": "name"
            }, [
              vue.createElementVNode("view", { class: "picker-item" }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(((_a = $setup.selectedMainCategory) == null ? void 0 : _a.name) || "一级分类"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "arrow-down" }, "▾")
              ])
            ], 40, ["value", "range"]),
            $setup.selectedMainCategory && $setup.subCategories.length > 0 ? (vue.openBlock(), vue.createElementBlock("picker", {
              key: 0,
              onChange: $setup.onSubCategoryChange,
              value: $setup.subCategoryIndex,
              range: $setup.subCategories,
              "range-key": "name"
            }, [
              vue.createElementVNode("view", { class: "picker-item" }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(((_b = $setup.selectedSubCategory) == null ? void 0 : _b.name) || "二级分类"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "arrow-down" }, "▾")
              ])
            ], 40, ["value", "range"])) : vue.createCommentVNode("v-if", true),
            $setup.selectedSubCategory && $setup.childCategories.length > 0 ? (vue.openBlock(), vue.createElementBlock("picker", {
              key: 1,
              onChange: $setup.onChildCategoryChange,
              value: $setup.childCategoryIndex,
              range: $setup.childCategories,
              "range-key": "name"
            }, [
              vue.createElementVNode("view", { class: "picker-item" }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(((_c = $setup.selectedChildCategory) == null ? void 0 : _c.name) || "三级分类"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "arrow-down" }, "▾")
              ])
            ], 40, ["value", "range"])) : vue.createCommentVNode("v-if", true),
            $setup.selectedChildCategory || $setup.selectedSubCategory || $setup.selectedMainCategory ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "reset-btn",
              onClick: $setup.resetCategoryFilter
            }, [
              vue.createElementVNode("text", null, "重置")
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "sort-wrapper" }, [
            vue.createElementVNode("picker", {
              onChange: $setup.bindSortChange,
              value: $setup.sortIndex,
              range: $setup.sortOptions,
              "range-key": "label"
            }, [
              vue.createElementVNode("view", { class: "picker-item" }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(((_d = $setup.sortOptions[$setup.sortIndex]) == null ? void 0 : _d.label) || "默认排序"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "arrow-down" }, "▾")
              ])
            ], 40, ["value", "range"])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "project-list-container" }, [
        $setup.projects.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "project-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.projects, (project) => {
              return vue.openBlock(), vue.createBlock($setup["ProjectCard"], {
                key: project.id,
                project,
                onClick: ($event) => $setup.goToProjectDetail(project.id)
              }, null, 8, ["project", "onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "status-view"
        }, [
          vue.createElementVNode("text", { class: "status-text" }, "加载中...")
        ])) : vue.createCommentVNode("v-if", true),
        !$setup.loading && $setup.projects.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "status-view empty-state"
        }, [
          vue.createElementVNode("image", {
            src: _imports_1$4,
            class: "empty-icon"
          }),
          vue.createElementVNode("text", { class: "status-text" }, "暂无相关项目")
        ])) : vue.createCommentVNode("v-if", true),
        !$setup.loading && $setup.projects.length > 0 && !$setup.hasMore ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "status-view"
        }, [
          vue.createElementVNode("text", { class: "status-text" }, "没有更多了")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesProjectsList = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$r], ["__scopeId", "data-v-16e737a9"], ["__file", "F:/new/success/uniappandroid/pages/projects/list.vue"]]);
  function processImageUrl(url) {
    if (!url)
      return url;
    let processedUrl = url.replace(/\\/g, "/");
    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
      formatAppLog("log", "at api/upload.js:17", "如果替换处理后的图片URL:", processedUrl);
      processedUrl = "http://115.190.38.218/api" + processedUrl;
    }
    formatAppLog("log", "at api/upload.js:22", "处理后的图片URL:", processedUrl);
    return processedUrl;
  }
  function uploadImage(filePath) {
    return new Promise((resolve, reject) => {
      if (!filePath) {
        reject(new Error("文件路径不能为空"));
        return;
      }
      const userStore = useUserStore$1();
      const token = userStore.token;
      formatAppLog("log", "at api/upload.js:44", "准备上传图片:", filePath);
      uni.uploadFile({
        url: APP_CONFIG.API_BASE_URL + "/upload/image",
        filePath,
        name: "file",
        header: token ? { "Authorization": `Bearer ${token}` } : {},
        success: (res) => {
          formatAppLog("log", "at api/upload.js:52", "上传图片响应:", res.statusCode, res.data);
          if (res.statusCode !== 200) {
            reject(new Error(`上传失败，状态码: ${res.statusCode}`));
            return;
          }
          try {
            const data = JSON.parse(res.data);
            if ((data.code === 0 || data.code === 200) && data.data && data.data.url) {
              const url = processImageUrl(data.data.url);
              resolve({ url });
            } else {
              reject(new Error(data.message || "上传失败"));
            }
          } catch (error) {
            formatAppLog("error", "at api/upload.js:70", "解析上传响应失败:", error, res.data);
            reject(new Error("解析上传响应失败"));
          }
        },
        fail: (error) => {
          formatAppLog("error", "at api/upload.js:75", "上传图片请求失败:", error);
          reject(error);
        }
      });
    });
  }
  function uploadPdf(filePath) {
    return new Promise((resolve, reject) => {
      if (!filePath) {
        reject(new Error("文件路径不能为空"));
        return;
      }
      const userStore = useUserStore$1();
      const token = userStore.token;
      formatAppLog("log", "at api/upload.js:98", "准备上传PDF:", filePath);
      uni.uploadFile({
        url: APP_CONFIG.API_BASE_URL + "/upload/pdf",
        filePath,
        name: "file",
        header: token ? { "Authorization": `Bearer ${token}` } : {},
        success: (res) => {
          formatAppLog("log", "at api/upload.js:106", "上传PDF响应:", res.statusCode, res.data);
          if (res.statusCode !== 200) {
            reject(new Error(`上传失败，状态码: ${res.statusCode}`));
            return;
          }
          try {
            const data = JSON.parse(res.data);
            if ((data.code === 0 || data.code === 200) && data.data && data.data.url) {
              const url = processImageUrl(data.data.url);
              resolve({ url });
            } else {
              reject(new Error(data.message || "上传失败"));
            }
          } catch (error) {
            formatAppLog("error", "at api/upload.js:124", "解析上传响应失败:", error, res.data);
            reject(new Error("解析上传响应失败"));
          }
        },
        fail: (error) => {
          formatAppLog("error", "at api/upload.js:129", "上传PDF请求失败:", error);
          reject(error);
        }
      });
    });
  }
  function uploadMultiple(filePaths) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(filePaths) || filePaths.length === 0) {
        reject(new Error("文件列表为空"));
        return;
      }
      if (filePaths.length > 10) {
        reject(new Error("一次最多上传10个文件"));
        return;
      }
      const userStore = useUserStore$1();
      const token = userStore.token;
      formatAppLog("log", "at api/upload.js:157", "准备批量上传文件:", filePaths.length, "个文件");
      filePaths.forEach((path, index) => {
      });
      uni.uploadFile({
        url: APP_CONFIG.API_BASE_URL + "/upload/multiple",
        files: filePaths.map((path) => ({
          name: "files",
          uri: path
        })),
        header: token ? { "Authorization": `Bearer ${token}` } : {},
        success: (res) => {
          formatAppLog("log", "at api/upload.js:175", "批量上传响应:", res.statusCode, res.data);
          if (res.statusCode !== 200) {
            reject(new Error(`上传失败，状态码: ${res.statusCode}`));
            return;
          }
          try {
            const data = JSON.parse(res.data);
            if ((data.code === 0 || data.code === 200) && data.data && data.data.urls) {
              const processedUrls = data.data.urls.map((url) => processImageUrl(url));
              resolve({ urls: processedUrls });
            } else {
              reject(new Error(data.message || "上传失败"));
            }
          } catch (error) {
            formatAppLog("error", "at api/upload.js:192", "解析上传响应失败:", error, res.data);
            reject(new Error("解析上传响应失败"));
          }
        },
        fail: (error) => {
          formatAppLog("error", "at api/upload.js:197", "批量上传请求失败:", error);
          reject(error);
        }
      });
    });
  }
  async function uploadFilesSequentially(filePaths) {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return Promise.reject(new Error("文件列表为空"));
    }
    if (filePaths.length > 10) {
      return Promise.reject(new Error("一次最多上传10个文件"));
    }
    const urls = [];
    const userStore = useUserStore$1();
    const token = userStore.token;
    for (const filePath of filePaths) {
      try {
        formatAppLog("log", "at api/upload.js:226", "准备上传文件:", filePath);
        const isPdf = filePath.toLowerCase().endsWith(".pdf");
        const uploadUrl = isPdf ? APP_CONFIG.API_BASE_URL + "/upload/pdf" : APP_CONFIG.API_BASE_URL + "/upload/image";
        const uploadResult = await new Promise((resolve, reject) => {
          uni.uploadFile({
            url: uploadUrl,
            filePath,
            name: "file",
            header: token ? { "Authorization": `Bearer ${token}` } : {},
            success: (res) => {
              formatAppLog("log", "at api/upload.js:242", "上传响应:", res.statusCode, res.data);
              if (res.statusCode !== 200) {
                reject(new Error(`上传失败，状态码: ${res.statusCode}`));
                return;
              }
              try {
                const data = JSON.parse(res.data);
                if ((data.code === 0 || data.code === 200) && data.data && data.data.url) {
                  const url = processImageUrl(data.data.url);
                  resolve({ url });
                } else {
                  reject(new Error(data.message || "上传失败"));
                }
              } catch (error) {
                formatAppLog("error", "at api/upload.js:259", "解析上传响应失败:", error, res.data);
                reject(new Error("解析上传响应失败"));
              }
            },
            fail: (error) => {
              formatAppLog("error", "at api/upload.js:264", "上传请求失败:", error);
              reject(error);
            }
          });
        });
        if (uploadResult && uploadResult.url) {
          urls.push(uploadResult.url);
        }
      } catch (error) {
        formatAppLog("error", "at api/upload.js:274", "上传文件失败:", filePath, error);
      }
    }
    return { urls };
  }
  function uploadVideo(filePath) {
    return new Promise((resolve, reject) => {
      if (!filePath) {
        reject(new Error("文件路径不能为空"));
        return;
      }
      const userStore = useUserStore$1();
      const token = userStore.token;
      formatAppLog("log", "at api/upload.js:298", "准备上传视频:", filePath);
      uni.uploadFile({
        url: APP_CONFIG.API_BASE_URL + "/upload/video",
        filePath,
        name: "file",
        header: token ? { "Authorization": `Bearer ${token}` } : {},
        timeout: 12e4,
        // 2分钟超时
        success: (res) => {
          formatAppLog("log", "at api/upload.js:308", "上传视频响应:", res.statusCode, res.data);
          if (res.statusCode !== 200) {
            let errorMsg = `上传失败，状态码: ${res.statusCode}`;
            if (res.statusCode === 502) {
              errorMsg = "服务器暂时不可用，请稍后重试";
            } else if (res.statusCode === 413) {
              errorMsg = "视频文件过大";
            } else if (res.statusCode === 408) {
              errorMsg = "上传超时";
            }
            reject(new Error(errorMsg));
            return;
          }
          try {
            const data = JSON.parse(res.data);
            if ((data.code === 0 || data.code === 200) && data.data && data.data.url) {
              const url = processImageUrl(data.data.url);
              resolve({ url });
            } else {
              reject(new Error(data.message || "上传失败"));
            }
          } catch (error) {
            formatAppLog("error", "at api/upload.js:332", "解析上传响应失败:", error, res.data);
            reject(new Error("解析上传响应失败"));
          }
        },
        fail: (error) => {
          formatAppLog("error", "at api/upload.js:337", "上传视频请求失败:", error);
          let errorMsg = "上传失败";
          if (error.errMsg) {
            if (error.errMsg.includes("timeout")) {
              errorMsg = "上传超时，请检查网络连接";
            } else if (error.errMsg.includes("network")) {
              errorMsg = "网络连接异常";
            }
          }
          reject(new Error(errorMsg));
        }
      });
    });
  }
  const _sfc_main$q = {
    __name: "detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const projectStore = useProjectStore();
      const userStore = useUserStore$1();
      const messageStore = useMessageStore();
      const projectId = vue.ref(null);
      const project = vue.ref(null);
      const bids = vue.ref([]);
      const loading = vue.ref(true);
      const showBidPopup = vue.ref(false);
      const bidForm = vue.ref({
        price: 0,
        delivery_days: "",
        description: "",
        images: [],
        // 图片附件列表 [{url: '...', name: '...'}]
        documents: [],
        // PDF文档列表 [{url: '...', name: '...'}]
        video: null
      });
      onLoad((options) => {
        projectId.value = options.id;
        loadData();
      });
      const isOwner = vue.computed(() => {
        var _a, _b;
        return ((_a = userStore.userInfo) == null ? void 0 : _a.id) == ((_b = project.value) == null ? void 0 : _b.publisher.id);
      });
      const hasBid = vue.computed(() => bids.value.some((bid) => {
        var _a;
        return bid.bidder.id == ((_a = userStore.userInfo) == null ? void 0 : _a.id);
      }));
      const canBid = vue.computed(() => project.value && (project.value.status === "bidding" || project.value.status === 0) && !isOwner.value && !hasBid.value);
      const formattedDeadline = vue.computed(() => {
        var _a;
        if (!((_a = project.value) == null ? void 0 : _a.deadline))
          return "N/A";
        return project.value.deadline.split("T")[0];
      });
      const onDateChange = (e) => {
        bidForm.value.delivery_days = e.detail.value;
      };
      const loadData = async () => {
        loading.value = true;
        try {
          const projRes = await projectStore.getProjectDetail(projectId.value);
          project.value = projRes;
          formatAppLog("log", "at pages/projects/detail.vue:349", "这项目详情里有什么？", project.value);
          if (projRes && projRes.id) {
            try {
              if (typeof projectStore.getBidList === "function") {
                const bidsRes = await projectStore.getBidList(projectId.value);
                bids.value = bidsRes.list || bidsRes || [];
              } else {
                bids.value = [];
              }
            } catch (bidError) {
              formatAppLog("warn", "at pages/projects/detail.vue:363", "加载投标列表失败，使用空列表:", bidError);
              bids.value = [];
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/projects/detail.vue:368", "加载详情失败:", error);
          uni.showToast({ title: "加载失败", icon: "none" });
        } finally {
          loading.value = false;
        }
      };
      const projectAttachments = vue.computed(() => {
        const attachments = { images: [], pdfs: [], videos: [] };
        if (!project.value || !project.value.attachments) {
          return attachments;
        }
        let attachmentUrls = [];
        if (typeof project.value.attachments === "string") {
          attachmentUrls = project.value.attachments.split(",").map((url) => url.trim()).filter((url) => url);
        } else if (Array.isArray(project.value.attachments)) {
          attachmentUrls = project.value.attachments;
        } else {
          formatAppLog("warn", "at pages/projects/detail.vue:389", "project.attachments 格式不支持:", project.value.attachments);
          return attachments;
        }
        attachmentUrls.forEach((url) => {
          if (typeof url === "string") {
            const lowerUrl = url.toLowerCase();
            const fileName = url.substring(url.lastIndexOf("/") + 1);
            if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) => lowerUrl.endsWith(ext))) {
              attachments.images.push({ url });
            } else if (lowerUrl.endsWith(".pdf")) {
              attachments.pdfs.push({ url, name: fileName || "未命名.pdf" });
            } else if ([".mp4", ".mov", ".avi", ".wmv", ".flv", ".mkv"].some((ext) => lowerUrl.endsWith(ext))) {
              attachments.videos.push({ url, name: fileName || "未命名视频" });
            }
          }
        });
        return attachments;
      });
      const previewImage = (index) => {
        const urls = projectAttachments.value.images.map((img) => img.url);
        if (urls.length > 0) {
          uni.previewImage({
            urls,
            current: index
          });
        }
      };
      const downloadPdf = (pdfItem) => {
        if (typeof plus === "undefined" || !plus.downloader) {
          uni.showToast({ title: "下载功能不可用", icon: "none" });
          return;
        }
        uni.showLoading({ title: "正在下载..." });
        const dtask = plus.downloader.createDownload(pdfItem.url, { filename: "_doc/downloads/" }, (d, status) => {
          uni.hideLoading();
          if (status === 200) {
            formatAppLog("log", "at pages/projects/detail.vue:438", "下载成功: " + d.filename);
            uni.showToast({ title: "下载成功", icon: "success" });
            uni.showModal({
              title: "下载完成",
              content: `文件已保存至: ${d.filename}. 是否尝试打开?`,
              success: function(res) {
                if (res.confirm) {
                  plus.runtime.openFile(d.filename, {}, (e) => {
                    formatAppLog("error", "at pages/projects/detail.vue:448", "打开文件失败:", e);
                    uni.showToast({ title: "打开文件失败", icon: "none" });
                  });
                }
              }
            });
          } else {
            formatAppLog("error", "at pages/projects/detail.vue:455", "下载失败: " + status);
            uni.showToast({ title: "下载失败", icon: "none" });
          }
        });
        dtask.start();
        dtask.addEventListener("statechanged", (download2, status) => {
        });
      };
      const openBidPopup = () => {
        formatAppLog("log", "at pages/projects/detail.vue:483", "点击去投标按钮");
        formatAppLog("log", "at pages/projects/detail.vue:484", "项目状态:", project.value.status);
        formatAppLog("log", "at pages/projects/detail.vue:485", "是否为项目所有者:", isOwner.value);
        formatAppLog("log", "at pages/projects/detail.vue:486", "是否已投标:", hasBid.value);
        formatAppLog("log", "at pages/projects/detail.vue:487", "canBid计算值:", canBid.value);
        if (!canBid.value) {
          if (hasBid.value) {
            formatAppLog("log", "at pages/projects/detail.vue:491", "原因: 用户已投标");
            uni.showToast({ title: "您已经投过标了", icon: "none" });
          } else if (project.value.status !== "bidding" && project.value.status !== 0) {
            formatAppLog("log", "at pages/projects/detail.vue:494", "原因: 项目状态不是招标中，当前状态:", project.value.status);
            uni.showToast({ title: "项目已不在招标中", icon: "none" });
          } else if (isOwner.value) {
            formatAppLog("log", "at pages/projects/detail.vue:497", "原因: 用户是项目所有者");
            uni.showToast({ title: "不能给自己的项目投标", icon: "none" });
          } else {
            formatAppLog("log", "at pages/projects/detail.vue:500", "原因: 其他未知原因");
            uni.showToast({ title: "无法投标", icon: "none" });
          }
          return;
        }
        formatAppLog("log", "at pages/projects/detail.vue:506", "打开投标弹窗");
        showBidPopup.value = true;
      };
      const closeBidPopup = () => {
        showBidPopup.value = false;
        bidForm.value = {
          price: 0,
          delivery_days: 1,
          description: "",
          images: [],
          documents: [],
          video: null
        };
      };
      const chooseImage = () => {
        const maxCount = 5 - bidForm.value.images.length;
        if (maxCount <= 0) {
          uni.showToast({ title: "最多上传5张图片", icon: "none" });
          return;
        }
        uni.chooseImage({
          count: maxCount,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"],
          success: async (res) => {
            try {
              uni.showLoading({ title: "上传中..." });
              const results = await uploadFilesSequentially(res.tempFilePaths);
              if (results && results.urls && results.urls.length > 0) {
                for (let i = 0; i < res.tempFilePaths.length; i++) {
                  const filePath = res.tempFilePaths[i];
                  const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
                  if (i < results.urls.length) {
                    bidForm.value.images.push({
                      url: results.urls[i],
                      name: fileName
                    });
                  }
                }
                uni.hideLoading();
                uni.showToast({ title: "上传成功", icon: "success" });
              } else {
                throw new Error("上传失败");
              }
            } catch (error) {
              uni.hideLoading();
              formatAppLog("error", "at pages/projects/detail.vue:562", "上传图片失败:", error);
              uni.showToast({ title: "上传失败", icon: "none" });
            }
          }
        });
      };
      const removeImage = (index) => {
        bidForm.value.images.splice(index, 1);
      };
      const chooseDocument = () => {
        const maxCount = 3 - bidForm.value.documents.length;
        if (maxCount <= 0) {
          uni.showToast({ title: "最多上传3个PDF文档", icon: "none" });
          return;
        }
        plus.io.chooseFile(
          {
            title: "选择PDF文档",
            extension: [".pdf"],
            multiple: false
          },
          (file) => {
            if (file && file.files) {
              handleSelectedDocument(file.files[0]);
            }
          }
        );
      };
      const handleSelectedDocument = async (filePath) => {
        try {
          uni.showLoading({ title: "上传中..." });
          const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
          const result = await uploadPdf(filePath);
          if (result && result.url) {
            bidForm.value.documents.push({
              url: result.url,
              name: fileName
            });
            uni.hideLoading();
            uni.showToast({ title: "上传成功", icon: "success" });
          } else {
            throw new Error("上传失败");
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/projects/detail.vue:654", "上传PDF失败:", error);
          uni.showToast({ title: "上传失败", icon: "none" });
        }
      };
      const removeDocument = (index) => {
        bidForm.value.documents.splice(index, 1);
      };
      const chooseVideo = () => {
        if (bidForm.value.video) {
          uni.showToast({ title: "最多上传1个视频", icon: "none" });
          return;
        }
        uni.chooseVideo({
          sourceType: ["album", "camera"],
          compressed: true,
          success: async (res) => {
            try {
              uni.showLoading({ title: "上传中..." });
              const tempFilePath = res.tempFilePath;
              const fileName = tempFilePath.substring(tempFilePath.lastIndexOf("/") + 1);
              const result = await uploadVideoWithRetry(tempFilePath, fileName);
              if (result && result.url) {
                bidForm.value.video = {
                  url: result.url,
                  name: fileName
                };
                uni.hideLoading();
                uni.showToast({ title: "上传成功", icon: "success" });
              } else {
                throw new Error("上传失败");
              }
            } catch (error) {
              uni.hideLoading();
              formatAppLog("error", "at pages/projects/detail.vue:695", "上传视频失败:", error);
              let errorMsg = "上传失败";
              if (error.message.includes("502")) {
                errorMsg = "服务器暂时不可用，请稍后重试";
              } else if (error.message.includes("timeout")) {
                errorMsg = "上传超时，请检查网络连接";
              } else if (error.message.includes("网络")) {
                errorMsg = "网络连接异常，请重试";
              }
              uni.showModal({
                title: "上传失败",
                content: errorMsg + "，是否重试？",
                confirmText: "重试",
                cancelText: "取消",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    setTimeout(() => {
                      chooseVideo();
                    }, 500);
                  }
                }
              });
            }
          }
        });
      };
      const removeVideo = () => {
        bidForm.value.video = null;
      };
      const uploadVideoWithRetry = async (filePath, fileName, maxRetries = 3) => {
        let lastError = null;
        for (let i = 0; i < maxRetries; i++) {
          try {
            formatAppLog("log", "at pages/projects/detail.vue:737", `视频上传尝试 ${i + 1}/${maxRetries}`);
            if (i > 0) {
              uni.showLoading({
                title: `重试中... (${i + 1}/${maxRetries})`,
                mask: true
              });
            }
            const result = await uploadVideo(filePath);
            if (result && result.url) {
              formatAppLog("log", "at pages/projects/detail.vue:750", "视频上传成功:", result);
              return result;
            } else {
              throw new Error("上传返回结果无效");
            }
          } catch (error) {
            lastError = error;
            formatAppLog("error", "at pages/projects/detail.vue:757", `视频上传第 ${i + 1} 次尝试失败:`, error);
            if (i < maxRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, 2e3 * (i + 1)));
            }
          }
        }
        throw lastError || new Error("上传失败");
      };
      const previewAttachmentVideo = (videoUrl, videoName = "视频") => {
        if (!videoUrl) {
          uni.showToast({ title: "视频不存在", icon: "none" });
          return;
        }
        uni.navigateTo({
          url: `/pages/common/video-player?url=${encodeURIComponent(videoUrl)}&name=${encodeURIComponent(videoName)}`
        });
      };
      const submitBid2 = async () => {
        formatAppLog("log", "at pages/projects/detail.vue:785", "提交投标表单:", bidForm.value);
        if (!bidForm.value.price || !bidForm.value.delivery_days || !bidForm.value.description) {
          formatAppLog("log", "at pages/projects/detail.vue:789", "表单验证失败: 信息不完整");
          uni.showToast({ title: "请填写完整信息", icon: "none" });
          return;
        }
        try {
          formatAppLog("log", "at pages/projects/detail.vue:795", "开始提交投标, 项目ID:", projectId.value);
          const attachments = [
            ...bidForm.value.images.map((img) => img.url),
            ...bidForm.value.documents.map((doc) => doc.url)
          ];
          if (bidForm.value.video && bidForm.value.video.url) {
            attachments.push(bidForm.value.video.url);
          }
          const bidData = {
            price: Number(bidForm.value.price),
            delivery_days: bidForm.value.delivery_days,
            description: bidForm.value.description,
            attachments
            // 添加附件URL数组
          };
          formatAppLog("log", "at pages/projects/detail.vue:812", "投标数据:", bidData);
          await projectStore.submitBid(projectId.value, bidData);
          formatAppLog("log", "at pages/projects/detail.vue:815", "投标提交成功");
          uni.showToast({ title: "投标成功", icon: "success" });
          closeBidPopup();
          loadData();
        } catch (error) {
          formatAppLog("error", "at pages/projects/detail.vue:820", "投标失败:", error);
          uni.showToast({ title: "投标失败", icon: "none" });
        }
      };
      const handleSelectBid = async (bidId) => {
        formatAppLog("log", "at pages/projects/detail.vue:825", "选择投标方案，投标ID:", bidId);
        if (!bidId) {
          formatAppLog("error", "at pages/projects/detail.vue:828", "投标ID无效:", bidId);
          uni.showToast({ title: "无效的投标ID", icon: "none" });
          return;
        }
        const res = await uni.showModal({
          title: "确认选择",
          content: "确定选择该投标方案吗？此操作不可撤销。"
        });
        if (res.confirm) {
          try {
            formatAppLog("log", "at pages/projects/detail.vue:840", "确认选择投标，项目ID:", projectId.value, "投标ID:", bidId);
            await projectStore.selectBid(projectId.value, bidId);
            uni.showToast({ title: "选择成功", icon: "success" });
            loadData();
          } catch (error) {
            formatAppLog("error", "at pages/projects/detail.vue:846", "选择投标失败:", error);
            uni.showToast({ title: "操作失败", icon: "none" });
          }
        }
      };
      const handleContact = async () => {
        if (!userStore.hasLogin) {
          goToLogin();
          return;
        }
        if (isOwner.value) {
          uni.showToast({ title: "不能和自己发起沟通", icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: "正在创建会话..." });
          const chatData = await messageStore.createChat(project.value.publisher.id, {
            projectId: Number(projectId.value),
            projectTitle: project.value.title
          });
          uni.hideLoading();
          uni.navigateTo({
            url: `/pages/messages/chat?chatId=${chatData.id}&targetUserId=${project.value.publisher.id}&targetUserName=${project.value.publisher.username}&projectId=${projectId.value}`
          });
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: "无法发起沟通", icon: "none" });
          formatAppLog("error", "at pages/projects/detail.vue:880", "创建会话失败:", error);
        }
      };
      const cancelProject = async () => {
        const res = await uni.showModal({
          title: "确认取消",
          content: "确定要取消这个项目吗？此操作不可撤销。"
        });
        if (res.confirm) {
          try {
            uni.showLoading({ title: "正在取消..." });
            await projectStore.cancelProject(projectId.value);
            uni.hideLoading();
            uni.showToast({ title: "项目已取消", icon: "success" });
            uni.navigateBack();
          } catch (error) {
            uni.hideLoading();
            uni.showToast({ title: "取消失败", icon: "none" });
            formatAppLog("error", "at pages/projects/detail.vue:899", "取消项目失败:", error);
          }
        }
      };
      const editProject = () => {
        uni.navigateTo({
          url: `/pages/projects/publish?id=${projectId.value}&edit=true`
        });
      };
      const viewBids = () => {
        uni.navigateTo({
          url: `/pages/user/projects?id=${projectId.value}&view=bids`
        });
      };
      const contactUser = (userId) => {
        if (!userId)
          return;
        uni.navigateTo({
          url: `/pages/messages/chat?targetUserId=${userId}`
        });
      };
      const goToLogin = () => {
        uni.navigateTo({ url: "/pages/login/index" });
      };
      const goToUserProfile = (userId) => {
        if (!userId) {
          uni.showToast({ title: "用户ID不存在", icon: "none" });
          return;
        }
        uni.navigateTo({ url: `/pages/user/profile?id=${userId}` });
      };
      const __returned__ = { projectStore, userStore, messageStore, projectId, project, bids, loading, showBidPopup, bidForm, isOwner, hasBid, canBid, formattedDeadline, onDateChange, loadData, projectAttachments, previewImage, downloadPdf, openBidPopup, closeBidPopup, chooseImage, removeImage, chooseDocument, handleSelectedDocument, removeDocument, chooseVideo, removeVideo, uploadVideoWithRetry, previewAttachmentVideo, submitBid: submitBid2, handleSelectBid, handleContact, cancelProject, editProject, viewBids, contactUser, goToLogin, goToUserProfile, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get useProjectStore() {
        return useProjectStore;
      }, get useUserStore() {
        return useUserStore$1;
      }, get useMessageStore() {
        return useMessageStore;
      }, get uploadImage() {
        return uploadImage;
      }, get uploadPdf() {
        return uploadPdf;
      }, get uploadMultiple() {
        return uploadMultiple;
      }, get uploadFilesSequentially() {
        return uploadFilesSequentially;
      }, get uploadVideo() {
        return uploadVideo;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$q(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "detail-container" }, [
      $setup.project ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
        vue.createElementVNode("view", { class: "card-glass" }, [
          vue.createElementVNode(
            "view",
            { class: "project-title" },
            vue.toDisplayString($setup.project.title),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "info-grid" }, [
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "预算"),
              vue.createElementVNode(
                "text",
                { class: "info-value price" },
                "¥" + vue.toDisplayString($setup.project.budget_min) + "-¥" + vue.toDisplayString($setup.project.budget_max),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "交付周期"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.project.delivery_time) + " 天",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "投标数"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.project.bid_count),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "deadline-info" }, [
            vue.createElementVNode("image", {
              class: "icon",
              src: _imports_0$6
            }),
            vue.createElementVNode(
              "text",
              null,
              "投标截止日期: " + vue.toDisplayString($setup.formattedDeadline),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "card-glass" }, [
          vue.createElementVNode("view", { class: "card-title" }, "项目描述"),
          vue.createElementVNode(
            "text",
            { class: "description-text" },
            vue.toDisplayString($setup.project.description),
            1
            /* TEXT */
          )
        ]),
        $setup.projectAttachments.images.length > 0 || $setup.projectAttachments.pdfs.length > 0 || $setup.projectAttachments.videos.length > 0 ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
          key: 0,
          class: "card-glass"
        }, [
          vue.createElementVNode("view", { class: "card-title" }, "项目附件"),
          $setup.projectAttachments.images.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "attachments-section"
          }, [
            vue.createElementVNode("view", { class: "section-subtitle" }, "图片 (点击预览)"),
            vue.createElementVNode("view", { class: "image-attachments" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.projectAttachments.images, (img, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: "img_" + index,
                    class: "image-attachment-item",
                    onClick: ($event) => $setup.previewImage(index)
                  }, [
                    vue.createElementVNode("image", {
                      src: img.url,
                      class: "attachment-image-thumb",
                      mode: "aspectFill"
                    }, null, 8, ["src"])
                  ], 8, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true),
          $setup.projectAttachments.videos.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "attachments-section"
          }, [
            vue.createElementVNode("view", { class: "section-subtitle" }, "视频"),
            vue.createElementVNode("view", { class: "video-attachments" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.projectAttachments.videos, (video, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: "video_" + index,
                    class: "video-attachment-item"
                  }, [
                    vue.createElementVNode("view", {
                      class: "video-attachment-preview",
                      onClick: ($event) => $setup.previewAttachmentVideo(video.url, video.name)
                    }, [
                      vue.createElementVNode("view", { class: "video-cover-placeholder" }, [
                        vue.createElementVNode("view", { class: "video-icon" }, "📹")
                      ]),
                      vue.createElementVNode("view", { class: "video-play-icon" }, [
                        vue.createElementVNode("view", { class: "play-triangle" })
                      ]),
                      vue.createElementVNode("view", { class: "video-info" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "video-name" },
                          vue.toDisplayString(video.name),
                          1
                          /* TEXT */
                        )
                      ])
                    ], 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true),
          $setup.projectAttachments.pdfs.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "attachments-section"
          }, [
            vue.createElementVNode("view", { class: "section-subtitle" }, "文档 (点击下载)"),
            vue.createElementVNode("view", { class: "pdf-attachments" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.projectAttachments.pdfs, (pdf, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: "pdf_" + index,
                    class: "pdf-attachment-item"
                  }, [
                    vue.createElementVNode("view", { class: "pdf-info" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "pdf-name" },
                        vue.toDisplayString(pdf.name),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("button", {
                      class: "download-btn",
                      onClick: ($event) => $setup.downloadPdf(pdf)
                    }, "下载", 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "card-glass publisher-card" }, [
          vue.createElementVNode("view", { class: "card-title" }, "发布者"),
          vue.createElementVNode("view", { class: "publisher-info" }, [
            vue.createElementVNode("image", {
              class: "avatar",
              src: $setup.project.publisher.avatar || "",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.goToUserProfile($setup.project.publisher.id))
            }, null, 8, ["src"]),
            vue.createElementVNode("view", {
              class: "publisher-details",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.goToUserProfile($setup.project.publisher.id))
            }, [
              vue.createElementVNode(
                "text",
                { class: "username" },
                vue.toDisplayString($setup.project.publisher.username),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "rating-line" }, [
                vue.createElementVNode("text", { class: "rating-label" }, "信誉分: "),
                vue.createElementVNode(
                  "text",
                  { class: "rating-score" },
                  vue.toDisplayString($setup.project.publisher.rating),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("button", {
              class: "contact-btn",
              onClick: $setup.handleContact
            }, "联系TA")
          ])
        ]),
        $setup.isOwner && $setup.bids.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "card-glass"
        }, [
          vue.createElementVNode("view", { class: "card-title" }, "投标情况"),
          vue.createElementVNode("view", { class: "bids-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.bids, (bid) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: bid.id,
                  class: "bid-item"
                }, [
                  vue.createElementVNode("view", { class: "bidder-info" }, [
                    vue.createElementVNode("image", {
                      class: "bidder-avatar",
                      src: bid.bidder.avatar || "/static/images/default-avatar.png"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", { class: "bidder-details" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "bidder-name" },
                        vue.toDisplayString(bid.bidder.username),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "bidder-rating" },
                        "信誉分: " + vue.toDisplayString(bid.bidder.rating || 5),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "view",
                      { class: "bid-price" },
                      "¥" + vue.toDisplayString(bid.price),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "view",
                    { class: "bid-delivery" },
                    "交付周期: " + vue.toDisplayString(bid.delivery_days) + "天",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "bid-description" },
                    vue.toDisplayString(bid.description),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "bid-time" },
                    vue.toDisplayString(_ctx.formatDate(bid.created_at)),
                    1
                    /* TEXT */
                  ),
                  $setup.isOwner && $setup.project.status === "bidding" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "bid-actions"
                  }, [
                    vue.createElementVNode("button", {
                      class: "select-bid-btn",
                      onClick: ($event) => $setup.handleSelectBid(bid.id)
                    }, "选择此方案", 8, ["onClick"]),
                    vue.createElementVNode("button", {
                      class: "contact-bidder-btn",
                      onClick: ($event) => $setup.contactUser(bid.bidder.id)
                    }, "联系投标人", 8, ["onClick"])
                  ])) : vue.createCommentVNode("v-if", true)
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $setup.isOwner ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "card-glass"
        }, [
          vue.createElementVNode("view", { class: "card-title" }, "项目管理"),
          vue.createElementVNode("view", { class: "management-actions" }, [
            $setup.project.status === "bidding" ? (vue.openBlock(), vue.createElementBlock("button", {
              key: 0,
              class: "management-btn",
              onClick: $setup.cancelProject
            }, [
              vue.createElementVNode("text", { class: "btn-icon" }, "❌"),
              vue.createElementVNode("text", null, "取消项目")
            ])) : vue.createCommentVNode("v-if", true),
            $setup.project.status === "bidding" ? (vue.openBlock(), vue.createElementBlock("button", {
              key: 1,
              class: "management-btn",
              onClick: $setup.editProject
            }, [
              vue.createElementVNode("text", { class: "btn-icon" }, "✏️"),
              vue.createElementVNode("text", null, "编辑项目")
            ])) : vue.createCommentVNode("v-if", true),
            $setup.bids.length > 0 ? (vue.openBlock(), vue.createElementBlock("button", {
              key: 2,
              class: "management-btn",
              onClick: $setup.viewBids
            }, [
              vue.createElementVNode("text", { class: "btn-icon" }, "👥"),
              vue.createElementVNode(
                "text",
                null,
                "查看全部投标(" + vue.toDisplayString($setup.bids.length) + ")",
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loading-view"
      }, [
        vue.createElementVNode("text", null, "加载中...")
      ])) : vue.createCommentVNode("v-if", true),
      $setup.project ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "action-bar"
      }, [
        !$setup.userStore.hasLogin ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          class: "action-btn bid-btn",
          onClick: $setup.goToLogin
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "🔐"),
          vue.createElementVNode("text", { class: "btn-text" }, "登录后参与")
        ])) : $setup.isOwner ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "owner-actions"
        }, [
          $setup.bids.length > 0 ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            class: "action-btn manage-btn",
            onClick: $setup.viewBids
          }, [
            vue.createElementVNode("text", { class: "btn-icon" }, "👥"),
            vue.createElementVNode("text", { class: "btn-text" }, "项目管理中")
          ])) : vue.createCommentVNode("v-if", true),
          $setup.project.status === "bidding" ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 1,
            class: "action-btn cancel-btn",
            onClick: $setup.cancelProject
          }, [
            vue.createElementVNode("text", { class: "btn-icon" }, "❌"),
            vue.createElementVNode("text", { class: "btn-text" }, "取消项目")
          ])) : vue.createCommentVNode("v-if", true)
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "visitor-actions"
        }, [
          vue.createElementVNode("button", {
            class: "action-btn contact-btn-main",
            onClick: $setup.handleContact
          }, [
            vue.createElementVNode("text", { class: "btn-icon" }, "💬"),
            vue.createElementVNode("text", { class: "btn-text" }, "去沟通")
          ]),
          !$setup.hasBid && ($setup.project.status === "bidding" || $setup.project.status === 0) ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            class: "action-btn bid-btn",
            onClick: $setup.openBidPopup
          }, [
            vue.createElementVNode("text", { class: "btn-icon" }, "📝"),
            vue.createElementVNode("text", { class: "btn-text" }, "去投标")
          ])) : vue.createCommentVNode("v-if", true),
          $setup.hasBid ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "action-text"
          }, [
            vue.createElementVNode("text", { class: "btn-icon" }, "✅"),
            vue.createElementVNode("text", null, "您已投标")
          ])) : vue.createCommentVNode("v-if", true)
        ]))
      ])) : vue.createCommentVNode("v-if", true),
      $setup.showBidPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "popup-mask",
        onClick: $setup.closeBidPopup
      }, [
        vue.createElementVNode("scroll-view", {
          class: "popup-scroll",
          "scroll-y": "true",
          onClick: _cache[4] || (_cache[4] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "popup-content" }, [
            vue.createElementVNode("view", { class: "popup-header" }, [
              vue.createElementVNode("text", { class: "popup-title" }, "提交您的投标方案"),
              vue.createElementVNode("text", {
                class: "close-icon",
                onClick: $setup.closeBidPopup
              }, "×")
            ]),
            vue.createElementVNode("view", { class: "popup-body" }, [
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, "投标报价 (RMB元)"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "form-input",
                    type: "number",
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.bidForm.price = $event),
                    placeholder: "请输入您的报价"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.bidForm.price]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, "预计交付日期"),
                vue.createElementVNode("picker", {
                  mode: "date",
                  value: $setup.bidForm.delivery_days,
                  start: _ctx.minDate,
                  onChange: $setup.onDateChange
                }, [
                  vue.createElementVNode("view", { class: "form-input date-input" }, [
                    vue.createTextVNode(
                      vue.toDisplayString($setup.bidForm.delivery_days || "请选择交付日期") + " ",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "date-arrow" }, "▼")
                  ])
                ], 40, ["value", "start"])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, "方案描述"),
                vue.withDirectives(vue.createElementVNode(
                  "textarea",
                  {
                    class: "form-textarea",
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.bidForm.description = $event)
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.bidForm.description]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, "图片附件 (最多5张)"),
                vue.createElementVNode("view", { class: "upload-area" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.bidForm.images, (img, index) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: "img_" + index,
                        class: "file-item image-item"
                      }, [
                        vue.createElementVNode("image", {
                          src: img.url,
                          class: "uploaded-image",
                          mode: "aspectFill"
                        }, null, 8, ["src"]),
                        vue.createElementVNode("view", {
                          class: "delete-btn",
                          onClick: ($event) => $setup.removeImage(index)
                        }, "×", 8, ["onClick"])
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  $setup.bidForm.images.length < 5 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "upload-btn",
                    onClick: $setup.chooseImage
                  }, [
                    vue.createElementVNode("text", { class: "upload-icon" }, "+"),
                    vue.createElementVNode("text", null, "上传图片")
                  ])) : vue.createCommentVNode("v-if", true)
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, "PDF文档 (最多3个)"),
                vue.createElementVNode("view", { class: "upload-area" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.bidForm.documents, (doc, index) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: "doc_" + index,
                        class: "file-item doc-item"
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "file-name" },
                          vue.toDisplayString(doc.name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", {
                          class: "delete-btn",
                          onClick: ($event) => $setup.removeDocument(index)
                        }, "×", 8, ["onClick"])
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  $setup.bidForm.documents.length < 3 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "upload-btn",
                    onClick: $setup.chooseDocument
                  }, [
                    vue.createElementVNode("text", { class: "upload-icon" }, "+"),
                    vue.createElementVNode("text", null, "上传PDF")
                  ])) : vue.createCommentVNode("v-if", true)
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, "视频附件 (最多1个)"),
                vue.createElementVNode("view", { class: "upload-area" }, [
                  $setup.bidForm.video ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "file-item video-item"
                  }, [
                    vue.createElementVNode("video", {
                      src: $setup.bidForm.video.url,
                      class: "uploaded-video",
                      controls: ""
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", {
                      class: "delete-btn",
                      onClick: $setup.removeVideo
                    }, "×")
                  ])) : vue.createCommentVNode("v-if", true),
                  !$setup.bidForm.video ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "upload-btn",
                    onClick: $setup.chooseVideo
                  }, [
                    vue.createElementVNode("text", { class: "upload-icon" }, "+"),
                    vue.createElementVNode("text", null, "上传视频")
                  ])) : vue.createCommentVNode("v-if", true)
                ])
              ]),
              vue.createElementVNode("button", {
                class: "submit-bid-btn",
                onClick: $setup.submitBid
              }, "确认提交")
            ])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesProjectsDetail = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$q], ["__scopeId", "data-v-4d934d6f"], ["__file", "F:/new/success/uniappandroid/pages/projects/detail.vue"]]);
  const _imports_0$5 = "/static/icons/arrow_right.png";
  const _imports_1$3 = "/static/icons/check.png";
  const _sfc_main$p = {
    __name: "category-select",
    setup(__props, { expose: __expose }) {
      __expose();
      const mainCategoryId = vue.ref(null);
      const mainCategoryName = vue.ref("");
      const subCategories = vue.ref([]);
      const step = vue.ref(2);
      const selectedSubCategory = vue.ref(null);
      const selectedChildCategory = vue.ref(null);
      const comf = vue.ref("");
      onLoad((options) => {
        if (options.comfrom == "bids") {
          formatAppLog("log", "at pages/projects/category-select.vue:68", "接收到的页面参数来自投标页");
          comf.value = "bids";
        } else if (options.comfrom == "projects") {
          formatAppLog("log", "at pages/projects/category-select.vue:71", "接收到的页面参数来自项目页");
          comf.value = "projects";
        }
        formatAppLog("log", "at pages/projects/category-select.vue:74", "接收到的页面参数:", options);
        if (options.mainCategoryId && options.mainCategoryName) {
          mainCategoryId.value = parseInt(options.mainCategoryId, 10);
          mainCategoryName.value = decodeURIComponent(options.mainCategoryName);
          formatAppLog("log", "at pages/projects/category-select.vue:78", "解析后的一级分类 ID:", mainCategoryId.value);
          formatAppLog("log", "at pages/projects/category-select.vue:79", "解析后的一级分类名称:", mainCategoryName.value);
          const mainCategory = projectCategories.find((cat) => cat.id === mainCategoryId.value);
          if (mainCategory && mainCategory.subCategories) {
            subCategories.value = mainCategory.subCategories;
            formatAppLog("log", "at pages/projects/category-select.vue:85", "找到的二级分类:", subCategories.value);
          } else {
            formatAppLog("warn", "at pages/projects/category-select.vue:87", "未找到对应的一级分类或其二级分类为空");
            uni.showToast({ title: "分类数据错误", icon: "none" });
          }
        } else {
          formatAppLog("error", "at pages/projects/category-select.vue:93", "缺少必要的页面参数: mainCategoryId 或 mainCategoryName");
          uni.showToast({ title: "参数错误", icon: "none" });
          uni.navigateBack();
        }
      });
      const goBack = () => {
        if (step.value > 2) {
          step.value--;
        } else {
          uni.navigateBack();
        }
      };
      const selectSubCategory = (subCategory) => {
        selectedSubCategory.value = subCategory;
        step.value = 3;
      };
      const selectChildCategory = (childCategory) => {
        selectedChildCategory.value = childCategory;
        const categoryPath = {
          mainCategory: {
            id: mainCategoryId.value,
            // 使用从首页传来的 ID
            name: mainCategoryName.value
            // 使用从首页传来的名称
          },
          subCategory: {
            id: selectedSubCategory.value.id,
            name: selectedSubCategory.value.name
          },
          childCategory: {
            id: childCategory.id,
            name: childCategory.name
          }
        };
        if (comf.value == "bids") {
          try {
            uni.setStorageSync("selectedBidsID", categoryPath);
            formatAppLog("log", "at pages/projects/category-select.vue:138", "分类路径已保存:", categoryPath);
          } catch (e) {
            formatAppLog("error", "at pages/projects/category-select.vue:140", "保存分类路径失败:", e);
            uni.showToast({ title: "保存分类失败", icon: "none" });
            return;
          }
          uni.navigateTo({
            url: "/pages/projects/list"
          });
        } else if (comf.value == "projects") {
          try {
            uni.setStorageSync("selectedCategoryPath", categoryPath);
            formatAppLog("log", "at pages/projects/category-select.vue:153", "分类路径已保存:", categoryPath);
          } catch (e) {
            formatAppLog("error", "at pages/projects/category-select.vue:155", "保存分类路径失败:", e);
            uni.showToast({ title: "保存分类失败", icon: "none" });
            return;
          }
          uni.navigateTo({
            url: "/pages/projects/publish"
          });
        }
      };
      const __returned__ = { mainCategoryId, mainCategoryName, subCategories, step, selectedSubCategory, selectedChildCategory, comf, goBack, selectSubCategory, selectChildCategory, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get projectCategories() {
        return projectCategories;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "category-select-container" }, [
      vue.createElementVNode("view", { class: "category-steps" }, [
        vue.createElementVNode(
          "view",
          { class: "step active" },
          vue.toDisplayString($setup.mainCategoryName),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "step-divider" }),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["step", { active: $setup.step === 2 }])
          },
          "二级分类",
          2
          /* CLASS */
        ),
        vue.createElementVNode("view", { class: "step-divider" }),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["step", { active: $setup.step === 3 }])
          },
          "三级分类",
          2
          /* CLASS */
        )
      ]),
      $setup.step === 2 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "category-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.subCategories, (subCategory) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: subCategory.id,
              class: "category-item",
              onClick: ($event) => $setup.selectSubCategory(subCategory)
            }, [
              vue.createElementVNode(
                "text",
                { class: "category-name" },
                vue.toDisplayString(subCategory.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode("image", {
                src: _imports_0$5,
                mode: "aspectFit",
                class: "arrow-icon"
              })
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      $setup.step === 3 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "category-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList((_a = $setup.selectedSubCategory) == null ? void 0 : _a.children, (childCategory) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: childCategory.id,
              class: "category-item",
              onClick: ($event) => $setup.selectChildCategory(childCategory)
            }, [
              vue.createElementVNode(
                "text",
                { class: "category-name" },
                vue.toDisplayString(childCategory.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode("image", {
                src: _imports_1$3,
                mode: "aspectFit",
                class: "check-icon"
              })
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesProjectsCategorySelect = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$p], ["__scopeId", "data-v-0433eecd"], ["__file", "F:/new/success/uniappandroid/pages/projects/category-select.vue"]]);
  function publishProject(projectData) {
    return post("/projects", projectData);
  }
  function uploadProjectAttachment(filePath) {
    return upload("/api/attachments/upload", {
      name: "file",
      filePath
    });
  }
  const _imports_0$4 = "/static/icons/voice.png";
  const _imports_2$2 = "/static/icons/location.png";
  const _sfc_main$o = {
    __name: "publish",
    setup(__props, { expose: __expose }) {
      __expose();
      const categoryInfo = vue.ref(null);
      const formData = vue.ref({
        title: "",
        budget_min: "",
        budget_max: "",
        deadline: "",
        location: "",
        description: "",
        images: [],
        // 图片附件列表 [{url: '...', name: '...'}]
        documents: [],
        // PDF文档列表 [{url: '...', name: '...'}]
        cadFiles: [],
        // CAD和STP文件列表 [{url: '...', name: '...'}]
        video: null,
        // 视频附件 {url: '...', name: '...'}
        contactName: "",
        contactPhone: ""
      });
      const chooseImage = () => {
        const maxCount = 5 - formData.value.images.length;
        if (maxCount <= 0) {
          uni.showToast({ title: "最多上传5张图片", icon: "none" });
          return;
        }
        uni.chooseImage({
          count: maxCount,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"],
          success: async (res) => {
            try {
              uni.showLoading({ title: "上传中..." });
              const results = await uploadFilesSequentially(res.tempFilePaths);
              if (results && results.urls && results.urls.length > 0) {
                for (let i = 0; i < res.tempFilePaths.length; i++) {
                  const filePath = res.tempFilePaths[i];
                  const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
                  if (i < results.urls.length) {
                    formData.value.images.push({
                      url: results.urls[i],
                      name: fileName
                    });
                  }
                }
                uni.hideLoading();
                uni.showToast({ title: "上传成功", icon: "success" });
              } else {
                throw new Error("上传失败");
              }
            } catch (error) {
              uni.hideLoading();
              formatAppLog("error", "at pages/projects/publish.vue:303", "上传图片失败:", error);
              uni.showToast({ title: "上传失败", icon: "none" });
            }
          }
        });
      };
      const removeImage = (index) => {
        if (Array.isArray(formData.value.images)) {
          formData.value.images.splice(index, 1);
        }
      };
      const getCurrentLocation = () => {
        uni.showLoading({
          title: "定位中..."
        });
        uni.getLocation({
          type: "gcj02",
          geocode: true,
          success: (res) => {
            formatAppLog("log", "at pages/projects/publish.vue:327", "定位成功:", res);
            let locationStr = "";
            if (res.address) {
              const address = res.address;
              locationStr = `${address.province || ""}${address.city || ""}${address.district || ""}${address.street || ""}${address.poiName || ""}`;
            } else {
              locationStr = `纬度:${res.latitude.toFixed(6)}, 经度:${res.longitude.toFixed(6)}`;
            }
            formData.value.location = locationStr;
            uni.hideLoading();
            uni.showToast({
              title: "定位成功",
              icon: "success"
            });
          },
          fail: (err) => {
            formatAppLog("error", "at pages/projects/publish.vue:345", "定位失败:", err);
            uni.hideLoading();
            uni.showModal({
              title: "定位失败",
              content: "无法获取当前位置，请检查定位权限和网络连接",
              showCancel: false
            });
          }
        });
      };
      const minDate = vue.ref((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
      const isRecording = vue.ref(false);
      const currentField = vue.ref("");
      onReady(() => {
        plus.android.requestPermissions(["android.permission.RECORD_AUDIO"], (e) => {
        }, (e) => {
        });
      });
      const startVoiceRecognition = (field) => {
        currentField.value = field;
        isRecording.value = true;
        var options = {
          engine: "baidu"
        };
        formatAppLog("log", "at pages/projects/publish.vue:379", "开始语音识别：");
        plus.speech.startRecognize(options, function(s) {
          formatAppLog("log", "at pages/projects/publish.vue:381", "识别结果:", s);
          if (currentField.value === "title") {
            formData.value.title += s;
          } else if (currentField.value === "description") {
            formData.value.description += s;
          }
        }, function(e) {
          formatAppLog("log", "at pages/projects/publish.vue:388", "语音识别失败：" + JSON.stringify(e));
          uni.showToast({ title: "语音识别失败", icon: "none" });
          isRecording.value = false;
        });
        uni.showToast({
          title: "请说话...",
          icon: "none",
          duration: 6e4
          // 最长显示1分钟
        });
        setTimeout(() => {
          if (isRecording.value) {
            stopVoiceRecognition();
          }
        }, 5e4);
      };
      const stopVoiceRecognition = () => {
        plus.speech.stopRecognize();
        isRecording.value = false;
        uni.hideToast();
        uni.showToast({
          title: "识别完成",
          icon: "success",
          duration: 1500
        });
      };
      const categoryPath = vue.computed(() => {
        var _a, _b, _c;
        if (!categoryInfo.value)
          return "请选择项目分类";
        const main = ((_a = categoryInfo.value.mainCategory) == null ? void 0 : _a.name) || "未知";
        const sub = ((_b = categoryInfo.value.subCategory) == null ? void 0 : _b.name) || "未知";
        const child = ((_c = categoryInfo.value.childCategory) == null ? void 0 : _c.name) || "未知";
        return `${main} > ${sub} > ${child}`;
      });
      onLoad(() => {
        formatAppLog("log", "at pages/projects/publish.vue:441", "Publish page onLoad triggered");
        try {
          const storedCategoryPath = uni.getStorageSync("selectedCategoryPath");
          if (storedCategoryPath) {
            formatAppLog("log", "at pages/projects/publish.vue:445", "Found stored category path:", storedCategoryPath);
            categoryInfo.value = storedCategoryPath;
          }
        } catch (e) {
          formatAppLog("error", "at pages/projects/publish.vue:449", "Failed to get stored category path:", e);
        }
        try {
          const userInfo = uni.getStorageSync("userInfo");
          if (userInfo) {
            formData.value.contactName = userInfo.real_name || userInfo.name || userInfo.username || "";
            formData.value.contactPhone = userInfo.phone || "";
          }
        } catch (e) {
          formatAppLog("error", "at pages/projects/publish.vue:459", "Failed to get user info for prefilling:", e);
        }
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const changeCategory = () => {
        uni.navigateTo({
          url: "/pages/projects/category-select"
        });
      };
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const onDateChange = (e) => {
        formData.value.deadline = e.detail.value;
      };
      const chooseDocument = () => {
        const maxCount = 3 - formData.value.documents.length;
        if (maxCount <= 0) {
          uni.showToast({ title: "最多上传3个PDF文档", icon: "none" });
          return;
        }
        plus.io.chooseFile(
          {
            title: "选择PDF文档",
            extension: [".pdf"],
            multiple: false
          },
          (file) => {
            if (file && file.files) {
              handleSelectedDocument(file.files[0]);
            }
          }
        );
      };
      const handleSelectedDocument = async (filePath) => {
        try {
          uni.showLoading({ title: "上传中..." });
          const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
          const result = await uploadPdf(filePath);
          if (result && result.url) {
            formData.value.documents.push({
              url: result.url,
              name: fileName
            });
            uni.hideLoading();
            uni.showToast({ title: "上传成功", icon: "success" });
          } else {
            throw new Error("上传失败");
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/projects/publish.vue:566", "上传PDF失败:", error);
          uni.showToast({ title: "上传失败", icon: "none" });
        }
      };
      const removeDocument = (index) => {
        if (Array.isArray(formData.value.documents)) {
          formData.value.documents.splice(index, 1);
        }
      };
      const chooseVideo = () => {
        if (formData.value.video) {
          uni.showToast({ title: "最多上传1个视频", icon: "none" });
          return;
        }
        uni.chooseVideo({
          sourceType: ["album", "camera"],
          compressed: true,
          maxDuration: 300,
          // 限制视频最长5分钟
          success: async (res) => {
            const fileSize = res.size || 0;
            const maxSize = 100 * 1024 * 1024;
            if (fileSize > maxSize) {
              uni.showToast({
                title: "视频文件过大，请选择小于100MB的视频",
                icon: "none",
                duration: 3e3
              });
              return;
            }
            try {
              uni.showLoading({ title: "上传中...", mask: true });
              const tempFilePath = res.tempFilePath;
              const fileName = tempFilePath.substring(tempFilePath.lastIndexOf("/") + 1);
              const result = await uploadVideoWithRetry(tempFilePath, fileName);
              if (result && result.url) {
                formData.value.video = {
                  url: result.url,
                  name: fileName
                };
                uni.hideLoading();
                uni.showToast({ title: "上传成功", icon: "success" });
              } else {
                throw new Error("上传失败");
              }
            } catch (error) {
              uni.hideLoading();
              formatAppLog("error", "at pages/projects/publish.vue:623", "上传视频失败:", error);
              let errorMsg = "上传失败";
              if (error.message.includes("502")) {
                errorMsg = "服务器暂时不可用，请稍后重试";
              } else if (error.message.includes("timeout")) {
                errorMsg = "上传超时，请检查网络连接";
              } else if (error.message.includes("网络")) {
                errorMsg = "网络连接异常，请重试";
              }
              uni.showModal({
                title: "上传失败",
                content: errorMsg + "，是否重试？",
                confirmText: "重试",
                cancelText: "取消",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    setTimeout(() => {
                      chooseVideo();
                    }, 500);
                  }
                }
              });
            }
          },
          fail: (error) => {
            formatAppLog("error", "at pages/projects/publish.vue:652", "选择视频失败:", error);
            uni.showToast({ title: "选择视频失败", icon: "none" });
          }
        });
      };
      const uploadVideoWithRetry = async (filePath, fileName, maxRetries = 3) => {
        let lastError = null;
        for (let i = 0; i < maxRetries; i++) {
          try {
            formatAppLog("log", "at pages/projects/publish.vue:664", `视频上传尝试 ${i + 1}/${maxRetries}`);
            if (i > 0) {
              uni.showLoading({
                title: `重试中... (${i + 1}/${maxRetries})`,
                mask: true
              });
            }
            const result = await uploadVideo(filePath);
            if (result && result.url) {
              formatAppLog("log", "at pages/projects/publish.vue:677", "视频上传成功:", result);
              return result;
            } else {
              throw new Error("上传返回结果无效");
            }
          } catch (error) {
            lastError = error;
            formatAppLog("error", "at pages/projects/publish.vue:684", `视频上传第 ${i + 1} 次尝试失败:`, error);
            if (i < maxRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, 2e3 * (i + 1)));
            }
          }
        }
        throw lastError || new Error("上传失败");
      };
      const removeVideo = () => {
        formData.value.video = null;
      };
      const chooseCadFile = () => {
        const maxCount = 3 - formData.value.cadFiles.length;
        if (maxCount <= 0) {
          uni.showToast({ title: "最多上传3个CAD/STP文件", icon: "none" });
          return;
        }
        plus.io.chooseFile(
          {
            title: "选择CAD/STP文件",
            extension: [".cad", ".stp"],
            multiple: false
          },
          (file) => {
            if (file && file.files) {
              handleSelectedCadFile(file.files[0]);
            }
          }
        );
      };
      const handleSelectedCadFile = async (filePath) => {
        try {
          uni.showLoading({ title: "上传中..." });
          const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
          const userStore = useUserStore();
          const token = userStore.token;
          const result = await new Promise((resolve, reject) => {
            uni.uploadFile({
              url: APP_CONFIG.API_BASE_URL + "/upload/file",
              filePath,
              name: "file",
              header: token ? { "Authorization": `Bearer ${token}` } : {},
              success: (res) => {
                formatAppLog("log", "at pages/projects/publish.vue:744", "上传CAD/STP响应:", res.statusCode, res.data);
                if (res.statusCode !== 200) {
                  reject(new Error(`上传失败，状态码: ${res.statusCode}`));
                  return;
                }
                try {
                  const data = JSON.parse(res.data);
                  if ((data.code === 0 || data.code === 200) && data.data && data.data.url) {
                    let url = data.data.url;
                    url = url.replace(/\\/g, "/");
                    if (!url.startsWith("http://") && !url.startsWith("https://")) {
                      url = "http://115.190.38.218/api" + url;
                    }
                    resolve({ url });
                  } else {
                    reject(new Error(data.message || "上传失败"));
                  }
                } catch (error) {
                  formatAppLog("error", "at pages/projects/publish.vue:768", "解析上传响应失败:", error, res.data);
                  reject(new Error("解析上传响应失败"));
                }
              },
              fail: (error) => {
                formatAppLog("error", "at pages/projects/publish.vue:773", "上传CAD/STP请求失败:", error);
                reject(error);
              }
            });
          });
          if (result && result.url) {
            formData.value.cadFiles.push({
              url: result.url,
              name: fileName
            });
            uni.hideLoading();
            uni.showToast({ title: "上传成功", icon: "success" });
          } else {
            throw new Error("上传失败");
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/projects/publish.vue:792", "上传CAD/STP文件失败:", error);
          uni.showToast({ title: "上传失败", icon: "none" });
        }
      };
      const removeCadFile = (index) => {
        if (Array.isArray(formData.value.cadFiles)) {
          formData.value.cadFiles.splice(index, 1);
        }
      };
      const previewVideo = () => {
        if (!formData.value.video || !formData.value.video.url) {
          uni.showToast({ title: "视频不存在", icon: "none" });
          return;
        }
        uni.navigateTo({
          url: `/pages/common/video-player?url=${encodeURIComponent(formData.value.video.url)}&name=${encodeURIComponent(formData.value.video.name || "视频")}`
        });
      };
      const validateForm = () => {
        if (!categoryInfo.value) {
          uni.showToast({
            title: "请选择项目分类",
            icon: "none"
          });
          return false;
        }
        if (!formData.value.title || formData.value.title.length < 2) {
          uni.showToast({
            title: "标题至少2个字",
            icon: "none"
          });
          return false;
        }
        if (!formData.value.budget_min || isNaN(parseFloat(formData.value.budget_min)) || parseFloat(formData.value.budget_min) <= 0) {
          uni.showToast({
            title: "请输入正确预算",
            icon: "none"
          });
          return false;
        }
        if (!formData.value.deadline) {
          uni.showToast({
            title: "请选择截止日期",
            icon: "none"
          });
          return false;
        }
        if (!formData.value.location) {
          uni.showToast({
            title: "请获取项目地点",
            icon: "none"
          });
          return false;
        }
        if (!formData.value.description || formData.value.description.length < 10) {
          uni.showToast({
            title: "描述至少10个字",
            icon: "none"
          });
          return false;
        }
        if (!formData.value.contactName) {
          uni.showToast({
            title: "请输入联系人",
            icon: "none"
          });
          return false;
        }
        if (!formData.value.contactPhone) {
          uni.showToast({
            title: "请输入联系电话",
            icon: "none"
          });
          return false;
        }
        return true;
      };
      const submitProject = () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!validateForm())
          return;
        uni.showLoading({ title: "提交中..." });
        const allAttachmentIds = [
          ...formData.value.images.map((img) => img.url),
          ...formData.value.documents.map((doc) => doc.url),
          ...formData.value.cadFiles.map((file) => file.url)
        ];
        if (formData.value.video && formData.value.video.url) {
          allAttachmentIds.push(formData.value.video.url);
        }
        const projectData = {
          title: formData.value.title,
          budget_min: parseFloat(formData.value.budget_min),
          budget_max: parseFloat(formData.value.budget_max),
          deadline: formData.value.deadline,
          location: formData.value.location,
          description: formData.value.description,
          // attachments: Array.isArray(formData.value.attachments) ? formData.value.attachments.map((item) => item.id) : [],
          attachments: allAttachmentIds,
          // 使用合并后的ID列表
          contactName: formData.value.contactName,
          contactPhone: formData.value.contactPhone,
          categoryId: (_b = (_a = categoryInfo.value) == null ? void 0 : _a.childCategory) == null ? void 0 : _b.id,
          categoryPath: ((_d = (_c = categoryInfo.value) == null ? void 0 : _c.mainCategory) == null ? void 0 : _d.id) && ((_f = (_e = categoryInfo.value) == null ? void 0 : _e.subCategory) == null ? void 0 : _f.id) && ((_h = (_g = categoryInfo.value) == null ? void 0 : _g.childCategory) == null ? void 0 : _h.id) ? [categoryInfo.value.mainCategory.id, categoryInfo.value.subCategory.id, categoryInfo.value.childCategory.id] : []
        };
        formatAppLog("log", "at pages/projects/publish.vue:909", "提交项目数据--》:", projectData);
        publishProject(projectData).then((res) => {
          uni.hideLoading();
          uni.showToast({ title: "发布成功", icon: "success" });
          setTimeout(() => {
            uni.redirectTo({ url: `/pages/projects/detail?id=${res.id}` });
          }, 1500);
        }).catch((err) => {
          var _a2, _b2;
          uni.hideLoading();
          const errMsg = ((_b2 = (_a2 = err == null ? void 0 : err.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || (err == null ? void 0 : err.message) || "发布失败";
          uni.showToast({ title: errMsg, icon: "none" });
          formatAppLog("error", "at pages/projects/publish.vue:922", "发布失败:", err);
        });
      };
      const __returned__ = { categoryInfo, formData, chooseImage, removeImage, getCurrentLocation, minDate, isRecording, currentField, startVoiceRecognition, stopVoiceRecognition, categoryPath, goBack, changeCategory, formatDate, onDateChange, chooseDocument, handleSelectedDocument, removeDocument, chooseVideo, uploadVideoWithRetry, removeVideo, chooseCadFile, handleSelectedCadFile, removeCadFile, previewVideo, validateForm, submitProject, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get onReady() {
        return onReady;
      }, get publishProject() {
        return publishProject;
      }, get uploadProjectAttachment() {
        return uploadProjectAttachment;
      }, get uploadImage() {
        return uploadImage;
      }, get uploadPdf() {
        return uploadPdf;
      }, get uploadMultiple() {
        return uploadMultiple;
      }, get uploadFilesSequentially() {
        return uploadFilesSequentially;
      }, get uploadVideo() {
        return uploadVideo;
      }, get APP_CONFIG() {
        return APP_CONFIG;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b;
    return vue.openBlock(), vue.createElementBlock("view", { class: "publish-container" }, [
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "form-container"
      }, [
        vue.createElementVNode("view", { class: "form-section glass-effect" }, [
          vue.createElementVNode("view", { class: "section-title" }, "项目分类"),
          vue.createElementVNode("view", {
            class: "category-path",
            onClick: $setup.changeCategory
          }, [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($setup.categoryPath),
              1
              /* TEXT */
            ),
            vue.createElementVNode("image", {
              src: _imports_0$5,
              mode: "aspectFit",
              class: "arrow-icon"
            })
          ])
        ]),
        vue.createElementVNode("view", { class: "form-section glass-effect" }, [
          vue.createElementVNode("view", { class: "section-title" }, "基本信息"),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "项目标题"),
            vue.createElementVNode("view", { class: "input-with-voice" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "text",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.formData.title = $event),
                  placeholder: "请输入项目标题（5-50字）",
                  maxlength: "50",
                  class: "glass-input"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.formData.title]
              ]),
              vue.createElementVNode("view", {
                class: "voice-btn",
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.startVoiceRecognition("title"))
              }, [
                vue.createElementVNode("image", {
                  src: _imports_0$4,
                  mode: "aspectFit",
                  class: "voice-icon-small"
                })
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "项目最低预算"),
            vue.createElementVNode("view", { class: "budget-input glass-input" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "digit",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.formData.budget_min = $event),
                  placeholder: "请输入预算下限"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.formData.budget_min]
              ]),
              vue.createElementVNode("text", { class: "unit" }, "元")
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "项目最高预算"),
            vue.createElementVNode("view", { class: "budget-input glass-input" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "digit",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.formData.budget_max = $event),
                  placeholder: "请输入预算上限"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.formData.budget_max]
              ]),
              vue.createElementVNode("text", { class: "unit" }, "元")
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "截止日期"),
            vue.createElementVNode("picker", {
              mode: "date",
              value: $setup.formData.deadline,
              start: $setup.minDate,
              onChange: $setup.onDateChange
            }, [
              vue.createElementVNode("view", { class: "picker-value glass-input" }, [
                vue.createTextVNode(
                  vue.toDisplayString($setup.formData.deadline || "请选择截止日期") + " ",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("image", {
                  src: _imports_0$5,
                  mode: "aspectFit",
                  class: "arrow-icon"
                })
              ])
            ], 40, ["value", "start"])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "项目地点"),
            vue.createElementVNode("view", { class: "location-container" }, [
              !$setup.formData.location ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "location-placeholder glass-input",
                onClick: $setup.getCurrentLocation
              }, [
                vue.createElementVNode("image", {
                  src: _imports_2$2,
                  mode: "aspectFit",
                  class: "location-icon"
                }),
                vue.createElementVNode("text", null, "点击获取当前位置")
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "location-result glass-input"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "location-text" },
                  vue.toDisplayString($setup.formData.location),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", {
                  class: "location-action",
                  onClick: $setup.getCurrentLocation
                }, [
                  vue.createElementVNode("text", { class: "change-text" }, "重新获取")
                ])
              ]))
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "form-section glass-effect" }, [
          vue.createElementVNode("view", { class: "section-title" }, "项目详情"),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "详细描述"),
            vue.createElementVNode("view", { class: "textarea-with-voice" }, [
              vue.withDirectives(vue.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.formData.description = $event),
                  placeholder: "请详细描述您的项目需求，包括具体要求、规格参数、交付方式等信息（10-2000字）",
                  maxlength: "2000",
                  class: "glass-textarea"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.formData.description]
              ]),
              vue.createElementVNode("view", {
                class: "voice-btn textarea-voice-btn",
                onClick: _cache[5] || (_cache[5] = ($event) => $setup.startVoiceRecognition("description"))
              }, [
                vue.createElementVNode("image", {
                  src: _imports_0$4,
                  mode: "aspectFit",
                  class: "voice-icon-small"
                })
              ])
            ]),
            vue.createElementVNode(
              "view",
              { class: "word-count" },
              vue.toDisplayString($setup.formData.description.length) + "/2000",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "图片附件 (最多5张)"),
            vue.createElementVNode("view", { class: "upload-area" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.formData.images, (img, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: "img_" + index,
                    class: "file-item image-item"
                  }, [
                    vue.createElementVNode("image", {
                      src: img.url,
                      class: "uploaded-image",
                      mode: "aspectFill"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", {
                      class: "delete-btn",
                      onClick: ($event) => $setup.removeImage(index)
                    }, "×", 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $setup.formData.images.length < 5 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "upload-btn",
                onClick: $setup.chooseImage
              }, [
                vue.createElementVNode("text", { class: "upload-icon" }, "+"),
                vue.createElementVNode("text", null, "上传图片")
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "PDF文档 (最多3个)"),
            vue.createElementVNode("view", { class: "upload-area" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.formData.documents, (doc, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: "doc_" + index,
                    class: "file-item doc-item"
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "file-name" },
                      vue.toDisplayString(doc.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", {
                      class: "delete-btn",
                      onClick: ($event) => $setup.removeDocument(index)
                    }, "×", 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $setup.formData.documents.length < 3 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "upload-btn",
                onClick: $setup.chooseDocument
              }, [
                vue.createElementVNode("text", { class: "upload-icon" }, "+"),
                vue.createElementVNode("text", null, "上传PDF")
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          ((_b = (_a = $setup.categoryInfo) == null ? void 0 : _a.mainCategory) == null ? void 0 : _b.id) === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "form-item"
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "CAD/STP文件 (最多3个)"),
            vue.createElementVNode("view", { class: "upload-area" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.formData.cadFiles, (file, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: "cad_" + index,
                    class: "file-item doc-item"
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "file-name" },
                      vue.toDisplayString(file.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", {
                      class: "delete-btn",
                      onClick: ($event) => $setup.removeCadFile(index)
                    }, "×", 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $setup.formData.cadFiles.length < 3 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "upload-btn",
                onClick: $setup.chooseCadFile
              }, [
                vue.createElementVNode("text", { class: "upload-icon" }, "+"),
                vue.createElementVNode("text", null, "上传CAD/STP")
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "视频附件 (最多1个)"),
            vue.createElementVNode("view", { class: "upload-area" }, [
              $setup.formData.video ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "file-item video-item"
              }, [
                vue.createElementVNode("view", {
                  class: "video-preview-container",
                  onClick: $setup.previewVideo
                }, [
                  vue.createElementVNode("view", { class: "video-cover-placeholder" }, [
                    vue.createElementVNode("view", { class: "video-icon" }, "📹")
                  ]),
                  vue.createElementVNode("view", { class: "video-play-icon" }, [
                    vue.createElementVNode("view", { class: "play-triangle" })
                  ]),
                  vue.createElementVNode("view", { class: "video-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "video-name" },
                      vue.toDisplayString($setup.formData.video.name),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", {
                  class: "delete-btn",
                  onClick: $setup.removeVideo
                }, "×")
              ])) : vue.createCommentVNode("v-if", true),
              !$setup.formData.video ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "upload-btn",
                onClick: $setup.chooseVideo
              }, [
                vue.createElementVNode("text", { class: "upload-icon" }, "+"),
                vue.createElementVNode("text", null, "上传视频")
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "form-section glass-effect" }, [
          vue.createElementVNode("view", { class: "section-title" }, "联系方式"),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "联系人"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.formData.contactName = $event),
                placeholder: "请输入联系人姓名",
                class: "glass-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.contactName]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "联系电话"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "number",
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.formData.contactPhone = $event),
                placeholder: "请输入联系电话",
                class: "glass-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.contactPhone]
            ])
          ])
        ]),
        vue.createElementVNode("view", {
          class: "submit-btn glow-effect",
          onClick: $setup.submitProject
        }, "发布项目")
      ])
    ]);
  }
  const PagesProjectsPublish = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$o], ["__scopeId", "data-v-68ebeda0"], ["__file", "F:/new/success/uniappandroid/pages/projects/publish.vue"]]);
  const _sfc_main$n = {
    __name: "ConversationCard",
    props: {
      chat: {
        type: Object,
        required: true
      }
    },
    emits: ["click"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const formattedTime = vue.computed(() => {
        if (!props.chat.last_time)
          return "";
        const date = new Date(props.chat.last_time);
        const now2 = /* @__PURE__ */ new Date();
        const diff = (now2.getTime() - date.getTime()) / 1e3;
        if (diff < 60)
          return "刚刚";
        if (diff < 3600)
          return `${Math.floor(diff / 60)}分钟前`;
        if (diff < 86400 && date.getDate() === now2.getDate())
          return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
        if (diff < 172800 && now2.getDate() - date.getDate() === 1)
          return "昨天";
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
      });
      const __returned__ = { props, formattedTime, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "card-glass",
      onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click"))
    }, [
      vue.createElementVNode("view", { class: "avatar-wrapper" }, [
        vue.createElementVNode("image", {
          class: "avatar",
          src: $props.chat.target_user.avatar || "/static/images/default-avatar.png"
        }, null, 8, ["src"]),
        $props.chat.unread_count > 0 ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: "unread-badge"
          },
          vue.toDisplayString($props.chat.unread_count > 99 ? "99+" : $props.chat.unread_count),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "content-wrapper" }, [
        vue.createElementVNode("view", { class: "content-header" }, [
          vue.createElementVNode(
            "text",
            { class: "username" },
            vue.toDisplayString($props.chat.target_user.username),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "time" },
            vue.toDisplayString($setup.formattedTime),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode(
          "text",
          { class: "last-message" },
          vue.toDisplayString($props.chat.last_message),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const ConversationCard = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$n], ["__scopeId", "data-v-72739596"], ["__file", "F:/new/success/uniappandroid/components/ConversationCard.vue"]]);
  const _sfc_main$m = {
    __name: "NotificationCard",
    props: {
      notification: {
        type: Object,
        required: true
      }
    },
    emits: ["click"],
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const notificationInfo = vue.computed(() => {
        switch (Number(props.notification.type)) {
          case 0:
            return { icon: "系统", color: "#f1c40f" };
          case 1:
            return { icon: "项目", color: "#3498db" };
          case 2:
            return { icon: "投标", color: "#9b59b6" };
          case 3:
            return { icon: "订单", color: "#2ecc71" };
          default:
            return { icon: "通知", color: "#f1c40f" };
        }
      });
      const iconText = vue.computed(() => notificationInfo.value.icon);
      const iconBgColor = vue.computed(() => notificationInfo.value.color);
      const formattedTime = vue.computed(() => {
        if (!props.notification.created_at)
          return "";
        const date = new Date(props.notification.created_at);
        const now2 = /* @__PURE__ */ new Date();
        const diff = (now2.getTime() - date.getTime()) / 1e3;
        if (diff < 60)
          return "刚刚";
        if (diff < 3600)
          return `${Math.floor(diff / 60)}分钟前`;
        if (diff < 86400 && date.getDate() === now2.getDate())
          return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
        if (diff < 172800 && now2.getDate() - date.getDate() === 1)
          return "昨天";
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
      });
      const __returned__ = { props, notificationInfo, iconText, iconBgColor, formattedTime, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["card-glass", { "unread": !$props.notification.is_read }]),
        onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click"))
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: "icon-wrapper",
            style: vue.normalizeStyle({ backgroundColor: $setup.iconBgColor })
          },
          [
            vue.createElementVNode(
              "text",
              { class: "icon-text" },
              vue.toDisplayString($setup.iconText),
              1
              /* TEXT */
            )
          ],
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", { class: "content-wrapper" }, [
          vue.createElementVNode("view", { class: "content-header" }, [
            vue.createElementVNode(
              "text",
              { class: "title" },
              vue.toDisplayString($props.notification.title),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "time" },
              vue.toDisplayString($setup.formattedTime),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "text",
            { class: "content-text" },
            vue.toDisplayString($props.notification.content),
            1
            /* TEXT */
          )
        ])
      ],
      2
      /* CLASS */
    );
  }
  const NotificationCard = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$m], ["__scopeId", "data-v-731e4415"], ["__file", "F:/new/success/uniappandroid/components/NotificationCard.vue"]]);
  const _sfc_main$l = {
    __name: "SubscriptionNotificationCard",
    props: {
      notification: {
        type: Object,
        required: true
      }
    },
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const getCategoryIcon = () => {
        if (!props.notification.category_id) {
          return "/static/icons/notification.png";
        }
        const category = projectCategories.find((cat) => cat.id === props.notification.category_id);
        return category ? category.icon : "/static/icons/notification.png";
      };
      const formatTime = (timeStr) => {
        if (!timeStr)
          return "";
        const now2 = /* @__PURE__ */ new Date();
        const date = new Date(timeStr);
        const diff = now2 - date;
        if (diff < 6e4) {
          return "刚刚";
        }
        if (diff < 36e5) {
          return `${Math.floor(diff / 6e4)}分钟前`;
        }
        if (diff < 864e5) {
          return `${Math.floor(diff / 36e5)}小时前`;
        }
        if (diff < 6048e5) {
          return `${Math.floor(diff / 864e5)}天前`;
        }
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      };
      const __returned__ = { props, getCategoryIcon, formatTime, computed: vue.computed, get projectCategories() {
        return projectCategories;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "subscription-notification-card",
      onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click"))
    }, [
      vue.createElementVNode("view", { class: "notification-content" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["notification-icon", { "unread": !$props.notification.is_read }])
          },
          [
            vue.createElementVNode("image", {
              src: $setup.getCategoryIcon(),
              mode: "aspectFit"
            }, null, 8, ["src"])
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode("view", { class: "notification-details" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["notification-title", { "unread": !$props.notification.is_read }])
            },
            vue.toDisplayString($props.notification.title),
            3
            /* TEXT, CLASS */
          ),
          vue.createElementVNode(
            "view",
            { class: "notification-message" },
            vue.toDisplayString($props.notification.message),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "notification-time" },
            vue.toDisplayString($setup.formatTime($props.notification.created_at)),
            1
            /* TEXT */
          )
        ])
      ])
    ]);
  }
  const SubscriptionNotificationCard = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$l], ["__scopeId", "data-v-54e0d8da"], ["__file", "F:/new/success/uniappandroid/components/SubscriptionNotificationCard.vue"]]);
  const _imports_0$3 = "/static/icons/empty-box.png";
  const _sfc_main$k = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const messageStore = useMessageStore();
      const userStore = useUserStore$1();
      const loading = vue.ref(false);
      const activeTab = vue.ref("chat");
      const isSocketConnected2 = vue.ref(false);
      const subscriptionNotifications = vue.ref([]);
      const unreadSubscriptionCount = vue.ref(0);
      const user = vue.computed(() => userStore.userInfo);
      const isLoggedIn = vue.computed(() => userStore.hasLogin);
      const hasChatList = vue.computed(() => messageStore.chatList && messageStore.chatList.length > 0);
      const hasNotifications = vue.computed(() => messageStore.notifications && messageStore.notifications.length > 0);
      const hasUnreadNotifications = vue.computed(() => {
        return messageStore.notifications && messageStore.notifications.some((notification) => !notification.is_read);
      });
      const hasSubscriptionNotifications = vue.computed(() => subscriptionNotifications.value && subscriptionNotifications.value.length > 0);
      const checkLoginStatus = () => {
        return isLoggedIn.value;
      };
      const loadData = async () => {
        loading.value = true;
        try {
          if (!isLoggedIn.value) {
            formatAppLog("log", "at pages/messages/index.vue:161", "用户未登录，不加载数据");
            return;
          }
          if (activeTab.value === "chat") {
            await messageStore.getChatList();
          } else if (activeTab.value === "notification") {
            try {
              formatAppLog("log", "at pages/messages/index.vue:169", "开始加载通知列表，当前token:", userStore.token);
              if (!userStore.hasLogin || !userStore.token) {
                formatAppLog("log", "at pages/messages/index.vue:173", "用户未登录或token不存在，不加载通知");
                return;
              }
              await messageStore.getNotifications();
              formatAppLog("log", "at pages/messages/index.vue:178", "通知列表加载成功:", messageStore.notifications);
            } catch (notificationError) {
              formatAppLog("error", "at pages/messages/index.vue:180", "加载通知失败:", notificationError);
              if (notificationError.message && notificationError.message.includes("登录已过期")) {
                formatAppLog("log", "at pages/messages/index.vue:184", "登录已过期，尝试刷新用户信息");
                try {
                  await userStore.getUserInfo();
                  formatAppLog("log", "at pages/messages/index.vue:189", "用户信息刷新成功，重新加载通知");
                  await messageStore.getNotifications();
                } catch (refreshError) {
                  formatAppLog("error", "at pages/messages/index.vue:192", "刷新用户信息失败:", refreshError);
                  uni.showToast({
                    title: "登录已过期，请手动登录",
                    icon: "none"
                  });
                }
              } else {
                throw notificationError;
              }
            }
          } else if (activeTab.value === "subscription") {
            await loadSubscriptionNotifications();
          }
        } catch (error) {
          formatAppLog("error", "at pages/messages/index.vue:207", "加载数据失败:", error);
          uni.showToast({ title: "加载失败，请重试", icon: "none" });
        } finally {
          loading.value = false;
        }
      };
      const loadSubscriptionNotifications = async () => {
        try {
          if (!userStore.hasLogin || !userStore.token) {
            formatAppLog("log", "at pages/messages/index.vue:219", "用户未登录或token不存在，不加载订阅通知");
            return;
          }
          const response = await getSubscriptionNotifications();
          formatAppLog("log", "at pages/messages/index.vue:224", "返回了什么？", response);
          subscriptionNotifications.value = response.data || [];
          unreadSubscriptionCount.value = subscriptionNotifications.value.filter(
            (notification) => !notification.is_read
          ).length;
          formatAppLog("log", "at pages/messages/index.vue:232", "订阅通知加载成功:", subscriptionNotifications.value);
        } catch (error) {
          formatAppLog("error", "at pages/messages/index.vue:234", "加载订阅通知失败:", error);
          throw error;
        }
      };
      const initWebSocket = () => {
        if (!isLoggedIn.value || isSocketConnected2.value)
          return;
        connectWebSocket(userStore.token).then(() => {
          isSocketConnected2.value = true;
          formatAppLog("log", "at pages/messages/index.vue:246", "WebSocket连接成功");
        }).catch((error) => {
          formatAppLog("error", "at pages/messages/index.vue:249", "WebSocket连接失败:", error);
          setTimeout(initWebSocket, 5e3);
        });
      };
      const handleSocketMessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          formatAppLog("log", "at pages/messages/index.vue:259", "收到WebSocket消息:", message);
          switch (message.type) {
            case "message":
              messageStore.updateChatWithNewMessage(message.data);
              break;
            case "notification":
              messageStore.addNotification(message.data);
              break;
            case "status":
              if (message.data.event_type === "project_update" || message.data.event_type === "bid_update" || message.data.event_type === "order_update") {
                if (activeTab.value === "chat") {
                  messageStore.getChatList();
                }
              }
              break;
          }
        } catch (error) {
          formatAppLog("error", "at pages/messages/index.vue:283", "处理WebSocket消息失败:", error);
        }
      };
      uni.onSocketMessage(handleSocketMessage);
      onLoad((options) => {
        formatAppLog("log", "at pages/messages/index.vue:291", "消息页面加载，登录状态:", isLoggedIn.value, "用户信息:", user.value);
        if (options && options.tab) {
          activeTab.value = options.tab;
        }
        loadData();
        if (isLoggedIn.value) {
          initWebSocket();
        }
      });
      onShow(async () => {
        formatAppLog("log", "at pages/messages/index.vue:308", "消息页面显示，登录状态:", isLoggedIn.value, "用户信息:", user.value);
        if (userStore.token) {
          try {
            await userStore.getUserInfo();
            formatAppLog("log", "at pages/messages/index.vue:314", "用户信息已刷新:", userStore.userInfo);
          } catch (error) {
            formatAppLog("error", "at pages/messages/index.vue:316", "刷新用户信息失败:", error);
          }
        }
        if (isLoggedIn.value && !isSocketConnected2.value) {
          initWebSocket();
        }
        if (isLoggedIn.value) {
          loadData();
        }
      });
      onHide(() => {
      });
      vue.onUnmounted(() => {
        if (isSocketConnected2.value) {
          disconnectWebSocket();
          isSocketConnected2.value = false;
        }
        uni.offSocketMessage(handleSocketMessage);
      });
      onPullDownRefresh$1(async () => {
        await loadData();
        uni.stopPullDownRefresh();
      });
      const switchTab = (tab) => {
        if (activeTab.value === tab)
          return;
        activeTab.value = tab;
        loadData();
      };
      const goToChat = (chatId) => {
        if (!isLoggedIn.value) {
          uni.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        uni.navigateTo({ url: `/pages/messages/chat?id=${chatId}` });
      };
      const readNotification = (notification) => {
        if (!isLoggedIn.value) {
          uni.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        if (!notification.is_read) {
          messageStore.readNotification([notification.id]);
        }
        switch (notification.type) {
          case 0:
            formatAppLog("log", "at pages/messages/index.vue:378", "查看系统通知:", notification.id);
            break;
          case 1:
            if (notification.related_id) {
              uni.navigateTo({ url: `/pages/projects/detail?id=${notification.related_id}` });
            }
            break;
          case 2:
            if (notification.related_id)
              ;
            break;
          case 3:
            if (notification.related_id) {
              uni.navigateTo({ url: `/pages/orders/detail?id=${notification.related_id}` });
            }
            break;
          default:
            formatAppLog("log", "at pages/messages/index.vue:397", "未知通知类型:", notification.type);
        }
      };
      const handleMarkAllAsRead = async () => {
        if (!isLoggedIn.value) {
          uni.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: "处理中..." });
          await markAllNotificationsAsRead();
          await messageStore.getNotifications();
          uni.hideLoading();
          uni.showToast({
            title: "已全部标为已读",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/messages/index.vue:423", "标记全部已读失败:", error);
          uni.hideLoading();
          uni.showToast({
            title: "操作失败，请重试",
            icon: "none"
          });
        }
      };
      const handleMarkAllSubscriptionsAsRead = async () => {
        if (!isLoggedIn.value) {
          uni.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: "处理中..." });
          const unreadIds = subscriptionNotifications.value.filter((notification) => !notification.is_read).map((notification) => notification.id);
          if (unreadIds.length === 0) {
            uni.hideLoading();
            return;
          }
          await markNotificationsAsRead(unreadIds);
          subscriptionNotifications.value.forEach((notification) => {
            notification.is_read = true;
          });
          unreadSubscriptionCount.value = 0;
          uni.hideLoading();
          uni.showToast({
            title: "已全部标为已读",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/messages/index.vue:467", "标记订阅通知已读失败:", error);
          uni.hideLoading();
          uni.showToast({
            title: "操作失败，请重试",
            icon: "none"
          });
        }
      };
      const readSubscriptionNotification = async (notification) => {
        if (!isLoggedIn.value) {
          uni.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        if (!notification.is_read) {
          try {
            await markNotificationsAsRead([notification.id]);
            notification.is_read = true;
            unreadSubscriptionCount.value = Math.max(0, unreadSubscriptionCount.value - 1);
          } catch (error) {
            formatAppLog("error", "at pages/messages/index.vue:492", "标记通知已读失败:", error);
          }
        }
        if (notification.project_id) {
          uni.navigateTo({ url: `/pages/projects/detail?id=${notification.project_id}` });
        } else if (notification.category_id) {
          uni.navigateTo({
            url: `/pages/projects/list?categoryId=${notification.category_id}&categoryName=${encodeURIComponent(notification.title)}`
          });
        }
      };
      const __returned__ = { messageStore, userStore, loading, activeTab, isSocketConnected: isSocketConnected2, subscriptionNotifications, unreadSubscriptionCount, user, isLoggedIn, hasChatList, hasNotifications, hasUnreadNotifications, hasSubscriptionNotifications, checkLoginStatus, loadData, loadSubscriptionNotifications, initWebSocket, handleSocketMessage, switchTab, goToChat, readNotification, handleMarkAllAsRead, handleMarkAllSubscriptionsAsRead, readSubscriptionNotification, ref: vue.ref, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get onPullDownRefresh() {
        return onPullDownRefresh$1;
      }, get useMessageStore() {
        return useMessageStore;
      }, get useUserStore() {
        return useUserStore$1;
      }, get connectWebSocket() {
        return connectWebSocket;
      }, get disconnectWebSocket() {
        return disconnectWebSocket;
      }, get markAllNotificationsAsRead() {
        return markAllNotificationsAsRead;
      }, get getSubscriptionNotifications() {
        return getSubscriptionNotifications;
      }, ConversationCard, NotificationCard, SubscriptionNotificationCard };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "messages-container" }, [
      vue.createElementVNode("view", { class: "header-fixed" }, [
        vue.createElementVNode("view", { class: "tab-bar-glass" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === "chat" }]),
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchTab("chat"))
            },
            [
              vue.createElementVNode("text", null, "聊天")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === "notification" }]),
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchTab("notification"))
            },
            [
              vue.createElementVNode("text", null, "通知"),
              $setup.messageStore.unreadNotificationCount > 0 ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: "badge"
                },
                vue.toDisplayString($setup.messageStore.unreadNotificationCount > 99 ? "99+" : $setup.messageStore.unreadNotificationCount),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ],
            2
            /* CLASS */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "content-area" }, [
        vue.withDirectives(vue.createElementVNode(
          "view",
          null,
          [
            !$setup.loading && $setup.hasChatList ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.messageStore.chatList, (chat) => {
                  return vue.openBlock(), vue.createBlock($setup["ConversationCard"], {
                    key: chat.id,
                    chat,
                    onClick: ($event) => $setup.goToChat(chat.id)
                  }, null, 8, ["chat", "onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true),
            !$setup.loading && !$setup.hasChatList ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "empty-state"
            }, [
              vue.createElementVNode("image", {
                src: _imports_0$3,
                class: "empty-icon"
              }),
              vue.createElementVNode("text", { class: "empty-text" }, "暂无聊天记录"),
              $setup.isLoggedIn ? (vue.openBlock(), vue.createElementBlock("button", {
                key: 0,
                class: "refresh-btn",
                onClick: $setup.loadData
              }, "刷新")) : (vue.openBlock(), vue.createElementBlock("button", {
                key: 1,
                class: "login-btn",
                onClick: _cache[2] || (_cache[2] = () => uni.navigateTo({ url: "/pages/login/index" }))
              }, "去登录"))
            ])) : vue.createCommentVNode("v-if", true)
          ],
          512
          /* NEED_PATCH */
        ), [
          [vue.vShow, $setup.activeTab === "chat"]
        ]),
        vue.withDirectives(vue.createElementVNode(
          "view",
          null,
          [
            !$setup.loading && $setup.hasNotifications ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
              $setup.hasUnreadNotifications ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "mark-all-read-container"
              }, [
                vue.createElementVNode("button", {
                  class: "mark-all-read-btn",
                  onClick: $setup.handleMarkAllAsRead
                }, [
                  vue.createElementVNode("text", { class: "mark-all-read-text" }, "全部标为已读")
                ])
              ])) : vue.createCommentVNode("v-if", true),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.messageStore.notifications, (notification) => {
                  return vue.openBlock(), vue.createBlock($setup["NotificationCard"], {
                    key: notification.id,
                    notification,
                    onClick: ($event) => $setup.readNotification(notification)
                  }, null, 8, ["notification", "onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true),
            !$setup.loading && !$setup.hasNotifications ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "empty-state"
            }, [
              vue.createElementVNode("image", {
                src: _imports_0$3,
                class: "empty-icon"
              }),
              vue.createElementVNode("text", { class: "empty-text" }, "暂无通知"),
              $setup.isLoggedIn ? (vue.openBlock(), vue.createElementBlock("button", {
                key: 0,
                class: "refresh-btn",
                onClick: $setup.loadData
              }, "刷新")) : (vue.openBlock(), vue.createElementBlock("button", {
                key: 1,
                class: "login-btn",
                onClick: _cache[3] || (_cache[3] = () => uni.navigateTo({ url: "/pages/login/index" }))
              }, "去登录"))
            ])) : vue.createCommentVNode("v-if", true)
          ],
          512
          /* NEED_PATCH */
        ), [
          [vue.vShow, $setup.activeTab === "notification"]
        ]),
        vue.withDirectives(vue.createElementVNode(
          "view",
          null,
          [
            !$setup.loading && $setup.hasSubscriptionNotifications ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
              $setup.unreadSubscriptionCount > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "mark-all-read-container"
              }, [
                vue.createElementVNode("button", {
                  class: "mark-all-read-btn",
                  onClick: $setup.handleMarkAllSubscriptionsAsRead
                }, [
                  vue.createElementVNode("text", { class: "mark-all-read-text" }, "全部标为已读")
                ])
              ])) : vue.createCommentVNode("v-if", true),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.subscriptionNotifications, (notification) => {
                  return vue.openBlock(), vue.createBlock($setup["SubscriptionNotificationCard"], {
                    key: notification.id,
                    notification,
                    onClick: ($event) => $setup.readSubscriptionNotification(notification)
                  }, null, 8, ["notification", "onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true),
            !$setup.loading && !$setup.hasSubscriptionNotifications ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "empty-state"
            }, [
              vue.createElementVNode("image", {
                src: _imports_0$3,
                class: "empty-icon"
              }),
              vue.createElementVNode("text", { class: "empty-text" }, "暂无订阅通知"),
              vue.createElementVNode("text", { class: "empty-hint" }, "长按需求集市中的类别可订阅相关通知"),
              $setup.isLoggedIn ? (vue.openBlock(), vue.createElementBlock("button", {
                key: 0,
                class: "refresh-btn",
                onClick: $setup.loadData
              }, "刷新")) : (vue.openBlock(), vue.createElementBlock("button", {
                key: 1,
                class: "login-btn",
                onClick: _cache[4] || (_cache[4] = () => uni.navigateTo({ url: "/pages/login/index" }))
              }, "去登录"))
            ])) : vue.createCommentVNode("v-if", true)
          ],
          512
          /* NEED_PATCH */
        ), [
          [vue.vShow, $setup.activeTab === "subscription"]
        ]),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-state"
        }, [
          vue.createElementVNode("text", null, "加载中...")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesMessagesIndex = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$k], ["__scopeId", "data-v-aedce2fc"], ["__file", "F:/new/success/uniappandroid/pages/messages/index.vue"]]);
  const useOrderStore = defineStore("order", {
    state: () => ({
      orderList: [],
      currentOrder: null,
      totalCount: 0,
      loading: false
    }),
    actions: {
      // 获取订单列表
      async getOrderList(params = {}) {
        try {
          this.loading = true;
          const res = await get("/orders", params);
          this.setOrderList(res.list || []);
          this.setTotalCount(res.total || 0);
          return res;
        } catch (error) {
          formatAppLog("error", "at store/order.js:27", "获取订单列表失败:", error);
          throw error;
        } finally {
          this.loading = false;
        }
      },
      // 获取订单详情
      async getOrderDetail(id) {
        try {
          const order = await get(`/orders/${id}`);
          this.setCurrentOrder(order);
          return order;
        } catch (error) {
          formatAppLog("error", "at store/order.js:43", "获取订单详情失败:", error);
          throw error;
        }
      },
      // 创建订单
      async createOrder(orderData) {
        let testdata = {
          "project_id": 6,
          "bid_id": 5,
          "publisher_id": 2,
          "bidder_id": 1,
          "amount": 1.1
        };
        formatAppLog("log", "at store/order.js:57", "创建订单传入的什么？", orderData);
        try {
          const order = await post("/orders", testdata);
          return order;
        } catch (error) {
          formatAppLog("error", "at store/order.js:63", "创建订单失败:", error);
          throw error;
        }
      },
      // 支付订单
      async payOrder(orderId) {
        try {
          const result = await post(`/orders/${orderId}/pay`);
          return result;
        } catch (error) {
          formatAppLog("error", "at store/order.js:75", "支付订单失败:", error);
          throw error;
        }
      },
      // 确认完成订单
      async completeOrder(orderId) {
        try {
          const result = await post(`/orders/${orderId}/complete`);
          return result;
        } catch (error) {
          formatAppLog("error", "at store/order.js:87", "确认完成订单失败:", error);
          throw error;
        }
      },
      // 取消订单
      async cancelOrder(orderId) {
        try {
          const result = await post(`/orders/${orderId}/cancel`);
          return result;
        } catch (error) {
          formatAppLog("error", "at store/order.js:99", "取消订单失败:", error);
          throw error;
        }
      },
      // 添加订单留言
      async addOrderMessage(orderId, message) {
        try {
          const newMessage = await post(`/orders/${orderId}/messages`, { content: message });
          return newMessage;
        } catch (error) {
          formatAppLog("error", "at store/order.js:111", "添加订单留言失败:", error);
          throw error;
        }
      },
      // 更新里程碑状态
      async updateMilestone(orderId, milestoneId, status) {
        try {
          const result = await put(`/orders/${orderId}/milestones/${milestoneId}`, { status });
          return result;
        } catch (error) {
          formatAppLog("error", "at store/order.js:123", "更新里程碑状态失败:", error);
          throw error;
        }
      },
      // 设置订单列表
      setOrderList(list) {
        this.orderList = list;
      },
      // 设置当前订单
      setCurrentOrder(order) {
        this.currentOrder = order;
      },
      // 设置总数
      setTotalCount(count) {
        this.totalCount = count;
      }
    }
  });
  const _imports_1$2 = "/static/icons/Sending.png";
  const _imports_2$1 = "/static/icons/hr.png";
  const _sfc_main$j = {
    __name: "chat",
    setup(__props, { expose: __expose }) {
      __expose();
      const messageStore = useMessageStore();
      const userStore = useUserStore$1();
      const orderStore = useOrderStore();
      const chatInfo = vue.reactive({
        id: null,
        targetUserId: null,
        targetUsername: "",
        targetUserAvatar: ""
      });
      const messages = vue.ref([]);
      const inputText = vue.ref("");
      const scrollToView = vue.ref("");
      const loadingMore = vue.ref(false);
      const showSystemMessage = vue.ref(true);
      const orderModalVisible = vue.ref(false);
      const orderContractGenerated = vue.ref(false);
      const inputMode = vue.ref("text");
      const isRecording = vue.ref(false);
      const title = vue.ref("未开始");
      const partialResult = vue.ref("...");
      const result = vue.ref("");
      const valueWidth = vue.ref("0px");
      const orderForm = vue.reactive({
        projectName: "",
        partyA: "",
        partyB: "",
        amount: "",
        description: "",
        deliveryTime: "订单签订后2周内",
        paymentMethod: "支付宝"
      });
      onLoad(async (options) => {
        formatAppLog("log", "at pages/messages/chat.vue:189", "聊天页面加载，参数:", options);
        chatInfo.id = options.chatId || options.id;
        chatInfo.targetUserId = options.targetUserId;
        chatInfo.targetUsername = options.targetUserName || options.targetUsername || "用户";
        if (options.targetUserName) {
          chatInfo.targetUsername = options.targetUserName;
        }
        const chat = messageStore.chatList.find((c) => c.id == chatInfo.id);
        if (chat) {
          chatInfo.targetUsername = chat.target_user.username;
          chatInfo.targetUserAvatar = chat.target_user.avatar;
        }
        formatAppLog("log", "at pages/messages/chat.vue:205", "聊天信息:", chatInfo);
        orderForm.partyA = chatInfo.targetUsername;
        orderForm.partyB = userStore.userInfo.username || "我方企业";
        await loadMessages(true);
        formatAppLog("log", "at pages/messages/chat.vue:212", "检查WebSocket连接状态:", isSocketConnected());
        if (!isSocketConnected()) {
          formatAppLog("log", "at pages/messages/chat.vue:215", "WebSocket未连接，尝试重新连接");
          connectWebSocket(userStore.token);
          setTimeout(() => {
            if (isSocketConnected()) {
              formatAppLog("log", "at pages/messages/chat.vue:220", "WebSocket重连成功，加入聊天房间");
              joinChatRoom(chatInfo.id);
              markMessagesRead(chatInfo.id);
            } else {
              formatAppLog("error", "at pages/messages/chat.vue:224", "WebSocket重连失败");
              uni.showToast({
                title: "连接失败，部分功能可能不可用",
                icon: "none",
                duration: 3e3
              });
            }
          }, 2e3);
        } else {
          formatAppLog("log", "at pages/messages/chat.vue:233", "WebSocket已连接，直接加入聊天房间");
          joinChatRoom(chatInfo.id);
          markMessagesRead(chatInfo.id);
        }
      });
      vue.onMounted(() => {
        formatAppLog("log", "at pages/messages/chat.vue:240", "注册新消息监听器");
        onNewMessage(handleNewMessage);
        uni.onSocketMessage(handleSocketMessage);
        initRecorder();
      });
      onReady(() => {
        plus.android.requestPermissions(["android.permission.RECORD_AUDIO"], (e) => {
        }, (e) => {
        });
        plus.speech.addEventListener("start", ontStart, false);
        plus.speech.addEventListener("volumeChange", onVolumeChange, false);
        plus.speech.addEventListener("recognizing", onRecognizing, false);
        plus.speech.addEventListener("recognition", onRecognition, false);
        plus.speech.addEventListener("end", onEnd, false);
      });
      vue.onUnmounted(() => {
        formatAppLog("log", "at pages/messages/chat.vue:259", "离开聊天房间并移除监听器");
        leaveChatRoom(chatInfo.id);
        onNewMessage(null);
        plus.speech.removeEventListener("start", ontStart);
        plus.speech.removeEventListener("volumeChange", onVolumeChange);
        plus.speech.removeEventListener("recognizing", onRecognizing);
        plus.speech.removeEventListener("recognition", onRecognition);
        plus.speech.removeEventListener("end", onEnd);
      });
      const handleSocketMessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          formatAppLog("log", "at pages/messages/chat.vue:276", "聊天页面直接收到WebSocket消息:", data);
          if (data.type === "message" && data.data && data.data.chat_id == chatInfo.id) {
            formatAppLog("log", "at pages/messages/chat.vue:279", "收到当前聊天的新消息:", data.data);
            if (data.data.message.sender_id !== userStore.userInfo.id) {
              const existingMsg = messages.value.find((msg) => msg.id === data.data.message.id);
              if (!existingMsg) {
                messages.value.push(data.data.message);
                scrollToBottom();
                formatAppLog("log", "at pages/messages/chat.vue:286", "对方消息已添加到列表，当前消息数:", messages.value.length);
              } else {
                formatAppLog("log", "at pages/messages/chat.vue:288", "消息已存在，不重复添加");
              }
            } else {
              formatAppLog("log", "at pages/messages/chat.vue:291", "忽略自己发送的消息");
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/messages/chat.vue:295", "处理WebSocket消息失败:", error);
        }
      };
      vue.watch(() => messageStore.chatList, (newChatList) => {
        const currentChat = newChatList.find((chat) => chat.id === chatInfo.id);
        if (currentChat) {
          formatAppLog("log", "at pages/messages/chat.vue:302", "聊天列表更新，重新加载消息");
          loadMessages();
        }
      }, { deep: true });
      const loadMessages = async (isInitial = false) => {
        try {
          const res = await messageStore.getChatMessages(chatInfo.id);
          messages.value = res.reverse();
          if (isInitial) {
            scrollToBottom();
          }
        } catch (error) {
          formatAppLog("error", "at pages/messages/chat.vue:315", "加载消息失败:", error);
        }
      };
      const handleSend = async () => {
        if (!inputText.value.trim())
          return;
        if (!isSocketConnected()) {
          formatAppLog("error", "at pages/messages/chat.vue:323", "WebSocket未连接，无法发送消息");
          uni.showToast({
            title: "WebSocket未连接，正在重连...",
            icon: "none",
            duration: 2e3
          });
          connectWebSocket(userStore.token);
          return;
        }
        const messageData = {
          content: inputText.value,
          content_type: 0
        };
        formatAppLog("log", "at pages/messages/chat.vue:338", "发送消息:", messageData);
        try {
          await messageStore.sendMessage(chatInfo.id, messageData);
          const optimisticMessage = {
            id: Date.now(),
            sender_id: userStore.userInfo.id,
            ...messageData,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          messages.value.push(optimisticMessage);
          inputText.value = "";
          scrollToBottom();
          formatAppLog("log", "at pages/messages/chat.vue:351", "消息发送成功");
        } catch (error) {
          formatAppLog("error", "at pages/messages/chat.vue:353", "发送失败:", error);
          uni.showToast({ title: "发送失败", icon: "none" });
        }
      };
      const handleNewMessage = (data) => {
        formatAppLog("log", "at pages/messages/chat.vue:359", "收到新消息回调:", data);
        if (data.chat_id == chatInfo.id) {
          formatAppLog("log", "at pages/messages/chat.vue:361", "处理当前会话消息:", data.message);
          if (data.message.sender_id !== userStore.userInfo.id) {
            const existingMsg = messages.value.find((msg) => msg.id === data.message.id);
            if (!existingMsg) {
              messages.value.push(data.message);
              scrollToBottom();
              formatAppLog("log", "at pages/messages/chat.vue:367", "对方消息已添加到列表，当前消息数:", messages.value.length);
            } else {
              formatAppLog("log", "at pages/messages/chat.vue:369", "消息已存在，不重复添加");
            }
          } else {
            formatAppLog("log", "at pages/messages/chat.vue:372", "忽略自己发送的消息");
          }
        } else {
          formatAppLog("log", "at pages/messages/chat.vue:375", "非当前会话消息，忽略");
        }
      };
      const initRecorder = () => {
        formatAppLog("log", "at pages/messages/chat.vue:382", "语音识别初始化完成");
      };
      const toggleInputMode = () => {
        inputMode.value = inputMode.value === "text" ? "voice" : "text";
      };
      const ontStart = () => {
        title.value = "...倾听中...";
        result.value = "";
        formatAppLog("log", "at pages/messages/chat.vue:393", "Event: start");
        isRecording.value = true;
      };
      const onVolumeChange = (e) => {
        valueWidth.value = 100 * e.volume + "px";
        formatAppLog("log", "at pages/messages/chat.vue:399", "Event: volumeChange " + valueWidth.value);
      };
      const onRecognizing = (e) => {
        partialResult.value = e.partialResult;
        formatAppLog("log", "at pages/messages/chat.vue:404", "Event: recognizing");
      };
      const onRecognition = (e) => {
        result.value += e.result;
        result.value ? result.value += " " : result.value = "";
        partialResult.value = e.result;
        formatAppLog("log", "at pages/messages/chat.vue:411", "Event: recognition");
      };
      const onEnd = () => {
        if (!result.value || result.value == "") {
          uni.showToast({ title: "没有识别到内容", icon: "none" });
        } else {
          inputText.value = result.value.trim();
          if (inputText.value) {
            handleSend();
          }
        }
        title.value = "未开始";
        valueWidth.value = "0px";
        partialResult.value = "...";
        isRecording.value = false;
      };
      const startRecord = () => {
        formatAppLog("log", "at pages/messages/chat.vue:432", "startRecognize");
        isRecording.value = true;
        title.value = "...倾听中...";
        result.value = "";
        var options = {
          engine: "baidu"
        };
        formatAppLog("log", "at pages/messages/chat.vue:441", "开始语音识别：");
        plus.speech.startRecognize(options, function(s) {
          formatAppLog("log", "at pages/messages/chat.vue:443", "识别结果:", s);
          result.value += s;
        }, function(e) {
          formatAppLog("log", "at pages/messages/chat.vue:446", "语音识别失败：" + JSON.stringify(e));
          uni.showToast({ title: "语音识别失败", icon: "none" });
          isRecording.value = false;
          title.value = "未开始";
        });
      };
      const handleVoiceEnd = () => {
        formatAppLog("log", "at pages/messages/chat.vue:455", "endRecognize");
        plus.speech.stopRecognize();
        if (result.value && result.value.trim()) {
          inputText.value = result.value.trim();
          handleSend();
        } else {
          uni.showToast({ title: "没有识别到内容", icon: "none" });
        }
        isRecording.value = false;
        title.value = "未开始";
      };
      const scrollToBottom = () => {
        vue.nextTick(() => {
          if (messages.value.length > 0) {
            scrollToView.value = "msg-" + messages.value[messages.value.length - 1].id;
          }
        });
      };
      const loadMore = () => {
        formatAppLog("log", "at pages/messages/chat.vue:482", "触发加载更多");
      };
      const shouldShowTime = (message, index) => {
        if (index === 0)
          return true;
        const prevMessage = messages.value[index - 1];
        const prevTime = new Date(prevMessage.created_at).getTime();
        const currentTime = new Date(message.created_at).getTime();
        return currentTime - prevTime > 5 * 60 * 1e3;
      };
      const formatMessageTime = (timeStr) => {
        const date = new Date(timeStr);
        return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      };
      const showOrderModal = () => {
        orderModalVisible.value = true;
      };
      const hideOrderModal = () => {
        orderModalVisible.value = false;
      };
      const confirmOrder = async () => {
        if (!orderForm.projectName) {
          uni.showToast({ title: "请输入项目名称", icon: "none" });
          return;
        }
        if (!orderForm.amount) {
          uni.showToast({ title: "请输入合同金额", icon: "none" });
          return;
        }
        if (!orderForm.description) {
          uni.showToast({ title: "请输入项目描述", icon: "none" });
          return;
        }
        try {
          const orderData = {
            project_name: orderForm.projectName,
            party_a: orderForm.partyA,
            party_b: orderForm.partyB,
            amount: orderForm.amount,
            description: orderForm.description,
            delivery_time: orderForm.deliveryTime,
            payment_method: orderForm.paymentMethod,
            chat_id: chatInfo.id,
            status: "pending"
          };
          await orderStore.createOrder(orderData);
          const systemMessage = `订单已生成：${orderForm.projectName}，金额：${orderForm.amount}，等支付`;
          await messageStore.sendMessage(chatInfo.id, {
            content: systemMessage,
            content_type: 1,
            media_url: "http://localhost:8080/test"
          });
          orderContractGenerated.value = true;
          hideOrderModal();
          uni.showToast({
            title: "订单合同已生成！",
            icon: "success"
          });
          scrollToBottom();
        } catch (error) {
          formatAppLog("error", "at pages/messages/chat.vue:552", "创建订单失败:", error);
          uni.showToast({
            title: "创建订单失败，请重试",
            icon: "none"
          });
        }
      };
      const showOptions = () => {
        uni.showActionSheet({
          itemList: ["查看订单", "清空聊天记录", "举报"],
          success: function(res) {
            if (res.tapIndex === 0) {
              uni.navigateTo({
                url: `/pages/orders/index?chatId=${chatInfo.id}`
              });
            } else if (res.tapIndex === 1) {
              uni.showModal({
                title: "确认清空",
                content: "确定要清空聊天记录吗？此操作不可恢复",
                success: function(res2) {
                  if (res2.confirm) {
                    messages.value = [];
                    uni.showToast({ title: "已清空", icon: "success" });
                  }
                }
              });
            } else if (res.tapIndex === 2) {
              uni.showToast({ title: "举报功能开发中", icon: "none" });
            }
          }
        });
      };
      const __returned__ = { messageStore, userStore, orderStore, chatInfo, messages, inputText, scrollToView, loadingMore, showSystemMessage, orderModalVisible, orderContractGenerated, inputMode, isRecording, title, partialResult, result, valueWidth, orderForm, handleSocketMessage, loadMessages, handleSend, handleNewMessage, initRecorder, toggleInputMode, ontStart, onVolumeChange, onRecognizing, onRecognition, onEnd, startRecord, handleVoiceEnd, scrollToBottom, loadMore, shouldShowTime, formatMessageTime, showOrderModal, hideOrderModal, confirmOrder, showOptions, ref: vue.ref, reactive: vue.reactive, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, nextTick: vue.nextTick, watch: vue.watch, get onLoad() {
        return onLoad;
      }, get onReady() {
        return onReady;
      }, get useMessageStore() {
        return useMessageStore;
      }, get useUserStore() {
        return useUserStore$1;
      }, get useOrderStore() {
        return useOrderStore;
      }, get joinChatRoom() {
        return joinChatRoom;
      }, get leaveChatRoom() {
        return leaveChatRoom;
      }, get markMessagesRead() {
        return markMessagesRead;
      }, get isSocketConnected() {
        return isSocketConnected;
      }, get connectWebSocket() {
        return connectWebSocket;
      }, get onNewMessage() {
        return onNewMessage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "chat-container" }, [
      vue.createElementVNode("view", { class: "header-fixed" }, [
        vue.createElementVNode("view", { class: "header-glass" }, [
          vue.createElementVNode("text", {
            class: "back-icon",
            onClick: _cache[0] || (_cache[0] = ($event) => uni.navigateBack())
          }, "‹"),
          vue.createElementVNode(
            "text",
            { class: "header-title" },
            vue.toDisplayString($setup.chatInfo.targetUsername || "聊天"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", {
            class: "options-icon",
            onClick: $setup.showOptions
          }, "···")
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        class: "messages-scroll",
        "scroll-y": "",
        "scroll-into-view": $setup.scrollToView,
        "scroll-with-animation": true,
        onScrolltoupper: $setup.loadMore
      }, [
        vue.createElementVNode("view", { class: "scroll-content" }, [
          $setup.loadingMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "loading-more"
          }, "加载中...")) : vue.createCommentVNode("v-if", true),
          $setup.showSystemMessage ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "system-message"
          }, [
            vue.createElementVNode(
              "view",
              { class: "system-content" },
              "您已与" + vue.toDisplayString($setup.chatInfo.targetUsername) + "建立联系",
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.messages, (msg, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: msg.id,
                id: "msg-" + msg.id
              }, [
                $setup.shouldShowTime(msg, index) ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: "time-display"
                  },
                  vue.toDisplayString($setup.formatMessageTime(msg.created_at)),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["message-row", { self: msg.sender_id === $setup.userStore.userInfo.id }])
                  },
                  [
                    msg.sender_id !== $setup.userStore.userInfo.id ? (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 0,
                        class: "message-avatar"
                      },
                      vue.toDisplayString($setup.chatInfo.targetUsername.substring(0, 1)),
                      1
                      /* TEXT */
                    )) : (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "message-avatar self"
                    }, "我")),
                    vue.createElementVNode("view", { class: "message-bubble" }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(msg.content),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "view",
                        { class: "message-time" },
                        vue.toDisplayString($setup.formatMessageTime(msg.created_at)),
                        1
                        /* TEXT */
                      )
                    ])
                  ],
                  2
                  /* CLASS */
                )
              ], 8, ["id"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          $setup.orderContractGenerated ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "system-message"
          }, [
            vue.createElementVNode("view", { class: "system-content" }, "订单合同已生成，等待双方确认")
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ], 40, ["scroll-into-view"]),
      vue.createElementVNode("view", { class: "input-area-fixed" }, [
        vue.createElementVNode("view", { class: "input-area-glass" }, [
          vue.createElementVNode("image", {
            class: "voice-icon",
            src: _imports_0$4,
            onClick: $setup.toggleInputMode
          }),
          $setup.inputMode === "text" ? vue.withDirectives((vue.openBlock(), vue.createElementBlock(
            "textarea",
            {
              key: 0,
              class: "chat-input",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.inputText = $event),
              placeholder: "输入消息...",
              "auto-height": "",
              maxlength: -1,
              onConfirm: $setup.handleSend,
              "confirm-type": "send"
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          )), [
            [vue.vModelText, $setup.inputText]
          ]) : vue.createCommentVNode("v-if", true),
          $setup.inputMode === "voice" ? (vue.openBlock(), vue.createElementBlock(
            "button",
            {
              key: 1,
              class: "voice-input",
              onTouchstart: vue.withModifiers($setup.startRecord, ["stop"]),
              onTouchend: vue.withModifiers($setup.handleVoiceEnd, ["stop"])
            },
            vue.toDisplayString($setup.isRecording ? "松开结束" : "按住说话"),
            33
            /* TEXT, NEED_HYDRATION */
          )) : vue.createCommentVNode("v-if", true),
          $setup.inputMode === "text" ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 2,
            class: "send-btn",
            onClick: $setup.handleSend,
            disabled: !$setup.inputText.trim()
          }, [
            vue.createElementVNode("image", {
              class: "send-icon",
              src: _imports_1$2
            })
          ], 8, ["disabled"])) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", {
        class: "floating-order-btn",
        onClick: $setup.showOrderModal
      }, [
        vue.createElementVNode("image", {
          class: "order-icon",
          src: _imports_2$1
        })
      ]),
      $setup.orderModalVisible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "order-modal"
      }, [
        vue.createElementVNode("view", {
          class: "order-content",
          onClick: _cache[9] || (_cache[9] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "order-header" }, [
            vue.createElementVNode("view", { class: "order-title" }, "生成订单"),
            vue.createElementVNode("view", { class: "order-subtitle" }, "确认项目信息并生成正式订单")
          ]),
          vue.createElementVNode("form", { class: "order-form" }, [
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", { class: "form-label" }, "项目名称"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "text",
                  class: "form-input",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.orderForm.projectName = $event),
                  placeholder: "请输入项目名称"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.orderForm.projectName]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", { class: "form-label" }, "甲方"),
              vue.withDirectives(vue.createElementVNode("input", {
                type: "text",
                class: "form-input",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.orderForm.partyA = $event),
                placeholder: $setup.chatInfo.targetUsername
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.orderForm.partyA]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", { class: "form-label" }, "乙方"),
              vue.withDirectives(vue.createElementVNode("input", {
                type: "text",
                class: "form-input",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.orderForm.partyB = $event),
                placeholder: $setup.userStore.userInfo.username
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.orderForm.partyB]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", { class: "form-label" }, "订单金额"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "text",
                  class: "form-input",
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.orderForm.amount = $event),
                  placeholder: "请输入合同金额"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.orderForm.amount]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", { class: "form-label" }, "项目描述"),
              vue.withDirectives(vue.createElementVNode(
                "textarea",
                {
                  class: "form-textarea",
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.orderForm.description = $event),
                  placeholder: "请输入项目描述"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.orderForm.description]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", { class: "form-label" }, "交货时间"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "text",
                  class: "form-input",
                  "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.orderForm.deliveryTime = $event),
                  placeholder: "例如：合同签订后2周内"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.orderForm.deliveryTime]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-group" }, [
              vue.createElementVNode("label", { class: "form-label" }, "付款方式"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "text",
                  class: "form-input",
                  "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $setup.orderForm.paymentMethod = $event),
                  placeholder: "例如：支付宝"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.orderForm.paymentMethod]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "order-actions" }, [
            vue.createElementVNode("button", {
              class: "btn btn-cancel",
              onClick: $setup.hideOrderModal
            }, "取消"),
            vue.createElementVNode("button", {
              class: "btn btn-confirm",
              onClick: $setup.confirmOrder
            }, "生成订单")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMessagesChat = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$j], ["__scopeId", "data-v-56908723"], ["__file", "F:/new/success/uniappandroid/pages/messages/chat.vue"]]);
  const _imports_0$2 = "/static/images/empty-order.png";
  const _sfc_main$i = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const loading = vue.ref(false);
      const hasMore = vue.ref(true);
      const currentPage = vue.ref(1);
      const activeTab = vue.ref("all");
      const orders = vue.ref([]);
      const tabs = [
        { label: "全部", value: "all" },
        { label: "待付款", value: "pending" },
        // 注意：这里的 value 需要与后端返回的 status 字段值对应
        { label: "进行中", value: "in_progress" },
        { label: "已完成", value: "completed" },
        { label: "已取消", value: "cancelled" }
      ];
      const onPullDownRefresh2 = async () => {
        formatAppLog("log", "at pages/orders/index.vue:132", "触发下拉刷新");
        await loadOrders(true);
        uni.stopPullDownRefresh();
      };
      const onReachBottom2 = () => {
        formatAppLog("log", "at pages/orders/index.vue:139", "触发上拉加载");
        if (!loading.value && hasMore.value) {
          loadOrders(false);
        }
      };
      const filteredOrders = vue.computed(() => {
        const ordersList = Array.isArray(orders.value) ? orders.value : [];
        if (activeTab.value === "all") {
          return ordersList;
        }
        return ordersList.filter((order) => order.status === activeTab.value);
      });
      const loadOrders = async (refresh = false) => {
        var _a, _b;
        if (loading.value)
          return;
        try {
          loading.value = true;
          const page = refresh ? 1 : currentPage.value + 1;
          const pageSize = 10;
          const userID = (_a = userStore.userInfo) == null ? void 0 : _a.id;
          if (!userID) {
            formatAppLog("error", "at pages/orders/index.vue:168", "用户ID不存在");
            uni.showToast({
              title: "请先登录",
              icon: "none"
            });
            return;
          }
          const role = ((_b = userStore.userInfo) == null ? void 0 : _b.role) || "";
          let statusNum = "";
          if (activeTab.value !== "all") {
            switch (activeTab.value) {
              case "pending":
                statusNum = "0";
                break;
              case "in_progress":
                statusNum = "1";
                break;
              case "completed":
                statusNum = "3";
                break;
              case "cancelled":
                statusNum = "4";
                break;
            }
          }
          try {
            const data = await get("/orders", {
              user_id: userID,
              page,
              page_size: pageSize,
              role,
              status: statusNum
            });
            formatAppLog("log", "at pages/orders/index.vue:201", "订单数据:", data);
            const orderList = data.list || [];
            const formattedOrders = orderList.map((order) => {
              var _a2, _b2, _c;
              return {
                id: order.id,
                order_no: order.order_no,
                project_title: ((_a2 = order.project) == null ? void 0 : _a2.title) || "未知项目",
                amount: order.amount,
                status: mapStatusToString(order.status),
                created_at: order.created_at,
                seller_name: ((_b2 = order.bidder) == null ? void 0 : _b2.username) || "未知服务商",
                buyer_name: ((_c = order.publisher) == null ? void 0 : _c.username) || "未知需求方"
              };
            });
            if (refresh) {
              orders.value = formattedOrders;
              currentPage.value = 1;
            } else {
              orders.value.push(...formattedOrders);
              currentPage.value = page;
            }
            hasMore.value = !data.hasMore ? false : data.total > page * pageSize;
          } catch (apiError) {
            formatAppLog("error", "at pages/orders/index.vue:230", "API请求失败:", apiError);
            throw apiError;
          }
        } catch (error) {
          formatAppLog("error", "at pages/orders/index.vue:234", "加载订单失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const switchTab = (tab) => {
        if (activeTab.value === tab)
          return;
        activeTab.value = tab;
        loadOrders(true);
      };
      vue.onMounted(() => {
        formatAppLog("log", "at pages/orders/index.vue:255", "订单页面挂载");
        loadOrders(true);
      });
      const mapStatusToString = (statusNum) => {
        switch (parseInt(statusNum)) {
          case 0:
            return "pending";
          case 1:
            return "in_progress";
          case 2:
            return "in_progress";
          case 3:
            return "completed";
          case 4:
            return "cancelled";
          default:
            return "unknown";
        }
      };
      const getStatusText = (status) => {
        switch (status) {
          case "pending":
            return "待付款";
          case "in_progress":
            return "进行中";
          case "completed":
            return "已完成";
          case "cancelled":
            return "已取消";
          default:
            return "未知状态";
        }
      };
      const getStatusClass = (status) => {
        switch (status) {
          case "pending":
            return "status-pending";
          case "in_progress":
            return "status-progress";
          case "completed":
            return "status-completed";
          case "cancelled":
            return "status-cancelled";
          default:
            return "";
        }
      };
      const formatMoney = (amount) => {
        const num = typeof amount === "number" ? amount : parseFloat(amount);
        if (isNaN(num))
          return "0.00";
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };
      const formatDate = (dateString) => {
        if (!dateString)
          return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime()))
          return "无效日期";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      };
      const goToOrderDetail = (orderId) => {
        if (orderId) {
          uni.navigateTo({
            url: `/pages/orders/detail?id=${orderId}`
          });
        }
      };
      const handlePay = (orderId) => {
        if (!orderId)
          return;
        uni.showModal({
          title: "支付订单",
          content: "确认支付该订单吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "处理中..."
                });
                await put(`/orders/${orderId}/status`, {
                  status: 1
                  // 已支付状态
                });
                uni.hideLoading();
                uni.showToast({
                  title: "支付成功",
                  icon: "success"
                });
                loadOrders(true);
              } catch (error) {
                uni.hideLoading();
                uni.showToast({
                  title: "支付失败: " + (error.message || "未知错误"),
                  icon: "none"
                });
              }
            }
          }
        });
      };
      const handleConfirm = (orderId) => {
        if (!orderId)
          return;
        uni.showModal({
          title: "确认完成",
          content: "确认该订单已完成吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "处理中..."
                });
                await put(`/orders/${orderId}/complete`, {});
                uni.hideLoading();
                uni.showToast({
                  title: "确认完成成功",
                  icon: "success"
                });
                loadOrders(true);
              } catch (error) {
                uni.hideLoading();
                uni.showToast({
                  title: "确认失败: " + (error.message || "未知错误"),
                  icon: "none"
                });
              }
            }
          }
        });
      };
      const handleCancel = (orderId) => {
        if (!orderId)
          return;
        uni.showModal({
          title: "取消订单",
          content: "确认取消该订单吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "处理中..."
                });
                await put(`/orders/${orderId}/cancel`, {});
                uni.hideLoading();
                uni.showToast({
                  title: "订单已取消",
                  icon: "success"
                });
                loadOrders(true);
              } catch (error) {
                uni.hideLoading();
                uni.showToast({
                  title: "取消失败: " + (error.message || "未知错误"),
                  icon: "none"
                });
              }
            }
          }
        });
      };
      const contactUser = (username) => {
        uni.showToast({
          title: `联系 ${username || "用户"} 功能开发中`,
          // 添加默认值
          icon: "none"
        });
      };
      const goToProjects = () => {
        uni.switchTab({
          url: "/pages/projects/list"
        });
      };
      const __returned__ = { userStore, loading, hasMore, currentPage, activeTab, orders, tabs, onPullDownRefresh: onPullDownRefresh2, onReachBottom: onReachBottom2, filteredOrders, loadOrders, switchTab, mapStatusToString, getStatusText, getStatusClass, formatMoney, formatDate, goToOrderDetail, handlePay, handleConfirm, handleCancel, contactUser, goToProjects, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get useUserStore() {
        return useUserStore$1;
      }, get get() {
        return get;
      }, get put() {
        return put;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "orders-page" }, [
      vue.createElementVNode("view", { class: "tab-header" }, [
        (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.tabs, (tab) => {
            return vue.createElementVNode("view", {
              key: tab.value,
              class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === tab.value }]),
              onClick: ($event) => $setup.switchTab(tab.value)
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(tab.label),
                1
                /* TEXT */
              )
            ], 10, ["onClick"]);
          }),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", { class: "order-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.filteredOrders, (order) => {
            var _a, _b, _c, _d;
            return vue.openBlock(), vue.createElementBlock("view", {
              key: order.id,
              class: "order-item",
              onClick: ($event) => $setup.goToOrderDetail(order.id)
            }, [
              vue.createElementVNode("view", { class: "order-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "order-id" },
                  "订单号：" + vue.toDisplayString(order.id),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["order-status", $setup.getStatusClass(order.status)])
                  },
                  vue.toDisplayString($setup.getStatusText(order.status)),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              vue.createElementVNode("view", { class: "order-content" }, [
                vue.createElementVNode(
                  "text",
                  { class: "project-title" },
                  vue.toDisplayString(order.project_title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "order-info" }, [
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "label" }, "交易金额："),
                    vue.createElementVNode(
                      "text",
                      { class: "value price" },
                      "¥" + vue.toDisplayString($setup.formatMoney(order.amount)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "label" },
                      vue.toDisplayString(((_a = $setup.userStore.userInfo) == null ? void 0 : _a.role) === "client" ? "服务商：" : "需求方："),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(((_b = $setup.userStore.userInfo) == null ? void 0 : _b.role) === "client" ? order.seller_name : order.buyer_name),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "label" }, "创建时间："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString($setup.formatDate(order.created_at)),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "order-footer" }, [
                order.status === "pending" ? (vue.openBlock(), vue.createElementBlock("button", {
                  key: 0,
                  class: "btn btn-primary btn-small",
                  onClick: vue.withModifiers(($event) => $setup.handlePay(order.id), ["stop"])
                }, " 立即支付 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                order.status === "in_progress" && ((_c = $setup.userStore.userInfo) == null ? void 0 : _c.role) === "client" ? (vue.openBlock(), vue.createElementBlock("button", {
                  key: 1,
                  class: "btn btn-success btn-small",
                  onClick: vue.withModifiers(($event) => $setup.handleConfirm(order.id), ["stop"])
                }, " 确认完成 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                order.status === "pending" ? (vue.openBlock(), vue.createElementBlock("button", {
                  key: 2,
                  class: "btn btn-secondary btn-small",
                  onClick: vue.withModifiers(($event) => $setup.handleCancel(order.id), ["stop"])
                }, " 取消订单 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("button", {
                  class: "btn btn-outline btn-small",
                  onClick: vue.withModifiers(($event) => {
                    var _a2;
                    return $setup.contactUser(((_a2 = $setup.userStore.userInfo) == null ? void 0 : _a2.role) === "client" ? order.seller_name : order.buyer_name);
                  }, ["stop"])
                }, " 联系" + vue.toDisplayString(((_d = $setup.userStore.userInfo) == null ? void 0 : _d.role) === "client" ? "服务商" : "需求方"), 9, ["onClick"])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading"
        }, [
          vue.createElementVNode("text", null, "加载中...")
        ])) : vue.createCommentVNode("v-if", true),
        !$setup.hasMore && $setup.filteredOrders.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "no-more"
        }, [
          vue.createElementVNode("text", { class: "no-more-text" }, "没有更多订单了")
        ])) : vue.createCommentVNode("v-if", true),
        !$setup.loading && $setup.filteredOrders.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "empty-state"
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$2,
            class: "empty-icon"
          }),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无相关订单"),
          vue.createElementVNode("button", {
            class: "btn btn-primary",
            onClick: $setup.goToProjects
          }, "浏览项目")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesOrdersIndex = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$i], ["__scopeId", "data-v-e1e6274e"], ["__file", "F:/new/success/uniappandroid/pages/orders/index.vue"]]);
  const _sfc_main$h = {
    __name: "detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const orderStore = useOrderStore();
      const order = vue.ref({
        id: "",
        project_id: "",
        project_title: "",
        buyer_id: "",
        buyer_name: "",
        seller_id: "",
        seller_name: "",
        amount: 0,
        status: "pending",
        created_at: "",
        updated_at: ""
      });
      const orderSteps = [
        { title: "创建订单", status: "created" },
        { title: "付款成功", status: "paid" },
        { title: "开始服务", status: "in_progress" },
        { title: "确认完成", status: "completed" }
      ];
      vue.onMounted(() => {
        loadOrderDetail();
      });
      const loadOrderDetail = async () => {
        var _a, _b;
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const orderId = (_b = (_a = currentPage.$page) == null ? void 0 : _a.options) == null ? void 0 : _b.id;
        if (!orderId) {
          uni.showToast({
            title: "订单ID不存在",
            icon: "none"
          });
          return;
        }
        try {
          const orderDetail = await orderStore.getOrderDetail(orderId);
          order.value = {
            ...order.value,
            // 保留默认结构
            ...orderDetail
            // 覆盖实际数据
          };
        } catch (error) {
          formatAppLog("error", "at pages/orders/detail.vue:174", "获取订单详情失败:", error);
          uni.showToast({
            title: "获取订单详情失败",
            icon: "none"
          });
        }
      };
      const getStatusText = (status) => {
        switch (status) {
          case "pending":
            return "待付款";
          case "paid":
            return "已付款";
          case "in_progress":
            return "进行中";
          case "completed":
            return "已完成";
          case "cancelled":
            return "已取消";
          default:
            return "未知状态";
        }
      };
      const getStatusDesc = (status) => {
        switch (status) {
          case "pending":
            return "请尽快完成支付，以免订单自动取消";
          case "paid":
            return "已完成支付，等待服务商开始服务";
          case "in_progress":
            return "服务商正在为您提供服务";
          case "completed":
            return "订单已完成，感谢您的使用";
          case "cancelled":
            return "订单已取消";
          default:
            return "";
        }
      };
      const getStatusIcon = (status) => {
        switch (status) {
          case "pending":
            return "💰";
          case "paid":
          case "in_progress":
            return "⏳";
          case "completed":
            return "✅";
          case "cancelled":
            return "❌";
          default:
            return "ℹ️";
        }
      };
      const getStatusClass = (status) => {
        switch (status) {
          case "pending":
            return "status-pending";
          case "paid":
          case "in_progress":
            return "status-progress";
          case "completed":
            return "status-completed";
          case "cancelled":
            return "status-cancelled";
          default:
            return "";
        }
      };
      const isStepActive = (stepStatus, orderStatus) => {
        const statusOrder = ["created", "pending", "paid", "in_progress", "completed", "cancelled"];
        const stepIndex = statusOrder.indexOf(stepStatus);
        const orderIndex = statusOrder.indexOf(orderStatus);
        if (orderStatus === "cancelled") {
          return stepStatus === "created";
        }
        return stepIndex <= orderIndex;
      };
      const getStepTime = (stepStatus, orderData) => {
        switch (stepStatus) {
          case "created":
            return orderData.created_at;
          case "paid":
          case "in_progress":
          case "completed":
            return orderData.updated_at;
          default:
            return orderData.created_at;
        }
      };
      const formatMoney = (amount) => {
        if (amount === void 0 || amount === null)
          return "0.00";
        const num = typeof amount === "number" ? amount : parseFloat(amount);
        if (isNaN(num))
          return "0.00";
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };
      const formatDate = (dateString) => {
        if (!dateString)
          return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime()))
          return "无效日期";
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      };
      const handlePay = async () => {
        try {
          await orderStore.payOrder(order.value.id);
          uni.showToast({
            title: "支付成功",
            icon: "success"
          });
          loadOrderDetail();
        } catch (error) {
          uni.showToast({
            title: "支付失败",
            icon: "none"
          });
        }
      };
      const handleConfirm = () => {
        uni.showModal({
          title: "确认完成",
          content: "确认该订单已完成吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                await orderStore.completeOrder(order.value.id);
                uni.showToast({
                  title: "确认完成成功",
                  icon: "success"
                });
                loadOrderDetail();
              } catch (error) {
                uni.showToast({
                  title: "确认完成失败",
                  icon: "none"
                });
              }
            }
          }
        });
      };
      const handleCancel = () => {
        uni.showModal({
          title: "取消订单",
          content: "确认取消该订单吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                await orderStore.cancelOrder(order.value.id);
                uni.showToast({
                  title: "取消订单成功",
                  icon: "success"
                });
                loadOrderDetail();
              } catch (error) {
                uni.showToast({
                  title: "取消订单失败",
                  icon: "none"
                });
              }
            }
          }
        });
      };
      const contactUser = () => {
        var _a;
        const contactName = ((_a = userStore.userInfo) == null ? void 0 : _a.role) === "client" ? order.value.seller_name : order.value.buyer_name;
        uni.showToast({
          title: `联系 ${contactName || "用户"} 功能开发中`,
          icon: "none"
        });
      };
      const __returned__ = { userStore, orderStore, order, orderSteps, loadOrderDetail, getStatusText, getStatusDesc, getStatusIcon, getStatusClass, isStepActive, getStepTime, formatMoney, formatDate, handlePay, handleConfirm, handleCancel, contactUser, ref: vue.ref, onMounted: vue.onMounted, get useUserStore() {
        return useUserStore$1;
      }, get useOrderStore() {
        return useOrderStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b;
    return vue.openBlock(), vue.createElementBlock("view", { class: "order-detail-page" }, [
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["status-card", $setup.getStatusClass($setup.order.status)])
        },
        [
          vue.createElementVNode("view", { class: "status-icon" }, [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($setup.getStatusIcon($setup.order.status)),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "status-info" }, [
            vue.createElementVNode(
              "text",
              { class: "status-text" },
              vue.toDisplayString($setup.getStatusText($setup.order.status)),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "status-desc" },
              vue.toDisplayString($setup.getStatusDesc($setup.order.status)),
              1
              /* TEXT */
            )
          ])
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode("view", { class: "info-card" }, [
        vue.createElementVNode("view", { class: "card-title" }, "订单信息"),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "订单编号"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.order.id),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "创建时间"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.formatDate($setup.order.created_at)),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "更新时间"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.formatDate($setup.order.updated_at)),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "info-card" }, [
        vue.createElementVNode("view", { class: "card-title" }, "项目信息"),
        vue.createElementVNode("view", { class: "project-info" }, [
          vue.createElementVNode(
            "text",
            { class: "project-title" },
            vue.toDisplayString($setup.order.project_title),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "project-amount" },
            "¥" + vue.toDisplayString($setup.formatMoney($setup.order.amount)),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "项目ID"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.order.project_id),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "info-card" }, [
        vue.createElementVNode("view", { class: "card-title" }, "交易方信息"),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "需求方"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.order.buyer_name),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "服务商"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($setup.order.seller_name),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "info-card" }, [
        vue.createElementVNode("view", { class: "card-title" }, "订单进度"),
        vue.createElementVNode("view", { class: "progress-timeline" }, [
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.orderSteps, (step, index) => {
              return vue.createElementVNode(
                "view",
                {
                  key: index,
                  class: vue.normalizeClass(["timeline-item", { active: $setup.isStepActive(step.status, $setup.order.status) }])
                },
                [
                  vue.createElementVNode("view", { class: "timeline-dot" }),
                  vue.createElementVNode("view", { class: "timeline-content" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "timeline-title" },
                      vue.toDisplayString(step.title),
                      1
                      /* TEXT */
                    ),
                    $setup.isStepActive(step.status, $setup.order.status) ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 0,
                        class: "timeline-time"
                      },
                      vue.toDisplayString($setup.formatDate($setup.getStepTime(step.status, $setup.order))),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ])
                ],
                2
                /* CLASS */
              );
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("view", { class: "action-bar" }, [
        $setup.order.status === "pending" ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          class: "btn btn-primary",
          onClick: $setup.handlePay
        }, " 立即支付 ")) : vue.createCommentVNode("v-if", true),
        $setup.order.status === "in_progress" && ((_a = $setup.userStore.userInfo) == null ? void 0 : _a.role) === "client" ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 1,
          class: "btn btn-success",
          onClick: $setup.handleConfirm
        }, " 确认完成 ")) : vue.createCommentVNode("v-if", true),
        $setup.order.status === "pending" ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 2,
          class: "btn btn-secondary",
          onClick: $setup.handleCancel
        }, " 取消订单 ")) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "button",
          {
            class: "btn btn-outline",
            onClick: $setup.contactUser
          },
          " 联系" + vue.toDisplayString(((_b = $setup.userStore.userInfo) == null ? void 0 : _b.role) === "client" ? "服务商" : "需求方"),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesOrdersDetail = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$h], ["__scopeId", "data-v-bc4602bd"], ["__file", "F:/new/success/uniappandroid/pages/orders/detail.vue"]]);
  const _imports_0$1 = "/static/icons/projects.png";
  const _imports_2 = "/static/icons/order.png";
  const _imports_3 = "/static/icons/verify.png";
  const _imports_4 = "/static/icons/settings.png";
  const _imports_5 = "/static/images/logo.png";
  const _sfc_main$g = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const user = vue.computed(() => userStore.userInfo);
      onShow(async () => {
        if (userStore.token) {
          await userStore.getUserInfo();
        }
      });
      const goToProfile = () => {
        uni.navigateTo({ url: "/pages/user/myinformation" });
      };
      const goToWallet = () => {
        uni.navigateTo({ url: "/pages/user/wallet" });
      };
      const goToMyProjects = () => {
        uni.navigateTo({ url: "/pages/user/projects" });
      };
      const goToMyBids = () => {
        uni.navigateTo({ url: "/pages/user/mybids" });
      };
      const goToMyOrders = () => {
        uni.navigateTo({ url: "/pages/orders/index" });
      };
      const goToVerify = () => {
        uni.navigateTo({ url: "/pages/user/verify" });
      };
      const goToSettings = () => {
        uni.navigateTo({ url: "/pages/user/settings" });
      };
      const goToLogin = () => {
        uni.navigateTo({ url: "/pages/login/index" });
      };
      const goToWebSocketDebug = () => {
        uni.navigateTo({ url: "/pages/test/websocket-debug" });
      };
      const __returned__ = { userStore, user, goToProfile, goToWallet, goToMyProjects, goToMyBids, goToMyOrders, goToVerify, goToSettings, goToLogin, goToWebSocketDebug, computed: vue.computed, get onShow() {
        return onShow;
      }, get useUserStore() {
        return useUserStore$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "user-page-container" }, [
      $setup.user ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "user-content"
      }, [
        vue.createElementVNode("view", { class: "glass-effect" }, [
          vue.createElementVNode("view", {
            class: "user-header",
            onClick: $setup.goToProfile
          }, [
            vue.createElementVNode("image", {
              class: "avatar",
              src: $setup.user.avatar || "/static/images/default-avatar.png"
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "user-info" }, [
              vue.createElementVNode("view", { class: "username-line" }, [
                vue.createElementVNode(
                  "text",
                  { class: "username" },
                  vue.toDisplayString($setup.user.username),
                  1
                  /* TEXT */
                ),
                $setup.user.is_verified ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "verified-badge"
                }, [
                  vue.createElementVNode("text", { class: "verified-icon" }, "✓"),
                  vue.createElementVNode("text", null, "已认证")
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", { class: "rating-line" }, [
                vue.createElementVNode("text", { class: "rating-label" }, "信誉分: "),
                vue.createElementVNode(
                  "text",
                  { class: "rating-score" },
                  vue.toDisplayString($setup.user.rating),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "arrow" }, [
              vue.createElementVNode("text", null, "›")
            ])
          ]),
          vue.createElementVNode("view", { class: "account-info" }, [
            vue.createElementVNode("view", { class: "balance-section" }, [
              vue.createElementVNode("text", { class: "balance-label" }, "账户余额 (元)"),
              vue.createElementVNode(
                "text",
                { class: "balance-amount" },
                vue.toDisplayString($setup.user.balance.toFixed(2)),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("button", {
              class: "recharge-btn",
              onClick: $setup.goToWallet
            }, "充值")
          ]),
          vue.createElementVNode("view", { class: "menu-list" }, [
            vue.createElementVNode("view", {
              class: "menu-item",
              onClick: $setup.goToMyProjects
            }, [
              vue.createElementVNode("image", {
                class: "menu-icon",
                src: _imports_0$1
              }),
              vue.createElementVNode("text", { class: "menu-text" }, "我的项目"),
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "menu-item",
              onClick: $setup.goToMyBids
            }, [
              vue.createElementVNode("image", {
                class: "menu-icon",
                src: _imports_1$5
              }),
              vue.createElementVNode("text", { class: "menu-text" }, "我的投标"),
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "menu-item",
              onClick: $setup.goToMyOrders
            }, [
              vue.createElementVNode("image", {
                class: "menu-icon",
                src: _imports_2
              }),
              vue.createElementVNode("text", { class: "menu-text" }, "我的订单"),
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ]),
            !$setup.user.is_verified ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "menu-item",
              onClick: $setup.goToVerify
            }, [
              vue.createElementVNode("image", {
                class: "menu-icon",
                src: _imports_3
              }),
              vue.createElementVNode("text", { class: "menu-text" }, "实名认证"),
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", {
              class: "menu-item",
              onClick: $setup.goToSettings
            }, [
              vue.createElementVNode("image", {
                class: "menu-icon",
                src: _imports_4
              }),
              vue.createElementVNode("text", { class: "menu-text" }, "设置"),
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ]),
            $setup.user && $setup.user.role === "admin" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "menu-item",
              onClick: $setup.goToWebSocketDebug
            }, [
              vue.createElementVNode("image", {
                class: "menu-icon",
                src: _imports_4
              }),
              vue.createElementVNode("text", { class: "menu-text" }, "WebSocket调试"),
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "login-prompt-container"
      }, [
        vue.createElementVNode("view", { class: "glass-effect" }, [
          vue.createElementVNode("image", {
            class: "prompt-logo",
            src: _imports_5
          }),
          vue.createElementVNode("text", { class: "prompt-text" }, "登录后体验完整功能"),
          vue.createElementVNode("button", {
            class: "prompt-login-btn",
            onClick: $setup.goToLogin
          }, "立即登录")
        ])
      ]))
    ]);
  }
  const PagesUserIndex = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$g], ["__scopeId", "data-v-79e6a490"], ["__file", "F:/new/success/uniappandroid/pages/user/index.vue"]]);
  const _sfc_main$f = {
    __name: "projects",
    setup(__props, { expose: __expose }) {
      __expose();
      const messageStore = useMessageStore();
      const projectStore = useProjectStore();
      const userStore = useUserStore$1();
      const loading = vue.ref(false);
      const activeTab = vue.ref("all");
      const projects = vue.ref([]);
      const projectBids = vue.ref({});
      const selectedBids = vue.ref({});
      const tabs = [
        { label: "全部", value: "all" },
        { label: "招标中", value: "bidding" },
        { label: "进行中", value: "in_progress" },
        { label: "已完成", value: "completed" }
      ];
      const filteredProjects = vue.computed(() => {
        if (activeTab.value === "all") {
          return projects.value;
        }
        return projects.value.filter((project) => project.status === activeTab.value);
      });
      const initData = () => {
        loadProjectBids(true);
      };
      vue.onMounted(() => {
        formatAppLog("log", "at pages/user/projects.vue:182", "这里是最先执行的");
        initData();
      });
      const loadProjectBids = async (refresh = false) => {
        var _a;
        try {
          loading.value = true;
          const bidsRes = await projectStore.getPublisherBids({ user_id: (_a = userStore.userInfo) == null ? void 0 : _a.id });
          formatAppLog("log", "at pages/user/projects.vue:192", "获取的当前用户项目投标列表", bidsRes);
          const tempProjectsMap = {};
          const tempBidsMap = {};
          const tempSelectedBids = {};
          if (bidsRes && bidsRes.list && Array.isArray(bidsRes.list)) {
            bidsRes.list.forEach((bidItem) => {
              const projectId = bidItem.project_id;
              const project = bidItem.project;
              if (project && project.id && !tempProjectsMap[project.id]) {
                tempProjectsMap[project.id] = project;
              }
              if (!tempBidsMap[projectId]) {
                tempBidsMap[projectId] = [];
              }
              tempBidsMap[projectId].push(bidItem);
              if (project && project.selected_bid_id) {
                tempSelectedBids[projectId] = project.selected_bid_id;
              }
            });
          }
          const uniqueProjectsArray = Object.values(tempProjectsMap);
          projects.value = uniqueProjectsArray;
          projectBids.value = tempBidsMap;
          selectedBids.value = tempSelectedBids;
          formatAppLog("log", "at pages/user/projects.vue:224", "已处理并加载项目和投标列表:", projects.value.length, Object.keys(projectBids.value).length);
          formatAppLog("log", "at pages/user/projects.vue:225", "返回的投标信息有哪些？", projectBids.value);
        } catch (error) {
          formatAppLog("error", "at pages/user/projects.vue:228", "加载投标列表失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const switchTab = (tab) => {
        if (activeTab.value === tab)
          return;
        activeTab.value = tab;
        loadProjectBids(true);
      };
      const handleContact = async (bidderId) => {
        if (!userStore.hasLogin) {
          uni.navigateTo({ url: "/pages/login/index" });
          return;
        }
        if (!bidderId) {
          uni.showToast({ title: "无法联系投标人", icon: "none" });
          return;
        }
        const bidderInfo = findBidderInfo(bidderId);
        if (!bidderInfo) {
          uni.showToast({ title: "找不到投标人信息", icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: "正在创建会话..." });
          const chatData = await messageStore.createChat(bidderId);
          uni.hideLoading();
          if (chatData && chatData.id) {
            uni.showToast({ title: "已创建会话", icon: "success" });
            uni.navigateTo({
              url: `/pages/messages/chat?id=${chatData.id}&chatId=${chatData.id}&targetUserId=${bidderId}&targetUserName=${encodeURIComponent(bidderInfo.username || "投标人")}`
            });
          } else {
            throw new Error("创建会话失败");
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/user/projects.vue:281", "创建会话失败:", error);
          const errorMsg = error.message || "操作失败";
          uni.showToast({ title: errorMsg, icon: "none" });
        }
      };
      const findBidderInfo = (bidderId) => {
        for (const projectId in projectBids.value) {
          const bids = projectBids.value[projectId];
          if (bids && Array.isArray(bids)) {
            for (const bid of bids) {
              if (bid.bidder && bid.bidder.id === bidderId) {
                return bid.bidder;
              }
            }
          }
        }
        return null;
      };
      const goToProjectDetail = (projectId) => {
        if (projectId) {
          uni.navigateTo({
            url: `/pages/projects/detail?id=${projectId}`
          });
        }
      };
      const handleSelectBid = async (bidId) => {
        var _a, _b;
        formatAppLog("log", "at pages/user/projects.vue:313", "投标id是空的？", bidId);
        const res = await uni.showModal({
          title: "确认选择",
          content: "确定选择该投标方案吗？此操作不可撤销。"
        });
        if (res.confirm) {
          try {
            uni.showLoading({ title: "处理中" });
            const result = await projectStore.selectBid(bidId);
            uni.hideLoading();
            uni.showToast({ title: "选择成功", icon: "success" });
            formatAppLog("log", "at pages/user/projects.vue:326", "是不是就没有结果返回过来了？", result);
            if (result && result.project_id) {
              selectedBids.value[result.project_id] = bidId;
              const projectIndex = projects.value.findIndex((p) => p.id === result.project_id);
              if (projectIndex !== -1) {
                projects.value[projectIndex].status = "in_progress";
                projects.value[projectIndex].selected_bid_id = bidId;
              }
              if (activeTab.value === "bidding") {
              }
            }
          } catch (error) {
            uni.hideLoading();
            formatAppLog("error", "at pages/user/projects.vue:352", "选择投标失败:", error);
            const errorMsg = ((_b = (_a = error == null ? void 0 : error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || (error == null ? void 0 : error.message) || "操作失败";
            uni.showToast({ title: errorMsg, icon: "none" });
          }
        }
      };
      const isBidSelected = (projectId, bidId) => {
        return selectedBids.value[projectId] === bidId;
      };
      const hasSelectedBid = (projectId) => {
        return !!selectedBids.value[projectId];
      };
      const cancelProject = async (projectId) => {
        if (!projectId) {
          uni.showToast({ title: "无效的项目ID", icon: "none" });
          return;
        }
        const res = await uni.showModal({
          title: "确认取消",
          content: "确定要取消这个项目吗？此操作不可撤销。"
        });
        if (res.confirm) {
          try {
            uni.showLoading({
              title: "正在取消..."
            });
            await projectStore.cancelProject(projectId);
            uni.hideLoading();
            uni.showToast({
              title: "项目已取消",
              icon: "success"
            });
            loadProjectBids(true);
          } catch (error) {
            uni.hideLoading();
            uni.showToast({
              title: "取消失败",
              icon: "none"
            });
            formatAppLog("error", "at pages/user/projects.vue:398", "取消项目失败:", error);
          }
        }
      };
      const goBack = () => {
        uni.navigateBack();
      };
      const parseAttachments = (attachmentsStr) => {
        if (!attachmentsStr)
          return [];
        return attachmentsStr.split(",").map((url) => url.trim()).filter((url) => url);
      };
      const isImageUrl = (url) => {
        const imgExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
        const lowerUrl = url.toLowerCase();
        return imgExts.some((ext) => lowerUrl.endsWith(ext));
      };
      const isVideoUrl = (url) => {
        const videoExts = [".mp4", ".mov", ".avi", ".mkv", ".wmv", ".flv", ".webm"];
        const lowerUrl = url.toLowerCase();
        return videoExts.some((ext) => lowerUrl.endsWith(ext));
      };
      const previewImage = (url) => {
        uni.previewImage({
          urls: [url]
        });
      };
      const __returned__ = { messageStore, projectStore, userStore, loading, activeTab, projects, projectBids, selectedBids, tabs, filteredProjects, initData, loadProjectBids, switchTab, handleContact, findBidderInfo, goToProjectDetail, handleSelectBid, isBidSelected, hasSelectedBid, cancelProject, goBack, parseAttachments, isImageUrl, isVideoUrl, previewImage, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get useProjectStore() {
        return useProjectStore;
      }, get useUserStore() {
        return useUserStore$1;
      }, get useMessageStore() {
        return useMessageStore;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "user-projects-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-icon",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            class: "back-icon-image",
            src: _imports_0$7,
            mode: "aspectFit"
          })
        ]),
        vue.createElementVNode("view", { class: "header-title" }, "我的项目")
      ]),
      vue.createElementVNode("view", { class: "tab-header glass-effect" }, [
        (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.tabs, (tab) => {
            return vue.createElementVNode("view", {
              key: tab.value,
              class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === tab.value }]),
              onClick: ($event) => $setup.switchTab(tab.value)
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(tab.label),
                1
                /* TEXT */
              )
            ], 10, ["onClick"]);
          }),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", { class: "project-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.filteredProjects, (project) => {
            var _a;
            return vue.openBlock(), vue.createElementBlock("view", {
              key: project.id,
              class: "project-item"
            }, [
              vue.createElementVNode("view", { class: "card-glass" }, [
                vue.createElementVNode(
                  "view",
                  { class: "project-title" },
                  vue.toDisplayString(project.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "info-grid" }, [
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "info-label" }, "预算"),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value price" },
                      "¥" + vue.toDisplayString(project.budget_min),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "info-label" }, "交付周期"),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value" },
                      vue.toDisplayString(project.delivery_time) + " 天",
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "info-label" }, "投标数"),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value" },
                      vue.toDisplayString(project.bid_count),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "bid-status-section glass-effect" }, [
                vue.createElementVNode("view", { class: "bid-status-header" }, [
                  vue.createElementVNode("view", { class: "bid-status-title" }, "投标情况"),
                  vue.createElementVNode(
                    "view",
                    { class: "bid-status-count" },
                    vue.toDisplayString(((_a = $setup.projectBids[project.id]) == null ? void 0 : _a.length) || 0),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "bids-container" }, [
                  $setup.projectBids[project.id] && $setup.projectBids[project.id].length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "bids-list"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.projectBids[project.id], (bid) => {
                        var _a2, _b;
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: bid.id,
                          class: "bid-item glass-effect-subtle"
                        }, [
                          vue.createElementVNode("view", { class: "bid-info" }, [
                            vue.createElementVNode("image", {
                              class: "bidder-avatar",
                              src: ((_a2 = bid.bidder) == null ? void 0 : _a2.avatar) || "/static/images/default-avatar.png",
                              mode: "aspectFill"
                            }, null, 8, ["src"]),
                            vue.createElementVNode(
                              "text",
                              { class: "bidder-name" },
                              vue.toDisplayString(((_b = bid.bidder) == null ? void 0 : _b.username) || "未知用户"),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "bid-price" },
                              "¥" + vue.toDisplayString(bid.price),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "bid-delivery" },
                              "交付周期: " + vue.toDisplayString(bid.delivery_days) + " 天",
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "bid-description" },
                              vue.toDisplayString(bid.description),
                              1
                              /* TEXT */
                            ),
                            bid.attachments ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 0,
                              class: "bid-attachments"
                            }, [
                              (vue.openBlock(true), vue.createElementBlock(
                                vue.Fragment,
                                null,
                                vue.renderList($setup.parseAttachments(bid.attachments), (url, index) => {
                                  return vue.openBlock(), vue.createElementBlock("view", {
                                    key: index,
                                    class: "attachment-item"
                                  }, [
                                    $setup.isImageUrl(url) ? (vue.openBlock(), vue.createElementBlock("image", {
                                      key: 0,
                                      src: url,
                                      class: "attachment-media",
                                      mode: "widthFix",
                                      onClick: ($event) => $setup.previewImage(url)
                                    }, null, 8, ["src", "onClick"])) : $setup.isVideoUrl(url) ? (vue.openBlock(), vue.createElementBlock("video", {
                                      key: 1,
                                      src: url,
                                      class: "attachment-media",
                                      controls: "",
                                      playsinline: ""
                                    }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
                                  ]);
                                }),
                                128
                                /* KEYED_FRAGMENT */
                              ))
                            ])) : vue.createCommentVNode("v-if", true)
                          ]),
                          vue.createElementVNode("view", { class: "bid-actions" }, [
                            vue.createElementVNode("button", {
                              class: "action-btn contact-bidder-btn",
                              onClick: ($event) => {
                                var _a3;
                                return $setup.handleContact((_a3 = bid.bidder) == null ? void 0 : _a3.id);
                              }
                            }, "联系投标人", 8, ["onClick"]),
                            vue.createElementVNode("button", {
                              class: vue.normalizeClass(["action-btn select-bid-btn", { "btn-disabled": $setup.isBidSelected(project.id, bid.id) || $setup.hasSelectedBid(project.id) }]),
                              onClick: ($event) => $setup.handleSelectBid(bid.id),
                              disabled: $setup.isBidSelected(project.id, bid.id) || $setup.hasSelectedBid(project.id)
                            }, [
                              $setup.isBidSelected(project.id, bid.id) ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "已中标")) : $setup.hasSelectedBid(project.id) ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "项目已选标")) : (vue.openBlock(), vue.createElementBlock("text", { key: 2 }, "确认中标"))
                            ], 10, ["onClick", "disabled"])
                          ]),
                          $setup.isBidSelected(project.id, bid.id) ? (vue.openBlock(), vue.createElementBlock("view", {
                            key: 0,
                            class: "selected-bid-indicator"
                          }, [
                            vue.createElementVNode("text", { class: "selected-text" }, "🏆 当前中标方案")
                          ])) : vue.createCommentVNode("v-if", true)
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "empty-bids"
                  }, [
                    vue.createElementVNode("text", null, "暂无投标")
                  ]))
                ])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-state"
        }, [
          vue.createElementVNode("text", null, "加载中...")
        ])) : !$setup.loading && $setup.filteredProjects.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-state glass-effect"
        }, [
          vue.createElementVNode("image", {
            class: "empty-icon",
            src: _imports_1$4,
            mode: "aspectFit"
          }),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无相关项目")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesUserProjects = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$f], ["__scopeId", "data-v-d7d59219"], ["__file", "F:/new/success/uniappandroid/pages/user/projects.vue"]]);
  const _imports_0 = "/static/images/empty-notification.png";
  const _sfc_main$e = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const messageStore = useMessageStore();
      const userStore = useUserStore$1();
      const projectStore = useProjectStore();
      const loading = vue.ref(false);
      const hasUnreadNotifications = vue.computed(() => {
        return messageStore.notifications.some((notification) => !notification.is_read);
      });
      vue.onMounted(async () => {
        formatAppLog("log", "at pages/notifications/index.vue:67", "通知页面加载，登录状态:", userStore.hasLogin, "用户信息:", userStore.userInfo);
        formatAppLog("log", "at pages/notifications/index.vue:68", "当前token:", userStore.token);
        if (userStore.hasLogin) {
          await loadNotifications();
        } else {
          formatAppLog("log", "at pages/notifications/index.vue:73", "用户未登录，但不立即跳转");
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
        }
      });
      onPullDownRefresh(async () => {
        await loadNotifications();
        uni.stopPullDownRefresh();
      });
      const loadNotifications = async () => {
        try {
          loading.value = true;
          formatAppLog("log", "at pages/notifications/index.vue:91", "开始加载通知列表，当前token:", userStore.token);
          if (!userStore.hasLogin || !userStore.token) {
            formatAppLog("log", "at pages/notifications/index.vue:95", "用户未登录或token不存在，不加载通知");
            return;
          }
          await messageStore.getNotifications();
          formatAppLog("log", "at pages/notifications/index.vue:100", "通知列表加载成功:", messageStore.notifications);
        } catch (error) {
          formatAppLog("error", "at pages/notifications/index.vue:102", "加载通知失败:", error);
          if (error.message && error.message.includes("登录已过期")) {
            formatAppLog("log", "at pages/notifications/index.vue:106", "登录已过期，尝试刷新用户信息");
            try {
              await userStore.getUserInfo();
              formatAppLog("log", "at pages/notifications/index.vue:111", "用户信息刷新成功，重新加载通知");
              await messageStore.getNotifications();
            } catch (refreshError) {
              formatAppLog("error", "at pages/notifications/index.vue:114", "刷新用户信息失败:", refreshError);
              uni.showToast({
                title: "登录已过期，请重新登录",
                icon: "none"
              });
              setTimeout(() => {
                uni.navigateTo({
                  url: "/pages/login/index"
                });
              }, 1500);
            }
          } else {
            uni.showToast({
              title: "加载失败",
              icon: "none"
            });
          }
        } finally {
          loading.value = false;
        }
      };
      const markAllAsRead = async () => {
        try {
          loading.value = true;
          await markAllNotificationsAsRead();
          await messageStore.getNotifications();
          uni.showToast({
            title: "已全部标为已读",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/notifications/index.vue:154", "标记全部已读失败:", error);
          uni.showToast({
            title: "操作失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const readNotification = (notification) => {
        messageStore.readNotification(notification.id);
        formatAppLog("log", "at pages/notifications/index.vue:169", "点击通知:", notification);
        switch (Number(notification.type)) {
          case 1:
            if (notification.related_id) {
              uni.navigateTo({
                url: `/pages/projects/detail?id=${notification.related_id}`
              });
            }
            break;
          case 2:
            if (notification.related_id) {
              if (notification.content && notification.content.includes("您的投标")) {
                uni.navigateTo({
                  url: `/pages/projects/detail?id=${notification.related_id}`
                });
              } else {
                uni.navigateTo({
                  url: `/pages/projects/detail?id=${notification.related_id}`
                });
              }
            }
            break;
          case 3:
            if (notification.related_id) {
              uni.navigateTo({
                url: `/pages/orders/detail?id=${notification.related_id}`
              });
            }
            break;
        }
      };
      const getNotificationIcon = (type) => {
        switch (Number(type)) {
          case 0:
            return "info";
          case 1:
            return "folder";
          case 2:
            return "trophy";
          case 3:
            return "list";
          default:
            return "notification";
        }
      };
      const getNotificationClass = (type) => {
        switch (Number(type)) {
          case 0:
            return "icon-system";
          case 1:
            return "icon-project";
          case 2:
            return "icon-bid";
          case 3:
            return "icon-order";
          default:
            return "icon-default";
        }
      };
      const formatTime = (timeString) => {
        const now2 = /* @__PURE__ */ new Date();
        const time = new Date(timeString);
        const diff = now2.getTime() - time.getTime();
        if (diff < 24 * 60 * 60 * 1e3 && now2.getDate() === time.getDate()) {
          return `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
        }
        if (diff < 48 * 60 * 60 * 1e3 && now2.getDate() - time.getDate() === 1) {
          return "昨天";
        }
        if (diff < 7 * 24 * 60 * 60 * 1e3) {
          const days = ["日", "一", "二", "三", "四", "五", "六"];
          return `周${days[time.getDay()]}`;
        }
        return `${time.getMonth() + 1}月${time.getDate()}日`;
      };
      const __returned__ = { messageStore, userStore, projectStore, loading, hasUnreadNotifications, loadNotifications, markAllAsRead, readNotification, getNotificationIcon, getNotificationClass, formatTime, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get useMessageStore() {
        return useMessageStore;
      }, get useUserStore() {
        return useUserStore$1;
      }, get useProjectStore() {
        return useProjectStore;
      }, get markAllNotificationsAsRead() {
        return markAllNotificationsAsRead;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "notifications-page" }, [
      $setup.hasUnreadNotifications ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "mark-all-read-container"
      }, [
        vue.createElementVNode("view", {
          class: "mark-all-read-btn",
          onClick: $setup.markAllAsRead
        }, [
          vue.createElementVNode("text", null, "全部标为已读")
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "notification-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.messageStore.notifications, (notification) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: notification.id,
              class: vue.normalizeClass(["notification-item", { unread: !notification.is_read }]),
              onClick: ($event) => $setup.readNotification(notification)
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["notification-icon", $setup.getNotificationClass(notification.type)])
                },
                [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($setup.getNotificationIcon(notification.type)),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode("view", { class: "notification-content" }, [
                vue.createElementVNode("view", { class: "notification-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "title" },
                    vue.toDisplayString(notification.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "time" },
                    vue.toDisplayString($setup.formatTime(notification.created_at)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "content" },
                  vue.toDisplayString(notification.content),
                  1
                  /* TEXT */
                )
              ])
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        !$setup.loading && $setup.messageStore.notifications.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("image", {
            src: _imports_0,
            class: "empty-icon"
          }),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无通知")
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loading"
      }, [
        vue.createElementVNode("text", null, "加载中...")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesNotificationsIndex = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$e], ["__scopeId", "data-v-4e9da382"], ["__file", "F:/new/success/uniappandroid/pages/notifications/index.vue"]]);
  const _sfc_main$d = {
    __name: "verify",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const formData = vue.ref({
        realName: "",
        idCard: "",
        phone: "",
        idCardFront: "",
        idCardBack: "",
        idCardHolding: ""
      });
      const privacyAgreed = vue.ref(false);
      const isVerified = vue.computed(() => {
        var _a;
        return ((_a = userStore.userInfo) == null ? void 0 : _a.is_verified) || false;
      });
      const canSubmit = vue.computed(() => {
        return formData.value.realName && formData.value.idCard && formData.value.phone && formData.value.idCardFront && formData.value.idCardBack && formData.value.idCardHolding && privacyAgreed.value;
      });
      vue.onMounted(async () => {
        if (userStore.token) {
          await userStore.getUserInfo();
          if (isVerified.value) {
            try {
              const verifyInfo = await userStore.getVerificationInfo();
              formData.value = {
                realName: verifyInfo.real_name || "",
                idCard: verifyInfo.id_card || "",
                phone: verifyInfo.phone || "",
                idCardFront: verifyInfo.id_card_front || "",
                idCardBack: verifyInfo.id_card_back || "",
                idCardHolding: verifyInfo.id_card_holding || ""
              };
            } catch (error) {
              formatAppLog("error", "at pages/user/verify.vue:165", "获取认证信息失败:", error);
            }
          }
        }
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const uploadImage2 = (field) => {
        if (isVerified.value)
          return;
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            uni.showLoading({ title: "上传中..." });
            setTimeout(() => {
              formData.value[field] = res.tempFilePaths[0];
              uni.hideLoading();
            }, 1e3);
          }
        });
      };
      const showPrivacyPolicy = () => {
        uni.navigateTo({
          url: "/pages/common/privacy-policy?type=verification"
        });
      };
      const submitVerification = async () => {
        if (!canSubmit.value)
          return;
        try {
          uni.showLoading({ title: "提交中..." });
          await new Promise((resolve) => setTimeout(resolve, 2e3));
          uni.hideLoading();
          uni.showToast({
            title: "提交成功，等待审核",
            icon: "success"
          });
          await userStore.getUserInfo();
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          uni.hideLoading();
          uni.showToast({
            title: "提交失败，请重试",
            icon: "none"
          });
          formatAppLog("error", "at pages/user/verify.vue:267", "提交认证失败:", error);
        }
      };
      const __returned__ = { userStore, formData, privacyAgreed, isVerified, canSubmit, goBack, uploadImage: uploadImage2, showPrivacyPolicy, submitVerification, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get useUserStore() {
        return useUserStore$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "verify-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("button", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$7,
            class: "back-icon"
          })
        ]),
        vue.createElementVNode("view", { class: "page-title" }, "实名认证"),
        vue.createElementVNode("view", { class: "header-right" })
      ]),
      vue.createElementVNode("view", { class: "content-container" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["status-card", { "verified": $setup.isVerified }])
          },
          [
            vue.createElementVNode("view", { class: "status-icon" }, [
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["iconfont", $setup.isVerified ? "icon-check-circle" : "icon-info-circle"])
                },
                null,
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "status-text" }, [
              vue.createElementVNode(
                "text",
                { class: "status-title" },
                vue.toDisplayString($setup.isVerified ? "已完成实名认证" : "未完成实名认证"),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "status-desc" },
                vue.toDisplayString($setup.isVerified ? "您已通过实名认证，可以使用平台的全部功能" : "完成实名认证后可以使用平台的全部功能"),
                1
                /* TEXT */
              )
            ])
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode("view", { class: "form-container" }, [
          vue.createElementVNode("view", { class: "form-title" }, "个人信息"),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("label", { class: "form-label" }, "真实姓名"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "form-input",
              type: "text",
              placeholder: "请输入您的真实姓名",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.formData.realName = $event),
              disabled: $setup.isVerified
            }, null, 8, ["disabled"]), [
              [vue.vModelText, $setup.formData.realName]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("label", { class: "form-label" }, "身份证号"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "form-input",
              type: "idcard",
              placeholder: "请输入您的身份证号码",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.formData.idCard = $event),
              disabled: $setup.isVerified
            }, null, 8, ["disabled"]), [
              [vue.vModelText, $setup.formData.idCard]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-group" }, [
            vue.createElementVNode("label", { class: "form-label" }, "手机号码"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "form-input",
              type: "number",
              placeholder: "请输入您的手机号码",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.formData.phone = $event),
              disabled: $setup.isVerified
            }, null, 8, ["disabled"]), [
              [vue.vModelText, $setup.formData.phone]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-title" }, "证件上传"),
          vue.createElementVNode("view", { class: "upload-section" }, [
            vue.createElementVNode("view", { class: "upload-item" }, [
              vue.createElementVNode("view", { class: "upload-label" }, "身份证正面"),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["upload-area", { "disabled": $setup.isVerified }]),
                  onClick: _cache[3] || (_cache[3] = ($event) => $setup.uploadImage("idCardFront"))
                },
                [
                  $setup.formData.idCardFront ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    src: $setup.formData.idCardFront,
                    class: "preview-image"
                  }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "upload-placeholder"
                  }, [
                    vue.createElementVNode("text", { class: "iconfont icon-camera" }),
                    vue.createElementVNode("text", { class: "upload-text" }, "点击上传")
                  ]))
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "upload-item" }, [
              vue.createElementVNode("view", { class: "upload-label" }, "身份证反面"),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["upload-area", { "disabled": $setup.isVerified }]),
                  onClick: _cache[4] || (_cache[4] = ($event) => $setup.uploadImage("idCardBack"))
                },
                [
                  $setup.formData.idCardBack ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    src: $setup.formData.idCardBack,
                    class: "preview-image"
                  }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "upload-placeholder"
                  }, [
                    vue.createElementVNode("text", { class: "iconfont icon-camera" }),
                    vue.createElementVNode("text", { class: "upload-text" }, "点击上传")
                  ]))
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "upload-item" }, [
              vue.createElementVNode("view", { class: "upload-label" }, "手持身份证照片"),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["upload-area", { "disabled": $setup.isVerified }]),
                  onClick: _cache[5] || (_cache[5] = ($event) => $setup.uploadImage("idCardHolding"))
                },
                [
                  $setup.formData.idCardHolding ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    src: $setup.formData.idCardHolding,
                    class: "preview-image"
                  }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "upload-placeholder"
                  }, [
                    vue.createElementVNode("text", { class: "iconfont icon-camera" }),
                    vue.createElementVNode("text", { class: "upload-text" }, "点击上传")
                  ]))
                ],
                2
                /* CLASS */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "privacy-notice" }, [
            vue.createElementVNode("checkbox", {
              checked: $setup.privacyAgreed,
              onClick: _cache[6] || (_cache[6] = ($event) => $setup.privacyAgreed = !$setup.privacyAgreed),
              disabled: $setup.isVerified
            }, null, 8, ["checked", "disabled"]),
            vue.createElementVNode("text", { class: "privacy-text" }, [
              vue.createTextVNode("我已阅读并同意"),
              vue.createElementVNode("text", {
                class: "privacy-link",
                onClick: $setup.showPrivacyPolicy
              }, "《实名认证服务协议》")
            ])
          ]),
          vue.createElementVNode("button", {
            class: vue.normalizeClass(["submit-btn", { "disabled": $setup.isVerified || !$setup.canSubmit }]),
            onClick: $setup.submitVerification,
            disabled: $setup.isVerified || !$setup.canSubmit
          }, vue.toDisplayString($setup.isVerified ? "已认证" : "提交认证"), 11, ["disabled"])
        ])
      ])
    ]);
  }
  const PagesUserVerify = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$d], ["__scopeId", "data-v-71a5fc89"], ["__file", "F:/new/success/uniappandroid/pages/user/verify.vue"]]);
  const _sfc_main$c = {
    __name: "settings",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const user = vue.computed(() => userStore.userInfo);
      const notificationSettings = vue.ref({
        message: true,
        email: false,
        sms: true
      });
      const privacySettings = vue.ref({
        location: false
      });
      const privacyOptions = ["所有人可见", "仅好友可见", "仅自己可见"];
      const privacyIndex = vue.ref(1);
      const cacheSize = vue.ref("2.5MB");
      vue.onMounted(async () => {
        if (userStore.token) {
          await userStore.getUserInfo();
          try {
            setTimeout(() => {
              notificationSettings.value = {
                message: true,
                email: false,
                sms: true
              };
              privacySettings.value = {
                location: false
              };
              privacyIndex.value = 1;
            }, 500);
          } catch (error) {
            formatAppLog("error", "at pages/user/settings.vue:194", "获取用户设置失败:", error);
          }
          try {
            setTimeout(() => {
              cacheSize.value = "2.5MB";
            }, 300);
          } catch (error) {
            formatAppLog("error", "at pages/user/settings.vue:204", "获取缓存大小失败:", error);
          }
        }
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const goToProfile = () => {
        uni.navigateTo({ url: "/pages/user/profile" });
      };
      const goToSecurity = () => {
        uni.navigateTo({ url: "/pages/user/security" });
      };
      const goToVerify = () => {
        uni.navigateTo({ url: "/pages/user/verify" });
      };
      const goToAbout = () => {
        uni.navigateTo({ url: "/pages/common/about" });
      };
      const goToFeedback = () => {
        uni.navigateTo({ url: "/pages/common/feedback" });
      };
      const toggleSetting = (key) => {
        notificationSettings.value[key] = !notificationSettings.value[key];
        saveSettings();
      };
      const togglePrivacy = (key) => {
        privacySettings.value[key] = !privacySettings.value[key];
        saveSettings();
      };
      const handlePrivacyChange = (e) => {
        privacyIndex.value = e.detail.value;
        saveSettings();
      };
      const saveSettings = () => {
        uni.showToast({
          title: "设置已保存",
          icon: "success",
          duration: 1500
        });
      };
      const clearCache = () => {
        uni.showModal({
          title: "清除缓存",
          content: "确定要清除所有缓存吗？",
          success: (res) => {
            if (res.confirm) {
              uni.showLoading({ title: "清除中..." });
              setTimeout(() => {
                uni.hideLoading();
                uni.showToast({
                  title: "缓存已清除",
                  icon: "success"
                });
                cacheSize.value = "0KB";
              }, 1e3);
            }
          }
        });
      };
      const handleLogout = async () => {
        const res = await uni.showModal({
          title: "退出登录",
          content: "确定要退出登录吗？"
        });
        if (res.confirm) {
          await userStore.logout();
          uni.switchTab({ url: "/pages/home/index" });
        }
      };
      const __returned__ = { userStore, user, notificationSettings, privacySettings, privacyOptions, privacyIndex, cacheSize, goBack, goToProfile, goToSecurity, goToVerify, goToAbout, goToFeedback, toggleSetting, togglePrivacy, handlePrivacyChange, saveSettings, clearCache, handleLogout, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get useUserStore() {
        return useUserStore$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "settings-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("button", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$7,
            class: "back-icon"
          })
        ]),
        vue.createElementVNode("view", { class: "page-title" }, "设置"),
        vue.createElementVNode("view", { class: "header-right" })
      ]),
      vue.createElementVNode("view", { class: "content-container" }, [
        vue.createElementVNode("view", { class: "settings-section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "账号设置"),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: $setup.goToProfile
          }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-user" }),
              vue.createElementVNode("text", { class: "item-text" }, "个人资料")
            ]),
            vue.createElementVNode("text", { class: "item-arrow" }, "›")
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: $setup.goToSecurity
          }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-lock" }),
              vue.createElementVNode("text", { class: "item-text" }, "账号安全")
            ]),
            vue.createElementVNode("text", { class: "item-arrow" }, "›")
          ]),
          !((_a = $setup.user) == null ? void 0 : _a.is_verified) ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "settings-item",
            onClick: $setup.goToVerify
          }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-shield" }),
              vue.createElementVNode("text", { class: "item-text" }, "实名认证")
            ]),
            vue.createElementVNode("text", { class: "item-arrow" }, "›")
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "settings-section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "通知设置"),
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-bell" }),
              vue.createElementVNode("text", { class: "item-text" }, "消息通知")
            ]),
            vue.createElementVNode("switch", {
              checked: $setup.notificationSettings.message,
              onChange: _cache[0] || (_cache[0] = ($event) => $setup.toggleSetting("message")),
              color: "#4dabf7"
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-mail" }),
              vue.createElementVNode("text", { class: "item-text" }, "邮件通知")
            ]),
            vue.createElementVNode("switch", {
              checked: $setup.notificationSettings.email,
              onChange: _cache[1] || (_cache[1] = ($event) => $setup.toggleSetting("email")),
              color: "#4dabf7"
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-mobile" }),
              vue.createElementVNode("text", { class: "item-text" }, "短信通知")
            ]),
            vue.createElementVNode("switch", {
              checked: $setup.notificationSettings.sms,
              onChange: _cache[2] || (_cache[2] = ($event) => $setup.toggleSetting("sms")),
              color: "#4dabf7"
            }, null, 40, ["checked"])
          ])
        ]),
        vue.createElementVNode("view", { class: "settings-section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "隐私设置"),
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-eye" }),
              vue.createElementVNode("text", { class: "item-text" }, "个人资料可见性")
            ]),
            vue.createElementVNode("picker", {
              onChange: $setup.handlePrivacyChange,
              value: $setup.privacyIndex,
              range: $setup.privacyOptions,
              class: "privacy-picker"
            }, [
              vue.createElementVNode("view", { class: "picker-value" }, [
                vue.createTextVNode(
                  vue.toDisplayString($setup.privacyOptions[$setup.privacyIndex]) + " ",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "item-arrow" }, "›")
              ])
            ], 40, ["value"])
          ]),
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-location" }),
              vue.createElementVNode("text", { class: "item-text" }, "位置信息")
            ]),
            vue.createElementVNode("switch", {
              checked: $setup.privacySettings.location,
              onChange: _cache[3] || (_cache[3] = ($event) => $setup.togglePrivacy("location")),
              color: "#4dabf7"
            }, null, 40, ["checked"])
          ])
        ]),
        vue.createElementVNode("view", { class: "settings-section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "其他设置"),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: $setup.clearCache
          }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-delete" }),
              vue.createElementVNode("text", { class: "item-text" }, "清除缓存")
            ]),
            vue.createElementVNode(
              "text",
              { class: "cache-size" },
              vue.toDisplayString($setup.cacheSize),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: $setup.goToAbout
          }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-info-circle" }),
              vue.createElementVNode("text", { class: "item-text" }, "关于我们")
            ]),
            vue.createElementVNode("text", { class: "item-arrow" }, "›")
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: $setup.goToFeedback
          }, [
            vue.createElementVNode("view", { class: "item-left" }, [
              vue.createElementVNode("text", { class: "iconfont icon-message" }),
              vue.createElementVNode("text", { class: "item-text" }, "意见反馈")
            ]),
            vue.createElementVNode("text", { class: "item-arrow" }, "›")
          ])
        ]),
        vue.createElementVNode("button", {
          class: "logout-btn",
          onClick: $setup.handleLogout
        }, "退出登录"),
        vue.createElementVNode("view", { class: "version-info" }, [
          vue.createElementVNode("text", null, "当前版本: v1.0.0")
        ])
      ])
    ]);
  }
  const PagesUserSettings = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$c], ["__scopeId", "data-v-ce914230"], ["__file", "F:/new/success/uniappandroid/pages/user/settings.vue"]]);
  const _sfc_main$b = {
    __name: "profile",
    setup(__props, { expose: __expose }) {
      __expose();
      const userId = vue.ref("");
      const userInfo = vue.ref({});
      const userProjects = vue.ref([]);
      const fetchUserInfo = async () => {
        try {
          uni.showLoading({ title: "加载中..." });
          const response = await get(`/users/${userId.value}`);
          userInfo.value = response;
          uni.hideLoading();
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: "获取用户信息失败", icon: "none" });
          formatAppLog("error", "at pages/user/profile.vue:105", "获取用户信息失败:", error);
        }
      };
      const fetchUserProjects = async () => {
        try {
          const response = await get(`/projects/user/${userId.value}`);
          userProjects.value = response;
        } catch (error) {
          formatAppLog("error", "at pages/user/profile.vue:115", "获取用户项目失败:", error);
        }
      };
      onLoad((options) => {
        formatAppLog("log", "at pages/user/profile.vue:121", "传递的用户ID:", options);
        if (options && options.id) {
          userId.value = options.id;
          fetchUserInfo();
          fetchUserProjects();
        } else {
          uni.showToast({ title: "用户ID不存在", icon: "none" });
          setTimeout(() => {
            goBack();
          }, 1500);
        }
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const handleContact = () => {
        uni.navigateTo({
          url: `/pages/messages/chat?targetId=${userId.value}&username=${userInfo.value.username}`
        });
      };
      const goToProjectDetail = (projectId) => {
        uni.navigateTo({
          url: `/pages/projects/detail?id=${projectId}`
        });
      };
      const getStatusClass = (status) => {
        switch (status) {
          case "open":
            return "status-open";
          case "in_progress":
            return "status-progress";
          case "completed":
            return "status-completed";
          case "cancelled":
            return "status-cancelled";
          default:
            return "";
        }
      };
      const getStatusText = (status) => {
        switch (status) {
          case "open":
            return "招标中";
          case "in_progress":
            return "进行中";
          case "completed":
            return "已完成";
          case "cancelled":
            return "已取消";
          default:
            return "未知";
        }
      };
      const __returned__ = { userId, userInfo, userProjects, fetchUserInfo, fetchUserProjects, goBack, handleContact, goToProjectDetail, getStatusClass, getStatusText, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get get() {
        return get;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-container" }, [
      vue.createElementVNode("view", { class: "navbar" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            class: "back-icon",
            src: _imports_0$7
          })
        ]),
        vue.createElementVNode("text", { class: "page-title" }, "用户主页")
      ]),
      vue.createElementVNode("view", { class: "card-glass user-card" }, [
        vue.createElementVNode("view", { class: "user-header" }, [
          vue.createElementVNode("image", {
            class: "avatar",
            src: $setup.userInfo.avatar || "/static/icons/user.png"
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "user-info" }, [
            vue.createElementVNode(
              "text",
              { class: "username" },
              vue.toDisplayString($setup.userInfo.username),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "user-stats" }, [
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.userInfo.rating || 0),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "信誉分")
              ]),
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.userInfo.projectCount || 0),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "发布项目")
              ]),
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.userInfo.completedCount || 0),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "完成项目")
              ])
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "user-description" }, [
          vue.createElementVNode("text", { class: "description-title" }, "个人简介"),
          vue.createElementVNode(
            "text",
            { class: "description-content" },
            vue.toDisplayString($setup.userInfo.description || "这个人很懒，什么都没留下..."),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "action-buttons" }, [
          vue.createElementVNode("button", {
            class: "action-btn contact-btn",
            onClick: $setup.handleContact
          }, "联系TA")
        ])
      ]),
      vue.createElementVNode("view", { class: "card-glass verify-card" }, [
        vue.createElementVNode("view", { class: "card-title" }, "认证信息"),
        vue.createElementVNode("view", { class: "verify-items" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["verify-item", { "verified": $setup.userInfo.isRealNameVerified }])
            },
            [
              vue.createElementVNode("image", {
                class: "verify-icon",
                src: $setup.userInfo.isRealNameVerified ? "/static/icons/verified.png" : "/static/icons/unverified.png"
              }, null, 8, ["src"]),
              vue.createElementVNode("text", { class: "verify-text" }, "实名认证")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["verify-item", { "verified": $setup.userInfo.isPhoneVerified }])
            },
            [
              vue.createElementVNode("image", {
                class: "verify-icon",
                src: $setup.userInfo.isPhoneVerified ? "/static/icons/verified.png" : "/static/icons/unverified.png"
              }, null, 8, ["src"]),
              vue.createElementVNode("text", { class: "verify-text" }, "手机认证")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["verify-item", { "verified": $setup.userInfo.isEmailVerified }])
            },
            [
              vue.createElementVNode("image", {
                class: "verify-icon",
                src: $setup.userInfo.isEmailVerified ? "/static/icons/verified.png" : "/static/icons/unverified.png"
              }, null, 8, ["src"]),
              vue.createElementVNode("text", { class: "verify-text" }, "邮箱认证")
            ],
            2
            /* CLASS */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "card-glass projects-card" }, [
        vue.createElementVNode("view", { class: "card-title" }, "发布的项目"),
        $setup.userProjects.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "project-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.userProjects, (project, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "project-item",
                onClick: ($event) => $setup.goToProjectDetail(project.id)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "project-title" },
                  vue.toDisplayString(project.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "project-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "project-category" },
                    vue.toDisplayString(project.category),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "project-date" },
                    vue.toDisplayString(project.createdAt),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["project-status", $setup.getStatusClass(project.status)])
                  },
                  vue.toDisplayString($setup.getStatusText(project.status)),
                  3
                  /* TEXT, CLASS */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-projects"
        }, [
          vue.createElementVNode("text", null, "暂无发布的项目")
        ]))
      ])
    ]);
  }
  const PagesUserProfile = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$b], ["__file", "F:/new/success/uniappandroid/pages/user/profile.vue"]]);
  const _sfc_main$a = {
    __name: "myinformation",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const userInfo = vue.ref({});
      const formData = vue.ref({
        avatar: "",
        realName: "",
        companyName: ""
      });
      onLoad(() => {
        userInfo.value = userStore.userInfo || {};
        formData.value = {
          avatar: userInfo.value.avatar || "",
          realName: userInfo.value.real_name || "",
          companyName: userInfo.value.company_name || ""
        };
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const chooseAvatar = () => {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: async (res) => {
            try {
              uni.showLoading({ title: "上传中..." });
              const result = await uploadImage(res.tempFilePaths[0]);
              if (result && result.url) {
                formData.value.avatar = result.url;
                uni.hideLoading();
                uni.showToast({ title: "头像上传成功", icon: "success" });
              } else {
                throw new Error("上传失败");
              }
            } catch (error) {
              uni.hideLoading();
              formatAppLog("error", "at pages/user/myinformation.vue:118", "上传头像失败:", error);
              uni.showToast({ title: "上传失败", icon: "none" });
            }
          }
        });
      };
      const handleSubmit = async () => {
        try {
          if (!formData.value.realName) {
            uni.showToast({ title: "请输入真实姓名", icon: "none" });
            return;
          }
          uni.showLoading({ title: "保存中..." });
          const updateData = {
            avatar: formData.value.avatar,
            real_name: formData.value.realName,
            company_name: formData.value.companyName
          };
          await userStore.updateUserInfo(updateData);
          uni.hideLoading();
          uni.showToast({ title: "保存成功", icon: "success" });
          setTimeout(() => {
            goBack();
          }, 1500);
        } catch (error) {
          uni.hideLoading();
          const errorMsg = error.message || error.errMsg || "保存失败，请重试";
          uni.showToast({ title: errorMsg, icon: "none" });
        }
      };
      const __returned__ = { userStore, userInfo, formData, goBack, chooseAvatar, handleSubmit, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get useUserStore() {
        return useUserStore$1;
      }, get uploadImage() {
        return uploadImage;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "myinfo-container" }, [
      vue.createElementVNode("view", { class: "navbar" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            class: "back-icon",
            src: _imports_0$7
          })
        ]),
        vue.createElementVNode("text", { class: "page-title" }, "个人信息")
      ]),
      vue.createElementVNode("view", { class: "form-container" }, [
        vue.createElementVNode("view", { class: "avatar-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "头像"),
          vue.createElementVNode("view", { class: "avatar-upload" }, [
            vue.createElementVNode("image", {
              class: "avatar-preview",
              src: $setup.formData.avatar || "/static/icons/user.png",
              onClick: $setup.chooseAvatar
            }, null, 8, ["src"]),
            vue.createElementVNode("text", { class: "upload-hint" }, "点击更换头像")
          ])
        ]),
        vue.createElementVNode("view", { class: "info-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "基本信息"),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "真实姓名"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                type: "text",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.formData.realName = $event),
                placeholder: "请输入您的真实姓名"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.realName]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "公司名称"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                type: "text",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.formData.companyName = $event),
                placeholder: "请输入您的公司名称（选填）"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.formData.companyName]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item readonly" }, [
            vue.createElementVNode("text", { class: "form-label" }, "用户名"),
            vue.createElementVNode("input", {
              class: "form-input",
              type: "text",
              value: $setup.userInfo.username,
              disabled: ""
            }, null, 8, ["value"]),
            vue.createElementVNode("text", { class: "readonly-hint" }, "用户名不可修改")
          ]),
          $setup.userInfo.email ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "form-item readonly"
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "邮箱"),
            vue.createElementVNode("input", {
              class: "form-input",
              type: "text",
              value: $setup.userInfo.email,
              disabled: ""
            }, null, 8, ["value"]),
            vue.createElementVNode("text", { class: "readonly-hint" }, "邮箱不可修改")
          ])) : vue.createCommentVNode("v-if", true),
          $setup.userInfo.phone ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "form-item readonly"
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "手机号"),
            vue.createElementVNode("input", {
              class: "form-input",
              type: "text",
              value: $setup.userInfo.phone,
              disabled: ""
            }, null, 8, ["value"]),
            vue.createElementVNode("text", { class: "readonly-hint" }, "手机号不可修改")
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: $setup.handleSubmit
        }, "保存修改")
      ])
    ]);
  }
  const PagesUserMyinformation = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$a], ["__file", "F:/new/success/uniappandroid/pages/user/myinformation.vue"]]);
  function getUserSubscriptions() {
    return get("/notifications/subscriptions");
  }
  function updateUserSubscriptions(categoryIds) {
    return post("/notifications/subscriptions", { categoryIds });
  }
  function addSubscription(data) {
    return post("/notifications/subscriptions/add", data);
  }
  function removeSubscription(data) {
    return post("/notifications/subscriptions/remove", data);
  }
  const _sfc_main$9 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const keyword = vue.ref("");
      const handleSearch = () => {
        if (!keyword.value.trim()) {
          uni.showToast({
            title: "请输入搜索关键词",
            icon: "none"
          });
          return;
        }
        uni.navigateTo({
          url: `/pages/projects/list?keyword=${encodeURIComponent(keyword.value.trim())}`
        });
      };
      const currentTime = vue.ref("00:00");
      const updateTime = () => {
        const now2 = /* @__PURE__ */ new Date();
        const hours = now2.getHours().toString().padStart(2, "0");
        const minutes = now2.getMinutes().toString().padStart(2, "0");
        currentTime.value = `${hours}:${minutes}`;
      };
      const subscribedCategories = vue.ref([]);
      const categories = vue.ref([
        { id: 1, name: "工业标单", icon: "/static/icons/industry.jpg", subscribed: false },
        { id: 2, name: "餐饮美食", icon: "/static/icons/food.jpg", subscribed: false },
        { id: 3, name: "休闲娱乐", icon: "/static/icons/recreation.jpg", subscribed: false },
        { id: 4, name: "手机电脑", icon: "/static/icons/computer.png", subscribed: false },
        { id: 5, name: "家电需求", icon: "/static/icons/appliances.png", subscribed: false },
        { id: 6, name: "家居需求", icon: "/static/icons/fitting.png", subscribed: false },
        { id: 7, name: "汽车需求", icon: "/static/icons/car.jpg", subscribed: false },
        { id: 8, name: "房产需求", icon: "/static/icons/house.jpg", subscribed: false },
        { id: 9, name: "服装鞋帽", icon: "/static/icons/clothing.jpg", subscribed: false },
        { id: 10, name: "家装装修", icon: "/static/icons/decoration.jpg", subscribed: false },
        { id: 11, name: "生活服务", icon: "/static/icons/Live.png", subscribed: false },
        { id: 12, name: "二手物品", icon: "/static/icons/secondhand.png", subscribed: false },
        { id: 13, name: "人力服务", icon: "/static/icons/hr.png", subscribed: false },
        { id: 14, name: "医疗就医", icon: "/static/icons/Health.jpg", subscribed: false },
        { id: 15, name: "艺术奢饰", icon: "/static/icons/zuan.png", subscribed: false },
        { id: 16, name: "交友相亲", icon: "/static/icons/love.jpg", subscribed: false }
      ]);
      const fetchUserSubscriptions = async () => {
        if (!userStore.hasLogin)
          return;
        try {
          const response = await getUserSubscriptions();
          subscribedCategories.value = response || [];
          categories.value.forEach((category) => {
            category.subscribed = subscribedCategories.value.includes(category.id);
          });
        } catch (error) {
          formatAppLog("error", "at pages/bids/index.vue:145", "获取用户订阅失败:", error);
        }
      };
      const unreadNotifications = vue.ref(0);
      let notificationTimer = null;
      let timeUpdateTimer = null;
      const getUnreadNotifications = async () => {
        if (!userStore.hasLogin)
          return;
        try {
          const response = await getUnreadNotificationCount();
          let count = 0;
          if (response && response.code === 0 && response.data) {
            count = response.data.count || 0;
          } else if (typeof response === "number") {
            count = response;
          } else if (response && typeof response.count === "number") {
            count = response.count;
          }
          if (count > unreadNotifications.value && unreadNotifications.value !== 0) {
            playNotificationSound2();
            vibrateDevice();
          }
          unreadNotifications.value = count;
        } catch (error) {
          formatAppLog("error", "at pages/bids/index.vue:179", "获取未读通知数量失败:", error);
        }
      };
      const playNotificationSound2 = () => {
        const innerAudioContext = uni.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        innerAudioContext.src = "/static/sounds/notification.mp3";
        innerAudioContext.onError((res) => {
          formatAppLog("error", "at pages/bids/index.vue:190", "播放通知提示音失败:", res);
        });
      };
      const vibrateDevice = () => {
        try {
          if (typeof uni.vibrate === "function") {
            uni.vibrate({
              success: function() {
                formatAppLog("log", "at pages/bids/index.vue:201", "震动成功");
              },
              fail: function(err) {
                formatAppLog("log", "at pages/bids/index.vue:204", "震动失败", err);
                try {
                  if (typeof uni.vibrateLong === "function") {
                    uni.vibrateLong({
                      fail: (err2) => formatAppLog("log", "at pages/bids/index.vue:209", "长震动也失败", err2)
                    });
                  }
                } catch (e) {
                  formatAppLog("log", "at pages/bids/index.vue:213", "长震动异常", e);
                }
              }
            });
          } else {
            formatAppLog("log", "at pages/bids/index.vue:219", "vibrate 方法不存在，尝试使用 vibrateLong");
            if (typeof uni.vibrateLong === "function") {
              uni.vibrateLong({
                fail: (err) => formatAppLog("log", "at pages/bids/index.vue:222", "长震动失败", err)
              });
            } else {
              formatAppLog("log", "at pages/bids/index.vue:225", "设备不支持震动功能");
            }
          }
        } catch (error) {
          formatAppLog("log", "at pages/bids/index.vue:229", "震动功能异常", error);
        }
      };
      const goToUserCenter = () => {
        uni.navigateTo({
          url: "/pages/user/index"
        });
      };
      const toggleSubscription = async (category) => {
        if (!userStore.hasLogin) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        try {
          uni.showLoading({
            title: category.subscribed ? "取消订阅中..." : "订阅中...",
            mask: true
          });
          if (category.subscribed) {
            await removeSubscription({ categoryId: category.id });
            category.subscribed = false;
            subscribedCategories.value = subscribedCategories.value.filter((id) => id !== category.id);
            uni.showToast({
              title: `已取消订阅"${category.name}"`,
              icon: "success"
            });
          } else {
            await addSubscription({ categoryId: category.id });
            category.subscribed = true;
            if (!subscribedCategories.value.includes(category.id)) {
              subscribedCategories.value.push(category.id);
            }
            uni.showToast({
              title: `已订阅"${category.name}"`,
              icon: "success"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/bids/index.vue:284", "订阅操作失败:", error);
          uni.showToast({
            title: "操作失败，请重试",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      };
      const selectCategory = (category) => {
        try {
          uni.setStorageSync("selectedMainCategory", category);
        } catch (e) {
          formatAppLog("error", "at pages/bids/index.vue:299", "保存分类信息失败:", e);
        }
        navigateToWithLoginCheck({
          url: `/pages/projects/category-select?mainCategoryId=${category.id}&mainCategoryName=${encodeURIComponent(category.name)}&comfrom=bids`
        });
      };
      vue.onMounted(() => {
        updateTime();
        getUnreadNotifications();
        fetchUserSubscriptions();
      });
      onShow(() => {
        updateTime();
        getUnreadNotifications();
        fetchUserSubscriptions();
        try {
          plus.navigator.setFullscreen(true);
        } catch (e) {
          formatAppLog("log", "at pages/bids/index.vue:341", "设置全屏失败", e);
        }
      });
      onUnload(() => {
        if (notificationTimer) {
          clearInterval(notificationTimer);
        }
        if (timeUpdateTimer) {
          clearInterval(timeUpdateTimer);
        }
        try {
          plus.navigator.setFullscreen(false);
        } catch (e) {
          formatAppLog("log", "at pages/bids/index.vue:358", "退出全屏失败", e);
        }
      });
      const __returned__ = { userStore, keyword, handleSearch, currentTime, updateTime, subscribedCategories, categories, fetchUserSubscriptions, unreadNotifications, get notificationTimer() {
        return notificationTimer;
      }, set notificationTimer(v) {
        notificationTimer = v;
      }, get timeUpdateTimer() {
        return timeUpdateTimer;
      }, set timeUpdateTimer(v) {
        timeUpdateTimer = v;
      }, getUnreadNotifications, playNotificationSound: playNotificationSound2, vibrateDevice, goToUserCenter, toggleSubscription, selectCategory, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get onShow() {
        return onShow;
      }, get onUnload() {
        return onUnload;
      }, get getUnreadNotificationCount() {
        return getUnreadNotificationCount;
      }, get getUserSubscriptions() {
        return getUserSubscriptions;
      }, get updateUserSubscriptions() {
        return updateUserSubscriptions;
      }, get addSubscription() {
        return addSubscription;
      }, get removeSubscription() {
        return removeSubscription;
      }, get useUserStore() {
        return useUserStore$1;
      }, get navigateToWithLoginCheck() {
        return navigateToWithLoginCheck;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "home-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-top" }, [
          vue.createElementVNode("view", { class: "logo" }, [
            vue.createTextVNode("需求集市 "),
            vue.createElementVNode("b", { style: { "color": "yellow" } }, "Hub")
          ]),
          vue.createElementVNode("view", { class: "header-actions" }, [
            vue.createElementVNode("view", { style: { "font-size": "19px" } }, [
              vue.createElementVNode("b", { style: { "color": "blue" } }, "海量"),
              vue.createTextVNode("需求 等你选择！")
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "search-bar-glass" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.keyword = $event),
              placeholder: "搜索项目关键词",
              onConfirm: $setup.handleSearch
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $setup.keyword]
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "main-content" }, [
        vue.createElementVNode("view", { class: "categories-section fade-in-up" }, [
          vue.createElementVNode("view", { class: "categories-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.categories, (category) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: category.id,
                  class: vue.normalizeClass(["category-card", { "subscribed": category.subscribed }]),
                  onClick: ($event) => $setup.selectCategory(category),
                  onLongpress: ($event) => $setup.toggleSubscription(category)
                }, [
                  vue.createElementVNode("view", { class: "category-icon" }, [
                    vue.createElementVNode("image", {
                      src: category.icon,
                      mode: "aspectFit",
                      class: "category-icon"
                    }, null, 8, ["src"])
                  ]),
                  vue.createElementVNode(
                    "view",
                    { class: "category-title" },
                    vue.toDisplayString(category.name),
                    1
                    /* TEXT */
                  ),
                  category.subscribed ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "subscription-badge"
                  }, [
                    vue.createElementVNode("text", { class: "subscription-icon" }, "✓")
                  ])) : vue.createCommentVNode("v-if", true)
                ], 42, ["onClick", "onLongpress"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])
    ]);
  }
  const PagesBidsIndex = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$9], ["__scopeId", "data-v-54397df0"], ["__file", "F:/new/success/uniappandroid/pages/bids/index.vue"]]);
  const _imports_1$1 = "/static/icons/secondhand.png";
  const _sfc_main$8 = {
    __name: "mybids",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const messageStore = useMessageStore();
      const loading = vue.ref(false);
      const activeTab = vue.ref("all");
      const bids = vue.ref([]);
      const currentPage = vue.ref(1);
      const pageSize = vue.ref(10);
      const hasMore = vue.ref(true);
      const tabs = [
        { label: "全部", value: "all" },
        { label: "待审核", value: "pending" },
        { label: "已通过", value: "approved" },
        { label: "已拒绝", value: "rejected" },
        { label: "已中标", value: "selected" }
      ];
      const filteredBids = vue.computed(() => {
        if (activeTab.value === "all") {
          return bids.value;
        }
        return bids.value.filter((bid) => bid.status === activeTab.value);
      });
      const initData = () => {
        loadBids(true);
      };
      vue.onMounted(() => {
        initData();
      });
      onShow(() => {
        loadBids(true);
      });
      const loadBids = async (refresh = false) => {
        try {
          if (refresh) {
            currentPage.value = 1;
            hasMore.value = true;
          }
          if (!hasMore.value && !refresh)
            return;
          loading.value = true;
          const params = {
            page: currentPage.value,
            size: pageSize.value,
            type: activeTab.value === "all" ? "published" : activeTab.value
          };
          const response = await userStore.getmybidslist(params);
          formatAppLog("log", "at pages/user/mybids.vue:187", "获取的投标列表:", response);
          if (response && response.list && Array.isArray(response.list)) {
            if (refresh) {
              bids.value = response.list;
            } else {
              bids.value = [...bids.value, ...response.list];
            }
            hasMore.value = response.list.length === pageSize.value;
            if (response.list.length > 0) {
              currentPage.value++;
            }
          } else {
            bids.value = refresh ? [] : bids.value;
            hasMore.value = false;
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/mybids.vue:208", "加载投标列表失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      };
      const switchTab = (tab) => {
        if (activeTab.value === tab)
          return;
        activeTab.value = tab;
        loadBids(true);
      };
      const formatDate = (dateString) => {
        if (!dateString)
          return "未知";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const getBidStatusText2 = (status) => {
        const statusMap = {
          "pending": "待审核",
          "approved": "已通过",
          "rejected": "已拒绝",
          "selected": "已中标",
          "canceled": "已取消"
        };
        return statusMap[status] || "未知状态";
      };
      const getBidStatusClass = (status) => {
        const classMap = {
          "pending": "status-pending",
          "approved": "status-approved",
          "rejected": "status-rejected",
          "selected": "status-selected",
          "canceled": "status-canceled"
        };
        return classMap[status] || "";
      };
      const handleContact = async (publisherId) => {
        if (!userStore.hasLogin) {
          uni.navigateTo({ url: "/pages/login/index" });
          return;
        }
        if (!publisherId) {
          uni.showToast({ title: "无法联系发布者", icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: "正在创建会话..." });
          const chatData = await messageStore.createChat(publisherId);
          uni.hideLoading();
          if (chatData && chatData.id) {
            uni.showToast({ title: "已创建会话", icon: "success" });
            uni.navigateTo({
              url: `/pages/messages/chat?id=${chatData.id}&chatId=${chatData.id}&targetUserId=${publisherId}&targetUserName=${encodeURIComponent("项目发布者")}`
            });
          } else {
            throw new Error("创建会话失败");
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/user/mybids.vue:293", "创建会话失败:", error);
          const errorMsg = error.message || "操作失败";
          uni.showToast({ title: errorMsg, icon: "none" });
        }
      };
      const handleCancelBid = async (bidId) => {
        if (!bidId) {
          uni.showToast({ title: "无效的投标ID", icon: "none" });
          return;
        }
        const res = await uni.showModal({
          title: "确认取消",
          content: "确定要取消这个投标吗？此操作不可撤销。"
        });
        if (res.confirm) {
          try {
            uni.showLoading({ title: "正在取消..." });
            await cancelBid(bidId);
            uni.hideLoading();
            uni.showToast({ title: "投标已取消", icon: "success" });
            loadBids(true);
          } catch (error) {
            uni.hideLoading();
            uni.showToast({ title: "取消失败", icon: "none" });
            formatAppLog("error", "at pages/user/mybids.vue:323", "取消投标失败:", error);
          }
        }
      };
      const handleEditBid = (bid) => {
        if (!bid || !bid.project) {
          uni.showToast({ title: "无效的投标信息", icon: "none" });
          return;
        }
        try {
          uni.setStorageSync("editBidData", bid);
        } catch (e) {
          formatAppLog("error", "at pages/user/mybids.vue:339", "保存投标信息失败:", e);
        }
        uni.navigateTo({
          url: `/pages/projects/detail?id=${bid.project.id}&editBid=true`
        });
      };
      const goToProjectDetail = (projectId) => {
        if (projectId) {
          uni.navigateTo({
            url: `/pages/projects/detail?id=${projectId}`
          });
        } else {
          uni.showToast({ title: "项目不存在", icon: "none" });
        }
      };
      const goBrowseProjects = () => {
        uni.switchTab({
          url: "/pages/projects/list"
        });
      };
      const goBack = () => {
        uni.navigateBack();
      };
      const __returned__ = { userStore, messageStore, loading, activeTab, bids, currentPage, pageSize, hasMore, tabs, filteredBids, initData, loadBids, switchTab, formatDate, getBidStatusText: getBidStatusText2, getBidStatusClass, handleContact, handleCancelBid, handleEditBid, goToProjectDetail, goBrowseProjects, goBack, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get onShow() {
        return onShow;
      }, get useUserStore() {
        return useUserStore$1;
      }, get useMessageStore() {
        return useMessageStore;
      }, get cancelBid() {
        return cancelBid;
      }, get updateBid() {
        return updateBid;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "mybids-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-icon",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            class: "back-icon-image",
            src: _imports_0$7,
            mode: "aspectFit"
          })
        ]),
        vue.createElementVNode("view", { class: "header-title" }, "我的投标")
      ]),
      vue.createElementVNode("view", { class: "tab-header glass-effect" }, [
        (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.tabs, (tab) => {
            return vue.createElementVNode("view", {
              key: tab.value,
              class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === tab.value }]),
              onClick: ($event) => $setup.switchTab(tab.value)
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(tab.label),
                1
                /* TEXT */
              )
            ], 10, ["onClick"]);
          }),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", { class: "bids-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.filteredBids, (bid) => {
            var _a, _b;
            return vue.openBlock(), vue.createElementBlock("view", {
              key: bid.id,
              class: "bid-item glass-effect"
            }, [
              vue.createElementVNode("view", {
                class: "project-info",
                onClick: ($event) => {
                  var _a2;
                  return $setup.goToProjectDetail((_a2 = bid.project) == null ? void 0 : _a2.id);
                }
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "project-title" },
                  vue.toDisplayString(((_a = bid.project) == null ? void 0 : _a.title) || "未知项目"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  { class: "project-category" },
                  vue.toDisplayString(((_b = bid.project) == null ? void 0 : _b.category_name) || "未分类"),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]),
              vue.createElementVNode("view", { class: "bid-details" }, [
                vue.createElementVNode("view", { class: "info-grid" }, [
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "info-label" }, "我的报价"),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value price" },
                      "¥" + vue.toDisplayString(bid.price),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "info-label" }, "交付周期"),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value" },
                      vue.toDisplayString(bid.delivery_days) + " 天",
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "info-label" }, "投标时间"),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value" },
                      vue.toDisplayString($setup.formatDate(bid.created_at)),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "bid-status-container" }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["bid-status", $setup.getBidStatusClass(bid.status)])
                    },
                    vue.toDisplayString($setup.getBidStatusText(bid.status)),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "bid-description" }, [
                  vue.createElementVNode("text", { class: "description-label" }, "投标说明:"),
                  vue.createElementVNode(
                    "text",
                    { class: "description-content" },
                    vue.toDisplayString(bid.description || "无"),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "bid-actions" }, [
                vue.createElementVNode("button", {
                  class: "action-btn contact-btn",
                  onClick: ($event) => {
                    var _a2;
                    return $setup.handleContact((_a2 = bid.project) == null ? void 0 : _a2.publisher_id);
                  }
                }, " 联系发布者 ", 8, ["onClick"]),
                bid.status === "pending" ? (vue.openBlock(), vue.createElementBlock("button", {
                  key: 0,
                  class: "action-btn cancel-btn",
                  onClick: ($event) => $setup.handleCancelBid(bid.id)
                }, " 取消投标 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                bid.status === "pending" ? (vue.openBlock(), vue.createElementBlock("button", {
                  key: 1,
                  class: "action-btn edit-btn",
                  onClick: ($event) => $setup.handleEditBid(bid)
                }, " 修改投标 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("button", {
                  class: "action-btn view-btn",
                  onClick: ($event) => {
                    var _a2;
                    return $setup.goToProjectDetail((_a2 = bid.project) == null ? void 0 : _a2.id);
                  }
                }, " 查看项目 ", 8, ["onClick"])
              ]),
              bid.status === "selected" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "selected-badge"
              }, [
                vue.createElementVNode("text", { class: "selected-text" }, "🏆 已中标")
              ])) : vue.createCommentVNode("v-if", true)
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-state"
        }, [
          vue.createElementVNode("text", null, "加载中...")
        ])) : !$setup.loading && $setup.filteredBids.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-state glass-effect"
        }, [
          vue.createElementVNode("image", {
            class: "empty-icon",
            src: _imports_1$1,
            mode: "aspectFit"
          }),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无投标记录"),
          vue.createElementVNode("text", { class: "empty-subtext" }, "去浏览项目并提交您的投标吧"),
          vue.createElementVNode("button", {
            class: "browse-projects-btn",
            onClick: $setup.goBrowseProjects
          }, "浏览项目")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesUserMybids = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$8], ["__scopeId", "data-v-42641889"], ["__file", "F:/new/success/uniappandroid/pages/user/mybids.vue"]]);
  const _sfc_main$7 = {
    __name: "video-player",
    setup(__props, { expose: __expose }) {
      __expose();
      const videoUrl = vue.ref("");
      const videoName = vue.ref("视频播放");
      const loading = vue.ref(true);
      const error = vue.ref(false);
      onLoad((options) => {
        if (options.url) {
          videoUrl.value = decodeURIComponent(options.url);
        }
        if (options.name) {
          videoName.value = decodeURIComponent(options.name);
        }
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const onVideoError = (e) => {
        formatAppLog("error", "at pages/common/video-player.vue:66", "视频播放错误:", e);
        loading.value = false;
        error.value = true;
      };
      const onVideoLoadStart = () => {
        loading.value = true;
        error.value = false;
      };
      const onVideoCanPlay = () => {
        loading.value = false;
        error.value = false;
      };
      const retryLoad = () => {
        error.value = false;
        loading.value = true;
        const currentUrl = videoUrl.value;
        videoUrl.value = "";
        setTimeout(() => {
          videoUrl.value = currentUrl;
        }, 100);
      };
      const __returned__ = { videoUrl, videoName, loading, error, goBack, onVideoError, onVideoLoadStart, onVideoCanPlay, retryLoad, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "video-player-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-button",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$7,
            mode: "aspectFit"
          })
        ]),
        vue.createElementVNode(
          "view",
          { class: "title" },
          vue.toDisplayString($setup.videoName),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "video-wrapper" }, [
        vue.createElementVNode("video", {
          src: $setup.videoUrl,
          class: "video-player",
          controls: "",
          autoplay: false,
          "show-fullscreen-btn": "",
          "show-play-btn": "",
          "show-center-play-btn": "",
          "enable-progress-gesture": true,
          "page-gesture": false,
          "object-fit": "contain",
          onError: $setup.onVideoError,
          onLoadstart: $setup.onVideoLoadStart,
          onCanplay: $setup.onVideoCanPlay
        }, null, 40, ["src"]),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-overlay"
        }, [
          vue.createElementVNode("view", { class: "loading-spinner" }),
          vue.createElementVNode("text", { class: "loading-text" }, "视频加载中...")
        ])) : vue.createCommentVNode("v-if", true),
        $setup.error ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "error-overlay"
        }, [
          vue.createElementVNode("view", { class: "error-icon" }, "⚠️"),
          vue.createElementVNode("text", { class: "error-text" }, "视频加载失败"),
          vue.createElementVNode("button", {
            class: "retry-btn",
            onClick: $setup.retryLoad
          }, "重试")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesCommonVideoPlayer = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$7], ["__scopeId", "data-v-dfe2500e"], ["__file", "F:/new/success/uniappandroid/pages/common/video-player.vue"]]);
  const _sfc_main$6 = {};
  function _sfc_render$6(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "agreement-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "用户协议"),
        vue.createElementVNode("text", { class: "subtitle" }, "最近更新：2025 年 12 月")
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "agreement-scroll"
      }, [
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "一、协议说明"),
          vue.createElementVNode("text", { class: "section-text" }, " 本协议是您与国中宝平台之间关于使用相关产品与服务所达成的合法协议。 在注册、登录、使用我们服务之前，请仔细阅读并充分理解各条款内容。 当您点击“同意”并开始使用服务时，即视为您已经阅读并同意受本协议约束。 ")
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "二、用户权利与义务"),
          vue.createElementVNode("text", { class: "section-text" }, " 您应保证注册信息真实、准确、完整，并在信息发生变更时及时更新； 您有权使用我们提供的项目发布、投标、消息等功能，并可在设置中管理通知和隐私偏好； 您需遵守国家法律法规及平台规则，不得发布违法、侵权或不实信息。 ")
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "三、平台权利与义务"),
          vue.createElementVNode("text", { class: "section-text" }, " 我们将持续改进产品体验，保障服务稳定运行，并通过技术手段保障信息安全； 对于涉嫌违法违规或违反平台规则的账号，我们有权采取限制功能、冻结或注销等措施； 未经您授权，我们不会向第三方分享您的个人信息（法律法规另有要求除外）。 ")
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "四、账号安全"),
          vue.createElementVNode("text", { class: "section-text" }, " 您需妥善保管账号及密码，避免与他人共享设备或泄露信息。 如发现账号被盗用，请立即在“我的-设置-账号安全”中修改密码或联系客服协助处理。 ")
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "五、账号注销"),
          vue.createElementVNode("text", { class: "section-text" }, " 您可以按照隐私政策描述，通过“我的-设置-账号注销”提交注销申请。 注销后我们将删除或匿名化您的个人信息，但法律法规要求保留的除外。 ")
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "六、其他"),
          vue.createElementVNode("text", { class: "section-text" }, " 我们可能根据业务发展及监管要求适时更新本协议，更新后会在应用内或官网公告。 如您继续使用服务，视为接受更新后的协议。如有疑问，可通过客服渠道与我们联系。 ")
        ])
      ])
    ]);
  }
  const PagesCommonUserAgreement = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6], ["__scopeId", "data-v-7b2724bd"], ["__file", "F:/new/success/uniappandroid/pages/common/user-agreement.vue"]]);
  const useGlobalStore = defineStore("global", {
    state: () => ({
      appLoaded: false,
      isLoading: false,
      loadingText: "加载中...",
      theme: "light",
      systemInfo: null,
      networkType: "unknown",
      appConfig: {
        apiBaseUrl: "",
        uploadUrl: "",
        version: "1.0.0"
      }
    }),
    actions: {
      initApp() {
        uni.getSystemInfo({
          success: (res) => {
            this.systemInfo = res;
            formatAppLog("log", "at store/global.js:24", "系统信息:", res);
          }
        });
        uni.getNetworkType({
          success: (res) => {
            this.networkType = res.networkType;
            formatAppLog("log", "at store/global.js:32", "网络类型:", res.networkType);
          }
        });
        uni.onNetworkStatusChange((res) => {
          this.networkType = res.networkType;
          formatAppLog("log", "at store/global.js:39", "网络状态变化:", res.networkType);
          if (!res.isConnected) {
            uni.showToast({
              title: "网络连接已断开",
              icon: "none"
            });
          }
        });
        this.appLoaded = true;
      },
      showLoading(text = "加载中...") {
        this.isLoading = true;
        this.loadingText = text;
      },
      hideLoading() {
        this.isLoading = false;
      },
      toggleTheme() {
        this.theme = this.theme === "light" ? "dark" : "light";
        uni.setStorageSync("app_theme", this.theme);
      }
    }
  });
  const PRIVACY_STORAGE_KEY = "privacy_policy_agreed_v1";
  const usePrivacyStore = defineStore("privacy", {
    state: () => ({
      hasAgreed: false,
      dialogVisible: false,
      deviceIds: {
        oaid: ""
      }
    }),
    actions: {
      bootstrap() {
        const agreed = !!uni.getStorageSync(PRIVACY_STORAGE_KEY);
        this.hasAgreed = agreed;
        this.dialogVisible = !agreed;
      },
      accept() {
        this.hasAgreed = true;
        this.dialogVisible = false;
        uni.setStorageSync(PRIVACY_STORAGE_KEY, true);
      },
      reopenDialog() {
        if (!this.hasAgreed) {
          this.dialogVisible = true;
        }
      },
      collectOaid() {
        if (!this.hasAgreed) {
          formatAppLog("warn", "at store/privacy.js:36", "用户未同意隐私政策，禁止获取OAID");
          return;
        }
        if (typeof plus === "undefined" || !plus.device || typeof plus.device.getOAID !== "function") {
          formatAppLog("log", "at store/privacy.js:42", "当前环境不支持获取OAID");
          return;
        }
        try {
          plus.device.getOAID(
            (id) => {
              this.deviceIds.oaid = id;
              formatAppLog("log", "at store/privacy.js:50", "OAID获取成功");
            },
            (error) => {
              formatAppLog("warn", "at store/privacy.js:53", "获取OAID失败:", error);
            }
          );
        } catch (err) {
          formatAppLog("warn", "at store/privacy.js:57", "调用OAID接口异常:", err);
        }
      }
    }
  });
  const _sfc_main$5 = {
    __name: "privacy-policy",
    setup(__props, { expose: __expose }) {
      __expose();
      const gateMode = vue.ref(false);
      const globalStore = useGlobalStore();
      const userStore = useUserStore$1();
      const privacyStore = usePrivacyStore();
      const goToAccountCancellation = () => {
        uni.navigateTo({ url: "/pages/user/account-cancel" });
      };
      const goToUserAgreement = () => {
        uni.navigateTo({ url: "/pages/common/user-agreement" });
      };
      const handleAccept = async () => {
        privacyStore.accept();
        globalStore.initApp();
        await userStore.checkLoginStatus();
        if (userStore.hasLogin) {
          connectWebSocket(userStore.token);
        }
        privacyStore.collectOaid();
        uni.reLaunch({ url: "/pages/home/index" });
      };
      const handleReject = () => {
        if (typeof plus !== "undefined" && plus.runtime && typeof plus.runtime.quit === "function") {
          plus.runtime.quit();
        } else {
          uni.showToast({
            title: "需要同意后才能使用",
            icon: "none"
          });
        }
      };
      onLoad((options) => {
        gateMode.value = (options == null ? void 0 : options.gate) === "1";
      });
      const __returned__ = { gateMode, globalStore, userStore, privacyStore, goToAccountCancellation, goToUserAgreement, handleAccept, handleReject, get onLoad() {
        return onLoad;
      }, get useGlobalStore() {
        return useGlobalStore;
      }, get useUserStore() {
        return useUserStore$1;
      }, get usePrivacyStore() {
        return usePrivacyStore;
      }, get connectWebSocket() {
        return connectWebSocket;
      }, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "policy-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "隐私政策"),
        vue.createElementVNode("text", { class: "subtitle" }, "最近更新：2025 年 12 月"),
        vue.createElementVNode("view", { class: "links" }, [
          vue.createElementVNode("text", {
            class: "link",
            onClick: $setup.goToUserAgreement
          }, "查看《用户协议》")
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "policy-scroll"
      }, [
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "一、我们收集的信息"),
          vue.createElementVNode("text", { class: "section-text" }, " 我们仅在提供国中宝服务所必需的范围内收集信息，包括账号注册信息、业务使用记录、 设备信息以及按照监管要求保存的日志。为保障广告投放与设备安全，我们会在您同意后 调用系统能力获取设备标识，该信息仅用于风控核验与统计分析，不会用于识别具体自然人。 "),
          vue.createElementVNode("view", { class: "bullet" }, [
            vue.createElementVNode("text", { class: "bullet-title" }, "敏感信息及用途"),
            vue.createElementVNode("text", { class: "bullet-text" }, '• OAID（开放匿名设备标识符）：仅在您点击"同意"后获取，用于统计、风控及反作弊。'),
            vue.createElementVNode("text", { class: "bullet-text" }, "• 位置信息：用于推荐本地项目，可在设置 > 隐私设置中关闭。")
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "二、关于DCloud uni-app引擎"),
          vue.createElementVNode("text", { class: "section-text" }, " 重要说明：我们的产品基于DCloud uni-app(5+ App/Wap2App)开发，应用运行期间需要收集您的设备唯一识别码（IMEI/android ID/DEVICE_ID/IDFA、SIM 卡 IMSI 信息、OAID）以提供统计分析服务，并通过应用启动数据及异常错误日志分析改进性能和用户体验，为用户提供更好的服务。 "),
          vue.createElementVNode("view", { class: "bullet" }, [
            vue.createElementVNode("text", { class: "bullet-title" }, "特别说明："),
            vue.createElementVNode("text", { class: "bullet-text" }, "• 本SDK不会申请涉及隐私的权限，所有权限申请均由开发者的代码申请。"),
            vue.createElementVNode("text", { class: "bullet-text" }, '• 收集的"匿名设备标识符"为随机生成的字符串，不包括OAID、IDFA、IMEI、Android ID等信息。')
          ]),
          vue.createElementVNode("text", { class: "section-text" }, " 详情内容请访问《DCloud App引擎隐私政策》。 ")
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "三、我们如何使用信息"),
          vue.createElementVNode("text", { class: "section-text" }, " 我们会将收集到的信息用于提供核心交易、订单履约、客服处理、安全防护及改进产品体验。 ")
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "四、账号注销"),
          vue.createElementVNode("text", { class: "section-text" }, ' 您可以按照"我的-设置-账号注销"入口提交注销申请。我们将在 15 个工作日内处理，并在完成后 删除或匿名化您的个人信息（法律法规另有规定除外）。注销完成后，账号关联的项目、订单及 积分等数据将无法恢复，请谨慎操作。 '),
          vue.createElementVNode("button", {
            class: "primary-btn",
            onClick: $setup.goToAccountCancellation
          }, "前往账号注销")
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "五、联系我们"),
          vue.createElementVNode("text", { class: "section-text" }, " 如果您对本隐私政策有任何疑问或建议，可通过客服邮箱 763705036@qq.com 与我们联系， 我们会在收到后 15 个工作日内答复。 应用运营方：沈阳科蓝金属科技有限公司 ")
        ])
      ]),
      $setup.gateMode ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "gate-actions"
      }, [
        vue.createElementVNode("view", { class: "gate-text" }, "请先阅读并同意《隐私政策》和《用户协议》后继续使用。"),
        vue.createElementVNode("view", { class: "gate-buttons" }, [
          vue.createElementVNode("button", {
            class: "gate-btn secondary",
            onClick: $setup.handleReject
          }, "不同意并退出"),
          vue.createElementVNode("button", {
            class: "gate-btn primary",
            onClick: $setup.handleAccept
          }, "同意并继续")
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesCommonPrivacyPolicy = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5], ["__scopeId", "data-v-8d87e98c"], ["__file", "F:/new/success/uniappandroid/pages/common/privacy-policy.vue"]]);
  const _sfc_main$4 = {
    __name: "security",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const loginAlert = vue.ref(true);
      const deviceInfo = vue.ref("正在获取...");
      const passwordForm = vue.ref({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const refreshDeviceInfo = () => {
        const info = userStore.userInfo;
        const systemInfo = uni.getSystemInfoSync();
        deviceInfo.value = `${systemInfo.brand || "未知设备"} · ${systemInfo.system}`;
        if (info == null ? void 0 : info.last_login_ip) {
          deviceInfo.value += ` · IP ${info.last_login_ip}`;
        }
      };
      const toggleLoginAlert = (e) => {
        loginAlert.value = e.detail.value;
        uni.showToast({
          title: loginAlert.value ? "登录提醒已开启" : "登录提醒已关闭",
          icon: "none"
        });
      };
      const validatePasswordStrength = (value) => {
        return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()_+\-={}[\]|;:'",.<>/?]{8,32}$/.test(value);
      };
      const handleChangePassword = async () => {
        if (!passwordForm.value.currentPassword) {
          uni.showToast({ title: "请输入当前密码", icon: "none" });
          return;
        }
        if (!validatePasswordStrength(passwordForm.value.newPassword)) {
          uni.showToast({ title: "新密码需8-32位并包含字母和数字", icon: "none" });
          return;
        }
        if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
          uni.showToast({ title: "两次输入的新密码不一致", icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: "提交中..." });
          await userStore.changePassword({
            old_password: passwordForm.value.currentPassword,
            new_password: passwordForm.value.newPassword
          });
          uni.hideLoading();
          uni.showToast({ title: "密码修改成功", icon: "success" });
          passwordForm.value = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          };
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: error.message || "修改失败，请重试", icon: "none" });
        }
      };
      const goToAccountCancel = () => {
        uni.navigateTo({ url: "/pages/user/account-cancel" });
      };
      onShow(() => {
        if (!userStore.token) {
          uni.navigateTo({ url: "/pages/login/index" });
          return;
        }
        refreshDeviceInfo();
      });
      const __returned__ = { userStore, loginAlert, deviceInfo, passwordForm, goBack, refreshDeviceInfo, toggleLoginAlert, validatePasswordStrength, handleChangePassword, goToAccountCancel, ref: vue.ref, get onShow() {
        return onShow;
      }, get useUserStore() {
        return useUserStore$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "security-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("button", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$7,
            class: "back-icon"
          })
        ]),
        vue.createElementVNode("view", { class: "page-title" }, "账号安全"),
        vue.createElementVNode("view", { class: "header-right" })
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "content"
      }, [
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "登录保护"),
          vue.createElementVNode("view", { class: "section-item" }, [
            vue.createElementVNode("view", null, [
              vue.createElementVNode("view", { class: "item-title" }, "最近登录设备"),
              vue.createElementVNode(
                "view",
                { class: "item-desc" },
                vue.toDisplayString($setup.deviceInfo),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("button", {
              class: "link-btn",
              onClick: $setup.refreshDeviceInfo
            }, "刷新")
          ]),
          vue.createElementVNode("view", { class: "section-item" }, [
            vue.createElementVNode("view", null, [
              vue.createElementVNode("view", { class: "item-title" }, "登录提醒"),
              vue.createElementVNode("view", { class: "item-desc" }, "异地登录时发送消息提醒")
            ]),
            vue.createElementVNode("switch", {
              checked: $setup.loginAlert,
              onChange: $setup.toggleLoginAlert,
              color: "#4dabf7"
            }, null, 40, ["checked"])
          ])
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "修改密码"),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "当前密码"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                type: "password",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.passwordForm.currentPassword = $event),
                placeholder: "请输入当前密码"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.passwordForm.currentPassword]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "新密码"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                type: "password",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.passwordForm.newPassword = $event),
                placeholder: "至少 8 位，需包含数字和字母"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.passwordForm.newPassword]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "确认新密码"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                type: "password",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.passwordForm.confirmPassword = $event),
                placeholder: "再次输入新密码"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.passwordForm.confirmPassword]
            ])
          ]),
          vue.createElementVNode("button", {
            class: "primary-btn",
            onClick: $setup.handleChangePassword
          }, "保存并更新密码")
        ]),
        vue.createElementVNode("view", { class: "section danger" }, [
          vue.createElementVNode("view", { class: "section-title" }, "风险操作"),
          vue.createElementVNode("view", { class: "section-item" }, [
            vue.createElementVNode("view", null, [
              vue.createElementVNode("view", { class: "item-title" }, "账号注销"),
              vue.createElementVNode("view", { class: "item-desc" }, "注销后账号数据将无法恢复")
            ]),
            vue.createElementVNode("button", {
              class: "danger-btn",
              onClick: $setup.goToAccountCancel
            }, "去注销")
          ])
        ])
      ])
    ]);
  }
  const PagesUserSecurity = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4], ["__scopeId", "data-v-b48a6a9f"], ["__file", "F:/new/success/uniappandroid/pages/user/security.vue"]]);
  const _sfc_main$3 = {
    __name: "account-cancel",
    setup(__props, { expose: __expose }) {
      __expose();
      const userStore = useUserStore$1();
      const submitting = vue.ref(false);
      const form = vue.ref({
        reason: "",
        contact: "",
        confirmed: false
      });
      const steps = [
        { title: "提交申请", desc: "填写原因并提交注销申请，我们将在 15 个工作日内处理。" },
        { title: "验证账号状态", desc: "需确保无未完成的项目、投标或订单，且账户无欠费纠纷。" },
        { title: "永久删除", desc: "审核通过后我们将按照法规要求删除或匿名化您的个人信息。" }
      ];
      const checklist = [
        "账号内的项目、订单与收益将无法恢复；",
        "实名认证信息及发票历史会被清空；",
        "注销完成后，使用相同手机号或邮箱需重新注册；",
        "若存在争议处理、司法协助需求，我们可能暂缓申请。"
      ];
      const goBack = () => {
        uni.navigateBack();
      };
      const toggleConfirm = () => {
        form.value.confirmed = !form.value.confirmed;
      };
      const handleSubmit = async () => {
        if (!form.value.confirmed) {
          uni.showToast({ title: "请勾选确认条款", icon: "none" });
          return;
        }
        if (submitting.value)
          return;
        try {
          submitting.value = true;
          await userStore.requestAccountCancellation({
            reason: form.value.reason,
            contact: form.value.contact
          });
          uni.showToast({
            title: "已提交，稍后可在客服通知中查看结果",
            icon: "none",
            duration: 2500
          });
          setTimeout(() => {
            goBack();
          }, 1800);
        } catch (error) {
          uni.showToast({ title: error.message || "提交失败，请稍后重试", icon: "none" });
        } finally {
          submitting.value = false;
        }
      };
      onShow(() => {
        if (!userStore.token) {
          uni.navigateTo({ url: "/pages/login/index" });
        }
      });
      const __returned__ = { userStore, submitting, form, steps, checklist, goBack, toggleConfirm, handleSubmit, ref: vue.ref, get onShow() {
        return onShow;
      }, get useUserStore() {
        return useUserStore$1;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "cancel-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("button", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$7,
            class: "back-icon"
          })
        ]),
        vue.createElementVNode("view", { class: "page-title" }, "账号注销"),
        vue.createElementVNode("view", { class: "header-right" })
      ]),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "content"
      }, [
        vue.createElementVNode("view", { class: "notice-card" }, [
          vue.createElementVNode("view", { class: "notice-title" }, "请确认以下事项"),
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.checklist, (item, index) => {
              return vue.createElementVNode("view", {
                class: "notice-item",
                key: index
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "notice-index" },
                  vue.toDisplayString(index + 1) + ".",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "notice-text" },
                  vue.toDisplayString(item),
                  1
                  /* TEXT */
                )
              ]);
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "注销流程"),
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.steps, (step, index) => {
              return vue.createElementVNode("view", {
                class: "step-item",
                key: step.title
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "step-index" },
                  vue.toDisplayString(index + 1),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "step-content" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "step-title" },
                    vue.toDisplayString(step.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "step-desc" },
                    vue.toDisplayString(step.desc),
                    1
                    /* TEXT */
                  )
                ])
              ]);
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "填写注销申请"),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "注销原因（选填）"),
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                class: "form-textarea",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.reason = $event),
                maxlength: "200",
                placeholder: "请简要说明您要注销的原因，便于我们优化产品"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.reason]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "联系方式（选填）"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.contact = $event),
                placeholder: "如需结果通知，可填写手机号或邮箱"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.contact]
            ])
          ]),
          vue.createElementVNode("view", { class: "confirm-row" }, [
            vue.createElementVNode("checkbox", {
              checked: $setup.form.confirmed,
              onClick: $setup.toggleConfirm,
              style: { "transform": "scale(0.7)" }
            }, null, 8, ["checked"]),
            vue.createElementVNode("text", { class: "confirm-text" }, " 我已阅读并理解账号注销的全部风险，愿意删除账号及其关联数据。 ")
          ]),
          vue.createElementVNode("button", {
            class: "danger-btn",
            disabled: $setup.submitting,
            onClick: $setup.handleSubmit
          }, vue.toDisplayString($setup.submitting ? "提交中..." : "提交注销申请"), 9, ["disabled"])
        ])
      ])
    ]);
  }
  const PagesUserAccountCancel = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3], ["__scopeId", "data-v-a6bc6d93"], ["__file", "F:/new/success/uniappandroid/pages/user/account-cancel.vue"]]);
  const _imports_1 = "/static/logo.png";
  const _sfc_main$2 = {
    __name: "about",
    setup(__props, { expose: __expose }) {
      __expose();
      const goBack = () => {
        uni.navigateBack();
      };
      const goToUserAgreement = () => {
        uni.navigateTo({ url: "/pages/common/user-agreement" });
      };
      const goToPrivacyPolicy = () => {
        uni.navigateTo({ url: "/pages/common/privacy-policy" });
      };
      const __returned__ = { goBack, goToUserAgreement, goToPrivacyPolicy };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "about-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("button", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$7,
            class: "back-icon"
          })
        ]),
        vue.createElementVNode("view", { class: "page-title" }, "关于我们"),
        vue.createElementVNode("view", { class: "header-right" })
      ]),
      vue.createElementVNode("view", { class: "content-container" }, [
        vue.createElementVNode("view", { class: "app-logo" }, [
          vue.createElementVNode("image", {
            src: _imports_1,
            class: "logo-image"
          })
        ]),
        vue.createElementVNode("view", { class: "app-info" }, [
          vue.createElementVNode("text", { class: "app-name" }, "国中宝 App"),
          vue.createElementVNode("text", { class: "app-version" }, "当前版本: v1.0.0")
        ]),
        vue.createElementVNode("view", { class: "app-description" }, [
          vue.createElementVNode("text", null, " 一个提供大家发布采购和消费需求的平台，用户会员有双重身份科同为甲方和乙方，甲方发布需求后会收到多个乙方的报价和投标，从中选择一个最符合自己需求的乙方在线上达成交易，会员要求实名制，共分两种企业会员和普通会员")
        ]),
        vue.createElementVNode("view", { class: "company-info" }, [
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "公司名称："),
            vue.createElementVNode("text", { class: "info-value" }, "沈阳科蓝金属科技有限公司")
          ]),
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "联系邮箱："),
            vue.createElementVNode("text", { class: "info-value" }, "763705036@qq.com")
          ]),
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "官方网站："),
            vue.createElementVNode("text", { class: "info-value" }, [
              vue.createElementVNode("a", { href: "http://www.baoyuwangluokeji.com.cn/website/" }, "国中宝APP V1.0")
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "legal-info" }, [
          vue.createElementVNode("button", {
            class: "legal-btn",
            onClick: $setup.goToUserAgreement
          }, "用户协议"),
          vue.createElementVNode("button", {
            class: "legal-btn",
            onClick: $setup.goToPrivacyPolicy
          }, "隐私政策")
        ]),
        vue.createElementVNode("view", { class: "copyright" }, [
          vue.createElementVNode("text", null, "© 2025 沈阳科蓝金属科技有限公司. 保留所有权利。")
        ])
      ])
    ]);
  }
  const PagesCommonAbout = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__scopeId", "data-v-d75f624b"], ["__file", "F:/new/success/uniappandroid/pages/common/about.vue"]]);
  const _sfc_main$1 = {
    __name: "feedback",
    setup(__props, { expose: __expose }) {
      __expose();
      const feedbackTypes = ["功能建议", "bug反馈", "性能问题", "界面优化", "其他"];
      const feedbackTypeIndex = vue.ref(0);
      const feedbackContent = vue.ref("");
      const contactInfo = vue.ref("");
      const canSubmit = vue.computed(() => {
        return feedbackContent.value.trim().length > 0;
      });
      const goBack = () => {
        uni.navigateBack();
      };
      const onFeedbackTypeChange = (e) => {
        feedbackTypeIndex.value = e.detail.value;
      };
      const submitFeedback = () => {
        if (!canSubmit.value) {
          return;
        }
        uni.showLoading({
          title: "提交中..."
        });
        setTimeout(() => {
          uni.hideLoading();
          uni.showToast({
            title: "反馈提交成功",
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            goBack();
          }, 1500);
        }, 1e3);
      };
      const __returned__ = { feedbackTypes, feedbackTypeIndex, feedbackContent, contactInfo, canSubmit, goBack, onFeedbackTypeChange, submitFeedback, ref: vue.ref, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "feedback-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("button", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$7,
            class: "back-icon"
          })
        ]),
        vue.createElementVNode("view", { class: "page-title" }, "意见反馈"),
        vue.createElementVNode("view", { class: "header-right" })
      ]),
      vue.createElementVNode("view", { class: "content-container" }, [
        vue.createElementVNode("view", { class: "feedback-intro" }, [
          vue.createElementVNode("text", null, "感谢您对我们的支持！请填写以下信息，我们会尽快处理您的反馈。")
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "反馈类型"),
          vue.createElementVNode("picker", {
            onChange: $setup.onFeedbackTypeChange,
            value: $setup.feedbackTypeIndex,
            range: $setup.feedbackTypes,
            class: "form-picker"
          }, [
            vue.createElementVNode("view", { class: "picker-value" }, [
              vue.createTextVNode(
                vue.toDisplayString($setup.feedbackTypes[$setup.feedbackTypeIndex]) + " ",
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "item-arrow" }, "›")
            ])
          ], 40, ["value"])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "反馈内容"),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.feedbackContent = $event),
              class: "form-textarea",
              placeholder: "请详细描述您遇到的问题或建议...",
              "placeholder-style": "color: rgba(255, 255, 255, 0.4)",
              maxlength: "500",
              "auto-height": ""
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.feedbackContent]
          ]),
          vue.createElementVNode(
            "text",
            { class: "content-count" },
            vue.toDisplayString($setup.feedbackContent.length) + "/500",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "联系方式"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.contactInfo = $event),
              class: "form-input",
              placeholder: "请留下您的邮箱或手机号，以便我们联系您",
              "placeholder-style": "color: rgba(255, 255, 255, 0.4)"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.contactInfo]
          ])
        ]),
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: $setup.submitFeedback,
          disabled: !$setup.canSubmit
        }, " 提交反馈 ", 8, ["disabled"])
      ])
    ]);
  }
  const PagesCommonFeedback = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-14faa9d4"], ["__file", "F:/new/success/uniappandroid/pages/common/feedback.vue"]]);
  __definePage("pages/home/index", PagesHomeIndex);
  __definePage("pages/login/index", PagesLoginIndex);
  __definePage("pages/register/index", PagesRegisterIndex);
  __definePage("pages/login/forget-password", PagesLoginForgetPassword);
  __definePage("pages/projects/list", PagesProjectsList);
  __definePage("pages/projects/detail", PagesProjectsDetail);
  __definePage("pages/projects/category-select", PagesProjectsCategorySelect);
  __definePage("pages/projects/publish", PagesProjectsPublish);
  __definePage("pages/messages/index", PagesMessagesIndex);
  __definePage("pages/messages/chat", PagesMessagesChat);
  __definePage("pages/orders/index", PagesOrdersIndex);
  __definePage("pages/orders/detail", PagesOrdersDetail);
  __definePage("pages/user/index", PagesUserIndex);
  __definePage("pages/user/projects", PagesUserProjects);
  __definePage("pages/notifications/index", PagesNotificationsIndex);
  __definePage("pages/user/verify", PagesUserVerify);
  __definePage("pages/user/settings", PagesUserSettings);
  __definePage("pages/user/profile", PagesUserProfile);
  __definePage("pages/user/myinformation", PagesUserMyinformation);
  __definePage("pages/bids/index", PagesBidsIndex);
  __definePage("pages/user/mybids", PagesUserMybids);
  __definePage("pages/common/video-player", PagesCommonVideoPlayer);
  __definePage("pages/common/user-agreement", PagesCommonUserAgreement);
  __definePage("pages/common/privacy-policy", PagesCommonPrivacyPolicy);
  __definePage("pages/user/security", PagesUserSecurity);
  __definePage("pages/user/account-cancel", PagesUserAccountCancel);
  __definePage("pages/common/about", PagesCommonAbout);
  __definePage("pages/common/feedback", PagesCommonFeedback);
  const _sfc_main = {
    __name: "App",
    setup(__props, { expose: __expose }) {
      __expose();
      const globalStore = useGlobalStore();
      const userStore = useUserStore$1();
      const privacyStore = usePrivacyStore();
      const hasInitialized = vue.ref(false);
      const showPrivacyDialog = vue.ref(false);
      const showFabMenu = vue.ref(false);
      const openAgreementPage = (type) => {
        const url = type === "privacy" ? "/pages/common/privacy-policy" : "/pages/common/user-agreement";
        uni.navigateTo({
          url,
          success: () => {
            formatAppLog("log", "at App.vue:72", "成功打开协议页面:", url);
          },
          fail: (err) => {
            formatAppLog("error", "at App.vue:75", "打开协议页面失败:", err);
            uni.showToast({
              title: "打开页面失败",
              icon: "none"
            });
          }
        });
      };
      const openPrivacyMenu = () => {
        showFabMenu.value = true;
      };
      const closeFabMenu = () => {
        showFabMenu.value = false;
      };
      const openConsentDialog = () => {
        showFabMenu.value = false;
        showPrivacyDialog.value = true;
      };
      const runPostConsentInit = async () => {
        if (hasInitialized.value)
          return;
        hasInitialized.value = true;
        globalStore.initApp();
        await userStore.checkLoginStatus();
        if (userStore.hasLogin) {
          connectWebSocket(userStore.token);
        }
        privacyStore.collectOaid();
      };
      const handleAccept = async () => {
        privacyStore.accept();
        showPrivacyDialog.value = false;
        if (!hasInitialized.value) {
          await runPostConsentInit();
        }
      };
      const handleReject = () => {
        if (typeof plus !== "undefined" && plus.runtime && typeof plus.runtime.quit === "function") {
          plus.runtime.quit();
        } else {
          uni.showToast({
            title: "需要同意协议才能使用",
            icon: "none",
            duration: 2e3
          });
        }
      };
      const showAppPrivacyDialog = () => {
        showPrivacyDialog.value = true;
        setTimeout(() => {
          if (!showPrivacyDialog.value) {
            showPrivacyDialog.value = true;
          }
        }, 200);
      };
      onLaunch(async () => {
        formatAppLog("log", "at App.vue:146", "App onLaunch 开始");
        privacyStore.bootstrap();
        formatAppLog("log", "at App.vue:150", "隐私状态检查 - hasAgreed:", privacyStore.hasAgreed);
        formatAppLog("log", "at App.vue:151", "存储中的值:", uni.getStorageSync("privacy_policy_agreed_v1"));
        await vue.nextTick();
        if (!privacyStore.hasAgreed) {
          formatAppLog("log", "at App.vue:158", "用户未同意隐私政策，立即跳转协议页强制查看");
          uni.reLaunch({
            url: "/pages/common/privacy-policy?gate=1"
          });
          return;
        } else {
          formatAppLog("log", "at App.vue:165", "用户已同意隐私政策，开始初始化");
          await runPostConsentInit();
        }
      });
      onShow(() => {
        formatAppLog("log", "at App.vue:172", "App 显示");
      });
      onHide(() => {
        formatAppLog("log", "at App.vue:176", "App 隐藏");
      });
      const __returned__ = { globalStore, userStore, privacyStore, hasInitialized, showPrivacyDialog, showFabMenu, openAgreementPage, openPrivacyMenu, closeFabMenu, openConsentDialog, runPostConsentInit, handleAccept, handleReject, showAppPrivacyDialog, ref: vue.ref, nextTick: vue.nextTick, get onLaunch() {
        return onLaunch;
      }, get onShow() {
        return onShow;
      }, get onHide() {
        return onHide;
      }, get useGlobalStore() {
        return useGlobalStore;
      }, get useUserStore() {
        return useUserStore$1;
      }, get usePrivacyStore() {
        return usePrivacyStore;
      }, get connectWebSocket() {
        return connectWebSocket;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "app-root" }, [
      $setup.showPrivacyDialog ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "privacy-mask",
        onClick: _cache[3] || (_cache[3] = vue.withModifiers(() => {
        }, ["stop"]))
      }, [
        vue.createElementVNode("view", {
          class: "privacy-dialog",
          onClick: _cache[2] || (_cache[2] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "privacy-title" }, "隐私政策提示"),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "privacy-content"
          }, [
            vue.createElementVNode("view", { class: "privacy-text" }, [
              vue.createElementVNode("text", null, "感谢您使用国中宝！在使用本应用前，请您仔细阅读并充分理解"),
              vue.createElementVNode("view", {
                class: "privacy-link",
                onClick: _cache[0] || (_cache[0] = ($event) => $setup.openAgreementPage("agreement"))
              }, [
                vue.createElementVNode("text", null, "《用户协议》")
              ]),
              vue.createElementVNode("text", null, "和"),
              vue.createElementVNode("view", {
                class: "privacy-link",
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.openAgreementPage("privacy"))
              }, [
                vue.createElementVNode("text", null, "《隐私政策》")
              ]),
              vue.createElementVNode("text", null, "。我们将在您同意后再开始收集和使用与提供服务相关的必要信息，包括设备标识的相关数据。")
            ]),
            vue.createElementVNode("view", { class: "privacy-detail" }, [
              vue.createElementVNode("text", { class: "detail-title" }, "主要收集与用途（同意后生效）："),
              vue.createElementVNode("text", { class: "detail-item" }, "• 设备标识（OAID）：用于反作弊、统计和安全风控。"),
              vue.createElementVNode("text", { class: "detail-item" }, "• 日志与故障信息：用于保障服务稳定性与问题排查。"),
              vue.createElementVNode("text", { class: "detail-title" }, "您的权利："),
              vue.createElementVNode("text", { class: "detail-item" }, "• 您可随时通过“隐私政策”入口再次查看并管理授权。"),
              vue.createElementVNode("text", { class: "detail-item" }, "• 如不同意，可点击“不同意”退出，或稍后在入口查看政策后再使用。"),
              vue.createElementVNode("text", { class: "detail-title" }, "帮助："),
              vue.createElementVNode("text", { class: "detail-item" }, "如有疑问，可通过客服邮箱 763705036@qq.com 联系我们。")
            ])
          ]),
          vue.createElementVNode("view", { class: "privacy-btn-group" }, [
            vue.createElementVNode("button", {
              class: "privacy-btn reject",
              onClick: $setup.handleReject
            }, "不同意"),
            vue.createElementVNode("button", {
              class: "privacy-btn accept",
              onClick: $setup.handleAccept
            }, "同意并继续")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", {
        class: "privacy-fab",
        onClick: $setup.openPrivacyMenu,
        "hover-class": "privacy-fab-hover"
      }, [
        vue.createElementVNode("text", { class: "fab-icon" }, "ⓘ"),
        vue.createElementVNode("text", { class: "fab-text" }, "隐私")
      ]),
      $setup.showFabMenu ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "privacy-fab-menu"
      }, [
        vue.createElementVNode("view", {
          class: "fab-menu-item",
          onClick: _cache[4] || (_cache[4] = ($event) => $setup.openAgreementPage("privacy"))
        }, "查看隐私政策"),
        vue.createElementVNode("view", {
          class: "fab-menu-item",
          onClick: _cache[5] || (_cache[5] = ($event) => $setup.openAgreementPage("agreement"))
        }, "查看用户协议"),
        vue.createElementVNode("view", {
          class: "fab-menu-item",
          onClick: $setup.openConsentDialog
        }, "重新查看首屏弹窗"),
        vue.createElementVNode("view", {
          class: "fab-menu-item close",
          onClick: $setup.closeFabMenu
        }, "关闭")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "F:/new/success/uniappandroid/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    app.use(createPinia());
    return {
      app,
      Pinia
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
