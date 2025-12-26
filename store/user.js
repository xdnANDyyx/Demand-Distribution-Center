import { defineStore } from 'pinia'
import { post, get,put } from '../utils/request.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null
  }),
  
  getters: {
    hasLogin() {
      return !!this.token && !!this.userInfo
    },
    
    userId() {
      return this.userInfo ? this.userInfo.id : null
    },
    
    userRole() {
      return this.userInfo ? this.userInfo.role : null
    }
  },
  
  actions: {
    // 检查登录状态
    async checkLoginStatus() {
      try {
        const token = uni.getStorageSync('token')
        const userInfo = uni.getStorageSync('userInfo')
        
        if (token && userInfo) {
          // 更新 store 状态
          this.token = token
          this.userInfo = userInfo
          console.log('恢复登录状态:', userInfo)
          
          // 可选：验证token是否有效（如果后端支持）
          // 注释掉验证，避免应用启动时的网络请求延迟
          /*
          try {
            await this.getUserInfo()
          } catch (error) {
            console.warn('Token验证失败，清除登录状态:', error)
            this.logout()
          }
          */
        } else {
          console.log('用户未登录')
          // 确保状态清空
          this.token = ''
          this.userInfo = null
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
        // 出错时清空状态
        this.token = ''
        this.userInfo = null
      }
    },
    
    // 登录
    async login(credentials) {
		console.log("到底有没有执行")
      try {
        const response = await post('/users/login', credentials)
		
        
        // 保存token和用户信息到 store
        this.token = response.token
        this.userInfo = response.user
        
        // 持久化存储
        uni.setStorageSync('token', response.token)
        uni.setStorageSync('userInfo', response.user)
        
        console.log('登录成功:', response.user)
        return response
      } catch (error) {
        console.error('登录失败111:', error)
        throw error
      }
    },
    
    // 注册
    async register(userData) {
      try {
        const response = await post('/users/register', userData)
        
        // 注册成功后自动登录
        this.token = response.token
        this.userInfo = response.user
        
        // 持久化存储
        uni.setStorageSync('token', response.token)
        uni.setStorageSync('userInfo', response.user)
        
        console.log('注册成功:', response.user)
        return response
      } catch (error) {
        console.error('注册失败:', error)
        throw error
      }
    },
    
    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await get('/users/profile')
        this.userInfo = response
        
        // 更新本地存储
        uni.setStorageSync('userInfo', response)
        
        console.log('获取用户信息成功:', response)
        return response
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },
    
    // 更新用户信息
    async updateUserInfo(userData) {
      try {
        const response = await put('/users/profile', userData)
        this.userInfo = response
        
        // 更新本地存储
        uni.setStorageSync('userInfo', response)
        
        console.log('更新用户信息成功:', response)
        return response
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      }
    },
    
    // 登出
    logout() {
      this.token = ''
      this.userInfo = null
      
      // 清除本地存储
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      
      console.log('用户已登出')
    },
    
    // 修改密码
    async changePassword(passwordData) {
      try {
        const response = await post('/users/change-password', passwordData)
        console.log('密码修改成功')
        return response
      } catch (error) {
        console.error('密码修改失败:', error)
        throw error
      }
    },
	
	async getmybidslist(resquestParams){
		try{
			const response = await get('/user/bids',resquestParams)
			
			return response
		}catch(error){
			console.error('获取投标列表失败:', error)
			throw error
		}
	}
  }
})