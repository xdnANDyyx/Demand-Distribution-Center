import { get, post } from '../utils/request.js'

/**
 * 获取用户订阅的类别
 * @returns {Promise} 返回用户订阅的类别ID数组
 */
export function getUserSubscriptions() {
  return get('/notifications/subscriptions')
}

/**
 * 更新用户订阅的类别
 * @param {Array} categoryIds 类别ID数组
 * @returns {Promise} 返回更新结果
 */
export function updateUserSubscriptions(categoryIds) {
  return post('/notifications/subscriptions', { categoryIds })
}

/**
 * 添加单个类别订阅
 * @param {Object} data 包含categoryId的对象
 * @returns {Promise} 返回添加结果
 */
export function addSubscription(data) {
  return post('/notifications/subscriptions/add', data)
}

/**
 * 删除单个类别订阅
 * @param {Object} data 包含categoryId的对象
 * @returns {Promise} 返回删除结果
 */
export function removeSubscription(data) {
  return post('/notifications/subscriptions/remove', data)
}

