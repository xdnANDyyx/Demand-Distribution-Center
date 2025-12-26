<template>
  <view class="agreement-page">
    <view class="header">
      <text class="title">用户协议</text>
      <text class="subtitle">最近更新：2025 年 12 月</text>
    </view>

    <scroll-view scroll-y class="agreement-scroll">
      <view class="section">
        <text class="section-title">一、协议说明</text>
        <text class="section-text">
          本协议是您与国中宝平台之间关于使用相关产品与服务所达成的合法协议。
          在注册、登录、使用我们服务之前，请仔细阅读并充分理解各条款内容。
          当您点击“同意”并开始使用服务时，即视为您已经阅读并同意受本协议约束。
        </text>
      </view>

      <view class="section">
        <text class="section-title">二、用户权利与义务</text>
        <text class="section-text">
          您应保证注册信息真实、准确、完整，并在信息发生变更时及时更新；
          您有权使用我们提供的项目发布、投标、消息等功能，并可在设置中管理通知和隐私偏好；
          您需遵守国家法律法规及平台规则，不得发布违法、侵权或不实信息。
        </text>
      </view>

      <view class="section">
        <text class="section-title">三、平台权利与义务</text>
        <text class="section-text">
          我们将持续改进产品体验，保障服务稳定运行，并通过技术手段保障信息安全；
          对于涉嫌违法违规或违反平台规则的账号，我们有权采取限制功能、冻结或注销等措施；
          未经您授权，我们不会向第三方分享您的个人信息（法律法规另有要求除外）。
        </text>
      </view>

      <view class="section">
        <text class="section-title">四、账号安全</text>
        <text class="section-text">
          您需妥善保管账号及密码，避免与他人共享设备或泄露信息。
          如发现账号被盗用，请立即在“我的-设置-账号安全”中修改密码或联系客服协助处理。
        </text>
      </view>

      <view class="section">
        <text class="section-title">五、账号注销</text>
        <text class="section-text">
          您可以按照隐私政策描述，通过“我的-设置-账号注销”提交注销申请。
          注销后我们将删除或匿名化您的个人信息，但法律法规要求保留的除外。
        </text>
      </view>

      <view class="section">
        <text class="section-title">六、其他</text>
        <text class="section-text">
          我们可能根据业务发展及监管要求适时更新本协议，更新后会在应用内或官网公告。
          如您继续使用服务，视为接受更新后的协议。如有疑问，可通过客服渠道与我们联系。
        </text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
</script>

<style scoped>
.agreement-page {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 24rpx;
  box-sizing: border-box;
}

.header {
  margin-bottom: 24rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #111827;
}

.subtitle {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
}

.agreement-scroll {
  max-height: calc(100vh - 160rpx);
}

.section {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.08);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12rpx;
}

.section-text {
  font-size: 26rpx;
  color: #374151;
  line-height: 1.7;
}
</style>

