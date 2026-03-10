/**
 * 项目相关API
 */
import { get, post, put, upload } from '../utils/request.js'

/**
 * 发布项目
 * @param {Object} projectData - 项目数据
 * @returns {Promise} - 返回Promise对象
 */
export function publishProject(projectData) {
  return post('/projects', projectData)
}

/**
 * 更新项目
 * @param {string|number} projectId - 项目ID
 * @param {Object} projectData - 项目数据
 * @returns {Promise}
 */
export function updateProject(projectId, projectData) {
  return put(`/projects/${projectId}`, projectData)
}

/**
 * 获取项目详情
 * @param {string|number} projectId - 项目ID
 * @returns {Promise}
 */
export function getProjectDetail(projectId) {
  return get(`/projects/${projectId}`)
}

/**
 * 获取指定用户发布的项目列表
 * @param {string|number} userId - 用户ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getUserProjects(userId, params = {}) {
  return get(`/projects/user/${userId}`, params)
}

/**
 * 上传项目附件
 * @param {String} filePath - 文件路径
 * @returns {Promise} - 返回Promise对象
 */
export function uploadProjectAttachment(filePath) {
  return upload('/api/attachments/upload', {
    name: 'file',
    filePath: filePath
  })
}

/**
 * 获取项目列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回Promise对象
 */
export function getProjectList(params) {
  return post('/api/projects/list', params)
}

/**
 * 获取项目详情
 * @param {String} id - 项目ID
 * @returns {Promise} - 返回Promise对象
 */
export function getProjectDetailLegacy(id) {
  return post('/api/projects/detail', { id })
}

/**
 * 更新项目状态
 * @param {String} id - 项目ID
 * @param {String} status - 项目状态
 * @returns {Promise} - 返回Promise对象
 */
export function updateProjectStatus(id, status) {
  return post('/api/projects/update-status', { id, status })
}
