

declare type T_ARMOR_DB = {
	/** 头盔护甲id */
	id: number;
	/** 枪名称 */
	name: string;
	/** 图标 */
	icon: string;
	/** 消耗钻石 */
	cost: number;
	/** 生命值 */
	energy: number;
}

declare type T_GUN_DB = {
	/** 枪id */
	id: number;
	/** 枪名称 */
	name: string;
	/** 图标 */
	icon: string;
	/** 解锁需要的成就id */
	unlockAid: number;
	/** 解锁描述 */
	unlockStr: string;
	/** 购买消耗钻石 */
	cost: number;
	/** 枪的偏移值 */
	offset: any[];
	/** 子弹类型 */
	bulletType: number;
	/** 子弹速度 */
	bulletSpeed: number;
	/** 子弹贴图主角 */
	bulletIconHero: string;
	/** 子弹贴图敌人 */
	bulletIconEnemy: string;
	/** 打枪声音 */
	gunVoice: number;
	/** 威力数组mgrcfg生成 */
	powerValues: any[];
	/** 射速数组mgrcfg生成 */
	shootValues: any[];
	/** 弹匣数组mgrcfg生成 */
	bulletValues: any[];
	/** 威力数组mgrcfg生成 */
	powerCosts: any[];
	/** 射速数组mgrcfg生成 */
	shootCosts: any[];
	/** 弹匣数组mgrcfg生成 */
	bulletCosts: any[];
}

declare type T_GUN_DETAIL_DB = {
	/** 枪id */
	id: number;
	/** 枪名称 */
	index: number;
	/** 数值 */
	powerValue: number;
	/** 升级消耗 */
	powerCost: number;
	/** 数值 */
	shootValue: number;
	/** 升级消耗 */
	shootCost: number;
	/** 数值 */
	bulletValue: number;
	/** 升级消耗 */
	bulletCost: number;
}

declare type T_BULLET_DB = {
	/** 子弹id */
	id: number;
	/** 枪名称 */
	name: string;
	/** 图标 */
	icon: string;
	/** 速度 */
	speed: number;
	/** 额外信息 */
	extraData: number;
}

declare type T_ENEMY_DB = {
	/** 顾客id */
	id: number;
	/** [蛋糕主体id, 侧纹理id, 顶涂层id,边花id,摆件id, 盘子id] */
	partIds: number;
}

declare type T_ALU_DB = {
	/**  */
	id: string;
	/** 描述 */
	name: string;
	/**  */
	key_1: string;
	/**  */
	operator_1: string;
	/**  */
	value_1: string;
	/** 是否为OR */
	logic_or_2: boolean;
	/**  */
	key_2: string;
	/**  */
	operator_2: string;
	/**  */
	value_2: string;
	/**  */
	logic_or_3: boolean;
	/**  */
	key_3: string;
	/**  */
	operator_3: string;
	/**  */
	value_3: string;
	/**  */
	logic_or_4: boolean;
	/**  */
	key_4: string;
	/**  */
	operator_4: string;
	/**  */
	value_4: string;
	/**  */
	logic_or_5: boolean;
	/**  */
	key_5: string;
	/**  */
	operator_5: string;
	/**  */
	value_5: string;
}

declare type T_COP_DB = {
	/**  */
	key: string;
	/**  */
	defaultValue: string;
}

declare type T_COP_PROCESS_DB = {
	/** 原始copId */
	id: string;
	/** 分隔符 */
	splitChar: string;
	/** 输出的字段名 */
	outputFieldNames: any[];
}

declare type T_ACHIEVEMENT_DB = {
	/**  */
	id: number;
	/**  */
	category: number;
	/**  */
	subCategory: number;
	/**  */
	order: number;
	/**  */
	name: string;
	/**  */
	desc: string;
	/**  */
	descCanReceive: string;
	/**  */
	bNeedTip: boolean;
	/**  */
	rewardItemId: number;
	/**  */
	rewardAmount: number;
	/**  */
	targetType: number;
	/**  */
	data1: number;
	/**  */
	data2: number;
	/**  */
	data3: number;
	/**  */
	data4: number;
	/**  */
	customData: any;
}

declare type T_ACHIEVEMENT_TARGET_DB = {
	/**  */
	id: number;
	/**  */
	calcCountHandlerName: string;
	/**  */
	cmds: any;
}

declare type T_SPINE_DB = {
	/**  */
	id: string;
	/**  */
	name: string;
	/**  */
	jsonFileName: string;
	/**  */
	mov_1: string;
	/**  */
	mov_2: string;
	/**  */
	mov_3: string;
	/**  */
	mov_4: string;
	/**  */
	mov_5: string;
	/**  */
	mov_6: string;
	/**  */
	mov_7: string;
	/**  */
	mov_8: string;
	/**  */
	mov_9: string;
	/**  */
	mov_10: string;
	/**  */
	mov_11: string;
	/**  */
	mov_12: string;
	/**  */
	scaleX: number;
	/**  */
	scaleY: number;
	/** 是否混合 */
	bMix: boolean;
	/** 是否启用贴图预乘。   当图片的透明区域出现色块时需要关闭该选项，当图片的半透明区域颜色变黑时需要启用该选项。 */
	bPremultipliedAlpha: boolean;
	/** 在编辑器中循环播放 */
	_bDebugLoop: boolean;
}

declare type T_ANIM_NODE_DB = {
	/**  */
	id: string;
	/**  */
	name: string;
	/** 动画节点.prefab文件路径（不需要带后缀） */
	prefabFileName: string;
	/** 动作名，可选，默认播放第一个 */
	clipName: string;
	/**  */
	scaleX: number;
	/**  */
	scaleY: number;
	/** 在编辑器中循环播放 */
	_bDebugLoop: boolean;
}

declare type T_PARTICLE_DB = {
	/**  */
	id: string;
	/**  */
	name: string;
	/** 自定义粒子  和mgrParticle绑定 */
	customParticleId: number;
	/**  */
	filename: string;
	/**  */
	texturename: string;
	/** 不填写则使用默认值 0:FREE 1:GROUPED 2:RELATIVE */
	positionType: string;
	/**  */
	bPlayOnce: boolean;
}

declare type T_CAKE_PART_DB = {
	/** 部件id */
	id: number;
	/** 部件类型 */
	type: number;
	/** 部件分数 */
	score: number;
	/** 类型名字 */
	name: string;
	/** 类型图标 */
	icon: string;
	/** 默认拥有 */
	bDefault: boolean;
}

declare type T_CAKE_MATERAIL_DB = {
	/** 唯一id */
	id: number;
	/** 类型(对应类型表) */
	type: number;
	/** 种类id */
	kindId: number;
	/** 种类名字 */
	kindName: string;
	/** 颜色id */
	colorId: number;
	/** 颜色名字 */
	colorName: string;
	/** 1.sprite 2.spine 3.particle 4.animNode */
	resType: number;
	/** 对应素材资源 */
	resId: string;
	/** 图标 */
	icon: string;
}

declare type T_CAKE_TYPE_DB = {
	/** 类型id */
	id: number;
	/** 类型名字 */
	name: string;
	/** 类型图标 */
	icon: string;
	/** 默认层级(新创建的资源, 会默认使用这个层级) */
	defaultIndexs: any[];
	/** 前置部件类型 一些部件需要依赖于其他部件 */
	prePartType: number;
	/**  */
	bWithFillEffect: boolean;
}

declare type T_STAGE_DB = {
	/** 关卡id  */
	id: number;
	/** 关卡名称  */
	name: string;
	/** 脚本  */
	scriptName: string;
	/** 首通奖励金币  */
	firstReward: number;
	/** 通关奖励金币  */
	passReward: number;
	/** 解锁需要的成就id  */
	unlockAids: any[];
	/** 消耗体力  */
	costs: number;
	/** 关卡进度  */
	stageProgress: number;
	/** 顾客列表  */
	customerIds: any[];
	/** 看广告解锁(一定会在某一个客人里出现)  */
	poolAd: any[];
	/** 池子 type = 1  */
	pool1: any[];
	/** 池子1随机到的概率  */
	pool1Ratio: number;
	/** 池子 type = 2  */
	pool2: any[];
	/** 池子2随机到的概率  */
	pool2Ratio: number;
	/** 池子 type = 3  */
	pool3: any[];
	/** 池子3随机到的概率  */
	pool3Ratio: number;
	/** 池子 type = 4  */
	pool4: any[];
	/** 池子4随机到的概率  */
	pool4Ratio: number;
	/** 池子 type = 5  */
	pool5: any[];
	/** 池子5随机到的概率  */
	pool5Ratio: number;
	/** 池子 type = 6  */
	pool6: any[];
	/** 池子6随机到的概率  */
	pool6Ratio: number;
	/** 关卡时间  */
	time: number;
	/** 计算星级   */
	starCalcTime: any[];
}

declare type T_STAGE_CHAPTER_DB = {
	/**  */
	id: number;
	/**  */
	name: string;
	/** 关卡id */
	stageIds: any[];
	/** 章节是否开启 */
	bOpen: boolean;
	/** 可见需要的成就id */
	displayObjectiveIds: any[];
	/** 解锁需要的成就id */
	unlockObjectiveIds: any[];
}

declare type T_CUSTOMER_DB = {
	/** 顾客id */
	id: number;
	/**  */
	spineId: string;
}

declare type T_AD_EVENT_DB = {
	/**  */
	id: string;
	/** 筛选器 */
	aluId: string;
	/**  */
	ratio: number;
	/** 使用cop的值当做概率 */
	ratioFromCopKey: string;
	/**  */
	cmd: string;
	/**  */
	type: string;
	/**  */
	code: number;
	/** 原生广告类型 1: banner 2: 插屏 3. 嵌入 */
	nativeType: number;
	/** 插屏广告类型： 1: 主推弹出 2: 激励弹出 */
	advId: string;
	/** 单位毫秒 */
	displayTime: number;
	/** 冷却时间在忽略广告模式下 */
	cdIgnoreAd: number;
	/** 冷却时间 */
	cd: number;
	/** cd组 */
	cdGroup: string;
	/** 超时（秒） 设置了timeout后，才会显示连接中等待框 */
	timeout: number;
	/** 剩余次数itemId 不填则代表不限制次数 */
	remainCountItemId: number;
	/**  */
	param: any;
	/** 去除广告对应的道具 */
	wipeItemId: number;
	/** 是否暂停音乐 */
	bPauseSound: boolean;
	/**  */
	gravity: string;
	/** 统计sdkl事件 */
	statisticsSdkEvent: string;
	/** 成功的code */
	successCode: number;
	/** 是否可使用native插屏替代 */
	bCanReplaceToNativeInstitial: boolean;
	/** 播放失败提示 */
	faildMsgTip: string;
}

declare type T_JUMP_OTHER_GAME_DB = {
	/**  */
	id: number;
	/**  */
	name: string;
	/**  */
	icon: string;
	/**  */
	gameIndex: string;
}

declare type T_SIGN_DB = {
	/**  */
	day: number;
	/**  */
	index: number;
	/**  */
	titleSpr: string;
	/**  */
	customIcon: string;
	/**  */
	rewardGap: number;
	/**  */
	rewardItemId: number;
	/**  */
	rewardAmount: number;
}

declare type T_ITEM_TEMPLATE_DB = {
	/** 编号  */
	id: number;
	/** 名字  */
	name: string;
	/** 品质  */
	quality: number;
	/** 特殊标志 1:金币 2:换装 3:宝箱 -1:测试道具 4: 枪 5: 头盔 6: 护甲 */
	flag: number;
	/** 图标  */
	icon: string;
	/** 描述  */
	desc: string;
	/** 默认值 初始化存档用 */
	defaultAmount: number;
	/** 自动出售数量 超过这个数量后自动出售 如获得相同的图纸，自动出售 */
	autoSellMinAmount: number;
	/** 卖出后获得的道具id  */
	sellItemId: number;
	/** 卖出后获得的道具数量  */
	sellItemAmount: number;
	/**   */
	data: any;
	/**  参考跳转总表 */
	buySource: number;
}

declare type T_SHOP_TEMPLATE_DB = {
	/**  */
	id: number;
	/**  */
	name: string;
	/**  */
	order: number;
	/**  */
	category: number;
	/**  */
	aluId: string;
	/**  */
	items: any;
	/**  */
	priceUnit: number;
	/**  */
	price: number;
	/**  */
	originPrice: number;
	/**  */
	payType: string;
	/**  */
	payId: string;
	/**  */
	rebuyCheckIds: any[];
	/**  */
	rebuyCheckMode: number;
	/**  */
	unlockAid: number;
	/**  */
	uiViewName: string;
	/**  */
	desc: string;
	/**  */
	sprIcon: string;
}

declare type T_ITEM_RECOVER_DB = {
	/** 编号 */
	id: number;
	/** 名字 */
	name: string;
	/** 最大恢复数量 */
	maxAmount: number;
	/** 最大恢复数量参考id */
	maxAmountRefItemId: number;
	/** 恢复模式 1:按秒恢复 2: 按日恢复 */
	mode: number;
	/** 模式1：恢复间隔（秒） 模式2：每天的第几秒恢复（从00:00算起） */
	recoverTime: number;
	/** 每次恢复多少点 */
	recoverAmount: number;
	/** vip每次恢复多少点 */
	vipRecoverAmount: number;
	/** 不填不用，每次恢复多少点用cop值 */
	recoverCopValue: string;
}

declare type T_GUIDE_DB = {
	/**  */
	id: number;
	/**  */
	step: number;
	/**  */
	bRepeat: boolean;
	/**  */
	bStartStep: boolean;
	/**  */
	startTrigger: any[];
	/**  */
	completeTrigger: any[];
	/**  */
	cancelTrigger: any[];
	/**  */
	maskType: number;
	/**  */
	nodeNames: any[];
	/**  */
	nodeExt: number;
	/**  */
	arrowType: string;
	/**  */
	bFlipArrow: boolean;
	/**  */
	arrowRotate: number;
	/**  */
	tipName: string;
	/**  */
	tipContent: string;
	/**  */
	tipSpineId: string;
	/**  */
	tipOffset: any[];
	/**  */
	tipDir: string;
	/**  */
	bTipArrowDisabled: boolean;
	/**  */
	soundId: number;
	/**  */
	maskSoundId: number;
	/**  */
	startMsg: any[];
	/**  */
	endMsg: any[];
}

declare type T_SOUND_DB = {
	/**  */
	id: number;
	/**  */
	name: string;
	/**  */
	type: number;
	/**  */
	fileName: string;
	/**  */
	bStopAllEffect: boolean;
	/**  */
	length: number;
}