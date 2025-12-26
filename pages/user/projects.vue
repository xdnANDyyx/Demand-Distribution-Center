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
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '../../store/project.js'
import { useUserStore } from '../../store/user.js'
import { useMessageStore } from '../../store/message.js'

const messageStore = useMessageStore()

const projectStore = useProjectStore()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const activeTab = ref('all')
const projects = ref([])
const projectBids = ref({}) // 项目ID -> 投标列表的映射
const selectedBids = ref({}) // 记录已选中的投标 {projectId: bidId}

// 选项卡
const tabs = [
  { label: '全部', value: 'all' },
  { label: '招标中', value: 'bidding' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' }
]

// 过滤项目
const filteredProjects = computed(() => {
  if (activeTab.value === 'all') {
    return projects.value
  }
  return projects.value.filter(project => project.status === activeTab.value)
})

// 初始化函数
const initData = () => {
  loadProjectBids(true)
}

// 在 onMounted 中调用初始化函数
onMounted(() => {
  console.log("这里是最先执行的")
  initData()
})

// 加载项目投标 (修改版)
const loadProjectBids = async (refresh = false) => {
  try {
    loading.value = true;

    const bidsRes = await projectStore.getPublisherBids({ user_id: userStore.userInfo?.id });
    console.log("获取的当前用户项目投标列表", bidsRes);

    const tempProjectsMap = {};
    const tempBidsMap = {};
    const tempSelectedBids = {};

    if (bidsRes && bidsRes.list && Array.isArray(bidsRes.list)) {
      bidsRes.list.forEach(bidItem => {
        const projectId = bidItem.project_id;
        const project = bidItem.project;

        if (project && project.id && !tempProjectsMap[project.id]) {
          tempProjectsMap[project.id] = project;
        }

        if (!tempBidsMap[projectId]) {
          tempBidsMap[projectId] = [];
        }
        tempBidsMap[projectId].push(bidItem);
        
        // 记录已选中的投标
        if (project && project.selected_bid_id) {
          tempSelectedBids[projectId] = project.selected_bid_id;
        }
      });
    }

    const uniqueProjectsArray = Object.values(tempProjectsMap);
    projects.value = uniqueProjectsArray;
    projectBids.value = tempBidsMap;
    selectedBids.value = tempSelectedBids; // 更新已选中投标记录

    console.log('已处理并加载项目和投标列表:', projects.value.length, Object.keys(projectBids.value).length);
	console.log('返回的投标信息有哪些？',projectBids.value)

  } catch (error) {
    console.error('加载投标列表失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 切换选项卡
const switchTab = (tab) => {
  if (activeTab.value === tab) return
  
  activeTab.value = tab
  loadProjectBids(true)
}

// 联系投标人
const handleContact = async (bidderId) => {
  if (!userStore.hasLogin) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }
  
  if (!bidderId) {
    uni.showToast({ title: '无法联系投标人', icon: 'none' });
    return;
  }
  
  const bidderInfo = findBidderInfo(bidderId);
  if (!bidderInfo) {
    uni.showToast({ title: '找不到投标人信息', icon: 'none' });
    return;
  }
  
  try {
    uni.showLoading({ title: '正在创建会话...' });
    
    const chatData = await messageStore.createChat(bidderId);
    uni.hideLoading();
    
    if (chatData && chatData.id) {
      uni.showToast({ title: '已创建会话', icon: 'success' });
      
      uni.navigateTo({
        url: `/pages/messages/chat?id=${chatData.id}&chatId=${chatData.id}&targetUserId=${bidderId}&targetUserName=${encodeURIComponent(bidderInfo.username || '投标人')}`,
      });
    } else {
      throw new Error('创建会话失败');
    }
  } catch (error) {
    uni.hideLoading();
    console.error('创建会话失败:', error);
    const errorMsg = error.message || '操作失败';
    uni.showToast({ title: errorMsg, icon: 'none' });
  }
};

// 根据投标人ID查找投标人信息
const findBidderInfo = (bidderId) => {
  for (const projectId in projectBids.value) {
    const bids = projectBids.value[projectId];
    if (bids && Array.isArray(bids)) {
      for (const bid of bids) {
        if (bid.bidder && bid.bidder.id === bidderId) {
          return bid.bidder;
        }
      }
    }
  }
  return null;
};

// 跳转到项目详情
const goToProjectDetail = (projectId) => {
  if (projectId) {
    uni.navigateTo({
      url: `/pages/projects/detail?id=${projectId}`
    })
  }
}

// 🎯 修改：选择中标者
const handleSelectBid = async (bidId) => {
  console.log("投标id是空的？", bidId)
  
  const res = await uni.showModal({
    title: '确认选择',
    content: '确定选择该投标方案吗？此操作不可撤销。',
  });
  
  if (res.confirm) {
    try {
      uni.showLoading({ title: '处理中' });
      const result = await projectStore.selectBid(bidId);
      uni.hideLoading();
      uni.showToast({ title: '选择成功', icon: 'success' });
      console.log("是不是就没有结果返回过来了？",result)
      // 🎯 关键修改：更新本地状态
      if (result && result.project_id) {
        // 1. 记录已选中的投标
        selectedBids.value[result.project_id] = bidId;
        
        // 2. 更新项目状态为进行中
        const projectIndex = projects.value.findIndex(p => p.id === result.project_id);
        if (projectIndex !== -1) {
          projects.value[projectIndex].status = 'in_progress';
          projects.value[projectIndex].selected_bid_id = bidId;
        }
        
        // 3. 如果当前在"招标中"选项卡，可能需要刷新数据或切换到"进行中"
        if (activeTab.value === 'bidding') {
          // 可选：自动切换到进行中选项卡
          // activeTab.value = 'in_progress';
          // loadProjectBids(true);
        }
      }
      
      // 重新加载项目列表和投标信息（可选，如果需要完全刷新）
      // loadProjectBids(true);
      
    } catch (error) {
      uni.hideLoading();
      console.error('选择投标失败:', error);
      const errorMsg = error?.response?.data?.message || error?.message || '操作失败';
      uni.showToast({ title: errorMsg, icon: 'none' });
    }
  }
};

// 🎯 新增：检查投标是否已被选中
const isBidSelected = (projectId, bidId) => {
  return selectedBids.value[projectId] === bidId;
};

// 🎯 新增：检查项目是否有已选中的投标
const hasSelectedBid = (projectId) => {
  return !!selectedBids.value[projectId];
};

// 取消项目
const cancelProject = async (projectId) => {
  if (!projectId) {
     uni.showToast({ title: '无效的项目ID', icon: 'none' });
     return;
  }
  const res = await uni.showModal({
    title: '确认取消',
    content: '确定要取消这个项目吗？此操作不可撤销。'
  })
  
  if (res.confirm) {
    try {
      uni.showLoading({
        title: '正在取消...'
      })
      await projectStore.cancelProject(projectId)
      uni.hideLoading()
      uni.showToast({
        title: '项目已取消',
        icon: 'success'
      })
      loadProjectBids(true)
    } catch (error) {
      uni.hideLoading()
      uni.showToast({
        title: '取消失败',
        icon: 'none'
      })
      console.error('取消项目失败:', error)
    }
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

//2025.22.27新增
// 解析附件字符串为 URL 数组
const parseAttachments = (attachmentsStr) => {
  if (!attachmentsStr) return []
  return attachmentsStr.split(',').map(url => url.trim()).filter(url => url)
}

// 判断是否为图片 URL
const isImageUrl = (url) => {
  const imgExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
  const lowerUrl = url.toLowerCase()
  return imgExts.some(ext => lowerUrl.endsWith(ext))
}

// 判断是否为视频 URL
const isVideoUrl = (url) => {
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm']
  const lowerUrl = url.toLowerCase()
  return videoExts.some(ext => lowerUrl.endsWith(ext))
}

// 预览图片（支持点击放大）
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