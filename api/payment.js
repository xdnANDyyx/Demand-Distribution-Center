/**
 * 鏀粯鐩稿叧API
 */

import { request } from '../utils/request.js'

/**
 * 寰俊鏀粯缁熶竴涓嬪崟
 * @param {Object} data 鏀粯鏁版嵁
 * @returns {Promise}
 */
export function wechatPay(data) {
	return request({
		url: '/payments/wechat',
		method: 'POST',
		data: data
	})
}

/**
 * 鍒涘缓鏀粯璁板綍
 * @param {Object} data 鏀粯璁板綍鏁版嵁
 * @returns {Promise}
 */
export function createPayment(data) {
	return request({
		url: '/payments',
		method: 'POST',
		data: data
	})
}

/**
 * 鑾峰彇鏀粯璁板綍璇︽儏
 * @param {Number} id 鏀粯璁板綍ID
 * @returns {Promise}
 */
export function getPaymentDetail(id) {
	return request({
		url: '/payments/' + id,
		method: 'GET'
	})
}

/**
 * 鑾峰彇璁㈠崟鐨勬敮浠樿褰?
 * @param {Number} orderId 璁㈠崟ID
 * @returns {Promise}
 */
export function getOrderPayment(orderId) {
	return request({
		url: '/payments/order/' + orderId,
		method: 'GET'
	})
}

/**
 * 澶勭悊鏀粯
 * @param {Object} data 鏀粯澶勭悊鏁版嵁
 * @returns {Promise}
 */
export function processPayment(data) {
	return request({
		url: '/payments/process',
		method: 'POST',
		data: data
	})
}

/**
 * 鐢宠閫€娆?
 * @param {Number} id 鏀粯璁板綍ID
 * @returns {Promise}
 */
export function refundPayment(id) {
	return request({
		url: '/payments/' + id + '/refund',
		method: 'POST'
	})
}

export default {
	wechatPay,
	createPayment,
	getPaymentDetail,
	getOrderPayment,
	processPayment,
	refundPayment
}
