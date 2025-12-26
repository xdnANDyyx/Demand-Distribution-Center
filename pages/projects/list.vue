<template>
	<view class="list-container">
		<!-- 顶部固定区域 -->
		<view class="header-fixed">
			<!-- 搜索栏 -->
			<view class="search-bar-glass">
				<text class="search-icon">🔍</text>
				<input 
					class="search-input" 
					v-model="queryParams.keyword" 
					placeholder="搜索项目关键词"
					@confirm="handleSearch"
				/>
			</view>

			<!-- 筛选和排序 -->
			<view class="filter-sort-bar">
				<!-- 修改：使用级联分类筛选 -->
				<view class="category-cascader-wrapper">
					<!-- 一级分类 -->
					<picker @change="onMainCategoryChange" :value="mainCategoryIndex" :range="mainCategories" range-key="name">
						<view class="picker-item">
							<text>{{ selectedMainCategory?.name || '一级分类' }}</text>
							<text class="arrow-down">▾</text>
						</view>
					</picker>
					<!-- 二级分类 (当一级选中后显示) -->
					<picker v-if="selectedMainCategory && subCategories.length > 0" @change="onSubCategoryChange" :value="subCategoryIndex" :range="subCategories" range-key="name">
						<view class="picker-item">
							<text>{{ selectedSubCategory?.name || '二级分类' }}</text>
							<text class="arrow-down">▾</text>
						</view>
					</picker>
					<!-- 三级分类 (当二级选中后显示) -->
					<picker v-if="selectedSubCategory && childCategories.length > 0" @change="onChildCategoryChange" :value="childCategoryIndex" :range="childCategories" range-key="name">
						<view class="picker-item">
							<text>{{ selectedChildCategory?.name || '三级分类' }}</text>
							<text class="arrow-down">▾</text>
						</view>
					</picker>
					<!-- 重置按钮 -->
					<view v-if="selectedChildCategory || selectedSubCategory || selectedMainCategory" class="reset-btn" @click="resetCategoryFilter">
						<text>重置</text>
					</view>
				</view>
				
				<view class="sort-wrapper">
					<picker @change="bindSortChange" :value="sortIndex" :range="sortOptions" range-key="label">
						<view class="picker-item">
							<text>{{ sortOptions[sortIndex]?.label || '默认排序' }}</text>
							<text class="arrow-down">▾</text>
						</view>
					</picker>
				</view>
			</view>
		</view>

		<!-- 项目列表 -->
		<view class="project-list-container">
			<view v-if="projects.length > 0" class="project-list">
				<project-card 
					v-for="project in projects" 
					:key="project.id"
					:project="project"
					@click="goToProjectDetail(project.id)"
				></project-card>
			</view>

			<!-- 状态视图 -->
			<view v-if="loading" class="status-view">
				<text class="status-text">加载中...</text>
			</view>
			<view v-if="!loading && projects.length === 0" class="status-view empty-state">
				<image src="/static/images/empty-box.png" class="empty-icon"></image>
				<text class="status-text">暂无相关项目</text>
			</view>
			<view v-if="!loading && projects.length > 0 && !hasMore" class="status-view">
				<text class="status-text">没有更多了</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useProjectStore } from '../../store/project.js'
import { projectCategories } from '../../config/categories.js' // 假设分类数据在这里
import ProjectCard from '../../components/ProjectCard.vue'
 
const projectStore = useProjectStore()

const projects = ref([])
const loading = ref(false)
const hasMore = ref(true)

const queryParams = reactive({
	page: 1,
	size: 10,
	keyword: '',
	// 修改：使用 categoryId 进行筛选
	category_id: null, 
	sort: 'latest'
})

// --- 新增：分类筛选相关数据 ---
const mainCategories = ref(projectCategories) // 一级分类直接来自配置
const subCategories = ref([]) // 根据一级分类动态计算
const childCategories = ref([]) // 根据二级分类动态计算

const mainCategoryIndex = ref(-1) // -1 表示未选择
const subCategoryIndex = ref(-1)
const childCategoryIndex = ref(-1)

const category_id = ref(0)

// 计算属性，根据索引获取当前选中的分类对象
const selectedMainCategory = computed(() => {
	return mainCategoryIndex.value >= 0 ? mainCategories.value[mainCategoryIndex.value] : null
})
const selectedSubCategory = computed(() => {
	return subCategoryIndex.value >= 0 ? subCategories.value[subCategoryIndex.value] : null
})
const selectedChildCategory = computed(() => {
	return childCategoryIndex.value >= 0 ? childCategories.value[childCategoryIndex.value] : null
})

// 监听一级分类变化
const onMainCategoryChange = (e) => {
	const index = parseInt(e.detail.value)
	mainCategoryIndex.value = index
	subCategoryIndex.value = -1 // 重置二级
	childCategoryIndex.value = -1 // 重置三级
	queryParams.category_id = null // 重置查询参数
	
	// 更新二级分类列表
	if (selectedMainCategory.value && selectedMainCategory.value.subCategories) {
		subCategories.value = selectedMainCategory.value.subCategories
	} else {
		subCategories.value = []
	}
	// 清空三级分类列表
	childCategories.value = []
	
	// 触发搜索
	loadData(true)
}

// 监听二级分类变化
const onSubCategoryChange = (e) => {
	const index = parseInt(e.detail.value)
	subCategoryIndex.value = index
	childCategoryIndex.value = -1 // 重置三级
	queryParams.category_id = null // 重置查询参数
	
	// 更新三级分类列表
	if (selectedSubCategory.value && selectedSubCategory.value.children) {
		childCategories.value = selectedSubCategory.value.children
	} else {
		childCategories.value = []
	}
	
	// 触发搜索
	loadData(true)
}

// 监听三级分类变化
const onChildCategoryChange = (e) => {
	const index = parseInt(e.detail.value)
	childCategoryIndex.value = index
	
	// 设置最终的查询参数为三级分类ID
	if (selectedChildCategory.value) {
		queryParams.category_id = selectedChildCategory.value.id
	} else {
		queryParams.category_id = null
	}
	
	// 触发搜索
	loadData(true)
}

// 重置分类筛选
const resetCategoryFilter = () => {
	mainCategoryIndex.value = -1
	subCategoryIndex.value = -1
	childCategoryIndex.value = -1
	subCategories.value = []
	childCategories.value = []
	queryParams.category_id = null
	loadData(true)
}
// --- 新增结束 ---


const sortOptions = ref([
	{ value: 'latest', label: '最新发布' },
	{ value: 'budget_desc', label: '预算从高到低' },
	{ value: 'budget_asc', label: '预算从低到高' },
])
const sortIndex = ref(0)


const loadData = async (refresh = false) => {
	if (loading.value) return
	loading.value = true

	if (refresh) {
		queryParams.page = 1
		queryParams.category_id = category_id.value
		projects.value = []
		hasMore.value = true
	}

	try {
		// 调用 API 时，queryParams 已经包含了 category_id 和其他参数
		const res = await projectStore.getProjectList(queryParams)
		if (res.list && res.list.length > 0) {
			projects.value = [...projects.value, ...res.list]
			queryParams.page++
			hasMore.value = res.list.length === queryParams.size
		} else {
			hasMore.value = false
		}
	} catch (error) {
		console.error('加载项目列表失败:', error)
		uni.showToast({ title: '加载失败', icon: 'none' })
	} finally {
		loading.value = false
	}
}

onLoad((option) => {
	try {
		console.log("option里面有什么？",option)
		 const receivedKeyword = decodeURIComponent(option.keyword || '')
		queryParams.keyword = receivedKeyword
	  const storedCategoryPath = uni.getStorageSync('selectedBidsID')
	  if (storedCategoryPath) {
	    console.log("要找到它的分类", storedCategoryPath);
	    // categoryInfo.value = storedCategoryPath childCategory
		category_id.value = storedCategoryPath.childCategory.id
		console.log("分类直达", storedCategoryPath.childCategory.id);
	  }
	} catch (e) {
	  console.error("Failed to get stored category path:", e);
	}
	loadData(true)
})

onReachBottom(() => {
	if (hasMore.value && !loading.value) {
		loadData() // 加载下一页
	}
})

const handleSearch = () => {
	loadData(true) // 搜索时刷新列表
}

// 修改：排序变化时也刷新
const bindSortChange = (e) => {
	sortIndex.value = e.detail.value
	queryParams.sort = sortOptions.value[e.detail.value].value
	loadData(true)
}

const goToProjectDetail = (id) => {
	uni.navigateTo({ url: `/pages/projects/detail?id=${id}` })
}
</script>

<style scoped>
.list-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
}

@keyframes gradient {
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
}

.header-fixed {
	position: sticky;
	top: 0;
	z-index: 10;
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(29, 78, 216, 0.9));
	backdrop-filter: blur(10px);
	padding: 20rpx 30rpx;
	/* padding-top: var(--status-bar-height); */ /* 如果需要考虑状态栏高度 */
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-bar-glass {
	display: flex;
	align-items: center;
	height: 70rpx;
	padding: 0 30rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 35rpx;
	color: #fff;
	margin-bottom: 20rpx;
}

.search-icon {
	margin-right: 15rpx;
	font-size: 32rpx;
}

.search-input {
	flex: 1;
	color: #fff;
	font-size: 28rpx;
}
.search-input::placeholder {
	color: rgba(255, 255, 255, 0.7);
}

.filter-sort-bar {
	display: flex;
	justify-content: space-between;
	align-items: center; /* 垂直居中 */
	flex-wrap: wrap; /* 允许换行，以防屏幕过窄 */
}

/* --- 修改：分类级联筛选样式 --- */
.category-cascader-wrapper {
	display: flex;
	gap: 10rpx; /* 元素间间距 */
	flex: 1;
	min-width: 0; /* 防止 flex 项目溢出 */
}
.category-cascader-wrapper .picker-item {
	flex: 1;
	min-width: 0; /* 防止文本过长导致布局问题 */
}
.reset-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60rpx;
	background: rgba(255, 255, 255, 0.15);
	border-radius: 30rpx;
	color: #fff;
	font-size: 24rpx; /* 稍小的字体 */
	padding: 0 15rpx;
	white-space: nowrap; /* 防止文字换行 */
}
/* --- 修改结束 --- */

.sort-wrapper {
	/* flex: 1; */ /* 排序可以保持固定宽度或根据需要调整 */
	min-width: 150rpx; /* 给排序一个最小宽度 */
}

.picker-item {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 60rpx;
	background: rgba(255, 255, 255, 0.15);
	border-radius: 30rpx;
	color: #fff;
	font-size: 28rpx;
	padding: 0 20rpx;
	white-space: nowrap; /* 防止文字换行 */
	overflow: hidden;
	text-overflow: ellipsis; /* 超出部分省略号 */
}
.arrow-down {
	margin-left: 10rpx;
	flex-shrink: 0; /* 防止箭头被压缩 */
}

.project-list-container {
	padding: 30rpx;
	flex: 1;
}

.status-view {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
	color: rgba(255, 255, 255, 0.7);
}

.status-text {
	font-size: 28rpx;
}

.empty-state .empty-icon {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 30rpx;
	opacity: 0.5;
}
</style>