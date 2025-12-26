/**
 * 验证手机号
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
export function validatePhone(phone) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证邮箱
 * @param {string} email 邮箱
 * @returns {boolean} 是否有效
 */
export function validateEmail(email) {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

/**
 * 验证密码强度
 * @param {string} password 密码
 * @returns {number} 强度等级 0-3
 */
export function validatePasswordStrength(password) {
  if (!password || password.length < 6) {
    return 0
  }
  
  let strength = 0
  
  // 长度大于8
  if (password.length >= 8) {
    strength += 1
  }
  
  // 包含数字和字母
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) {
    strength += 1
  }
  
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) {
    strength += 1
  }
  
  return strength
}

/**
 * 验证用户名
 * @param {string} username 用户名
 * @returns {boolean} 是否有效
 */
export function validateUsername(username) {
  const reg = /^[a-zA-Z0-9_]{4,20}$/
  return reg.test(username)
}

/**
 * 验证URL
 * @param {string} url URL
 * @returns {boolean} 是否有效
 */
export function validateUrl(url) {
  const reg = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/
  return reg.test(url)
}

/**
 * 验证身份证号
 * @param {string} idCard 身份证号
 * @returns {boolean} 是否有效
 */
export function validateIdCard(idCard) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

/**
 * 验证金额
 * @param {string|number} amount 金额
 * @returns {boolean} 是否有效
 */
export function validateAmount(amount) {
  const reg = /^(([1-9]\d*)|\d)(\.\d{1,2})?$/
  return reg.test(amount.toString())
}

/**
 * 验证中文姓名
 * @param {string} name 姓名
 * @returns {boolean} 是否有效
 */
export function validateChineseName(name) {
  const reg = /^[\u4e00-\u9fa5]{2,}$/
  return reg.test(name)
}

/**
 * 验证银行卡号
 * @param {string} cardNo 银行卡号
 * @returns {boolean} 是否有效
 */
export function validateBankCard(cardNo) {
  const reg = /^\d{16,19}$/
  return reg.test(cardNo)
}