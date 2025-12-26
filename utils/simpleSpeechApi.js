// 封装一个更简单的语音识别API
const API_URL = "https://5555api.com/data/api/fetchTextByVoice";
const API_KEY = "255fc6ae-f6d0-4809-aea1-29b857a097ac"; // 使用您提供的API Key

/**
 * 使用简单API识别语音文件
 * @param {string} filePath - 音频文件的临时路径
 * @returns {Promise<string>} - A promise that resolves with the recognized text.
 */
export function recognizeSimple(filePath) {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: API_URL,
			filePath: filePath,
			name: 'audio', // API要求的字段名
			formData: {
				apikey: API_KEY
			},
			success: (uploadRes) => {
				console.log('Upload successful:', uploadRes);
				if (uploadRes.statusCode === 200) {
					try {
						const data = JSON.parse(uploadRes.data);
						// 根据API返回的实际数据结构调整
						if (data.code === 200 && data.data && typeof data.data.partial !== 'undefined') {
							resolve(data.data.partial);
						} else {
							const errorMessage = data.message || 'API returned an error';
							console.error('API Error:', errorMessage);
							reject(new Error(errorMessage));
						}
					} catch (e) {
						console.error('JSON Parse Error:', e);
						reject(new Error('Failed to parse API response.'));
					}
				} else {
					console.error('Upload failed with status:', uploadRes.statusCode);
					reject(new Error(`Upload failed with status: ${uploadRes.statusCode}`));
				}
			},
			fail: (err) => {
				console.error('Upload request failed:', err);
				reject(new Error('Failed to send request to recognition server.'));
			}
		});
	});
}