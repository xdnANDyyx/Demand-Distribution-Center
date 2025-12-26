<template>
  <view class="orders-page">
    <!-- 顶部选项卡 -->
    <view class="tab-header">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-item" 
        :class="{ active: activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view 
        v-for="order in filteredOrders" 
        :key="order.id"
        class="order-item"
        @click="goToOrderDetail(order.id)"
      >
        <view class="order-header">
          <text class="order-id">订单号：{{ order.id }}</text>
          <text class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </text>
        </view>
        
        <view class="order-content">
          <text class="project-title">{{ order.project_title }}</text>
          
          <view class="order-info">
            <view class="info-item">
              <text class="label">交易金额：</text>
              <text class="value price">¥{{ formatMoney(order.amount) }}</text>
            </view>
            
            <view class="info-item">
              <text class="label">{{ userStore.userInfo?.role === 'client' ? '服务商：' : '需求方：' }}</text>
              <text class="value">{{ userStore.userInfo?.role === 'client' ? order.seller_name : order.buyer_name }}</text>
            </view>
            
            <view class="info-item">
              <text class="label">创建时间：</text>
              <text class="value">{{ formatDate(order.created_at) }}</text>
            </view>
          </view>
        </view>
        
        <view class="order-footer">
          <button 
            v-if="order.status === 'pending'" 
            class="btn btn-primary btn-small"
            @click.stop="handlePay(order.id)"
          >
            立即支付
          </button>
          
          <button 
            v-if="order.status === 'in_progress' && userStore.userInfo?.role === 'client'" 
            class="btn btn-success btn-small"
            @click.stop="handleConfirm(order.id)"
          >
            确认完成
          </button>
          
          <button 
            v-if="order.status === 'pending'" 
            class="btn btn-secondary btn-small"
            @click.stop="handleCancel(order.id)"
          >
            取消订单
          </button>
          
          <button 
            class="btn btn-outline btn-small"
            @click.stop="contactUser(userStore.userInfo?.role === 'client' ? order.seller_name : order.buyer_name)"
          >
            联系{{ userStore.userInfo?.role === 'client' ? '服务商' : '需求方' }}
          </button>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>
      
      <!-- 没有更多数据 -->
      <view v-if="!hasMore && filteredOrders.length > 0" class="no-more">
        <text class="no-more-text">没有更多订单了</text>
      </view>
      
      <!-- 空状态 -->
      <view v-if="!loading && filteredOrders.length === 0" class="empty-state">
        <image src="/static/images/empty-order.png" class="empty-icon"></image>
        <text class="empty-text">暂无相关订单</text>
        <button class="btn btn-primary" @click="goToProjects">浏览项目</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue' 
import { useUserStore } from '../../store/user.js'
import { get, put } from '../../utils/request.js'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const activeTab = ref('all')
const orders = ref([]) // 初始化为空数组

// 选项卡
const tabs = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: 'pending' }, // 注意：这里的 value 需要与后端返回的 status 字段值对应
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

// --- 修复：将函数定义移到 expose 之前，并移除 defineExpose ---
// 下拉刷新 (需要在 defineExpose 之前定义)
const onPullDownRefresh = async () => {
  console.log("触发下拉刷新");
  await loadOrders(true)
  uni.stopPullDownRefresh()
}

// 上拉加载更多 (需要在 defineExpose 之前定义)
const onReachBottom = () => {
  console.log("触发上拉加载");
  if (!loading.value && hasMore.value) {
    loadOrders(false)
  }
}
// --- 修复结束 ---

// 过滤订单 (增强健壮性)
const filteredOrders = computed(() => {
  // 确保 orders.value 是数组
  const ordersList = Array.isArray(orders.value) ? orders.value : [];
  if (activeTab.value === 'all') {
    return ordersList
  }
  return ordersList.filter(order => order.status === activeTab.value)
})

// 加载订单列表
const loadOrders = async (refresh = false) => {
  if (loading.value) return

  try {
    loading.value = true
    const page = refresh ? 1 : currentPage.value + 1
    const pageSize = 10
    
    // 获取用户ID
    const userID = userStore.userInfo?.id
    if (!userID) {
      console.error('用户ID不存在')
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    // 获取用户角色
    const role = userStore.userInfo?.role || ''
    
    // 获取状态过滤条件 - 转换为数字
    let statusNum = '';
    if (activeTab.value !== 'all') {
      switch (activeTab.value) {
        case 'pending': statusNum = '0'; break;
        case 'in_progress': statusNum = '1'; break;
        case 'completed': statusNum = '3'; break;
        case 'cancelled': statusNum = '4'; break;
      }
    }
    
    // 调用API
    try {
      // 使用封装好的 get 方法
      const data = await get('/orders', {
        user_id: userID,
        page: page,
        page_size: pageSize,
        role: role,
        status: statusNum
      })
      
      console.log('订单数据:', data)
      
      // 处理返回的数据 - 适配后端返回的数据结构
      const orderList = data.list || [];
      
      // 转换订单数据格式，使其符合前端期望的格式
      const formattedOrders = orderList.map(order => {
        return {
          id: order.id,
          order_no: order.order_no,
          project_title: order.project?.title || '未知项目',
          amount: order.amount,
          status: mapStatusToString(order.status),
          created_at: order.created_at,
          seller_name: order.bidder?.username || '未知服务商',
          buyer_name: order.publisher?.username || '未知需求方'
        };
      });
      
      if (refresh) {
        orders.value = formattedOrders
        currentPage.value = 1
      } else {
        orders.value.push(...formattedOrders)
        currentPage.value = page
      }
      
      hasMore.value = !data.hasMore ? false : data.total > page * pageSize
    } catch (apiError) {
      console.error('API请求失败:', apiError)
      throw apiError
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}


// 切换选项卡
const switchTab = (tab) => {
  if (activeTab.value === tab) return

  activeTab.value = tab
  loadOrders(true)
}

// 页面加载
onMounted(() => {
  console.log("订单页面挂载");
  loadOrders(true)
})

// --- 移除了 defineExpose ---
// 如果需要在页面级别暴露方法给 uni-app 生命周期调用，
// 更推荐在 <script setup> 外部使用 definePageConfig 或在选项式 API 中定义。
// 但通常，直接在 setup 内定义并确保它们在使用前已初始化即可。
// --- 移除结束 ---

// 将数字状态映射为字符串状态
const mapStatusToString = (statusNum) => {
  switch (parseInt(statusNum)) {
    case 0: return 'pending';      // 待付款
    case 1: return 'in_progress';  // 进行中
    case 2: return 'in_progress';  // 进行中（可能是其他子状态）
    case 3: return 'completed';    // 已完成
    case 4: return 'cancelled';    // 已取消
    default: return 'unknown';
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待付款'
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

// 获取状态类名
const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'status-pending'
    case 'in_progress': // 修正状态值
      return 'status-progress'
    case 'completed':
      return 'status-completed'
    case 'cancelled':
      return 'status-cancelled'
    default:
      return ''
  }
}

// 格式化金额
const formatMoney = (amount) => {
  // 确保 amount 是数字
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '无效日期'; // 处理无效日期字符串
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 跳转到订单详情
const goToOrderDetail = (orderId) => {
  if (orderId) { // 添加基本验证
    uni.navigateTo({
      url: `/pages/orders/detail?id=${orderId}`
    })
  }
}

// 处理支付
const handlePay = (orderId) => {
  if (!orderId) return
  
  uni.showModal({
    title: '支付订单',
    content: '确认支付该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 显示加载中
          uni.showLoading({
            title: '处理中...'
          })
          
          // 调用支付API
          await put(`/orders/${orderId}/status`, {
            status: 1 // 已支付状态
          })
          
          // 支付成功
          uni.hideLoading()
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          })
          
          // 刷新订单列表
          loadOrders(true)
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: '支付失败: ' + (error.message || '未知错误'),
            icon: 'none'
          })
        }
      }
    }
  })
}

// 处理确认完成
const handleConfirm = (orderId) => {
  if (!orderId) return
  
  uni.showModal({
    title: '确认完成',
    content: '确认该订单已完成吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 显示加载中
          uni.showLoading({
            title: '处理中...'
          })
          
          // 调用确认完成API
          await put(`/orders/${orderId}/complete`, {})
          
          // 确认成功
          uni.hideLoading()
          uni.showToast({
            title: '确认完成成功',
            icon: 'success'
          })
          
          // 刷新订单列表
          loadOrders(true)
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: '确认失败: ' + (error.message || '未知错误'),
            icon: 'none'
          })
        }
      }
    }
  })
}

// 处理取消订单
const handleCancel = (orderId) => {
  if (!orderId) return
  
  uni.showModal({
    title: '取消订单',
    content: '确认取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 显示加载中
          uni.showLoading({
            title: '处理中...'
          })
          
          // 调用取消订单API
          await put(`/orders/${orderId}/cancel`, {})
          
          // 取消成功
          uni.hideLoading()
          uni.showToast({
            title: '订单已取消',
            icon: 'success'
          })
          
          // 刷新订单列表
          loadOrders(true)
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: '取消失败: ' + (error.message || '未知错误'),
            icon: 'none'
          })
        }
      }
    }
  })
}

// 联系用户
const contactUser = (username) => {
  uni.showToast({
    title: `联系 ${username || '用户'} 功能开发中`, // 添加默认值
    icon: 'none'
  })
}

// 跳转到项目列表
const goToProjects = () => {
  uni.switchTab({
    url: '/pages/projects/list'
  })
}
</script>

<style lang="css" scoped>
/* 科技风全局变量 */
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

.orders-page {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  min-height: 100vh;
  padding: 20rpx;
  font-family: "Helvetica Neue", sans-serif;
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 毛玻璃卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx); /* 兼容安卓 */
  border-radius: var(--border-radius);
  border: 1rpx solid var(--border-color);
  box-shadow: var(--box-shadow);
}

/* 顶部选项卡 */
.tab-header {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
  position: sticky;
  top: 0;
  z-index: 99;
}

.tab-item {
  padding: 20rpx 0;
  font-size: 28rpx;
  color: var(--text-gray);
  transition: all 0.3s ease;
  position: relative;
}

.tab-item.active {
  color: var(--primary-color);
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 6rpx;
  background: var(--primary-color);
  border-radius: 6rpx;
  box-shadow: 0 0 12rpx var(--primary-color);
}

/* 订单项 */
.order-item {
  background: rgba(30, 30, 46, 0.6);
  border-radius: var(--border-radius);
  margin-bottom: 30rpx;
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: transform 0.3s ease;
  border: 1rpx solid var(--border-color);
}

.order-item:hover {
  transform: translateY(-6rpx);
  box-shadow: 0 12rpx 40rpx rgba(0, 238, 255, 0.2);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: rgba(20, 20, 36, 0.7);
  border-bottom: 1rpx solid var(--border-color);
}

.order-id {
  font-size: 26rpx;
  color: var(--text-light);
}

.order-status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-gray);
}

.order-status.status-pending {
  background: rgba(255, 165, 0, 0.2);
  color: orange;
  box-shadow: 0 0 8rpx rgba(255, 165, 0, 0.4);
}

.order-status.status-progress {
  background: rgba(0, 238, 255, 0.2);
  color: var(--primary-color);
  box-shadow: 0 0 8rpx var(--primary-color);
}

.order-status.status-completed {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  box-shadow: 0 0 8rpx rgba(46, 204, 113, 0.4);
}

.order-status.status-cancelled {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  box-shadow: 0 0 8rpx rgba(231, 76, 60, 0.4);
}

.order-content {
  padding: 20rpx;
}

.project-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-light);
  margin-bottom: 16rpx;
  display: block;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.label {
  font-size: 26rpx;
  color: var(--text-gray);
}

.value {
  font-size: 26rpx;
  color: var(--text-light);
}

.price {
  color: #2ecc71;
  font-weight: bold;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 20rpx;
  background: rgba(20, 20, 36, 0.5);
  border-top: 1rpx solid var(--border-color);
}

/* 按钮样式 */
.btn {
  padding: 0 30rpx;
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

.btn-small {
  height: 60rpx;
  line-height: 60rpx;
  font-size: 24rpx;
  padding: 0 24rpx;
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

.btn-outline:hover {
  background: rgba(0, 238, 255, 0.1);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-text {
  color: var(--text-gray);
  font-size: 28rpx;
  margin-bottom: 40rpx;
  display: block;
}

/* 加载 & 没有更多 */
.loading,
.no-more {
  text-align: center;
  padding: 30rpx 0;
  color: var(--text-gray);
  font-size: 26rpx;
}
</style>