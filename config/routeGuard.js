// src/utils/routeGuard.js
import { useUserStore } from '../store/user.js'; // 引入用户 Store 以检查登录状态

// 需要登录才能访问的页面路径列表 (与之前保持一致)
export const LOGIN_REQUIRED_PAGES = [
  '/pages/projects/publish',
  '/pages/projects/category-select',
  '/pages/user/index',
  '/pages/user/projects',
  '/pages/user/orders',
  '/pages/messages/index',
  '/pages/messages/chat',
  '/pages/orders/index',
  '/pages/orders/detail',
  '/pages/notifications/index',
  '/pages/user/verify',
  '/pages/user/settings'
  // ... 添加其他需要登录的页面路径
];

// 登录页面路径
export const LOGIN_PAGE = '/pages/login/index';
// 首页路径 (登录后重定向用，可选)
// export const HOME_PAGE = '/pages/home/index';

/**
 * 封装 uni.navigateTo，添加登录检查
 * @param {Object} options - uni.navigateTo 的参数对象
 * @param {boolean} forceLoginCheck - 是否强制检查登录（即使目标页不在列表中）
 */
export const navigateToWithLoginCheck = (options, forceLoginCheck = false) => {
  const userStore = useUserStore(); // 获取用户 Store 实例
  const targetPath = options.url.split('?')[0]; // 解析出基础路径

  // 检查：目标页面是否需要登录 或 是否强制检查登录
  if (LOGIN_REQUIRED_PAGES.includes(targetPath) || forceLoginCheck) {
    // 检查：用户是否已登录
    if (!userStore.hasLogin) { // 确保 userStore 有 hasLogin getter
      console.log(`[路由守卫] 尝试访问 ${targetPath}，但用户未登录，重定向到登录页`);
      // 未登录：跳转到登录页
      // 可以选择 redirectTo (关闭当前页) 或 navigateTo (保留当前页)
      uni.navigateTo({ url: `${LOGIN_PAGE}?redirect=${encodeURIComponent(options.url)}`  });
      // 如果希望登录后能跳回原页面，可以在 url 上带上 redirect 参数
      // uni.navigateTo({ url: `${LOGIN_PAGE}?redirect=${encodeURIComponent(options.url)}` });
      return Promise.resolve(); // 或者返回一个 rejected promise
    } else {
      console.log(`[路由守卫] 用户已登录，允许访问 ${targetPath}`);
      // 已登录：执行正常的 navigateTo
      return uni.navigateTo(options);
    }
  } else {
    console.log(`[路由守卫] 页面 ${targetPath} 不在受保护列表中，直接跳转`);
    // 不需要登录检查：直接跳转
    return uni.navigateTo(options);
  }
};

// 类似地，可以封装其他跳转方法
/**
 * 封装 uni.redirectTo，添加登录检查
 * @param {Object} options - uni.redirectTo 的参数对象
 * @param {boolean} forceLoginCheck - 是否强制检查登录
 */
export const redirectToWithLoginCheck = (options, forceLoginCheck = false) => {
  const userStore = useUserStore();
  const targetPath = options.url.split('?')[0];

  if (LOGIN_REQUIRED_PAGES.includes(targetPath) || forceLoginCheck) {
    if (!userStore.hasLogin) {
      console.log(`[路由守卫] redirectTo - 尝试访问 ${targetPath}，但用户未登录，重定向到登录页`);
      // 注意：redirectTo 会关闭当前页，所以这里用 navigateTo 到登录页可能更合适，
      // 或者直接 redirectTo 登录页
      uni.redirectTo({ url: LOGIN_PAGE });
      return Promise.resolve();
    } else {
      console.log(`[路由守卫] redirectTo - 用户已登录，允许访问 ${targetPath}`);
      return uni.redirectTo(options);
    }
  } else {
    console.log(`[路由守卫] redirectTo - 页面 ${targetPath} 不在受保护列表中，直接跳转`);
    return uni.redirectTo(options);
  }
};

/**
 * 封装 uni.switchTab，添加登录检查 (TabBar 页面通常需要登录)
 * @param {Object} options - uni.switchTab 的参数对象
 * @param {boolean} forceLoginCheck - 是否强制检查登录
 */
export const switchTabWithLoginCheck = (options, forceLoginCheck = true) => {
  const userStore = useUserStore();
  const targetPath = options.url.split('?')[0];

  // switchTab 通常用于 TabBar，这些页面很可能需要登录，所以默认 forceLoginCheck=true
  if (LOGIN_REQUIRED_PAGES.includes(targetPath) || forceLoginCheck) {
    if (!userStore.hasLogin) {
      console.log(`[路由守卫] switchTab - 尝试访问 ${targetPath}，但用户未登录，重定向到登录页`);
      // switchTab 不能带参数，如果需要返回，需在登录页逻辑处理或使用其他跳转方式
      uni.navigateTo({ url: LOGIN_PAGE }); 
      // 或者 uni.redirectTo({ url: LOGIN_PAGE });
      return Promise.resolve();
    } else {
      console.log(`[路由守卫] switchTab - 用户已登录，允许访问 ${targetPath}`);
      return uni.switchTab(options);
    }
  } else {
    console.log(`[路由守卫] switchTab - 页面 ${targetPath} 不在受保护列表中，直接跳转`);
    return uni.switchTab(options);
  }
};

// 如果需要，也可以封装 reLaunch
// export const reLaunchWithLoginCheck = (...) => { ... }