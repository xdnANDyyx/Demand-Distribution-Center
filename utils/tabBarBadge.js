const MESSAGE_TAB_INDEX = 2

const getBadgeText = (count) => {
  if (!count || count <= 0) {
    return ''
  }

  return count > 99 ? '99+' : String(count)
}

export const syncMessageTabBadge = (count) => {
  try {
    if (typeof uni === 'undefined') {
      return
    }

    const badgeText = getBadgeText(count)

    if (!badgeText) {
      uni.removeTabBarBadge({
        index: MESSAGE_TAB_INDEX,
        fail: () => {}
      })
      return
    }

    uni.setTabBarBadge({
      index: MESSAGE_TAB_INDEX,
      text: badgeText,
      fail: () => {
        uni.showTabBarRedDot({
          index: MESSAGE_TAB_INDEX,
          fail: () => {}
        })
      }
    })
  } catch (error) {
    console.error('同步消息角标失败:', error)
  }
}
