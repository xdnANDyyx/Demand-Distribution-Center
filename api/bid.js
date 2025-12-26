import { get, post } from '../utils/request.js'

/**
 * 获取发布者的项目投标列表（当前用户发布的项目的投标）
 * @param {Object} params 查询参数
 * @param {string} params.type 投标状态，可选值：pending(待审核)、approved(已通过)、rejected(已拒绝)、selected(已中标)、published(所有状态)
 * @param {number} params.page 页码，从1开始
 * @param {number} params.size 每页数量
 * @returns {Promise} 返回投标列表数据
 */
export function getPublisherBids(params = {}) {
  return get('/publisher/bids', params)
}

/**
 * 获取用户投标列表
 * @param {Object} params 查询参数
 * @param {string} params.type 投标状态，可选值：pending(待审核)、approved(已通过)、rejected(已拒绝)、selected(已中标)、published(所有状态)
 * @param {number} params.page 页码，从1开始
 * @param {number} params.size 每页数量
 * @param {number} params.project_id 可选，项目ID，如果提供则只返回该项目的投标
 * @returns {Promise} 返回投标列表数据
 */
export function getUserBids(params = {}) {
  return get('/api/user/bids', params)
}

/**
 * 获取项目的投标列表
 * @param {string|number} projectId 项目ID
 * @param {Object} params 查询参数
 * @returns {Promise} 返回投标列表数据
 */
export function getProjectBids(projectId, params = {}) {
  return get(`/projects/${projectId}/bids`, params)
}

/**
 * 提交投标
 * @param {string|number} projectId 项目ID
 * @param {Object} bidData 投标数据
 * @param {Array} bidData.attachments 附件URL数组（可选）
 * @returns {Promise} 返回投标结果
 */
export function submitBid(projectId, bidData) {
  return post(`/projects/${projectId}/bids`, bidData)
}

/**
 * 选择投标
 * @param {string|number} bidId 投标ID
 * @param {Object} data 附加数据
 * @returns {Promise} 返回操作结果
 */
export function selectBid(bidId, data = {}) {
  return post(`/bids/${bidId}/select`, data)
}

/**
 * 取消投标
 * @param {string|number} bidId 投标ID
 * @returns {Promise} 返回操作结果
 */
export function cancelBid(bidId) {
  return post(`/bids/${bidId}/cancel`)
}

/**
 * 更新投标
 * @param {string|number} bidId 投标ID
 * @param {Object} bidData 投标数据
 * @returns {Promise} 返回操作结果
 */
export function updateBid(bidId, bidData) {
  return post(`/bids/${bidId}/update`, bidData)
}