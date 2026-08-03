<template>
  <view class="publish-container">
   <!-- <view class="header">
      <view class="back-button" @click="goBack">
        <image src="/static/icons/arrow_left.png" mode="aspectFit"></image>
      </view>
      <view class="title">发布项目</view>
    </view> -->
    <!-- 使用 scroll-view 实现滚动 -->
    <scroll-view scroll-y class="form-container">
      <!-- 分类信息展示 -->
      <view class="form-section glass-effect">
        <view class="section-title">项目分类</view>
        <view class="category-path" @click="changeCategory">
          <text>{{ categoryPath }}</text>
          <image src="/static/icons/arrow_right.png" mode="aspectFit" class="arrow-icon"></image>
        </view>
      </view>
      <!-- 基本信息 -->
      <view class="form-section glass-effect">
        <view class="section-title">基本信息</view>
        <view class="form-item">
          <text class="label">项目标题</text>
          <view class="input-with-voice">
            <input 
              type="text" 
              v-model="formData.title" 
              placeholder="请输入项目标题（5-50字）" 
              maxlength="50"
              class="glass-input"
            />
            <view class="voice-btn" @click="startVoiceRecognition('title')">
              <image src="/static/icons/voice.png" mode="aspectFit" class="voice-icon-small"></image>
            </view>
          </view>
        </view>
        <view class="form-item">
          <text class="label">项目最低预算</text>
          <view class="budget-input glass-input">
            <input 
              type="digit" 
              v-model="formData.budget_min" 
              placeholder="请输入预算下限" 
            />
            <text class="unit">元</text>
          </view>
        </view>
		<view class="form-item">
		  <text class="label">项目最高预算</text>
		  <view class="budget-input glass-input">
		    <input 
		      type="digit" 
		      v-model="formData.budget_max" 
		      placeholder="请输入预算上限" 
		    />
		    <text class="unit">元</text>
		  </view>
		</view>
		
        <view class="form-item">
          <text class="label">截止日期</text>
          <picker 
            mode="date" 
            :value="formData.deadline" 
            :start="minDate" 
            @change="onDateChange"
          >
            <view class="picker-value glass-input">
              {{ formData.deadline || '请选择截止日期' }}
              <image src="/static/icons/arrow_right.png" mode="aspectFit" class="arrow-icon"></image>
            </view>
          </picker>
        </view>
       
          
		  
		  <!-- 🎯 修改：项目地点获取 -->
		         
		               <!-- 🎯 修改：项目地点获取（直接点击获取） -->
		               <view class="form-item">
		                 <text class="label">项目地点</text>
		                 <view class="location-container">
		                   <view 
		                     v-if="!formData.location" 
		                     class="location-placeholder glass-input"
		                     @click="getCurrentLocation"
		                   >
		                     <image src="/static/icons/location.png" mode="aspectFit" class="location-icon"></image>
		                     <text>点击获取当前位置</text>
		                   </view>
		                   <view v-else class="location-result glass-input">
		                     <text class="location-text">{{ formData.location }}</text>
		                     <view class="location-action" @click="getCurrentLocation">
		                       <text class="change-text">重新获取</text>
		                     </view>
		                   </view>
		                 </view>
		               </view>
		             </view>
		  
      <!-- 项目详情 -->
      <view class="form-section glass-effect">
        <view class="section-title">项目详情</view>
        <view class="form-item">
          <text class="label">详细描述</text>
          <view class="textarea-with-voice">
            <textarea 
              v-model="formData.description" 
              placeholder="请详细描述您的项目需求，包括具体要求、规格参数、交付方式等信息（10-2000字）" 
              maxlength="2000"
              class="glass-textarea"
            />
            <view class="voice-btn textarea-voice-btn" @click="startVoiceRecognition('description')">
              <image src="/static/icons/voice.png" mode="aspectFit" class="voice-icon-small"></image>
            </view>
          </view>
          <view class="word-count">{{ formData.description.length }}/2000</view>
        </view>
		
        <!-- 🎯 修改：图片上传区域 -->
        		<view class="form-item">
        			<text class="form-label">图片附件 (最多5张)</text>
        			<view class="upload-area">
        				<view 
        					v-for="(img, index) in formData.images" 
        					:key="'img_'+index"  
        					class="file-item image-item"
        				>
        					<image :src="img.url" class="uploaded-image" mode="aspectFill" />
        					<view class="delete-btn" @click="removeImage(index)">×</view>
        				</view>
        				<view v-if="formData.images.length < 5" class="upload-btn" @click="chooseImage">
        					<text class="upload-icon">+</text>
        					<text>上传图片</text>
        				</view>
        			</view>
        		</view>
				
				
				<!-- 🎯 修改：文档上传区域 -->
						<!-- PDF文档上传区域 -->
						<view class="form-item">
							<text class="form-label">PDF文档 (最多3个)</text>
							<view class="upload-area">
								<view 
									v-for="(doc, index) in formData.documents" 
									:key="'doc_'+index" 
									class="file-item doc-item"
								>
									<text class="file-name">{{ doc.name }}</text>
									<view class="delete-btn" @click="removeDocument(index)">×</view>
								</view>
								<view v-if="formData.documents.length < 3" class="upload-btn" @click="chooseDocument">
									<text class="upload-icon">+</text>
									<text>上传PDF</text>
								</view>
							</view>
						</view>
		
						<!-- CAD/STP文件上传区域 - 仅工业标单分类显示 -->
			<view v-if="categoryInfo?.mainCategory?.id === 1" class="form-item">
				<text class="form-label">CAD/STP文件 (最多3个)</text>
				<view class="upload-area">
					<view 
						v-for="(file, index) in formData.cadFiles" 
						:key="'cad_'+index" 
						class="file-item doc-item"
					>
						<text class="file-name">{{ file.name }}</text>
						<view class="delete-btn" @click="removeCadFile(index)">×</view>
					</view>
					<view v-if="formData.cadFiles.length < 3" class="upload-btn" @click="chooseCadFile">
						<text class="upload-icon">+</text>
						<text>上传CAD/STP</text>
					</view>
				</view>
			</view>

			<!-- 视频上传区域 -->
			<view class="form-item">
				<text class="form-label">视频附件 (最多1个)</text>
				<view class="upload-area">
					<view v-if="formData.video" class="file-item video-item">
						<!-- 使用封面图片代替直接的video标签，避免滚动时的黑框问题 -->
					<view class="video-preview-container" @click="previewVideo">
						<view class="video-cover-placeholder">
							<view class="video-icon">📹</view>
						</view>
						<view class="video-play-icon">
							<view class="play-triangle"></view>
						</view>
						<view class="video-info">
							<text class="video-name">{{ formData.video.name }}</text>
						</view>
					</view>
						<view class="delete-btn" @click="removeVideo">×</view>
					</view>
					<view v-if="!formData.video" class="upload-btn" @click="chooseVideo">
						<text class="upload-icon">+</text>
						<text>上传视频</text>
					</view>
				</view>
			</view>
		
		
      </view>
      <!-- 联系方式 -->
      <view class="form-section glass-effect">
        <view class="section-title">联系方式</view>
        <view class="form-item">
          <text class="label">联系人</text>
          <input 
            type="text" 
            v-model="formData.contactName" 
            placeholder="请输入联系人姓名" 
            class="glass-input"
          />
        </view>
        <view class="form-item">
          <text class="label">联系电话</text>
          <input 
            type="number" 
            v-model="formData.contactPhone" 
            placeholder="请输入联系电话" 
            class="glass-input"
          />
        </view>
      </view>
      <!-- 提交按钮 -->
      <view class="submit-btn glow-effect" @click="submitProject">{{ isEditMode ? '保存修改' : '发布项目' }}</view>
    </scroll-view>
  </view>
</template>

<script setup>
// 正确导入所需的函数
import { ref, computed, onMounted } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { publishProject, getProjectDetail, updateProject } from '../../api/project.js'
import { uploadImage, uploadPdf, uploadMultiple, uploadFilesSequentially, uploadVideo } from '../../api/upload.js'
import { APP_CONFIG } from '../../config/index.js'
import { resolveAssetUrl } from '../../utils/url.js'

// 数据
const categoryInfo = ref(null)
const isEditMode = ref(false)
const editingProjectId = ref('')
const formData = ref({
  title: '',
  budget_min: '',
  budget_max: '',
  deadline: '',
  location: '',
  description: '',
  
  images: [], // 图片附件列表 [{url: '...', name: '...'}]
  documents: [], // PDF文档列表 [{url: '...', name: '...'}]
  cadFiles: [], // CAD和STP文件列表 [{url: '...', name: '...'}]
  video: null, // 视频附件 {url: '...', name: '...'}
	
  contactName: '',
  contactPhone: '' 
})

const mapAttachment = (url) => ({
  url,
  name: decodeURIComponent(url.split('/').pop() || '附件')
})

const fillAttachments = (attachments = '') => {
  formData.value.images = []
  formData.value.documents = []
  formData.value.cadFiles = []
  formData.value.video = null

  attachments
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach((url) => {
      const lowerUrl = url.toLowerCase()
      const file = mapAttachment(url)

      if (/\.(jpg|jpeg|png|gif|webp|bmp)$/.test(lowerUrl)) {
        formData.value.images.push(file)
      } else if (/\.(mp4|mov|avi|mkv|wmv|flv|webm)$/.test(lowerUrl)) {
        formData.value.video = file
      } else if (/\.pdf$/.test(lowerUrl)) {
        formData.value.documents.push(file)
      } else {
        formData.value.cadFiles.push(file)
      }
    })
}

const fillFormForEdit = (project) => {
  formData.value.title = project.title || ''
  formData.value.budget_min = String(project.budget_min || '')
  formData.value.budget_max = String(project.budget_max || '')
  formData.value.deadline = String(project.deadline || '').slice(0, 10)
  formData.value.location = project.location || ''
  formData.value.description = project.description || ''
  formData.value.contactName = project.contact_name || ''
  formData.value.contactPhone = project.contact_phone || ''
  fillAttachments(project.attachments || '')

  categoryInfo.value = {
    mainCategory: categoryInfo.value?.mainCategory || null,
    subCategory: categoryInfo.value?.subCategory || null,
    childCategory: {
      id: project.category_id,
      name: project.category?.name || '当前分类'
    }
  }
}

const loadProjectForEdit = async (projectId) => {
  const project = await getProjectDetail(projectId)
  fillFormForEdit(project)
}

// 🎯 新增：选择图片的方法
// 选择图片
const chooseImage = () => {
	const maxCount = 5 - formData.value.images.length;
	if (maxCount <= 0) {
		uni.showToast({ title: '最多上传5张图片', icon: 'none' });
		return;
	}
	
	uni.chooseImage({
		count: maxCount,
		sizeType: ['original', 'compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			try {
				uni.showLoading({ title: '上传中...' });
				
				// 使用更新后的上传方法
				const results = await uploadFilesSequentially(res.tempFilePaths);
				
				if (results && results.urls && results.urls.length > 0) {
					// 添加上传成功的图片
					for (let i = 0; i < res.tempFilePaths.length; i++) {
						const filePath = res.tempFilePaths[i];
						const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
						
						if (i < results.urls.length) {
							formData.value.images.push({
								url: results.urls[i],
								name: fileName
							});
						}
					}
					
					uni.hideLoading();
					uni.showToast({ title: '上传成功', icon: 'success' });
				} else {
					throw new Error('上传失败');
				}
			} catch (error) {
				uni.hideLoading();
				console.error('上传图片失败:', error);
				uni.showToast({ title: '上传失败', icon: 'none' });
			}
		}
	});
};

// 🎯 新增：移除图片的方法
const removeImage = (index) => {
  if (Array.isArray(formData.value.images)) {
     formData.value.images.splice(index, 1);
  }
};

// 🎯 修改：获取当前位置（高德地图）
const getCurrentLocation = () => {
  uni.showLoading({
    title: '定位中...'
  })
  
  uni.getLocation({
    type: 'gcj02',
    geocode: true,
    success: (res) => {
      console.log('定位成功:', res)
      let locationStr = ''
      
      if (res.address) {
        const address = res.address
        locationStr = `${address.province || ''}${address.city || ''}${address.district || ''}${address.street || ''}${address.poiName || ''}`
      } else {
        locationStr = `纬度:${res.latitude.toFixed(6)}, 经度:${res.longitude.toFixed(6)}`
      }
      
      formData.value.location = locationStr
      uni.hideLoading()
      uni.showToast({
        title: '定位成功',
        icon: 'success'
      })
    },
    fail: (err) => {
      console.error('定位失败:', err)
      uni.hideLoading()
      uni.showModal({
        title: '定位失败',
        content: '无法获取当前位置，请检查定位权限和网络连接',
        showCancel: false
      })
    }
  })
}

const minDate = ref(new Date().toISOString().split('T')[0])

// 语音识别相关状态
const isRecording = ref(false);
const currentField = ref(''); // 当前正在进行语音识别的字段

// 初始化语音识别
onReady(() => {
  // #ifdef APP-PLUS
  plus.android.requestPermissions(["android.permission.RECORD_AUDIO"], (e) => {}, (e) => {})
  // #endif
});

// 开始语音识别
const startVoiceRecognition = (field) => {
  currentField.value = field;
  
  // #ifdef APP-PLUS
  isRecording.value = true;
  
  var options = {
    engine: 'baidu'
  };
  console.log('开始语音识别：');
  plus.speech.startRecognize(options, function(s){
    console.log('识别结果:', s);
    if(currentField.value === 'title') {
      formData.value.title += s;
    } else if(currentField.value === 'description') {
      formData.value.description += s;
    }
  }, function(e){
    console.log('语音识别失败：'+JSON.stringify(e));
    uni.showToast({title: '语音识别失败', icon: 'none'});
    isRecording.value = false;
  });
  
  // 显示语音识别中的提示
  uni.showToast({
    title: '请说话...',
    icon: 'none',
    duration: 60000 // 最长显示1分钟
  });
  
  // 50秒后自动停止识别
  setTimeout(() => {
    if(isRecording.value) {
      stopVoiceRecognition();
    }
  }, 50000);
  // #endif
  
  // #ifndef APP-PLUS
  uni.showToast({
    title: '语音识别仅支持APP环境',
    icon: 'none'
  });
  // #endif
};

// 停止语音识别
const stopVoiceRecognition = () => {
  // #ifdef APP-PLUS
  plus.speech.stopRecognize();
  isRecording.value = false;
  uni.hideToast(); // 隐藏提示
  uni.showToast({
    title: '识别完成',
    icon: 'success',
    duration: 1500
  });
  // #endif
};

// 计算属性
const categoryPath = computed(() => {
  if (!categoryInfo.value) return '请选择项目分类'
  const main = categoryInfo.value.mainCategory?.name || '未知'
  const sub = categoryInfo.value.subCategory?.name || '未知'
  const child = categoryInfo.value.childCategory?.name || '未知'
  return `${main} > ${sub} > ${child}`
})

// 生命周期钩子
onLoad(async (options) => {
  console.log("Publish page onLoad triggered");
  isEditMode.value = options?.edit === 'true'
  editingProjectId.value = options?.id || ''

  try {
    const storedCategoryPath = uni.getStorageSync('selectedCategoryPath')
    if (storedCategoryPath) {
      console.log("Found stored category path:", storedCategoryPath);
      categoryInfo.value = storedCategoryPath
    }
  } catch (e) {
    console.error("Failed to get stored category path:", e);
  }

  try {
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      formData.value.contactName = userInfo.real_name || userInfo.name || userInfo.username || ''
      formData.value.contactPhone = userInfo.phone || ''
    }
  } catch (e) {
    console.error("Failed to get user info for prefilling:", e);
  }

  if (isEditMode.value && editingProjectId.value) {
    try {
      uni.showLoading({ title: '加载中...' })
      await loadProjectForEdit(editingProjectId.value)
    } catch (error) {
      console.error('加载项目详情失败:', error)
      uni.showToast({ title: '加载项目失败', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }
})

// 方法定义
const goBack = () => {
  uni.navigateBack()
}

const changeCategory = () => {
  uni.navigateTo({
    url: '/pages/projects/category-select'
  })
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const onDateChange = (e) => {
  formData.value.deadline = e.detail.value
}

// 🎯 修改：choosePDF 方法重命名为 chooseDocument，并适配新逻辑
// 选择PDF文档
const chooseDocument = () => {
	const maxCount = 3 - formData.value.documents.length;
	if (maxCount <= 0) {
		uni.showToast({ title: '最多上传3个PDF文档', icon: 'none' });
		return;
	}
	
	// 在不同平台使用不同的选择文件方法
	// #ifdef APP-PLUS
	plus.io.chooseFile(
		{
			title: '选择PDF文档',
			extension: ['.pdf'],
			multiple: false
		},
		(file) => {
			if (file && file.files) {
				handleSelectedDocument(file.files[0]);
			}
		}
	);
	// #endif
	
	// #ifdef H5
	// 创建一个隐藏的file input元素
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'application/pdf';
	fileInput.style.display = 'none';
	
	fileInput.onchange = (event) => {
		const file = event.target.files[0];
		if (file) {
			handleSelectedDocument(file.path || URL.createObjectURL(file));
		}
		document.body.removeChild(fileInput);
	};
	
	document.body.appendChild(fileInput);
	fileInput.click();
	// #endif
	
	// #ifdef MP-WEIXIN
	uni.chooseMessageFile({
		count: 1,
		type: 'file',
		extension: ['pdf'],
		success: (res) => {
			if (res.tempFiles && res.tempFiles.length > 0) {
				handleSelectedDocument(res.tempFiles[0].path);
			}
		}
	});
	// #endif
};

// 处理选择的PDF文档
const handleSelectedDocument = async (filePath) => {
	try {
		uni.showLoading({ title: '上传中...' });
		
		const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
		
		// 使用更新后的上传方法
		const result = await uploadPdf(filePath);
		
		if (result && result.url) {
			formData.value.documents.push({
				url: result.url,
				name: fileName
			});
			
			uni.hideLoading();
			uni.showToast({ title: '上传成功', icon: 'success' });
		} else {
			throw new Error('上传失败');
		}
	} catch (error) {
		uni.hideLoading();
		console.error('上传PDF失败:', error);
		uni.showModal({
			title: '上传失败',
			content: (error && error.message) ? error.message : 'PDF上传失败，请重试',
			showCancel: false,
			confirmText: '我知道了'
		});
	}
};

// 🎯 新增：移除文档的方法
const removeDocument = (index) => {
  if (Array.isArray(formData.value.documents)) {
     formData.value.documents.splice(index, 1);
  }
};

// 选择视频
const chooseVideo = () => {
	if (formData.value.video) {
		uni.showToast({ title: '最多上传1个视频', icon: 'none' });
		return;
	}

	uni.chooseVideo({
		sourceType: ['album', 'camera'],
		compressed: true,
		maxDuration: 300, // 限制视频最长5分钟
		success: async (res) => {
			// 检查视频大小
			const fileSize = res.size || 0;
			const maxSize = 100 * 1024 * 1024; // 100MB限制
			
			if (fileSize > maxSize) {
				uni.showToast({ 
					title: '视频文件过大，请选择小于100MB的视频', 
					icon: 'none',
					duration: 3000
				});
				return;
			}
			
			try {
				uni.showLoading({ title: '上传中...', mask: true });
				const tempFilePath = res.tempFilePath;
				const fileName = tempFilePath.substring(tempFilePath.lastIndexOf('/') + 1);

				// 使用重试机制上传视频
				const result = await uploadVideoWithRetry(tempFilePath, fileName);

				if (result && result.url) {
					formData.value.video = {
						url: result.url,
						name: fileName
					};
					uni.hideLoading();
					uni.showToast({ title: '上传成功', icon: 'success' });
				} else {
					throw new Error('上传失败');
				}
			} catch (error) {
				uni.hideLoading();
				console.error('上传视频失败:', error);
				
				// 显示更详细的错误信息
				let errorMsg = '上传失败';
				if (error.message.includes('502')) {
					errorMsg = '服务器暂时不可用，请稍后重试';
				} else if (error.message.includes('timeout')) {
					errorMsg = '上传超时，请检查网络连接';
				} else if (error.message.includes('网络')) {
					errorMsg = '网络连接异常，请重试';
				}
				
				uni.showModal({
					title: '上传失败',
					content: errorMsg + '，是否重试？',
					confirmText: '重试',
					cancelText: '取消',
					success: (modalRes) => {
						if (modalRes.confirm) {
							// 重新选择视频
							setTimeout(() => {
								chooseVideo();
							}, 500);
						}
					}
				});
			}
		},
		fail: (error) => {
			console.error('选择视频失败:', error);
			uni.showToast({ title: '选择视频失败', icon: 'none' });
		}
	});
};

// 带重试机制的视频上传
const uploadVideoWithRetry = async (filePath, fileName, maxRetries = 3) => {
	let lastError = null;
	
	for (let i = 0; i < maxRetries; i++) {
		try {
			console.log(`视频上传尝试 ${i + 1}/${maxRetries}`);
			
			// 更新加载提示
			if (i > 0) {
				uni.showLoading({ 
					title: `重试中... (${i + 1}/${maxRetries})`, 
					mask: true 
				});
			}
			
			const result = await uploadVideo(filePath);
			
			if (result && result.url) {
				console.log('视频上传成功:', result);
				return result;
			} else {
				throw new Error('上传返回结果无效');
			}
		} catch (error) {
			lastError = error;
			console.error(`视频上传第 ${i + 1} 次尝试失败:`, error);
			
			// 如果不是最后一次尝试，等待一段时间再重试
			if (i < maxRetries - 1) {
				await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // 递增等待时间
			}
		}
	}
	
	// 所有重试都失败了
	throw lastError || new Error('上传失败');
};

// 移除视频
const removeVideo = () => {
  formData.value.video = null;
};

// 选择CAD/STP文件 - 仅支持安卓端
const chooseCadFile = () => {
	const maxCount = 3 - formData.value.cadFiles.length;
	if (maxCount <= 0) {
		uni.showToast({ title: '最多上传3个CAD/STP文件', icon: 'none' });
		return;
	}
	
	// 仅实现安卓端的文件选择
	plus.io.chooseFile(
		{
			title: '选择CAD/STP文件',
			extension: ['.cad', '.stp'],
			multiple: false
		},
		(file) => {
			if (file && file.files) {
				handleSelectedCadFile(file.files[0]);
			}
		}
	);
};

// 处理选择的CAD/STP文件
const handleSelectedCadFile = async (filePath) => {
	try {
		uni.showLoading({ title: '上传中...' });
		
		const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
		
		// 使用更新后的上传方法，确保文件类型正确
		const userStore = useUserStore();
		const token = userStore.token;
		
		// 使用uni.uploadFile直接上传
		const result = await new Promise((resolve, reject) => {
			uni.uploadFile({
				url: APP_CONFIG.API_BASE_URL + '/upload/file',
				filePath: filePath,
				name: 'file',
				header: token ? { 'Authorization': `Bearer ${token}` } : {},
				success: (res) => {
					console.log('上传CAD/STP响应:', res.statusCode, res.data);
					
					if (res.statusCode !== 200) {
						reject(new Error(`上传失败，状态码: ${res.statusCode}`));
						return;
					}
					
					try {
						const data = JSON.parse(res.data);
						// 处理后端返回的不同状态码
						if ((data.code === 0 || data.code === 200) && data.data && data.data.url) {
							// 处理返回的URL路径，确保格式正确
							let url = data.data.url;
							// 替换反斜杠为正斜杠
							url = url.replace(/\\/g, '/');
							// 如果URL不是以http或https开头，添加基础URL
							if (!url.startsWith('http://') && !url.startsWith('https://')) {
								url = resolveAssetUrl(url);
							}
							resolve({ url });
						} else {
							reject(new Error(data.message || '上传失败'));
						}
					} catch (error) {
						console.error('解析上传响应失败:', error, res.data);
						reject(new Error('解析上传响应失败'));
					}
				},
				fail: (error) => {
					console.error('上传CAD/STP请求失败:', error);
					reject(error);
				}
			});
		});
		
		if (result && result.url) {
			formData.value.cadFiles.push({
				url: result.url,
				name: fileName
			});
			
			uni.hideLoading();
			uni.showToast({ title: '上传成功', icon: 'success' });
		} else {
			throw new Error('上传失败');
		}
	} catch (error) {
		uni.hideLoading();
		console.error('上传CAD/STP文件失败:', error);
		uni.showToast({ title: '上传失败', icon: 'none' });
	}
};

// 移除CAD/STP文件
const removeCadFile = (index) => {
  if (Array.isArray(formData.value.cadFiles)) {
     formData.value.cadFiles.splice(index, 1);
  }
};

// 预览视频
const previewVideo = () => {
	if (!formData.value.video || !formData.value.video.url) {
		uni.showToast({ title: '视频不存在', icon: 'none' });
		return;
	}
	
	// 直接跳转到视频播放页面（适配Android APP）
	uni.navigateTo({
		url: `/pages/common/video-player?url=${encodeURIComponent(formData.value.video.url)}&name=${encodeURIComponent(formData.value.video.name || '视频')}`
	});
};


const validateForm = () => {
  if (!categoryInfo.value) {
    uni.showToast({
      title: '请选择项目分类',
      icon: 'none'
    })
    return false
  }
  if (!formData.value.title || formData.value.title.length < 2) {
    uni.showToast({
      title: '标题至少2个字',
      icon: 'none'
    })
    return false
  }
  if (!formData.value.budget_min || isNaN(parseFloat(formData.value.budget_min)) || parseFloat(formData.value.budget_min) <= 0) {
    uni.showToast({
      title: '请输入正确预算',
      icon: 'none'
    })
    return false
  }
  if (!formData.value.deadline) {
    uni.showToast({
      title: '请选择截止日期',
      icon: 'none'
    })
    return false
  }
  if (!formData.value.location) {
    uni.showToast({
      title: '请获取项目地点',
      icon: 'none'
    })
    return false
  }
  if (!formData.value.description || formData.value.description.length < 10) {
    uni.showToast({
      title: '描述至少10个字',
      icon: 'none'
    })
    return false
  }
  if (!formData.value.contactName) {
    uni.showToast({
      title: '请输入联系人',
      icon: 'none'
    })
    return false
  }
  if (!formData.value.contactPhone) {
    uni.showToast({
      title: '请输入联系电话',
      icon: 'none'
    })
    return false
  }
  return true
}

// 🎯 修改：submitProject 方法，提交时合并图片和文档ID
const submitProject = () => {
  if (!validateForm()) return;
  uni.showLoading({ title: '提交中...' });
  
  // 合并图片、文档、CAD文件和视频的 URL
  const allAttachmentIds = [
    ...formData.value.images.map(img => img.url),
    ...formData.value.documents.map(doc => doc.url),
    ...formData.value.cadFiles.map(file => file.url)
  ];
  if (formData.value.video && formData.value.video.url) {
    allAttachmentIds.push(formData.value.video.url);
  }
  
  const projectData = {
    title: formData.value.title,
    budget_min: parseFloat(formData.value.budget_min),
	budget_max: parseFloat(formData.value.budget_max),
    deadline: formData.value.deadline,
    location: formData.value.location,
    description: formData.value.description,
    // attachments: Array.isArray(formData.value.attachments) ? formData.value.attachments.map((item) => item.id) : [],
	attachments: allAttachmentIds, // 使用合并后的ID列表
    contactName: formData.value.contactName,
    contactPhone: formData.value.contactPhone,
    categoryId: categoryInfo.value?.childCategory?.id,
    categoryPath: categoryInfo.value?.mainCategory?.id && categoryInfo.value?.subCategory?.id && categoryInfo.value?.childCategory?.id ?
                  [categoryInfo.value.mainCategory.id, categoryInfo.value.subCategory.id, categoryInfo.value.childCategory.id] :
                  []
  };
  console.log("提交项目数据--》:", projectData);
  const request = isEditMode.value && editingProjectId.value
    ? updateProject(editingProjectId.value, projectData).then(() => ({ id: editingProjectId.value }))
    : publishProject(projectData)

  request
    .then((res) => {
      uni.hideLoading();
      uni.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/projects/detail?id=${res.id}` });
      }, 1500);
    })
    .catch((err) => {
      uni.hideLoading();
      const errMsg = err?.response?.data?.message || err?.message || '发布失败';
      uni.showToast({ title: errMsg, icon: 'none' });
      console.error('发布失败:', err);
    });
};

</script>

<style scoped>
.publish-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 占据整个视口高度 */
  background: linear-gradient(135deg, #1a2a6c, #2a3a7c);
  color: #fff;
   /* --- 关键：防止水平滚动 --- */
    width: 100vw; /* 明确设置宽度为视口宽度 */
    max-width: 100vw; /* 防止超出 */
    overflow-x: hidden; /* 隐藏水平溢出 */
    box-sizing: border-box; /* 确保 padding/border 不增加总宽度 */
    /* --- 关键结束 --- */
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.back-button image {
  width: 40rpx;
  height: 40rpx;
  transform: rotate(180deg);
  filter: brightness(0) invert(1);
}

.title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 60rpx;
  color: #fff;
}

.form-container {
  flex: 1; /* 占据剩余空间 */
  padding: 2rpx;
  overflow-y: auto; /* 允许垂直滚动 */
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}

.form-section {
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.category-path {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.arrow-icon {
  width: 30rpx;
  height: 30rpx;
  filter: brightness(0) invert(1);
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10rpx;
}

.glass-input {
  width: 100%;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.budget-input {
  display: flex;
  align-items: center;
  padding-right: 20rpx;
}

.budget-input input {
  flex: 1;
  background-color: transparent;
  color: #fff;
}

.unit {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.picker-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #fff;
}

.glass-textarea {
  width: 100%;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.word-count {
  text-align: right;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 10rpx;
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  max-width: 100%;
}

.file-name {
  flex: 1;
  font-size: 24rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #fff;
}

.delete-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 10rpx;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 160rpx;
  height: 160rpx;
  border-radius: 10rpx;
  border: 2rpx dashed rgba(255, 255, 255, 0.3);
}

.upload-btn image {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 10rpx;
  filter: brightness(0) invert(1);
}

.upload-btn text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.submit-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90rpx;
  background: linear-gradient(90deg, #3498db, #1e88e5);
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  margin: 40rpx 0;
  box-shadow: 0 0 20px rgba(52, 152, 219, 0.5);
  position: relative;
  overflow: hidden;
}

.glow-effect {
  position: relative;
}

.glow-effect::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: glowEffect 2s infinite;
}

@keyframes glowEffect {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* 在现有样式基础上追加以下样式 */

.location-container {
  width: 100%;
}

.location-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

.location-placeholder .location-icon {
  width: 30rpx;
  height: 30rpx;
  margin-right: 10rpx;
  filter: brightness(0) invert(1);
}

.location-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  padding: 0 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.location-text {
  flex: 1;
  font-size: 28rpx;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-action {
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  margin-left: 20rpx;
}

.change-text {
  font-size: 24rpx;
  color: #00eeff;
}

.location-placeholder:active,
.location-action:active {
  background: rgba(255, 255, 255, 0.3);
}






/* 🎯 新增/修改：上传区域和文件项样式 */
.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx; /* 增大间距 */
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10rpx 15rpx; /* 调整内边距 */
  max-width: 100%;
  position: relative; /* 为删除按钮定位 */
}

/* 🎯 新增：图片项样式 */
.image-item {
  width: 160rpx; /* 固定宽度 */
  height: 160rpx; /* 固定高度，形成正方形 */
  padding: 5rpx; /* 内边距 */
  justify-content: center; /* 内容居中 */
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 10rpx;
}

/* 🎯 新增：文档项样式 */
.doc-item {
  /* 文档项可以沿用 .file-item 的基本样式，或微调 */
  background: rgba(173, 216, 230, 0.3); /* 淡蓝色背景区分 */
  border: 1px solid rgba(173, 216, 230, 0.5);
}

/* 视频项样式 */
.video-item {
  width: 160rpx;
  height: 160rpx;
  padding: 5rpx;
  justify-content: center;
}

.uploaded-video {
  width: 100%;
  height: 100%;
  border-radius: 10rpx;
}

/* 视频预览容器样式 */
.video-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.video-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
}

.video-icon {
  font-size: 60rpx;
  opacity: 0.8;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60rpx;
  height: 60rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-triangle {
  width: 0;
  height: 0;
  border-left: 20rpx solid #fff;
  border-top: 12rpx solid transparent;
  border-bottom: 12rpx solid transparent;
  margin-left: 4rpx;
}

.video-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 20rpx 10rpx 10rpx;
}

.video-name {
  color: #fff;
  font-size: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-preview-container:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.file-name {
  flex: 1;
  font-size: 24rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #fff;
}

/* 🎯 修改：删除按钮样式以适应不同大小的容器 */
.delete-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
  /* margin-left: 10rpx; 移除或调整 */
  position: absolute; /* 绝对定位 */
  top: -15rpx; /* 向上偏移 */
  right: -15rpx; /* 向右偏移 */
  background: rgba(255, 0, 0, 0.7); /* 红色背景 */
  border-radius: 50%; /* 圆形 */
  z-index: 2; /* 确保在图片之上 */
}

/* 🎯 新增：上传按钮图标样式 */
.upload-icon {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 10rpx;
  filter: brightness(0) invert(1);
}

/* 🎯 新增：上传按钮样式微调 */
.upload-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* width: 160rpx;  宽度可以由内容撑开或固定 */
  /* height: 160rpx; 高度可以由内容撑开或固定 */
  min-width: 160rpx; /* 最小宽度 */
  min-height: 160rpx; /* 最小高度 */
  padding: 20rpx; /* 增加内边距 */
  border-radius: 10rpx;
  border: 2rpx dashed rgba(255, 255, 255, 0.3);
  flex-shrink: 0; /* 防止在 flex 容器中被压缩 */
}

.upload-btn image {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 10rpx;
  filter: brightness(0) invert(1);
}

.upload-btn text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 语音识别按钮相关样式 */
.input-with-voice {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.textarea-with-voice {
  position: relative;
  width: 100%;
}

.voice-btn {
  position: absolute;
  right: 10rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.textarea-voice-btn {
  top: 20rpx;
  transform: none;
}

.voice-icon-small {
  width: 36rpx;
  height: 36rpx;
  filter: brightness(0) invert(1);
}

.voice-btn:active {
  background: rgba(255, 255, 255, 0.4);
}


</style>
