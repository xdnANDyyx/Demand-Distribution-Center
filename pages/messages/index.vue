<template>
	<view class="messages-container">
		<!-- 顶部固定区域 -->
		<view class="header-fixed">
			<view class="tab-bar-glass">
				<view 
					class="tab-item" 
					:class="{ active: activeTab === 'chat' }"
					@click="switchTab('chat')"
				>
					<text>聊天</text>
				</view>
				<view 
					class="tab-item" 
					:class="{ active: activeTab === 'notification' }"
					@click="switchTab('notification')"
				>
					<text>通知</text>
					<view v-if="messageStore.unreadNotificationCount > 0" class="badge">
						{{ messageStore.unreadNotificationCount > 99 ? '99+' : messageStore.unreadNotificationCount }}
					</view>
				</view>
				<!-- <view 
					class="tab-item" 
					:class="{ active: activeTab === 'subscription' }"
					@click="switchTab('subscription')"
				>
					<text>订阅</text>
					<view v-if="unreadSubscriptionCount > 0" class="badge">
						{{ unreadSubscriptionCount > 99 ? '99+' : unreadSubscriptionCount }}
					</view>
				</view> -->
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content-area">
			<!-- 聊天列表 -->
			<view v-show="activeTab === 'chat'">
				<view v-if="!loading && hasChatList">
					<conversation-card
						v-for="chat in messageStore.chatList"
						:key="chat.id"
						:chat="chat"
						@click="goToChat(chat.id)"
					></conversation-card>
				</view>
				<view v-if="!loading && !hasChatList" class="empty-state">
					<image src="/static/icons/empty-box.png" class="empty-icon"></image>
					<text class="empty-text">暂无聊天记录</text>
					<button v-if="isLoggedIn" class="refresh-btn" @click="loadData">刷新</button>
					<button v-else class="login-btn" @click="() => uni.navigateTo({ url: '/pages/login/index' })">去登录</button>
				</view>
			</view>

			<!-- 通知列表 -->
			<view v-show="activeTab === 'notification'">
				<view v-if="!loading && hasNotifications">
					<!-- 全部标为已读按钮 -->
					<view v-if="hasUnreadNotifications" class="mark-all-read-container">
						<button class="mark-all-read-btn" @click="handleMarkAllAsRead">
							<text class="mark-all-read-text">全部标为已读</text>
						</button>
					</view>
					
					<notification-card
						v-for="notification in messageStore.notifications"
						:key="notification.id"
						:notification="notification"
						@click="readNotification(notification)"
					></notification-card>
				</view>
				<view v-if="!loading && !hasNotifications" class="empty-state">
					<image src="/static/icons/empty-box.png" class="empty-icon"></image>
					<text class="empty-text">暂无通知</text>
					<button v-if="isLoggedIn" class="refresh-btn" @click="loadData">刷新</button>
					<button v-else class="login-btn" @click="() => uni.navigateTo({ url: '/pages/login/index' })">去登录</button>
				</view>
			</view>
			
			<!-- 订阅通知列表 -->
			<view v-show="activeTab === 'subscription'">
				<view v-if="!loading && hasSubscriptionNotifications">
					<!-- 全部标为已读按钮 -->
					<view v-if="unreadSubscriptionCount > 0" class="mark-all-read-container">
						<button class="mark-all-read-btn" @click="handleMarkAllSubscriptionsAsRead">
							<text class="mark-all-read-text">全部标为已读</text>
						</button>
					</view>
					
					<subscription-notification-card
						v-for="notification in subscriptionNotifications"
						:key="notification.id"
						:notification="notification"
						@click="readSubscriptionNotification(notification)"
					></subscription-notification-card>
				</view>
				<view v-if="!loading && !hasSubscriptionNotifications" class="empty-state">
					<image src="/static/icons/empty-box.png" class="empty-icon"></image>
					<text class="empty-text">暂无订阅通知</text>
					<text class="empty-hint">长按需求集市中的类别可订阅相关通知</text>
					<button v-if="isLoggedIn" class="refresh-btn" @click="loadData">刷新</button>
					<button v-else class="login-btn" @click="() => uni.navigateTo({ url: '/pages/login/index' })">去登录</button>
				</view>
			</view>

			<!-- 加载状态 -->
			<view v-if="loading" class="loading-state">
				<text>加载中...</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { onLoad, onShow, onHide, onPullDownRefresh } from '@dcloudio/uni-app'
import { useMessageStore } from '../../store/message.js'
import { useUserStore } from '../../store/user.js'
import { connectWebSocket, disconnectWebSocket } from '../../utils/socket.js'
import { markAllNotificationsAsRead, getSubscriptionNotifications } from '../../api/notification.js'
import ConversationCard from '../../components/ConversationCard.vue'
import NotificationCard from '../../components/NotificationCard.vue'
import SubscriptionNotificationCard from '../../components/SubscriptionNotificationCard.vue'

const messageStore = useMessageStore()
const userStore = useUserStore()
 
const loading = ref(false)
const activeTab = ref('chat')
const isSocketConnected = ref(false)
const subscriptionNotifications = ref([])
const unreadSubscriptionCount = ref(0)

// 使用计算属性获取用户信息和登录状态，确保响应性
const user = computed(() => userStore.userInfo)
const isLoggedIn = computed(() => userStore.hasLogin)

// 计算属性：检查是否有聊天列表数据
const hasChatList = computed(() => messageStore.chatList && messageStore.chatList.length > 0)
// 计算属性：检查是否有通知数据
const hasNotifications = computed(() => messageStore.notifications && messageStore.notifications.length > 0)
// 计算属性：检查是否有未读通知
const hasUnreadNotifications = computed(() => {
	return messageStore.notifications && messageStore.notifications.some(notification => !notification.is_read)
})
// 计算属性：检查是否有订阅通知数据
const hasSubscriptionNotifications = computed(() => subscriptionNotifications.value && subscriptionNotifications.value.length > 0)

// 检查登录状态并处理
const checkLoginStatus = () => {
	// 使用计算属性检查登录状态
	return isLoggedIn.value
}

const loadData = async () => {
	loading.value = true
	try {
		// 如果未登录，不加载数据，但不跳转
		if (!isLoggedIn.value) {
			console.log('用户未登录，不加载数据')
			return
		}
		
		if (activeTab.value === 'chat') {
			await messageStore.getChatList()
		} else if (activeTab.value === 'notification') {
			try {
				console.log('开始加载通知列表，当前token:', userStore.token);
				
				// 先检查登录状态
				if (!userStore.hasLogin || !userStore.token) {
					console.log('用户未登录或token不存在，不加载通知');
					return;
				}
				
				await messageStore.getNotifications()
				console.log('通知列表加载成功:', messageStore.notifications);
			} catch (notificationError) {
				console.error('加载通知失败:', notificationError);
				
				// 检查是否是登录过期错误
				if (notificationError.message && notificationError.message.includes('登录已过期')) {
					console.log('登录已过期，尝试刷新用户信息');
					
					try {
						// 尝试刷新用户信息
						await userStore.getUserInfo();
						console.log('用户信息刷新成功，重新加载通知');
						await messageStore.getNotifications();
					} catch (refreshError) {
						console.error('刷新用户信息失败:', refreshError);
						// 不自动跳转到登录页面，只显示提示
						uni.showToast({
							title: '登录已过期，请手动登录',
							icon: 'none'
						});
					}
				} else {
					throw notificationError; // 重新抛出错误，让外层catch处理
				}
			}
		} else if (activeTab.value === 'subscription') {
			await loadSubscriptionNotifications()
		}
	} catch (error) {
		console.error('加载数据失败:', error)
		uni.showToast({ title: '加载失败，请重试', icon: 'none' })
	} finally {
		loading.value = false
	}
}

// 加载订阅通知
const loadSubscriptionNotifications = async () => {
	try {
		// 先检查登录状态
		if (!userStore.hasLogin || !userStore.token) {
			console.log('用户未登录或token不存在，不加载订阅通知')
			return
		}
		
		const response = await getSubscriptionNotifications()
		console.log("返回了什么？",response)
		subscriptionNotifications.value = response.data || []
		
		// 计算未读订阅通知数量
		unreadSubscriptionCount.value = subscriptionNotifications.value.filter(
			notification => !notification.is_read
		).length
		
		console.log('订阅通知加载成功:', subscriptionNotifications.value)
	} catch (error) {
		console.error('加载订阅通知失败:', error)
		throw error
	}
}

// 初始化WebSocket连接
const initWebSocket = () => {
	if (!isLoggedIn.value || isSocketConnected.value) return
	
	connectWebSocket(userStore.token)
		.then(() => {
			isSocketConnected.value = true
			console.log('WebSocket连接成功')
		})
		.catch(error => {
			console.error('WebSocket连接失败:', error)
			// 5秒后重试
			setTimeout(initWebSocket, 5000)
		})
}

// 处理WebSocket消息
const handleSocketMessage = (event) => {
	try {
		const message = JSON.parse(event.data)
		console.log('收到WebSocket消息:', message)
		
		switch (message.type) {
			case 'message':
				// 更新聊天列表
				messageStore.updateChatWithNewMessage(message.data)
				break
			case 'notification':
				// 添加新通知
				messageStore.addNotification(message.data)
				break
			case 'status':
				// 处理状态更新
				if (message.data.event_type === 'project_update' || 
					message.data.event_type === 'bid_update' || 
					message.data.event_type === 'order_update') {
					// 刷新相关数据
					if (activeTab.value === 'chat') {
						messageStore.getChatList()
					}
				}
				break
		}
	} catch (error) {
		console.error('处理WebSocket消息失败:', error)
	}
}

// 监听WebSocket消息
uni.onSocketMessage(handleSocketMessage)

onLoad((options) => {
	console.log('消息页面加载，登录状态:', isLoggedIn.value, '用户信息:', user.value)
	
	// 检查是否有tab参数，如果有则切换到对应标签
	if (options && options.tab) {
		activeTab.value = options.tab
	}
	
	// 无论是否登录都尝试加载数据
	loadData()
	
	// 如果已登录，初始化WebSocket
	if (isLoggedIn.value) {
		initWebSocket()
	}
})

onShow(async () => {
	console.log('消息页面显示，登录状态:', isLoggedIn.value, '用户信息:', user.value)
	
	// 如果有token，刷新用户信息
	if (userStore.token) {
		try {
			await userStore.getUserInfo()
			console.log('用户信息已刷新:', userStore.userInfo)
		} catch (error) {
			console.error('刷新用户信息失败:', error)
		}
	}
	
	// 页面显示时，如果已登录但WebSocket未连接，则重新连接
	if (isLoggedIn.value && !isSocketConnected.value) {
		initWebSocket()
	}
	
	// 刷新数据
	if (isLoggedIn.value) {
		loadData()
	}
})

onHide(() => {
	// 页面隐藏时不断开WebSocket，保持后台接收消息
})

onUnmounted(() => {
	// 组件卸载时断开WebSocket
	if (isSocketConnected.value) {
		disconnectWebSocket()
		isSocketConnected.value = false
	}
	// 移除WebSocket消息监听
	uni.offSocketMessage(handleSocketMessage)
})

onPullDownRefresh(async () => {
	await loadData()
	uni.stopPullDownRefresh()
})

const switchTab = (tab) => {
	if (activeTab.value === tab) return
	activeTab.value = tab
	loadData()
}

const goToChat = (chatId) => {
	if (!isLoggedIn.value) {
		uni.showToast({ title: '请先登录', icon: 'none' })
		return
	}
	uni.navigateTo({ url: `/pages/messages/chat?id=${chatId}` })
}

const readNotification = (notification) => {
	if (!isLoggedIn.value) {
		uni.showToast({ title: '请先登录', icon: 'none' })
		return
	}
	
	// 标记为已读
	if (!notification.is_read) {
		messageStore.readNotification([notification.id])
	}
	
	// 根据通知类型跳转到不同页面
	switch (notification.type) {
		case 0: // 系统通知
			console.log('查看系统通知:', notification.id)
			break
		case 1: // 项目通知
			if (notification.related_id) {
				uni.navigateTo({ url: `/pages/projects/detail?id=${notification.related_id}` })
			}
			break
		case 2: // 投标通知
			if (notification.related_id) {
				// 跳转到投标详情页面
				// uni.navigateTo({ url: `/pages/messages/chat?bid_id=${notification.related_id}` })  暂时先不跳
			}
			break
		case 3: // 订单通知
			if (notification.related_id) {
				uni.navigateTo({ url: `/pages/orders/detail?id=${notification.related_id}` })
			}
			break
		default:
			console.log('未知通知类型:', notification.type)
	}
}

// 处理全部标为已读
const handleMarkAllAsRead = async () => {
	if (!isLoggedIn.value) {
		uni.showToast({ title: '请先登录', icon: 'none' })
		return
	}
	
	try {
		uni.showLoading({ title: '处理中...' })
		
		// 调用API标记所有通知为已读
		await markAllNotificationsAsRead()
		
		// 重新加载通知列表
		await messageStore.getNotifications()
		
		uni.hideLoading()
		uni.showToast({
			title: '已全部标为已读',
			icon: 'success'
		})
	} catch (error) {
		console.error('标记全部已读失败:', error)
		uni.hideLoading()
		uni.showToast({
			title: '操作失败，请重试',
			icon: 'none'
		})
	}
}

// 处理订阅通知全部标为已读
const handleMarkAllSubscriptionsAsRead = async () => {
	if (!isLoggedIn.value) {
		uni.showToast({ title: '请先登录', icon: 'none' })
		return
	}
	
	try {
		uni.showLoading({ title: '处理中...' })
		
		// 获取所有未读订阅通知的ID
		const unreadIds = subscriptionNotifications.value
			.filter(notification => !notification.is_read)
			.map(notification => notification.id)
		
		if (unreadIds.length === 0) {
			uni.hideLoading()
			return
		}
		
		// 调用API标记这些通知为已读
		await markNotificationsAsRead(unreadIds)
		
		// 更新本地状态
		subscriptionNotifications.value.forEach(notification => {
			notification.is_read = true
		})
		unreadSubscriptionCount.value = 0
		
		uni.hideLoading()
		uni.showToast({
			title: '已全部标为已读',
			icon: 'success'
		})
	} catch (error) {
		console.error('标记订阅通知已读失败:', error)
		uni.hideLoading()
		uni.showToast({
			title: '操作失败，请重试',
			icon: 'none'
		})
	}
}

// 读取订阅通知
const readSubscriptionNotification = async (notification) => {
	if (!isLoggedIn.value) {
		uni.showToast({ title: '请先登录', icon: 'none' })
		return
	}
	
	// 如果通知未读，标记为已读
	if (!notification.is_read) {
		try {
			await markNotificationsAsRead([notification.id])
			
			// 更新本地状态
			notification.is_read = true
			unreadSubscriptionCount.value = Math.max(0, unreadSubscriptionCount.value - 1)
		} catch (error) {
			console.error('标记通知已读失败:', error)
		}
	}
	
	// 根据通知类型处理跳转
	if (notification.project_id) {
		// 跳转到项目详情
		uni.navigateTo({ url: `/pages/projects/detail?id=${notification.project_id}` })
	} else if (notification.category_id) {
		// 跳转到该分类的项目列表
		uni.navigateTo({ 
			url: `/pages/projects/list?categoryId=${notification.category_id}&categoryName=${encodeURIComponent(notification.title)}` 
		})
	}
}
</script>

<style scoped>
.messages-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
}

@keyframes gradient {
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
}

.header-fixed {
	position: sticky;
	top: 0;
	z-index: 10;
	padding: 20rpx 30rpx;
	padding-top: var(--status-bar-height);
}

.tab-bar-glass {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 80rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 40rpx;
	padding: 0 10rpx;
}

.tab-item {
	position: relative;
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 60rpx;
	color: #fff;
	font-size: 30rpx;
	transition: all 0.3s ease;
}
.tab-item.active {
	background: #fff;
	color: #3b82f6;
	border-radius: 30rpx;
	font-weight: bold;
}

.badge {
	position: absolute;
	top: -5rpx;
	right: 10rpx;
	background-color: #ff4757;
	color: #fff;
	font-size: 20rpx;
	min-width: 30rpx;
	height: 30rpx;
	border-radius: 15rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 6rpx;
}

.content-area {
	padding: 20rpx 30rpx;
}

.loading-state, .empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 100rpx;
	color: rgba(255, 255, 255, 0.8);
}
.empty-icon {
	width: 200rpx;
	height: 200rpx;
	opacity: 0.6;
	margin-bottom: 30rpx;
}
.empty-text {
	font-size: 28rpx;
	margin-bottom: 10rpx;
}

.empty-hint {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 30rpx;
	text-align: center;
	padding: 0 40rpx;
}
.refresh-btn, .login-btn {
	background: rgba(255, 255, 255, 0.2);
	color: #fff;
	border: 1px solid rgba(255, 255, 255, 0.4);
	border-radius: 40rpx;
	padding: 10rpx 40rpx;
	font-size: 28rpx;
}
.login-btn {
	background: #3b82f6;
}

.mark-all-read-container {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 20rpx;
}

.mark-all-read-btn {
	background: rgba(255, 255, 255, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 30rpx;
	padding: 10rpx 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.mark-all-read-text {
	color: #fff;
	font-size: 24rpx;
}

.mark-all-read-btn:active {
	background: rgba(255, 255, 255, 0.3);
}
</style>