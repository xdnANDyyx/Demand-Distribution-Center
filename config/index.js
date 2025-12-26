/**
 * 环境配置 // 192.168.0.101
 *          //115.190.38.218
 */
const IP = "115.190.38.218"
const ENV = {
  development: {
    baseURL: 'http://'+IP+'/api/v1', // 需要加  /api
    socketURL: 'ws://'+IP+'/api/v1/ws',
    staticURL: 'http://'+IP+'/static',
    debug: true
  },
  production: {   
    baseURL: 'http://'+IP+'/api/api/v1',
    socketURL: 'ws://'+IP+'/api/api/v1/ws',
    staticURL: 'http://'+IP+'/static',
    debug: false
  }
}

// 检测当前环境是否为移动应用
const isMobileApp = typeof plus !== 'undefined'

// 移动应用环境下使用不同的API地址
if (isMobileApp) {
  ENV.development.baseURL = 'http://'+IP+'/api/api/v1' // Android模拟器访问本机的地址 :8080/api/v1  切换本地需修改
  ENV.development.socketURL = 'ws://'+IP+'/api/api/v1/ws'
  ENV.production.baseURL = 'http://'+IP+'/api/api/v1'
  ENV.production.socketURL = 'ws://'+IP+'/api/api/v1/ws'
} else {
  // 非移动应用环境（如浏览器）下，使用相对路径
  // ENV.development.baseURL = 'http://'+IP+'/api/api/v1'
  // ENV.development.socketURL = 'ws://'+IP+'/api/api/v1/ws'
  // ENV.production.baseURL = 'http://'+IP+'/api/api/v1'
  // ENV.production.socketURL = 'ws://'+IP+'/api/api/v1/ws'
}

/**
 * 当前环境
 */
const currentEnv = process.env.NODE_ENV || 'development'

// 调试输出当前环境
console.log('当前环境:', currentEnv)
console.log('是否为移动应用:', isMobileApp)
console.log('API基础URL:', ENV[currentEnv].baseURL)

/**
 * 应用配置
 */
export const APP_CONFIG = {
  // 应用信息
  APP_NAME: '国中宝',
  APP_VERSION: '1.0.0',
  
  // API配置
  API_BASE_URL: ENV[currentEnv].baseURL,
  API_TIMEOUT: 10000,
  API_WITH_CREDENTIALS: true,
  
  // 静态资源
  STATIC_URL: ENV[currentEnv].staticURL,
  
  // 调试模式
  DEBUG: ENV[currentEnv].debug
}

/**
 * WebSocket配置
 */
export const WS_CONFIG = {
  URL: ENV[currentEnv].socketURL,
  RECONNECT_INTERVAL: 5000, // 重连间隔（毫秒）
  MAX_RECONNECT_COUNT: 5,   // 最大重连次数
  HEARTBEAT_INTERVAL: 30000, // 心跳间隔（毫秒）
  CONNECTION_TIMEOUT: 10000  // 连接超时时间（毫秒）
}

/**
 * 上传配置
 */
export const UPLOAD_CONFIG = {
  MAX_SIZE: 20 * 1024 * 1024, // 20MB
  ACCEPT_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
  IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_COMPRESS_QUALITY: 0.8
}

/**
 * 分页配置
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100],
  MAX_PAGE_COUNT: 100
}

/**
 * 正则表达式
 */
export const REGEX = {
  PHONE: /^1[3-9]\d{9}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  USERNAME: /^[a-zA-Z0-9_]{4,20}$/,
  PASSWORD: /^.{6,20}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/,
  ID_CARD: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  AMOUNT: /^(([1-9]\d*)|\d)(\.\d{1,2})?$/
}

/**
 * 主题配置
 */
export const THEME = {
  PRIMARY_COLOR: '#2d8cf0',
  SUCCESS_COLOR: '#19be6b',
  WARNING_COLOR: '#ff9900',
  ERROR_COLOR: '#ed4014',
  INFO_COLOR: '#2db7f5',
  
  TEXT_COLOR: '#333333',
  TEXT_COLOR_LIGHT: '#666666',
  TEXT_COLOR_LIGHTER: '#999999',
  
  BORDER_COLOR: '#e8e8e8',
  BORDER_RADIUS: '8px',
  
  BACKGROUND_COLOR: '#f8f9fa',
  WHITE: '#ffffff',
  
  BOX_SHADOW: '0 2px 8px rgba(0, 0, 0, 0.1)',
  BOX_SHADOW_LIGHT: '0 1px 4px rgba(0, 0, 0, 0.05)',
  BOX_SHADOW_DARK: '0 4px 12px rgba(0, 0, 0, 0.15)'
}

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  THEME: 'theme',
  REMEMBER_PASSWORD: 'remember_password',
  SAVED_USERNAME: 'saved_username',
  SAVED_PASSWORD: 'saved_password'
}

export default {
  APP_CONFIG,
  WS_CONFIG,
  UPLOAD_CONFIG,
  PAGINATION_CONFIG,
  REGEX,
  THEME,
  STORAGE_KEYS
}
