<template>
  <view class="video-player-container">
    <view class="header">
      <view class="back-button" @click="goBack">
        <image src="/static/icons/arrow_left.png" mode="aspectFit"></image>
      </view>
      <view class="title">{{ videoName }}</view>
    </view>
    
    <view class="video-wrapper">
      <video 
        :src="videoUrl" 
        class="video-player" 
        controls 
        :autoplay="false"
        show-fullscreen-btn
        show-play-btn
        show-center-play-btn
        :enable-progress-gesture="true"
        :page-gesture="false"
        object-fit="contain"
        @error="onVideoError"
        @loadstart="onVideoLoadStart"
        @canplay="onVideoCanPlay"
      ></video>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-overlay">
        <view class="loading-spinner"></view>
        <text class="loading-text">视频加载中...</text>
      </view>
      
      <!-- 错误状态 -->
      <view v-if="error" class="error-overlay">
        <view class="error-icon">⚠️</view>
        <text class="error-text">视频加载失败</text>
        <button class="retry-btn" @click="retryLoad">重试</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const videoUrl = ref('')
const videoName = ref('视频播放')
const loading = ref(true)
const error = ref(false)

onLoad((options) => {
  if (options.url) {
    videoUrl.value = decodeURIComponent(options.url)
  }
  if (options.name) {
    videoName.value = decodeURIComponent(options.name)
  }
})

const goBack = () => {
  uni.navigateBack()
}

const onVideoError = (e) => {
  console.error('视频播放错误:', e)
  loading.value = false
  error.value = true
}

const onVideoLoadStart = () => {
  loading.value = true
  error.value = false
}

const onVideoCanPlay = () => {
  loading.value = false
  error.value = false
}

const retryLoad = () => {
  error.value = false
  loading.value = true
  // 强制重新加载视频
  const currentUrl = videoUrl.value
  videoUrl.value = ''
  setTimeout(() => {
    videoUrl.value = currentUrl
  }, 100)
}
</script>

<style scoped>
.video-player-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #000;
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  padding-top: calc(var(--status-bar-height) + 20rpx);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  position: relative;
  z-index: 10;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.back-button:active {
  background: rgba(255, 255, 255, 0.2);
}

.back-button image {
  width: 40rpx;
  height: 40rpx;
  filter: brightness(0) invert(1);
}

.title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 60rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
  background: #000;
}

/* 加载状态样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 5;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top: 4rpx solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #fff;
  font-size: 28rpx;
}

/* 错误状态样式 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 5;
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.error-text {
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 40rpx;
}

.retry-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

.retry-btn:active {
  background: #2563eb;
}
</style>