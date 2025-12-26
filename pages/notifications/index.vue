<template>
  <view class="notifications-page">
    <!-- 全部标为已读按钮 -->
    <view v-if="hasUnreadNotifications" class="mark-all-read-container">
      <view class="mark-all-read-btn" @click="markAllAsRead">
        <text>全部标为已读</text>
      </view>
    </view>
    
    <!-- 通知列表 -->
    <view class="notification-list">
      <view 
        v-for="notification in messageStore.notifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.is_read }"
        @click="readNotification(notification)"
      >
        <view class="notification-icon" :class="getNotificationClass(notification.type)">
          <text>{{ getNotificationIcon(notification.type) }}</text>
        </view>
        
        <view class="notification-content">
          <view class="notification-header">
            <text class="title">{{ notification.title }}</text>
            <text class="time">{{ formatTime(notification.created_at) }}</text>
          </view>
          <text class="content">{{ notification.content }}</text>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="!loading && messageStore.notifications.length === 0" class="empty-state">
        <image src="/static/images/empty-notification.png" class="empty-icon"></image>
        <text class="empty-text">暂无通知</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMessageStore } from '../../store/message.js'
import { useUserStore } from '../../store/user.js'
import { useProjectStore } from '../../store/project.js'
import { markAllNotificationsAsRead } from '../../api/notification.js'

const messageStore = useMessageStore()
const userStore = useUserStore()
const projectStore = useProjectStore()

// 响应式数据
const loading = ref(false)

// 计算属性：检查是否有未读通知
const hasUnreadNotifications = computed(() => {
  return messageStore.notifications.some(notification => !notification.is_read)
})

// 页面加载
onMounted(async () => {
  console.log('通知页面加载，登录状态:', userStore.hasLogin, '用户信息:', userStore.userInfo);
  console.log('当前token:', userStore.token);
  
  if (userStore.hasLogin) {
    await loadNotifications()
  } else {
    console.log('用户未登录，但不立即跳转');
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
  }
})

// 下拉刷新
onPullDownRefresh(async () => {
  await loadNotifications()
  uni.stopPullDownRefresh()
})

// 加载通知
const loadNotifications = async () => {
  try {
    loading.value = true
    console.log('开始加载通知列表，当前token:', userStore.token);
    
    // 先检查登录状态
    if (!userStore.hasLogin || !userStore.token) {
      console.log('用户未登录或token不存在，不加载通知');
      return;
    }
    
    await messageStore.getNotifications()
    console.log('通知列表加载成功:', messageStore.notifications);
  } catch (error) {
    console.error('加载通知失败:', error)
    
    // 检查是否是登录过期错误
    if (error.message && error.message.includes('登录已过期')) {
      console.log('登录已过期，尝试刷新用户信息');
      
      try {
        // 尝试刷新用户信息
        await userStore.getUserInfo();
        console.log('用户信息刷新成功，重新加载通知');
        await messageStore.getNotifications();
      } catch (refreshError) {
        console.error('刷新用户信息失败:', refreshError);
        uni.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none'
        });
        
        // 延迟跳转到登录页面
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
      }
    } else {
      uni.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  } finally {
    loading.value = false
  }
}

// 标记所有通知为已读
const markAllAsRead = async () => {
  try {
    loading.value = true
    
    // 调用API标记所有通知为已读
    await markAllNotificationsAsRead()
    
    // 重新加载通知列表
    await messageStore.getNotifications()
    
    uni.showToast({
      title: '已全部标为已读',
      icon: 'success'
    })
  } catch (error) {
    console.error('标记全部已读失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 阅读通知并处理点击事件
const readNotification = (notification) => {
  // 标记通知为已读
  messageStore.readNotification(notification.id);
  
  console.log('点击通知:', notification);
  
  // 根据通知类型和相关ID进行跳转
  // 0:系统通知, 1:项目通知, 2:投标通知, 3:订单通知
  switch (Number(notification.type)) {
    case 1: // 项目通知
      if (notification.related_id) {
        uni.navigateTo({
          url: `/pages/projects/detail?id=${notification.related_id}`
        });
      }
      break;
      
    case 2: // 投标通知
      if (notification.related_id) {
        // 如果是投标相关，根据用户角色决定跳转
        if (notification.content && notification.content.includes('您的投标')) {
          // 如果是用户自己的投标通知，跳转到项目详情
          uni.navigateTo({
            url: `/pages/projects/detail?id=${notification.related_id}`
          });
        } else {
          // 如果是项目收到投标的通知，跳转到项目详情
          uni.navigateTo({
            url: `/pages/projects/detail?id=${notification.related_id}`
          });
        }
      }
      break;
      
    case 3: // 订单通知
      if (notification.related_id) {
        uni.navigateTo({
          url: `/pages/orders/detail?id=${notification.related_id}`
        });
      }
      break;
      
    default: // 系统通知或其他
      // 系统通知通常不需要跳转，只需标记为已读
      break;
  }
}

// 获取通知图标
const getNotificationIcon = (type) => {
  // 根据API文档中的通知类型定义
  // 0:系统通知, 1:项目通知, 2:投标通知, 3:订单通知
  switch (Number(type)) {
    case 0:
      return 'info'
    case 1:
      return 'folder'
    case 2:
      return 'trophy' // 投标通知使用奖杯图标
    case 3:
      return 'list'
    default:
      return 'notification'
  }
}

// 获取通知类名
const getNotificationClass = (type) => {
  // 根据API文档中的通知类型定义
  // 0:系统通知, 1:项目通知, 2:投标通知, 3:订单通知
  switch (Number(type)) {
    case 0:
      return 'icon-system'
    case 1:
      return 'icon-project'
    case 2:
      return 'icon-bid' // 投标通知使用特殊类名
    case 3:
      return 'icon-order'
    default:
      return 'icon-default'
  }
}

// 格式化时间
const formatTime = (timeString) => {
  const now = new Date()
  const time = new Date(timeString)
  const diff = now.getTime() - time.getTime()
  
  // 今天内
  if (diff < 24 * 60 * 60 * 1000 && now.getDate() === time.getDate()) {
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 昨天
  if (diff < 48 * 60 * 60 * 1000 && now.getDate() - time.getDate() === 1) {
    return '昨天'
  }
  
  // 一周内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return `周${days[time.getDay()]}`
  }
  
  // 更早
  return `${time.getMonth() + 1}月${time.getDate()}日`
}
</script>

<style lang="css" scoped>
.notifications-page {
  background: var(--background-color);
  min-height: 100vh;
}

.mark-all-read-container {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
}

.mark-all-read-btn {
  background: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.mark-all-read-btn:active {
  opacity: 0.8;
}

.notification-list {
  .notification-item {
    display: flex;
    padding: 16px;
    background: var(--white);
    border-bottom: 1px solid var(--border-color);
    transition: all 0.3s ease;
    
    &:active {
      background: var(--background-color);
    }
    
    &.unread {
      background: rgba(45, 140, 240, 0.05);
    }
    
    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      
      &.icon-system {
        background: var(--info-color);
      }
      
      &.icon-project {
        background: var(--primary-color);
      }
      
      &.icon-bid {
        background: #FFD700; /* 金色背景，适合投标/中标通知 */
      }
      
      &.icon-order {
        background: var(--success-color);
      }
      
      &.icon-default {
        background: var(--warning-color);
      }
    }
    
    .notification-content {
      flex: 1;
      overflow: hidden;
      
      .notification-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        
        .title {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-color);
        }
        
        .time {
          font-size: 12px;
          color: var(--text-color-lighter);
        }
      }
      
      .content {
        font-size: 14px;
        color: var(--text-color-light);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.loading {
  padding: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  
  .empty-icon {
    width: 120px;
    height: 120px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 16px;
    color: var(--text-color-lighter);
  }
}
</style>
