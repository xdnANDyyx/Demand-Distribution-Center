<template>
	<view class="chat-container">
		<!-- 顶部固定头部 -->
		<view class="header-fixed">
			<view class="header-glass">
				<text class="back-icon" @click="uni.navigateBack()">‹</text>
				<text class="header-title">{{ chatInfo.targetUsername || '聊天' }}</text>
				<text class="options-icon" @click="showOptions">···</text>
			</view>
		</view>

		<!-- 聊天内容区域 -->
		<scroll-view 
			class="messages-scroll" 
			scroll-y 
			:scroll-into-view="scrollToView"
			:scroll-with-animation="true"
			@scrolltoupper="loadMore"
		>
			<view class="scroll-content">
				<view v-if="loadingMore" class="loading-more">加载中...</view>
				
				<!-- 系统消息 -->
				<view v-if="showSystemMessage" class="system-message">
					<view class="system-content">您已与{{ chatInfo.targetUsername }}建立联系</view>
				</view>
				
				<view v-for="(msg, index) in messages" :key="msg.id" :id="'msg-' + msg.id">
					<!-- 时间显示 -->
					<view v-if="shouldShowTime(msg, index)" class="time-display">
						{{ formatMessageTime(msg.created_at) }}
					</view>
					<!-- 消息气泡 -->
					<view class="message-row" :class="{ self: msg.sender_id === userStore.userInfo.id }">
						<view class="message-avatar" v-if="msg.sender_id !== userStore.userInfo.id">
							{{ chatInfo.targetUsername.substring(0, 1) }}
						</view>
						<view class="message-avatar self" v-else>我</view>
						<view class="message-bubble">
							<text>{{ msg.content }}</text>
							<view class="message-time">{{ formatMessageTime(msg.created_at) }}</view>
						</view>
					</view>
				</view>
				
				<!-- 订单合同系统消息 -->
				<view v-if="orderContractGenerated" class="system-message">
					<view class="system-content">订单合同已生成，等待双方确认</view>
				</view>
			</view>
		</scroll-view>

		<!-- 底部输入区域 -->
		<view class="input-area-fixed">
			<view class="input-area-glass">
				<!-- 语音/文字切换图标 -->
				<image class="voice-icon" src="/static/icons/voice.png" @click="toggleInputMode"></image>
				
				<!-- 文本输入 -->
				<textarea 
					v-if="inputMode === 'text'"
					class="chat-input" 
					v-model="inputText" 
					placeholder="输入消息..." 
					auto-height
					:maxlength="-1"
					@confirm="handleSend"
					confirm-type="send"
				/>
				
				<!-- 语音输入 -->
				<button v-if="inputMode === 'voice'" class="voice-input" @touchstart.stop="startRecord" @touchend.stop="handleVoiceEnd">
					{{ isRecording ? '松开结束' : '按住说话' }}
				</button>

				<button class="send-btn" @click="handleSend" :disabled="!inputText.trim()" v-if="inputMode === 'text'">
					<image class="send-icon" src="/static/icons/Sending.png"></image>
				</button>
			</view>
		</view>
		
		<!-- 悬浮订单按钮 -->
		<view class="floating-order-btn" @click="showOrderModal">
			<image class="order-icon" src="/static/icons/hr.png"></image>
		</view>
		
		<!-- 订单弹窗 -->
		<view class="order-modal" v-if="orderModalVisible">
			<view class="order-content" @click.stop>
				<view class="order-header">
					<view class="order-title">合同拟定</view>
					<view class="order-subtitle">确认项目信息并生成正式订单</view>
				</view>
				
				<form class="order-form">
					<view class="form-group">
						<label class="form-label">项目名称</label>
						<input type="text" class="form-input" v-model="orderForm.projectName" placeholder="请输入项目名称" />
					</view>
					
					<view class="form-group">
						<label class="form-label">甲方</label>
						<input type="text" class="form-input" v-model="orderForm.partyA" :placeholder="chatInfo.targetUsername" />
					</view>
					
					<view class="form-group">
						<label class="form-label">乙方</label>
						<input type="text" class="form-input" v-model="orderForm.partyB" :placeholder="userStore.userInfo.username" />
					</view>
					
					<view class="form-group">
						<label class="form-label">订单金额</label>
						<input type="text" class="form-input" v-model="orderForm.amount" placeholder="请输入合同金额" />
					</view>
					
					<view class="form-group">
						<label class="form-label">项目描述</label>
						<textarea class="form-textarea" v-model="orderForm.description" placeholder="请输入项目描述"></textarea>
					</view>
					
					<view class="form-group">
						<label class="form-label">交货时间</label>
						<input type="text" class="form-input" v-model="orderForm.deliveryTime" placeholder="例如：合同签订后2周内" />
					</view>
					
					<view class="form-group">
						<label class="form-label">付款方式</label>
						<view class="payment-method-selector">
							<view
								class="payment-option"
								:class="{ active: orderForm.paymentMethod === '微信支付' }"
								@click="orderForm.paymentMethod = '微信支付'"
							>
								<text>微信支付</text>
							</view>
							<view
								class="payment-option"
								:class="{ active: orderForm.paymentMethod === '支付宝' }"
								@click="orderForm.paymentMethod = '支付宝'"
							>
								<text>支付宝</text>
							</view>
							<view
								class="payment-option"
								:class="{ active: orderForm.paymentMethod === '银行转账' }"
								@click="orderForm.paymentMethod = '银行转账'"
							>
								<text>银行转账</text>
							</view>
						</view>
					</view>
				</form>
				
				<view class="order-actions">
					<button class="btn btn-cancel" @click="hideOrderModal">取消</button>
					<button class="btn btn-confirm" @click="confirmOrder">生成订单</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useMessageStore } from '../../store/message.js';
import { useUserStore } from '../../store/user.js';
import { useOrderStore } from '../../store/order.js';
import { joinChatRoom, leaveChatRoom, markMessagesRead, isSocketConnected, connectWebSocket, onNewMessage } from '../../utils/socket.js';
import { wechatPay } from '../../api/payment.js';
// 不再需要引入外部语音识别API，使用plus.speech

const messageStore = useMessageStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
 
const chatInfo = reactive({
	id: null,
	targetUserId: null,
	targetUsername: '',
	targetUserAvatar: '',
	projectId: null,  // 添加项目ID
	bidId: null       // 添加投标ID
});
const messages = ref([]);
const inputText = ref('');
const scrollToView = ref('');
const loadingMore = ref(false);
const showSystemMessage = ref(true);
const orderModalVisible = ref(false);
const orderContractGenerated = ref(false);

// --- 语音识别相关状态 ---
const inputMode = ref('text'); // 'text' or 'voice'
const isRecording = ref(false);
const title = ref('未开始');
const partialResult = ref('...');
const result = ref('');
const valueWidth = ref('0px');
// -------------------------

// 订单表单数据
const orderForm = reactive({
	projectName: '',
	partyA: '',
	partyB: '',
	amount: '',
	description: '',
	deliveryTime: '订单签订后2周内',
	paymentMethod: '微信支付'
});

onLoad(async (options) => {
	console.log('聊天页面加载，参数:', options);
	
	chatInfo.id = options.chatId || options.id;
	chatInfo.targetUserId = options.targetUserId;
	chatInfo.targetUsername = options.targetUserName || options.targetUsername || '用户';
	
	if (options.targetUserName) {
		chatInfo.targetUsername = options.targetUserName;
	}
	
	const chat = messageStore.chatList.find(c => c.id == chatInfo.id);
	if (chat) {
		chatInfo.targetUsername = chat.target_user.username;
		chatInfo.targetUserAvatar = chat.target_user.avatar;
		chatInfo.targetUserId = chat.target_user.id;  // 设置目标用户ID
		chatInfo.projectId = chat.project_id;  // 设置项目ID
		chatInfo.bidId = chat.bid_id;          // 设置投标ID
		console.log('获取到项目信息:', {
			projectId: chatInfo.projectId,
			bidId: chatInfo.bidId,
			targetUserId: chatInfo.targetUserId
		});
	}

	console.log('聊天信息:', chatInfo);

	orderForm.partyA = chatInfo.targetUsername;
	orderForm.partyB = userStore.userInfo.username || '我方企业';

	await loadMessages(true);

	console.log('检查WebSocket连接状态:', isSocketConnected());
	
	if (!isSocketConnected()) {
		console.log('WebSocket未连接，尝试重新连接');
		connectWebSocket(userStore.token);
		
		setTimeout(() => {
			if (isSocketConnected()) {
				console.log('WebSocket重连成功，加入聊天房间');
				joinChatRoom(chatInfo.id);
				markMessagesRead(chatInfo.id);
			} else {
				console.error('WebSocket重连失败');
				uni.showToast({
					title: '连接失败，部分功能可能不可用',
					icon: 'none',
					duration: 3000
				});
			}
		}, 2000);
	} else {
		console.log('WebSocket已连接，直接加入聊天房间');
		joinChatRoom(chatInfo.id);
		markMessagesRead(chatInfo.id);
	}
});

onMounted(() => {
	console.log('注册新消息监听器');
	onNewMessage(handleNewMessage);
	uni.onSocketMessage(handleSocketMessage);
	initRecorder(); // 初始化录音器
});

onReady(() => {
	// #ifdef APP-PLUS
	plus.android.requestPermissions(["android.permission.RECORD_AUDIO"], (e) => {}, (e) => {})
	// 监听语音识别事件
	plus.speech.addEventListener('start', ontStart, false);
	plus.speech.addEventListener('volumeChange', onVolumeChange, false);
	plus.speech.addEventListener('recognizing', onRecognizing, false);
	plus.speech.addEventListener('recognition', onRecognition, false);
	plus.speech.addEventListener('end', onEnd, false);
	// #endif
});

onUnmounted(() => {
	console.log('离开聊天房间并移除监听器');
	leaveChatRoom(chatInfo.id);
	onNewMessage(null);
	
	// #ifdef APP-PLUS
	// 移除语音识别事件监听
	plus.speech.removeEventListener('start', ontStart);
	plus.speech.removeEventListener('volumeChange', onVolumeChange);
	plus.speech.removeEventListener('recognizing', onRecognizing);
	plus.speech.removeEventListener('recognition', onRecognition);
	plus.speech.removeEventListener('end', onEnd);
	// #endif
});

const handleSocketMessage = (event) => {
	try {
		const data = JSON.parse(event.data);
		console.log('聊天页面直接收到WebSocket消息:', data);
		
		if (data.type === 'message' && data.data && data.data.chat_id == chatInfo.id) {
			console.log('收到当前聊天的新消息:', data.data);
			
			if (data.data.message.sender_id !== userStore.userInfo.id) {
				const existingMsg = messages.value.find(msg => msg.id === data.data.message.id);
				if (!existingMsg) {
					messages.value.push(data.data.message);
					scrollToBottom();
					console.log('对方消息已添加到列表，当前消息数:', messages.value.length);
				} else {
					console.log('消息已存在，不重复添加');
				}
			} else {
				console.log('忽略自己发送的消息');
			}
		}
	} catch (error) {
		console.error('处理WebSocket消息失败:', error);
	}
};

watch(() => messageStore.chatList, (newChatList) => {
	const currentChat = newChatList.find(chat => chat.id === chatInfo.id);
	if (currentChat) {
		console.log('聊天列表更新，重新加载消息');
		loadMessages();
	}
}, { deep: true });

const loadMessages = async (isInitial = false) => {
	try {
		const res = await messageStore.getChatMessages(chatInfo.id);
		messages.value = res.reverse();
		if (isInitial) {
			scrollToBottom();
		}
	} catch (error) {
		console.error('加载消息失败:', error);
	}
};

const handleSend = async () => {
	if (!inputText.value.trim()) return;

	if (!isSocketConnected()) {
		console.error('WebSocket未连接，无法发送消息');
		uni.showToast({ 
			title: 'WebSocket未连接，正在重连...', 
			icon: 'none',
			duration: 2000
		});
		connectWebSocket(userStore.token);
		return;
	}

	const messageData = {
		content: inputText.value,
		content_type: 0,
	};
	
	console.log('发送消息:', messageData);
	
	try {
		await messageStore.sendMessage(chatInfo.id, messageData);
		const optimisticMessage = {
			id: Date.now(),
			sender_id: userStore.userInfo.id,
			...messageData,
			created_at: new Date().toISOString()
		};
		messages.value.push(optimisticMessage);
		inputText.value = '';
		scrollToBottom();
		console.log('消息发送成功');
	} catch (error) {
		console.error('发送失败:', error);
		uni.showToast({ title: '发送失败', icon: 'none' });
	}
};

const handleNewMessage = (data) => {
	console.log('收到新消息回调:', data);
	if (data.chat_id == chatInfo.id) {
		console.log('处理当前会话消息:', data.message);
		if (data.message.sender_id !== userStore.userInfo.id) {
			const existingMsg = messages.value.find(msg => msg.id === data.message.id);
			if (!existingMsg) {
				messages.value.push(data.message);
				scrollToBottom();
				console.log('对方消息已添加到列表，当前消息数:', messages.value.length);
			} else {
				console.log('消息已存在，不重复添加');
			}
		} else {
			console.log('忽略自己发送的消息');
		}
	} else {
		console.log('非当前会话消息，忽略');
	}
};

// --- 语音识别相关方法 ---
const initRecorder = () => {
	// 使用plus.speech，不需要初始化recorder
	console.log('语音识别初始化完成');
};

const toggleInputMode = () => {
	inputMode.value = inputMode.value === 'text' ? 'voice' : 'text';
};

// 语音识别事件处理
const ontStart = () => {
	title.value = '...倾听中...';
	result.value = '';
	console.log('Event: start');
	isRecording.value = true;
};

const onVolumeChange = (e) => {
	valueWidth.value = 100*e.volume+'px';
	console.log('Event: volumeChange '+valueWidth.value);
};

const onRecognizing = (e) => {
	partialResult.value = e.partialResult;			
	console.log('Event: recognizing');
};

const onRecognition = (e) => {
	result.value += e.result;
	result.value ? (result.value += ' ') : result.value = '';
	partialResult.value = e.result;
	console.log('Event: recognition');
};

const onEnd = () => {
	if(!result.value || result.value == ''){
		uni.showToast({title: '没有识别到内容', icon: 'none'});
	} else {
		// 将识别结果填入输入框并发送
		inputText.value = result.value.trim();
		if(inputText.value) {
			handleSend();
		}
	}
	
	title.value = '未开始';
	valueWidth.value = '0px';
	partialResult.value = '...';
	isRecording.value = false;
};

const startRecord = () => {
	console.log('startRecognize');
	// #ifdef APP-PLUS
	isRecording.value = true;
	title.value = '...倾听中...';
	result.value = '';
	
	var options = {
		engine: 'baidu'
	};
	console.log('开始语音识别：');
	plus.speech.startRecognize(options, function(s){
		console.log('识别结果:', s);
		result.value += s;
	}, function(e){
		console.log('语音识别失败：'+JSON.stringify(e));
		uni.showToast({title: '语音识别失败', icon: 'none'});
		isRecording.value = false;
		title.value = '未开始';
	});
	// #endif
};

const handleVoiceEnd = () => {
	console.log('endRecognize');
	// #ifdef APP-PLUS
	plus.speech.stopRecognize();
	
	if(result.value && result.value.trim()) {
		// 将识别结果填入输入框并发送
		inputText.value = result.value.trim();
		handleSend();
	} else {
		uni.showToast({title: '没有识别到内容', icon: 'none'});
	}
	
	isRecording.value = false;
	title.value = '未开始';
	// #endif
};
// -------------------------

const scrollToBottom = () => {
	nextTick(() => {
		if (messages.value.length > 0) {
			scrollToView.value = 'msg-' + messages.value[messages.value.length - 1].id;
		}
	});
};

const loadMore = () => {
	console.log('触发加载更多');
};

const shouldShowTime = (message, index) => {
	if (index === 0) return true;
	const prevMessage = messages.value[index - 1];
	const prevTime = new Date(prevMessage.created_at).getTime();
	const currentTime = new Date(message.created_at).getTime();
	return (currentTime - prevTime) > 5 * 60 * 1000;
};

const formatMessageTime = (timeStr) => {
	const date = new Date(timeStr);
	return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const showOrderModal = () => {
	orderModalVisible.value = true;
};

const hideOrderModal = () => {
	orderModalVisible.value = false;
};

const confirmOrder = async () => {
	if (!orderForm.projectName) {
		uni.showToast({ title: '请输入项目名称', icon: 'none' });
		return;
	}
	if (!orderForm.amount) {
		uni.showToast({ title: '请输入合同金额', icon: 'none' });
		return;
	}
	if (!orderForm.description) {
		uni.showToast({ title: '请输入项目描述', icon: 'none' });
		return;
	}

	try {
		// 验证必要信息
		if (!chatInfo.projectId) {
			let message = '该聊天未关联具体投标，无法创建订单。';
			if (!chatInfo.projectId) {
				message += '\n缺少项目信息。';
			} else if (!chatInfo.bidId || chatInfo.bidId === 0) {
				message += '\n请在项目详情页选择投标并联系投标人，这样才能创建订单。';
			}

			uni.showModal({
				title: '无法创建订单',
				content: message,
				showCancel: false,
				confirmText: '我知道了'
			});

			console.error('缺少必要信息:', {
				projectId: chatInfo.projectId,
				bidId: chatInfo.bidId,
				targetUserId: chatInfo.targetUserId
			});
			return;
		}

		if (!chatInfo.targetUserId) {
			uni.showToast({
				title: '无法获取对方用户信息',
				icon: 'none'
			});
			return;
		}

		// 构造符合后端要求的订单数据
		const orderData = {
			project_id: chatInfo.projectId,
			bid_id: 35,  // 使用真实的bidId
			publisher_id: 24,  // 当前用户是发布者
			bidder_id: chatInfo.targetUserId,      // 对方是投标人
			amount: parseFloat(orderForm.amount)   // 金额转为数字
		};

		console.log('准备创建订单，数据:', orderData);

		// 创建订单
		const orderResult = await orderStore.createOrder(orderData);
		console.log('订单创建成功:', orderResult);

		orderContractGenerated.value = true;
		hideOrderModal();

		uni.showToast({
			title: '订单合同已生成！',
			icon: 'success'
		});

		// 如果是微信支付，直接发起支付
		if (orderForm.paymentMethod === '微信' || orderForm.paymentMethod.includes('微信')) {
			setTimeout(() => {
				// 修复：orderResult的结构是 { order: { id: ... } }
				initiateWeChatPay(orderResult.order.id, orderForm.amount);
			}, 500);
		} else {
			// 其他支付方式，发送消息等待支付
			const systemMessage = `订单已生成：${orderForm.projectName}，金额：${orderForm.amount}，等支付`;
			await messageStore.sendMessage(chatInfo.id, {
				content: systemMessage,
				content_type: 1,
				media_url:"http://localhost:8080/test"
			});
		}

		scrollToBottom();
	} catch (error) {
		console.error('创建订单失败:', error);
		uni.showToast({
			title: '创建订单失败，请重试',
			icon: 'none'
		});
	}
};

// 发起微信支付
const initiateWeChatPay = async (orderId, amount) => {
	try {
		console.log('发起微信支付，订单ID:', orderId, '金额:', amount);

		// 调用后端微信支付接口
		const response = await wechatPay({
			order_id: orderId,
			user_id: userStore.userInfo.id,  // 添加用户ID
			amount: parseFloat(amount)
		});

		console.log('微信支付接口响应:', response);

		if (response) {
			const payData = response;

			console.log('支付参数详情:', {
				appId: payData.appId,
				partnerId: payData.partnerId,
				prepayId: payData.prepayId,
				package: payData.package,
				nonceStr: payData.nonceStr,
				timeStamp: payData.timeStamp,
				sign长度: payData.sign ? payData.sign.length : 0
			});

			// 检查必需参数
			if (!payData.appId || !payData.partnerId || !payData.prepayId ||
				!payData.package || !payData.nonceStr || !payData.timeStamp || !payData.sign) {
				console.error('支付参数不完整:', payData);
				uni.showToast({
					title: '支付参数不完整',
					icon: 'none'
				});
				return;
			}

			// #ifdef APP-PLUS
			// APP端调用微信支付
			uni.requestPayment({
				provider: 'wxpay',
				orderInfo: {
					appid: payData.appId,
					noncestr: payData.nonceStr,
					package: payData.package,
					partnerid: payData.partnerId,
					prepayid: payData.prepayId,
					timestamp: payData.timeStamp,
					sign: payData.sign
				},
				success: function(res) {
					console.log('微信支付成功:', res);
					uni.showToast({
						title: '支付成功',
						icon: 'success'
					});
					// 发送支付成功消息
					messageStore.sendMessage(chatInfo.id, {
						content: `订单已支付成功，金额：${amount}元`,
						content_type: 1
					});
					scrollToBottom();
				},
				fail: function(err) {
					console.error('微信支付失败:', err);
					uni.showToast({
						title: '支付失败: ' + (err.errMsg || '未知错误'),
						icon: 'none',
						duration: 3000
					});
				},
				complete: function() {
					console.log('支付流程结束');
				}
			});
			// #endif

			// #ifdef MP-WEIXIN
			// 微信小程序支付
			uni.requestPayment({
				timeStamp: payData.timeStamp,
				nonceStr: payData.nonceStr,
				package: payData.package,
				signType: 'MD5',
				paySign: payData.sign,
				success: function(res) {
					console.log('微信小程序支付成功:', res);
					uni.showToast({
						title: '支付成功',
						icon: 'success'
					});
					messageStore.sendMessage(chatInfo.id, {
						content: `订单已支付成功，金额：${amount}元`,
						content_type: 1
					});
					scrollToBottom();
				},
				fail: function(err) {
					console.error('微信小程序支付失败:', err);
					uni.showToast({
						title: '支付失败: ' + (err.errMsg || '未知错误'),
						icon: 'none'
					});
				}
			});
			// #endif

		} else {
			uni.showToast({
				title: response.message || '获取支付参数失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('发起微信支付失败:', error);
		uni.showToast({
			title: '发起支付失败，请重试',
			icon: 'none'
		});
	}
};

const showOptions = () => {
	uni.showActionSheet({
		itemList: ['查看订单', '清空聊天记录', '举报'],
		success: function (res) {
			if (res.tapIndex === 0) {
				uni.navigateTo({
					url: `/pages/orders/index?chatId=${chatInfo.id}`
				});
			} else if (res.tapIndex === 1) {
				uni.showModal({
					title: '确认清空',
					content: '确定要清空聊天记录吗？此操作不可恢复',
					success: function (res) {
						if (res.confirm) {
							messages.value = [];
							uni.showToast({ title: '已清空', icon: 'success' });
						}
					}
				});
			} else if (res.tapIndex === 2) {
				uni.showToast({ title: '举报功能开发中', icon: 'none' });
			}
		}
	});
};
</script>

<style scoped>
/* 基础容器和布局 */
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f0f2f5;
}

/* 顶部固定头部 */
.header-fixed {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.header-glass {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 44px;
	padding: 0 15px;
}
.back-icon {
	font-size: 24px;
	font-weight: bold;
	width: 30px;
}
.header-title {
	font-size: 17px;
	font-weight: 600;
}
.options-icon {
	font-size: 24px;
	width: 30px;
	text-align: right;
}

/* 聊天内容区域 */
.messages-scroll {
	flex: 1;
	padding-top: 54px; /* 留出头部空间 */
	padding-bottom: 70px; /* 留出输入框空间 */
	box-sizing: border-box;
}
.scroll-content {
	padding: 10px;
}
.loading-more {
	text-align: center;
	color: #999;
	padding: 10px 0;
}

/* 消息行 */
.message-row {
	display: flex;
	margin-bottom: 20px;
}
.message-row.self {
	flex-direction: row-reverse;
}
.message-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background-color: #007aff;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	margin: 0 10px;
}
.message-avatar.self {
	background-color: #4cd964;
}
.message-bubble {
	max-width: 70%;
	background-color: white;
	padding: 10px 15px;
	border-radius: 18px;
	position: relative;
}
.self .message-bubble {
	background-color: #a0e75a;
}
.message-time {
	font-size: 10px;
	color: #999;
	margin-top: 5px;
	text-align: right;
}

/* 时间和系统消息 */
.time-display, .system-message {
	text-align: center;
	margin: 10px 0;
}
.time-display, .system-content {
	display: inline-block;
	background: rgba(0, 0, 0, 0.1);
	color: white;
	font-size: 12px;
	padding: 3px 8px;
	border-radius: 5px;
}

/* 底部输入区域 */
.input-area-fixed {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(10px);
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	padding-bottom: env(safe-area-inset-bottom);
}
.input-area-glass {
	display: flex;
	align-items: flex-end;
	padding: 10px;
}
.chat-input {
	flex: 1;
	background-color: #fff;
	border: 1px solid #ddd;
	border-radius: 20px;
	padding: 8px 15px;
	font-size: 16px;
	max-height: 100px;
	overflow-y: auto;
}
.send-btn {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background-color: #007aff;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 10px;
	padding: 0;
}
.send-btn[disabled] {
	background-color: #ccc;
}
.send-icon {
	width: 24px;
	height: 24px;
}

/* 语音输入相关样式 */
.voice-icon {
	width: 30px;
	height: 30px;
	margin-right: 8px;
	align-self: center;
	cursor: pointer;
}
.voice-input {
	flex: 1;
	height: 40px;
	line-height: 40px;
	text-align: center;
	border: 1px solid #e0e0e0;
	border-radius: 20px;
	background-color: #f8f8f8;
}

/* 语音识别容器 */
.voice-recognition-container {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.result {
	color: #CCCCCC;
	border: #00CCCC 1px solid;
	margin: 5px auto;
	padding: 6px;
	width: 100%;
	height: 60px;
	border-radius: 8px;
}

.recogniz {
    width: 100%;
    padding: 8px;
    margin: 5px auto;
    background-color: rgba(0,0,0,0.5);
    border-radius: 16px;
	text-align: center;
}

.partial {
    width: 100%;
    height: 20px;
    margin-top: 8px;
    font-size: 12px;
    color: #FFFFFF;
}

.volume {
	width: 10px;
	height: 6px;
	border-style: solid;
	display: inline-block;
	box-sizing: border-box;
	border-width: 1px;
	border-color: #CCCCCC;
	border-radius: 50%;
    background-color: #00CC00;
}

/* 悬浮按钮 */
.floating-order-btn {
	position: fixed;
	bottom: 80px;
	right: 20px;
	width: 50px;
	height: 50px;
	background-color: #007aff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
.order-icon {
	width: 28px;
	height: 28px;
}

/* 订单弹窗 */
.order-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}
.order-content {
	width: 90%;
	max-width: 400px;
	background: white;
	border-radius: 15px;
	padding: 20px;
	max-height: 80vh;
	overflow-y: auto;
}
.order-header {
	text-align: center;
	margin-bottom: 20px;
}
.order-title {
	font-size: 20px;
	font-weight: bold;
}
.order-subtitle {
	font-size: 14px;
	color: #666;
	margin-top: 5px;
}
.order-form .form-group {
	margin-bottom: 15px;
}
.form-label {
	display: block;
	font-size: 14px;
	margin-bottom: 5px;
}
.form-input, .form-textarea {
	width: 100%;
	padding: 10px;
	border: 1px solid #ddd;
	border-radius: 8px;
	box-sizing: border-box;
}
.form-textarea {
	height: 80px;
}
.order-actions {
	display: flex;
	justify-content: space-between;
	margin-top: 20px;
}
.btn {
	flex: 1;
	padding: 12px;
	border: none;
	border-radius: 8px;
	font-size: 16px;
}
.btn-cancel {
	background: #f0f0f0;
	margin-right: 10px;
}
.btn-confirm {
	background: #007aff;
	color: white;
}

/* 支付方式选择器 */
.payment-method-selector {
	display: flex;
	gap: 10px;
	margin-bottom: 10px;
}

.payment-option {
	flex: 1;
	padding: 12px;
	border: 1px solid #ddd;
	border-radius: 8px;
	text-align: center;
	cursor: pointer;
	transition: all 0.3s;
}

.payment-option.active {
	border-color: #07c160;
	background-color: rgba(7, 193, 96, 0.1);
}

.payment-option text {
	color: #333;
	font-size: 14px;
}

.payment-option.active text {
	color: #07c160;
	font-weight: 600;
}
</style>
