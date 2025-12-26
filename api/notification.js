import { get, post } from '../utils/request.js'

/**
 * 获取未读通知数量
 * @returns {Promise} 返回未读通知数量
 */
export function getUnreadNotificationCount() {
  return get('/user/notifications/unread-count')
}

/**
 * 获取通知列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.size 每页数量
 * @param {string} params.type 通知类型，可选值：all(所有)、system(系统)、project(项目)、bid(投标)、order(订单)、subscription(订阅)
 * @returns {Promise} 返回通知列表
 */
export function getNotifications(params = {}) {
  return get('/user/notifications', params)
}

/**
 * 标记通知为已读
 * @param {Array} notificationIds 通知ID数组
 * @returns {Promise} 返回操作结果
 */
export function markNotificationsAsRead(notificationIds) {
  return post('/user/notifications/read', { notification_ids: notificationIds })
}

/**
 * 标记所有通知为已读
 * @returns {Promise} 返回操作结果
 */
export function markAllNotificationsAsRead() {
  return post('/user/notifications/read-all')
}

/**
 * 获取订阅通知列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.size 每页数量
 * @param {number} params.category_id 分类ID（可选）
 * @returns {Promise} 返回订阅通知列表
 */
export function getSubscriptionNotifications(params = {}) {
  return get('notifications/subscriptions', params)
}  