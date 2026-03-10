<template>
  <view class="user-projects-page">
    <!-- 头部区域 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <image class="back-icon-image" src="/static/icons/arrow_left.png" mode="aspectFit"></image>
      </view>
      <view class="header-title">我的项目</view>
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

    <!-- 项目列表 -->
    <view class="project-list">
      <!-- 项目卡片 -->
      <view v-for="project in filteredProjects" :key="project.id" class="project-item">
        <!-- 项目信息卡片 -->
        <view class="card-glass">
          <view class="project-title">{{ project.title }}</view>
          <view class="info-grid">
            <view class="info-item">
              <text class="info-label">预算</text>
              <text class="info-value price">¥{{ project.budget_min }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">交付周期</text>
              <text class="info-value">{{ project.delivery_time }} 天</text>
            </view>
            <view class="info-item">
              <text class="info-label">投标数</text>
              <text class="info-value">{{ project.bid_count }}</text>
            </view>
          </view>
          <view class="project-actions">
            <button class="project-action-btn detail-btn" @click="goToProjectDetail(project.id)">查看详情</button>
            <button
              class="project-action-btn edit-btn"
              @click="handleEditProject(project.id)"
              :disabled="project.status === 3 || project.status === 4"
            >
              修改信息
            </button>
            <button
              class="project-action-btn cancel-btn"
              @click="deleteProject(project.id)"
            >
              删除项目
            </button>
          </view>
        </view>
        
        <!-- 投标情况区域 -->
        <view class="bid-status-section glass-effect">
          <view class="bid-status-header">
            <view class="bid-status-title">投标情况</view>
            <view class="bid-status-count">{{ projectBids[project.id]?.length || 0 }}</view>
          </view>
          
          <!-- 投标列表 -->
          <view class="bids-container">
            <view v-if="projectBids[project.id] && projectBids[project.id].length > 0" class="bids-list">
              <view v-for="bid in projectBids[project.id]" :key="bid.id" class="bid-item glass-effect-subtle">
                <view class="bid-info">
                  <!-- 投标者头像和用户名 -->
                  <image class="bidder-avatar" :src="bid.bidder?.avatar || '/static/images/default-avatar.png'" mode="aspectFill" />
                  <text class="bidder-name">{{ bid.bidder?.username || '未知用户' }}</text>
                  <!-- 投标价格 -->
                  <text class="bid-price">¥{{ bid.price }}</text>
                  <!-- 交付周期 -->
                  <text class="bid-delivery">交付周期: {{ bid.delivery_days }} 天</text>
                  <!-- 投标描述 -->
                  <text class="bid-description">{{ bid.description }}</text>
				  <!--新需求：补全这里 投标的图片或视频-->
				  <!-- 投标附件（图片/视频） -->
				  <view v-if="bid.attachments" class="bid-attachments">
				    <view v-for="(url, index) in parseAttachments(bid.attachments)" :key="index" class="attachment-item">
				      <!-- 图片 -->
				      <image
				        v-if="isImageUrl(url)"
				        :src="url"
				        class="attachment-media"
				        mode="widthFix"
				        @click="previewImage(url)"
				      />
				      <!-- 视频 -->
				      <video
				        v-else-if="isVideoUrl(url)"
				        :src="url"
				        class="attachment-media"
				        controls
				        playsinline
				      />
				    </view>
				  </view>
				  <!-- "description": "1288456987236",
            "attachments": "http://115.190.38.218/api/static/img/1763219827192_Screenshot_2025-11-15-13-17-16-13_a3aef48b92d9927bcc00b64ec0b65b97_20251115231708_67097249.jpg,http://115.190.38.218/api/static/video/1763219882165_20251115231838_40975918.mp4",-->
                </view>
                <!-- 操作按钮 -->
                <view class="bid-actions">
                  <!-- 去沟通按钮 -->
                  <button class="action-btn contact-bidder-btn" @click="handleContact(bid.bidder?.id)">联系投标人</button>
                  
                  <!-- 🎯 修改：确认中标按钮 -->
                  <button 
                    class="action-btn select-bid-btn"
                    @click="handleSelectBid(bid.id)"
                    :disabled="isBidSelected(project.id, bid.id) || hasSelectedBid(project.id)"
                    :class="{ 'btn-disabled': isBidSelected(project.id, bid.id) || hasSelectedBid(project.id) }"
                  >
                    <text v-if="isBidSelected(project.id, bid.id)">已中标</text>
                    <text v-else-if="hasSelectedBid(project.id)">项目已选标</text>
                    <text v-else>确认中标</text>
                  </button>
                </view>
                
                <!-- 🎯 新增：中标状态提示 -->
                <view 
                  v-if="isBidSelected(project.id, bid.id)" 
                  class="selected-bid-indicator"
                >
                  <text class="selected-text">🏆 当前中标方案</text>
                </view>
              </view>
            </view>
            <view v-else class="empty-bids">
              <text>暂无投标</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading && filteredProjects.length === 0" class="empty-state glass-effect">
        <image class="empty-icon" src="/static/images/empty-box.png" mode="aspectFit"></image>
        <text class="empty-text">暂无相关项目</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useProjectStore } from '../../store/project.js'
import { useUserStore } from '../../store/user.js'
import { useMessageStore } from '../../store/message.js'

const messageStore = useMessageStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

const loading = ref(false)
const activeTab = ref('all')
const projects = ref([])
const projectBids = ref({})
const selectedBids = ref({})

const tabs = [
  { label: '\u5168\u90e8', value: 'all' },
  { label: '\u62db\u6807\u4e2d', value: 'bidding' },
  { label: '\u8fdb\u884c\u4e2d', value: 'in_progress' },
  { label: '\u5df2\u5b8c\u6210', value: 'completed' }
]

const statusMap = {
  0: 'bidding',
  1: 'selected',
  2: 'in_progress',
  3: 'completed',
  4: 'cancelled',
  bidding: 'bidding',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled'
}

const normalizeProject = (project = {}) => ({
  ...project,
  statusKey: statusMap[project.status] || 'unknown',
  bid_count: Number(project.bid_count || 0)
})

const filteredProjects = computed(() => {
  if (activeTab.value === 'all') {
    return projects.value
  }
  return projects.value.filter(project => project.statusKey === activeTab.value)
})

const initData = () => {
  loadProjectData()
}

onShow(() => {
  initData()
})

const loadProjectData = async () => {
  try {
    loading.value = true

    const userId = userStore.userInfo?.id
    if (!userId) {
      projects.value = []
      projectBids.value = {}
      selectedBids.value = {}
      return
    }

    const [projectsRes, bidsRes] = await Promise.all([
      projectStore.getUserProjects(userId, { page: 1, size: 100 }),
      projectStore.getPublisherBids({ user_id: userId, page: 1, size: 200 })
    ])

    const nextProjects = Array.isArray(projectsRes?.list)
      ? projectsRes.list.map(normalizeProject)
      : []
    const nextProjectBids = {}
    const nextSelectedBids = {}

    nextProjects.forEach(project => {
      nextProjectBids[project.id] = []
      if (project.selected_bid_id) {
        nextSelectedBids[project.id] = project.selected_bid_id
      }
    })

    if (Array.isArray(bidsRes?.list)) {
      bidsRes.list.forEach(bidItem => {
        const projectId = bidItem.project_id
        if (!projectId) {
          return
        }

        if (!nextProjectBids[projectId]) {
          nextProjectBids[projectId] = []
        }
        nextProjectBids[projectId].push(bidItem)

        if (bidItem.project?.selected_bid_id) {
          nextSelectedBids[projectId] = bidItem.project.selected_bid_id
        }
      })
    }

    projects.value = nextProjects.map(project => ({
      ...project,
      bid_count: nextProjectBids[project.id]?.length || project.bid_count || 0
    }))
    projectBids.value = nextProjectBids
    selectedBids.value = nextSelectedBids
  } catch (error) {
    console.error('\u52a0\u8f7d\u6211\u7684\u9879\u76ee\u5931\u8d25:', error)
    uni.showToast({
      title: '\u52a0\u8f7d\u5931\u8d25',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const switchTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
}

const handleContact = async (bidderId) => {
  if (!userStore.hasLogin) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }

  if (!bidderId) {
    uni.showToast({ title: '\u65e0\u6cd5\u8054\u7cfb\u6295\u6807\u4eba', icon: 'none' })
    return
  }

  const bidderInfo = findBidderInfo(bidderId)
  if (!bidderInfo) {
    uni.showToast({ title: '\u627e\u4e0d\u5230\u6295\u6807\u4eba\u4fe1\u606f', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '\u6b63\u5728\u521b\u5efa\u4f1a\u8bdd...' })
    const chatData = await messageStore.createChat(bidderId)
    uni.hideLoading()

    if (!chatData?.id) {
      throw new Error('\u521b\u5efa\u4f1a\u8bdd\u5931\u8d25')
    }

    uni.showToast({ title: '\u5df2\u521b\u5efa\u4f1a\u8bdd', icon: 'success' })
    uni.navigateTo({
      url: `/pages/messages/chat?id=${chatData.id}&chatId=${chatData.id}&targetUserId=${bidderId}&targetUserName=${encodeURIComponent(bidderInfo.username || '\u6295\u6807\u4eba')}`,
    })
  } catch (error) {
    uni.hideLoading()
    console.error('\u521b\u5efa\u4f1a\u8bdd\u5931\u8d25:', error)
    uni.showToast({ title: error.message || '\u64cd\u4f5c\u5931\u8d25', icon: 'none' })
  }
}

const findBidderInfo = (bidderId) => {
  for (const projectId in projectBids.value) {
    const bids = projectBids.value[projectId]
    if (!Array.isArray(bids)) {
      continue
    }
    for (const bid of bids) {
      if (bid.bidder?.id === bidderId) {
        return bid.bidder
      }
    }
  }
  return null
}

const goToProjectDetail = (projectId) => {
  if (!projectId) return
  uni.navigateTo({
    url: `/pages/projects/detail?id=${projectId}`
  })
}

const handleEditProject = (projectId) => {
  if (!projectId) {
    uni.showToast({ title: '\u65e0\u6548\u7684\u9879\u76eeID', icon: 'none' })
    return
  }

  uni.navigateTo({
    url: `/pages/projects/publish?id=${projectId}&edit=true`
  })
}

const handleSelectBid = async (bidId) => {
  const res = await uni.showModal({
    title: '\u786e\u8ba4\u9009\u62e9',
    content: '\u786e\u5b9a\u9009\u62e9\u8be5\u6295\u6807\u65b9\u6848\u5417\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u64a4\u9500\u3002'
  })

  if (!res.confirm) {
    return
  }

  try {
    uni.showLoading({ title: '\u5904\u7406\u4e2d...' })
    await projectStore.selectBid(bidId)
    uni.hideLoading()
    uni.showToast({ title: '\u9009\u62e9\u6210\u529f', icon: 'success' })
    await loadProjectData()
  } catch (error) {
    uni.hideLoading()
    console.error('\u9009\u62e9\u6295\u6807\u5931\u8d25:', error)
    uni.showToast({ title: error?.message || '\u64cd\u4f5c\u5931\u8d25', icon: 'none' })
  }
}

const isBidSelected = (projectId, bidId) => selectedBids.value[projectId] === bidId

const hasSelectedBid = (projectId) => !!selectedBids.value[projectId]

const deleteProject = async (projectId) => {
  if (!projectId) {
    uni.showToast({ title: '\u65e0\u6548\u7684\u9879\u76eeID', icon: 'none' })
    return
  }

  const res = await uni.showModal({
    title: '\u786e\u8ba4\u5220\u9664',
    content: '\u786e\u5b9a\u8981\u4ece\u6570\u636e\u5e93\u4e2d\u5220\u9664\u8fd9\u6761\u9700\u6c42\u5417\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u6062\u590d\u3002'
  })

  if (!res.confirm) {
    return
  }

  try {
    uni.showLoading({ title: '\u6b63\u5728\u5220\u9664...' })
    await projectStore.deleteProject(projectId)
    uni.hideLoading()
    uni.showToast({ title: '\u5220\u9664\u6210\u529f', icon: 'success' })
    await loadProjectData()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '\u5220\u9664\u5931\u8d25', icon: 'none' })
    console.error('\u5220\u9664\u9879\u76ee\u5931\u8d25:', error)
  }
}

const goBack = () => {
  uni.navigateBack()
}

const parseAttachments = (attachmentsStr) => {
  if (!attachmentsStr) return []
  return attachmentsStr.split(',').map(url => url.trim()).filter(url => url)
}

const isImageUrl = (url) => {
  const imgExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
  const lowerUrl = url.toLowerCase()
  return imgExts.some(ext => lowerUrl.endsWith(ext))
}

const isVideoUrl = (url) => {
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm']
  const lowerUrl = url.toLowerCase()
  return videoExts.some(ext => lowerUrl.endsWith(ext))
}

const previewImage = (url) => {
  uni.previewImage({
    urls: [url]
  })
}
</script>

<style scoped>
/* pages/user/projects.vue 样式 (毛玻璃科技风) */

.user-projects-page {
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

.glass-effect-subtle {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15rpx);
  border-radius: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
/* --- 通用毛玻璃效果类结束 --- */


/* --- 顶部选项卡样式 --- */
.tab-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 15rpx 10rpx;
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
}

.tab-item.active {
  color: #ffffff;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 18rpx;
}

/* 如果需要底部指示器，可以取消注释下面的代码 */
/*
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background: #ffffff;
  border-radius: 3rpx;
}
*/
/* --- 顶部选项卡样式结束 --- */


/* --- 项目列表和卡片样式 --- */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx; /* 项目项之间的间距 */
}

.project-item {
  display: flex;
  flex-direction: column;
  gap: 20rpx; /* 项目卡片和投标区域之间的间距 */
}

.card-glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  padding: 30rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8rpx 32rpx 0 rgba(0, 0, 0, 0.1);
}

.project-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.project-action-btn {
  flex: 1;
  height: 68rpx;
  border-radius: 34rpx;
  border: none;
  color: #fff;
  font-size: 24rpx;
}

.detail-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.edit-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.cancel-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.project-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
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
/* --- 项目列表和卡片样式结束 --- */


/* --- 投标情况区域样式 --- */
.bid-status-section {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24rpx;
  padding: 20rpx;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.bid-status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
  margin-bottom: 20rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.bid-status-title {
  font-size: 32rpx;
  font-weight: bold;
}

.bid-status-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.bids-container {
  padding: 10rpx 0;
}

.bids-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.bid-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.bid-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.bidder-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  align-self: flex-start; /* 头像靠左 */
}

.bidder-name {
  font-size: 28rpx;
  font-weight: 500;
}

.bid-price {
  font-size: 30rpx;
  font-weight: bold;
  color: #FFD700;
}

.bid-delivery, .bid-description {
  font-size: 26rpx;
  opacity: 0.9;
  line-height: 1.5;
}

/* .bid-time {
  font-size: 24rpx;
  opacity: 0.7;
} */

.bid-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

.action-btn {
  flex: 1;
  margin: 0 10rpx;
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

.contact-bidder-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.select-bid-btn {
  background: linear-gradient(135deg, #27ae60, #219653);
}

.action-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.empty-bids {
  text-align: center;
  padding: 40rpx 0;
  opacity: 0.7;
  font-size: 28rpx;
}
/* --- 投标情况区域样式结束 --- */


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
  filter: brightness(0) invert(1); /* 使图片变为白色 */
}

.empty-text {
  font-size: 32rpx;
  margin-bottom: 20rpx;
}

.empty-subtext {
  font-size: 28rpx;
  opacity: 0.7;
}
/* --- 状态提示样式结束 --- */

/* 🎯 新增：已选中投标的指示器 */
.selected-bid-indicator {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12rpx;
  padding: 15rpx;
  margin-top: 15rpx;
  text-align: center;
}

.selected-text {
  color: #FFD700;
  font-weight: bold;
  font-size: 26rpx;
}

/* 🎯 新增：禁用按钮样式 */
.btn-disabled {
  opacity: 0.6 !important;
  background: rgba(128, 128, 128, 0.5) !important;
  cursor: not-allowed !important;
}

.btn-disabled:active {
  transform: none !important;
  opacity: 0.6 !important;
}


/* --- 投标附件样式 --- */
.bid-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-top: 15rpx;
}

.attachment-item {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
}

.attachment-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
