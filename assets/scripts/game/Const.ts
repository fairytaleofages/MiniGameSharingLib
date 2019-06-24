const { ccclass, property } = cc._decorator;

export enum AdMode{
    none = 1,
    releax = 2,
    careful = 3,
}


/** 成就状态 */
export enum AchievementState {
    /** 锁定 */
    locked = 1,
    /** 解锁 */
    unlocked = 2,
    /** 已完成 */
    finished = 3,
    /** 已领取 */
    received = 4,
}



/** 资源节点类型 */
export enum ResourceType {
    /** cc.Sprite */
    sprite = 1,
    /** Spine */
    spine = 2,
    /** Particle */
    particle = 3,
    /** animNode */
    animNode = 4,
}


/** 引导黑幕显示规则 */
export enum GuideMaskType {
    /** 无黑幕可点穿 */
    none_passAll = 0,
    /** 无黑幕不可点穿 */
    none_blockkAll = 1,
    /** 无黑幕node区域可以点穿 */
    none_passHole = 2,
    /** 黑幕+所有区域可点穿 */
    mask_passAll = 3,
    /** 黑幕 + 所有区域不可点穿 */
    mask_blockAll = 4,
    /** 黑幕 + node区域可点穿 */
    mask_passHole = 5,
}

export enum CakePartType {
    /**糕体 */
    body = 1,
    /**侧边纹理 */
    side = 2,
    /**顶部纹理 */
    top = 3,
    /**侧边装饰 */
    sideDeco = 4,
    /**摆件 */
    ornament = 5,
    /**盘子 */
    plate = 6,
}

@ccclass
export default class Const {
    /** 游戏版本信息 */
    static LOCAL_PATCH_INFO = null;
    /** 游戏版本号 */
    static GAME_VERSION = "unknown";

    /** 是否开启录屏 */
    static IS_OPEN_VIDEO_RECORD = true;
    /** 是否提示过用户登录 */
    static HAD_TIP_USER_LOGIN = true;
    /** h5是否开启互动广告 */
    static IS_SHOW_URL_AD_ICON = false;
    /** 是否开启支付 */
    static IS_COP_OPEN_PAY = false;


    /**支付渠道 */
    static PAY_CHANNEL = null;
    /**本地发布渠道 */
    static LOCAL_PUBLISH_CHANNEL = "";
    /**安卓切换第三方退出 */
    static ANDROID_SWITCH_THIRD_EXIT = false;
    /**安卓第三方更多游戏 */
    static ANDROID_SWITCH_MORE_GAME = false;
    /**安卓切换关于 */
    static ANDROID_SWITCH_ABOUT = false;
    /**安卓切换音乐开关 */
    static ANDROID_SWITCH_MUSIC_ENABLED = false;
    /**包版本 */
    static PACKAGE_VERSION = null;
    /**是否显示web 页面 */
    static B_SDK_HAS_WEB_VIEW = true;

    static ACHIEVEMENT_CATEGORY_LIST = 1;
    static ACHIEVEMENT_CATEGORY_FARM = 2;
    static ACHIEVEMENT_CATEGORY_COOKBOOK = 3;
    static ACHIEVEMENT_CATEGORY_ROOM = 4;
    static ACHIEVEMENT_CATEGORY_KITCHEN = 5;

    static ITEM_ID_RMB = 1;
    static ITEM_ID_GOLD = 2;
    static ITEM_ID_KEY = 3;
    static ITEM_ID_ENERGY = 4;
    static ITEM_ID_MAX_ENERGY = 5;
    static ITEM_ID_PVE_ITEM = 6;
    static ITEM_ID_FRAGMENT = 7;
    static ITEM_ID_OPEN_CHEST = 8;
    static ITEM_ID_VIDEO_SHARE_COUNT = 9;
    static ITEM_ID_SHARE_COUNT = 10;
    static ITEM_ID_WIPE_AD = 11;

    static ITEM_FLAG_MONEY = 1;
    static ITEM_FLAG_PART = 2;
    static ITEM_FLAG_PART_BLUEPRINT = 3;
    static ITEM_FLAG_MATERIAL = 4;
    static ITEM_FLAG_PLAYER_ATTR = 5;
    static ITEM_FLAG_NPC_GIFT = 6;

   
    static GLOBAL_ORDER_TIP_ICON = 9 * 100;
    static GLOBAL_ORDER_DIALOG = 10 * 100;
    static GLOBAL_ORDER_TIP = 11 * 100;
    static GLOBAL_ORDER_GUIDE = 12 * 100;

    static GLOBAL_ORDER_WARP_SCENE_NODE = 10000
    static GLOBAL_ORDER_MASK = 10001

    /**
     * 分辨率范围
     */
    static RESOLUTION_RANGE = {
        maxWidth: 768,
        minWidth: 576,

        maxHeight: 1344,
        minHeight: 1024,
    };

    static SERVER_HOST = "https://rank.ultralisk.cn";
    static SERVER_URL_FORMAT = "%s/ultralisk/";

    static SERVER_APP_ID = 57;
    static SERVER_RANK_ID = 62;

    /** warpScene时，最短等待时间 */
    static WARP_SCENE_MIN_LOAD_TIME = 0.1;

    static B_PROMISE_RESOLVE_NEED_WAIT = true;
    static PROMISE_RESOLVE_WAIT_TIME = 1;

    // 广告可用次数（客户端当做bool用，只看次数是否大于0）
    // 视频(默认是1)
    static AD_VIDEO_VALID_COUNT = 1;

    static ITEM_ID_PLAYER = 99;
    static RADIAN2EULAR = 180 / Math.PI;
}