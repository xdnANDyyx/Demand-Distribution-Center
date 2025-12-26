<template>
	<view class="forget-password-container">
		<!-- 头部 -->
		<view class="header">
			<view class="back-btn" @tap="goBack">
				<image class="back-icon" src="/static/icons/arrow_left.png"></image>
			</view>
			<text class="page-title">找回密码</text>
		</view>
		
		<!-- 表单 -->
		<view class="form-container">
			<view class="glass-effect">
				<text class="instruction-text">请输入您的用户名，我们将为您重置密码</text>
				
				<view class="form-item">
					<text class="form-label">用户名</text>
					<view class="input-container">
						<image class="input-icon" src="/static/icons/user.png"></image>
						<input class="form-input" type="text" v-model="username" placeholder="请输入您的用户名"/>
					</view>
				</view>
				
				<view class="form-item" v-if="showNewPassword">
					<text class="form-label">新密码</text>
					<view class="input-container">
						<image class="input-icon" src="/static/icons/lock.png"></image>
						<input class="form-input" type="password" v-model="newPassword" placeholder="请输入新密码"/>
					</view>
				</view>
				
				<view class="form-item" v-if="showNewPassword">
					<text class="form-label">确认密码</text>
					<view class="input-container">
						<image class="input-icon" src="/static/icons/lock.png"></image>
						<input class="form-input" type="password" v-model="confirmPassword" placeholder="请再次输入新密码"/>
					</view>
				</view>
				
				<button class="submit-btn" @tap="handleSubmit">{{ showNewPassword ? '重置密码' : '下一步' }}</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../store/user.js'

const userStore = useUserStore()
const username = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)

// 返回登录页
const goBack = () => {
  uni.navigateBack()
}

// 处理表单提交
const handleSubmit = async () => {
  // 第一步：验证用户名
  if (!showNewPassword.value) {
    if (!username.value) {
      uni.showToast({ title: '请输入用户名', icon: 'none' })
      return
    }
    
    // 这里可以添加验证用户名是否存在的逻辑
    // 简化版本中，我们假设用户名存在，直接显示密码重置表单
    showNewPassword.value = true
    return
  }
  
  // 第二步：重置密码
  if (!newPassword.value) {
    uni.showToast({ title: '请输入新密码', icon: 'none' })
    return
  }
  
  if (newPassword.value.length < 6) {
    uni.showToast({ title: '密码长度不能少于6位', icon: 'none' })
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '重置密码中...' })
    
    // 调用修改密码API
    await userStore.changePassword({
      username: username.value,
      new_password: newPassword.value
    })
    
    uni.hideLoading()
    uni.showToast({ title: '密码重置成功', icon: 'success' })
    
    // 延迟跳转回登录页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    const errorMsg = error.message || error.errMsg || '密码重置失败，请重试'
    uni.showToast({ title: errorMsg, icon: 'none' })
  }
}
</script>

<style>
.forget-password-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
	position: relative;
	overflow: hidden;
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
	padding: 60rpx 40rpx 30rpx;
	display: flex;
	align-items: center;
	position: relative;
	z-index: 1;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
}

.page-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #ffffff;
	margin-left: 20rpx;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-container {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 40rpx;
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

.instruction-text {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 40rpx;
	display: block;
	line-height: 1.5;
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

.submit-btn {
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	color: #fff;
	height: 90rpx;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 600;
	margin-top: 20rpx;
	box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
	border: none;
	letter-spacing: 1px;
	position: relative;
	overflow: hidden;
	transition: all 0.3s ease;
}

.submit-btn::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	transition: all 0.5s ease;
}

.submit-btn:active {
	transform: translateY(2px);
	box-shadow: 0 2px 6px rgba(29, 78, 216, 0.2);
}

.submit-btn:active::before {
	left: 100%;
}
</style>