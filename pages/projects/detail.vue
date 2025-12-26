<template>
	<view class="detail-container">
		<view v-if="project">
			<!-- 项目信息卡片 -->
			<view class="card-glass">
				<view class="project-title">{{ project.title }}</view>
				<view class="info-grid">
					<view class="info-item">
						<text class="info-label">预算</text>
						<text class="info-value price">¥{{ project.budget_min }}-¥{{ project.budget_max }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">交付周期</text>
						<text class="info-value">{{ project.delivery_time }} 天</text>
					</view>
					<view class="info-item">
						<text class="info-label">投标数</text>
						<text class="info-value">{{ project.bid_count }}</text>
					</view>
				</view>
				<view class="deadline-info">
					<image class="icon" src="/static/icons/deadline.png"></image>
					<text>投标截止日期: {{ formattedDeadline }}</text>
				</view>
			</view>
			<!-- 项目描述 -->
			<view class="card-glass">
				<view class="card-title">项目描述</view>
				<text class="description-text">{{ project.description }}</text>
			</view>
			
			
						<!-- 🎯 新增：项目附件 -->
						<scroll-view class="card-glass" v-if="projectAttachments.images.length > 0 || projectAttachments.pdfs.length > 0 || projectAttachments.videos.length > 0">
							<view class="card-title">项目附件</view>
							
							<!-- 图片附件 -->
							<view v-if="projectAttachments.images.length > 0" class="attachments-section">
								<view class="section-subtitle">图片 (点击预览)</view>
								<view class="image-attachments">
									<view 
										v-for="(img, index) in projectAttachments.images" 
										:key="'img_'+index" 
										class="image-attachment-item"
										@click="previewImage(index)"
									>
										<image :src="img.url" class="attachment-image-thumb" mode="aspectFill" />
									</view>
								</view>
							</view>

							<!-- 视频附件 -->
							<view v-if="projectAttachments.videos.length > 0" class="attachments-section">
								<view class="section-subtitle">视频</view>
								<view class="video-attachments">
									<view 
										v-for="(video, index) in projectAttachments.videos" 
										:key="'video_'+index" 
										class="video-attachment-item"
									>
										<!-- 使用封面预览代替直接video标签 -->
										<view class="video-attachment-preview" @click="previewAttachmentVideo(video.url, video.name)">
											<view class="video-cover-placeholder">
												<view class="video-icon">📹</view>
											</view>
											<view class="video-play-icon">
												<view class="play-triangle"></view>
											</view>
											<view class="video-info">
												<text class="video-name">{{ video.name }}</text>
											</view>
										</view>
									</view>
								</view>
							</view>
							
							<!-- PDF 附件 -->
							<view v-if="projectAttachments.pdfs.length > 0" class="attachments-section">
								<view class="section-subtitle">文档 (点击下载)</view>
								<view class="pdf-attachments">
									<view 
										v-for="(pdf, index) in projectAttachments.pdfs" 
										:key="'pdf_'+index" 
										class="pdf-attachment-item"
									>
										<view class="pdf-info">
											<text class="pdf-name">{{ pdf.name }}</text>
										</view>
										<button class="download-btn" @click="downloadPdf(pdf)">下载</button>
									</view>
								</view>
							</view>
						</scroll-view>
						<!-- 🎯 新增结束 -->
			
			
			
			
			
			<!-- 发布者信息 -->
			<view class="card-glass publisher-card">
				<view class="card-title">发布者</view>
				<view class="publisher-info">
					<image class="avatar" :src="project.publisher.avatar || ''" @tap="goToUserProfile(project.publisher.id)"></image>
					<view class="publisher-details" @tap="goToUserProfile(project.publisher.id)">
						<text class="username">{{ project.publisher.username }}</text>
						<view class="rating-line">
							<text class="rating-label">信誉分: </text>
							<text class="rating-score">{{ project.publisher.rating }}</text>
						</view>
					</view>
					<button class="contact-btn" @click="handleContact">联系TA</button>
				</view>
			</view>
			<!-- 投标情况 -->
			<view class="card-glass" v-if="isOwner && bids.length > 0">
				<view class="card-title">投标情况</view>
				<view class="bids-list">
					<view v-for="bid in bids" :key="bid.id" class="bid-item">
						<view class="bidder-info">
							<image class="bidder-avatar" :src="bid.bidder.avatar || '/static/images/default-avatar.png'"></image>
							<view class="bidder-details">
								<text class="bidder-name">{{ bid.bidder.username }}</text>
								<text class="bidder-rating">信誉分: {{ bid.bidder.rating || 5 }}</text>
							</view>
							<view class="bid-price">¥{{ bid.price }}</view>
						</view>
						<view class="bid-delivery">交付周期: {{ bid.delivery_days }}天</view>
						<view class="bid-description">{{ bid.description }}</view>
						<view class="bid-time">{{ formatDate(bid.created_at) }}</view>
						<view class="bid-actions" v-if="isOwner && project.status === 'bidding'">
							<button class="select-bid-btn" @click="handleSelectBid(bid.id)">选择此方案</button>
							<button class="contact-bidder-btn" @click="contactUser(bid.bidder.id)">联系投标人</button>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 项目管理 -->
			<view class="card-glass" v-if="isOwner">
				<view class="card-title">项目管理</view>
				<view class="management-actions">
					<button class="management-btn" @click="cancelProject" v-if="project.status === 'bidding'">
						<text class="btn-icon">❌</text>
						<text>取消项目</text>
					</button>
					<button class="management-btn" @click="editProject" v-if="project.status === 'bidding'">
						<text class="btn-icon">✏️</text>
						<text>编辑项目</text>
					</button>
					<button class="management-btn" @click="viewBids" v-if="bids.length > 0">
						<text class="btn-icon">👥</text>
						<text>查看全部投标({{ bids.length }})</text>
					</button>
				</view>
			</view>
		</view>
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-view">
			<text>加载中...</text>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="action-bar" v-if="project">
			<!-- 未登录用户 -->
			<template v-if="!userStore.hasLogin">
				<button class="action-btn bid-btn" @click="goToLogin">
					<text class="btn-icon">🔐</text>
					<text class="btn-text">登录后参与</text>
				</button>
			</template>
			
			<!-- 已登录用户 - 项目所有者 -->
			<template v-else-if="isOwner">
				<view class="owner-actions">
					<button class="action-btn manage-btn" @click="viewBids" v-if="bids.length > 0">
						<text class="btn-icon">👥</text>
						<text class="btn-text">项目管理中</text>
					</button>
					<button class="action-btn cancel-btn" @click="cancelProject" v-if="project.status === 'bidding'">
						<text class="btn-icon">❌</text>
						<text class="btn-text">取消项目</text>
					</button>
				</view>
			</template>
			
			<!-- 已登录用户 - 访客 -->
			<template v-else>
				<view class="visitor-actions">
					<button class="action-btn contact-btn-main" @click="handleContact">
						<text class="btn-icon">💬</text>
						<text class="btn-text">去沟通</text>
					</button>
					<button class="action-btn bid-btn" @click="openBidPopup" v-if="!hasBid && (project.status === 'bidding' || project.status === 0)">
						<text class="btn-icon">📝</text>
						<text class="btn-text">去投标</text>
					</button>
					<view v-if="hasBid" class="action-text">
						<text class="btn-icon">✅</text>
						<text>您已投标</text>
					</view>
				</view>
			</template>
		</view>

		<!-- 投标弹窗 -->
		<view v-if="showBidPopup" class="popup-mask" @click="closeBidPopup">
			 <scroll-view 
			    class="popup-scroll" 
			    scroll-y="true"
			    @click.stop
			  >
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">提交您的投标方案</text>
					<text class="close-icon" @click="closeBidPopup">×</text>
				</view>
				<view class="popup-body">
					<view class="form-item">
						<text class="form-label">投标报价 (RMB元)</text>
						<input class="form-input" type="number" v-model="bidForm.price" placeholder="请输入您的报价"/>
					</view>
					<view class="form-item">
						<text class="form-label">预计交付日期</text>
						<!-- <input class="form-input" type="number" v-model="bidForm.delivery_days" placeholder="请输入天数"/> -->
						 <picker 
            mode="date" 
            :value="bidForm.delivery_days" 
            :start="minDate" 
            @change="onDateChange"
          >
            <view class="form-input date-input">
              {{ bidForm.delivery_days || '请选择交付日期' }}
              <text class="date-arrow">▼</text>
            </view>
          </picker>
					</view>
					<view class="form-item">
						<text class="form-label">方案描述</text>
						<textarea class="form-textarea" v-model="bidForm.description" ></textarea>
					</view>
					
					<!-- 图片上传区域 -->
					<view class="form-item">
						<text class="form-label">图片附件 (最多5张)</text>
						<view class="upload-area">
							<view 
								v-for="(img, index) in bidForm.images" 
								:key="'img_'+index" 
								class="file-item image-item"
							>
								<image :src="img.url" class="uploaded-image" mode="aspectFill" />
								<view class="delete-btn" @click="removeImage(index)">×</view>
							</view>
							<view v-if="bidForm.images.length < 5" class="upload-btn" @click="chooseImage">
								<text class="upload-icon">+</text>
								<text>上传图片</text>
							</view>
						</view>
					</view>
					
					<!-- PDF文档上传区域 -->
					<view class="form-item">
						<text class="form-label">PDF文档 (最多3个)</text>
						<view class="upload-area">
							<view 
								v-for="(doc, index) in bidForm.documents" 
								:key="'doc_'+index" 
								class="file-item doc-item"
							>
								<text class="file-name">{{ doc.name }}</text>
								<view class="delete-btn" @click="removeDocument(index)">×</view>
							</view>
							<view v-if="bidForm.documents.length < 3" class="upload-btn" @click="chooseDocument">
								<text class="upload-icon">+</text>
								<text>上传PDF</text>
							</view>
						</view>
					</view>

					<!-- 视频上传区域 -->
					<view class="form-item">
						<text class="form-label">视频附件 (最多1个)</text>
						<view class="upload-area">
							<view v-if="bidForm.video" class="file-item video-item">
								<video :src="bidForm.video.url" class="uploaded-video" controls></video>
								<view class="delete-btn" @click="removeVideo">×</view>
							</view>
							<view v-if="!bidForm.video" class="upload-btn" @click="chooseVideo">
								<text class="upload-icon">+</text>
								<text>上传视频</text>
							</view>
						</view>
					</view>
					
					<button class="submit-bid-btn" @click="submitBid">确认提交</button>
				</view>
			   </view>
			</scroll-view>
		</view>
	</view>
</template>
<script setup>
import { ref, computed ,onMounted} from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useProjectStore } from '../../store/project.js'
import { useUserStore } from '../../store/user.js'
import { useMessageStore } from '../../store/message.js'
import { uploadImage, uploadPdf, uploadMultiple, uploadFilesSequentially, uploadVideo } from '../../api/upload.js'
const projectStore = useProjectStore()
const userStore = useUserStore() 
const messageStore = useMessageStore()
const projectId = ref(null)
const project = ref(null)
const bids = ref([])
const loading = ref(true)
const showBidPopup = ref(false)
const bidForm = ref({
	price: 0,
	delivery_days:'',
	description: '',
	images: [], // 图片附件列表 [{url: '...', name: '...'}]
	documents: [], // PDF文档列表 [{url: '...', name: '...'}]
	video: null
})

onLoad((options) => {
	projectId.value = options.id
	loadData()
})
const isOwner = computed(() => userStore.userInfo?.id == project.value?.publisher.id)
const hasBid = computed(() => bids.value.some(bid => bid.bidder.id == userStore.userInfo?.id))
const canBid = computed(() => project.value && (project.value.status === 'bidding' || project.value.status === 0) && !isOwner.value && !hasBid.value)
const formattedDeadline = computed(() => {
	if (!project.value?.deadline) return 'N/A'
	return project.value.deadline.split('T')[0]
})

const onDateChange = (e) => {
  bidForm.value.delivery_days = e.detail.value
}

const loadData = async () => {
	loading.value = true
	try {
		// 先加载项目详情
		const projRes = await projectStore.getProjectDetail(projectId.value)
		project.value = projRes
		console.log("这项目详情里有什么？",project.value)
		
		// 如果项目存在，再尝试加载投标列表
		if (projRes && projRes.id) {
			try {
				// 检查是否有getBidList方法，如果没有则使用模拟数据
				if (typeof projectStore.getBidList === 'function') {
					const bidsRes = await projectStore.getBidList(projectId.value)
					bids.value = bidsRes.list || bidsRes || []
				} else {
					// 使用模拟投标数据
					bids.value = []
				}
			} catch (bidError) {
				console.warn('加载投标列表失败，使用空列表:', bidError)
				bids.value = []
			}
		}
	} catch (error) {
		console.error('加载详情失败:', error)
		uni.showToast({ title: '加载失败', icon: 'none' })
	} finally {
		loading.value = false
	}
}


// 新增：用于存储解析后的附件
const projectAttachments = computed(() => {
  const attachments = { images: [], pdfs: [], videos: [] };
  if (!project.value || !project.value.attachments) {
    return attachments;
  }

  let attachmentUrls = [];
  if (typeof project.value.attachments === 'string') {
      attachmentUrls = project.value.attachments.split(',').map(url => url.trim()).filter(url => url);
  } else if (Array.isArray(project.value.attachments)) {
      attachmentUrls = project.value.attachments;
  } else {
      console.warn('project.attachments 格式不支持:', project.value.attachments);
      return attachments;
  }

  attachmentUrls.forEach(url => {
    if (typeof url === 'string') {
      const lowerUrl = url.toLowerCase();
      const fileName = url.substring(url.lastIndexOf('/') + 1);

      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => lowerUrl.endsWith(ext))) {
        attachments.images.push({ url });
      } else if (lowerUrl.endsWith('.pdf')) {
        attachments.pdfs.push({ url, name: fileName || '未命名.pdf' });
      } else if (['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv'].some(ext => lowerUrl.endsWith(ext))) {
        attachments.videos.push({ url, name: fileName || '未命名视频' });
      }
    }
  });

  return attachments;
});



// 新增：预览图片
const previewImage = (index) => {
  const urls = projectAttachments.value.images.map(img => img.url);
  if (urls.length > 0) {
    uni.previewImage({
      urls: urls,
      current: index
    });
  }
};

// 新增：下载 PDF (主要针对 App 端)
const downloadPdf = (pdfItem) => {
  // #ifdef APP-PLUS
  if (typeof plus === 'undefined' || !plus.downloader) {
    uni.showToast({ title: '下载功能不可用', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '正在下载...' });

  // 创建下载任务
  const dtask = plus.downloader.createDownload(pdfItem.url, { filename: "_doc/downloads/" }, (d, status) => {
    uni.hideLoading();
    if (status === 200) {
      console.log("下载成功: " + d.filename);
      uni.showToast({ title: '下载成功', icon: 'success' });
      // 询问是否打开
      uni.showModal({
        title: '下载完成',
        content: `文件已保存至: ${d.filename}. 是否尝试打开?`,
        success: function (res) {
          if (res.confirm) {
            // 尝试打开文件
            plus.runtime.openFile(d.filename, {}, (e) => {
              console.error("打开文件失败:", e);
              uni.showToast({ title: '打开文件失败', icon: 'none' });
            });
          }
        }
      });
    } else {
      console.error("下载失败: " + status);
      uni.showToast({ title: '下载失败', icon: 'none' });
    }
  });

  // 启动下载
  dtask.start();

  // 可选：监听下载进度
  dtask.addEventListener("statechanged", (download, status) => {
    // if (download.downloadedSize && download.totalSize) {
    //   const progress = (download.downloadedSize / download.totalSize) * 100;
    //   console.log(`下载进度: ${progress.toFixed(2)}%`);
    //   // 可以在这里更新进度条UI
    // }
  });
  // #endif

  // #ifndef APP-PLUS
  // 如果在非 App 环境（理论上不会发生，但以防万一）
  uni.showToast({ title: '请在App中下载文件', icon: 'none' });
  // 或者尝试在浏览器中打开链接
  // window.open(pdfItem.url);
  // #endif
};


const openBidPopup = () => {
	console.log('点击去投标按钮');
	console.log('项目状态:', project.value.status);
	console.log('是否为项目所有者:', isOwner.value);
	console.log('是否已投标:', hasBid.value);
	console.log('canBid计算值:', canBid.value);
	
	if (!canBid.value) {
		if (hasBid.value) {
			console.log('原因: 用户已投标');
			uni.showToast({ title: '您已经投过标了', icon: 'none' });
		} else if (project.value.status !== 'bidding' && project.value.status !== 0) {
			console.log('原因: 项目状态不是招标中，当前状态:', project.value.status);
			uni.showToast({ title: '项目已不在招标中', icon: 'none' });
		} else if (isOwner.value) {
			console.log('原因: 用户是项目所有者');
			uni.showToast({ title: '不能给自己的项目投标', icon: 'none' });
		} else {
			console.log('原因: 其他未知原因');
			uni.showToast({ title: '无法投标', icon: 'none' });
		}
		return;
	}
	
	console.log('打开投标弹窗');
	showBidPopup.value = true;
}
const closeBidPopup = () => {
	showBidPopup.value = false
	// 重置表单
	bidForm.value = {
		price: 0,
		delivery_days: 1,
		description: '',
		images: [],
		documents: [],
		video: null
	}
}

// 选择图片
const chooseImage = () => {
	const maxCount = 5 - bidForm.value.images.length;
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
							bidForm.value.images.push({
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

// 移除图片
const removeImage = (index) => {
	bidForm.value.images.splice(index, 1);
};

// 选择PDF文档
const chooseDocument = () => {
	const maxCount = 3 - bidForm.value.documents.length;
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
			bidForm.value.documents.push({
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
		uni.showToast({ title: '上传失败', icon: 'none' });
	}
};

// 移除文档
const removeDocument = (index) => {
	bidForm.value.documents.splice(index, 1);
};

// 选择视频
const chooseVideo = () => {
	if (bidForm.value.video) {
		uni.showToast({ title: '最多上传1个视频', icon: 'none' });
		return;
	}

	uni.chooseVideo({
		sourceType: ['album', 'camera'],
		compressed: true,
		success: async (res) => {
			try {
				uni.showLoading({ title: '上传中...' });
				const tempFilePath = res.tempFilePath;
				const fileName = tempFilePath.substring(tempFilePath.lastIndexOf('/') + 1);

				// 使用重试机制上传视频
				const result = await uploadVideoWithRetry(tempFilePath, fileName);

				if (result && result.url) {
					bidForm.value.video = {
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
		}
	});
};

// 移除视频
const removeVideo = () => {
  bidForm.value.video = null;
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

// 预览附件视频
const previewAttachmentVideo = (videoUrl, videoName = '视频') => {
	if (!videoUrl) {
		uni.showToast({ title: '视频不存在', icon: 'none' });
		return;
	}
	
	// 直接跳转到视频播放页面（适配Android APP）
	uni.navigateTo({
		url: `/pages/common/video-player?url=${encodeURIComponent(videoUrl)}&name=${encodeURIComponent(videoName)}`
	});
};


const submitBid = async () => {
	console.log('提交投标表单:', bidForm.value);
	
	// 表单验证
	if (!bidForm.value.price || !bidForm.value.delivery_days || !bidForm.value.description) {
		console.log('表单验证失败: 信息不完整');
		uni.showToast({ title: '请填写完整信息', icon: 'none' })
		return
	}
	
	try {
		console.log('开始提交投标, 项目ID:', projectId.value);
		
		// 收集所有附件URL
		const attachments = [
			...bidForm.value.images.map(img => img.url),
			...bidForm.value.documents.map(doc => doc.url)
		];
		if (bidForm.value.video && bidForm.value.video.url) {
			attachments.push(bidForm.value.video.url);
		}
		
		const bidData = {
			price: Number(bidForm.value.price),
			delivery_days: bidForm.value.delivery_days,
			description: bidForm.value.description,
			attachments: attachments // 添加附件URL数组
		};
		console.log('投标数据:', bidData);
		
		await projectStore.submitBid(projectId.value, bidData);
		console.log('投标提交成功');
		uni.showToast({ title: '投标成功', icon: 'success' })
		closeBidPopup()
		loadData() // 重新加载数据
	} catch (error) {
		console.error('投标失败:', error)
		uni.showToast({ title: '投标失败', icon: 'none' })
	}
}
const handleSelectBid = async (bidId) => {
	console.log('选择投标方案，投标ID:', bidId);
	
	if (!bidId) {
		console.error('投标ID无效:', bidId);
		uni.showToast({ title: '无效的投标ID', icon: 'none' });
		return;
	}
	
	const res = await uni.showModal({
		title: '确认选择',
		content: '确定选择该投标方案吗？此操作不可撤销。'
	})
	
	if (res.confirm) {
		try {
			console.log('确认选择投标，项目ID:', projectId.value, '投标ID:', bidId);
			// 传递两个参数：项目ID和投标ID
			await projectStore.selectBid(projectId.value, bidId);
			uni.showToast({ title: '选择成功', icon: 'success' });
			loadData();
		} catch (error) {
			console.error('选择投标失败:', error);
			uni.showToast({ title: '操作失败', icon: 'none' });
		}
	}
}

const handleContact = async () => {
	if (!userStore.hasLogin) {
		goToLogin();
		return;
	}
	// 不能和自己聊天
	if (isOwner.value) {
		uni.showToast({ title: '不能和自己发起沟通', icon: 'none' });
		return;
	}
	try {
		uni.showLoading({ title: '正在创建会话...' });
		
		// 创建或获取聊天会话
		const chatData = await messageStore.createChat(project.value.publisher.id, {
			projectId: Number(projectId.value),
			projectTitle: project.value.title
		});
		
		uni.hideLoading();
		
		// 跳转到聊天页面
		uni.navigateTo({
			url: `/pages/messages/chat?chatId=${chatData.id}&targetUserId=${project.value.publisher.id}&targetUserName=${project.value.publisher.username}&projectId=${projectId.value}`
		});
	} catch (error) {
		uni.hideLoading();
		uni.showToast({ title: '无法发起沟通', icon: 'none' });
		console.error('创建会话失败:', error);
	}
}
const cancelProject = async () => {
	const res = await uni.showModal({
		title: '确认取消',
		content: '确定要取消这个项目吗？此操作不可撤销。'
	});
	if (res.confirm) {
		try {
			uni.showLoading({ title: '正在取消...' });
			await projectStore.cancelProject(projectId.value);
			uni.hideLoading();
			uni.showToast({ title: '项目已取消', icon: 'success' });
			// 返回上一页或首页
			uni.navigateBack();
		} catch (error) {
			uni.hideLoading();
			uni.showToast({ title: '取消失败', icon: 'none' });
			console.error('取消项目失败:', error);
		}
	}
}

const editProject = () => {
	uni.navigateTo({
		url: `/pages/projects/publish?id=${projectId.value}&edit=true`
	});
}

const viewBids = () => {
	uni.navigateTo({
		url: `/pages/user/projects?id=${projectId.value}&view=bids`
	});
}

const contactUser = (userId) => {
	if (!userId) return;
	
	uni.navigateTo({
		url: `/pages/messages/chat?targetUserId=${userId}`
	});
}

const goToLogin = () => {
	uni.navigateTo({ url: '/pages/login/index' });
}

// 跳转到用户主页
const goToUserProfile = (userId) => {
	if (!userId) {
		uni.showToast({ title: '用户ID不存在', icon: 'none' });
		return;
	}
	uni.navigateTo({ url: `/pages/user/profile?id=${userId}` });
}

</script>
<style scoped>
.detail-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8, #8b5cf6);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
	padding: 30rpx;
	padding-bottom: 150rpx; /* 为底部操作栏留出空间 */
}
@keyframes gradient {
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
}
.card-glass {
	background: rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 24rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	color: #fff;
}
.project-title {
	font-size: 40rpx;
	font-weight: bold;
	margin-bottom: 30rpx;
}
.info-grid {
	display: flex;
	justify-content: space-between;
	margin-bottom: 30rpx;
}
.info-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.info-label {
	font-size: 26rpx;
	opacity: 0.8;
	margin-bottom: 10rpx;
}
.info-value {
	font-size: 32rpx;
	font-weight: 500;
}
.info-value.price {
	color: #FFD700;
}
.deadline-info {
	display: flex;
	align-items: center;
	font-size: 26rpx;
	opacity: 0.8;
	border-top: 1px solid rgba(255, 255, 255, 0.2);
	padding-top: 20rpx;
}
.icon {
	width: 32rpx;
	height: 32rpx;
	margin-right: 15rpx;
}
.card-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}
.description-text {
	font-size: 28rpx;
	line-height: 1.7;
	opacity: 0.9;
}
.publisher-info {
	display: flex;
	align-items: center;
}
.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	margin-right: 20rpx;
}
.publisher-details {
	flex: 1;
}
.username {
	font-size: 32rpx;
	font-weight: 500;
}
.rating-line {
	font-size: 24rpx;
	opacity: 0.8;
}
.contact-btn {
	background: rgba(255, 255, 255, 0.2);
	color: #fff;
	border-radius: 30rpx;
	padding: 0 30rpx;
	font-size: 26rpx;
}
.empty-bids {
	text-align: center;
	padding: 40rpx 0;
	opacity: 0.7;
}
.loading-view {
	text-align: center;
	padding: 50rpx;
	color: #fff;
}
.action-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 120rpx;
	background: rgba(0, 0, 0, 0.3);
	backdrop-filter: blur(10px);
	padding: 0 30rpx;
	box-sizing: border-box;
}
.action-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 40rpx;
	color: #fff;
	font-size: 32rpx;
	font-weight: bold;
	margin: 0 10rpx;
}
.visitor-actions, .owner-actions {
	display: flex;
	flex: 1;
	justify-content: center;
	gap: 20rpx;
}
.contact-btn-main {
	background: linear-gradient(135deg, #3498db, #2980b9);
}
.bid-btn {
	background: linear-gradient(135deg, #FFD700, #FFA500);
}
.bid-btn[disabled] {
	background: linear-gradient(135deg, #cccccc, #999999);
	opacity: 0.7;
}
.cancel-btn {
	background: linear-gradient(135deg, #FF6B6B, #FF4757);
}
.manage-btn {
	background: linear-gradient(135deg, #8e44ad, #9b59b6);
}
.action-text {
	font-size: 30rpx;
	color: #fff;
	opacity: 0.8;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 投标列表样式 */
.bids-list {
	margin-top: 20rpx;
}
.bid-item {
	background: rgba(255, 255, 255, 0.1);
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}
.bidder-info {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;
}
.bidder-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	margin-right: 15rpx;
}
.bidder-details {
	flex: 1;
}
.bidder-name {
	font-size: 28rpx;
	font-weight: 500;
}
.bidder-rating {
	font-size: 24rpx;
	opacity: 0.8;
}
.bid-price {
	font-size: 36rpx;
	font-weight: bold;
	color: #FFD700;
}
.bid-delivery {
	font-size: 26rpx;
	margin-bottom: 10rpx;
}
.bid-description {
	font-size: 26rpx;
	line-height: 1.5;
	margin-bottom: 15rpx;
	padding: 15rpx;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 10rpx;
}
.bid-time {
	font-size: 24rpx;
	opacity: 0.7;
	margin-bottom: 15rpx;
}
.bid-actions {
	display: flex;
	justify-content: space-between;
	gap: 15rpx;
}
.select-bid-btn, .contact-bidder-btn {
	flex: 1;
	height: 70rpx;
	line-height: 70rpx;
	border-radius: 35rpx;
	font-size: 26rpx;
	text-align: center;
}
.select-bid-btn {
	background: linear-gradient(135deg, #4CAF50, #2E7D32);
	color: #fff;
}
.contact-bidder-btn {
	background: rgba(255, 255, 255, 0.2);
	color: #fff;
}

/* 项目管理样式 */
.management-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}
.management-btn {
	flex: 1;
	min-width: 200rpx;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 40rpx;
	background: rgba(255, 255, 255, 0.2);
	color: #fff;
	font-size: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.btn-icon {
	margin-right: 10rpx;
}
/* 弹窗样式 */
.popup-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	z-index: 1000;
}
.popup-content {
	width: 100%;
	background: #00a5f7; /* 更亮的背景色 */
	color: #fff;
	border-top-left-radius: 30rpx;
	border-top-right-radius: 30rpx;
	padding: 30rpx;
	animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}
.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}
.popup-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #ffffff; /* 确保标题颜色鲜明 */
}
.close-icon {
	font-size: 40rpx;
	opacity: 0.7;
}
.form-item {
	margin-bottom: 30rpx;
	
}
.form-label {
	font-size: 28rpx;
	margin-bottom: 15rpx;
	display: block;
}

.form-input, .form-textarea {
	width: 100%;
	background: rgba(255, 255, 255, 0.25); /* 更亮的输入框背景 */
	border-radius: 16rpx;
	padding: 20rpx;
	 min-height: 80rpx; /* 你可以根据需要调整这个值，比如 80rpx, 90rpx 等 */
	color: #fff;
	font-size: 36rpx; /* 更大的字体 */
	font-weight: 500; /* 更粗的字体 */
	box-sizing: border-box;
	border: 1px solid rgba(255, 255, 255, 0.4); /* 添加更明显的边框 */
	text-align: left; /* 确保文本左对齐 */
	min-width: 0; /* 防止内容溢出 */
}

/* 专门为数字输入框添加样式 */
input[type="number"].form-input {
	font-size: 40rpx; /* 数字更大 */
	letter-spacing: 1px; /* 字符间距增加 */
	padding-left: 30rpx; /* 左侧填充增加 */
}
.form-textarea {
	height: 200rpx;
	line-height: 1.5;
}



/* 附件上传区域样式 */
.upload-area {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
	margin-top: 10rpx;
}

.file-item {
	position: relative;
	border-radius: 12rpx;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.2);
}

.image-item {
	width: 160rpx;
	height: 160rpx;
}

.doc-item {
	padding: 20rpx;
	display: flex;
	align-items: center;
	min-width: 200rpx;
}

.uploaded-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.file-name {
	font-size: 24rpx;
	color: #fff;
	max-width: 180rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.delete-btn {
	position: absolute;
	top: 0;
	right: 0;
	width: 40rpx;
	height: 40rpx;
	background: rgba(0, 0, 0, 0.5);
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	z-index: 2;
}

.upload-btn {
	width: 160rpx;
	height: 160rpx;
	border: 2rpx dashed rgba(255, 255, 255, 0.5);
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: rgba(255, 255, 255, 0.8);
}

.upload-icon {
	font-size: 48rpx;
	margin-bottom: 10rpx;
}

.submit-bid-btn {
	height: 90rpx;
	line-height: 90rpx;
	border-radius: 45rpx;
	background: linear-gradient(135deg, #FF9800, #F57C00); /* 使用更深的橙色系渐变 */
	color: #fff;
	font-size: 34rpx;
	font-weight: bold;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3); /* 增强阴影效果 */
	margin-top: 20rpx; /* 增加与上方内容的间距 */
}

.video-item {
	width: 160rpx;
	height: 160rpx;
}

.uploaded-video {
	width: 100%;
	height: 100%;
	object-fit: cover;
}







/* 🎯 新增：附件展示区域样式 */
.attachments-section {
  margin-bottom: 30rpx;
}

.attachments-section:last-child {
  margin-bottom: 0;
}

.section-subtitle {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: rgba(255, 255, 255, 0.9);
  padding-bottom: 10rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 图片附件 */
.image-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx; /* 图片之间的间距 */
}

.image-attachment-item {
  width: 150rpx; /* 缩略图宽度 */
  height: 150rpx; /* 缩略图高度 */
  border-radius: 12rpx;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1); /* 背景 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.attachment-image-thumb {
  width: 100%;
  height: 100%;
  /* aspect-fill 会裁剪，aspect-fit 会留白，根据需要选择 */
  /* mode="aspectFill" 在模板中已设置 */
}

.image-attachment-item::after { /* 添加一个放大镜图标或遮罩效果（可选） */
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2); /* 轻微暗色遮罩 */
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-attachment-item:active::after {
  opacity: 1;
}

/* PDF 附件 */
.pdf-attachments {
  display: flex;
  flex-direction: column;
  gap: 20rpx; /* 文档项之间的间距 */
}

.pdf-attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.pdf-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pdf-name {
  font-size: 28rpx;
  color: #fff;
  margin-bottom: 5rpx;
  word-break: break-all; /* 长文件名换行 */
}

.pdf-size {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.download-btn {
  min-width: 120rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #8e44ad, #9b59b6); /* 紫色系按钮 */
  color: #fff;
  font-size: 24rpx;
  padding: 0 20rpx;
  margin-left: 20rpx; /* 与文件名的间距 */
  white-space: nowrap;
  border: none;
}

/* 视频附件样式 */
.video-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.video-attachment-item {
  width: 100%; /* 视频通常较宽，占满一行 */
  max-width: 500rpx; /* 最大宽度 */
  border-radius: 12rpx;
  overflow: hidden;
  background: #000;
}

.attachment-video {
  width: 100%;
}

/* 视频附件预览样式 */
.video-attachment-preview {
  position: relative;
  width: 100%;
  height: 300rpx;
  border-radius: 10rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.video-attachment-preview .video-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
}

.video-attachment-preview .video-icon {
  font-size: 80rpx;
  opacity: 0.8;
}

.video-attachment-preview .video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-attachment-preview .play-triangle {
  width: 0;
  height: 0;
  border-left: 25rpx solid #fff;
  border-top: 15rpx solid transparent;
  border-bottom: 15rpx solid transparent;
  margin-left: 5rpx;
}

.video-attachment-preview .video-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 30rpx 15rpx 15rpx;
}

.video-attachment-preview .video-name {
  color: #fff;
  font-size: 24rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-attachment-preview:active {
  opacity: 0.8;
  transform: scale(0.98);
}
/* 🎯 新增结束 */
/* 或者单独为 textarea 设置 */

/* 日期选择器样式 */
.date-input {
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
}

.date-arrow {
	color: rgba(255, 255, 255, 0.6);
	font-size: 24rpx;
	margin-left: 16rpx;
}

.date-input:active {
	background: rgba(255, 255, 255, 0.15);
}

/* 关键：给 scroll-view 固定高度，并允许滚动 */
.popup-scroll {
  width: 100%;
  max-height: 80vh; /* 防止过高 */
  overflow: hidden; /* 配合 scroll-view */
}

.popup-content {
  background: #00a5f7;
  color: #fff;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 30rpx;
  min-height: 200rpx; /* 防止内容太少时无法滚动 */
}

</style>