import { APP_CONFIG } from '../config/index.js'
import { useUserStore } from '../store/user.js'
import { resolveAssetUrl } from '../utils/url.js'

/**
 * 上传前把文件转换为应用沙箱内的本地临时文件
 * Android上从第三方应用(如QQ浏览器)选择文件时返回的是 content:// 地址，
 * 直接用 uni.uploadFile 上传这类地址，multipart 里的文件名可能丢失扩展名
 * 或文件读取失败，导致后端校验返回400。这里先复制到 _doc/upload_temp/ 下，
 * 并保证文件名带有正确扩展名后再上传。
 * @param {String} filePath 原始文件路径
 * @param {String} fallbackExt 兜底扩展名(如 '.pdf')
 * @returns {Promise<String>} 可用于上传的本地文件路径
 */
function ensureLocalFile(filePath, fallbackExt) {
  return new Promise((resolve) => {
    // #ifdef APP-PLUS
    if (typeof plus === 'undefined' || !/^(content|file):\/\//i.test(filePath)) {
      resolve(filePath)
      return
    }
    plus.io.resolveLocalFileSystemURL(filePath, (srcEntry) => {
      plus.io.resolveLocalFileSystemURL('_doc/', (docDir) => {
        docDir.getDirectory('upload_temp', { create: true }, (tempDir) => {
          // 优先取原文件名的扩展名，取不到再从URI中解析，最后用兜底扩展名
          let ext = ''
          const srcName = srcEntry.name || ''
          const dotIndex = srcName.lastIndexOf('.')
          if (dotIndex > -1) {
            ext = srcName.substring(dotIndex).toLowerCase()
          }
          if (!ext) {
            const cleanUri = filePath.split(/[?#]/)[0]
            const uriDot = cleanUri.lastIndexOf('.')
            const uriSlash = cleanUri.lastIndexOf('/')
            if (uriDot > -1 && uriDot > uriSlash) {
              ext = cleanUri.substring(uriDot).toLowerCase()
            }
          }
          if (!ext || ext.length > 6) {
            ext = fallbackExt || ''
          }
          const newName = 'upload_' + Date.now() + '_' + Math.floor(Math.random() * 1000000) + ext
          srcEntry.copyTo(tempDir, newName, (newEntry) => {
            const localUrl = (typeof newEntry.toLocalURL === 'function' && newEntry.toLocalURL()) || newEntry.fullPath
            console.log('文件已转换为本地临时文件:', localUrl)
            resolve(localUrl)
          }, (err) => {
            console.error('复制文件到临时目录失败:', JSON.stringify(err))
            resolve(filePath) // 复制失败仍用原路径尝试上传
          })
        }, (err) => {
          console.error('创建上传临时目录失败:', JSON.stringify(err))
          resolve(filePath)
        })
      }, (err) => {
        console.error('访问_doc目录失败:', JSON.stringify(err))
        resolve(filePath)
      })
    }, (err) => {
      console.error('解析文件路径失败:', JSON.stringify(err))
      resolve(filePath) // 解析失败仍用原路径尝试上传
    })
    // #endif
    // #ifndef APP-PLUS
    resolve(filePath)
    // #endif
  })
}

/**
 * 从非200的上传响应中解析后端返回的错误信息
 * @param {Object} res uni.uploadFile的响应对象
 * @param {String} fallback 解析失败时的兜底提示
 * @returns {String} 错误提示信息
 */
function extractUploadErrorMessage(res, fallback) {
  try {
    const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
    if (data && data.message) {
      return data.message
    }
  } catch (e) {
    // 响应不是JSON，忽略
  }
  return fallback
}

/**
 * 处理图片URL，确保格式正确
 * @param {String} url 原始URL
 * @returns {String} 处理后的URL
 */
function processImageUrl(url) {
  if (!url) return url
  
  // 替换反斜杠为正斜杠
  let processedUrl = url.replace(/\\/g, '/')
  
  // 如果URL不是以http或https开头，添加基础URL  http://localhost:8080/static/img/1755013155818_IMG_20190205_105453_20250812233915_82851700.jpg
  if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
	  console.log('如果替换处理后的图片URL:', processedUrl)
    processedUrl = resolveAssetUrl(processedUrl)
	//processedUrl = "http://192.168.0.103:8080"+ processedUrl
  }
  
  console.log('处理后的图片URL:', processedUrl)
  
  
  return processedUrl
}

/**
 * 上传单张图片
 * @param {String} filePath 图片文件路径
 * @returns {Promise} 返回上传结果，包含url
 */
export function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('文件路径不能为空'))
      return
    }
    
    // 获取用户token
    const userStore = useUserStore()
    const token = userStore.token
    
    console.log('准备上传图片:', filePath)
    
    uni.uploadFile({
      url: APP_CONFIG.API_BASE_URL + '/upload/image',
      filePath: filePath,
      name: 'file',
      header: token ? { 'Authorization': `Bearer ${token}` } : {},
      success: (res) => {
        console.log('上传图片响应:', res.statusCode, res.data)
        
        if (res.statusCode !== 200) {
          reject(new Error(extractUploadErrorMessage(res, `上传失败，状态码: ${res.statusCode}`)))
          return
        }
        
            try {
              const data = JSON.parse(res.data)
              // 处理后端返回的不同状态码
              if ((data.code === 0 || data.code === 200) && data.data && data.data.url) {
                // 处理返回的URL路径，确保格式正确
                const url = processImageUrl(data.data.url)
                resolve({ url })
              } else {
                reject(new Error(data.message || '上传失败'))
              }
        } catch (error) {
          console.error('解析上传响应失败:', error, res.data)
          reject(new Error('解析上传响应失败'))
        }
      },
      fail: (error) => {
        console.error('上传图片请求失败:', error)
        reject(error)
      }
    })
  })
}

/**
 * 上传单个PDF文件
 * @param {String} filePath PDF文件路径
 * @returns {Promise} 返回上传结果，包含url
 */
export async function uploadPdf(filePath) {
  if (!filePath) {
    throw new Error('文件路径不能为空')
  }

  // content:// 等第三方文件选择器返回的地址先转成本地临时文件，
  // 确保上传时文件名带 .pdf 扩展名，避免后端校验拒绝(400)
  const finalPath = await ensureLocalFile(filePath, '.pdf')

  return new Promise((resolve, reject) => {
    // 获取用户token
    const userStore = useUserStore()
    const token = userStore.token
    
    console.log('准备上传PDF:', finalPath)
    
    uni.uploadFile({
      url: APP_CONFIG.API_BASE_URL + '/upload/pdf',
      filePath: finalPath,
      name: 'file',
      header: token ? { 'Authorization': `Bearer ${token}` } : {},
      success: (res) => {
        console.log('上传PDF响应:', res.statusCode, res.data)
        
        if (res.statusCode !== 200) {
          reject(new Error(extractUploadErrorMessage(res, `上传失败，状态码: ${res.statusCode}`)))
          return
        }
        
            try {
              const data = JSON.parse(res.data)
              // 处理后端返回的不同状态码
              if ((data.code === 0 || data.code === 200) && data.data && data.data.url) {
                // 处理返回的URL路径，确保格式正确
                const url = processImageUrl(data.data.url)
                resolve({ url })
              } else {
                reject(new Error(data.message || '上传失败'))
              }
        } catch (error) {
          console.error('解析上传响应失败:', error, res.data)
          reject(new Error('解析上传响应失败'))
        }
      },
      fail: (error) => {
        console.error('上传PDF请求失败:', error)
        reject(error)
      }
    })
  })
}

/**
 * 批量上传多个文件
 * @param {Array} filePaths 文件路径数组
 * @returns {Promise} 返回上传结果，包含urls数组
 */
export function uploadMultiple(filePaths) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      reject(new Error('文件列表为空'))
      return
    }
    
    if (filePaths.length > 10) {
      reject(new Error('一次最多上传10个文件'))
      return
    }
    
    // 获取用户token
    const userStore = useUserStore()
    const token = userStore.token
    
    console.log('准备批量上传文件:', filePaths.length, '个文件')
    
    // 创建FormData对象
    const formData = {}
    
    // 添加文件
    filePaths.forEach((path, index) => {
      formData[`files[${index}]`] = path
    })
    
    uni.uploadFile({
      url: APP_CONFIG.API_BASE_URL + '/upload/multiple',
      files: filePaths.map(path => ({
        name: 'files',
        uri: path
      })),
      header: token ? { 'Authorization': `Bearer ${token}` } : {},
      success: (res) => {
        console.log('批量上传响应:', res.statusCode, res.data)
        
        if (res.statusCode !== 200) {
          reject(new Error(`上传失败，状态码: ${res.statusCode}`))
          return
        }
        
          try {
            const data = JSON.parse(res.data)
            if ((data.code === 0 || data.code === 200) && data.data && data.data.urls) {
              // 处理返回的URL路径数组，确保格式正确
              const processedUrls = data.data.urls.map(url => processImageUrl(url))
              resolve({ urls: processedUrls })
            } else {
              reject(new Error(data.message || '上传失败'))
            }
        } catch (error) {
          console.error('解析上传响应失败:', error, res.data)
          reject(new Error('解析上传响应失败'))
        }
      },
      fail: (error) => {
        console.error('批量上传请求失败:', error)
        reject(error)
      }
    })
  })
}

/**
 * 批量上传多个文件（一次一个）
 * @param {Array} filePaths 文件路径数组
 * @returns {Promise} 返回上传结果，包含urls数组
 */
export async function uploadFilesSequentially(filePaths) {
  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return Promise.reject(new Error('文件列表为空'))
  }
  
  if (filePaths.length > 10) {
    return Promise.reject(new Error('一次最多上传10个文件'))
  }
  
  const urls = []
  
  // 获取用户token
  const userStore = useUserStore()
  const token = userStore.token
  
  for (const filePath of filePaths) {
    try {
      // 判断文件类型
      const isPdf = filePath.toLowerCase().split(/[?#]/)[0].endsWith('.pdf')
      const uploadUrl = isPdf 
        ? APP_CONFIG.API_BASE_URL + '/upload/pdf'
        : APP_CONFIG.API_BASE_URL + '/upload/image'
      
      // content:// 等地址先转成本地临时文件，确保文件名扩展名正确
      const finalPath = await ensureLocalFile(filePath, isPdf ? '.pdf' : '.jpg')
      
      console.log('准备上传文件:', finalPath)
      
      // 使用uni.uploadFile上传
      const uploadResult = await new Promise((resolve, reject) => {
        uni.uploadFile({
          url: uploadUrl,
          filePath: finalPath,
          name: 'file',
          header: token ? { 'Authorization': `Bearer ${token}` } : {},
          success: (res) => {
            console.log('上传响应:', res.statusCode, res.data)
            
            if (res.statusCode !== 200) {
              reject(new Error(extractUploadErrorMessage(res, `上传失败，状态码: ${res.statusCode}`)))
              return
            }
            
            try {
              const data = JSON.parse(res.data)
              if ((data.code === 0 || data.code === 200) && data.data && data.data.url) {
                // 处理返回的URL路径，确保格式正确
                const url = processImageUrl(data.data.url)
                resolve({ url })
              } else {
                reject(new Error(data.message || '上传失败'))
              }
            } catch (error) {
              console.error('解析上传响应失败:', error, res.data)
              reject(new Error('解析上传响应失败'))
            }
          },
          fail: (error) => {
            console.error('上传请求失败:', error)
            reject(error)
          }
        })
      })
      
      if (uploadResult && uploadResult.url) {
        urls.push(uploadResult.url)
      }
    } catch (error) {
      console.error('上传文件失败:', filePath, error)
      // 继续上传其他文件
    }
  }
  
  return { urls }
}

/**
 * 上传单个视频文件
 * @param {String} filePath 视频文件路径
 * @returns {Promise} 返回上传结果，包含url
 */
export function uploadVideo(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('文件路径不能为空'))
      return
    }
    
    // 获取用户token
    const userStore = useUserStore()
    const token = userStore.token
    
    console.log('准备上传视频:', filePath)
    
    // 设置上传超时
    const uploadTask = uni.uploadFile({
      url: APP_CONFIG.API_BASE_URL + '/upload/video',
      filePath: filePath,
      name: 'file',
      header: token ? { 'Authorization': `Bearer ${token}` } : {},
      timeout: 120000, // 2分钟超时
      success: (res) => {
        console.log('上传视频响应:', res.statusCode, res.data)
        
        if (res.statusCode !== 200) {
          let errorMsg = extractUploadErrorMessage(res, `上传失败，状态码: ${res.statusCode}`);
          if (res.statusCode === 502) {
            errorMsg = '服务器暂时不可用，请稍后重试';
          } else if (res.statusCode === 413) {
            errorMsg = '视频文件过大';
          } else if (res.statusCode === 408) {
            errorMsg = '上传超时';
          }
          reject(new Error(errorMsg))
          return
        }
        
        try {
          const data = JSON.parse(res.data)
          if ((data.code === 0 || data.code === 200) && data.data && data.data.url) {
            const url = processImageUrl(data.data.url)
            resolve({ url })
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (error) {
          console.error('解析上传响应失败:', error, res.data)
          reject(new Error('解析上传响应失败'))
        }
      },
      fail: (error) => {
        console.error('上传视频请求失败:', error)
        let errorMsg = '上传失败';
        if (error.errMsg) {
          if (error.errMsg.includes('timeout')) {
            errorMsg = '上传超时，请检查网络连接';
          } else if (error.errMsg.includes('network')) {
            errorMsg = '网络连接异常';
          }
        }
        reject(new Error(errorMsg))
      }
    })
  })
}
