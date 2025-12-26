<template>
  <view class="about-page">
    <view class="header">
          <button class="back-btn" @click="goBack">
            <!-- 使用图片作为返回按钮 -->
            <image src="/static/icons/arrow_left.png" class="back-icon"></image>
          </button>
          <view class="page-title">关于我们</view>
          <view class="header-right"></view>
        </view>
    
    <view class="content-container">
      <!-- 应用logo -->
      <view class="app-logo">
        <image src="/static/logo.png" class="logo-image"></image>
      </view>
      
      <!-- 应用名称和版本 -->
      <view class="app-info">
        <text class="app-name">国中宝 App</text>
        <text class="app-version">当前版本: v1.0.0</text>
      </view>
      
      <!-- 应用描述 -->
      <view class="app-description">
        <text> 一个提供大家发布采购和消费需求的平台，用户会员有双重身份科同为甲方和乙方，甲方发布需求后会收到多个乙方的报价和投标，从中选择一个最符合自己需求的乙方在线上达成交易，会员要求实名制，共分两种企业会员和普通会员</text>
      </view>
      
      <!-- 公司信息 -->
      <view class="company-info">
        <view class="info-item">
          <text class="info-label">公司名称：</text>
          <text class="info-value">沈阳科蓝金属科技有限公司</text>
        </view>
        <view class="info-item">
          <text class="info-label">联系邮箱：</text>
          <text class="info-value">763705036@qq.com</text>
        </view>
        <view class="info-item">
          <text class="info-label">官方网站：</text>
          <text class="info-value"><a href = "http://www.baoyuwangluokeji.com.cn/website/">国中宝APP V1.0</a></text>
        </view>
      </view>
      
      <!-- 服务条款和隐私政策 -->
      <view class="legal-info">
        <button class="legal-btn" @click="goToUserAgreement">用户协议</button>
        <button class="legal-btn" @click="goToPrivacyPolicy">隐私政策</button>
      </view>
      
      <!-- 版权信息 -->
      <view class="copyright">
        <text>© 2025 沈阳科蓝金属科技有限公司. 保留所有权利。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 跳转到用户协议
const goToUserAgreement = () => {
  uni.navigateTo({ url: '/pages/common/user-agreement' })
}

// 跳转到隐私政策
const goToPrivacyPolicy = () => {
  uni.navigateTo({ url: '/pages/common/privacy-policy' })
}
</script>

<style scoped>
.about-page {
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-logo {
  margin-top: 60rpx;
  margin-bottom: 40rpx;
}

.logo-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 20rpx;
}

.app-info {
  text-align: center;
  margin-bottom: 60rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  display: block;
  margin-bottom: 16rpx;
}

.app-version {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.app-description {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 60rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.app-description text {
  font-size: 28rpx;
  color: white;
  line-height: 1.6;
}

.company-info {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 60rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
}

.info-item {
  margin-bottom: 20rpx;
  display: flex;
  flex-wrap: wrap;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 28rpx;
  font-weight: bold;
  color: white;
  margin-right: 12rpx;
}

.info-value {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.legal-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 80rpx;
}

.legal-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin: 0 10rpx;
}

.copyright {
  text-align: center;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}
</style>