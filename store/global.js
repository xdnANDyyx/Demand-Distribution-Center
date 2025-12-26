import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    appLoaded: false,
    isLoading: false,
    loadingText: '加载中...',
    theme: 'light',
    systemInfo: null,
    networkType: 'unknown',
    appConfig: {
      apiBaseUrl: '',
      uploadUrl: '',
      version: '1.0.0'
    }
  }),
  
  actions: {
    initApp() {
      // 获取系统信息
      uni.getSystemInfo({
        success: (res) => {
          this.systemInfo = res
          console.log('系统信息:', res)
        }
      })
      
      // 获取网络状态
      uni.getNetworkType({
        success: (res) => {
          this.networkType = res.networkType
          console.log('网络类型:', res.networkType)
        }
      })
      
      // 监听网络状态变化
      uni.onNetworkStatusChange((res) => {
        this.networkType = res.networkType
        console.log('网络状态变化:', res.networkType)
        
        if (!res.isConnected) {
          uni.showToast({
            title: '网络连接已断开',
            icon: 'none'
          })
        }
      })
      
      // 标记应用已加载
      this.appLoaded = true
    },
    
    showLoading(text = '加载中...') {
      this.isLoading = true
      this.loadingText = text
    },
    
    hideLoading() {
      this.isLoading = false
    },
    
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      // 保存主题设置到本地
      uni.setStorageSync('app_theme', this.theme)
    }
  }
})