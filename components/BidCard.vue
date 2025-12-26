<template>
  <view class="bid-card">
    <view class="bid-header">
      <view class="bidder-info">
        <image class="bidder-avatar" :src="bid.bidder?.avatar || '/static/images/default-avatar.png'"></image>
        <view class="bidder-details">
          <text class="bidder-name">{{ bid.bidder?.username || '匿名用户' }}</text>
          <view class="rating">
            <text class="rating-text">信誉: {{ bid.bidder?.rating || 5.0 }}</text>
          </view>
        </view>
      </view>
      <view class="bid-price">
        <text class="price-label">报价</text>
        <text class="price-value">¥{{ bid.price }}</text>
      </view>
    </view>
    
    <view class="bid-content">
      <view class="delivery-info">
        <text class="delivery-label">交付周期：</text>
        <text class="delivery-value">{{ bid.delivery_days }}天</text>
      </view>
      <view class="bid-description">
        <text class="description-text">{{ bid.description }}</text>
      </view>
    </view>
    
    <view class="bid-footer">
      <text class="bid-time">{{ formatTime(bid.created_at) }}</text>
      <button 
        v-if="canSelect" 
        class="select-btn" 
        @click="handleSelect"
      >
        选择此方案
      </button>
    </view>
  </view>
</template>

<script setup>
// 移除不必要的导入，defineProps 和 defineEmits 是编译器宏，不需要导入
const props = defineProps({
  bid: {
    type: Object,
    required: true
  },
  canSelect: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const handleSelect = () => {
  emit('select', props.bid.id)
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.bid-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  color: #fff;
}

.bid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.bidder-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.bidder-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.bidder-details {
  flex: 1;
}

.bidder-name {
  font-size: 28rpx;
  font-weight: 500;
  display: block;
  margin-bottom: 4rpx;
}

.rating {
  font-size: 24rpx;
  opacity: 0.8;
}

.bid-price {
  text-align: right;
}

.price-label {
  font-size: 24rpx;
  opacity: 0.8;
  display: block;
}

.price-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFD700;
}

.bid-content {
  margin-bottom: 20rpx;
}

.delivery-info {
  font-size: 26rpx;
  margin-bottom: 12rpx;
}

.delivery-label {
  opacity: 0.8;
}

.delivery-value {
  color: #87CEEB;
  font-weight: 500;
}

.bid-description {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 16rpx;
}

.description-text {
  font-size: 26rpx;
  line-height: 1.5;
  opacity: 0.9;
}

.bid-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bid-time {
  font-size: 24rpx;
  opacity: 0.6;
}

.select-btn {
  background: linear-gradient(135deg, #32CD32, #228B22);
  color: #fff;
  border-radius: 20rpx;
  padding: 0 24rpx;
  height: 60rpx;
  line-height: 60rpx;
  font-size: 26rpx;
}
</style>