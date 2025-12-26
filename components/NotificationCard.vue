<template>
	<view class="card-glass" :class="{ 'unread': !notification.is_read }" @click="$emit('click')">
		<view class="icon-wrapper" :style="{ backgroundColor: iconBgColor }">
			<text class="icon-text">{{ iconText }}</text>
		</view>
		<view class="content-wrapper">
			<view class="content-header">
				<text class="title">{{ notification.title }}</text>
				<text class="time">{{ formattedTime }}</text>
			</view>
			<text class="content-text">{{ notification.content }}</text>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	notification: {
		type: Object,
		required: true
	}
})

defineEmits(['click'])

const notificationInfo = computed(() => {
	switch (Number(props.notification.type)) {
		case 0: return { icon: '系统', color: '#f1c40f' }; // 系统通知
		case 1: return { icon: '项目', color: '#3498db' }; // 项目通知
		case 2: return { icon: '投标', color: '#9b59b6' }; // 投标通知
		case 3: return { icon: '订单', color: '#2ecc71' }; // 订单通知
		default: return { icon: '通知', color: '#f1c40f' }; // 其他
	}
})

const iconText = computed(() => notificationInfo.value.icon)
const iconBgColor = computed(() => notificationInfo.value.color)

const formattedTime = computed(() => {
	if (!props.notification.created_at) return ''
	const date = new Date(props.notification.created_at)
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
.card-glass.unread {
	background: rgba(255, 255, 255, 0.25);
	border-color: rgba(255, 255, 255, 0.4);
}

.icon-wrapper {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 25rpx;
	color: #fff;
	font-size: 24rpx;
	font-weight: bold;
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

.title {
	font-size: 30rpx;
	font-weight: 500;
}

.time {
	font-size: 24rpx;
	opacity: 0.7;
}

.content-text {
	font-size: 26rpx;
	opacity: 0.8;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>