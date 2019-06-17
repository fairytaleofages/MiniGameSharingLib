import Manager from "../../ulframework/manager/Manager";
import mgrRecord from "./mgrRecord";
import mgrCfg from "./mgrCfg";
import Timer from "../../ulframework/utils/Timer";
import Tools from "../../ulframework/utils/Tools";
import Const from "../Const";
import mgrTip from "./mgrTip";
import mgrShop from "./mgrShop";
import mgrWordFilter from "./mgrWordFilter";
import mgrSdk from "./mgrSdk";
import mgrGuide from "./mgrGuide";

const SHARE_REWARD = 100;
const VIDEO_SHARE_REWARD = 150;

const { ccclass } = cc._decorator;

@ccclass
export default class mgrPlayer extends Manager {
    ///// 成员变量 /////
    private static _items = {}                          // 物品数量 {itemId:itemAmount}
    private static _playerName: string = "";             // 玩家名称
    private static _itemChangedAge: number = 0;          // 物品更改记录

    private static _historyDisplayedGotItems = {};      // 已经展示过的道具（针对需要兑换的道具，第一次展示的时候为正常展示，后续为兑换展示）

    private static _historyGotItems = {};               // 历史获得物品记录
    private static _historyUsedItems = {};              // 历史使用物品记录
    private static _dailyGotItems = {};                 // 日常获得物品记录
    private static _dailyUsedItems = {};                // 日常使用物品记录
    private static _historyDailyMaxGotItems = {};       // 每日最高使用获得记录
    private static _historyDailyMaxUsedItems = {};      // 每日最高使用物品记录

    private static _lastDailyRefreshTime: number = null;// 日常相关刷新时间
    private static _recoverCostTimes = {};              // 恢复物品时间

    private static lastReceiveVipRewardTime = null; //上次领取VIP奖励的时间

    //暂时使用
    private static uid: string = "";
    private static deviceCode: string = "";

    private static _curSkinWall: number = 0;

    // 是否已经领取 微信公众号奖励
    private static isGetWxgzhReward: boolean = false;
    // 是否需要提示 微信公众号奖励
    public static isNeedAlertWxgzhReward: boolean = false;



    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        cc.log("mgrPlayer.onLoad", this._playerName);

        this.loadRecord();

        Timer.callLoop(1, this.onTimerLoop.bind(this), true);

        this.registerListeners({
            "MSG_ITEM_AMOUNT_CHANGED": this.onMsgItemAmountChanged,
            "MSG_SHARE_RESULT": this.onMsgShareResult,
            MSG_WX_GZH_ENTER_INIT: this.onMsgWxgzhEnterInit,
            MSG_WX_GZH_ENTER_GAME: this.onMsgWxgzhEnterGame,
            
            MSG_SDK_SHARE_VIDEO_RESULT: this.onMsgSdkShareVideoResult,
        });
    }

    protected static loadRecord(): void {
        super.loadRecord();

        let record = mgrRecord.getData("player") || {};
        this._playerName = record.playerName || "";
        this._items = record.items || {};

        this._historyGotItems = record.historyGotItems || {};
        this._historyUsedItems = record.historyUsedItems || {};
        this._dailyGotItems = record.dailyGotItems || {};
        this._dailyUsedItems = record.dailyUsedItems || {};
        this._historyDailyMaxGotItems = record.historyDailyMaxGotItems || {};
        this._historyDailyMaxUsedItems = record.historyDailyMaxUsedItems || {};
        this._recoverCostTimes = record.recoverCostTimes || {};

        this._lastDailyRefreshTime = record.lastDailyRefreshTime || 0;
        this.lastReceiveVipRewardTime = record.lastReceiveVipRewardTime || 0;

        this.isGetWxgzhReward = record.isGetWxgzhReward || false;

        // 加载uid，优先使用设备码
        if (this.deviceCode) {
            this.uid = this.deviceCode;
        } else {
            this.uid = record.uid;
        }

        // 处理物品初始值
        let items = this._items;
        mgrCfg.forDb("item_template_db", (k, v) => {
            const itemId: number = v.id;

            // 没有初始值的，赋予初始值
            if (items[itemId] == null) {
                items[itemId] = v.defaultAmount;
            }
        });

        // historyDisplayedGotItems 读取当前存档的item，初始化数据
        Tools.forEachMap(items, (itemId, amount) => {
            this._historyDisplayedGotItems[itemId] = (amount > 0);
        });

        this.refreshDailyData();
        this.refreshRecoverItem();

        this._curSkinWall = record.curSkinWall || 0;
        if ( this._curSkinWall == 0 ) {
            mgrCfg.forDb_from_item_template_db( ( key, value ) => {
                if ( value.flag == 7 && this.getItemAmount( parseInt(key) ) > 0 ) {
                    this._curSkinWall = parseInt(key);
                    return true;
                }
            } );
        }

    }

    protected static saveRecord(): void {
        super.saveRecord();

        let record = {
            playerName: this._playerName,
            items: this._items,

            historyGotItems: this._historyGotItems,
            historyUsedItems: this._historyUsedItems,
            dailyGotItems: this._dailyGotItems,
            dailyUsedItems: this._dailyUsedItems,
            historyDailyMaxGotItems: this._historyDailyMaxGotItems,
            historyDailyMaxUsedItems: this._historyDailyMaxUsedItems,

            lastDailyRefreshTime: this._lastDailyRefreshTime,
            recoverCostTimes: this._recoverCostTimes,
            uid: this.uid,
            lastReceiveVipRewardTime: this.lastReceiveVipRewardTime,

            curSkinWall: this._curSkinWall,

            isGetWxgzhReward: this.isGetWxgzhReward,
        };

        mgrRecord.setData("player", record);
    }

    protected static onTimerLoop(timer: Timer) {
        this.refreshDailyData();
        this.refreshRecoverItem();
    }









    ///// 数据访问 /////
    public static getName(): string {
        return this._playerName;
    }

    public static setName(playerName: string): void {
        this._playerName = playerName;
        this.saveRecord();
        this.sendMsg("MSG_PLAYER_NAME_CHANGED")
    }

    public static getItemChangedAge(): number {
        return this._itemChangedAge;
    }









    ///// uid相关 /////
    // uid可能会涉及到很多数据的访问，需要在onReset之前加载完毕
    /** 获取uid */
    public static getUid(): string {
        if (!this.uid) {
            this.uid = ul.format("%s%03d", ul.formatDate(new Date(), "yyyyMMddhhmmssS"), Tools.random(999));
            this.saveRecord();
        }
        return this.uid;
    }

    /** 设置设备码 */
    public static _setDeviceCode(uuid: string): void {
        this.deviceCode = uuid;

        if (this.uid && this.uid != uuid) {
            this.uid = uuid;
            this.saveRecord();
        }
    }










    ///// item相关 /////
    /**
     * 获取物品数量
     * @param itemId 
     */
    public static getItemAmount(itemId: number): number {
        return this._items[itemId] || 0;
    }

    /**
     * 设置物品数量
     * 不推荐使用这个方法， 但是有可能会用到，所以在名称前加上下划线以示警告
     * @param itemId 
     * @param amount 
     */
    public static _setItemAmount(itemId: number, amount: number): void {
        if (itemId == null || amount == null) {
            cc.warn("警告] mgrPlayer.setItemAmount arg is wrong!", itemId, amount);
            return;
        }

        let originAmount = this.getItemAmount(itemId);

        if (originAmount == amount) return;

        this._items[itemId] = Math.max(amount, 0);

        let data = {
            itemId: itemId,
            amountDelta: amount - originAmount,
        };
        this.sendMsg("MSG_ITEM_AMOUNT_CHANGED", data);

        this.saveRecord();

        this._itemChangedAge++;
    }

    /**
     * 增加物品数量
     * @param itemId
     * @param amountDelta 数量改变值：1代表获得1个，-1代表消耗1个
     * @param reason 变更理由，用于统计
     */
    public static addItemAmount(itemId: number, amountDelta: number, reason: string): void {
        if (itemId == null || amountDelta == null) {
            cc.warn("警告] mgrPlayer.addItemAmount arg is wrong!", itemId, amountDelta);
            return;
        }

        if (amountDelta > 0) {
            // 获得物品

            // 执行物品出售逻辑
            // 判断该物品是否可以出售
            let itemData = mgrCfg.get("item_template_db", itemId);
            if ( !itemData ) {
                cc.warn("警告] mgrPlayer.addItemAmount itemId 不存在! itemId: ", itemId);
                return;
            }
            if (itemData.sellItemId != 0) {
                if (this.getItemAmount(itemId) >= 1) {
                    // 已经拥有的道具，直接兑换
                    itemId = itemData.sellItemId;
                    amountDelta = itemData.sellItemAmount * amountDelta;
                }
            }
        }

        let originAmount = this.getItemAmount(itemId);
        this._setItemAmount(itemId, originAmount + amountDelta);

        // 调用SDK统计
        mgrSdk.statisOnAddItemAmount(itemId, amountDelta, reason);
    }








    ///// 物品统计相关 /////

    /** 获取历史获得物品记录 */
    public static getItemDailyGotAmount(itemId: number): number {
        return this._historyGotItems[itemId] || 0;
    }

    /** 获取历史使用物品记录 */
    public static getItemHistoryGotAmount(itemId: number): number {
        return this._dailyGotItems[itemId] || 0;
    }

    /** 获取日常获得物品记录 */
    public static getItemHistoryDailyMaxGotAmount(itemId: number): number {
        return this._historyDailyMaxGotItems[itemId] || 0;
    }

    /** 获取日常使用物品记录 */
    public static getItemDailyUsedAmount(itemId: number): number {
        return this._dailyUsedItems[itemId] || 0;
    }

    /** 获取每日最高使用获得记录 */
    public static getItemHistoryUsedAmount(itemId: number): number {
        return this._historyUsedItems[itemId] || 0;
    }

    /** 获取每日最高使用物品记录 */
    public static getItemHistoryDailyMaxUsedAmount(itemId: number): number {
        return this._historyDailyMaxUsedItems[itemId] || 0;
    }

    /** 指定的物品，是否已经展示过了 */
    public static isDisplayedGotItem(itemId: number): boolean {
        return this._historyDisplayedGotItems[itemId] == true;
    }

    /** 标记指定的物品已经展示过了 */
    public static markDisplayedGotItem(itemId: number): void {
        this._historyDisplayedGotItems[itemId] = true;
    }

    private static onMsgItemAmountChanged(e) {
        let data = e;
        let itemId = data.itemId;
        let amountDelta = data.amountDelta;

        // cc.log("mgrPlayer.onMsgItemAmountChanged", itemId, amountDelta);

        if (amountDelta > 0) {
            // 获得物品
            this._historyGotItems[itemId] = (this._historyGotItems[itemId] || 0) + amountDelta;
            this._dailyGotItems[itemId] = (this._dailyGotItems[itemId] || 0) + amountDelta;
            this._historyDailyMaxGotItems[itemId] = Math.max((this._historyDailyMaxGotItems[itemId] || 0), this._dailyGotItems[itemId]);

        } else {
            // 消耗物品
            this._historyUsedItems[itemId] = (this._historyUsedItems[itemId] || 0) + (-amountDelta);
            this._dailyUsedItems[itemId] = (this._dailyUsedItems[itemId] || 0) + (-amountDelta);
            this._historyDailyMaxUsedItems[itemId] = Math.max((this._historyDailyMaxUsedItems[itemId] || 0), this._dailyUsedItems[itemId]);
        }

        if (itemId == Const.ITEM_ID_VIP && this.getItemAmount(itemId) > 0) {
            // 获得vip，标记今天已领取
            this.lastReceiveVipRewardTime = Tools.time();
            this.saveRecord()
        }
    }









    ///// 刷新相关 //////
    private static refreshDailyData() {
        // cc.log("refreshDailyData", Tools.time(), this._lastDailyRefreshTime, Tools.isOneDay(Tools.time(), this._lastDailyRefreshTime));
        if (!Tools.isOneDay(Tools.time(), this._lastDailyRefreshTime)) {
            // 需要刷新
            // 清空日常数据
            // cc.log("mgrPlayer.refreshDailyData 刷新！");
            this._dailyGotItems = {};
            this._dailyUsedItems = {};
            this._lastDailyRefreshTime = Tools.time();

            this.saveRecord();
        }
    }

    /// 刷新物品恢复相关
    private static refreshRecoverItem() {
        let now = Tools.time();

        // cc.log("refreshRecoverItem")

        mgrCfg.forDb("item_recover_db", (k, recoverData) => {
            const itemId = recoverData.id;

            let amount = this.getItemAmount(itemId);
            let maxAmount = this.getRecoverMaxAmount(itemId);
            let costTime = this._getRecoverCostTime(itemId);

            // 开始恢复逻辑
            let recoverCount = 0;
            if (recoverData.mode == 1) {
                // 秒 时间模式

                // 处理特殊情况
                // 已达到最大值
                if (maxAmount <= amount) {
                    if (costTime != 0) {
                        this._setRecoverCostTime(itemId, 0);
                    }
                    return;
                }

                // costTime有问题
                if (now < costTime) {
                    costTime = now;
                    this._setRecoverCostTime(itemId, costTime);
                }

                if (costTime <= 0) {
                    if (maxAmount <= amount) {
                        // 已恢复满
                        return;
                    } else {
                        // 未恢复满，标记为需要恢复
                        costTime = now;
                        this._setRecoverCostTime(itemId, costTime);
                    }
                }

                let deltaTime = now - costTime;
                let recoverTime = this._getRecoverTime(itemId);

                // 计算需要恢复多少次
                recoverCount = Math.floor(deltaTime / recoverTime);
                // cc.log("try recover", itemId);
                // cc.log("  deltaTime", deltaTime);
                // cc.log("  recoverCount", recoverCount);
                if (recoverCount <= 0) {
                    // 不需要恢复
                    // cc.log("  不需要恢复")
                    return;
                }
                costTime += recoverTime * recoverCount;

            } else if (recoverData.mode == 2) {
                // 日 模式
                if (costTime <= 0) {
                    this._setRecoverCostTime(itemId, now);
                    return;
                }

                if (Tools.isOneDay(now, costTime)) {
                    // cc.log("同一天，不需要恢复")
                    return;
                } else {
                    // cc.log("不是同一天，需要恢复")
                    recoverCount = 1;
                    costTime = now;
                }

            } else {
                cc.warn("警告] mgrPlayer.refreshRecoverItem 未知mode", recoverData.mode)
                return;
            }

            let recoverAmount = this._getRecoverAmount(itemId) * recoverCount;
            amount += recoverAmount;

            if (maxAmount <= amount) {
                amount = Math.min(amount, maxAmount);
                costTime = 0;
            }
            this._setItemAmount(itemId, amount);
            this._setRecoverCostTime(itemId, costTime);
        });
    }

    /** 获取恢复道具的最大数量 */
    public static getRecoverMaxAmount(itemId: number): number {
        let recoverData = mgrCfg.get("item_recover_db", itemId);
        if (recoverData.maxAmountRefItemId != 0) {
            // 有参考id，返回参考id对应的物品数量
            return this.getItemAmount(recoverData.maxAmountRefItemId);

        } else {
            // 返回配置的值
            return recoverData.maxAmount;
        }
    }

    /** 获取恢复道具恢复时间 */
    private static _getRecoverTime(itemId: number): number {
        let recoverTime: number = mgrCfg.get("item_recover_db", itemId, "recoverTime");

        // 这里处理恢复速度改变的逻辑
        /**
         * if (宠物A达到5级 && itemId==体力ID) {
         *      recoverTime *= 偏移值;
         * }
         */

        return recoverTime;
    }

    /** 获取恢复道具每次恢复的数量 */
    private static _getRecoverAmount(itemId: number): number {
        // let recoverData = mgrCfg.get("item_recover_db", itemId);
        let recoverData = mgrCfg.get_from_item_recover_db( itemId );;

        if ( !!recoverData.recoverCopValue ) {
            return mgrSdk.getCopNumberValueByKey( recoverData.recoverCopValue );
        }
        else if (this.isVip()) {
            return recoverData.vipRecoverAmount;
        } else {
            return recoverData.recoverAmount;
        }
    }

    /** 获取恢复物品costTime */
    private static _getRecoverCostTime(itemId: number): number {
        return this._recoverCostTimes[itemId] || 0;
    }

    /** 保存恢复物品costTime */
    private static _setRecoverCostTime(itemId: number, costTime: number) {
        this._recoverCostTimes[itemId] = costTime;
        this.saveRecord();
    }

    /**
     * 获取可恢复物品的剩余恢复时间
     */
    public static getRecoverRemainTime(itemId: number): number {
        let recoverData = mgrCfg.get("item_recover_db", itemId);
        if (recoverData.mode == 1) {
            let costTime = this._getRecoverCostTime(itemId);
            if (costTime <= 0) return null;

            let now = Tools.time();
            let deltaTime = now - costTime;
            let recoverTime = this._getRecoverTime(itemId);

            if (recoverTime < deltaTime) return 0;

            return recoverTime - deltaTime;

        } else if (recoverData.mode == 2) {
            let amount = this.getItemAmount(itemId);
            let maxAmount = this.getRecoverMaxAmount(itemId);
            // 不需要恢复
            if (amount >= maxAmount) return null;

            // let tomorrowNow = new Date((Tools.time() + 24 * 60 * 60) * 1000);

            let date = new Date();
            date.setDate(date.getDate() + 1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            // cc.log("date", date);
            return (date.getTime() / 1000) - Tools.time();

        } else {
            cc.warn("警告] mgrPlayer.refreshRecoverItem 未知mode", recoverData.mode)
            return null;
        }
    }








    ///// itemBox相关 /////
    /**
     * 打开一个itemBox
     * @param boxId 对应item_box_db中的id
     * @return [[itemId, amount], [itemId, amount]] 
     */
    public static openItemBox(boxId: number): any[] {
        let boxData = mgrCfg.get("item_box_db", boxId);
        return this.openItemBoxByBoxData(boxData);
    }

    /**
     * 通过boxData打开一个itemBox
     * @param boxData 对应item_box_db中的一个数据
     * @return [[itemId, amount], [itemId, amount]]
     */
    public static openItemBoxByBoxData(boxData: any): any[] {
        let result = [];

        if (boxData.triggerRatio < 10000 && Tools.random(10000) > boxData.triggerRatio) {
            // 未触发，跳过
            return result;
        }

        let ratioType = boxData.ratioType;

        if (ratioType == 1) {
            // 经典概率
            for (let i = 0; i < boxData.items.length; i++) {
                const v = boxData.items[i];
                if (v.ratio >= 10000 || Tools.random(10000) <= v.ratio) {
                    let amount = Tools.random(v.minAmount, v.maxAmount);
                    result.push([v.itemId, amount]);
                }
            }

        } else if (ratioType == 2) {
            // 圆桌概率
            let v = Tools.calcWheelTarget(boxData.items, "ratio");
            if (v) {
                let amount = Tools.random(v.minAmount, v.maxAmount);
                result.push([v.itemId, amount]);
            }

        } else if (ratioType == 3) {
            // 全部给予
            for (let i = 0; i < boxData.items.length; i++) {
                const v = boxData.items[i];
                let amount = Tools.random(v.minAmount, v.maxAmount);
                result.push([v.itemId, amount]);
            }
        }

        return result;
    }

    // ----- vip相关 -----
    public static isVip() {
        // cc.log(this.getItemAmount(Const.ITEM_ID_VIP));
        return this.getItemAmount(Const.ITEM_ID_VIP) >= 1;
    }

    // --- 是否可以领vip奖励
    public static canReceiveVipReward() {
        if (!this.isVip()) {
            return false;
        }
        let lastReceiveVipRewardTime = this.lastReceiveVipRewardTime || 0;
        // cc.log(lastReceiveVipRewardTime);
        // cc.log(Tools.time());
        return !Tools.isOneDay(lastReceiveVipRewardTime, Tools.time());
    }

    /**
     * name
     */
    public static buyVip(reason: string) {
        if (this.isVip()) {
            return;
        }
        mgrShop.requestBuy(Const.ITEM_ID_VIP, 1, reason || "未知来源")
    }

    /**
     * st
     */
    public static tryReceiveVipReward(): any {
        if (!this.canReceiveVipReward()) {
            mgrTip.showMsgTip("现在不能领取哦");
            return { errorCode: false, rewards: null };
        }
        let itemInfo = mgrCfg.get("item_template_db", Const.ITEM_ID_VIP);
        let rewards = itemInfo.data || [];
        for (let i = 0; i < rewards.length; i++) {
            const reward = rewards[i];
            this.addItemAmount(reward[0], reward[1], "魔仙特权每日领取")
            mgrTip.addGotItemTip(reward[0], reward[1]);
        }
        this.lastReceiveVipRewardTime = Tools.time();
        this.saveRecord();
        return { errorCode: true, rewards: rewards };
    }



    public static autoIntitle() {
        if (!mgrPlayer.getName()) {
            mgrPlayer.setName(mgrPlayer.calcRandomName());
        }
    }




    ///// 随机名字相关 /////
    public static calcRandomName(): string {
        // local part1 = ul.mgrCfg.allDatas.random_name_part1_db
        // local part2 = ul.mgrCfg.allDatas.random_name_part2_db

        // -- 创建随机名字
        // -- 由于随机名字可能会被屏蔽掉，这里处理一下
        // local name = ""
        // for i = 1, 1000 do
        //     name = (part1[math.random(#part1)] or "") .. (part2[math.random(#part2)] or "")

        //     if not ul.mgrWordFilter:hasSymbol(name) and ul.mgrWordFilter:checkStr(name) then
        //         -- 通过
        //         break
        //     end
        // end

        // return name

        let part1 = mgrCfg.getDb("random_name_part1_db");
        let part2 = mgrCfg.getDb("random_name_part2_db");

        // ul.dump(part1, "part1");
        // ul.dump(part2, "part2");

        // cc.log(part1[0]);
        // cc.log(part2[0]);
        // -- 创建随机名字
        // -- 由于随机名字可能会被屏蔽掉，这里处理一下
        let name = "";
        for (let i = 0; i < 1000; i++) {
            let randomName = part1[Tools.random(part1.length) - 1].word + part2[Tools.random(part2.length) - 1].word;
            // randomName = "《逼羊为狼》"
            if (!mgrWordFilter.hasSymbol(randomName) && mgrWordFilter.checkStr(randomName)) {
                name = randomName
                break;
            }
        }
        return name;
    }

    public static calcRandomHeadIcon(): string {
        let index = Tools.random(1, 6);
        let path = ul.format("2d/npc/npc_q_0%d", index);
        return path;
    }

    // ----------- 61 皮肤相关 ----------------

    public static setCurSkinWallId ( itemId: number ) {
        if ( this._curSkinWall == itemId ) { return; }
        this._curSkinWall = itemId;
        this.saveRecord();
    }
    public static getCurSkinWallId (): number {
        return this._curSkinWall;
    }
    public static getCurSkinWallColor (): cc.Color {
        return this.getSkinWallColorByItemId( this._curSkinWall  );
    }
    public static getSkinWallColorByItemId ( itemId: number ) {
        let itemData = mgrCfg.get_from_item_template_db( itemId );
        if ( !itemData ) { return cc.color( 0,0,0 ); }

        let data = itemData.data;
        return cc.color( data.r, data.g, data.b );
    }



    // ---------------- 分享相关 -----------------------
    public static canShare () {
        let haveCount = mgrPlayer.getItemAmount( Const.ITEM_ID_SHARE_COUNT ) > 0;
        let bCop = mgrSdk.getCopNumberValueByKey("b_share") == 1;
        return (haveCount && !mgrGuide.isGuiding() && bCop);
    }

    // 弹出分享弹窗
    public static tryShowShare ( msg: string, callfun = null ) {
        if (mgrPlayer.getItemAmount( Const.ITEM_ID_SHARE_COUNT ) <= 0) {
            return;
        }
        let str = "";
        if ( msg ) {
            str = msg + `分享可获得 ${SHARE_REWARD} 金币`;
        } else {
            str = `分享可获得 ${SHARE_REWARD} 金币`;
        }
        mgrTip.alertPrompt2(
			"每日分享",
			str,
			"取消",
			"分享",
			null,
			()=>{
                mgrSdk.shareImage("","","","");
                if( callfun ) {
                    callfun();
                }
			},
		);
    }

    private static onMsgShareResult (e) {
        let data = e;
        let bSuccess = data.bSuccess;
        if ( bSuccess ) {
            mgrTip.showMsgTip("分享成功");
            if(this.getItemAmount(Const.ITEM_ID_SHARE_COUNT) <= 0){
                // mgrTip.showMsgTip("今日分享次数已用尽")
                return
            }
            // 分享奖励
            mgrPlayer.addItemAmount(Const.ITEM_ID_GOLD, SHARE_REWARD, "分享成功");
            mgrTip.addGotItemTip(Const.ITEM_ID_GOLD, SHARE_REWARD, null);
            mgrPlayer.addItemAmount(Const.ITEM_ID_SHARE_COUNT, -1, "分享")
        } else {
            mgrTip.showMsgTip("分享失败");
        }
    }

    // ------------------- 微信公众号奖励 ---------------------

    /** 领取微信公众号奖励 */
    public static takeWxgzhReward (): number {
        this.isNeedAlertWxgzhReward = false;
        this.isGetWxgzhReward = true;
        let count = 300;
        mgrPlayer.addItemAmount( Const.ITEM_ID_GOLD, count, "微信公众号奖励" );
        this.saveRecord();
        return count;
    }

    private static onMsgWxgzhEnterInit (e) {
        // 没有领过，记录需要提示，并主动激活一次
        if ( !this.isGetWxgzhReward ) {
            this.isNeedAlertWxgzhReward = true;
        }
    }

    private static onMsgWxgzhEnterGame (e) {
        if ( !this.isGetWxgzhReward ) {
            let count = this.takeWxgzhReward();
            Timer.callLater(0.5, ()=>{
                mgrTip.showMsgTip("微信公众号奖励 金币x" + count );
            })
        }
    }

    private static onMsgSdkShareVideoResult ( e ) {
        let data = e;
        if ( data.isSuccess ) {
            mgrTip.showMsgTip("分享成功");
            if ( mgrPlayer.getItemAmount( Const.ITEM_ID_VIDEO_SHARE_COUNT ) > 0 ) {
                mgrPlayer.addItemAmount(Const.ITEM_ID_VIDEO_SHARE_COUNT, -1, "分享成功");
                mgrPlayer.addItemAmount(Const.ITEM_ID_GOLD, VIDEO_SHARE_REWARD, "分享成功");
                mgrTip.addGotItemTip(Const.ITEM_ID_GOLD, VIDEO_SHARE_REWARD, null);
            }
        } else {
            mgrTip.showMsgTip("分享失败");
        }
    }


}