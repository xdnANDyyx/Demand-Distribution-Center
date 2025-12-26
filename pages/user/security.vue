<template>
  <view class="security-page">
    <view class="header">
      <button class="back-btn" @tap="goBack">
        <image src="/static/icons/arrow_left.png" class="back-icon" />
      </button>
      <view class="page-title">账号安全</view>
      <view class="header-right"></view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="section">
        <view class="section-title">登录保护</view>
        <view class="section-item">
          <view>
            <view class="item-title">最近登录设备</view>
            <view class="item-desc">{{ deviceInfo }}</view>
          </view>
          <button class="link-btn" @tap="refreshDeviceInfo">刷新</button>
        </view>
        <view class="section-item">
          <view>
            <view class="item-title">登录提醒</view>
            <view class="item-desc">异地登录时发送消息提醒</view>
          </view>
          <switch :checked="loginAlert" @change="toggleLoginAlert" color="#4dabf7" />
        </view>
      </view>

      <view class="section">
        <view class="section-title">修改密码</view>
        <view class="form-item">
          <text class="form-label">当前密码</text>
          <input class="form-input" type="password" v-model="passwordForm.currentPassword" placeholder="请输入当前密码" />
        </view>
        <view class="form-item">
          <text class="form-label">新密码</text>
          <input
            class="form-input"
            type="password"
            v-model="passwordForm.newPassword"
            placeholder="至少 8 位，需包含数字和字母"
          />
        </view>
        <view class="form-item">
          <text class="form-label">确认新密码</text>
          <input class="form-input" type="password" v-model="passwordForm.confirmPassword" placeholder="再次输入新密码" />
        </view>
        <button class="primary-btn" @tap="handleChangePassword">保存并更新密码</button>
      </view>

      <view class="section danger">
        <view class="section-title">风险操作</view>
        <view class="section-item">
          <view>
            <view class="item-title">账号注销</view>
            <view class="item-desc">注销后账号数据将无法恢复</view>
          </view>
          <button class="danger-btn" @tap="goToAccountCancel">去注销</button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user.js'

const userStore = useUserStore()

const loginAlert = ref(true)
const deviceInfo = ref('正在获取...')
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const goBack = () => {
  uni.navigateBack()
}

const refreshDeviceInfo = () => {
  const info = userStore.userInfo
  const systemInfo = uni.getSystemInfoSync()
  deviceInfo.value = `${systemInfo.brand || '未知设备'} · ${systemInfo.system}`

  if (info?.last_login_ip) {
    deviceInfo.value += ` · IP ${info.last_login_ip}`
  }
}

const toggleLoginAlert = (e) => {
  loginAlert.value = e.detail.value
  uni.showToast({
    title: loginAlert.value ? '登录提醒已开启' : '登录提醒已关闭',
    icon: 'none'
  })
}

const validatePasswordStrength = (value) => {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()_+\-={}[\]|;:'",.<>/?]{8,32}$/.test(value)
}

const handleChangePassword = async () => {
  if (!passwordForm.value.currentPassword) {
    uni.showToast({ title: '请输入当前密码', icon: 'none' })
    return
  }

  if (!validatePasswordStrength(passwordForm.value.newPassword)) {
    uni.showToast({ title: '新密码需8-32位并包含字母和数字', icon: 'none' })
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    uni.showToast({ title: '两次输入的新密码不一致', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '提交中...' })
    await userStore.changePassword({
      old_password: passwordForm.value.currentPassword,
      new_password: passwordForm.value.newPassword
    })
    uni.hideLoading()
    uni.showToast({ title: '密码修改成功', icon: 'success' })
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error.message || '修改失败，请重试', icon: 'none' })
  }
}

const goToAccountCancel = () => {
  uni.navigateTo({ url: '/pages/user/account-cancel' })
}

onShow(() => {
  if (!userStore.token) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  refreshDeviceInfo()
})
</script>

<style scoped>
.security-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  padding-bottom: 40rpx;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 32rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.back-icon {
  width: 32rpx;
  height: 32rpx;
  filter: brightness(0) invert(1);
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  flex: 1;
  text-align: center;
  margin: 0 80rpx;
}

.header-right {
  width: 60rpx;
}

.content {
  padding: 32rpx;
  height: calc(100vh - 120rpx);
}

.section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

.section.danger {
  border: 1px solid rgba(255, 99, 132, 0.5);
  background: rgba(255, 99, 132, 0.15);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
}

.section-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.section-item:last-child {
  border-bottom: none;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
}

.item-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  margin-bottom: 12rpx;
  color: rgba(255, 255, 255, 0.9);
}

.form-input {
  width: 100%;
  height: 88rpx;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}

.primary-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  margin-top: 16rpx;
  border: none;
}

.link-btn {
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: transparent;
  color: #fff;
  font-size: 24rpx;
}

.danger-btn {
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  background: rgba(255, 82, 82, 0.2);
  border: 1px solid rgba(255, 82, 82, 0.6);
  color: #ffe0e3;
  font-size: 24rpx;
}
</style>

