/**
 * 处理后的itemBox表
 */
declare type T_ITEM_BOX_DB = {
    /** box编号 */
    boxId: number,
    /** 名称 */
    name: string,
    /** 概率类型：1:经典概率 2:圆桌概率 3:全部给予 */
    ratioType: number,
    /** 触发概率，万分比 */
    triggerRatio: number,
    items: {
        /** 概率（万分比）、权重 */
        ratio: number,
        /** 物品id */
        itemId: number,
        /** 最小物品数量 */
        minAmount: number,
        /** 最大物品数量 */
        maxAmount: number,
    }[],
}