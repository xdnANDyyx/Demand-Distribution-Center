<template>
  <view class="policy-page">
    <view class="header">
      <text class="title">隐私政策</text>
      <text class="subtitle">最近更新：2025 年 12 月</text>
      <view class="links">
        <text class="link" @tap="goToUserAgreement">查看《用户协议》</text>
      </view>
    </view>

    <scroll-view scroll-y class="policy-scroll">
      <view class="section">
        <text class="section-title">一、我们收集的信息</text>
        <text class="section-text">
          我们仅在提供国中宝服务所必需的范围内收集信息，包括账号注册信息、业务使用记录、
          设备信息以及按照监管要求保存的日志。为保障广告投放与设备安全，我们会在您同意后
          调用系统能力获取设备标识，该信息仅用于风控核验与统计分析，不会用于识别具体自然人。
        </text>
        <view class="bullet">
          <text class="bullet-title">敏感信息及用途</text>
          <text class="bullet-text">• OAID（开放匿名设备标识符）：仅在您点击“同意”后获取，用于统计、风控及反作弊。</text>
          <text class="bullet-text">• 位置信息：用于推荐本地项目，可在设置 > 隐私设置中关闭。</text>
          
        </view>
      </view>

      <view class="section">
        <text class="section-title">二、我们如何使用信息</text>
        <text class="section-text">
          我们会将收集到的信息用于提供核心交易、订单履约、客服处理、安全防护及改进产品体验。
          
        </text>
      </view>

      

      <view class="section">
        <text class="section-title">三、账号注销</text>
        <text class="section-text">
          您可以按照“我的-设置-账号注销”入口提交注销申请。我们将在 15 个工作日内处理，并在完成后
          删除或匿名化您的个人信息（法律法规另有规定除外）。注销完成后，账号关联的项目、订单及
          积分等数据将无法恢复，请谨慎操作。
        </text>
        <button class="primary-btn" @tap="goToAccountCancellation">前往账号注销</button>
      </view>

      <view class="section">
        <text class="section-title">四、联系我们</text>
        <text class="section-text">
          如果您对本隐私政策有任何疑问或建议，可通过客服邮箱 763705036@qq.com 与我们联系，
          我们会在收到后 15 个工作日内答复。
		  应用运营方：沈阳科蓝金属科技有限公司



        </text>
      </view>
    </scroll-view>

    <view v-if="gateMode" class="gate-actions">
      <view class="gate-text">请先阅读并同意《隐私政策》和《用户协议》后继续使用。</view>
      <view class="gate-buttons">
        <button class="gate-btn secondary" @tap="handleReject">不同意并退出</button>
        <button class="gate-btn primary" @tap="handleAccept">同意并继续</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { useGlobalStore } from '../../store/global.js'
import { useUserStore } from '../../store/user.js'
import { usePrivacyStore } from '../../store/privacy.js'
import { connectWebSocket } from '../../utils/socket.js'
import { ref } from 'vue'

const gateMode = ref(false)
const globalStore = useGlobalStore()
const userStore = useUserStore()
const privacyStore = usePrivacyStore()

const goToAccountCancellation = () => {
  uni.navigateTo({ url: '/pages/user/account-cancel' })
}

const goToUserAgreement = () => {
  uni.navigateTo({ url: '/pages/common/user-agreement' })
}

const handleAccept = async () => {
  privacyStore.accept()
  // 初始化必要模块，确保同意后正常运行
  globalStore.initApp()
  await userStore.checkLoginStatus()
  if (userStore.hasLogin) {
    connectWebSocket(userStore.token)
  }
  privacyStore.collectOaid()
  // 返回首页
  uni.reLaunch({ url: '/pages/home/index' })
}

const handleReject = () => {
  if (typeof plus !== 'undefined' && plus.runtime && typeof plus.runtime.quit === 'function') {
    plus.runtime.quit()
  } else {
    uni.showToast({
      title: '需要同意后才能使用',
      icon: 'none'
    })
  }
}

onLoad((options) => {
  gateMode.value = options?.gate === '1'
})
</script>

<style scoped>
.policy-page {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 24rpx;
  box-sizing: border-box;
}

.header {
  margin-bottom: 24rpx;
}

.links {
  margin-top: 10rpx;
}

.link {
  color: #2563eb;
  font-size: 26rpx;
  text-decoration: underline;
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

.policy-scroll {
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

.bullet {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f3f4f6;
  border-radius: 12rpx;
}

.bullet-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2937;
}

.bullet-text {
  font-size: 24rpx;
  color: #4b5563;
  line-height: 1.6;
  margin-top: 6rpx;
}

.primary-btn {
  margin-top: 20rpx;
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  text-align: center;
  border-radius: 42rpx;
  background: #2563eb;
  color: #fff;
  font-size: 30rpx;
  border: none;
}

.gate-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.gate-text {
  font-size: 26rpx;
  color: #4b5563;
  margin-bottom: 16rpx;
}

.gate-buttons {
  display: flex;
  gap: 16rpx;
}

.gate-btn {
  flex: 1;
  height: 92rpx;
  line-height: 92rpx;
  text-align: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.gate-btn.secondary {
  background: #f3f4f6;
  color: #1f2937;
}

.gate-btn.primary {
  background: #2563eb;
  color: #ffffff;
}
</style>


