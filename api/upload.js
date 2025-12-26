import { APP_CONFIG } from '../config/index.js'
import { useUserStore } from '../store/user.js'

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
    processedUrl = "http://115.190.38.218" +"/api"+ processedUrl
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
          reject(new Error(`上传失败，状态码: ${res.statusCode}`))
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
export function uploadPdf(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('文件路径不能为空'))
      return
    }
    
    // 获取用户token
    const userStore = useUserStore()
    const token = userStore.token
    
    console.log('准备上传PDF:', filePath)
    
    uni.uploadFile({
      url: APP_CONFIG.API_BASE_URL + '/upload/pdf',
      filePath: filePath,
      name: 'file',
      header: token ? { 'Authorization': `Bearer ${token}` } : {},
      success: (res) => {
        console.log('上传PDF响应:', res.statusCode, res.data)
        
        if (res.statusCode !== 200) {
          reject(new Error(`上传失败，状态码: ${res.statusCode}`))
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
      console.log('准备上传文件:', filePath)
      
      // 判断文件类型
      const isPdf = filePath.toLowerCase().endsWith('.pdf')
      const uploadUrl = isPdf 
        ? APP_CONFIG.API_BASE_URL + '/upload/pdf'
        : APP_CONFIG.API_BASE_URL + '/upload/image'
      
      // 使用uni.uploadFile上传
      const uploadResult = await new Promise((resolve, reject) => {
        uni.uploadFile({
          url: uploadUrl,
          filePath: filePath,
          name: 'file',
          header: token ? { 'Authorization': `Bearer ${token}` } : {},
          success: (res) => {
            console.log('上传响应:', res.statusCode, res.data)
            
            if (res.statusCode !== 200) {
              reject(new Error(`上传失败，状态码: ${res.statusCode}`))
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
          let errorMsg = `上传失败，状态码: ${res.statusCode}`;
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
