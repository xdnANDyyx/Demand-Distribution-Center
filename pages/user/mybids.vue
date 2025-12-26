<template>
  <view class="mybids-page">
    <!-- 头部区域 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <image class="back-icon-image" src="/static/icons/arrow_left.png" mode="aspectFit"></image>
      </view>
      <view class="header-title">我的投标</view>
    </view>
    
    <!-- 顶部选项卡 -->
    <view class="tab-header glass-effect">
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

    <!-- 投标列表 -->
    <view class="bids-list">
      <!-- 投标卡片 -->
      <view v-for="bid in filteredBids" :key="bid.id" class="bid-item glass-effect">
        <!-- 项目信息 -->
        <view class="project-info" @click="goToProjectDetail(bid.project?.id)">
          <view class="project-title">{{ bid.project?.title || '未知项目' }}</view>
          <view class="project-category">{{ bid.project?.category_name || '未分类' }}</view>
        </view>
        
        <!-- 投标详情 -->
        <view class="bid-details">
          <view class="info-grid">
            <view class="info-item">
              <text class="info-label">我的报价</text>
              <text class="info-value price">¥{{ bid.price }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">交付周期</text>
              <text class="info-value">{{ bid.delivery_days }} 天</text>
            </view>
            <view class="info-item">
              <text class="info-label">投标时间</text>
              <text class="info-value">{{ formatDate(bid.created_at) }}</text>
            </view>
          </view>
          
          <!-- 投标状态 -->
          <view class="bid-status-container">
            <view class="bid-status" :class="getBidStatusClass(bid.status)">
              {{ getBidStatusText(bid.status) }}
            </view>
          </view>
          
          <!-- 投标描述 -->
          <view class="bid-description">
            <text class="description-label">投标说明:</text>
            <text class="description-content">{{ bid.description || '无' }}</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="bid-actions">
          <!-- 联系发布者按钮 -->
          <button class="action-btn contact-btn" @click="handleContact(bid.project?.publisher_id)">
            联系发布者
          </button>
          
          <!-- 取消投标按钮 (仅在待审核状态显示) -->
          <button 
            v-if="bid.status === 'pending'"
            class="action-btn cancel-btn" 
            @click="handleCancelBid(bid.id)"
          >
            取消投标
          </button>
          
          <!-- 修改投标按钮 (仅在待审核状态显示) -->
          <button 
            v-if="bid.status === 'pending'"
            class="action-btn edit-btn" 
            @click="handleEditBid(bid)"
          >
            修改投标
          </button>
          
          <!-- 查看项目按钮 -->
          <button class="action-btn view-btn" @click="goToProjectDetail(bid.project?.id)">
            查看项目
          </button>
        </view>
        
        <!-- 中标标识 -->
        <view v-if="bid.status === 'selected'" class="selected-badge">
          <text class="selected-text">🏆 已中标</text>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading && filteredBids.length === 0" class="empty-state glass-effect">
        <image class="empty-icon" src="/static/icons/secondhand.png" mode="aspectFit"></image>
        <text class="empty-text">暂无投标记录</text>
        <text class="empty-subtext">去浏览项目并提交您的投标吧</text>
        <button class="browse-projects-btn" @click="goBrowseProjects">浏览项目</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user.js'
import { useMessageStore } from '../../store/message.js'
import { cancelBid, updateBid } from '../../api/bid.js'

const userStore = useUserStore()
const messageStore = useMessageStore()

// 响应式数据
const loading = ref(false)
const activeTab = ref('all')
const bids = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 选项卡
const tabs = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已中标', value: 'selected' }
]

// 过滤投标
const filteredBids = computed(() => {
  if (activeTab.value === 'all') {
    return bids.value
  }
  return bids.value.filter(bid => bid.status === activeTab.value)
})

// 初始化函数
const initData = () => {
  loadBids(true)
}

// 在 onMounted 中调用初始化函数
onMounted(() => {
  initData()
})

// 页面显示时刷新数据
onShow(() => {
  loadBids(true)
})

// 加载投标列表
const loadBids = async (refresh = false) => {
  try {
    if (refresh) {
      currentPage.value = 1
      hasMore.value = true
    }
    
    if (!hasMore.value && !refresh) return
    
    loading.value = true
    
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      type: activeTab.value === 'all' ? 'published' : activeTab.value
    }
    
    const response = await userStore.getmybidslist(params)
    console.log('获取的投标列表:', response)
    
    if (response && response.list && Array.isArray(response.list)) {
      if (refresh) {
        bids.value = response.list
      } else {
        bids.value = [...bids.value, ...response.list]
      }
      
      // 判断是否还有更多数据
      hasMore.value = response.list.length === pageSize.value
      
      // 如果有数据，页码加1
      if (response.list.length > 0) {
        currentPage.value++
      }
    } else {
      bids.value = refresh ? [] : bids.value
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载投标列表失败:', error)
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
  loadBids(true)
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 获取投标状态文本
const getBidStatusText = (status) => {
  const statusMap = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝',
    'selected': '已中标',
    'canceled': '已取消'
  }
  
  return statusMap[status] || '未知状态'
}

// 获取投标状态样式类
const getBidStatusClass = (status) => {
  const classMap = {
    'pending': 'status-pending',
    'approved': 'status-approved',
    'rejected': 'status-rejected',
    'selected': 'status-selected',
    'canceled': 'status-canceled'
  }
  
  return classMap[status] || ''
}

// 联系发布者
const handleContact = async (publisherId) => {
  if (!userStore.hasLogin) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  
  if (!publisherId) {
    uni.showToast({ title: '无法联系发布者', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '正在创建会话...' })
    
    const chatData = await messageStore.createChat(publisherId)
    uni.hideLoading()
    
    if (chatData && chatData.id) {
      uni.showToast({ title: '已创建会话', icon: 'success' })
      
      uni.navigateTo({
        url: `/pages/messages/chat?id=${chatData.id}&chatId=${chatData.id}&targetUserId=${publisherId}&targetUserName=${encodeURIComponent('项目发布者')}`,
      })
    } else {
      throw new Error('创建会话失败')
    }
  } catch (error) {
    uni.hideLoading()
    console.error('创建会话失败:', error)
    const errorMsg = error.message || '操作失败'
    uni.showToast({ title: errorMsg, icon: 'none' })
  }
}

// 取消投标
const handleCancelBid = async (bidId) => {
  if (!bidId) {
    uni.showToast({ title: '无效的投标ID', icon: 'none' })
    return
  }
  
  const res = await uni.showModal({
    title: '确认取消',
    content: '确定要取消这个投标吗？此操作不可撤销。'
  })
  
  if (res.confirm) {
    try {
      uni.showLoading({ title: '正在取消...' })
      await cancelBid(bidId)
      uni.hideLoading()
      uni.showToast({ title: '投标已取消', icon: 'success' })
      
      // 刷新投标列表
      loadBids(true)
    } catch (error) {
      uni.hideLoading()
      uni.showToast({ title: '取消失败', icon: 'none' })
      console.error('取消投标失败:', error)
    }
  }
}

// 修改投标
const handleEditBid = (bid) => {
  if (!bid || !bid.project) {
    uni.showToast({ title: '无效的投标信息', icon: 'none' })
    return
  }
  
  // 将投标信息存储到本地，以便在编辑页面使用
  try {
    uni.setStorageSync('editBidData', bid)
  } catch (e) {
    console.error('保存投标信息失败:', e)
  }
  
  // 跳转到项目详情页面，并传递编辑标志
  uni.navigateTo({
    url: `/pages/projects/detail?id=${bid.project.id}&editBid=true`
  })
}

// 跳转到项目详情
const goToProjectDetail = (projectId) => {
  if (projectId) {
    uni.navigateTo({
      url: `/pages/projects/detail?id=${projectId}`
    })
  } else {
    uni.showToast({ title: '项目不存在', icon: 'none' })
  }
}

// 浏览项目
const goBrowseProjects = () => {
  uni.switchTab({
    url: '/pages/projects/list'
  })
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}
</script>

<style scoped>
/* pages/user/mybids.vue 样式 (毛玻璃科技风) */

.mybids-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  min-height: 100vh;
  padding: 20rpx;
  padding-bottom: 40rpx; /* 为可能的底部留出空间 */
  color: #fff;
  overflow-x: hidden; /* 防止水平滚动 */
}

/* 背景动画 */
@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* --- 头部区域样式 --- */
.header {
  display: flex;
  align-items: center;
  padding: 20rpx 10rpx; /* 减少左右padding */
  margin-bottom: 20rpx;
}

.back-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.back-icon-image {
  width: 36rpx;
  height: 36rpx;
  filter: brightness(0) invert(1); /* 使图片变为白色 */
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}
/* --- 头部区域样式结束 --- */


/* --- 通用毛玻璃效果类 --- */
.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8rpx 32rpx 0 rgba(0, 0, 0, 0.1);
}
/* --- 通用毛玻璃效果类结束 --- */


/* --- 顶部选项卡样式 --- */
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 15rpx 10rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  padding: 0 20rpx;
}

.tab-item.active {
  color: #ffffff;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 18rpx;
}
/* --- 顶部选项卡样式结束 --- */


/* --- 投标列表和卡片样式 --- */
.bids-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx; /* 投标项之间的间距 */
}

.bid-item {
  display: flex;
  flex-direction: column;
  padding: 30rpx;
  position: relative;
}

.project-info {
  margin-bottom: 20rpx;
  cursor: pointer;
}

.project-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.project-category {
  font-size: 24rpx;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  margin-bottom: 15rpx;
}

.bid-details {
  margin-bottom: 20rpx;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-label {
  font-size: 24rpx;
  opacity: 0.8;
  margin-bottom: 8rpx;
}

.info-value {
  font-size: 28rpx;
  font-weight: 500;
}

.info-value.price {
  color: #FFD700; /* 金色 */
}

.bid-status-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15rpx;
}

.bid-status {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-pending {
  background: rgba(52, 152, 219, 0.3);
  border: 1px solid rgba(52, 152, 219, 0.5);
}

.status-approved {
  background: rgba(46, 204, 113, 0.3);
  border: 1px solid rgba(46, 204, 113, 0.5);
}

.status-rejected {
  background: rgba(231, 76, 60, 0.3);
  border: 1px solid rgba(231, 76, 60, 0.5);
}

.status-selected {
  background: rgba(241, 196, 15, 0.3);
  border: 1px solid rgba(241, 196, 15, 0.5);
  color: #FFD700;
}

.status-canceled {
  background: rgba(149, 165, 166, 0.3);
  border: 1px solid rgba(149, 165, 166, 0.5);
}

.bid-description {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-top: 15rpx;
}

.description-label {
  font-size: 26rpx;
  font-weight: 500;
  margin-bottom: 10rpx;
  display: block;
}

.description-content {
  font-size: 26rpx;
  line-height: 1.5;
  opacity: 0.9;
}

.bid-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}

.action-btn {
  flex: 1;
  min-width: 180rpx;
  height: 70rpx;
  border-radius: 35rpx;
  border: none;
  color: #fff;
  font-size: 26rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.cancel-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.edit-btn {
  background: linear-gradient(135deg, #f39c12, #d35400);
}

.view-btn {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.action-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.selected-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12rpx;
  padding: 8rpx 16rpx;
}

.selected-text {
  color: #FFD700;
  font-weight: bold;
  font-size: 24rpx;
}
/* --- 投标列表和卡片样式结束 --- */


/* --- 状态提示样式 --- */
.loading-state, .empty-state {
  text-align: center;
  padding: 60rpx 30rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-state {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 32rpx;
  margin-bottom: 20rpx;
}

.empty-subtext {
  font-size: 28rpx;
  opacity: 0.7;
  margin-bottom: 30rpx;
}

.browse-projects-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 35rpx;
  padding: 15rpx 40rpx;
  font-size: 28rpx;
  margin-top: 20rpx;
}
/* --- 状态提示样式结束 --- */
</style>