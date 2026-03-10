const APP_HOST = 'www.baoyuwangluokeji.com.cn'
const APP_ORIGIN = `https://${APP_HOST}`

const buildEnv = (debug) => ({
  baseURL: `${APP_ORIGIN}/api/api/v1`,
  socketURL: `wss://${APP_HOST}/api/v1/ws`,
  staticURL: `${APP_ORIGIN}/api/static`,
  debug
})

const ENV = {
  development: buildEnv(true),
  production: buildEnv(false)
}

const currentEnv = process.env.NODE_ENV || 'development'

console.log('褰撳墠鐜:', currentEnv)
console.log('API鍩虹URL:', ENV[currentEnv].baseURL)

export const APP_CONFIG = {
  APP_NAME: '国中宝',
  APP_VERSION: '1.0.0',
  API_BASE_URL: ENV[currentEnv].baseURL,
  API_TIMEOUT: 10000,
  API_WITH_CREDENTIALS: true,
  STATIC_URL: ENV[currentEnv].staticURL,
  DEBUG: ENV[currentEnv].debug,
  HOST: APP_HOST,
  ORIGIN: APP_ORIGIN
}

export const WS_CONFIG = {
  URL: ENV[currentEnv].socketURL,
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_COUNT: 5,
  HEARTBEAT_INTERVAL: 30000,
  CONNECTION_TIMEOUT: 10000
}

export const UPLOAD_CONFIG = {
  MAX_SIZE: 20 * 1024 * 1024,
  ACCEPT_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
  IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,
  IMAGE_COMPRESS_QUALITY: 0.8
}

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100],
  MAX_PAGE_COUNT: 100
}

export const REGEX = {
  PHONE: /^1[3-9]\d{9}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  USERNAME: /^[a-zA-Z0-9_]{4,20}$/,
  PASSWORD: /^.{6,20}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/,
  ID_CARD: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  AMOUNT: /^(([1-9]\d*)|\d)(\.\d{1,2})?$/
}

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
