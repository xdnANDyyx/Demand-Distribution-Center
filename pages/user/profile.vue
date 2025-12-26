<template>
	<view class="profile-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-btn" @tap="goBack">
				<image class="back-icon" src="/static/icons/arrow_left.png"></image>
			</view>
			<text class="page-title">用户主页</text>
		</view>
		
		<!-- 用户基本信息卡片 -->
		<view class="card-glass user-card">
			<view class="user-header">
				<image class="avatar" :src="userInfo.avatar || '/static/icons/user.png'"></image>
				<view class="user-info">
					<text class="username">{{ userInfo.username }}</text>
					<view class="user-stats">
						<view class="stat-item">
							<text class="stat-value">{{ userInfo.rating || 0 }}</text>
							<text class="stat-label">信誉分</text>
						</view>
						<view class="stat-item">
							<text class="stat-value">{{ userInfo.projectCount || 0 }}</text>
							<text class="stat-label">发布项目</text>
						</view>
						<view class="stat-item">
							<text class="stat-value">{{ userInfo.completedCount || 0 }}</text>
							<text class="stat-label">完成项目</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="user-description">
				<text class="description-title">个人简介</text>
				<text class="description-content">{{ userInfo.description || '这个人很懒，什么都没留下...' }}</text>
			</view>
			
			<view class="action-buttons">
				<button class="action-btn contact-btn" @tap="handleContact">联系TA</button>
			</view>
		</view>
		
		<!-- 用户认证信息 -->
		<view class="card-glass verify-card">
			<view class="card-title">认证信息</view>
			<view class="verify-items">
				<view class="verify-item" :class="{'verified': userInfo.isRealNameVerified}">
					<image class="verify-icon" :src="userInfo.isRealNameVerified ? '/static/icons/verified.png' : '/static/icons/unverified.png'"></image>
					<text class="verify-text">实名认证</text>
				</view>
				<view class="verify-item" :class="{'verified': userInfo.isPhoneVerified}">
					<image class="verify-icon" :src="userInfo.isPhoneVerified ? '/static/icons/verified.png' : '/static/icons/unverified.png'"></image>
					<text class="verify-text">手机认证</text>
				</view>
				<view class="verify-item" :class="{'verified': userInfo.isEmailVerified}">
					<image class="verify-icon" :src="userInfo.isEmailVerified ? '/static/icons/verified.png' : '/static/icons/unverified.png'"></image>
					<text class="verify-text">邮箱认证</text>
				</view>
			</view>
		</view>
		
		<!-- 用户项目列表 -->
		<view class="card-glass projects-card">
			<view class="card-title">发布的项目</view>
			<view v-if="userProjects.length > 0" class="project-list">
				<view v-for="(project, index) in userProjects" :key="index" class="project-item" @tap="goToProjectDetail(project.id)">
					<text class="project-title">{{ project.title }}</text>
					<view class="project-info">
						<text class="project-category">{{ project.category }}</text>
						<text class="project-date">{{ project.createdAt }}</text>
					</view>
					<view class="project-status" :class="getStatusClass(project.status)">
						{{ getStatusText(project.status) }}
					</view>
				</view>
			</view>
			<view v-else class="empty-projects">
				<text>暂无发布的项目</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get } from '../../utils/request.js'

// 获取页面参数
const userId = ref('')
const userInfo = ref({})
const userProjects = ref([])

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const response = await get(`/users/${userId.value}`)
    userInfo.value = response
    uni.hideLoading()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '获取用户信息失败', icon: 'none' })
    console.error('获取用户信息失败:', error)
  }
}

// 获取用户发布的项目
const fetchUserProjects = async () => {
  try {
    const response = await get(`/projects/user/${userId.value}`)
    userProjects.value = response
  } catch (error) {
    console.error('获取用户项目失败:', error)
  }
}

// 页面加载时获取数据
onLoad((options) => {
  console.log("传递的用户ID:", options)
  
  // 获取传递的用户ID
  if (options && options.id) {
    userId.value = options.id
    fetchUserInfo()
    fetchUserProjects()
  } else {
    uni.showToast({ title: '用户ID不存在', icon: 'none' })
    setTimeout(() => {
      goBack()
    }, 1500)
  }
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 联系用户
const handleContact = () => {
  uni.navigateTo({
    url: `/pages/messages/chat?targetId=${userId.value}&username=${userInfo.value.username}`
  })
}

// 跳转到项目详情
const goToProjectDetail = (projectId) => {
  uni.navigateTo({
    url: `/pages/projects/detail?id=${projectId}`
  })
}

// 获取项目状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case 'open': return 'status-open'
    case 'in_progress': return 'status-progress'
    case 'completed': return 'status-completed'
    case 'cancelled': return 'status-cancelled'
    default: return ''
  }
}

// 获取项目状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'open': return '招标中'
    case 'in_progress': return '进行中'
    case 'completed': return '已完成'
    case 'cancelled': return '已取消'
    default: return '未知'
  }
}
</script>

<style>
.profile-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #f0f4ff, #e6f0ff);
	padding-bottom: 40rpx;
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

.card-glass {
	margin: 30rpx;
	padding: 30rpx;
	border-radius: 20rpx;
	background-color: rgba(255, 255, 255, 0.8);
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10rpx);
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	border-bottom: 2rpx solid #f0f0f0;
	padding-bottom: 15rpx;
}

.user-card {
	margin-top: 20rpx;
}

.user-header {
	display: flex;
	align-items: center;
	padding-bottom: 30rpx;
}

.avatar {
	width: 150rpx;
	height: 150rpx;
	border-radius: 75rpx;
	border: 4rpx solid #fff;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.user-info {
	flex: 1;
	margin-left: 30rpx;
}

.username {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 15rpx;
}

.user-stats {
	display: flex;
	margin-top: 20rpx;
}

.stat-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-value {
	font-size: 32rpx;
	font-weight: bold;
	color: #3b82f6;
}

.stat-label {
	font-size: 24rpx;
	color: #666;
	margin-top: 5rpx;
}

.user-description {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 2rpx solid #f0f0f0;
}

.description-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.description-content {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
}

.action-buttons {
	display: flex;
	justify-content: center;
	margin-top: 30rpx;
}

.action-btn {
	width: 80%;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	font-weight: bold;
}

.contact-btn {
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	color: #fff;
	box-shadow: 0 4rpx 10rpx rgba(59, 130, 246, 0.3);
}

.verify-card {
	margin-top: 20rpx;
}

.verify-items {
	display: flex;
	justify-content: space-around;
}

.verify-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx;
}

.verify-icon {
	width: 60rpx;
	height: 60rpx;
	margin-bottom: 10rpx;
}

.verify-text {
	font-size: 24rpx;
	color: #999;
}

.verified .verify-text {
	color: #3b82f6;
	font-weight: bold;
}

.projects-card {
	margin-top: 20rpx;
}

.project-list {
	max-height: 600rpx;
	overflow-y: auto;
}

.project-item {
	padding: 20rpx 0;
	border-bottom: 2rpx solid #f0f0f0;
}

.project-item:last-child {
	border-bottom: none;
}

.project-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.project-info {
	display: flex;
	justify-content: space-between;
	font-size: 24rpx;
	color: #999;
	margin-bottom: 10rpx;
}

.project-status {
	display: inline-block;
	padding: 4rpx 15rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	color: #fff;
}

.status-open {
	background-color: #3b82f6;
}

.status-progress {
	background-color: #f59e0b;
}

.status-completed {
	background-color: #10b981;
}

.status-cancelled {
	background-color: #ef4444;
}

.empty-projects {
	padding: 40rpx 0;
	text-align: center;
	color: #999;
	font-size: 28rpx;
}
</style>