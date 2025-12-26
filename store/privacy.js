import { defineStore } from 'pinia'

const PRIVACY_STORAGE_KEY = 'privacy_policy_agreed_v1'

export const usePrivacyStore = defineStore('privacy', {
  state: () => ({
    hasAgreed: false,
    dialogVisible: false,
    deviceIds: {
      oaid: ''
    }
  }),

  actions: {
    bootstrap() {
      const agreed = !!uni.getStorageSync(PRIVACY_STORAGE_KEY)
      this.hasAgreed = agreed
      this.dialogVisible = !agreed
    },

    accept() {
      this.hasAgreed = true
      this.dialogVisible = false
      uni.setStorageSync(PRIVACY_STORAGE_KEY, true)
    },

    reopenDialog() {
      if (!this.hasAgreed) {
        this.dialogVisible = true
      }
    },

    collectOaid() {
      // 严格检查：只有用户明确同意隐私政策后才允许获取OAID
      if (!this.hasAgreed) {
        console.warn('用户未同意隐私政策，禁止获取OAID')
        return
      }
      
      // 检查环境是否支持
      if (typeof plus === 'undefined' || !plus.device || typeof plus.device.getOAID !== 'function') {
        console.log('当前环境不支持获取OAID')
        return
      }

      try {
        plus.device.getOAID(
          (id) => {
            this.deviceIds.oaid = id
            console.log('OAID获取成功')
          },
          (error) => {
            console.warn('获取OAID失败:', error)
          }
        )
      } catch (err) {
        console.warn('调用OAID接口异常:', err)
      }
    }
  }
})

