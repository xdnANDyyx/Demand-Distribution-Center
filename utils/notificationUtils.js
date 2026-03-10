// 通知工具函数，处理震动和声音提醒

// 声音文件路径配置
const SOUND_FILES = {
  DEFAULT: typeof plus !== 'undefined' ? '_www/static/sounds/notification.mp3' : '/static/sounds/notification.mp3',
  IMPORTANT: typeof plus !== 'undefined' ? '_www/static/sounds/notification.mp3' : '/static/sounds/notification.mp3'
};

let lastNotificationAt = 0;
const NOTIFICATION_COOLDOWN = 1500;

/**
 * 触发短震动提醒（安卓端专用）
 * @returns {boolean} 是否成功触发震动
 */
export function triggerShortVibration() {
  try {
    // 检查是否在安卓平台
    if (uni.getSystemInfoSync().platform === 'android') {
      // 使用uni.vibrateShort API触发短震动
      uni.vibrateShort({
        success: () => {
          console.log('震动提醒触发成功');
        },
        fail: (error) => {
          console.error('震动提醒触发失败:', error);
        }
      });
      return true;
    } else {
      console.log('非安卓平台，不触发震动提醒');
      return false;
    }
  } catch (error) {
    console.error('触发震动时发生错误:', error);
    return false;
  }
}

/**
 * 触发长震动提醒（安卓端专用）
 * @returns {boolean} 是否成功触发震动
 */
export function triggerLongVibration() {
  try {
    // 检查是否在安卓平台
    if (uni.getSystemInfoSync().platform === 'android') {
      // 使用uni.vibrateLong API触发长震动
      uni.vibrateLong({
        success: () => {
          console.log('长震动提醒触发成功');
        },
        fail: (error) => {
          console.error('长震动提醒触发失败:', error);
        }
      });
      return true;
    } else {
      console.log('非安卓平台，不触发震动提醒');
      return false;
    }
  } catch (error) {
    console.error('触发长震动时发生错误:', error);
    return false;
  }
}

/**
 * 根据消息类型触发不同强度的震动
 * @param {string} messageType 消息类型
 * @returns {boolean} 是否成功触发震动
 */
export function triggerVibrationByType(messageType) {
  switch (messageType) {
    case 'bid_accepted': // 投标被接受
    case 'bid_won':      // 中标
      return triggerLongVibration(); // 重要消息使用长震动
    case 'new_message':  // 新消息
    case 'new_bid':      // 新投标
    case 'project_update': // 项目更新
    default:
      return triggerShortVibration(); // 普通消息使用短震动
  }
}

/**
 * 播放通知声音（安卓端专用）
 * @param {string} soundType 声音类型，默认为DEFAULT
 * @returns {boolean} 是否成功播放声音
 */
export function playNotificationSound(soundType = 'DEFAULT') {
  try {
    // 检查是否在安卓平台
    if (uni.getSystemInfoSync().platform === 'android') {
      // 创建音频上下文
      const innerAudioContext = uni.createInnerAudioContext();
      
      // 设置音频源
      innerAudioContext.src = SOUND_FILES[soundType] || SOUND_FILES.DEFAULT;
      
      // 播放完成后自动销毁，避免资源泄露
      innerAudioContext.onEnded(() => {
        innerAudioContext.destroy();
        console.log('通知声音播放完成');
      });
      
      // 播放错误处理
      innerAudioContext.onError((error) => {
        console.error('播放通知声音失败:', error);
        innerAudioContext.destroy();
      });
      
      // 尝试播放音频
      innerAudioContext.play();
      console.log('通知声音开始播放');
      return true;
    } else {
      console.log('非安卓平台，不播放通知声音');
      return false;
    }
  } catch (error) {
    console.error('播放通知声音时发生错误:', error);
    return false;
  }
}

/**
 * 根据消息类型播放不同的通知声音
 * @param {string} messageType 消息类型
 * @returns {boolean} 是否成功播放声音
 */
export function playSoundByType(messageType) {
  switch (messageType) {
    case 'bid_accepted': // 投标被接受
    case 'bid_won':      // 中标
      return playNotificationSound('IMPORTANT'); // 重要消息使用重要声音
    case 'new_message':  // 新消息
    case 'new_bid':      // 新投标
    case 'project_update': // 项目更新
    default:
      return playNotificationSound('DEFAULT'); // 普通消息使用默认声音
  }
}

/**
 * 同时触发震动和声音提醒
 * @param {string} messageType 消息类型
 */
export function triggerNotification(messageType) {
  const now = Date.now();
  if (now - lastNotificationAt < NOTIFICATION_COOLDOWN) {
    return;
  }
  lastNotificationAt = now;

  // 触发震动
  triggerVibrationByType(messageType);
  
  // 播放声音
  playSoundByType(messageType);
}
