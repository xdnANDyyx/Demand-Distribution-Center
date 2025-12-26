<template>
  <view class="feedback-page">
    <view class="header">
          <button class="back-btn" @click="goBack">
            <!-- 使用图片作为返回按钮 -->
            <image src="/static/icons/arrow_left.png" class="back-icon"></image>
          </button>
          <view class="page-title">意见反馈</view>
          <view class="header-right"></view>
        </view>
    
    <view class="content-container">
      <!-- 反馈说明 -->
      <view class="feedback-intro">
        <text>感谢您对我们的支持！请填写以下信息，我们会尽快处理您的反馈。</text>
      </view>
      
      <!-- 反馈类型 -->
      <view class="form-item">
        <text class="form-label">反馈类型</text>
        <picker 
          @change="onFeedbackTypeChange" 
          :value="feedbackTypeIndex" 
          :range="feedbackTypes"
          class="form-picker"
        >
          <view class="picker-value">
            {{ feedbackTypes[feedbackTypeIndex] }}
            <text class="item-arrow">›</text>
          </view>
        </picker>
      </view>
      
      <!-- 反馈内容 -->
      <view class="form-item">
        <text class="form-label">反馈内容</text>
        <textarea 
          v-model="feedbackContent" 
          class="form-textarea" 
          placeholder="请详细描述您遇到的问题或建议..."
          placeholder-style="color: rgba(255, 255, 255, 0.4)"
          maxlength="500"
          auto-height
        ></textarea>
        <text class="content-count">{{ feedbackContent.length }}/500</text>
      </view>
      
      <!-- 联系方式 -->
      <view class="form-item">
        <text class="form-label">联系方式</text>
        <input 
          v-model="contactInfo" 
          class="form-input" 
          placeholder="请留下您的邮箱或手机号，以便我们联系您"
          placeholder-style="color: rgba(255, 255, 255, 0.4)"
        />
      </view>
      
      <!-- 提交按钮 -->
      <button class="submit-btn" @click="submitFeedback" :disabled="!canSubmit">
        提交反馈
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 反馈类型
const feedbackTypes = ['功能建议', 'bug反馈', '性能问题', '界面优化', '其他']
const feedbackTypeIndex = ref(0)

// 反馈内容
const feedbackContent = ref('')

// 联系方式
const contactInfo = ref('')

// 是否可以提交
const canSubmit = computed(() => {
  return feedbackContent.value.trim().length > 0
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 反馈类型变化
const onFeedbackTypeChange = (e) => {
  feedbackTypeIndex.value = e.detail.value
}

// 提交反馈
const submitFeedback = () => {
  if (!canSubmit.value) {
    return
  }
  
  // 显示加载提示
  uni.showLoading({
    title: '提交中...'
  })
  
  // 模拟提交反馈
  setTimeout(() => {
    uni.hideLoading()
    
    // 显示提交成功提示
    uni.showToast({
      title: '反馈提交成功',
      icon: 'success',
      duration: 1500
    })
    
    // 返回上一页
    setTimeout(() => {
      goBack()
    }, 1500)
  }, 1000)
  
  // 实际项目中应该调用API提交反馈
  /*
  try {
    await api.submitFeedback({
      type: feedbackTypes[feedbackTypeIndex.value],
      content: feedbackContent.value,
      contact: contactInfo.value
    })
    
    uni.hideLoading()
    
    uni.showToast({
      title: '反馈提交成功',
      icon: 'success',
      duration: 1500
    })
    
    // 返回上一页
    setTimeout(() => {
      goBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
    
    console.error('提交反馈失败:', error)
  }
  */
}
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  padding-bottom: 40rpx;
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

.content-container {
  padding: 32rpx;
}

.feedback-intro {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 40rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feedback-intro text {
  font-size: 28rpx;
  color: white;
  line-height: 1.6;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 16rpx;
}

.form-picker {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.picker-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: white;
}

.item-arrow {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.6);
}

.form-textarea {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 28rpx;
  min-height: 200rpx;
  line-height: 1.6;
}

.content-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8rpx;
}

.form-input {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 28rpx;
  width: 100%;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: rgba(59, 130, 246, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.submit-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.6);
}
</style>