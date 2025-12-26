<template>
  <view class="home-container">
    <!-- 状态栏 -->
   <!-- <view class="status-bar">
      <text>{{ currentTime }}</text>
      <view class="status-icons">
        <text class="iconfont icon-signal"></text>
        <text class="iconfont icon-wifi"></text>
        <text class="iconfont icon-battery"></text>
      </view>
    </view> -->
    
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="header-top">
        <view class="logo">需求集市 <b style="color: yellow;">Hub</b></view>
        <view class="header-actions">
			<view style="font-size:19px;"><b style="color: blue;">海量</b>需求 等你选择！</view>
         <!-- <view class="header-btn" @click="goToNotifications">
            <text class="iconfont icon-bell"></text>
            <view v-if="unreadNotifications > 0" class="badge">{{ unreadNotifications }}</view>
          </view> -->
          <!-- <view class="header-btn" @click="goToUserCenter">
            <text class="iconfont icon-user"></text>
          </view> -->
        </view>
      </view>
      
      <!-- 搜索栏 -->
      <view class="search-bar-glass">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          v-model="keyword" 
          placeholder="搜索项目关键词"
          @confirm="handleSearch"
        />
      </view>
    </view>
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 类目选择 -->
      <view class="categories-section fade-in-up">
       <!-- <view class="section-title">选择发布类目</view> -->
        <view class="categories-grid">
          <view 
            v-for="category in categories" 
            :key="category.id" 
            class="category-card"
            :class="{ 'subscribed': category.subscribed }"
            @click="selectCategory(category)"
            @longpress="toggleSubscription(category)"
          >
            <view class="category-icon">
              <image :src="category.icon" mode="aspectFit" class="category-icon"></image>
            </view>
            <view class="category-title">{{ category.name }}</view>
            <view v-if="category.subscribed" class="subscription-badge">
              <text class="subscription-icon">✓</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onShow, onUnload } from '@dcloudio/uni-app'
import { getUnreadNotificationCount } from '../../api/notification.js'
import { getUserSubscriptions, updateUserSubscriptions, addSubscription, removeSubscription } from '../../api/subscription.js'
import { useUserStore } from '../../store/user.js'
import { navigateToWithLoginCheck } from '../../config/routeGuard.js'

// 获取用户状态
const userStore = useUserStore()

// 搜索关键词
const keyword = ref('')

// 处理搜索
const handleSearch = () => {
  if (!keyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none'
    })
    return
  }
  
  // 跳转到项目列表页面并传递搜索关键词
  uni.navigateTo({
    url: `/pages/projects/list?keyword=${encodeURIComponent(keyword.value.trim())}`
  })
}

// 当前时间
const currentTime = ref('00:00')

// 更新时间
const updateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

// 用户订阅的类别ID数组
const subscribedCategories = ref([])

// 定义响应式数据
const categories = ref([
  { id: 1, name: '工业标单', icon: '/static/icons/industry.jpg', subscribed: false },
  { id: 2, name: '餐饮美食', icon: '/static/icons/food.jpg', subscribed: false },
  { id: 3, name: '休闲娱乐', icon: '/static/icons/recreation.jpg', subscribed: false },
  { id: 4, name: '手机电脑', icon: '/static/icons/computer.png', subscribed: false },
  { id: 5, name: '家电需求', icon: '/static/icons/appliances.png', subscribed: false },
  { id: 6, name: '家居需求', icon: '/static/icons/fitting.png', subscribed: false },
  { id: 7, name: '汽车需求', icon: '/static/icons/car.jpg', subscribed: false },
  { id: 8, name: '房产需求', icon: '/static/icons/house.jpg', subscribed: false },
  { id: 9, name: '服装鞋帽', icon: '/static/icons/clothing.jpg', subscribed: false },
  { id: 10, name: '家装装修', icon: '/static/icons/decoration.jpg', subscribed: false },
  { id: 11, name: '生活服务', icon: '/static/icons/Live.png', subscribed: false },
  { id: 12, name: '二手物品', icon: '/static/icons/secondhand.png', subscribed: false },
  { id: 13, name: '人力服务', icon: '/static/icons/hr.png', subscribed: false },
  { id: 14, name: '医疗就医', icon: '/static/icons/Health.jpg', subscribed: false },
  { id: 15, name: '艺术奢饰', icon: '/static/icons/zuan.png', subscribed: false },
  { id: 16, name: '交友相亲', icon: '/static/icons/love.jpg', subscribed: false }
])

// 获取用户订阅的类别
const fetchUserSubscriptions = async () => {
  if (!userStore.hasLogin) return
  
  try {
    const response = await getUserSubscriptions()
    subscribedCategories.value = response || []
    
    // 更新类别的订阅状态
    categories.value.forEach(category => {
      category.subscribed = subscribedCategories.value.includes(category.id)
    })
  } catch (error) {
    console.error('获取用户订阅失败:', error)
  }
}

const unreadNotifications = ref(0)
let notificationTimer = null
let timeUpdateTimer = null

// 方法定义
const getUnreadNotifications = async () => {
  // 只有登录状态才获取未读通知数量
  if (!userStore.hasLogin) return
  
  try {
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
    
    // 如果有新通知且数量增加，播放提示音并震动
    if (count > unreadNotifications.value && unreadNotifications.value !== 0) {
      playNotificationSound()
      vibrateDevice()
    }
    
    unreadNotifications.value = count
  } catch (error) {
    console.error('获取未读通知数量失败:', error)
  }
}

// 播放通知提示音
const playNotificationSound = () => {
  const innerAudioContext = uni.createInnerAudioContext()
  innerAudioContext.autoplay = true
  innerAudioContext.src = '/static/sounds/notification.mp3'
  
  innerAudioContext.onError((res) => {
    console.error('播放通知提示音失败:', res)
  })
}

// 设备震动
const vibrateDevice = () => {
  try {
    // 检查 vibrate 方法是否存在
    if (typeof uni.vibrate === 'function') {
      uni.vibrate({
        success: function() {
          console.log('震动成功')
        },
        fail: function(err) {
          console.log('震动失败', err)
          // 尝试长震动
          try {
            if (typeof uni.vibrateLong === 'function') {
              uni.vibrateLong({
                fail: (err) => console.log('长震动也失败', err)
              });
            }
          } catch (e) {
            console.log('长震动异常', e)
          }
        }
      })
    } else {
      // vibrate 方法不存在，尝试使用 vibrateLong
      console.log('vibrate 方法不存在，尝试使用 vibrateLong')
      if (typeof uni.vibrateLong === 'function') {
        uni.vibrateLong({
          fail: (err) => console.log('长震动失败', err)
        });
      } else {
        console.log('设备不支持震动功能')
      }
    }
  } catch (error) {
    console.log('震动功能异常', error)
  }
}

const goToUserCenter = () => {
  uni.navigateTo({
    url: '/pages/user/index'
  })
}

// 切换订阅状态
const toggleSubscription = async (category) => {
  if (!userStore.hasLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  
  try {
    // 显示加载提示
    uni.showLoading({
      title: category.subscribed ? '取消订阅中...' : '订阅中...',
      mask: true
    })
    
    if (category.subscribed) {
      // 取消订阅
      await removeSubscription({ categoryId: category.id })
      
      // 更新本地状态
      category.subscribed = false
      subscribedCategories.value = subscribedCategories.value.filter(id => id !== category.id)
      
      uni.showToast({
        title: `已取消订阅"${category.name}"`,
        icon: 'success'
      })
    } else {
      // 添加订阅
      await addSubscription({ categoryId: category.id })
      
      // 更新本地状态
      category.subscribed = true
      if (!subscribedCategories.value.includes(category.id)) {
        subscribedCategories.value.push(category.id)
      }
      
      uni.showToast({
        title: `已订阅"${category.name}"`,
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('订阅操作失败:', error)
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

const selectCategory = (category) => {
  // 保存选择的一级分类
  try {
    uni.setStorageSync('selectedMainCategory', category)
  } catch (e) {
    console.error('保存分类信息失败:', e)
  }
  
  // 导航到二级分类选择页面
  navigateToWithLoginCheck({
    url: `/pages/projects/category-select?mainCategoryId=${category.id}&mainCategoryName=${encodeURIComponent(category.name)}&comfrom=bids`
  })
}

// 生命周期钩子
onMounted(() => {
  // 更新当前时间
  updateTime()
  
  // 设置定时器，每分钟更新一次时间
  // timeUpdateTimer = setInterval(() => {
  //   updateTime()
  // }, 60000) // 60秒 = 1分钟
  
  // 获取未读通知数量
  getUnreadNotifications()
  
  // 设置定时器，每分钟获取一次未读通知数量
  // notificationTimer = setInterval(() => {
  //   getUnreadNotifications()
  // }, 60000) // 60秒 = 1分钟
  
  // 获取用户订阅信息
  fetchUserSubscriptions()
})

// 页面显示时重新获取通知数量和订阅信息

// 页面显示时重新获取通知数量和订阅信息，并进入全屏（仅 App 端）
onShow(() => {
  updateTime()
  getUnreadNotifications()
  fetchUserSubscriptions()
  // #ifdef APP-PLUS
  try {
    plus.navigator.setFullscreen(true)
  } catch (e) {
    console.log('设置全屏失败', e)
  }
  // #endif
})

// 页面卸载时清除定时器，并恢复状态栏显示
onUnload(() => {
  if (notificationTimer) {
    clearInterval(notificationTimer)
  }
  if (timeUpdateTimer) {
    clearInterval(timeUpdateTimer)
  }
  // #ifdef APP-PLUS
  try {
    plus.navigator.setFullscreen(false)
  } catch (e) {
    console.log('退出全屏失败', e)
  }
  // #endif
})
// 页面卸载时清除定时器

</script>

<style scoped>
.home-container {
  /* 将原有的渐变背景替换为 GPT-5 风格的渐变 */
  /* background: linear-gradient(135deg, #fbbf24 0%, #f472b6 25%, #ec4899 50%, #8b5cf6 75%, #6366f1 100%); */
  background-color: aliceblue;
  min-height: 100vh;
  overflow-x: hidden;
}

/* 状态栏样式 */
.status-bar {
  height: 48rpx;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx;
  color: black;
  font-size: 24rpx;
}

.status-icons {
  display: flex;
  gap: 16rpx;
}

/* 头部区域样式 */
.header {
  padding: 20rpx 32rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20rpx);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: fixed; /* 设置为固定定位 */
  top: 0;          /* 固定在屏幕顶部 */
  left: 0;
  right: 0;
  z-index: 1000;   /* 确保它在其他内容之上 */
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.logo {
  font-size: 48rpx;
  font-weight: bold;
  color: black;
  text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
}

.header-actions {
  display: flex;
  gap: 32rpx;
}

.header-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 36rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.header-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background-color: #FF4500;
  color: white;
  font-size: 20rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 搜索栏样式 */
.search-bar-glass {
  background: rgba(229, 229, 229, 0.2);
  border-radius: 40rpx;
  padding: 16rpx 32rpx;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10rpx);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 16rpx;
}

.search-icon {
  margin-right: 16rpx;
  font-size: 32rpx;
}

.search-input {
  flex: 1;
  height: 60rpx;
  color: white;
  font-size: 28rpx;
}

/* 主要内容区域 */
.main-content {
  padding: 40rpx 32rpx;
  margin-top: 180rpx; /* 为固定定位的头部留出空间 */
}

/* 类目选择区域 */
.categories-section {
  margin-top: 48rpx;
}

.section-title {
  color: white;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 32rpx;
  text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.category-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 32rpx;
  padding: 32rpx 16rpx;
  backdrop-filter: blur(30rpx);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200rpx;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:active {
  transform: translateY(-8rpx);
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.3);
}

.category-card:active::before {
  opacity: 1;
}

.category-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  position: relative;
  z-index: 1;
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

.category-title {
  color: black;
  font-size: 28rpx;
  font-weight: bold;
  position: relative;
  z-index: 1;
  text-align: center;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.3);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(60rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* 订阅相关样式 */
.category-card.subscribed {
  border: 2px solid #4CAF50;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
}

.subscription-badge {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  background-color: #4CAF50;
  color: white;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  z-index: 2;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.subscription-icon {
  font-weight: bold;
}

/* 长按提示动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.category-card:active {
  animation: pulse 0.3s ease-in-out;
}
</style>