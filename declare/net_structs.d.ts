/**
 * 为了圣光
 * 为了国王的荣耀
 * 为了被遗忘者
 * 为了艾泽拉斯
 * 为了德玛西亚
 * 请按照CMD字母序列，排版对应的通讯数据结构
 * 
 * 上行消息：request 简写REQ
 *      命名格式为 T_REQ_%CMD% cmd为纯大写+下划线分隔
 * 
 * 下行消息：response 简写RESP
 *      命名格式为 T_RESP_%CMD% cmd为纯大写+下划线分隔
 * 
 * 编写后，请运行client/declare/_导出通讯协议，生成对应的请求和响应函数
 */
// A
declare type T_REQ_ACHIEVEMENT_GET_ALL = {
    cmd?: string,
    uid: string,
    sessionId: string,
}

declare type T_RESP_ACHIEVEMENT_GET_ALL = {
    cmd?: string,
    /** {[achievementId: number]: state: AchievementState} */
    states: { [achievementId: number]: number },
}

declare type T_REQ_ACHIEVEMENT_RECEIVE_REWARD = {
    cmd?: string,
    uid: string,
    sessionId: string,
    achievementId: number,
}

declare type T_RESP_ACHIEVEMENT_RECEIVE_REWARD = {
    cmd?: string,
    code: number,
    msg?: string,
}


// B

// C

// D
declare type T_REQ_DYNAMIC_NOTICE_GET = {
    cmd?: string,
    uid: string,
    sessionId: string,
}

declare type T_RESP_DYNAMIC_NOTICE_GET = {
    cmd?: string,
    notice: string[],
}

// E
declare type T_REQ_EMAIL_GET_IDS = {
    cmd?: string,
    uid: string,
    sessionId: string,
}

declare type T_RESP_EMAIL_GET_IDS = {
    cmd?: string,
    emailIds: number[],
}

declare type T_REQ_EMAIL_GET_INFO = {
    cmd?: string,
    uid: string,
    sessionId: string,
    emailIds: number[],
}

declare type T_RESP_EMAIL_GET_INFO = {
    cmd?: string,
    emails: {
        id: number,
        type: number,
        fromWho: string,
        toWho: string,
        isReceived: boolean,
        title: string,
        content: string,
        /** 附件清单[itemId: number, amount: number][]  [[1,100],[2,1000]] */
        attachment: number[][],
        time: number,
        expirationTime: number,
    }[];
}

declare type T_REQ_EMAIL_RECEIVE = {
    cmd?: string,
    uid: string,
    sessionId: string,
    emailIds: number[],
}

declare type T_RESP_EMAIL_RECEIVE = {
    cmd?: string,
    code: number,
    msg?: string,
}

declare type T_REQ_EMAIL_DELETE = {
    cmd?: string,
    uid: string,
    sessionId: string,
    emailIds: number[],
}

declare type T_RESP_EMAIL_DELETE = {
    cmd?: string,
    code: number,
    msg?: string,
}

// F

// G
declare type T_REQ_GAME_SERVER_LOGIN = {
    cmd?: string,
    uid: string,
}

declare type T_RESP_GAME_SERVER_LOGIN = {
    cmd?: string,
    code: number,
    msg?: string,
    sessionId: string,
}

declare type T_RESP_GAME_SERVER_SESSION_ERROR = {
    cmd?: string,
    msg: string,
}

// H

// I
declare type T_REQ_ITEM_GET_ALL = {
    cmd?: string,
    uid: string,
    sessionId: string,
}

declare type T_RESP_ITEM_GET_ALL = {
    cmd?: string,
    items: { [itemid: number]: number },
    recoverCostTimes: { [itemId: number]: number },
}

declare type T_RESP_ITEM_AMOUNT_CHANGED = {
    cmd?: string,
    /** 格式[[itemId, finallyAmount, deltaAmount]] */
    changedItems: number[][],
}

/**
 * 请求出售物品
 * 出售的数量不能大于已拥有的
 * 可以出售到只剩0个
 */
declare type T_REQ_ITEM_SELL = {
    cmd?: string,
    uid: string,
    sessionId: string,
    itemId: number,
    amount: number,
}

declare type T_RESP_ITEM_SELL = {
    cmd?: string,
    code: number,
    msg?: string,
}

// J

// K

// L
declare type T_RESP_LOGIN_SESSION_ERROR = {
    cmd?: string,
    code: number,
    msg?: string,
}

// M

// N
declare type T_REQ_NPC_CHAT_GET_ALL = {
    cmd?: string,
    uid: string,
    sessionId: string,
}

declare type T_RESP_NPC_CHAT_GET_ALL = {
    cmd?: string,
    subjects: {
        subjectId: number,
        step: number,
        selectedMenuIds: number[],
        startTime: number,
        replyTime: number,
    }[],
}

declare type T_REQ_NPC_CHAT_START_SUBJECT = {
    cmd?: string,
    uid: string,
    sessionId: string,
    subjectId: number,
}

declare type T_RESP_NPC_CHAT_START_SUBJECT = {
    cmd?: string,
    code: number,
    msg?: string,
    startTime: number,
}

declare type T_REQ_NPC_CHAT_STEP_SUBJECT = {
    cmd?: string,
    uid: string,
    sessionId: string,
    subjectId: number,
    step: number,
    selectedMenuId: number,
}

declare type T_RESP_NPC_CHAT_STEP_SUBJECT = {
    cmd?: string,
    code: number,
    msg?: string,
    replyTime: number,
}

declare type T_REQ_NPC_UPGRADE = {
    cmd?: string,
    uid: string,
    sessionId: string,
    npcId: nubmer,
}

declare type T_RESP_NPC_UPGRADE = {
    cmd?: string,
    code: number,
    msg?: string,
}

declare type T_REQ_NPC_GIVE_GIFT = {
    cmd?: string,
    uid: string,
    sessionId: string,
    npcId: nubmer,
    itemId: number,
    amount: number,
}

declare type T_RESP_NPC_GIVE_GIFT = {
    cmd?: string,
    code: number,
    msg?: string,
}

// O
declare type T_REQ_OBJECTIVE_GET_ALL = {
    cmd?: string,
    uid: string,
    sessionId: string,
}

declare type T_RESP_OBJECTIVE_GET_ALL = {
    cmd?: string,
    /** { [objectiveId: string] = count: umber } */
    counts: { [objectiveId: string]: number },
}

declare type T_RESP_OBJECTIVE_COUNT_CHANGED = {
    cmd?: string,
    /** { [objectiveId: string] = count: umber } */
    changedCounts: { [objectiveId: string]: number },
}

// P
declare type T_REQ_PART_DECOMPOSE = {
    cmd?: string,
    uid: string,
    sessionId: string,
    /** { [itemId: number]: amount: number} */
    items: { [itemId: number]: number },
}

declare type T_RESP_PART_DECOMPOSE = {
    cmd?: string,
    code: number,
    msg?: string,
}

declare type T_REQ_PART_EVO = {
    cmd?: string,
    uid: string,
    sessionId: string,
    sourcePartId: number,
}

declare type T_RESP_PART_EVO = {
    cmd?: string,
    code: number,
    msg?: string,
}

declare type T_REQ_PART_MAKE = {
    cmd?: string,
    uid: string,
    sessionId: string,
    blueprintId: number,
}

declare type T_RESP_PART_MAKE = {
    cmd?: string,
    code: number,
    msg?: string,
}

declare type T_REQ_PART_UPGRADE = {
    cmd?: string,
    uid: string,
    sessionId: string,
    itemId: number,
}

declare type T_RESP_PART_UPGRADE = {
    cmd?: string,
    code: number,
    msg?: string,
}

declare type T_REQ_PLAYER_GET_ALL = {
    cmd?: string,
    uid: string,
    sessionId: string,
}

declare type T_RESP_PLAYER_GET_ALL = {
    cmd?: string,
    playerName: string,
    nickName: string,
    headIconId: number,
}

declare type T_REQ_PLAYER_RENAME = {
    cmd?: string,
    uid: string,
    sessionId: string,
    playerName: string,
    nickName: string,
    headIconId: number,
}

declare type T_RESP_PLAYER_RENAME = {
    cmd?: string,
    code: number,
    msg?: string,
    playerName?: string,
    nickName?: string,
    headIconId?: number,
}

// Q
declare type T_REQ_QUEST_ACCPET = {
    cmd?: string,
    uid: string,
    sessionId: string,
    questIds: number[],
}

declare type T_RESP_QUEST_ACCPET = {
    cmd?: string,
    code: number,
    msg?: string,
}

declare type T_REQ_QUEST_GET_ALL = {
    cmd?: string,
    uid: string,
    sessionId: string,
}

declare type T_RESP_QUEST_GET_ALL = {
    cmd?: string,
    /** {[questId: number}: state: number]} */
    states: { [questId: number]: number },
}

declare type T_RESP_QUEST_STATE_CHANGED = {
    cmd?: string,
    /** {[questId: number}: state: number]} */
    changedStates: { [questId: number]: number },
}

declare type T_REQ_QUEST_SUBMIT = {
    cmd?: string,
    uid: string,
    sessionId: string,
    questId: number,
    /** 后续任务索引，默认为0 */
    nextQuestIndex: number,
}

declare type T_RESP_QUEST_SUBMIT = {
    cmd?: string,
    code: number,
    msg?: string,
}


// R

// S
declare type T_REQ_SHOP_REQUEST_BUY = {
    cmd?: string,
    uid: string,
    sessionId: string,
    shopId: number,
    amount: number,
}

declare type T_RESP_SHOP_REQUEST_BUY = {
    cmd?: string,
    code: number,
    msg?: string,
}

declare type T_REQ_STAGE_BEGIN = {
    cmd?: string,
    uid: string,
    sessionId: string,
    stageId: number,
}

declare type T_RESP_STAGE_BEGIN = {
    cmd?: string,
    code: number,
    msg?: string,
}

declare type T_REQ_STAGE_FINISH = {
    cmd?: string,
    uid: string,
    sessionId: string,
    stageId: number,
    partItemIds: number[],
    /** 临时测试用的score，如果这个字段非空，则直接使用这个得分 */
    _debugScore: number,
}

declare type T_RESP_STAGE_FINISH = {
    cmd?: string,
    code: number,
    msg?: string,
    score: number,
    rating: number,
}

declare type T_REQ_STAGE_GET_ALL = {
    cmd?: string,
    uid: string,
    sessionId: string,
}

declare type T_RESP_STAGE_GET_ALL = {
    cmd?: string,
    /** 评级：{[stageId:number] : rating:number} */
    ratings: { [stageId: number]: number },
}

declare type T_REQ_STAGE_WIPE = {
    cmd?: string,
    uid: string,
    sessionId: string,
    stageId: number,
    count: number,
}

declare type T_RESP_STAGE_WIPE = {
    cmd?: string,
    code: number,
    msg?: string,
}

// T

// U

// V

// W

// X

// Y

// Z




