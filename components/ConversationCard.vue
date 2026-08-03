<template>
	<view class="card-glass" @click="$emit('click')">
		<view class="avatar-wrapper">
			<image class="avatar" :src="chat.target_user.avatar || '/static/images/default-avatar.png'"></image>
			<view v-if="chat.unread_count > 0" class="unread-badge">{{ chat.unread_count > 99 ? '99+' : chat.unread_count }}</view>
		</view>
		<view class="content-wrapper">
			<view class="content-header">
				<text class="username">{{ chat.target_user.username }}</text>
				<text class="time">{{ formattedTime }}</text>
			</view>
			<view v-if="chat.project_title" class="project-tag">
				<text class="project-tag-text">{{ chat.project_title }}</text>
			</view>
			<text class="last-message">{{ chat.last_message }}</text>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	chat: {
		type: Object,
		required: true
	}
})

defineEmits(['click'])

const formattedTime = computed(() => {
	if (!props.chat.last_time) return ''
	const date = new Date(props.chat.last_time)
	const now = new Date()
	const diff = (now.getTime() - date.getTime()) / 1000 // seconds

	if (diff < 60) return '刚刚'
	if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
	if (diff < 86400 && date.getDate() === now.getDate()) return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
	if (diff < 172800 && now.getDate() - date.getDate() === 1) return '昨天'
	
	return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
})
</script>

<style scoped>
.card-glass {
	display: flex;
	align-items: center;
	padding: 30rpx;
	background: rgba(255, 255, 255, 0.15);
	border-radius: 24rpx;
	margin-bottom: 20rpx;
	border: 1px solid rgba(255, 255, 255, 0.2);
	transition: background-color 0.3s;
}
.card-glass:active {
	background-color: rgba(255, 255, 255, 0.25);
}

.avatar-wrapper {
	position: relative;
	margin-right: 25rpx;
}

.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
}

.unread-badge {
	position: absolute;
	top: -5rpx;
	right: -5rpx;
	background-color: #ff4757;
	color: #fff;
	font-size: 20rpx;
	min-width: 36rpx;
	height: 36rpx;
	border-radius: 18rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 8rpx;
	border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.content-wrapper {
	flex: 1;
	overflow: hidden;
	color: #fff;
}

.content-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.project-tag {
	margin-bottom: 8rpx;
}

.project-tag-text {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.9);
	background: rgba(255, 255, 255, 0.15);
	padding: 4rpx 14rpx;
	border-radius: 8rpx;
	border: 1px solid rgba(255, 255, 255, 0.2);
	max-width: 400rpx;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	display: inline-block;
}

.username {
	font-size: 32rpx;
	font-weight: 500;
}

.time {
	font-size: 24rpx;
	opacity: 0.7;
}

.last-message {
	font-size: 28rpx;
	opacity: 0.8;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>