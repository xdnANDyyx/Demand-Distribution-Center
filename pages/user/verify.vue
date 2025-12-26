<template>
  <view class="verify-page">
     <view class="header">
          <button class="back-btn" @click="goBack">
            <!-- 🎯 修改：使用图片作为返回按钮 -->
            <image src="/static/icons/arrow_left.png" class="back-icon"></image>
          </button>
          <view class="page-title">实名认证</view>
          <view class="header-right"></view>
        </view>
    
    <view class="content-container">
      <view class="status-card" :class="{ 'verified': isVerified }">
        <view class="status-icon">
          <text class="iconfont" :class="isVerified ? 'icon-check-circle' : 'icon-info-circle'"></text>
        </view>
        <view class="status-text">
          <text class="status-title">{{ isVerified ? '已完成实名认证' : '未完成实名认证' }}</text>
          <text class="status-desc">{{ isVerified ? '您已通过实名认证，可以使用平台的全部功能' : '完成实名认证后可以使用平台的全部功能' }}</text>
        </view>
      </view>
      
      <view class="form-container">
        <view class="form-title">个人信息</view>
        
        <view class="form-group">
          <label class="form-label">真实姓名</label>
          <input 
            class="form-input" 
            type="text" 
            placeholder="请输入您的真实姓名" 
            v-model="formData.realName"
            :disabled="isVerified"
          />
        </view>
        
        <view class="form-group">
          <label class="form-label">身份证号</label>
          <input 
            class="form-input" 
            type="idcard" 
            placeholder="请输入您的身份证号码" 
            v-model="formData.idCard"
            :disabled="isVerified"
          />
        </view>
        
        <view class="form-group">
          <label class="form-label">手机号码</label>
          <input 
            class="form-input" 
            type="number" 
            placeholder="请输入您的手机号码" 
            v-model="formData.phone"
            :disabled="isVerified"
          />
        </view>
        
        <view class="form-title">证件上传</view>
        
        <view class="upload-section">
          <view class="upload-item">
            <view class="upload-label">身份证正面</view>
            <view class="upload-area" @click="uploadImage('idCardFront')" :class="{ 'disabled': isVerified }">
              <image v-if="formData.idCardFront" :src="formData.idCardFront" class="preview-image"></image>
              <view v-else class="upload-placeholder">
                <text class="iconfont icon-camera"></text>
                <text class="upload-text">点击上传</text>
              </view>
            </view>
          </view>
          
          <view class="upload-item">
            <view class="upload-label">身份证反面</view>
            <view class="upload-area" @click="uploadImage('idCardBack')" :class="{ 'disabled': isVerified }">
              <image v-if="formData.idCardBack" :src="formData.idCardBack" class="preview-image"></image>
              <view v-else class="upload-placeholder">
                <text class="iconfont icon-camera"></text>
                <text class="upload-text">点击上传</text>
              </view>
            </view>
          </view>
          
          <view class="upload-item">
            <view class="upload-label">手持身份证照片</view>
            <view class="upload-area" @click="uploadImage('idCardHolding')" :class="{ 'disabled': isVerified }">
              <image v-if="formData.idCardHolding" :src="formData.idCardHolding" class="preview-image"></image>
              <view v-else class="upload-placeholder">
                <text class="iconfont icon-camera"></text>
                <text class="upload-text">点击上传</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="privacy-notice">
          <checkbox :checked="privacyAgreed" @click="privacyAgreed = !privacyAgreed" :disabled="isVerified" />
          <text class="privacy-text">我已阅读并同意<text class="privacy-link" @click="showPrivacyPolicy">《实名认证服务协议》</text></text>
        </view>
        
        <button 
          class="submit-btn" 
          :class="{ 'disabled': isVerified || !canSubmit }" 
          @click="submitVerification"
          :disabled="isVerified || !canSubmit"
        >
          {{ isVerified ? '已认证' : '提交认证' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user.js'

const userStore = useUserStore()

// 表单数据
const formData = ref({
  realName: '',
  idCard: '',
  phone: '',
  idCardFront: '',
  idCardBack: '',
  idCardHolding: ''
})

// 隐私协议同意状态
const privacyAgreed = ref(false)

// 认证状态
const isVerified = computed(() => userStore.userInfo?.is_verified || false)

// 是否可以提交
const canSubmit = computed(() => {
  return formData.value.realName && 
         formData.value.idCard && 
         formData.value.phone && 
         formData.value.idCardFront && 
         formData.value.idCardBack && 
         formData.value.idCardHolding && 
         privacyAgreed.value
})

// 页面加载时获取用户信息
onMounted(async () => {
  if (userStore.token) {
    await userStore.getUserInfo()
    
    // 如果已认证，加载认证信息
    if (isVerified.value) {
      try {
        const verifyInfo = await userStore.getVerificationInfo()
        formData.value = {
          realName: verifyInfo.real_name || '',
          idCard: verifyInfo.id_card || '',
          phone: verifyInfo.phone || '',
          idCardFront: verifyInfo.id_card_front || '',
          idCardBack: verifyInfo.id_card_back || '',
          idCardHolding: verifyInfo.id_card_holding || ''
        }
      } catch (error) {
        console.error('获取认证信息失败:', error)
      }
    }
  }
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 上传图片
const uploadImage = (field) => {
  if (isVerified.value) return
  
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 模拟上传到服务器
      uni.showLoading({ title: '上传中...' })
      
      setTimeout(() => {
        formData.value[field] = res.tempFilePaths[0]
        uni.hideLoading()
      }, 1000)
      
      // 实际项目中应该使用以下代码上传到服务器
      /*
      uni.uploadFile({
        url: 'https://api.example.com/upload',
        filePath: res.tempFilePaths[0],
        name: 'file',
        success: (uploadRes) => {
          const data = JSON.parse(uploadRes.data)
          formData.value[field] = data.url
          uni.hideLoading()
        },
        fail: (err) => {
          console.error('上传失败:', err)
          uni.hideLoading()
          uni.showToast({
            title: '上传失败，请重试',
            icon: 'none'
          })
        }
      })
      */
    }
  })
}

// 显示隐私政策
const showPrivacyPolicy = () => {
  uni.navigateTo({
    url: '/pages/common/privacy-policy?type=verification'
  })
}

// 提交认证
const submitVerification = async () => {
  if (!canSubmit.value) return
  
  try {
    uni.showLoading({ title: '提交中...' })
    
    // 模拟提交认证
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 实际项目中应该使用以下代码提交认证
    /*
    await userStore.submitVerification({
      real_name: formData.value.realName,
      id_card: formData.value.idCard,
      phone: formData.value.phone,
      id_card_front: formData.value.idCardFront,
      id_card_back: formData.value.idCardBack,
      id_card_holding: formData.value.idCardHolding
    })
    */
    
    uni.hideLoading()
    
    uni.showToast({
      title: '提交成功，等待审核',
      icon: 'success'
    })
    
    // 更新用户信息
    await userStore.getUserInfo()
    
    // 延迟返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
    console.error('提交认证失败:', error)
  }
}
</script>

<style scoped>
.verify-page {
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

.status-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-card.verified {
  background: rgba(40, 167, 69, 0.15);
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.status-icon {
  font-size: 80rpx;
  margin-right: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.status-card.verified .status-icon {
  color: #28a745;
}

.status-text {
  flex: 1;
}

.status-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 8rpx;
}

.status-desc {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 32rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16rpx;
  padding: 0 24rpx;
  color: white;
  font-size: 28rpx;
}

.form-input:disabled {
  opacity: 0.7;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.upload-item {
  width: 100%;
}

.upload-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12rpx;
}

.upload-area {
  height: 300rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.upload-area.disabled {
  opacity: 0.7;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
}

.icon-camera {
  font-size: 60rpx;
  margin-bottom: 16rpx;
}

.upload-text {
  font-size: 28rpx;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.privacy-notice {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
  padding: 0 16rpx;
}

.privacy-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 12rpx;
}

.privacy-link {
  color: #4dabf7;
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.submit-btn.disabled {
  background: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.6);
}
</style>