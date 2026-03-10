<template>
	<view class="user-page-container">
		<!-- 用户信息 -->
		<view v-if="user" class="user-content">
			<view class="glass-effect">
				<!-- 用户头部 -->
				<view class="user-header" @click="goToProfile">
					<image class="avatar" :src="user.avatar || '/static/images/default-avatar.png'"></image>
					<view class="user-info">
						<view class="username-line">
							<text class="username">{{ user.username }}</text>
							<view v-if="user.is_verified" class="verified-badge">
								<text class="verified-icon">✓</text>
								<text>已认证</text>
							</view>
						</view>
						<view class="rating-line">
							<text class="rating-label">信誉分: </text>
							<text class="rating-score">{{ user.rating }}</text>
						
							<text
								v-if="membershipLabel"
								class="member-badge"
								:class="membershipBadgeClass"
							>{{ membershipLabel }}</text>
						</view>
					</view>
					<view class="arrow">
						<text>›</text>
					</view>
				</view>

				<!-- 账户信息 -->
				<view class="account-info">
					<view class="balance-section">
						<text class="balance-label">账户余额 (元)</text>
						<text class="balance-amount">{{ user.balance.toFixed(2) }}</text>
					</view>
					<!-- <button class="recharge-btn" @click="goToWallet">充值</button> -->
				</view>

				<!-- 功能菜单 -->
				<view class="menu-list">
					<view class="menu-item" @click="goToMyProjects">
						<image class="menu-icon" src="/static/icons/projects.png"></image>
						<text class="menu-text">我的项目</text>
						<text class="menu-arrow">›</text>
					</view>
					<view class="menu-item" @click="goToMyBids">
						<image class="menu-icon" src="/static/icons/bids.png"></image>
						<text class="menu-text">我的投标</text>
						<text class="menu-arrow">›</text>
					</view>
					<view class="menu-item" @click="goToMyOrders">
						<image class="menu-icon" src="/static/icons/order.png"></image>
						<text class="menu-text">我的订单</text>
						<text class="menu-arrow">›</text>
					</view>
					<view class="menu-item" @click="goToVerify" v-if="!user.is_verified">
						<image class="menu-icon" src="/static/icons/verify.png"></image>
						<text class="menu-text">实名认证</text>
						<text class="menu-arrow">›</text>
					</view>
					<view class="menu-item" @click="goToSettings">
						<image class="menu-icon" src="/static/icons/settings.png"></image>
						<text class="menu-text">设置</text>
						<text class="menu-arrow">›</text>
					</view>
					<view class="menu-item" @click="goToWebSocketDebug" v-if="user && user.role === 'admin'">
						<image class="menu-icon" src="/static/icons/settings.png"></image>
						<text class="menu-text">WebSocket调试</text>
						<text class="menu-arrow">›</text>
					</view>
				</view>

		
			</view>
		</view>

		<!-- 未登录提示 -->
		<view v-else class="login-prompt-container">
			<view class="glass-effect">
				<image class="prompt-logo" src="/static/images/logo.png"></image>
				<text class="prompt-text">登录后体验完整功能</text>
				<button class="prompt-login-btn" @click="goToLogin">立即登录</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user.js'

const userStore = useUserStore() 

// 使用 computed 属性确保数据响应性
const user = computed(() => userStore.userInfo)
const isEnterpriseMember = computed(() => (user.value?.user_type ?? 0) !== 0)
const membershipLabel = computed(() => {
	if (!user.value) return ''
	return isEnterpriseMember.value ? '企业会员：可开13%税额发票' : '个体公司会员：可开1%税额发票'
})
const membershipBadgeClass = computed(() => (
	isEnterpriseMember.value ? 'enterprise-badge' : 'individual-badge'
))

// 每次进入页面时，刷新用户信息
onShow(async () => {
	if (userStore.token) {
		await userStore.getUserInfo()
	}
})

const goToProfile = () => {
	uni.navigateTo({ url: '/pages/user/myinformation' })
}

const goToWallet = () => {
	uni.navigateTo({ url: '/pages/user/wallet' })
}

const goToMyProjects = () => {
	uni.navigateTo({ url: '/pages/user/projects' })
}

const goToMyBids = () => {
	uni.navigateTo({ url: '/pages/user/mybids' })
}

const goToMyOrders = () => {
	uni.navigateTo({ url: '/pages/orders/index' })
}

const goToVerify = () => {
	uni.navigateTo({ url: '/pages/user/verify' })
}

const goToSettings = () => {
	uni.navigateTo({ url: '/pages/user/settings' })
}

const goToLogin = () => {
	uni.navigateTo({ url: '/pages/login/index' })
}

const goToWebSocketDebug = () => {
	uni.navigateTo({ url: '/pages/test/websocket-debug' })
}


</script>

<style scoped>
/* 基础容器和背景 */
.user-page-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
	padding: 40rpx;
	box-sizing: border-box;
}

@keyframes gradient {
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
}

.user-content {
	width: 100%;
}

/* 毛玻璃效果 */
.glass-effect {
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	background-color: rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.3);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	border-radius: 32rpx;
	padding: 40rpx;
	color: #fff;
}

/* 用户头部 */
.user-header {
	display: flex;
	align-items: center;
	margin-bottom: 40rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	border: 2px solid rgba(255, 255, 255, 0.5);
	margin-right: 30rpx;
}

.user-info {
	flex: 1;
}

.username-line {
	display: flex;
	align-items: center;
	margin-bottom: 10rpx;
}

.username {
	font-size: 40rpx;
	font-weight: bold;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.verified-badge {
	display: flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 20rpx;
	padding: 6rpx 12rpx;
	margin-left: 20rpx;
	font-size: 22rpx;
}

.verified-icon {
	margin-right: 6rpx;
	font-weight: bold;
}

.rating-line {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex-wrap: wrap;
	font-size: 28rpx;
	opacity: 0.8;
}

.member-badge {
	padding: 6rpx 16rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	line-height: 1;
	font-weight: 600;
}

.individual-badge {
	background: rgba(255, 255, 255, 0.18);
	color: #eef2ff;
	border: 1px solid rgba(255, 255, 255, 0.2);
}

.enterprise-badge {
	background: rgba(251, 191, 36, 0.2);
	color: #fde68a;
	border: 1px solid rgba(251, 191, 36, 0.35);
}

.arrow {
	font-size: 40rpx;
	color: rgba(255, 255, 255, 0.5);
}

/* 账户信息 */
.account-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: rgba(0, 0, 0, 0.1);
	border-radius: 24rpx;
	padding: 30rpx;
	margin-bottom: 40rpx;
}

.balance-label {
	font-size: 26rpx;
	opacity: 0.8;
	margin-bottom: 10rpx;
}

.balance-amount {
	font-size: 48rpx;
	font-weight: bold;
}

.recharge-btn {
	background: linear-gradient(135deg, #f6d365, #fda085);
	color: #fff;
	border: none;
	border-radius: 40rpx;
	padding: 0 40rpx;
	height: 60rpx;
	line-height: 60rpx;
	font-size: 28rpx;
	font-weight: bold;
	box-shadow: 0 4px 10px rgba(253, 160, 133, 0.3);
}

/* 菜单列表 */
.menu-list {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 30rpx 20rpx;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 20rpx;
	transition: background-color 0.3s;
}

.menu-item:active {
	background-color: rgba(255, 255, 255, 0.2);
}

.menu-icon {
	width: 48rpx;
	height: 48rpx;
	margin-right: 30rpx;
}

.menu-text {
	flex: 1;
	font-size: 32rpx;
}

.menu-arrow {
	font-size: 36rpx;
	color: rgba(255, 255, 255, 0.5);
}

/* 退出按钮 */
.logout-btn {
	width: 100%;
	margin-top: 50rpx;
	height: 90rpx;
	line-height: 90rpx;
	background: rgba(255, 82, 82, 0.2);
	border: 1px solid rgba(255, 82, 82, 0.5);
	color: #ffcdd2;
	border-radius: 20rpx;
	font-size: 32rpx;
	font-weight: bold;
}

/* 未登录提示 */
.login-prompt-container {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.login-prompt-container .glass-effect {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
}

.prompt-logo {
	width: 150rpx;
	height: 150rpx;
	margin-bottom: 40rpx;
	opacity: 0.8;
}

.prompt-text {
	font-size: 32rpx;
	margin-bottom: 50rpx;
	opacity: 0.9;
}

.prompt-login-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	color: #fff;
	border: none;
	border-radius: 45rpx;
	font-size: 32rpx;
	font-weight: bold;
}
</style>