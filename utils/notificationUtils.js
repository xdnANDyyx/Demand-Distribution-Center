// 通知工具函数，处理安卓端震动和提示音

const SOUND_FILES = {
  DEFAULT: '_www/static/sounds/notification.mp3',
  IMPORTANT: '_www/static/sounds/notification.mp3'
}

let lastNotificationAt = 0
let currentAudioContext = null
let currentPlusPlayer = null
const NOTIFICATION_COOLDOWN = 1500

const isAndroidApp = () => {
  try {
    return uni.getSystemInfoSync().platform === 'android'
  } catch (error) {
    console.error('读取系统信息失败:', error)
    return false
  }
}

const stopCurrentSound = () => {
  if (currentAudioContext) {
    currentAudioContext.stop()
    currentAudioContext.destroy()
    currentAudioContext = null
  }

  if (currentPlusPlayer) {
    try {
      currentPlusPlayer.stop()
    } catch (error) {
      console.error('停止提示音失败:', error)
    }
    currentPlusPlayer = null
  }
}

export function triggerShortVibration() {
  try {
    if (!isAndroidApp()) {
      return false
    }

    // #ifdef APP-PLUS
    if (typeof plus !== 'undefined' && plus.device && typeof plus.device.vibrate === 'function') {
      plus.device.vibrate(80)
      return true
    }
    // #endif

    uni.vibrateShort({
      fail: (error) => {
        console.error('短震动触发失败:', error)
      }
    })
    return true
  } catch (error) {
    console.error('触发短震动失败:', error)
    return false
  }
}

export function triggerLongVibration() {
  try {
    if (!isAndroidApp()) {
      return false
    }

    // #ifdef APP-PLUS
    if (typeof plus !== 'undefined' && plus.device && typeof plus.device.vibrate === 'function') {
      plus.device.vibrate(200)
      return true
    }
    // #endif

    uni.vibrateLong({
      fail: (error) => {
        console.error('长震动触发失败:', error)
      }
    })
    return true
  } catch (error) {
    console.error('触发长震动失败:', error)
    return false
  }
}

export function triggerVibrationByType(messageType) {
  switch (messageType) {
    case 'bid_accepted':
    case 'bid_won':
      return triggerLongVibration()
    case 'new_message':
    case 'new_bid':
    case 'project_update':
    default:
      return triggerShortVibration()
  }
}

export function playNotificationSound(soundType = 'DEFAULT') {
  try {
    if (!isAndroidApp()) {
      return false
    }

    const soundSrc = SOUND_FILES[soundType] || SOUND_FILES.DEFAULT
    stopCurrentSound()

    // #ifdef APP-PLUS
    if (typeof plus !== 'undefined' && plus.audio && typeof plus.audio.createPlayer === 'function') {
      currentPlusPlayer = plus.audio.createPlayer(soundSrc)
      currentPlusPlayer.play(
        () => {
          currentPlusPlayer = null
        },
        (error) => {
          console.error('播放通知提示音失败:', error)
          currentPlusPlayer = null
        }
      )
      return true
    }
    // #endif

    currentAudioContext = uni.createInnerAudioContext()
    currentAudioContext.src = '/static/sounds/notification.mp3'
    currentAudioContext.onEnded(() => {
      stopCurrentSound()
    })
    currentAudioContext.onError((error) => {
      console.error('播放通知提示音失败:', error)
      stopCurrentSound()
    })
    currentAudioContext.play()
    return true
  } catch (error) {
    console.error('播放通知提示音失败:', error)
    stopCurrentSound()
    return false
  }
}

export function playSoundByType(messageType) {
  switch (messageType) {
    case 'bid_accepted':
    case 'bid_won':
      return playNotificationSound('IMPORTANT')
    case 'new_message':
    case 'new_bid':
    case 'project_update':
    default:
      return playNotificationSound('DEFAULT')
  }
}

export function triggerNotification(messageType) {
  const now = Date.now()
  if (now - lastNotificationAt < NOTIFICATION_COOLDOWN) {
    return
  }

  lastNotificationAt = now
  triggerVibrationByType(messageType)
  playSoundByType(messageType)
}
