import { defineStore } from 'pinia'
import { get, post, put } from '../utils/request.js'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orderList: [],
    currentOrder: null,
    totalCount: 0,
    loading: false
  }),
  
  actions: {
    // 获取订单列表
    async getOrderList(params = {}) {
      try {
        this.loading = true
        
        // 调用实际API获取订单列表
        const res = await get('/orders', params)
        
        // 更新状态
        this.setOrderList(res.list || [])
        this.setTotalCount(res.total || 0)
        
        return res
      } catch (error) {
        console.error('获取订单列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取订单详情
    async getOrderDetail(id) {
      try {
        // 调用实际API获取订单详情
        const order = await get(`/orders/${id}`)
        
        this.setCurrentOrder(order)
        return order
      } catch (error) {
        console.error('获取订单详情失败:', error)
        throw error
      }
    },
    
    // 创建订单
    async createOrder(orderData) {
		console.log("创建订单传入的什么？",orderData)
		console.log("订单数据详细检查:", {
			project_id: orderData.project_id,
			bid_id: orderData.bid_id,
			publisher_id: orderData.publisher_id,
			bidder_id: orderData.bidder_id,
			amount: orderData.amount,
			"所有字段": Object.keys(orderData)
		})
      try {
        // 调用实际API创建订单
        const order = await post('/orders', orderData)
        return order
      } catch (error) {
        console.error('创建订单失败:', error)
        throw error
      }
    },
    
    // 支付订单
    async payOrder(orderId) {
      try {
        // 调用实际API支付订单
        const result = await post(`/orders/${orderId}/pay`)
        return result
      } catch (error) {
        console.error('支付订单失败:', error)
        throw error
      }
    },
    
    // 确认完成订单
    async completeOrder(orderId) {
      try {
        // 调用实际API确认完成订单
        const result = await post(`/orders/${orderId}/complete`)
        return result
      } catch (error) {
        console.error('确认完成订单失败:', error)
        throw error
      }
    },
    
    // 取消订单
    async cancelOrder(orderId) {
      try {
        // 调用实际API取消订单
        const result = await post(`/orders/${orderId}/cancel`)
        return result
      } catch (error) {
        console.error('取消订单失败:', error)
        throw error
      }
    },
    
    // 添加订单留言
    async addOrderMessage(orderId, message) {
      try {
        // 调用实际API添加订单留言
        const newMessage = await post(`/orders/${orderId}/messages`, { content: message })
        return newMessage
      } catch (error) {
        console.error('添加订单留言失败:', error)
        throw error
      }
    },
    
    // 更新里程碑状态
    async updateMilestone(orderId, milestoneId, status) {
      try {
        // 调用实际API更新里程碑状态
        const result = await put(`/orders/${orderId}/milestones/${milestoneId}`, { status })
        return result
      } catch (error) {
        console.error('更新里程碑状态失败:', error)
        throw error
      }
    },
    
    // 设置订单列表
    setOrderList(list) {
      this.orderList = list
    },
    
    // 设置当前订单
    setCurrentOrder(order) {
      this.currentOrder = order
    },
    
    // 设置总数
    setTotalCount(count) {
      this.totalCount = count
    }
  }
})
