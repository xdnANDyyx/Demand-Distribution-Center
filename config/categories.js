/**
 * 项目分类数据
 */
export const projectCategories = [
  // 1. 工业标单需求（已存在）
  {
    id: 1,
    name: '工业标单需求',
    icon: '/static/icons/industry.png',
    subCategories: [ 
      {
        id: 101,
        name: '机械加工',
        children: [
          { id: 10101, name: '零件' },
          { id: 10102, name: '数控加工' },
          { id: 10103, name: '电加工' },
		  { id: 10104, name: '普通机床' },
		  { id: 10105, name: '非标产品' }
        ]
      },
      {
        id: 102,
        name: '模具检具',
        children: [
          { id: 10201, name: '冲压模具' },
          { id: 10202, name: '注塑模具' },
          { id: 10203, name: '工装检具' },
		  { id: 10204, name: '橡胶模具' },
		  { id: 10205, name: '压制模具' }
        ]
      },
      {
        id: 103,
        name: '自动化',
        children: [
          { id: 10301, name: '机械与自动化设备' },
          { id: 10302, name: '机器人技术' },
          { id: 10303, name: '电子与电器工程' },
		  { id: 10304, name: '自动化控制系统' }
        ]
      },
	  {
	    id: 104,
	    name: '机床设备',
	    children: [
	      { id: 10401, name: '数控机床' },
	      { id: 10402, name: '普通机床' },
	    
	    ]
	  },
	  {
	    id: 105,
	    name: '设计检测',
	    children: [
	      { id: 10501, name: '产品设计' },
	      { id: 10502, name: '3D扫描' },
	      { id: 10503, name: '制图' },
		  { id: 10504, name: '测绘' }
	    ]
	  },
	  {
	    id: 106,
	    name: '五金配件',
	    children: [
	      { id: 10601, name: '模具标准件' },
	      { id: 10602, name: '工具' },
	      { id: 10603, name: '测量工具' }
	    ]
	  },
	  
	  {
	    id: 107,
	    name: '工业耗材',
	    children: [
	      { id: 10701, name: '材料' },
	      { id: 10702, name: '刀具' },
	      { id: 10703, name: '劳保' },
		  { id: 10704, name: '其它' }
	    ]
	  }
    ]
  },
  
  // 2. 餐饮美食需求
  {
    id: 2,
    name: '餐饮美食需求',
    icon: '/static/icons/Restaurant.png',
    subCategories: [
      {
        id: 201,
        name: '中餐馆',
        children: [
          { id: 20101, name: '火锅' },
          { id: 20102, name: '烤串烧烤' },
          { id: 20103, name: '家常餐馆' },
          { id: 20104, name: '回民餐馆' },
          { id: 20105, name: '自助餐' }
        ]
      },
      {
        id: 202,
        name: '地方菜',
        children: [
          { id: 20201, name: '东北菜' },
          { id: 20202, name: '粤菜' },
          { id: 20203, name: '湘菜' },
          { id: 20204, name: '苏帮菜' },
          { id: 20205, name: '川菜' },
          { id: 20206, name: '鲁菜' },
          { id: 20207, name: '闽菜' },
          { id: 20208, name: '徽菜' }
        ]
      },
      {
        id: 203,
        name: '外国餐厅',
        children: [
          { id: 20301, name: '西餐厅' },
          { id: 20302, name: '韩餐厅' },
          { id: 20303, name: '日餐厅' },
          { id: 20304, name: '南洋餐馆' },
          { id: 20305, name: '印度餐' },
          { id: 20306, name: '中东餐厅' }
        ]
      }
    ]
  },
  
  // 3. 休闲娱乐需求
  {
    id: 3,
    name: '休闲娱乐需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 301,
        name: '洗浴按摩',
        children: [
          { id: 30101, name: '温泉洗浴' },
          { id: 30102, name: '按摩足疗' },
          { id: 30103, name: '养生' }
        ]
      },
      {
        id: 302,
        name: 'KTV酒吧',
        children: [
          { id: 30201, name: 'KTV' },
          { id: 30202, name: '酒吧' }
        ]
      },
      {
        id: 303,
        name: '体育场馆',
        children: [
          { id: 30301, name: '健身房' },
          { id: 30302, name: '羽毛球馆' },
          { id: 30303, name: '游泳馆' },
          { id: 30304, name: '场地需求' }
        ]
      },
      {
        id: 304,
        name: '影院演出',
        children: [
          { id: 30401, name: '电影院' },
          { id: 30402, name: '演唱会' },
          { id: 30403, name: '演出' }
        ]
      },
      {
        id: 305,
        name: '景区门票',
        children: [
          { id: 30501, name: '景区门票' }
        ]
      }
    ]
  },
  
  // 4. 手机需求
  {
    id: 4,
    name: '手机需求',
    icon: '/static/icons/phone.png',
    subCategories: [
      {
        id: 401,
        name: '手机电脑',
        children: [
          { id: 40101, name: '小米' },
          { id: 40102, name: '华为' },
          { id: 40103, name: '苹果' },
          { id: 40104, name: 'OPPO' },
          { id: 40105, name: 'vivo' },
          { id: 40106, name: '三星' },
          { id: 40107, name: '其他' }
        ]
      },
      {
        id: 402,
        name: '电脑需求',
        children: [
          { id: 40201, name: '平板' },
          { id: 40202, name: '台式机' },
          { id: 40203, name: '笔记本' }
        ]
      }
    ]
  },
  
  // 5. 家电需求
  {
    id: 5,
    name: '家电需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 501,
        name: '电视',
        children: [
          { id: 50101, name: '索尼' },
          { id: 50102, name: '三星' },
          { id: 50103, name: '小米' },
          { id: 50104, name: '华为' },
          { id: 50105, name: 'TCL' },
          { id: 50106, name: '海尔' },
          { id: 50107, name: '长虹' },
          { id: 50108, name: '海信' },
          { id: 50109, name: '其他品牌' }
        ]
      },
      {
        id: 502,
        name: '冰箱',
        children: [
          { id: 50201, name: '三星' },
          { id: 50202, name: '海尔' },
          { id: 50203, name: '小米' },
          { id: 50204, name: '美菱' },
          { id: 50205, name: '奥克斯' },
          { id: 50206, name: '卡萨帝' },
          { id: 50207, name: '美的' },
          { id: 50208, name: '其他品牌' }
        ]
      },
      {
        id: 503,
        name: '洗衣机',
        children: [
          { id: 50301, name: '三星' },
          { id: 50302, name: '海尔' },
          { id: 50303, name: '小米' },
          { id: 50304, name: '小天鹅' },
          { id: 50305, name: '西门子' },
          { id: 50306, name: '美的' },
          { id: 50307, name: 'LG' },
          { id: 50308, name: '其他品牌' }
        ]
      },
      {
        id: 504,
        name: '空调',
        children: [
          { id: 50401, name: '三星' },
          { id: 50402, name: '海尔' },
          { id: 50403, name: '小米' },
          { id: 50404, name: '格力' },
          { id: 50405, name: '美的' },
          { id: 50406, name: 'LG' },
          { id: 50407, name: '大金' },
          { id: 50408, name: 'TCL' },
          { id: 50409, name: '其他品牌' }
        ]
      },
      {
        id: 505,
        name: '热水器',
        children: [
          { id: 50501, name: '海尔' },
          { id: 50502, name: '美的' },
          { id: 50503, name: '卡萨帝' },
          { id: 50504, name: 'AO史密斯' },
          { id: 50505, name: '万家乐' },
          { id: 50506, name: '其他品牌' }
        ]
      },
      {
        id: 506,
        name: '厨房家电',
        children: [
          { id: 50601, name: '电饭煲' },
          { id: 50602, name: '集成灶' },
          { id: 50603, name: '蒸烤箱' },
          { id: 50604, name: '燃气炉具' },
          { id: 50605, name: '空气炸锅' },
          { id: 50606, name: '榨汁机' }
        ]
      },
      {
        id: 507,
        name: '清洁家电',
        children: [
          { id: 50701, name: '智能拖把' },
          { id: 50702, name: '扫地机器人' },
          { id: 50703, name: '吸尘器' },
          { id: 50704, name: '清洗机' }
        ]
      },
      {
        id: 508,
        name: '数码游戏',
        children: [
          { id: 50801, name: '数码相机' },
          { id: 50802, name: 'PS游戏机' },
          { id: 50803, name: 'XBOX游戏机' }
        ]
      }
    ]
  },

  // 6. 家居需求
  {
    id: 6,
    name: '家居需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 601,
        name: '家具',
        children: [
          { id: 60101, name: '床' },
          { id: 60102, name: '橱柜衣柜' },
          { id: 60103, name: '沙发' },
          { id: 60104, name: '茶几' },
          { id: 60105, name: '电视柜' },
          { id: 60106, name: '餐桌座椅' }
        ]
      },
      {
        id: 602,
        name: '家纺',
        children: [
          { id: 60201, name: '床上用品' },
          { id: 60202, name: '窗帘' }
        ]
      },
      {
        id: 603,
        name: '灯具装饰',
        children: [
          { id: 60301, name: '灯具' },
          { id: 60302, name: '家装摆件' },
          { id: 60303, name: '墙上装饰' }
        ]
      },
      {
        id: 604,
        name: '厨卫用品',
        children: [
          { id: 60401, name: '浴室柜' },
          { id: 60402, name: '马桶' },
          { id: 60403, name: '淋浴' }
        ]
      },
      {
        id: 605,
        name: '建材',
        children: [
          { id: 60501, name: '五金' },
          { id: 60502, name: '其他' }
        ]
      },
	  
	  {
	    id: 606,
	    name: '办公家具',
	    children: [
	      { id: 60601, name: '办公座椅' },
	      { id: 60602, name: '其它' }
	    ]
	  }
    ]
  },
  
  // 7. 汽车需求
  {
    id: 7,
    name: '汽车需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 701,
        name: '新能源汽车',
        children: [
          { id: 70101, name: '特斯拉' },
          { id: 70102, name: '小米' },
          { id: 70103, name: '比亚迪' },
          { id: 70104, name: '华为' },
          { id: 70105, name: '理想' },
          { id: 70106, name: '其他' }
        ]
      },
      {
        id: 702,
        name: '燃油车',
        children: [
          { id: 70201, name: '国产燃油车' },
          { id: 70202, name: '德系燃油车' },
          { id: 70203, name: '美系燃油车' },
          { id: 70204, name: '日系燃油车' },
          { id: 70205, name: '其他' }
        ]
      },
      {
        id: 703,
        name: '货运车',
        children: [
          { id: 70301, name: '微型车辆' },
          { id: 70302, name: '小型货车' },
          { id: 70303, name: '中大型货运车辆' }
        ]
      }
    ]
  },
  
  // 8. 房产需求
  {
    id: 8,
    name: '房产需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 801,
        name: '新房',
        children: [
          { id: 80101, name: '商品房' },
          { id: 80102, name: '公寓' },
          { id: 80103, name: '商铺' }
        ]
      },
      {
        id: 802,
        name: '出售二手房',
        children: [
          { id: 80201, name: '商品房' },
          { id: 80202, name: '公寓' },
          { id: 80203, name: '商铺' }
        ]
      },
      {
        id: 803,
        name: '房东出租',
        children: [
          { id: 80301, name: '整租' },
          { id: 80302, name: '合租' },
          { id: 80303, name: '单间' },
          { id: 80304, name: '商铺' }
        ]
      },
      {
        id: 804,
        name: '中介服务',
        children: [
          { id: 80401, name: '过户代办' }
        ]
      },
	  
	  {
	    id: 805,
	    name: '客户租房',
	    children: [
	      { id: 80501, name: '整租' },
	      { id: 80502, name: '合租' },
	      { id: 80503, name: '单间' },
	      { id: 80504, name: '商铺' }
	    ]
	  },
	  
	  {
	    id: 806,
	    name: '需要购买二手房',
	    children: [
	      { id: 80601, name: '商品房' },
	      { id: 80602, name: '公寓' },
	      { id: 80603, name: '商铺' }
	    ]
	  }
    ]
  },
  
  // 9. 服装鞋帽需求
  {
    id: 9,
    name: '服装鞋帽需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 901,
        name: '个性需求',
        children: [
          { id: 90101, name: '男装鞋帽' },
          { id: 90102, name: '女装鞋帽' }
        ]
      },
      {
        id: 902,
        name: '男装需求',
        children: [
          { id: 90201, name: '男装' },
          { id: 90202, name: '男鞋' },
          { id: 90203, name: '帽子饰品' }
        ]
      },
      {
        id: 903,
        name: '女装需求',
        children: [
          { id: 90301, name: '女装' },
          { id: 90302, name: '女鞋' },
          { id: 90303, name: '帽子饰品' }
        ]
      },
      {
        id: 904,
        name: '设计师需求',
        children: [
          { id: 90401, name: '服装' },
          { id: 90402, name: '鞋帽' },
          { id: 90403, name: '饰品' }
        ]
      }
    ]
  },
  
  // 10. 家装装修需求
  {
    id: 10,
    name: '家装装修需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 1001,
        name: '整包装修',
        children: [
          { id: 100101, name: '家装' },
          { id: 100102, name: '商铺装修' }
        ]
      },
      {
        id: 1002,
        name: '分包装修',
        children: [
          { id: 100201, name: '基础装修' },
          { id: 100202, name: '油木工定制' },
          { id: 100203, name: '装修工人' }
        ]
      },
      {
        id: 1003,
        name: '绿化工程',
        children: [
          { id: 100301, name: '基础工程' }
        ]
      }
    ]
  },
  
  // 11. 生活服务需求
  {
    id: 11,
    name: '生活服务需求',
    icon: '/static/icons/live.png',
    subCategories: [
      {
        id: 1101,
        name: '酒店',
        children: [
          { id: 110101, name: '五星酒店' },
          { id: 110102, name: '豪华酒店' },
          { id: 110103, name: '快捷酒店' },
          { id: 110104, name: '民宿' },
          { id: 110105, name: '钟点房' }
        ]
      },
      {
        id: 1102,
        name: '出行',
        children: [
          { id: 110201, name: '机票' },
          { id: 110202, name: '火车票' },
          { id: 110203, name: '货车' },
          { id: 110204, name: '专车' }
        ]
      },
      {
        id: 1103,
        name: '旅游',
        children: [
          { id: 110301, name: '国内游' },
          { id: 110302, name: '国际游' },
          { id: 110303, name: '省内游' }
        ]
      },
      {
        id: 1104,
        name: '保险',
        children: [
          { id: 110401, name: '车险' },
          { id: 110402, name: '寿险' },
          { id: 110403, name: '商业险' }
        ]
      },
      {
        id: 1105,
        name: '教育培训',
        children: [
          { id: 110501, name: '舞蹈培训' },
          { id: 110502, name: '技能培训' },
          
        ]
      },
      {
        id: 1106,
        name: '综合服务',
        children: [
          { id: 110601, name: '母婴' },
          { id: 110602, name: '婚庆' },
          { id: 110603, name: '养老' },
		  { id: 110604, name: '丧葬' },
		  { id: 110605, name: '宠物用品' },
		  { id: 110606, name: '美容美发' },
		  { id: 110607, name: '搬家公司' }
        ]
      }
	  
    ]
  },
  
  // 12. 二手物品需求
  {
    id: 12,
    name: '二手物品需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 1201,
        name: '二手车',
        children: [
          { id: 120101, name: '德系二手车' },
          { id: 120102, name: '美系二手车' },
          { id: 120103, name: '日系二手车' },
          { id: 120104, name: '国产二手车' },
          { id: 120105, name: '其他' }
        ]
      },
      {
        id: 1202,
        name: '二手手机',
        children: [
          { id: 120201, name: '小米' },
          { id: 120202, name: '华为' },
          { id: 120203, name: '苹果' },
          { id: 120204, name: 'OPPO' },
          { id: 120205, name: 'vivo' },
          { id: 120206, name: '三星' },
          { id: 120207, name: '其他' }
        ]
      },
      {
        id: 1203,
        name: '二手电脑',
        children: [
          { id: 120301, name: '笔记本' },
          { id: 120302, name: '台式机' },
          { id: 120303, name: '平板' }
        ]
      },
      {
        id: 1204,
        name: '二手家电',
        children: [
          { id: 120401, name: '电视' },
          { id: 120402, name: '冰箱' },
          { id: 120403, name: '洗衣机' },
          { id: 120404, name: '空调' },
          { id: 120405, name: '热水器' },
          { id: 120406, name: '小家电' },
          { id: 120407, name: '其他' }
        ]
      },
      {
        id: 1205,
        name: '二手家具',
        children: [
          { id: 120501, name: '床' },
          { id: 120502, name: '衣柜' },
          { id: 120503, name: '沙发' },
          { id: 120504, name: '茶几' },
          { id: 120505, name: '电视柜' },
          { id: 120506, name: '其他' }
        ]
      },
      {
        id: 1206,
        name: '二手奢饰品',
        children: [
          { id: 120601, name: '箱包' },
          { id: 120602, name: '饰品' },
          { id: 120603, name: '鞋帽' },
          { id: 120604, name: '服装' }
        ]
      }
    ]
  },
  
  // 13. 人力服务需求
  {
    id: 13,
    name: '人力服务需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 1301,
        name: '企业直聘',
        children: [
          { id: 130101, name: '技术工' },
          { id: 130102, name: '普通工人' },
          { id: 130103, name: '工程师' }
        ]
      },
      {
        id: 1302,
        name: '技工兼职',
        children: [
          { id: 130201, name: '设计' },
          { id: 130202, name: '制图' },
          { id: 130203, name: '技工' },
          { id: 130204, name: '装修工人' },
          { id: 130205, name: '普通人员' }
        ]
      },
      {
        id: 1303,
        name: '服务型人员',
        children: [
          { id: 130301, name: '月嫂' },
          { id: 130302, name: '保姆' },
          { id: 130303, name: '陪护' },
          { id: 130304, name: '管家' }
        ]
      },
      {
        id: 1304,
        name: '设计师',
        children: [
          { id: 130401, name: '服装' },
          { id: 130402, name: '产品' },
          { id: 130403, name: '机械' },
          { id: 130404, name: '珠宝' },
          { id: 130405, name: 'IT' },
          { id: 130406, name: '建筑' }
        ]
      }
    ]
  },
  
  // 14. 医疗就医需求
  {
    id: 14,
    name: '医疗就医需求',
    icon: '/static/icons/Health.png',
    subCategories: [
      {
        id: 1401,
        name: '医疗服务',
        children: [
          { id: 140101, name: '家庭医生' },
          { id: 140102, name: '上门换药' },
          { id: 140103, name: '临床陪护' }
        ]
      },
      {
        id: 1402,
        name: '医疗用品',
        children: [
          { id: 140201, name: '医疗器械' },
          { id: 140202, name: '卫生用品' }
        ]
      },
	  
	  {
	    id: 1403,
	    name: '求诊',
	    children: [
	      { id: 140301, name: '外科' },
	      { id: 140302, name: '内科' },
		  { id: 140303, name: '中医' },
		  { id: 140304, name: '妇产科' },
		  { id: 140305, name: '儿科' },
		  { id: 140306, name: '心脑科' },
		  { id: 140307, name: '牙齿口腔' },
		  { id: 140308, name: '皮肤美容' },
		  { id: 140309, name: '精神科' },
		  
	    ]
	  }
    ]
  },
  
  // 15. 艺术品奢饰品需求
  {
    id: 15,
    name: '艺术品奢饰品需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 1501,
        name: '珠宝腕表',
        children: [
          { id: 150101, name: '珠宝' },
          { id: 150102, name: '腕表' },
        ]
      },
      {
        id: 1502,
        name: '箱包配饰',
        children: [
          { id: 150201, name: '箱包' },
          { id: 150202, name: '配饰' },
          { id: 150203, name: '衣装' },
		  { id: 150204, name: '鞋帽' },
		  { id: 150205, name: '设计师' }
        ]
      },
	  
	  {
	    id: 1503,
	    name: '绘画雕塑类',
	    children: [
	      { id: 150301, name: '西洋画' },
	      { id: 150302, name: '国画' },
	      { id: 150303, name: '书法' },
	  		  { id: 150204, name: '雕塑' },
	  		  
	    ]
	  },
	  
	  {
	    id: 1504,
	    name: '古董类',
	    children: [
	      { id: 150401, name: '瓷器' },
	      { id: 150402, name: '玉器宝石' },
	      { id: 150403, name: '字画' },
	  		  
	    ]
	  },
	  
	  
	  {
	    id: 1505,
	    name: '家居类',
	    children: [
	      { id: 150501, name: '家装摆件' },
	      { id: 150502, name: '家具' },
	     	  
	    ]
	  }
    ]
  },
  
  // 16. 交友相亲需求
  {
    id: 16,
    name: '交友相亲需求',
    icon: '/static/icons/help.png',
    subCategories: [
      {
        id: 1601,
        name: '按性别分',
        children: [
          { id: 160101, name: '男' },
          { id: 160102, name: '女' }
        ]
      }
    ]
  }
];