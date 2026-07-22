<template>
  <view class="app-root">
    <!-- 隐私政策弹窗 -->
    <view v-if="showPrivacyDialog" class="privacy-mask" @tap.stop>
      <view class="privacy-dialog" @tap.stop>
        <view class="privacy-title">隐私政策提示</view>
        <scroll-view scroll-y class="privacy-content">
          <view class="privacy-text">
            <text>感谢您使用国中宝！在使用本应用前，请您仔细阅读并充分理解</text>
            <view class="privacy-link" @tap="openAgreementPage('agreement')">
              <text>《用户协议》</text>
            </view>
            <text>和</text>
            <view class="privacy-link" @tap="openAgreementPage('privacy')">
              <text>《隐私政策》</text>
            </view>
            <text>。我们将在您同意后再开始收集和使用与提供服务相关的必要信息，包括设备标识的相关数据。</text>
          </view>
          <view class="privacy-detail">
            <text class="detail-title">主要收集与用途（同意后生效）：</text>
            <text class="detail-item">• 设备标识（OAID）：用于反作弊、统计和安全风控。</text>
           
            <text class="detail-item">• 日志与故障信息：用于保障服务稳定性与问题排查。</text>
            <text class="detail-title">您的权利：</text>
            <text class="detail-item">• 您可随时通过“隐私政策”入口再次查看并管理授权。</text>
            <text class="detail-item">• 如不同意，可点击“不同意”退出，或稍后在入口查看政策后再使用。</text>
            <text class="detail-title">帮助：</text>
            <text class="detail-item">如有疑问，可通过客服邮箱 763705036@qq.com 联系我们。</text>
          </view>
        </scroll-view>
        <view class="privacy-btn-group">
          <button class="privacy-btn reject" @tap="handleReject">不同意</button>
          <button class="privacy-btn accept" @tap="handleAccept">同意并继续</button>
        </view>
      </view>
    </view>

    <!-- 常驻隐私入口（悬浮按钮，审核可见） -->
    <view class="privacy-fab" @tap="openPrivacyMenu" hover-class="privacy-fab-hover">
      <text class="fab-icon">ⓘ</text>
      <text class="fab-text">隐私</text>
    </view>
    <view v-if="showFabMenu" class="privacy-fab-menu">
      <view class="fab-menu-item" @tap="openAgreementPage('privacy')">查看隐私政策</view>
      <view class="fab-menu-item" @tap="openAgreementPage('agreement')">查看用户协议</view>
      <view class="fab-menu-item" @tap="openConsentDialog">重新查看首屏弹窗</view>
      <view class="fab-menu-item close" @tap="closeFabMenu">关闭</view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useGlobalStore } from './store/global.js'
import { useUserStore } from './store/user.js'
import { usePrivacyStore } from './store/privacy.js'
import { useMessageStore } from './store/message.js'
import { connectWebSocket } from './utils/socket.js'
import { syncMessageTabBadge } from './utils/tabBarBadge.js'

const globalStore = useGlobalStore()
const userStore = useUserStore()
const privacyStore = usePrivacyStore()
const messageStore = useMessageStore()
const hasInitialized = ref(false)
const showPrivacyDialog = ref(false)
const showFabMenu = ref(false)

const openAgreementPage = (type) => {
  const url = type === 'privacy' ? '/pages/common/privacy-policy' : '/pages/common/user-agreement'
  uni.navigateTo({ 
    url,
    success: () => {
      console.log('成功打开协议页面:', url)
    },
    fail: (err) => {
      console.error('打开协议页面失败:', err)
      uni.showToast({
        title: '打开页面失败',
        icon: 'none'
      })
    }
  })
}

// 打开悬浮菜单
const openPrivacyMenu = () => {
  showFabMenu.value = true
}

const closeFabMenu = () => {
  showFabMenu.value = false
}

// 允许用户主动重新查看弹窗
const openConsentDialog = () => {
  showFabMenu.value = false
  showPrivacyDialog.value = true
}

const runPostConsentInit = async () => {
  if (hasInitialized.value) return
  hasInitialized.value = true
  globalStore.initApp()
  await userStore.checkLoginStatus()
  if (userStore.hasLogin) {
    await Promise.allSettled([
      messageStore.getChatList(),
      messageStore.fetchUnreadNotificationCount()
    ])
    messageStore.syncTabBarBadge()
    connectWebSocket(userStore.token)
  } else {
    syncMessageTabBadge(0)
  }
  privacyStore.collectOaid()
}

watch(
  () => messageStore.totalUnreadCount,
  (count) => {
    syncMessageTabBadge(count)
  },
  { immediate: true }
)

// 处理用户同意
const handleAccept = async () => {
  privacyStore.accept()
  showPrivacyDialog.value = false
  if (!hasInitialized.value) {
    await runPostConsentInit()
  }
}

// 处理用户拒绝
const handleReject = () => {
  // 在 App 环境直接退出，其他环境反复弹窗，避免绕过
  if (typeof plus !== 'undefined' && plus.runtime && typeof plus.runtime.quit === 'function') {
    plus.runtime.quit()
  } else {
    // H5/小程序环境无法退出应用，只能再次提示
    uni.showToast({
      title: '需要同意协议才能使用',
      icon: 'none',
      duration: 2000
    })
  }
}

// App 端兜底：强制展示自定义弹窗以便可点击跳转协议
const showAppPrivacyDialog = () => {
  showPrivacyDialog.value = true
  // 若首次未渲染成功，再次尝试
  setTimeout(() => {
    if (!showPrivacyDialog.value) {
      showPrivacyDialog.value = true
    }
  }, 200)
}

onLaunch(async () => {
  console.log('App onLaunch 开始')
  
  // 初始化隐私状态
  privacyStore.bootstrap()
  console.log('隐私状态检查 - hasAgreed:', privacyStore.hasAgreed)
  console.log('存储中的值:', uni.getStorageSync('privacy_policy_agreed_v1'))
  
  // 等待下一个 tick，确保 DOM 已经渲染
  await nextTick()
  
  // 首次进入且尚未同意隐私时，立即跳转到隐私政策页
  if (!privacyStore.hasAgreed) {
    console.log('用户未同意隐私政策，立即跳转协议页强制查看')
    // 立即跳转到隐私政策页，不等待其他逻辑
    uni.reLaunch({
      url: '/pages/common/privacy-policy?gate=1'
    })
    return
  } else {
    console.log('用户已同意隐私政策，开始初始化')
    // 已同意，再执行所有初始化操作
    await runPostConsentInit()
  }
})

onShow(() => {
  console.log('App 显示')
})

onHide(() => {
  console.log('App 隐藏')
})
</script>

<style>
.app-root {
  min-height: 100vh;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666666;
}

.privacy-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  box-sizing: border-box;
}

.privacy-dialog {
  width: 90%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 16px;
  padding: 32rpx;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.privacy-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #111827;
  margin-bottom: 24rpx;
  text-align: center;
}

.privacy-content {
  max-height: 400rpx;
  min-height: 200rpx;
  font-size: 28rpx;
  color: #374151;
  line-height: 1.8;
  margin-bottom: 32rpx;
  overflow-y: auto;
}

.privacy-text {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  word-wrap: break-word;
  word-break: break-all;
  font-size: 28rpx;
  color: #374151;
  line-height: 1.8;
}

.privacy-link {
  display: inline-block;
  color: #2d8cf0;
  text-decoration: underline;
  margin: 0 4rpx;
  cursor: pointer;
  padding: 2rpx 0;
}

.privacy-link text {
  color: #2d8cf0;
  text-decoration: underline;
}

.privacy-detail {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  color: #4b5563;
  font-size: 26rpx;
}

.detail-title {
  font-weight: 600;
  color: #111827;
}

.detail-item {
  line-height: 1.6;
}

.privacy-btn-group {
  display: flex;
  gap: 24rpx;
  margin-top: auto;
}

.privacy-btn {
  flex: 1;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 8px;
  border: none;
  font-size: 28rpx;
  text-align: center;
  padding: 0;
  margin: 0;
}

.privacy-btn.reject {
  background: #f3f4f6;
  color: #374151;
}

.privacy-btn.accept {
  background: #2d8cf0;
  color: #ffffff;
}

.privacy-btn::after {
  border: none;
}

.btn.disabled,
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.disabled:active,
.btn:disabled:active {
  transform: none;
}

/* 全局卡片样式 */
.card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.card-content {
  color: #666666;
  line-height: 1.6;
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 全局表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333333;
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 16px;
  color: #333333;
  background: #ffffff;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #2d8cf0;
  box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.1);
}

.form-input::placeholder {
  color: #999999;
}

.form-input.error {
  border-color: #ed4014;
}

.form-textarea {
  min-height: 100px;
  padding: 12px 16px;
  resize: vertical;
}

.form-error {
  margin-top: 4px;
  font-size: 12px;
  color: #ed4014;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .btn {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .card {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .form-input {
    height: 44px;
    font-size: 16px;
  }
}

/* 常驻隐私入口悬浮按钮 */
.privacy-fab {
  position: fixed;
  right: 24rpx;
  bottom: 140rpx;
  z-index: 100000;
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(37, 99, 235, 0.3);
  cursor: pointer;
}

.privacy-fab-hover {
  opacity: 0.92;
}

.fab-icon {
  font-size: 34rpx;
  line-height: 1;
}

.fab-text {
  font-size: 24rpx;
  margin-top: 6rpx;
}

.privacy-fab-menu {
  position: fixed;
  right: 24rpx;
  bottom: 270rpx;
  z-index: 100000;
  width: 280rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.fab-menu-item {
  padding: 24rpx;
  font-size: 26rpx;
  color: #111827;
  border-bottom: 1px solid #f2f2f2;
}

.fab-menu-item:last-child {
  border-bottom: none;
}

.fab-menu-item.close {
  text-align: center;
  color: #2563eb;
  font-weight: 600;
}
</style>
