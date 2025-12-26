<template>
  <view class="order-detail-page">
    <!-- 订单状态卡片 -->
    <view class="status-card" :class="getStatusClass(order.status)">
      <view class="status-icon">
        <text>{{ getStatusIcon(order.status) }}</text>
      </view>
      <view class="status-info">
        <text class="status-text">{{ getStatusText(order.status) }}</text>
        <text class="status-desc">{{ getStatusDesc(order.status) }}</text>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="info-card">
      <view class="card-title">订单信息</view>
      <view class="info-item">
        <text class="label">订单编号</text>
        <text class="value">{{ order.id }}</text>
      </view>
      <view class="info-item">
        <text class="label">创建时间</text>
        <text class="value">{{ formatDate(order.created_at) }}</text>
      </view>
      <view class="info-item">
        <text class="label">更新时间</text>
        <text class="value">{{ formatDate(order.updated_at) }}</text>
      </view>
    </view>

    <!-- 项目信息 -->
    <view class="info-card">
      <view class="card-title">项目信息</view>
      <view class="project-info">
        <text class="project-title">{{ order.project_title }}</text>
        <text class="project-amount">¥{{ formatMoney(order.amount) }}</text>
      </view>
      <view class="info-item">
        <text class="label">项目ID</text>
        <text class="value">{{ order.project_id }}</text>
      </view>
    </view>

    <!-- 交易方信息 -->
    <view class="info-card">
      <view class="card-title">交易方信息</view>
      <view class="info-item">
        <text class="label">需求方</text>
        <text class="value">{{ order.buyer_name }}</text>
      </view>
      <view class="info-item">
        <text class="label">服务商</text>
        <text class="value">{{ order.seller_name }}</text>
      </view>
    </view>

    <!-- 订单进度 -->
    <view class="info-card">
      <view class="card-title">订单进度</view>
      <view class="progress-timeline">
        <view 
          v-for="(step, index) in orderSteps" 
          :key="index"
          class="timeline-item"
          :class="{ active: isStepActive(step.status, order.status) }"
        >
          <view class="timeline-dot"></view>
          <view class="timeline-content">
            <text class="timeline-title">{{ step.title }}</text>
            <text v-if="isStepActive(step.status, order.status)" class="timeline-time">
              {{ formatDate(getStepTime(step.status, order)) }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button 
        v-if="order.status === 'pending'" 
        class="btn btn-primary"
        @click="handlePay"
      >
        立即支付
      </button>
      
      <button 
        v-if="order.status === 'in_progress' && userStore.userInfo?.role === 'client'" 
        class="btn btn-success"
        @click="handleConfirm"
      >
        确认完成
      </button>
      
      <button 
        v-if="order.status === 'pending'" 
        class="btn btn-secondary"
        @click="handleCancel"
      >
        取消订单
      </button>
      
      <button 
        class="btn btn-outline"
        @click="contactUser"
      >
        联系{{ userStore.userInfo?.role === 'client' ? '服务商' : '需求方' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user.js'
import { useOrderStore } from '../../store/order.js'

const userStore = useUserStore()
const orderStore = useOrderStore()

// 响应式数据 - 初始化完整结构避免 undefined
const order = ref({
  id: '',
  project_id: '',
  project_title: '',
  buyer_id: '',
  buyer_name: '',
  seller_id: '',
  seller_name: '',
  amount: 0,
  status: 'pending',
  created_at: '',
  updated_at: ''
})

// 订单步骤
const orderSteps = [
  { title: '创建订单', status: 'created' },
  { title: '付款成功', status: 'paid' },
  { title: '开始服务', status: 'in_progress' },
  { title: '确认完成', status: 'completed' }
]

// 页面加载
onMounted(() => {
  loadOrderDetail()
})

// 加载订单详情
const loadOrderDetail = async () => {
  // 获取订单ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const orderId = currentPage.$page?.options?.id
  
  if (!orderId) {
    uni.showToast({
      title: '订单ID不存在',
      icon: 'none'
    })
    return
  }
  
  try {
    // 使用orderStore获取订单详情
    const orderDetail = await orderStore.getOrderDetail(orderId)
    // 确保数据结构完整
    order.value = {
      ...order.value, // 保留默认结构
      ...orderDetail  // 覆盖实际数据
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    uni.showToast({
      title: '获取订单详情失败',
      icon: 'none'
    })
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待付款'
    case 'paid':
      return '已付款'
    case 'in_progress':
      return '进行中'
    case 'completed':
      return '已完成'
    case 'cancelled':
      return '已取消'
    default:
      return '未知状态'
  }
}

// 获取状态描述
const getStatusDesc = (status) => {
  switch (status) {
    case 'pending':
      return '请尽快完成支付，以免订单自动取消'
    case 'paid':
      return '已完成支付，等待服务商开始服务'
    case 'in_progress':
      return '服务商正在为您提供服务'
    case 'completed':
      return '订单已完成，感谢您的使用'
    case 'cancelled':
      return '订单已取消'
    default:
      return ''
  }
}

// 获取状态图标
const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return '💰' // 使用 emoji 代替 icon 类名
    case 'paid':
    case 'in_progress':
      return '⏳'
    case 'completed':
      return '✅'
    case 'cancelled':
      return '❌'
    default:
      return 'ℹ️'
  }
}

// 获取状态类名
const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'status-pending'
    case 'paid':
    case 'in_progress':
      return 'status-progress'
    case 'completed':
      return 'status-completed'
    case 'cancelled':
      return 'status-cancelled'
    default:
      return ''
  }
}

// 判断步骤是否激活
const isStepActive = (stepStatus, orderStatus) => {
  const statusOrder = ['created', 'pending', 'paid', 'in_progress', 'completed', 'cancelled']
  const stepIndex = statusOrder.indexOf(stepStatus)
  const orderIndex = statusOrder.indexOf(orderStatus)
  
  // 如果订单已取消，只有创建订单步骤是激活的
  if (orderStatus === 'cancelled') {
    return stepStatus === 'created'
  }
  
  return stepIndex <= orderIndex
}

// 获取步骤时间
const getStepTime = (stepStatus, orderData) => {
  switch (stepStatus) {
    case 'created':
      return orderData.created_at
    case 'paid':
    case 'in_progress':
    case 'completed':
      return orderData.updated_at
    default:
      return orderData.created_at
  }
}

// 格式化金额 - 添加安全检查
const formatMoney = (amount) => {
  if (amount === undefined || amount === null) return '0.00'
  // 确保是数字
  const num = typeof amount === 'number' ? amount : parseFloat(amount)
  if (isNaN(num)) return '0.00'
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// 格式化日期 - 添加安全检查
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '无效日期'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 处理支付
const handlePay = async () => {
  try {
    await orderStore.payOrder(order.value.id)
    uni.showToast({
      title: '支付成功',
      icon: 'success'
    })
    // 重新加载订单详情
    loadOrderDetail()
  } catch (error) {
    uni.showToast({
      title: '支付失败',
      icon: 'none'
    })
  }
}

// 处理确认完成
const handleConfirm = () => {
  uni.showModal({
    title: '确认完成',
    content: '确认该订单已完成吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await orderStore.completeOrder(order.value.id)
          uni.showToast({
            title: '确认完成成功',
            icon: 'success'
          })
          // 重新加载订单详情
          loadOrderDetail()
        } catch (error) {
          uni.showToast({
            title: '确认完成失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 处理取消订单
const handleCancel = () => {
  uni.showModal({
    title: '取消订单',
    content: '确认取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await orderStore.cancelOrder(order.value.id)
          uni.showToast({
            title: '取消订单成功',
            icon: 'success'
          })
          // 重新加载订单详情
          loadOrderDetail()
        } catch (error) {
          uni.showToast({
            title: '取消订单失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 联系用户
const contactUser = () => {
  const contactName = userStore.userInfo?.role === 'client' ? order.value.seller_name : order.value.buyer_name
  uni.showToast({
    title: `联系 ${contactName || '用户'} 功能开发中`,
    icon: 'none'
  })
}
</script>
<style scoped>
/* 科技风变量 */
:root {
  --bg-dark: #0f0f1a;
  --primary-color: #00eeff;
  --secondary-color: #8a2be2;
  --text-light: #ffffff;
  --text-gray: #b0b0b0;
  --border-radius: 24rpx;
  --box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
  --border-color: rgba(255, 255, 255, 0.1);
}

.order-detail-page {
  background: var(--bg-dark);
  min-height: 100vh;
  padding: 20rpx;
  padding-bottom: 120rpx;
  font-family: "Helvetica Neue", sans-serif;
}

/* 状态卡片 - 毛玻璃效果 */
.status-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-radius: var(--border-radius);
  margin-bottom: 30rpx;
  color: var(--text-light);
  background: rgba(30, 30, 46, 0.6);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border: 1rpx solid var(--border-color);
  box-shadow: var(--box-shadow);
}

.status-card.status-pending {
  background: linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(245, 124, 0, 0.3));
  box-shadow: 0 0 20rpx rgba(255, 165, 0, 0.3);
}

.status-card.status-progress {
  background: linear-gradient(135deg, rgba(45, 140, 240, 0.2), rgba(25, 118, 210, 0.3));
  box-shadow: 0 0 20rpx rgba(45, 140, 240, 0.3);
}

.status-card.status-completed {
  background: linear-gradient(135deg, rgba(25, 190, 107, 0.2), rgba(0, 150, 136, 0.3));
  box-shadow: 0 0 20rpx rgba(25, 190, 107, 0.3);
}

.status-card.status-cancelled {
  background: linear-gradient(135deg, rgba(153, 153, 153, 0.2), rgba(102, 102, 102, 0.3));
  box-shadow: 0 0 20rpx rgba(153, 153, 153, 0.3);
}

.status-card .status-icon {
  font-size: 48rpx;
  margin-right: 24rpx;
}

.status-card .status-info .status-text {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.status-card .status-info .status-desc {
  font-size: 24rpx;
  opacity: 0.9;
}

/* 信息卡片 */
.info-card {
  background: rgba(30, 30, 46, 0.6);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: var(--border-radius);
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid var(--border-color);
  box-shadow: var(--box-shadow);
}

.info-card .card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid var(--border-color);
}

.info-card .info-item {
  display: flex;
  margin-bottom: 16rpx;
  align-items: center;
}

.info-card .info-item:last-child {
  margin-bottom: 0;
}

.info-card .info-item .label {
  font-size: 26rpx;
  color: var(--text-gray);
  width: 160rpx;
  flex-shrink: 0;
}

.info-card .info-item .value {
  font-size: 26rpx;
  color: var(--text-light);
  flex: 1;
}

.info-card .project-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid var(--border-color);
}

.info-card .project-info .project-title {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--text-light);
}

.info-card .project-info .project-amount {
  font-size: 32rpx;
  font-weight: 600;
  color: #2ecc71;
}

/* 时间线 */
.progress-timeline {
  padding: 16rpx 0;
}

.progress-timeline .timeline-item {
  position: relative;
  padding-left: 40rpx;
  padding-bottom: 30rpx;
}

.progress-timeline .timeline-item:last-child {
  padding-bottom: 0;
}

.progress-timeline .timeline-item::before {
  content: '';
  position: absolute;
  top: 16rpx;
  left: 11rpx;
  width: 2rpx;
  height: calc(100% - 16rpx);
  background: var(--border-color);
}

.progress-timeline .timeline-item:last-child::before {
  display: none;
}

.progress-timeline .timeline-item .timeline-dot {
  position: absolute;
  top: 12rpx;
  left: 8rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: var(--border-color);
  border: 2rpx solid var(--bg-dark);
}

.progress-timeline .timeline-item.active .timeline-dot {
  background: var(--primary-color);
  box-shadow: 0 0 12rpx var(--primary-color);
}

.progress-timeline .timeline-item.active .timeline-title {
  color: var(--primary-color);
  font-weight: 500;
}

.progress-timeline .timeline-item .timeline-content .timeline-title {
  font-size: 26rpx;
  color: var(--text-gray);
  margin-bottom: 8rpx;
}

.progress-timeline .timeline-item .timeline-content .timeline-time {
  font-size: 22rpx;
  color: var(--text-gray);
  opacity: 0.7;
}

/* 操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  background: rgba(20, 20, 36, 0.9);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-top: 1rpx solid var(--border-color);
  z-index: 100;
}

.action-bar .btn {
  flex: 1;
  margin: 0 12rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 35rpx;
  font-size: 26rpx;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), #0077ff);
  color: white;
  box-shadow: 0 0 16rpx rgba(0, 238, 255, 0.5);
}

.btn-success {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  box-shadow: 0 0 16rpx rgba(46, 204, 113, 0.5);
}

.btn-secondary {
  background: linear-gradient(135deg, #9e9e9e, #616161);
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1rpx solid var(--primary-color);
  color: var(--primary-color);
  box-shadow: 0 0 12rpx rgba(0, 238, 255, 0.3);
}
</style>