<template>
	<view class="project-card-glass">
		<view class="card-header">
			<text class="project-title">{{ project.title }}</text>
			<view class="budget-tag">
				<text>¥{{ project.budget_min }}-¥{{ project.budget_max }}</text>
			</view>
		</view>
		<view class="card-body">
			<text class="project-description">{{ project.description }}</text>
		</view>
		<view class="card-footer">
			<view class="footer-item">
				<image class="footer-icon" src="/static/icons/bids.png"></image>
				<text>{{ project.bid_count || 0 }}人投标</text>
			</view>
			<view class="footer-item">
				<image class="footer-icon" src="/static/icons/deadline.png"></image>
				<text>截止: {{ formattedDeadline }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	project: {
		type: Object,
		required: true
	}
})

const formattedDeadline = computed(() => {
	if (!props.project.deadline) return 'N/A'
	// 简单格式化，只取日期部分
	return props.project.deadline.split('T')[0]
})
</script>

<style scoped>
.project-card-glass {
	background: rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 24rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	color: #fff;
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.project-card-glass:active {
	transform: scale(0.98);
	background: rgba(255, 255, 255, 0.2);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 20rpx;
}

.project-title {
	font-size: 34rpx;
	font-weight: bold;
	flex: 1;
	margin-right: 20rpx;
	line-height: 1.4;
}

.budget-tag {
	background: rgba(255, 215, 0, 0.2);
	border: 1px solid rgba(255, 215, 0, 0.5);
	color: #FFD700;
	padding: 8rpx 16rpx;
	border-radius: 30rpx;
	font-size: 24rpx;
	font-weight: 500;
	flex-shrink: 0;
}

.card-body {
	margin-bottom: 30rpx;
}

.project-description {
	font-size: 28rpx;
	opacity: 0.85;
	line-height: 1.6;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}

.card-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 26rpx;
	opacity: 0.7;
	border-top: 1px solid rgba(255, 255, 255, 0.2);
	padding-top: 20rpx;
}

.footer-item {
	display: flex;
	align-items: center;
}

.footer-icon {
	width: 32rpx;
	height: 32rpx;
	margin-right: 10rpx;
	opacity: 0.8;
}
</style>