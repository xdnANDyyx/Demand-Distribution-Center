import { defineStore } from 'pinia'
import { get, post, put } from '../utils/request.js'
import { sendSocketMessage, isSocketConnected } from'../utils/socket.js'
import { syncMessageTabBadge } from '../utils/tabBarBadge.js'
import { 
  getNotifications, 
  markNotificationsAsRead, 
  markAllNotificationsAsRead, 
  getUnreadNotificationCount 
} from '../api/notification.js'

export const useMessageStore = defineStore('message', {
  state: () => ({
    chatList: [],
    notifications: [],
    unreadChatCount: 0,
    unreadNotificationCount: 0
  }),
  
  getters: {
    totalUnreadCount() {
      return this.unreadChatCount + this.unreadNotificationCount
    }
  },
  
  actions: {
    syncTabBarBadge() {
      syncMessageTabBadge(this.totalUnreadCount)
    },

    // 创建或获取聊天会话
    async createChat(targetUserId, options = {}) {
      try {
        const requestData = { 
          target_user_id: targetUserId
        }
        
        // 如果有项目相关信息，添加到请求中
        if (options.projectId) {
          requestData.project_id = Number(options.projectId)
        }
        if (options.bidId) {
          requestData.bid_id = Number(options.bidId)
        }
        
        const res = await post('/chats', requestData)
        
        // 返回聊天会话信息
        return {
          id: res.chat_id || res.id,
          targetUserId: targetUserId,
          ...res
        }
      } catch (error) {
        console.error('创建聊天会话失败:', error)
        throw error
      }
    },

    // 获取聊天列表
    async getChatList() {
      try {
        // 调用实际API获取聊天列表 - 修正API路径
        const data = await get('/chats')

        console.log('========== 聊天列表数据 ==========')
        console.log('原始数据:', data)
        if (Array.isArray(data)) {
          data.forEach((chat, index) => {
            console.log(`聊天${index + 1}:`, {
              id: chat.id,
              project_id: chat.project_id,
              bid_id: chat.bid_id,
              target_user: chat.target_user
            })
          })
        }
        console.log('================================')

        this.setChatList(Array.isArray(data) ? data : [])
        this.updateUnreadChatCount()

        return data
      } catch (error) {
        console.error('获取聊天列表失败:', error)
        throw error
      }
    },
    
// 获取通知列表
async getNotifications(params = { page: 1, size: 20 }) {
  try {
    // 使用新的通知API获取通知列表
    const response = await getNotifications(params)
    
    console.log('获取通知列表成功:', response)
    
    // 检查响应格式并提取数据
    let notificationData = []
    if (response && response.list) {
      // 直接从响应中获取list属性
      notificationData = response.list || []
    } else if (response && response.code === 0 && response.data) {
      // 兼容旧格式
      notificationData = response.data.list || []
    } else if (Array.isArray(response)) {
      // 如果响应本身就是数组
      notificationData = response
    }
    
    console.log('提取的通知数据:', notificationData)
    this.setNotifications(notificationData)
    this.updateUnreadNotificationCount()
    
    return notificationData
  } catch (error) {
    console.error('获取通知列表失败:', error)
    throw error
  }
},
    
    // 获取聊天记录
    async getChatMessages(chatId, beforeId = null) {
      try {
        let url = `/chats/${chatId}/messages`
        if (beforeId) {
          url += `?before_id=${beforeId}`
        }
        const res = await get(url)
        return res
      } catch (error) {
        console.error('获取聊天记录失败:', error)
        throw error
      }
    },
    
    // 发送消息
    async sendMessage(chatId, messageData) {
      try {
        // 导入WebSocket发送函数
        
        
        console.log('发送消息到聊天:', chatId, messageData)
        
        // 优先使用WebSocket发送消息
        if (isSocketConnected()) {
          console.log('使用WebSocket发送消息')
          
          const socketMessage = {
            type: 'send_message',
            data: {
              chat_id: chatId,
              content: messageData.content,
              content_type: messageData.content_type || 0
            }
          }
          console.log("发送了什么消息？",socketMessage)
          const success = sendSocketMessage(socketMessage)
          
          if (success) {
            console.log('WebSocket消息发送成功')
            // WebSocket发送成功，返回模拟响应
            return {
              id: Date.now(),
              chat_id: chatId,
              ...messageData,
              created_at: new Date().toISOString()
            }
          } else {
            console.warn('WebSocket发送失败，回退到HTTP请求')
          }
        } else {
          console.warn('WebSocket未连接，使用HTTP请求发送消息')
        }
        
        // WebSocket不可用时，回退到HTTP请求
        const res = await post(`/chats/${chatId}/messages`, messageData)
        console.log('HTTP消息发送成功:', res)
        
        // 可以在这里更新chatList的last_message等信息
        return res
      } catch (error) {
        console.error('发送消息失败:', error)
        throw error
      }
    },
    
    // 标记消息为已读
    async readMessage(userId) {
      try {
        // 调用实际API标记消息为已读
        const result = await post(`/messages/read/${userId}`)
        
        // 更新聊天列表中的未读数
        const chatList = [...this.chatList]
        const chatIndex = chatList.findIndex(chat => chat.user_id === userId)
        
        if (chatIndex !== -1) {
          chatList[chatIndex].unread_count = 0
          this.setChatList(chatList)
          this.updateUnreadChatCount()
        }
        
        return result
      } catch (error) {
        console.error('标记消息已读失败:', error)
        throw error
      }
    },
    
    // 标记通知为已读
    async readNotification(notificationIds) {
      try {
        // 确保notificationIds是数组
        const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds]
        
        // 调用新的通知API标记通知为已读
        const result = await markNotificationsAsRead(ids)
        
        // 更新通知列表中的已读状态
        const notifications = [...this.notifications]
        ids.forEach(id => {
          const notificationIndex = notifications.findIndex(notification => notification.id === id)
          if (notificationIndex !== -1) {
            notifications[notificationIndex].is_read = true
          }
        })
        
        this.setNotifications(notifications)
        this.updateUnreadNotificationCount()
        
        return result
      } catch (error) {
        console.error('标记通知已读失败:', error)
        throw error
      }
    },
    
    // 标记所有通知为已读
    async readAllNotifications() {
      try {
        // 调用新的通知API标记所有通知为已读
        const result = await markAllNotificationsAsRead()
        
        // 更新所有通知为已读
        const notifications = this.notifications.map(notification => ({
          ...notification,
          is_read: true
        }))
        
        this.setNotifications(notifications)
        this.updateUnreadNotificationCount()
        
        return result
      } catch (error) {
        console.error('标记所有通知已读失败:', error)
        throw error
      }
    },
    
    // 获取未读通知数量
    async fetchUnreadNotificationCount() {
      try {
        // 调用新的通知API获取未读通知数量
        const response = await getUnreadNotificationCount()
        
        // 检查响应格式并提取数据
        let count = 0
        if (response && response.code === 0 && response.data) {
          count = response.data.count || 0
        } else if (typeof response === 'number') {
          count = response
        } else if (response && typeof response.count === 'number') {
          count = response.count
        }
        
        this.unreadNotificationCount = count
        this.syncTabBarBadge()
        return count
      } catch (error) {
        console.error('获取未读通知数量失败:', error)
        return 0
      }
    },
    
    // 处理新消息（WebSocket推送）
    updateChatWithNewMessage(data) {
      const { chat_id, message } = data
      
      // 更新聊天列表中的最后消息
      const chatList = [...this.chatList]
      const chatIndex = chatList.findIndex(chat => chat.id === chat_id)
      
      if (chatIndex !== -1) {
        // 更新现有聊天
        chatList[chatIndex] = {
          ...chatList[chatIndex],
          last_message: message.content,
          last_time: message.created_at,
          unread_count: (chatList[chatIndex].unread_count || 0) + 1
        }
        
        // 将有新消息的聊天移到顶部
        const updatedChat = chatList.splice(chatIndex, 1)[0]
        chatList.unshift(updatedChat)
      } else {
        // 如果聊天不在列表中，可能需要获取聊天详情
        // 这里简单处理，创建一个新的聊天项
        chatList.unshift({
          id: chat_id,
          target_user: {
            id: message.sender_id,
            username: `用户${message.sender_id}`,
            avatar: ''
          },
          last_message: message.content,
          last_time: message.created_at,
          unread_count: 1
        })
      }
      
      this.setChatList(chatList)
      this.updateUnreadChatCount()
    },
    
    // 处理新通知（WebSocket推送）
    addNotification(notification) {
      // 检查通知是否已存在
      const existingIndex = this.notifications.findIndex(n => n.id === notification.id)
      
      if (existingIndex === -1) {
        // 添加到通知列表顶部
        const notifications = [notification, ...this.notifications]
        this.setNotifications(notifications)
        this.updateUnreadNotificationCount()
      }
    },
    
    // 更新聊天列表
    updateChatList(userId, lastMessage) {
      const chatList = [...this.chatList]
      const chatIndex = chatList.findIndex(chat => chat.user_id === userId)
      
      if (chatIndex !== -1) {
        // 更新现有聊天
        chatList[chatIndex] = {
          ...chatList[chatIndex],
          last_message: lastMessage,
          last_time: new Date().toISOString()
        }
      } else {
        // 添加新聊天
        chatList.unshift({
          id: Date.now(),
          user_id: userId,
          username: `用户${userId}`,
          avatar: 'https://via.placeholder.com/100',
          last_message: lastMessage,
          last_time: new Date().toISOString(),
          unread_count: 0
        })
      }
      
      // 按最后消息时间排序
      chatList.sort((a, b) => new Date(b.last_time) - new Date(a.last_time))
      
      this.setChatList(chatList)
    },
    
    // 设置聊天列表
    markChatAsRead(chatId) {
      const chatList = [...this.chatList]
      const chatIndex = chatList.findIndex(chat => Number(chat.id) === Number(chatId))

      if (chatIndex === -1 || (chatList[chatIndex].unread_count || 0) === 0) {
        return
      }

      chatList[chatIndex] = {
        ...chatList[chatIndex],
        unread_count: 0
      }

      this.setChatList(chatList)
      this.updateUnreadChatCount()
    },
    
    setChatList(chatList) {
      this.chatList = chatList
      this.syncTabBarBadge()
    },
    
    // 设置通知列表
    setNotifications(notifications) {
      this.notifications = notifications
      this.syncTabBarBadge()
    },
    
    // 更新未读聊天数
    updateUnreadChatCount() {
      this.unreadChatCount = this.chatList.reduce((count, chat) => count + (chat.unread_count || 0), 0)
      this.syncTabBarBadge()
    },
    
    // 更新未读通知数
    updateUnreadNotificationCount() {
      this.unreadNotificationCount = this.notifications.filter(notification => !notification.is_read).length
      this.syncTabBarBadge()
    }
  }
})
