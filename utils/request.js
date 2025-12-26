import { APP_CONFIG } from '../config/index.js'

/**
 * 请求配置
 */
const config = {
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  header: {
    'Content-Type': 'application/json'
  }
}

// 调试输出当前API基础URL
console.log('当前API基础URL:', config.baseURL)

/**
 * 请求拦截器
 * @param {Object} options 请求配置
 * @returns {Object} 处理后的请求配置
 */
function requestInterceptor(options) {
  // 获取token
  const token = uni.getStorageSync('token')
  
  // 添加token到请求头
  if (token) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 添加时间戳防止缓存
  if (options.url.indexOf('?') === -1) {
    options.url = `${options.url}?_t=${Date.now()}`
  } else {
    options.url = `${options.url}&_t=${Date.now()}`
  }
  
  return options
}

/**
 * 响应拦截器
 * @param {Object} response 响应数据
 * @returns {Object|Promise} 处理后的响应数据或Promise.reject
 */
function responseInterceptor(response) {
  // 请求成功，且业务也成功
  if (response.statusCode === 200 && (response.data.code === 0 || response.data.code === 200)) {
    return response.data.data
  }

  // --- 以下所有情况都视为错误，需要返回一个 rejected Promise ---

  // 获取后端返回的错误信息，如果没有则使用默认信息
  const backendMessage = response.data?.message || '请求失败';

  // 创建一个统一的错误对象
  const error = new Error(backendMessage);

  // 将后端的状态码和业务码附加到 error 对象上，方便前端区分处理
  error.statusCode = response.statusCode; // HTTP 状态码，如 401, 500
  error.code = response.data?.code;      // 业务状态码，如 1001, 40101

  // 特殊处理 401：这里只做标记，不修改错误信息
  // 你可以在你的 login 方法里根据 error.statusCode === 401 来执行登出等操作
  // 或者你仍然在这里执行登出操作，但错误信息保持原样
  if (response.statusCode === 401) {
    // 在这里执行清除 token 的逻辑，因为这是标准流程
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    
    // 注意：这里不再使用 uni.showToast()，因为这样会强制覆盖所有 401 错误的提示
    // 错误提示应该由调用方（login方法）根据具体的 error.message 来决定
  }

  // 将包含所有信息的 error 对象抛出
  return Promise.reject(error);
}

/**
 * 错误处理
 * @param {Error} error 错误对象
 * @returns {Promise} Promise.reject
 */
function errorHandler(error) {
  // 网络错误
  if (error.errMsg && error.errMsg.indexOf('request:fail') !== -1) {
    uni.showToast({
      title: '网络连接失败，请检查网络设置',
      icon: 'none'
    })
  } else {
    // 其他错误
    uni.showToast({
      title: error.message || '请求失败',
      icon: 'none'
    })
  }
  
  return Promise.reject(error)
}

/**
 * 发送请求
 * @param {Object} options 请求配置
 * @returns {Promise} Promise对象
 */
function request(options) {
  // 合并配置
  const mergedOptions = {
    ...config,
    ...options,
    header: {
      ...config.header,
      ...(options.header || {})
    }
  }
  
  // 请求拦截
  const interceptedOptions = requestInterceptor(mergedOptions)
  
  // 确保URL是完整的
  if (!interceptedOptions.url.startsWith('http')) {
    interceptedOptions.url = `${config.baseURL}${interceptedOptions.url.startsWith('/') ? '' : '/'}${interceptedOptions.url}`
  }
  
  console.log('发送请求:', interceptedOptions.url)
  
  // 发送请求
  return new Promise((resolve, reject) => {
    uni.request({
      ...interceptedOptions,
      success: (response) => {
        try {
          console.log('请求成功:', interceptedOptions.url, response.statusCode)
          const result = responseInterceptor(response)
          resolve(result)
        } catch (error) {
          console.error('响应处理错误:', error)
          reject(error)
        }
      },
      fail: (error) => {
        console.error('请求失败:', interceptedOptions.url, error)
        errorHandler(error)
        reject(error)
      }
    })
  })
}

/**
 * GET请求
 * @param {string} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 其他配置
 * @returns {Promise} Promise对象
 */
export function get(url, params = {}, options = {}) {
  // 构建查询字符串
  const queryString = Object.keys(params)
  
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  // 拼接URL
  const requestUrl = queryString ? `${url}?${queryString}` : url
  console.log("请求的url是什么？：",requestUrl)
  return request({
    url: requestUrl,
    method: 'GET',
    ...options
  })
}

/**
 * POST请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise} Promise对象
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise} Promise对象
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise} Promise对象
 */
export function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

/**
 * 上传文件
 * @param {string} url 上传地址
 * @param {string} filePath 文件路径
 * @param {string} name 文件对应的key
 * @param {Object} formData 其他表单数据
 * @param {Object} options 其他配置
 * @returns {Promise} Promise对象
 */
export function upload(url, filePath, name = 'file', formData = {}, options = {}) {
  // 获取token
  const token = uni.getStorageSync('token')
  
  // 添加token到请求头
  const header = {
    ...config.header,
    'Content-Type': 'multipart/form-data'
  }
  
  if (token) {
    header.Authorization = `Bearer ${token}`
  }
  
  // 确保URL是完整的
  let fullUrl = url
  if (!url.startsWith('http')) {
    fullUrl = `${config.baseURL}${url.startsWith('/') ? '' : '/'}${url}`
  }
  
  console.log('上传文件请求:', fullUrl)
  
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: fullUrl,
      filePath,
      name,
      formData,
      header,
      success: (response) => {
        try {
          console.log('上传文件成功:', response.statusCode)
          // 上传接口返回的是字符串，需要转换为对象
          const data = JSON.parse(response.data)
          
          if (response.statusCode === 200 && data.code === 200) {
            resolve(data.data)
          } else {
            const error = new Error(data.message || `上传失败，状态码：${response.statusCode}`)
            error.statusCode = response.statusCode
            error.code = data.code
            reject(error)
          }
        } catch (error) {
          console.error('解析上传响应失败:', error)
          reject(new Error('解析上传响应失败'))
        }
      },
      fail: (error) => {
        console.error('上传文件失败:', error)
        errorHandler(error)
        reject(error)
      }
    })
  })
}

/**
 * 下载文件
 * @param {string} url 下载地址
 * @param {Object} params 请求参数
 * @param {Object} options 其他配置
 * @returns {Promise} Promise对象
 */
export function download(url, params = {}, options = {}) {
  // 获取token
  const token = uni.getStorageSync('token')
  
  // 添加token到请求头
  const header = {
    ...config.header
  }
  
  if (token) {
    header.Authorization = `Bearer ${token}`
  }
  
  // 构建查询字符串
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  // 拼接URL
  const requestUrl = queryString ? `${url}?${queryString}` : url
  
  // 确保URL是完整的
  let fullUrl = requestUrl
  if (!requestUrl.startsWith('http')) {
    fullUrl = `${config.baseURL}${requestUrl.startsWith('/') ? '' : '/'}${requestUrl}`
  }
  
  console.log('下载文件请求:', fullUrl)
  
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url: fullUrl,
      header,
      success: (response) => {
        console.log('下载文件成功:', response.statusCode)
        if (response.statusCode === 200) {
          resolve(response.tempFilePath)
        } else {
          const error = new Error(`下载失败，状态码：${response.statusCode}`)
          error.statusCode = response.statusCode
          reject(error)
        }
      },
      fail: (error) => {
        console.error('下载文件失败:', error)
        errorHandler(error)
        reject(error)
      }
    })
  })
}

export default {
  get,
  post,
  put,
  del,
  upload,
  download
}
