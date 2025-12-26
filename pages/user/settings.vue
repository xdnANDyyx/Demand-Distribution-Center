<template>
  <view class="settings-page">
    <view class="header">
          <button class="back-btn" @click="goBack">
            <!-- 🎯 修改：使用图片作为返回按钮 -->
            <image src="/static/icons/arrow_left.png" class="back-icon"></image>
          </button>
          <view class="page-title">设置</view>
          <view class="header-right"></view>
        </view>
    
    <view class="content-container">
      <!-- 账号设置 -->
      <view class="settings-section">
        <view class="section-title">账号设置</view>
        
        <view class="settings-item" @click="goToProfile">
          <view class="item-left">
            <text class="iconfont icon-user"></text>
            <text class="item-text">个人资料</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        
        <view class="settings-item" @click="goToSecurity">
          <view class="item-left">
            <text class="iconfont icon-lock"></text>
            <text class="item-text">账号安全</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        
        <view class="settings-item" @click="goToVerify" v-if="!user?.is_verified">
          <view class="item-left">
            <text class="iconfont icon-shield"></text>
            <text class="item-text">实名认证</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
      
      <!-- 通知设置 -->
      <view class="settings-section">
        <view class="section-title">通知设置</view>
        
        <view class="settings-item">
          <view class="item-left">
            <text class="iconfont icon-bell"></text>
            <text class="item-text">消息通知</text>
          </view>
          <switch :checked="notificationSettings.message" @change="toggleSetting('message')" color="#4dabf7" />
        </view>
        
        <view class="settings-item">
          <view class="item-left">
            <text class="iconfont icon-mail"></text>
            <text class="item-text">邮件通知</text>
          </view>
          <switch :checked="notificationSettings.email" @change="toggleSetting('email')" color="#4dabf7" />
        </view>
        
        <view class="settings-item">
          <view class="item-left">
            <text class="iconfont icon-mobile"></text>
            <text class="item-text">短信通知</text>
          </view>
          <switch :checked="notificationSettings.sms" @change="toggleSetting('sms')" color="#4dabf7" />
        </view>
      </view>
      
      <!-- 隐私设置 -->
      <view class="settings-section">
        <view class="section-title">隐私设置</view>
        
        <view class="settings-item">
          <view class="item-left">
            <text class="iconfont icon-eye"></text>
            <text class="item-text">个人资料可见性</text>
          </view>
          <picker 
            @change="handlePrivacyChange" 
            :value="privacyIndex" 
            :range="privacyOptions"
            class="privacy-picker"
          >
            <view class="picker-value">
              {{ privacyOptions[privacyIndex] }}
              <text class="item-arrow">›</text>
            </view>
          </picker>
        </view>
        
        <view class="settings-item">
          <view class="item-left">
            <text class="iconfont icon-location"></text>
            <text class="item-text">位置信息</text>
          </view>
          <switch :checked="privacySettings.location" @change="togglePrivacy('location')" color="#4dabf7" />
        </view>
      </view>
      
      <!-- 其他设置 -->
      <view class="settings-section">
        <view class="section-title">其他设置</view>
        
        <view class="settings-item" @click="clearCache">
          <view class="item-left">
            <text class="iconfont icon-delete"></text>
            <text class="item-text">清除缓存</text>
          </view>
          <text class="cache-size">{{ cacheSize }}</text>
        </view>
        
        <view class="settings-item" @click="goToAbout">
          <view class="item-left">
            <text class="iconfont icon-info-circle"></text>
            <text class="item-text">关于我们</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
        
        <view class="settings-item" @click="goToFeedback">
          <view class="item-left">
            <text class="iconfont icon-message"></text>
            <text class="item-text">意见反馈</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
      
      <!-- 退出登录 -->
      <button class="logout-btn" @click="handleLogout">退出登录</button>
      
      <!-- 版本信息 -->
      <view class="version-info">
        <text>当前版本: v1.0.0</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user.js'

const userStore = useUserStore()

// 用户信息
const user = computed(() => userStore.userInfo)

// 通知设置
const notificationSettings = ref({
  message: true,
  email: false,
  sms: true
})

// 隐私设置
const privacySettings = ref({
  location: false
})

// 隐私选项
const privacyOptions = ['所有人可见', '仅好友可见', '仅自己可见']
const privacyIndex = ref(1)

// 缓存大小
const cacheSize = ref('2.5MB')

// 页面加载时获取用户设置
onMounted(async () => {
  if (userStore.token) {
    await userStore.getUserInfo()
    
    // 获取用户设置
    try {
      // 模拟从服务器获取设置
      // 实际项目中应该调用API获取用户设置
      setTimeout(() => {
        // 模拟数据
        notificationSettings.value = {
          message: true,
          email: false,
          sms: true
        }
        
        privacySettings.value = {
          location: false
        }
        
        privacyIndex.value = 1
      }, 500)
    } catch (error) {
      console.error('获取用户设置失败:', error)
    }
    
    // 获取缓存大小
    try {
      // 模拟获取缓存大小
      setTimeout(() => {
        cacheSize.value = '2.5MB'
      }, 300)
    } catch (error) {
      console.error('获取缓存大小失败:', error)
    }
  }
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 跳转到个人资料页
const goToProfile = () => {
  uni.navigateTo({ url: '/pages/user/profile' })
}

// 跳转到账号安全页
const goToSecurity = () => {
  uni.navigateTo({ url: '/pages/user/security' })
}

// 跳转到实名认证页
const goToVerify = () => {
  uni.navigateTo({ url: '/pages/user/verify' })
}

// 跳转到关于我们页
const goToAbout = () => {
  uni.navigateTo({ url: '/pages/common/about' })
}

// 跳转到意见反馈页
const goToFeedback = () => {
  uni.navigateTo({ url: '/pages/common/feedback' })
}

// 切换通知设置
const toggleSetting = (key) => {
  notificationSettings.value[key] = !notificationSettings.value[key]
  
  // 保存设置到服务器
  saveSettings()
}

// 切换隐私设置
const togglePrivacy = (key) => {
  privacySettings.value[key] = !privacySettings.value[key]
  
  // 保存设置到服务器
  saveSettings()
}

// 处理隐私选项变更
const handlePrivacyChange = (e) => {
  privacyIndex.value = e.detail.value
  
  // 保存设置到服务器
  saveSettings()
}

// 保存设置到服务器
const saveSettings = () => {
  // 模拟保存设置
  uni.showToast({
    title: '设置已保存',
    icon: 'success',
    duration: 1500
  })
  
  // 实际项目中应该调用API保存用户设置
  /*
  try {
    await userStore.saveUserSettings({
      notification: notificationSettings.value,
      privacy: {
        ...privacySettings.value,
        profileVisibility: privacyIndex.value
      }
    })
  } catch (error) {
    console.error('保存设置失败:', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    })
  }
  */
}

// 清除缓存
const clearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除所有缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '清除中...' })
        
        // 模拟清除缓存
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
          cacheSize.value = '0KB'
        }, 1000)
        
        // 实际项目中应该调用相关API清除缓存
        /*
        try {
          // 清除本地存储
          uni.clearStorageSync()
          
          // 更新缓存大小
          cacheSize.value = '0KB'
          
          uni.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        } catch (error) {
          console.error('清除缓存失败:', error)
          uni.showToast({
            title: '清除失败，请重试',
            icon: 'none'
          })
        }
        */
      }
    }
  })
}

// 退出登录
const handleLogout = async () => {
  const res = await uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？'
  })
  
  if (res.confirm) {
    await userStore.logout()
    uni.switchTab({ url: '/pages/home/index' })
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  padding-bottom: 40rpx;
  position: relative;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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

/* 🎯 修改：返回按钮样式 */
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

/* 🎯 修改：返回图标样式 */
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

.content-container {
  padding: 32rpx;
}

.settings-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 16rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
}

.iconfont {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-right: 24rpx;
}

.item-text {
  font-size: 30rpx;
  color: white;
}

.item-arrow {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.6);
}

.cache-size {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
}

.privacy-picker {
  width: 200rpx;
}

.picker-value {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.logout-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: rgba(255, 82, 82, 0.2);
  border: 1px solid rgba(255, 82, 82, 0.5);
  color: #ffcdd2;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 32rpx;
}

.version-info {
  text-align: center;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}
</style>