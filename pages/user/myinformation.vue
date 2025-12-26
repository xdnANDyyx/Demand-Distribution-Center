<template>
	<view class="myinfo-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-btn" @tap="goBack">
				<image class="back-icon" src="/static/icons/arrow_left.png"></image>
			</view>
			<text class="page-title">个人信息</text>
		</view>
		
		<!-- 个人信息表单 -->
		<view class="form-container">
			<!-- 头像上传 -->
			<view class="avatar-section">
				<text class="section-title">头像</text>
				<view class="avatar-upload">
					<image class="avatar-preview" :src="formData.avatar || '/static/icons/user.png'" @tap="chooseAvatar"></image>
					<text class="upload-hint">点击更换头像</text>
				</view>
			</view>
			
			<!-- 基本信息 -->
			<view class="info-section">
				<text class="section-title">基本信息</text>
				
				<view class="form-item">
					<text class="form-label">真实姓名</text>
					<input class="form-input" type="text" v-model="formData.realName" placeholder="请输入您的真实姓名"/>
				</view>
				
				<view class="form-item">
					<text class="form-label">公司名称</text>
					<input class="form-input" type="text" v-model="formData.companyName" placeholder="请输入您的公司名称（选填）"/>
				</view>
				
				<!-- 用户名和其他不可修改的信息 -->
				<view class="form-item readonly">
					<text class="form-label">用户名</text>
					<input class="form-input" type="text" :value="userInfo.username" disabled/>
					<text class="readonly-hint">用户名不可修改</text>
				</view>
				
				<view class="form-item readonly" v-if="userInfo.email">
					<text class="form-label">邮箱</text>
					<input class="form-input" type="text" :value="userInfo.email" disabled/>
					<text class="readonly-hint">邮箱不可修改</text>
				</view>
				
				<view class="form-item readonly" v-if="userInfo.phone">
					<text class="form-label">手机号</text>
					<input class="form-input" type="text" :value="userInfo.phone" disabled/>
					<text class="readonly-hint">手机号不可修改</text>
				</view>
			</view>
			
			<!-- 提交按钮 -->
			<button class="submit-btn" @tap="handleSubmit">保存修改</button>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user.js'
import { uploadImage } from '../../api/upload.js'

const userStore = useUserStore()
const userInfo = ref({})

// 表单数据
const formData = ref({
	avatar: '',
	realName: '',
	companyName: ''
})

// 页面加载时初始化数据
onLoad(() => {
	// 获取当前用户信息
	userInfo.value = userStore.userInfo || {}
	
	// 初始化表单数据
	formData.value = {
		avatar: userInfo.value.avatar || '',
		realName: userInfo.value.real_name || '',
		companyName: userInfo.value.company_name || ''
	}
})

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}

// 选择头像
const chooseAvatar = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			try {
				uni.showLoading({ title: '上传中...' })
				
				// 上传图片
				const result = await uploadImage(res.tempFilePaths[0])
				
				if (result && result.url) {
					formData.value.avatar = result.url
					uni.hideLoading()
					uni.showToast({ title: '头像上传成功', icon: 'success' })
				} else {
					throw new Error('上传失败')
				}
			} catch (error) {
				uni.hideLoading()
				console.error('上传头像失败:', error)
				uni.showToast({ title: '上传失败', icon: 'none' })
			}
		}
	})
}

// 提交表单
const handleSubmit = async () => {
	try {
		// 表单验证
		if (!formData.value.realName) {
			uni.showToast({ title: '请输入真实姓名', icon: 'none' })
			return
		}
		
		// 显示加载提示
		uni.showLoading({ title: '保存中...' })
		
		// 准备提交的数据
		const updateData = {
			avatar: formData.value.avatar,
			real_name: formData.value.realName,
			company_name: formData.value.companyName
		}
		
		// 调用更新接口
		await userStore.updateUserInfo(updateData)
		
		uni.hideLoading()
		uni.showToast({ title: '保存成功', icon: 'success' })
		
		// 延迟返回
		setTimeout(() => {
			goBack()
		}, 1500)
	} catch (error) {
		uni.hideLoading()
		const errorMsg = error.message || error.errMsg || '保存失败，请重试'
		uni.showToast({ title: errorMsg, icon: 'none' })
	}
}
</script>

<style>
.myinfo-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #f0f4ff, #e6f0ff);
}

.navbar {
	display: flex;
	align-items: center;
	height: 90rpx;
	background-color: #3b82f6;
	padding: 0 30rpx;
	padding-top: var(--status-bar-height);
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
	flex: 1;
	text-align: center;
	font-size: 36rpx;
	font-weight: bold;
	color: #ffffff;
	margin-right: 60rpx;
}

.form-container {
	padding: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.avatar-section {
	margin-bottom: 40rpx;
}

.avatar-upload {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.avatar-preview {
	width: 200rpx;
	height: 200rpx;
	border-radius: 100rpx;
	border: 4rpx solid #fff;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
	margin-bottom: 20rpx;
}

.upload-hint {
	font-size: 26rpx;
	color: #666;
}

.info-section {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-item {
	margin-bottom: 30rpx;
}

.form-item:last-child {
	margin-bottom: 0;
}

.form-label {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 10rpx;
	display: block;
}

.form-input {
	width: 100%;
	height: 90rpx;
	background-color: #f5f7fa;
	border-radius: 16rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	color: #333;
	box-sizing: border-box;
}

.readonly .form-input {
	background-color: #f0f0f0;
	color: #999;
}

.readonly-hint {
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
}

.submit-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	color: #fff;
	font-size: 32rpx;
	font-weight: bold;
	border-radius: 45rpx;
	box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
	margin-top: 60rpx;
}

.submit-btn:active {
	transform: translateY(2rpx);
	box-shadow: 0 2rpx 6rpx rgba(59, 130, 246, 0.2);
}
</style>