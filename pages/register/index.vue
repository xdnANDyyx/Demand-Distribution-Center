 <template>
	<view class="register-container">
		<!-- 头部品牌 -->
		<view class="header">
			<text class="brand-name">直求</text>
			<text class="brand-slogan">一站式招投标服务平台</text>
		</view>
		
		<!-- 注册表单 -->
		<view class="register-form-container">
			<view class="glass-effect">
				<text class="welcome-text">创建账号</text>
				
				
				<view class="form-item">
					<text class="form-label">用户名</text>
					<view class="input-container">
						<image class="input-icon" src="/static/icons/user.png"></image>
						<input class="form-input" type="text" v-model="registerForm.username" @blur="validateUsername" placeholder="请输入用户名(至少6个字符)"/>
					</view>
					<text v-if="usernameError" class="error-text">{{ usernameError }}</text>
				</view>
				
				<view class="form-item">
					<text class="form-label">手机号</text>
					<view class="input-container">
						<image class="input-icon" src="/static/icons/phone.png"></image>
						<input class="form-input" type="number" v-model="registerForm.phone" @blur="validatePhoneNumber" placeholder="请输入手机号"/>
					</view>
					<text v-if="phoneError" class="error-text">{{ phoneError }}</text>
				</view>
				
				<!-- <view class="form-item">
					<text class="form-label">验证码</text>
					<view class="input-container">
						<image class="input-icon" src="/static/icons/shield.png"></image>
						<input class="form-input" type="number" v-model="registerForm.code" @blur="validateCode" placeholder="请输入验证码"/>
						<button 
							class="code-btn"
							:class="{ disabled: !canSendCode || codeCountdown > 0 }"
							:disabled="!canSendCode || codeCountdown > 0"
							@tap="sendCode"
						>
							<text v-if="codeCountdown > 0">{{ codeCountdown }}s</text>
							<text v-else>获取验证码</text>
						</button>
					</view>
					<text v-if="codeError" class="error-text">{{ codeError }}</text>
				</view> -->
				
				<view class="form-item">
					<text class="form-label">设置密码</text>
					<view class="input-container">
						<image class="input-icon" src="/static/icons/lock.png"></image>
						<input class="form-input" :type="showPassword ? 'text' : 'password'" v-model="registerForm.password" @blur="validatePassword" placeholder="请设置密码"/>
						<view class="password-toggle" @tap="togglePassword">
							<image class="toggle-icon" :src="showPassword ? '/static/icons/eye-open.png' : '/static/icons/eye-closed.png'"></image>
						</view>
					</view>
					<text v-if="passwordError" class="error-text">{{ passwordError }}</text>
				</view>
				
				<view class="form-item">
					<text class="form-label">确认密码</text>
					<view class="input-container">
						<image class="input-icon" src="/static/icons/lock.png"></image>
						<input class="form-input" :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" @blur="validateConfirmPassword" placeholder="请再次输入密码"/>
						<view class="password-toggle" @tap="toggleConfirmPassword">
							<image class="toggle-icon" :src="showConfirmPassword ? '/static/icons/eye-open.png' : '/static/icons/eye-closed.png'"></image>
						</view>
					</view>
					<text v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</text>
				</view>
				
				<!-- 用户协议 -->
				<view class="agreement-section">
					<view class="agreement-wrapper" @tap="toggleAgreeTerms">
						<view class="custom-checkbox" :class="{ checked: agreeTerms }">
							<text v-if="agreeTerms" class="checkbox-icon">✓</text>
						</view>
						<text class="agreement-text">
							我已阅读并同意
							<text class="agreement-link" @tap="showUserAgreement">《用户协议》</text>
							和
							<text class="agreement-link" @tap="showPrivacyPolicy">《隐私政策》</text>
						</text>
					</view>
				</view>
				
				<button 
					class="register-btn"
					:class="{ disabled: !canRegister }"
					:disabled="!canRegister || loading"
					@tap="handleRegister"
				>
					<text v-if="loading">注册中...</text>
					<text v-else>注册</text>
				</button>
				
				<view class="login-link">
					<text>已有账号? </text>
					<text class="link-text" @tap="goToLogin">立即登录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '../../store/user.js'
import { validatePhone } from '../../utils/validate.js'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeTerms = ref(false)
const confirmPassword = ref('')
const codeCountdown = ref(0)
let countdownTimer = null

// 表单验证错误信息
const usernameError = ref('')
const phoneError = ref('')
const codeError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// 注册表单
const registerForm = ref({
  username: '',
  password: '',
  phone: '',
  code: '000000'
})

// 计算属性
const canSendCode = computed(() => {
  return validatePhone(registerForm.value.phone)
})

const canRegister = computed(() => {
  // 基本验证
  const isUsernameValid = registerForm.value.username.trim().length >= 3; // 用户名至少3个字符
  const isPhoneValid = validatePhone(registerForm.value.phone);
 // const isCodeValid = registerForm.value.code.length === 6;
  const isPasswordValid = registerForm.value.password.length >= 6;
  const isConfirmPasswordValid = confirmPassword.value === registerForm.value.password;
  const isAgreeTerms = agreeTerms.value;
  
  return isUsernameValid &&
         isPhoneValid && 
         // isCodeValid && 
         isPasswordValid && 
         isConfirmPasswordValid && 
         isAgreeTerms;
})

// 表单验证函数
const validateUsername = () => {
  const username = registerForm.value.username.trim()
  if (!username) {
    usernameError.value = '请输入用户名'
  } else if (username.length < 3) {
    usernameError.value = '用户名至少需要3个字符'
  } else if (username.length > 20) {
    usernameError.value = '用户名不能超过20个字符'
  } else {
    usernameError.value = ''
  }
}

const validatePhoneNumber = () => {
  const phone = registerForm.value.phone.trim()
  if (!phone) {
    phoneError.value = '请输入手机号'
  } else if (!validatePhone(phone)) {
    phoneError.value = '请输入正确的手机号'
  } else {
    phoneError.value = ''
  }
}

// const validateCode = () => {
//   const code = registerForm.value.code.trim()
//   if (!code) {
//     codeError.value = '请输入验证码'
//   } else if (code.length !== 6) {
//     codeError.value = '验证码为6位数字'
//   } else {
//     codeError.value = ''
//   }
// }

const validatePassword = () => {
  const password = registerForm.value.password
  if (!password) {
    passwordError.value = '请输入密码'
  } else if (password.length < 6) {
    passwordError.value = '密码至少需要6个字符'
  } else if (password.length > 20) {
    passwordError.value = '密码不能超过20个字符'
  } else {
    passwordError.value = ''
  }
  // 如果确认密码已填写，重新验证确认密码
  if (confirmPassword.value) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = '请确认密码'
  } else if (confirmPassword.value !== registerForm.value.password) {
    confirmPasswordError.value = '两次输入的密码不一致'
  } else {
    confirmPasswordError.value = ''
  }
}

// 方法
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const toggleAgreeTerms = (e) => {
  // 如果是checkbox-group的change事件，e.detail.value是一个数组
  if (e && e.detail && Array.isArray(e.detail.value)) {
    agreeTerms.value = e.detail.value.includes('agree');
  } else {
    // 如果是点击文本的tap事件，直接切换状态
    agreeTerms.value = !agreeTerms.value;
  }
  
  console.log('协议同意状态:', agreeTerms.value)
}

// const sendCode = async () => {
//   if (!canSendCode.value || codeCountdown.value > 0) return
  
//   try {
//     await userStore.sendSmsCode(registerForm.value.phone)
    
//     // 开始倒计时
//     codeCountdown.value = 60
//     countdownTimer = setInterval(() => {
//       codeCountdown.value--
//       if (codeCountdown.value <= 0) {
//         clearInterval(countdownTimer)
//       }
//     }, 1000)
    
//     uni.showToast({
//       title: '验证码已发送',
//       icon: 'success'
//     })
//   } catch (error) {
//     uni.showToast({
//       title: error.message || '发送验证码失败',
//       icon: 'none'
//     })
//   }
// }

const handleRegister = async () => {
  if (!canRegister.value || loading.value) {
    // 显示具体的错误原因
    if (!registerForm.value.username.trim()) {
      uni.showToast({
        title: '请输入用户名',
        icon: 'none'
      })
    } else if (registerForm.value.username.trim().length < 3) {
      uni.showToast({
        title: '用户名至少需要3个字符',
        icon: 'none'
      })
    } else if (!validatePhone(registerForm.value.phone)) {
      uni.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
    // } else if (registerForm.value.code.length !== 6) {
    //   uni.showToast({
    //     title: '请输入6位验证码',
    //     icon: 'none'
    //   })
    } else if (registerForm.value.password.length < 6) {
      uni.showToast({
        title: '密码至少6个字符',
        icon: 'none'
      })
    } else if (confirmPassword.value !== registerForm.value.password) {
      uni.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      })
    } else if (!agreeTerms.value) {
      uni.showToast({
        title: '请同意用户协议和隐私政策',
        icon: 'none'
      })
    }
    return
  }
  
  try {
    loading.value = true
    
    // 构建注册数据
    const registerData = {
      username: registerForm.value.username,
      password: registerForm.value.password,
      phone: registerForm.value.phone,
      code: registerForm.value.code
    }
    
    // 调用注册API
    const result = await userStore.register(registerData)
    
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    })
    
    // 注册成功，跳转到登录页
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/index'
      })
    }, 1500)
  } catch (error) {
    uni.showToast({
      title: error.message || '注册失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/index'
  })
}

const showUserAgreement = () => {
  uni.navigateTo({ url: '/pages/common/user-agreement' })
}

const showPrivacyPolicy = () => {
  uni.navigateTo({ url: '/pages/common/privacy-policy' })
}
</script>

<style>
.register-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
	position: relative;
	overflow: hidden;
}

/* 背景装饰元素 */
.register-container::before {
	content: '';
	position: absolute;
	top: -50%;
	right: -50%;
	width: 100%;
	height: 100%;
	background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
	z-index: 0;
}

.register-container::after {
	content: '';
	position: absolute;
	bottom: -50%;
	left: -50%;
	width: 100%;
	height: 100%;
	background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
	z-index: 0;
}

@keyframes gradient {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}

.header {
	padding: 80rpx 40rpx 30rpx;
	position: relative;
	z-index: 1;
}

.brand-name {
	font-size: 72rpx;
	font-weight: bold;
	color: #ffffff;
	text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	letter-spacing: 2px;
	background: linear-gradient(to right, #ffffff, #e2e8f0);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.brand-slogan {
	font-size: 32rpx;
	color: rgba(255, 255, 255, 0.9);
	margin-top: 10rpx;
	display: block;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.register-form-container {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 0 40rpx;
	position: relative;
	z-index: 1;
	margin-bottom: 40rpx;
}

.glass-effect {
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	background-color: rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.3);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	border-radius: 32rpx;
	padding: 50rpx;
	position: relative;
	overflow: hidden;
}

.glass-effect::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 1px;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
}

.welcome-text {
	font-size: 42rpx;
	font-weight: bold;
	color: #fff;
	margin-bottom: 40rpx;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	letter-spacing: 1px;
	text-align: center;
}

.user-type-selector {
	display: flex;
	justify-content: space-between;
	margin-bottom: 40rpx;
}

.type-option {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx;
	border-radius: 16rpx;
	background: rgba(255, 255, 255, 0.1);
	margin: 0 10rpx;
	transition: all 0.3s ease;
}

.type-option.active {
	background: rgba(255, 255, 255, 0.25);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	transform: translateY(-2px);
}

.type-icon {
	width: 60rpx;
	height: 60rpx;
	margin-bottom: 10rpx;
	opacity: 0.8;
}

.type-text {
	font-size: 28rpx;
	color: #fff;
	font-weight: 500;
}

.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 15rpx;
	display: block;
	font-weight: 500;
	letter-spacing: 0.5px;
}

.input-container {
	position: relative;
	display: flex;
	align-items: center;
}

.input-icon {
	position: absolute;
	left: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 40rpx;
	height: 40rpx;
	opacity: 0.8;
	filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.form-input {
	flex: 1;
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(5px);
	-webkit-backdrop-filter: blur(5px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 16rpx;
	height: 90rpx;
	padding-left: 80rpx;
	font-size: 28rpx;
	color: #fff;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
}

.form-input::placeholder {
	color: rgba(255, 255, 255, 0.6);
}

.form-input:focus {
	border-color: rgba(255, 255, 255, 0.5);
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.password-toggle {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.toggle-icon {
	width: 40rpx;
	height: 40rpx;
	opacity: 0.8;
}

.code-btn {
	position: absolute;
	right: 10rpx;
	top: 50%;
	transform: translateY(-50%);
	background: rgba(255, 255, 255, 0.25);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	padding: 0 20rpx;
	height: 70rpx;
	line-height: 70rpx;
	font-size: 26rpx;
	font-weight: 500;
}

.code-btn.disabled {
	opacity: 0.5;
}

.agreement-section {
	margin-bottom: 40rpx;
}

.agreement-wrapper {
	display: flex;
	align-items: center;
	padding: 10rpx 0;
	cursor: pointer;
}

.custom-checkbox {
	width: 40rpx;
	height: 40rpx;
	border: 2px solid rgba(255, 255, 255, 0.6);
	border-radius: 6rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16rpx;
	transition: all 0.3s ease;
}

.custom-checkbox.checked {
	background-color: #3b82f6;
	border-color: #3b82f6;
}

.checkbox-icon {
	color: white;
	font-size: 24rpx;
	font-weight: bold;
}

.agreement-text {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.9);
	margin-left: 10rpx;
}

.agreement-link {
	color: #bfdbfe;
	font-weight: 500;
}

.register-btn {
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	color: #fff;
	height: 90rpx;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 30rpx;
	box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
	border: none;
	letter-spacing: 1px;
	position: relative;
	overflow: hidden;
	transition: all 0.3s ease;
}

.register-btn::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	transition: all 0.5s ease;
}

.register-btn:active {
	transform: translateY(2px);
	box-shadow: 0 2px 6px rgba(29, 78, 216, 0.2);
}

.register-btn:active::before {
	left: 100%;
}

.register-btn.disabled {
	opacity: 0.7;
	background: rgba(59, 130, 246, 0.7);
}

.login-link {
	text-align: center;
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.9);
}

.link-text {
	color: #bfdbfe;
	font-weight: 600;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.link-text:active {
	opacity: 0.8;
}

.error-text {
	font-size: 24rpx;
	color: #ff6b6b;
	margin-top: 8rpx;
	margin-left: 20rpx;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
