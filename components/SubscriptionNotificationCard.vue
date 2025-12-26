<template>
  <view class="subscription-notification-card" @click="$emit('click')">
    <view class="notification-content">
      <view class="notification-icon" :class="{ 'unread': !notification.is_read }">
        <image :src="getCategoryIcon()" mode="aspectFit"></image>
      </view>
      <view class="notification-details">
        <view class="notification-title" :class="{ 'unread': !notification.is_read }">
          {{ notification.title }}
        </view>
        <view class="notification-message">
          {{ notification.message }}
        </view>
        <view class="notification-time">
          {{ formatTime(notification.created_at) }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { projectCategories } from '../config/categories.js'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

// 获取分类图标
const getCategoryIcon = () => {
  if (!props.notification.category_id) {
    return '/static/icons/notification.png'
  }
  
  // 查找对应的分类
  const category = projectCategories.find(cat => cat.id === props.notification.category_id)
  return category ? category.icon : '/static/icons/notification.png'
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  
  const now = new Date()
  const date = new Date(timeStr)
  const diff = now - date
  
  // 一分钟内
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 一小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  
  // 一天内
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  
  // 一周内
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  
  // 超过一周
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.subscription-notification-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;
}

.subscription-notification-card:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.98);
}

.notification-content {
  display: flex;
  align-items: flex-start;
}

.notification-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.notification-icon.unread {
  background: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 10rpx rgba(59, 130, 246, 0.5);
}

.notification-icon image {
  width: 50rpx;
  height: 50rpx;
}

.notification-details {
  flex: 1;
}

.notification-title {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8rpx;
  font-weight: 500;
}

.notification-title.unread {
  color: #ffffff;
  font-weight: bold;
}

.notification-message {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.notification-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}
</style>