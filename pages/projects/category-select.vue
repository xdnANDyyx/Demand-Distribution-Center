<template>
  <view class="category-select-container">
    <!-- <view class="header">
      <view class="back-button" @click="goBack">
        
        <image src="/static/icons/arrow_left.png" mode="aspectFit"></image>
      </view>
      <view class="title">选择项目分类</view>
    </view> -->

    <view class="category-steps">
      <!-- 修改步骤显示，初始显示传入的一级分类名称 -->
      <view class="step active">{{ mainCategoryName }}</view>
      <view class="step-divider"></view>
      <view class="step" :class="{ active: step === 2 }">二级分类</view>
      <view class="step-divider"></view>
      <view class="step" :class="{ active: step === 3 }">三级分类</view>
    </view>

    <!-- 移除一级分类列表 (v-if="step === 1") -->

    <!-- 二级分类列表 -->
    <view v-if="step === 2" class="category-list">
      <view
        v-for="subCategory in subCategories" 
        :key="subCategory.id" 
        class="category-item"
        @click="selectSubCategory(subCategory)"
      >
        <text class="category-name">{{ subCategory.name }}</text>
        <image src="/static/icons/arrow_right.png" mode="aspectFit" class="arrow-icon"></image>
      </view>
    </view>

    <!-- 三级分类列表 -->
    <view v-if="step === 3" class="category-list">
      <view
        v-for="childCategory in selectedSubCategory?.children"
        :key="childCategory.id"
        class="category-item"
        @click="selectChildCategory(childCategory)"
      >
        <text class="category-name">{{ childCategory.name }}</text>
        <image src="/static/icons/check.png" mode="aspectFit" class="check-icon"></image>
      </view>
    </view>
  </view>
</template> 

<script setup>
import { ref, onMounted } from 'vue' // 导入 onMounted
import { onLoad } from '@dcloudio/uni-app' // 导入 onLoad 生命周期钩子
import { projectCategories } from '../../config/categories.js' // 导入分类数据

// 定义响应式数据
// 移除 categories，新增 mainCategoryId 和 mainCategoryName
const mainCategoryId = ref(null)
const mainCategoryName = ref('')
const subCategories = ref([]) // 存储根据 mainCategoryId 找到的二级分类

const step = ref(2) // 初始步骤改为 2，因为我们已经有一级分类了
const selectedSubCategory = ref(null)
const selectedChildCategory = ref(null)
const comf = ref('')
// onLoad 是页面加载时的生命周期钩子，用于获取页面参数
onLoad((options) => {
	if(options.comfrom == "bids"){
		console.log('接收到的页面参数来自投标页');
		comf.value = "bids"
	}else if(options.comfrom =="projects"){
		console.log('接收到的页面参数来自项目页');
		comf.value = "projects"
	}
  console.log('接收到的页面参数:', options);
  if (options.mainCategoryId && options.mainCategoryName) {
    mainCategoryId.value = parseInt(options.mainCategoryId, 10); // 确保是数字
    mainCategoryName.value = decodeURIComponent(options.mainCategoryName); // 解码 URL 编码的名称
    console.log('解析后的一级分类 ID:', mainCategoryId.value);
    console.log('解析后的一级分类名称:', mainCategoryName.value);

    // 根据 mainCategoryId 查找对应的二级分类
    const mainCategory = projectCategories.find(cat => cat.id === mainCategoryId.value);
    if (mainCategory && mainCategory.subCategories) {
        subCategories.value = mainCategory.subCategories;
        console.log('找到的二级分类:', subCategories.value);
    } else {
        console.warn('未找到对应的一级分类或其二级分类为空');
        uni.showToast({ title: '分类数据错误', icon: 'none' });
        // 可以选择返回上一页
        // uni.navigateBack();
    }
  } else {
    console.error('缺少必要的页面参数: mainCategoryId 或 mainCategoryName');
    uni.showToast({ title: '参数错误', icon: 'none' });
    // 参数错误，返回上一页
    uni.navigateBack();
  }
})

// 方法定义
const goBack = () => {
  if (step.value > 2) { // 修改回退逻辑，第一步已经是二级分类了
    step.value--
  } else {
    uni.navigateBack()
  }
}

// selectMainCategory 不再需要，因为我们已经从首页获取了一级分类

const selectSubCategory = (subCategory) => {
  selectedSubCategory.value = subCategory
  step.value = 3
}

const selectChildCategory = (childCategory) => {
  selectedChildCategory.value = childCategory

  // 保存完整的分类路径
  const categoryPath = {
    mainCategory: {
      id: mainCategoryId.value, // 使用从首页传来的 ID
      name: mainCategoryName.value // 使用从首页传来的名称
    },
    subCategory: {
      id: selectedSubCategory.value.id,
      name: selectedSubCategory.value.name
    },
    childCategory: {
      id: childCategory.id,
      name: childCategory.name
    }
  }
   if(comf.value == 'bids'){
	   // 将分类信息存储到本地，以便在发布页面使用
	   try {
	     uni.setStorageSync('selectedBidsID', categoryPath)
	     console.log('分类路径已保存:', categoryPath)
	   } catch (e) {
	     console.error('保存分类路径失败:', e)
	     uni.showToast({ title: '保存分类失败', icon: 'none' })
	     return // 保存失败则不跳转
	   }
	   
	   // 跳转到项目发布页面
	   uni.navigateTo({
	     url: '/pages/projects/list'
	   })
   }else if(comf.value == 'projects'){
	   // 将分类信息存储到本地，以便在发布页面使用
	   try {
	     uni.setStorageSync('selectedCategoryPath', categoryPath)
	     console.log('分类路径已保存:', categoryPath)
	   } catch (e) {
	     console.error('保存分类路径失败:', e)
	     uni.showToast({ title: '保存分类失败', icon: 'none' })
	     return // 保存失败则不跳转
	   }
	   
	   // 跳转到项目发布页面
	   uni.navigateTo({
	     url: '/pages/projects/publish'
	   })
   }
  
}
</script>

<style scoped>

.category-select-container {
  /* 应用与首页相同的渐变背景 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite; /* 可选：添加背景动画 */
  height: 100vh;        /* 设置固定高度为视口高度 */
  overflow: hidden;     /* 隐藏超出视口的内容，防止滚动 */
 
  color: #fff; /* 默认文字颜色为白色 */
}

/* 可选：为背景添加动画效果 */
@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.header {
  display: flex;
  align-items: center;
  /* 减少顶部内边距，因为首页头部更高 */
  padding: 10rpx 0; 
  margin-bottom: 30rpx;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 应用玻璃态效果 */
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.back-button image {
  width: 36rpx; /* 稍微调整图标大小 */
  height: 36rpx;
  /* 确保图标是白色的 */
  filter: brightness(0) invert(1); 
  transform: rotate(180deg);
}

.title {
  flex: 1;
  text-align: center;
  font-size: 36rpx; /* 调整字体大小 */
  font-weight: bold;
  /* margin-right: 60rpx; 移除，因为我们调整了布局 */
  color: #fff; /* 确保标题是白色 */
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2); /* 添加轻微文字阴影 */
}

/* --- 分类步骤条样式 --- */
.category-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
  /* 可以给步骤条也加上玻璃态背景 */
  background: rgba(255, 255, 255, 0.1);
  padding: 15rpx 20rpx; /* 增加内边距 */
  border-radius: 30rpx; /* 圆角 */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.step {
  font-size: 26rpx; /* 调整字体 */
  color: rgba(255, 255, 255, 0.7); /* 调整颜色 */
  padding: 8rpx 16rpx; /* 调整内边距 */
  border-radius: 20rpx; /* 圆角 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.step.active {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.2); /* 更明显的激活态背景 */
  font-weight: 600;
  /* 移除之前的下划线样式，使用背景色区分 */
}

.step-divider {
  width: 30rpx; /* 调整分隔符宽度 */
  height: 2rpx;
  background-color: rgba(255, 255, 255, 0.3); /* 调整分隔符颜色 */
}
/* --- 分类步骤条样式结束 --- */


/* --- 分类列表项样式 --- */
.category-list {
  /* 移除之前的纯白背景和圆角 */
  /* background-color: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden; */
  
  /* 应用玻璃态卡片样式，类似于首页的 category-card */
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24rpx;
  overflow: hidden;
  backdrop-filter: blur(20rpx); /* 调整模糊度 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8rpx 32rpx 0 rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.category-item {
  display: flex;
  align-items: center;
  /* 调整内边距，使其更像首页的卡片 */
  padding: 30rpx; 
  /* 移除之前的边框，使用悬停效果 */
  /* border-bottom: 1rpx solid #EEEEEE; */
  transition: all 0.3s ease; /* 添加过渡 */
  cursor: pointer; /* 添加指针手势 */
  position: relative; /* 为悬停效果做准备 */
  overflow: hidden; /* 隐藏溢出的伪元素 */
}

/* 添加悬停和激活效果，模仿首页 category-card */
.category-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}
.category-item:active::before {
  opacity: 1;
}
.category-item:active {
  transform: scale(0.98); /* 轻微缩放 */
}

.category-item:last-child {
  /* 移除最后一个的边框 */
  /* border-bottom: none; */
}

/* 如果需要图标，可以保留或调整 */
/*
.category-icon {
  width: 60rpx;
  height: 60rpx;
  margin-right: 20rpx;
}
*/

.category-name {
  flex: 1;
  font-size: 30rpx; /* 调整字体大小 */
  font-weight: 500; /* 调整字重 */
  color: #fff; /* 文字颜色为白色 */
  position: relative;
  z-index: 1; /* 确保文字在伪元素之上 */
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1); /* 添加轻微文字阴影 */
}

/* 调整箭头和勾选图标样式 */
.arrow-icon, .check-icon {
  width: 32rpx; /* 调整图标大小 */
  height: 32rpx;
  filter: brightness(0) invert(1); /* 确保图标是白色的 */
  position: relative;
  z-index: 1;
}
/* --- 分类列表项样式结束 --- */

</style>