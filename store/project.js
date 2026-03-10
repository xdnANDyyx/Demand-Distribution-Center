// src/store/project.js
import { defineStore } from 'pinia'
import { get, post, put, del } from '../utils/request.js'
import { useUserStore } from './user.js'
import { getUserProjects as fetchUserProjects } from '../api/project.js'
// --- 新增：静态导入所有需要的 API 函数 ---
// 假设您的 api/bid.js 文件导出了这些函数
import { getProjectBids, getUserBids, getPublisherBids, submitBid, selectBid } from '../api/bid.js'
// 如果 publishProject, uploadProjectAttachment 也在 api/project.js 中定义，也应静态导入
// import { publishProject, uploadProjectAttachment } from '../api/project.js'
// --- 新增结束 ---
// 注意：如果 uploadProjectAttachment 只在 publish.vue 页面中使用，
// 并且是通过 utils/request.js 调用的，那么它可能不需要在这里导入。
// 请根据实际情况调整。

export const useProjectStore = defineStore('project', {
  state: () => ({
    projectList: [],
    currentProject: null,
    totalCount: 0,
    loading: false
  }),
  
  actions: {
    // 获取项目列表
    async getProjectList(params = {}) {
      try {
        this.loading = true
        const res = await get('/projects', params)
        this.setProjectList(res.list || [])
        this.setTotalCount(res.total || 0)
        return res
      } catch (error) {
        console.error('获取项目列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取项目详情
    async getProjectDetail(id) {
      try {
        const project = await get(`/projects/${id}`)
        this.setCurrentProject(project)
        return project
      } catch (error) {
        console.error('获取项目详情失败:', error)
        throw error
      }
    },
    
    // 获取项目投标列表
    async getBidList(projectId) {
      try {
        // --- 修改：直接调用静态导入的函数 ---
        // const { getProjectBids } = await import('../api/bid.js') // 移除这行
        const res = await getProjectBids(projectId) // 直接调用
        console.log("获取项目投标列表:", res)
        return res
      } catch (error) {
        console.error('获取投标列表失败:', error)
        throw error
      }
    },
    
    // 获取用户投标列表
    async getUserBids(params = {}) {
      try {
        // --- 修改：直接调用静态导入的函数 ---
        // const { getUserBids } = await import('../api/bid.js') // 移除这行
        
        // 确保用户ID参数存在
        const userStore = useUserStore()
        if (!params.user_id && userStore?.userInfo?.id) {
          params.user_id = userStore.userInfo.id
        }
        
        const res = await getUserBids(params) // 直接调用
        console.log("获取用户投标列表:", res)
        return res
      } catch (error) {
        console.error('获取用户投标列表失败:', error)
        throw error
      }
    },
    
    // 获取发布者的项目投标列表
    async getPublisherBids(params = {}) {
      try {
        // --- 修改：直接调用静态导入的函数 ---
        // const { getPublisherBids } = await import('../api/bid.js') // 移除这行
        const res = await getPublisherBids(params) // 直接调用
        console.log("获取发布者投标列表:", res)
        return res
      } catch (error) {
        console.error('获取发布者投标列表失败:', error)
        throw error
      }
    },
    
    // 发布项目
    async publishProject(projectData) {
      try {
        const project = await post('/projects/', projectData)
        return project
      } catch (error) {
        console.error('发布项目失败:', error)
        throw error
      }
    },

    async getUserProjects(userId, params = {}) {
      try {
        const res = await fetchUserProjects(userId, params)
        return res
      } catch (error) {
        console.error('获取用户发布项目列表失败:', error)
        throw error
      }
    },

    async updateProject(projectId, projectData) {
      try {
        await put(`/projects/${projectId}`, projectData)
        return { success: true }
      } catch (error) {
        console.error('更新项目失败:', error)
        throw error
      }
    },
    
    // 提交投标
    async submitBid(projectId, bidData) {
      try {
        // --- 修改：直接调用静态导入的函数 ---
        // const { submitBid } = await import('../api/bid.js') // 移除这行
        const bid = await submitBid(projectId, bidData) // 直接调用
        return bid
      } catch (error) {
        console.error('提交投标失败:', error)
        throw error
      }
    },
    
    // 选择投标 projectId, , { project_id: projectId }
    async selectBid( bidId) {
      try {
        // --- 修改：直接调用静态导入的函数 ---
       
        const result = await selectBid(bidId ) // 直接调用
        return { success: true }
      } catch (error) {
        console.error('选择投标失败:', error)
        throw error
      }
    },
    
    // 取消项目
    async cancelProject(projectId) {
      try {
        const result = await post(`/projects/${projectId}/cancel`, {})
        return { success: true }
      } catch (error) {
        console.error('取消项目失败:', error)
        throw error
      }
    },

    async deleteProject(projectId) {
      try {
        await del(`/projects/${projectId}`, {})
        return { success: true }
      } catch (error) {
        console.error('删除项目失败:', error)
        throw error
      }
    },
    
    // 完成项目
    async completeProject(projectId) {
      try {
        const result = await post(`/projects/${projectId}/complete`, {})
        return { success: true }
      } catch (error) {
        console.error('完成项目失败:', error)
        throw error
      }
    },
    
    // 设置项目列表
    setProjectList(list) {
      this.projectList = list
    },
    
    // 设置当前项目
    setCurrentProject(project) {
      this.currentProject = project
    },
    
    // 设置总数
    setTotalCount(count) {
      this.totalCount = count
    }
  }
})
