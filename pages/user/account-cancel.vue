<template>
  <view class="cancel-page">
    <view class="header">
      <button class="back-btn" @tap="goBack">
        <image src="/static/icons/arrow_left.png" class="back-icon" />
      </button>
      <view class="page-title">账号注销</view>
      <view class="header-right"></view>
    </view>

    <scroll-view scroll-y class="content">
      <view class="notice-card">
        <view class="notice-title">请确认以下事项</view>
        <view class="notice-item" v-for="(item, index) in checklist" :key="index">
          <text class="notice-index">{{ index + 1 }}.</text>
          <text class="notice-text">{{ item }}</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">注销流程</view>
        <view class="step-item" v-for="(step, index) in steps" :key="step.title">
          <view class="step-index">{{ index + 1 }}</view>
          <view class="step-content">
            <view class="step-title">{{ step.title }}</view>
            <view class="step-desc">{{ step.desc }}</view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">填写注销申请</view>
        <view class="form-item">
          <text class="form-label">注销原因（选填）</text>
          <textarea
            class="form-textarea"
            v-model="form.reason"
            maxlength="200"
            placeholder="请简要说明您要注销的原因，便于我们优化产品"
          />
        </view>
        <view class="form-item">
          <text class="form-label">联系方式（选填）</text>
          <input
            class="form-input"
            v-model="form.contact"
            placeholder="如需结果通知，可填写手机号或邮箱"
          />
        </view>
        <view class="confirm-row">
          <checkbox :checked="form.confirmed" @tap="toggleConfirm" style="transform: scale(0.7)" />
          <text class="confirm-text">
            我已阅读并理解账号注销的全部风险，愿意删除账号及其关联数据。
          </text>
        </view>
        <button class="danger-btn" :disabled="submitting" @tap="handleSubmit">
          {{ submitting ? '提交中...' : '提交注销申请' }}
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user.js'

const userStore = useUserStore()
const submitting = ref(false)
const form = ref({
  reason: '',
  contact: '',
  confirmed: false
})

const steps = [
  { title: '提交申请', desc: '填写原因并提交注销申请，我们将在 15 个工作日内处理。' },
  { title: '验证账号状态', desc: '需确保无未完成的项目、投标或订单，且账户无欠费纠纷。' },
  { title: '永久删除', desc: '审核通过后我们将按照法规要求删除或匿名化您的个人信息。' }
]

const checklist = [
  '账号内的项目、订单与收益将无法恢复；',
  '实名认证信息及发票历史会被清空；',
  '注销完成后，使用相同手机号或邮箱需重新注册；',
  '若存在争议处理、司法协助需求，我们可能暂缓申请。'
]

const goBack = () => {
  uni.navigateBack()
}

const toggleConfirm = () => {
  form.value.confirmed = !form.value.confirmed
}

const handleSubmit = async () => {
  if (!form.value.confirmed) {
    uni.showToast({ title: '请勾选确认条款', icon: 'none' })
    return
  }

  if (submitting.value) return

  try {
    submitting.value = true
    await userStore.requestAccountCancellation({
      reason: form.value.reason,
      contact: form.value.contact
    })
    uni.showToast({
      title: '已提交，稍后可在客服通知中查看结果',
      icon: 'none',
      duration: 2500
    })
    setTimeout(() => {
      goBack()
    }, 1800)
  } catch (error) {
    uni.showToast({ title: error.message || '提交失败，请稍后重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onShow(() => {
  if (!userStore.token) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
})
</script>

<style scoped>
.cancel-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4ff, #e0edff);
  padding-bottom: 40rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 32rpx;
  background: #3b82f6;
  color: #fff;
  position: relative;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);
}

.back-icon {
  width: 32rpx;
  height: 32rpx;
  filter: brightness(0) invert(1);
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
  flex: 1;
}

.header-right {
  width: 60rpx;
}

.content {
  padding: 32rpx;
  height: calc(100vh - 120rpx);
}

.notice-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.15);
  margin-bottom: 32rpx;
}

.notice-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
  color: #1f2937;
}

.notice-item {
  display: flex;
  margin-bottom: 10rpx;
  color: #4b5563;
  font-size: 26rpx;
}

.notice-index {
  width: 34rpx;
  font-weight: 600;
}

.section {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.08);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20rpx;
}

.step-item {
  display: flex;
  margin-bottom: 18rpx;
}

.step-index {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.step-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #111827;
}

.step-desc {
  font-size: 24rpx;
  color: #4b5563;
  margin-top: 6rpx;
  line-height: 1.6;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 26rpx;
  color: #374151;
  margin-bottom: 12rpx;
  display: block;
}

.form-input,
.form-textarea {
  width: 100%;
  border-radius: 16rpx;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  padding: 20rpx;
  font-size: 26rpx;
  color: #111827;
  box-sizing: border-box;
}

.form-textarea {
  min-height: 160rpx;
}

.confirm-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.confirm-text {
  font-size: 24rpx;
  color: #374151;
  line-height: 1.6;
}

.danger-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
}

.danger-btn:disabled {
  opacity: 0.6;
}
</style>

