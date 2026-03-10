import { useUserStore } from '../store/user.js'
import { useMessageStore } from '../store/message.js'
import { useProjectStore } from '../store/project.js'
import { WS_CONFIG } from '../config/index.js'
import { triggerNotification } from '../utils/notificationUtils.js'

let socket = null
let reconnectTimer = null
let heartbeatTimer = null
let reconnectCount = 0
let isConnecting = false
const maxReconnectCount = 5
const reconnectInterval = 5000
const heartbeatInterval = 30000

// WebSocket连接状态常量
export const SOCKET_STATUS = {
  CONNECTING: 0, // 连接中
  OPEN: 1,      // 已连接
  CLOSING: 2,    // 关闭中
  CLOSED: 3      // 已关闭
}

// 详细日志打印函数
const log = (level, message, data = null) => {
  const timestamp = new Date().toLocaleTimeString()
  const prefix = `[WebSocket ${timestamp}]`
  
  switch (level) {
    case 'info':
      console.log(`${prefix} ℹ️ ${message}`, data || '')
      break
    case 'warn':
      console.warn(`${prefix} ⚠️ ${message}`, data || '')
      break
    case 'error':
      console.error(`${prefix} ❌ ${message}`, data || '')
      break
    case 'success':
      console.log(`${prefix} ✅ ${message}`, data || '')
      break
    default:
      console.log(`${prefix} ${message}`, data || '')
  }
}

// 初始化WebSocket连接
export const connectWebSocket = (token) => {
  return new Promise((resolve, reject) => {
    log('info', '开始初始化WebSocket连接')
    
    // 检查uni-app环境下的WebSocket支持
    if (typeof uni === 'undefined' || !uni.connectSocket) {
      log('error', 'uni-app WebSocket API不可用')
      reject(new Error('uni-app WebSocket API不可用'))
      return
    }
    
    // 检查token
    if (!token) {
      log('warn', '用户未登录，无法建立WebSocket连接')
      reject(new Error('用户未登录，无法建立WebSocket连接'))
      return
    }
    
    log('info', '用户已登录，准备建立WebSocket连接')
    
    // 检查是否正在连接
    if (isConnecting) {
      log('warn', 'WebSocket正在连接中，跳过重复连接')
      reject(new Error('WebSocket正在连接中'))
      return
    }
    
    // 如果已有连接且状态正常，直接返回
    if (socket && socket.readyState === SOCKET_STATUS.OPEN) {
      log('info', 'WebSocket已连接，无需重复连接')
      resolve(socket)
      return
    }
    
    // 如果有旧连接，先关闭
    if (socket) {
      log('info', '关闭旧的WebSocket连接')
      disconnectWebSocket()
    }
    
    try {
      isConnecting = true
      
      // 检查配置
      if (!WS_CONFIG || !WS_CONFIG.URL) {
        log('error', 'WebSocket配置不完整', { config: WS_CONFIG })
        isConnecting = false
        reject(new Error('WebSocket配置不完整'))
        return
      }
      
      // 构建WebSocket URL
      const wsUrl = `${WS_CONFIG.URL}?token=${encodeURIComponent(token)}`
      log('info', '正在连接WebSocket服务器', {
        url: wsUrl.replace(/token=[^&]+/, 'token=***')
      })
      
      // 创建socket对象
      socket = {
        readyState: SOCKET_STATUS.CONNECTING,
        socketTask: null,
        send: function(data) {
          if (this.socketTask) {
            this.socketTask.send({
              data: data,
              success: () => {
                log('info', 'WebSocket消息发送成功')
              },
              fail: (error) => {
                log('error', 'WebSocket消息发送失败', error)
              }
            })
          } else {
            log('error', '无法发送消息，socketTask不存在')
          }
        },
        close: function(code, reason) {
          if (this.socketTask) {
            this.socketTask.close({
              code: code || 1000,
              reason: reason || '主动关闭',
              success: () => {
                log('info', 'WebSocket连接关闭成功')
              },
              fail: (error) => {
                log('error', 'WebSocket连接关闭失败', error)
              }
            })
          }
        }
      }
      
      // 使用uni.connectSocket创建连接并获取socketTask
      socket.socketTask = uni.connectSocket({
        url: wsUrl,
        complete: () => {}
      })
      
      // 使用socketTask的方法监听事件
      if (socket.socketTask) {
        // 监听WebSocket连接打开事件
        socket.socketTask.onOpen(() => {
          socket.readyState = SOCKET_STATUS.OPEN
          isConnecting = false
          reconnectCount = 0
          
          log('success', 'WebSocket连接成功建立')
          
          // 清除重连定时器
          if (reconnectTimer) {
            clearTimeout(reconnectTimer)
            reconnectTimer = null
          }
          
          // 启动心跳
          startHeartbeat()
          
          // 连接成功后的处理
          handleConnectionSuccess()
          
          // 解析Promise
          resolve(socket)
        })
        
        // 监听WebSocket接收到服务器的消息事件
        socket.socketTask.onMessage((res) => {
          try {
            const data = JSON.parse(res.data)
            log('info', '收到WebSocket消息', {
              type: data.type,
              dataSize: res.data.length
            })
            
            handleMessage(data)
          } catch (error) {
            log('error', 'WebSocket消息解析失败', {
              error: error.message,
              rawData: res.data
            })
          }
        })
        
        // 监听WebSocket连接关闭事件
        socket.socketTask.onClose((res) => {
          socket.readyState = SOCKET_STATUS.CLOSED
          isConnecting = false
          
          log('warn', 'WebSocket连接关闭', {
            code: res.code,
            reason: res.reason,
            reconnectCount: reconnectCount
          })
          
          // 停止心跳
          stopHeartbeat()
          
          // 如果未达到最大重连次数，则自动重连
          if (reconnectCount < maxReconnectCount) {
            log('info', `准备进行第${reconnectCount + 1}次重连`)
            
            reconnectTimer = setTimeout(() => {
              reconnectCount++
              log('info', `开始第${reconnectCount}次重连`)
              connectWebSocket(token).catch(err => {
                log('error', '重连失败', err)
              })
            }, reconnectInterval)
          } else if (reconnectCount >= maxReconnectCount) {
            log('error', '已达到最大重连次数，停止重连')
          }
        })
        
        // 监听WebSocket错误事件
        socket.socketTask.onError((error) => {
          socket.readyState = SOCKET_STATUS.CLOSED
          isConnecting = false
          
          log('error', 'WebSocket连接发生错误', error)
          
          // 拒绝Promise
          reject(error)
        })
      } else {
        log('error', '无法设置WebSocket事件监听，socketTask不存在')
        isConnecting = false
        reject(new Error('无法设置WebSocket事件监听'))
        return
      }
      
      // 设置连接超时
      setTimeout(() => {
        if (socket && socket.readyState === SOCKET_STATUS.CONNECTING) {
          log('error', 'WebSocket连接超时')
          disconnectWebSocket()
          reject(new Error('WebSocket连接超时'))
        }
      }, WS_CONFIG.CONNECTION_TIMEOUT || 10000)
      
    } catch (error) {
      isConnecting = false
      log('error', 'WebSocket初始化失败', {
        error: error.message,
        stack: error.stack
      })
      reject(error)
    }
  })
}

// 启动心跳
const startHeartbeat = () => {
  log('info', '启动WebSocket心跳')
  
  heartbeatTimer = setInterval(() => {
    if (socket && socket.readyState === SOCKET_STATUS.OPEN) {
      const heartbeatMsg = {
        type: 'heartbeat',
        timestamp: Date.now()
      }
      
      socket.send(JSON.stringify(heartbeatMsg))
      log('info', '发送心跳包')
    } else {
      log('warn', '心跳检测发现连接异常，停止心跳')
      stopHeartbeat()
    }
  }, heartbeatInterval)
}

// 停止心跳
const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
    log('info', '停止WebSocket心跳')
  }
}

// 连接成功后的处理
const handleConnectionSuccess = () => {
  log('info', '处理WebSocket连接成功事件')
  
  // 发送用户上线消息
  const userStore = useUserStore()
  if (userStore.userInfo) {
    sendSocketMessage({
      type: 'user_online',
      data: {
        user_id: userStore.userInfo.id,
        username: userStore.userInfo.username
      }
    })
  }
  
  // 请求离线消息
  sendSocketMessage({
    type: 'get_offline_messages',
    data: {}
  })
}

// 消息处理回调函数
let messageCallbacks = [];

// 注册新消息监听器
export const onNewMessage = (callback) => {
  if (callback === null) {
    // 移除所有回调
    messageCallbacks = [];
  } else if (typeof callback === 'function') {
    // 添加回调
    messageCallbacks.push(callback);
  }
};

// 处理WebSocket消息
const handleMessage = (data) => {
  log('info', `处理消息类型: ${data.type}`)
  
  const messageStore = useMessageStore()
  const projectStore = useProjectStore()
  
  switch (data.type) {
    case 'message':
      log('info', '处理聊天消息')
      handleChatMessage(data.data)
      break
      
    case 'notification':
      log('info', '处理通知消息')
      handleNotification(data.data)
      break
      
    case 'status':
      log('info', '处理状态更新')
      handleStatusUpdate(data.data)
      break
      
    case 'system':
      log('info', '处理系统消息')
      handleSystemMessage(data.data)
      break
      
    case 'heartbeat_response':
      log('info', '收到心跳响应')
      break
      
    default:
      log('warn', '收到未知消息类型', {
        type: data.type
      })
  }
}

// 处理聊天消息
const handleChatMessage = (data) => {
  log('info', '处理聊天消息', {
    chatId: data.chat_id,
    senderId: data.message.sender_id,
    content: data.message.content
  })
  
  const messageStore = useMessageStore()
  
  // 更新消息store
  messageStore.updateChatWithNewMessage(data)
  
  const currentUserId = uni.getStorageSync('userInfo')?.id
  const isIncomingMessage = data.message.sender_id !== currentUserId
  if (isIncomingMessage) {
    triggerNotification('new_message')
  }
  
  // 调用所有注册的消息回调
  log('info', `准备调用${messageCallbacks.length}个消息回调`);
  messageCallbacks.forEach(callback => {
    try {
      log('info', '调用消息回调');
      callback(data);
    } catch (error) {
      log('error', '执行消息回调时出错', error);
    }
  });
  
  // 如果当前不在对应的聊天页面，显示通知
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    const currentRoute = currentPage.route
    
    // 检查是否在对应的聊天页面
    const isInCurrentChat = currentRoute.includes('messages/chat') && 
                           currentPage.options?.id == data.chat_id
    
    if (isIncomingMessage && !isInCurrentChat) {
      // 显示新消息通知
      uni.showToast({
        title: '收到新消息',
        icon: 'none',
        duration: 2000
      })
      
      // 使用统一的通知函数触发震动和声音提醒
      triggerNotification('new_message')
    }
  }
}

// 处理通知消息
const handleNotification = (data) => {
  log('info', '处理通知消息', {
    type: data.type,
    title: data.title
  })
  
  const messageStore = useMessageStore()
  
  // 更新通知store
  messageStore.addNotification(data)
  
  // 根据通知类型确定消息类型
  let messageType = 'default'
  if (data.type === 'bid') {
    messageType = 'new_bid'
  } else if (data.type === 'project') {
    messageType = 'project_update'
  }
  
  // 触发震动和声音提醒
  triggerNotification(messageType)
  
  // 显示通知
  uni.showToast({
    title: data.title || '收到新通知',
    icon: 'none',
    duration: 2000
  })
}

// 处理状态更新
const handleStatusUpdate = (data) => {
  const { event_type, id, status } = data
  
  log('info', '处理状态更新', {
    event_type,
    id,
    status
  })
  
  switch (event_type) {
    case 'project_update':
      log('info', `项目${id}状态更新为${status}`)
      handleProjectStatusUpdate(id, status)
      break
      
    case 'bid_update':
      log('info', `投标${id}状态更新为${status}`)
      handleBidStatusUpdate(id, status)
      break
      
    case 'order_update':
      log('info', `订单${id}状态更新为${status}`)
      handleOrderStatusUpdate(id, status)
      break
      
    default:
      log('warn', '未知的状态更新类型', { event_type })
  }
}

// 处理项目状态更新
const handleProjectStatusUpdate = (projectId, status) => {
  const projectStore = useProjectStore()
  
  // 更新项目状态
  if (projectStore.currentProject?.id === projectId) {
    projectStore.updateProjectStatus(projectId, status)
  }
  
  // 显示状态更新通知
  const statusText = getProjectStatusText(status)
  uni.showToast({
    title: `项目状态: ${statusText}`,
    icon: 'none',
    duration: 2000
  })
}

// 处理投标状态更新
const handleBidStatusUpdate = (bidId, status) => {
  // 根据状态确定消息类型
  let messageType = 'project_update'
  if (status === 2) { // 已接受
    messageType = 'bid_accepted'
  } else if (status === 3) { // 已中标
    messageType = 'bid_won'
  }
  
  // 触发震动和声音提醒
  triggerNotification(messageType)
  
  // 显示投标状态更新通知
  const statusText = getBidStatusText(status)
  uni.showToast({
    title: `投标状态: ${statusText}`,
    icon: 'none',
    duration: 2000
  })
}

// 处理订单状态更新
const handleOrderStatusUpdate = (orderId, status) => {
  // 显示订单状态更新通知
  const statusText = getOrderStatusText(status)
  uni.showToast({
    title: `订单状态: ${statusText}`,
    icon: 'none',
    duration: 2000
  })
}

// 处理系统消息
const handleSystemMessage = (data) => {
  log('info', '处理系统消息')
  
  if (data.message) {
    uni.showToast({
      title: data.message,
      icon: 'none',
      duration: 2000
    })
  }
}

// 获取项目状态文本
const getProjectStatusText = (status) => {
  const statusMap = {
    0: '招标中',
    1: '已选标',
    2: '进行中',
    3: '已完成',
    4: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取投标状态文本
const getBidStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已拒绝',
    2: '已接受',
    3: '已中标',
    4: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '进行中',
    2: '待验收',
    3: '已完成',
    4: '已取消',
    5: '已退款'
  }
  return statusMap[status] || '未知状态'
}

// 发送消息到WebSocket
export const sendSocketMessage = (message) => {
  if (socket && socket.readyState === SOCKET_STATUS.OPEN) {
    const messageStr = JSON.stringify(message)
    socket.send(messageStr)
    
    log('info', '发送WebSocket消息', {
      type: message.type
    })
    
    return true
  } else {
    log('error', 'WebSocket未连接，无法发送消息', {
      socketExists: !!socket,
      readyState: socket?.readyState
    })
    
    return false
  }
}

// 关闭WebSocket连接
export const disconnectWebSocket = () => {
  log('info', '主动关闭WebSocket连接')
  
  if (socket) {
    if (socket.socketTask) {
      socket.socketTask.close({
        code: 1000,
        reason: '主动断开',
        success: () => {
          log('success', 'WebSocket连接关闭成功')
        },
        fail: (error) => {
          log('error', 'WebSocket连接关闭失败', error)
        }
      })
    }
    
    socket = null
  }
  
  // 停止心跳
  stopHeartbeat()
  
  // 清除重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  
  reconnectCount = 0
  isConnecting = false
  
  log('success', 'WebSocket连接已关闭')
}

// 获取WebSocket连接状态
export const getSocketStatus = () => {
  return socket ? socket.readyState : SOCKET_STATUS.CLOSED
}

// 检查WebSocket是否已连接
export const isSocketConnected = () => {
  return socket && socket.readyState === SOCKET_STATUS.OPEN
}

// 加入聊天房间
export const joinChatRoom = (chatId) => {
  log('info', '加入聊天房间', { chatId })
  
  return sendSocketMessage({
    type: 'join_chat',
    data: { chat_id: chatId }
  })
}

// 离开聊天房间
export const leaveChatRoom = (chatId) => {
  log('info', '离开聊天房间', { chatId })
  
  return sendSocketMessage({
    type: 'leave_chat',
    data: { chat_id: chatId }
  })
}

// 标记消息已读
export const markMessagesRead = (chatId) => {
  log('info', '标记消息已读', { chatId })
  
  return sendSocketMessage({
    type: 'mark_read',
    data: { chat_id: chatId }
  })
}

export default {
  connectWebSocket,
  disconnectWebSocket,
  sendSocketMessage,
  joinChatRoom,
  leaveChatRoom,
  markMessagesRead,
  isSocketConnected,
  getSocketStatus,
  onNewMessage
}
