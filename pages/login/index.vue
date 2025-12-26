<template>
	<view class="login-container">
		<!-- 头部品牌 -->
		<view class="header">
			<text class="brand-name">国中宝</text>
			<text class="brand-slogan">一站式招投标服务平台</text>
		</view>
		
		<!-- 登录表单 -->
		<view class="login-form-container">
			<view class="glass-effect">
				<text class="welcome-text">欢迎回来</text>
				
				<view class="form-item">
					<text class="form-label">用户名</text>
					<view class="input-container">
						<image class="input-icon" src="/static/icons/user.png"></image>
						<input class="form-input" type="text" v-model="loginForm.username" placeholder="请输入用户名"/>
					</view>
				</view>
				
				<view class="form-item">
					<text class="form-label">密码</text>
					<view class="input-container">
						<image class="input-icon" src="/static/icons/lock.png"></image>
						<input class="form-input" type="password" v-model="loginForm.password" placeholder="请输入密码"/>
					</view>
				</view>
				
				<view class="form-options">
					<view class="remember-pwd">
						<checkbox :checked="loginForm.remember" @tap="loginForm.remember = !loginForm.remember" style="transform:scale(0.7)"/>
						<text>记住密码</text>
					</view>
					<text class="forget-pwd" @tap="goToForgetPassword">忘记密码?</text>
				</view>
				
				<!-- 协议勾选：应用宝要求不得默认勾选 -->
				<view class="agreement-row">
					<checkbox :checked="loginForm.agreePolicy" @tap="toggleAgreePolicy" style="transform:scale(0.7)" />
					<text class="agreement-text">
						我已阅读并同意
						<text class="agreement-link" @tap="goToPrivacyPolicy">《隐私政策》</text>
						和
						<text class="agreement-link" @tap="goToUserAgreement">《用户协议》</text>
					</text>
				</view>
				
				<button class="login-btn" @tap="handleLogin">登录</button>
				
				<view class="register-link">
					<text>还没有账号? </text>
					<text class="link-text" @tap="goToRegister">立即注册</text>
				</view>
			</view>
		</view>
		
		<!-- 底部 -->
		<view class="footer">
			<view class="footer-btn" @tap="goToHelp">
				<image class="footer-icon" src="/static/icons/help.png"></image>
				<text class="footer-text">帮助</text>
			</view>
			<view class="footer-btn" @tap="contactCustomerService">
				<image class="footer-icon" src="/static/icons/phone.png"></image>
				<text class="footer-text">客服</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../store/user.js' 
import { APP_CONFIG } from '../../config/index.js'
import { connectWebSocket } from '../../utils/socket.js' // 改为静态导入

const userStore = useUserStore()
const loginForm = ref({
  username: '',
  password: '',
  remember: false,
  // 隐私与用户协议勾选，默认不勾选，满足应用商店要求
  agreePolicy: false
})

const handleLogin = async () => {
  if (!loginForm.value.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!loginForm.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  // 未勾选隐私与用户协议时，禁止登录
  if (!loginForm.value.agreePolicy) {
    uni.showToast({ title: '请先阅读并同意隐私政策和用户协议', icon: 'none' })
    return
  }

  try {
    // 显示加载提示
    uni.showLoading({ title: '登录中...' })
    
    // 使用 userStore 的 login 方法
    const credentials = {
      username: loginForm.value.username,
      password: loginForm.value.password
    }
    
    await userStore.login(credentials)
    
    // 登录成功
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    // 登录成功后立即初始化WebSocket - 使用动态import
    try {
       // 登录成功后调用初始化函数 - 不再使用动态 import
          console.log('登录成功，开始初始化WebSocket')
          connectWebSocket(userStore.token) // 直接调用
    } catch (socketError) {
      console.warn('WebSocket初始化失败:', socketError)
    }
    
    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/index' })
    }, 1500)
    
  } catch (error) {
    uni.hideLoading()
    console.error('登录失败:', error)
    
    // 显示错误信息
    const errorMsg = error.message || error.errMsg || '登录失败，请重试'
    uni.showToast({ title: errorMsg, icon: 'none' })
  }
}

// 其他方法
const toggleAgreePolicy = () => {
  loginForm.value.agreePolicy = !loginForm.value.agreePolicy
}
const goToPrivacyPolicy = () => uni.navigateTo({ url: '/pages/common/privacy-policy' })
const goToUserAgreement = () => uni.navigateTo({ url: '/pages/common/user-agreement' })
const goToRegister = () => uni.navigateTo({ url: '/pages/register/index' })
const goToForgetPassword = () => uni.navigateTo({ url: '/pages/login/forget-password' })
const goToHelp = () => uni.showToast({ title: '763705036@qq.com', icon: 'none' })
const contactCustomerService = () => uni.showToast({ title: '763705036@qq.com', icon: 'none' })
</script>
 
<style>
.login-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
	position: relative;
	overflow: hidden;
}

/* 背景装饰元素 */
.login-container::before {
	content: '';
	position: absolute;
	top: -50%;
	right: -50%;
	width: 100%;
	height: 100%;
	background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
	z-index: 0;
}

.login-container::after {
	content: '';
	position: absolute;
	bottom: -50%;
	left: -50%;
	width: 100%;
	height: 100%;
	background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
	z-index: 0;
}

@keyframes gradient {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}

.header {
	padding: 80rpx 40rpx 30rpx;
	position: relative;
	z-index: 1;
}

.brand-name {
	font-size: 72rpx;
	font-weight: bold;
	color: #ffffff;
	text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	letter-spacing: 2px;
	background: linear-gradient(to right, #ffffff, #e2e8f0);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.brand-slogan {
	font-size: 32rpx;
	color: rgba(255, 255, 255, 0.9);
	margin-top: 10rpx;
	display: block;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-form-container {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 0 40rpx;
	position: relative;
	z-index: 1;
}

.glass-effect {
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	background-color: rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.3);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	border-radius: 32rpx;
	padding: 50rpx;
	position: relative;
	overflow: hidden;
}

.glass-effect::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 1px;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
}

.welcome-text {
	font-size: 42rpx;
	font-weight: bold;
	color: #fff;
	margin-bottom: 50rpx;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	letter-spacing: 1px;
}

.form-item {
	margin-bottom: 40rpx;
}

.form-label {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 15rpx;
	display: block;
	font-weight: 500;
	letter-spacing: 0.5px;
}

.input-container {
	position: relative;
}

.input-icon {
	position: absolute;
	left: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 40rpx;
	height: 40rpx;
	opacity: 0.8;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.form-input {
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(5px);
	-webkit-backdrop-filter: blur(5px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 16rpx;
	height: 90rpx;
	padding-left: 80rpx;
	font-size: 28rpx;
	color: #fff;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
}
.form-input::placeholder {
	color: rgba(255, 255, 255, 0.6);
}

.form-input:focus {
	border-color: rgba(255, 255, 255, 0.5);
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.form-options {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 26rpx;
	margin-bottom: 24rpx;
}

.remember-pwd {
	display: flex;
	align-items: center;
	color: rgba(255, 255, 255, 0.9);
}

.agreement-row {
	display: flex;
	align-items: flex-start;
	margin-bottom: 32rpx;
}

.agreement-text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.85);
	line-height: 1.6;
}

.agreement-link {
	color: #bfdbfe;
	text-decoration: underline;
}

.forget-pwd {
	color: #bfdbfe;
	font-weight: 500;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.forget-pwd:active {
	opacity: 0.8;
}

.login-btn {
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	color: #fff;
	height: 90rpx;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 40rpx;
	box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
	border: none;
	letter-spacing: 1px;
	position: relative;
	overflow: hidden;
	transition: all 0.3s ease;
}

.login-btn::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	transition: all 0.5s ease;
}

.login-btn:active {
	transform: translateY(2px);
	box-shadow: 0 2px 6px rgba(29, 78, 216, 0.2);
}

.login-btn:active::before {
	left: 100%;
}

.register-link {
	text-align: center;
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.9);
}

.link-text {
	color: #bfdbfe;
	font-weight: 600;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.link-text:active {
	opacity: 0.8;
}

.footer {
	padding: 40rpx 0;
	display: flex;
	justify-content: center;
	gap: 80rpx;
	position: relative;
	z-index: 1;
}

.footer-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	color: rgba(255, 255, 255, 0.9);
	transition: all 0.3s ease;
}

.footer-btn:active {
	transform: scale(0.95);
}

.footer-icon {
	width: 48rpx;
	height: 48rpx;
	margin-bottom: 8rpx;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.footer-text {
	font-size: 24rpx;
	font-weight: 500;
}
</style>