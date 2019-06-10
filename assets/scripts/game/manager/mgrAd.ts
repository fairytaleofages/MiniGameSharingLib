import Manager from "../../ulframework/manager/Manager";
import mgrRecord from "./mgrRecord";
import Tools from "../../ulframework/utils/Tools";
import mgrCfg from "./mgrCfg";
import mgrAlu from "./mgrAlu";
import mgrSdk from "./mgrSdk";
import mgrPlayer from "./mgrPlayer";
import mgrSound from "./mgrSound";
import mgrTip from "./mgrTip";
import Timer from "../../ulframework/utils/Timer";
// import vAdWaitingDialog from "../view/dialog/vAdWaitingDialog";
// import vAdFaildDialog from "../view/dialog/vAdFaildDialog";
import mgrDirector from "./mgrDirector";
import Const, { AdMode } from "../Const";

export type TNativeData = {
    nativeType: number,
    /** 流水id */
    id: number,
    /** 图片url */
    url: string,
    /** 图片精灵 */
    frame: cc.SpriteFrame,
    /** 广告标题 */
    title: string,
    /** 广告正文 */
    desc: string,
    /** 跳转按钮文字 */
    targetTitle: string,
}

// const { ccclass } = cc._decorator;

// @ccclass
export default class mgrAd extends Manager {
    ///// 成员变量 /////
    private static lastFinishedTimes: { [adEventId: string]: number } = {};
    private static lastTriggerAdEventId: string = null;
    private static lastTriggerAdEventParam: any = null

    private static lastRequestNativeDataTimes: { [nativeType: number]: number } = {};
    private static cacheNativeDatas: { [nativeType: number]: TNativeData } = {};

    private static timeoutTimer: Timer;


    private static NATIVE_ID = 0;
    private static NATIVE_INTERSITIAL_AD_EVENT_ID = "native_intersitial";

    // 每次adEvent触发的唯一流水号
    private static AD_EVENT_SERIAL_NUMBER = 0;

    private static availableNativeTypes = [];

    // 已下载的图片  [fileName] = cc.SpriteFrame,
    private static downloadedImgFrame = {};

    // 已经完成的广告流水号 [serialNumber] = boolean
    private static successedAdEventSerialNumbers: { [serialNumber: number]: boolean } = {};

    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this.loadRecord();

        this.registerListeners({
            MSG_ADV_SHOW_RESULT: this.onMsgAdvShowResult,
            MSG_ADV_CLOSE_RESULT: this.onMsgAdvCloseResult,
            MSG_ADV_INFO_RESULT: this.onMsgAdvInfoResult,
            MSG_LIFE_CYCLE: this.onMsgLifeCycle,
            MSG_AD_EVENT_SUCCESSD: this.onMsgAdEventSuccessd,

            MSG_ITEM_AMOUNT_CHANGED: this.onMsgItemAmountChanged,
        })
    }

    protected static loadRecord(): void {
        super.loadRecord();
        let record: any = mgrRecord.getData("ad") || {};

        this.lastFinishedTimes = record.lastFinishedTimes || {};
    }

    protected static saveRecord(): void {
        super.saveRecord();

        let record = {
            lastFinishedTimes: this.lastFinishedTimes || {},
        };

        mgrRecord.setData("ad", record);
    }










    ///// 触发广告相关 /////
    /**
     * 检查广告是否有几率能触发
     * @param adEventId 
     */
    public static isAdEventHasChanceTrigger(adEventId: string): boolean {
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) {
            return false;
        }

        // cc.log("mgrAd.preCheckCanTriggerAdEvent", adEventId, adEventData);

        //检查筛选器
        if (!mgrAlu.check(adEventData.aluId)) {
            // cc.log("  alu不通过，不通过");
            return false;
        }

        //概率
        let ratio = adEventData.ratio;
        if (adEventData.ratioFromCopKey) {
            ratio = mgrSdk.getCopNumberValueByKey(adEventData.ratioFromCopKey);
            // cc.log("  use cop ratio:", ratio)
        }

        if (ratio <= 0) {
            return false
        };

        //检查去除广告道具
        if (adEventData.wipeItemId > 0 && mgrPlayer.getItemAmount(adEventData.wipeItemId) > 0) {
            cc.log("  去广告，不通过")
            return false;
        }

        return true;
    }
    /**
     * 预检查广告事件是否可以触发
     * @param adEventId 
     */
    public static preCheckCanTriggerAdEvent(adEventId: string): boolean {
        // 检查cd
        if ( this.getAdEventRemainCd(adEventId) > 0 ) {
            cc.log("  冷却时间未到，不通过");
            return false;
        }
        return this.preCheckCanTriggerAdEventWithoutCd(adEventId);
    }

    /** 预检测 不查cd */
    public static preCheckCanTriggerAdEventWithoutCd(adEventId: string): boolean {
        //关闭了广告
        if (mgrSdk.getCopAdMode() == AdMode.none) {
            return false
        }

        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) {
            return false;
        }

        cc.log("mgrAd.preCheckCanTriggerAdEvent", adEventId, adEventData);

        if (!this.isAdTypeValid(adEventId)) {
            cc.log("  广告没有次数了 ");
            return false;
        }

        //检查筛选器
        if (!mgrAlu.check(adEventData.aluId)) {
            cc.log("  alu不通过，不通过");
            return false;
        }

        //概率
        let ratio = adEventData.ratio;
        if (adEventData.ratioFromCopKey) {
            ratio = mgrSdk.getCopNumberValueByKey(adEventData.ratioFromCopKey);
            cc.log("  use cop ratio:", ratio)
        }

        cc.log("  触发几率：", ratio)
        if (Tools.random(100) > ratio) {
            //不通过
            cc.log("  概率不通过，不通过")
            return;
        }

        //检查去除广告道具
        if (adEventData.wipeItemId > 0 && mgrPlayer.getItemAmount(adEventData.wipeItemId) > 0) {
            cc.log("  去广告，不通过")
            return false;
        }

        return true;
    }


    /**
     * 触发广告
     * @param adEventId 
     * @param param 
     */
    public static triggerAdEvent(adEventId: string, param?: Object, bIgnoreCheck?: boolean): void {
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) return;

        cc.log("mgrAd.触发广告事件", adEventId, param, bIgnoreCheck);

        if (!bIgnoreCheck && !this.preCheckCanTriggerAdEvent(adEventId)) {
            cc.log("    preCheckCanTriggerAdEvent 不通过");
            return;
        }

        // 检查cd
        if ( this.getAdEventRemainCd(adEventId) > 0 ) {
            cc.log("  冷却时间未到，不通过");
            return;
        }

        // 使用ad_event_db中的param初始化
        let userData: any = {};
        Tools.forEachMap(adEventData.param, (k, v) => {
            userData[k] = v;
        });
        // 使用自定义的param进行覆盖
        if (param) {
            Tools.forEachMap(param, (k, v) => {
                userData[k] = v;
            });
        }

        userData.adEventId = adEventId;
        userData.advInfo = adEventData.advInfo;

        // 写入流水号
        userData.serialNumber = this.AD_EVENT_SERIAL_NUMBER;
        this.AD_EVENT_SERIAL_NUMBER++;

        //尝试停止音乐
        if (adEventData.bPauseSound) {
            mgrSound.pauseSound();
        }

        // 标记触发cd
        this.lastTriggerAdEventId = adEventId;
        this.lastTriggerAdEventParam = param;

        if (adEventData.timeout > 0) {
            this.showWaiting();

            this.startTimeoutTimer(adEventData.timeout);

            // // 测试代码
            // if (Tools.random(100) <= 50) {
            //     cc.log("模拟失败");
            //     return;
            // } else {
            //     let timeout = Tools.random(10);
            //     cc.log(ul.format("等待%d秒", timeout));
            //     Timer.callLater(timeout, () => {
            //         this.sendMsg("MSG_ADV_SHOW_RESULT", {
            //             type: adEventData.type,
            //             displayTime: (adEventData.displayTime > 0 && adEventData.displayTime || null),
            //             gravity: (adEventData.gravity != "" && adEventData.gravity || null),
            //             userData: JSON.stringify(userData),
            //             code: 1,
            //         });
            //     });
            //     return;
            // }

        }

        // 处理原生插屏替换事宜
        if (adEventData.bCanReplaceToNativeInstitial && this.preCheckCanTriggerAdEvent(mgrAd.NATIVE_INTERSITIAL_AD_EVENT_ID)) {
            if (this.tryShowNativeInstitial(adEventId, userData)) {
                return;
            }
        }

        this.markFinished(adEventId);

        cc.log("  开始广告", adEventData.cmd, adEventData.type)
        // 判断平台
        if (this.isIgnoreAd()) {
            // mgrTip.showMsgTip("跳过广告");
            this.sendMsg("MSG_ADV_SHOW_RESULT", {
                advData: {
                    type: adEventData.type,
                    displayTime: (adEventData.displayTime > 0 && adEventData.displayTime || null),
                    gravity: (adEventData.gravity != "" && adEventData.gravity || null),
                    userData: JSON.stringify(userData),
                    
                },
                code: 1,
            });
            this.sendMsg("MSG_ADV_CLOSE_RESULT", {
                type: adEventData.type,
                displayTime: (adEventData.displayTime > 0 && adEventData.displayTime || null),
                gravity: (adEventData.gravity != "" && adEventData.gravity || null),
                userData: JSON.stringify(userData),
                code: 1,
            });

        } else {
            let msgData = {
                cmd: adEventData.cmd,
                data: {
                    type: adEventData.type,
                    displayTime: (adEventData.displayTime > 0 && adEventData.displayTime || null),
                    gravity: (adEventData.gravity != "" && adEventData.gravity || null),
                    userData: JSON.stringify(userData),
                    advId: adEventData.advId || "",
                    nativeType: adEventData.nativeType || null,
                    code: adEventData.code || null,
                },
            }

            ul.dump(msgData)
            mgrSdk.sendMsgToSdk(msgData);
        }

        //触发统计
        if (adEventData.statisticsSdkEvent && adEventData.statisticsSdkEvent.length > 0) {
            mgrSdk.statisCommonEvent(adEventData.statisticsSdkEvent);
        }
    }

    /**
     * 重试上次请求的adEvent
     */
    public static retryLastTriggerAdEvent(): void {
        if (!this.lastTriggerAdEventId) {
            cc.warn("mgrAd.retryLastTriggerAdEvent lastTriggerAdEventId not found!");
            return;
        }

        // 强制触发上一次的adEvent
        this.triggerAdEvent(this.lastTriggerAdEventId, this.lastTriggerAdEventParam, true);
    }

    /**
     * 开启超时计时器
     * @param timeout 
     */
    private static startTimeoutTimer(timeout: number): void {
        this.stopTimeoutTimer();

        this.timeoutTimer = new Timer(timeout, 1, () => {
            this.stopTimeoutTimer();

            this.showFaild();
        });
        this.timeoutTimer.start();
    }

    /**
     * 停止超时计时器
     */
    private static stopTimeoutTimer(): void {
        if (this.timeoutTimer) {
            this.timeoutTimer.stop();
            this.timeoutTimer = null;
        }
    }











    ///// UI提示相关 /////
    public static showWaiting() {
        // cc.log("mgrNetwork.showWaiting");

        // this.hideWaiting();
        // this.hideFaild();

        // let dialog = new vAdWaitingDialog();
        // dialog.openDialog();
    }

    public static hideWaiting(): void {
        this.sendMsg("MSG_AD_CLOSE_WAITING");
    }

    public static showFaild(): void {
        // this.hideWaiting();
        // this.hideFaild();

        // let dialog = new vAdFaildDialog();
        // dialog.openDialog(true);
    }

    public static hideFaild(): void {
        this.sendMsg("MSG_AD_CLOSE_FAILD");
    }









    ///// 原生广告数据加载相关 /////
    /**
     * 获取缓存的原生广告数据
     * @param adEventId 
     */
    public static getNativeDataByAdEventId(adEventId: string): TNativeData {
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) return null;

        return this.getNativeDataByNativeType(adEventData.nativeType);
    }

    /**
     * 获取缓存的原生广告数据
     * @param nativeType 
     */
    public static getNativeDataByNativeType(nativeType: number): TNativeData {
        return this.cacheNativeDatas[nativeType];
    }

    /**
     * 尝试请求所有的原生广告数据
     */
    public static tryRequestAllNativeData(bIgnoreCache?: boolean) {
        let requestNativeDataLog = {};

        mgrCfg.forDb("ad_event_db", (k, v) => {
            if (v.nativeType) {
                if (bIgnoreCache || !requestNativeDataLog[v.nativeType]) {
                    requestNativeDataLog[v.nativeType] = true;

                    this.tryRequestNativeData(v.id, bIgnoreCache);
                }
            }
        });
    }

    /**
     * 请求原生广告数据
     */
    public static tryRequestNativeData(adEventId: string, bIgnoreCache?: boolean) {
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) return;

        // 检查广告是否激活
        if (!this.isAdEventHasChanceTrigger(adEventId)) return;

        let nativeType = adEventData.nativeType;

        // 检查缓存的数据，如果找到，则使用缓存的数据接口，不用再次请求
        if (!bIgnoreCache) {
            let cacheNativeData = this.cacheNativeDatas[nativeType];
            if (cacheNativeData) {
                // // 找到了缓存的数据，延迟一帧通过msg广播一轮
                // Timer.callLater(0.1, () => {
                //     this.sendMsg("MSG_AD_NATIVE_DATA_REFRESH", { nativeType: nativeType });
                // });
                return;
            }
        }

        let lastRequestTime = this.lastRequestNativeDataTimes[nativeType] || 0;
        let requestCd = mgrSdk.getCopNumberValueByKey("ad_native_close_request_cd");
        if (Tools.time() - lastRequestTime <= requestCd) {
            cc.warn("mgrAd:tryRequestNativeData 请求cd中，请稍后再试");
            return;
        }

        // 记录上次请求时间
        this.lastRequestNativeDataTimes[nativeType] = Tools.time();

        let userData = {
            nativeType: nativeType,
        };

        // 清理缓存
        this.cacheNativeDatas[nativeType] = null;
        this.sendMsg("MSG_AD_NATIVE_DATA_REFRESH", { nativeType: nativeType });


        if (!cc.sys.isNative) {
            // 浏览器或者电脑
            Timer.callLater(0.1, () => {
                let demoUrls = [
                    "http://www.ultralisk.cn/d/file/HotGames/2018-07-24/69328da45b23639618d79c124f8c0c3a.png",
                    "http://www.ultralisk.cn/d/file/HotGames/2018-05-09/7757d65d1a7103f00418059774993bf3.png",
                    "http://www.ultralisk.cn/d/file/HotGames/2018-04-18/765538bd4f97e0b100d026350746de59.png",
                    "http://www.ultralisk.cn/d/file/HotGames/2018-01-23/8fa7b4928924aaed8615ae7ded47d28e.png",
                    "http://www.ultralisk.cn/d/file/HotGames/2018-01-23/ad353a84a90d4d0139f42adefafe4b1e.png",
                    "http://www.ultralisk.cn/d/file/HotGames/2017-09-14/17ef0556ffd313cf58abb5f212945edd.png",
                    "http://www.ultralisk.cn/d/file/HotGames/2017-09-07/44b3c9d560729bd57c1f2f4f9c886745.png",
                    "http://www.ultralisk.cn/d/file/yeluoli/2017-05-08/9ba813e1d318382891ce4dbe7303c2fd.jpg",
                    "http://www.ultralisk.cn/d/file/FriendLink/2016-11-16/ce089ef6334447830d22d61d610bbdeb.png",
                    "http://www.ultralisk.cn/d/file/FriendLink/2016-09-19/269d373c9a2e89a73f17985431df3b19.png",
                ];

                let titles = [
                    "测试",
                    "测试标题",
                    "测试标题标题",
                    "测试标题标题标题",
                    "测试标题标题标题标题",
                    "测试标题标题标题标题标题",
                    "测试标题标题标题标题标题标题",
                    "测试标题标题标题标题标题标题标题",
                    "测试标题12412412412",
                    "测试标题测试标题测试标题测试标题",
                ];

                let r = Tools.random(10) - 1;
                let nativeData = {
                    url: demoUrls[r],
                    title: titles[r],
                    desc: "测试内容测试内容测试内容测试内容测试内容" + r,
                    targetTitle: "查看详情" + r,
                };

                this.sendMsg("MSG_ADV_INFO_RESULT", {
                    cmd: "/adv/advInfoResult",
                    code: "1",
                    type: adEventData.type,
                    userData: JSON.stringify(userData),
                    nativeData: JSON.stringify(nativeData),
                })
            });

        } else {
            // 向sdk请求
            let msgData = {
                cmd: "/adv/getAdvInfo",
                data: {
                    type: adEventData.type,
                    userData: JSON.stringify(userData),
                    advId: adEventData.advId || "",
                    nativeType: nativeType,
                },
            };

            mgrSdk.sendMsgToSdk(msgData);
        }
    }

    private static tryShowNativeInstitial(adEventId: string, userData: any) {
        cc.log("mgrAd:tryShowNativeInstitial", adEventId)
        let nativeData = this.getNativeDataByAdEventId(mgrAd.NATIVE_INTERSITIAL_AD_EVENT_ID)
        // cc.log("  nativeData", nativeData)
        if (!nativeData) {
            mgrAd.tryRequestNativeData(mgrAd.NATIVE_INTERSITIAL_AD_EVENT_ID);
            return false;
        }

        // 关于插屏的几个关键点
        // 在原生插屏dialog展示后，触发原本adEvent的展示成功回调
        // 在原生插屏播放成功后，触发原本adEvent的点击回调

        mgrDirector.openDialog("vAdNativeDialog", {
            adEventId: mgrAd.NATIVE_INTERSITIAL_AD_EVENT_ID,
            originAdEventId: adEventId,
            originUserData: userData,
        });

        return true
    }

    // 原生广告展示（如同插屏展示，需告知sdk）
    public static onNativeAdDisplayed(adEventId: string) {

        let adEventData = mgrCfg.get("ad_event_db", adEventId)
        if (!adEventData) { return }
        if (adEventData.nativeType == 0) { return }

        cc.log("原生广告展示成功", adEventId)

        // 发送原生广告展示回调
        let msgData = {
            cmd: adEventData.cmd,
            data: {
                type: adEventData.type,
                userData: {},
                nativeType: adEventData.nativeType || 1,
                code: 1, // code1为展示
            },
        }

        // dump(msgData)
        mgrSdk.sendMsgToSdk(msgData)
    }

    public static onReceiveSdkAvailableNativeTypes(availableNativeTypes: number[]): void {
        this.availableNativeTypes = availableNativeTypes;

        let defaultNativeType = 1;

        let hash = {};
        for (let i = 0; i < availableNativeTypes.length; i++) {
            let v = availableNativeTypes[i];
            hash[v] = true;
        }

        mgrCfg.forDb("ad_event_db", (k, v) => {
            if (v.nativeType && !hash[v.nativeType]) {
                cc.log(ul.format("mgrAd overwrite nativeType. adEventId: %s, nativeType: %d->%d", v.id, v.nativeType, defaultNativeType));
                v.nativeType = defaultNativeType;
            }
        });
    }








    ///// 事件 /////
    private static onMsgAdvShowResult(e) {
        let data = e;

        console.info("mgrAd.onMsgAdvShowResult")
        ul.dump(data, "data");

        let advData = data.advData;
        let userData = JSON.parse(advData.userData || "") || {};
        // let userData = JSON.parse(data.userData || "") || {};
        let adEventId = userData.adEventId || 0;
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) {
            cc.log("[warn] ul.mgrAd.onMsgAdvShowResult adEventId not found!")
            return;
        }

        // 收到任何对应的timeout的回调后，隐藏waiting和faild
        if (adEventData.timeout > 0) {
            this.hideWaiting();
            this.hideFaild();
            this.stopTimeoutTimer();
        }

        let code = parseInt(data.code);
        if (code == 0) {
            // // 无法获取广告
            // if (data.msg) {
            //     mgrTip.showMsgTip( data.msg );
            // }

            // 恢复声音
            if (adEventData.bPauseSound) mgrSound.resumeSound();

        } else if (code == 1) {
            // 播放成功

            // 恢复声音
            if (adEventData.bPauseSound) mgrSound.resumeSound();

            // 记录完成时间
            this.markFinished(adEventId);

        } else if (code == 2) {
            //中途取消

            //恢复声音
            if (adEventData.bPauseSound) mgrSound.resumeSound();

        } else if (code == 3) {
            //播放中

        } else if (code == 4) {
            //广告开始播放

        } else if (code == 5) {
            //广告点击

        } else if (code == 6) {
            //广告播放完毕

        } else if (code == 7) {
            //广告准备就绪

        } else {

        }

        // 检测code，触发adEvent成功的逻辑
        if (code == adEventData.successCode) {
            this._doAdEventSuccessdLogic(adEventId, userData);
        }
    }

    private static _doAdEventSuccessdLogic(adEventId: string, userData: any): void {
        // 根据流水号判定，每个adEvent只能成功一次
        let serialNumber = parseInt(userData.serialNumber) || 0;
        if (this.successedAdEventSerialNumbers[serialNumber]) {
            cc.warn(ul.format("mgrAd.onMsgAdvShowResult ad already do successd! adEventId=%s, serialNumber=%d", adEventId, serialNumber));
            return;
        }
        this.successedAdEventSerialNumbers[serialNumber] = true;

        let adEventData = mgrCfg.get("ad_event_db", adEventId);

        //尝试发奖
        let gotItemTipDatas = []
        let rewards = userData.rewards || adEventData.param.rewards;
        if (rewards) {
            rewards.forEach(element => {
                let [itemId, minAmount, maxAmount, bIgnoreTip] = element;
                let amount = 0;
                if (!minAmount) {
                    amount = maxAmount;
                }
                else if (!maxAmount) {
                    amount = minAmount;
                }
                else {
                    amount = Math.random() * (maxAmount - minAmount) + minAmount;
                }
                amount = Math.floor(amount);
                mgrPlayer.addItemAmount(itemId, amount, adEventData.statisticsSdkEvent);
                if (!bIgnoreTip) {
                    gotItemTipDatas.push({ itemId: itemId, amount: amount, amountSteps: [[amount, 0]], customerContext: { bBanAdReward: true } })
                }
            });
        }

        //尝试boxid发奖
        let rewardBoxId = userData.rewardBoxId != null ? userData.rewardBoxId : adEventData.param.rewardBoxId;
        if (rewardBoxId) {
            let result = mgrPlayer.openItemBox(rewardBoxId);
            result.forEach(element => {
                let [itemId, amount] = element;
                mgrPlayer.addItemAmount(itemId, amount, adEventData.statisticsSdkEvent);
                gotItemTipDatas.push({ itemId: itemId, amount: amount, amountSteps: [[amount, 0]], customerContext: { bBanAdReward: true } })
            });
        }

        // 展示获得物品提示
        if (gotItemTipDatas.length > 0) {
            mgrTip.addGotItemTipGroup(gotItemTipDatas);
        }

        //抛出一个消息
        this.sendMsg("MSG_AD_EVENT_SUCCESSD", {
            adEventId: adEventId,
            userData: userData,
        })
    }

    // 广告关闭回调（应客户端要求插屏用户关闭，也会发这个，代替某些渠道没有激励插屏）
    private static onMsgAdvCloseResult(e) {
        let data = e;

        console.info("mgrAd.onMsgAdvCloseResult")
        ul.dump(data, "data");
        let userData = JSON.parse(data.userData || "") || {};
        let adEventId = userData.adEventId || 0;
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) {
            cc.log("[warn] ul.mgrAd.onMsgAdvShowResult adEventId not found!")
            return;
        }
        if (data.code == 1) {
            this.sendMsg("MSG_AD_EVENT_CLOSED", {
                adEventId: adEventId,
                userData: userData,
            });
        }
    }

    private static onMsgAdvInfoResult(e) {
        let data = e;

        // 提取userData，获取nativeType
        let userData = JSON.parse(data.userData || "") || {};
        let nativeType = parseInt(userData.nativeType);
        if (!nativeType) {
            cc.warn("mgrAd.onMsgAdvInfoResult nativeType not found!");
            return;
        }

        // 提取nativeData
        let nativeData = JSON.parse(data.nativeData || "") || {};

        if (!nativeData.title) nativeData.title = "广告标题";
        if (!nativeData.desc) nativeData.desc = "广告内容";
        if (!nativeData.targetTitle) nativeData.targetTitle = "查看详情";

        if (!nativeData.url) {
            cc.warn(" onMsgAdvInfoResult nativeData.url is null, url : ", nativeData.url);
            return;
        }

        // 判断是否需要重新下载

        // 有缓存
        if (!!this.downloadedImgFrame[nativeData.url]) {
            cc.log("图片资源已缓存，直接使用");
            nativeData.frame = this.downloadedImgFrame[nativeData.url];

            // 写入流水号
            mgrAd.NATIVE_ID++;
            nativeData.id = mgrAd.NATIVE_ID;

            // 写入缓存
            this.cacheNativeDatas[nativeType] = nativeData;

            this.sendMsg("MSG_AD_NATIVE_DATA_REFRESH", { nativeType: nativeType });

            return;
        }

        // 没有缓存，下载图片
        cc.loader.load({ url: nativeData.url, type: "png" }, (err, tex) => {
            if (err) {
                cc.error(" onMsgAdvInfoResult load err: ", err.message);

                // 资源下载失败

                return;
            }

            let frame = new cc.SpriteFrame(tex);
            nativeData.frame = frame;

            // 缓存 frame
            this.downloadedImgFrame[nativeData.url] = frame;

            // 写入流水号
            mgrAd.NATIVE_ID++;
            nativeData.id = mgrAd.NATIVE_ID;

            // 写入缓存
            this.cacheNativeDatas[nativeType] = nativeData;

            // // 清理上次请求时间
            // this.lastRequestNativeDataTimes[nativeType] = null;

            this.sendMsg("MSG_AD_NATIVE_DATA_REFRESH", { nativeType: nativeType });
        })

    }

    private static onMsgLifeCycle(e) {
        let lifeCycle = e;
        if (lifeCycle == "onResume") {
            // mgrAd.triggerAdEvent("game_resume");
        }
    }

    private static onMsgAdEventSuccessd(e) {
        let data = e;

        // mgrCfg.forDb("ad_reward_db", (key, value) => {
        //     if (value.adEventId == data.adEventId && ) {
        //         this.rewardReceivedCounts[value.id] = (this.rewardReceivedCounts[value.id] || 0) + 1;
        //         this.saveRecord();
        //     }
        // });

        let adEventId = data.adEventId;
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) return;

        if (adEventData.remainCountItemId > 0) {
            mgrPlayer.addItemAmount(adEventData.remainCountItemId, -1, "广告播放次数");
        }

        // 判断是否为原生广告
        if (adEventData.nativeType != 0) {
            // 清理上次请求时间
            this.lastRequestNativeDataTimes[adEventData.nativeType] = null;

            // 原生广告播放成功，重新请求一次
            this.tryRequestNativeData(adEventId, true)
        }
    }

    private static onMsgItemAmountChanged(e) {
        let data = e;
        let itemId = data.itemId;

        // 跳过广告物品拿到后，关闭banner
        if (itemId == Const.ITEM_ID_WIPE_AD && mgrPlayer.getItemAmount(itemId) > 0) {
            mgrSdk.closeAdv("banner");
        }
    }



    //获取一个随机奖励id
    public static getRandomRewardId(): any {
        let arr = [];
        let totalWeight = 0;
        mgrCfg.forDb("ad_reward_db", (k, v) => {
            if (this.getRewardRemainCount(v.id) > 0) {
                arr.push(v);
                // totalWeight = totalWeight + v.weight;
            }
        })

        if (arr.length <= 0) {
            return null;
        }

        let v = Tools.calcWheelTarget(arr, "weight");
        if (v) {
            return v.id;
        }

        return null;
    }

    /**
     * 获取adReward剩余次数
     * @param rewardId 
     */
    public static getRewardRemainCount(rewardId: number) {
        // cc.log("getRewardRemainCount", rewardId)
        let rewardData = mgrCfg.get("ad_reward_db", rewardId);
        return this.getAdEventRemainCount(rewardData.adEventId);
    }

    /**
     * 获取adEvent日常剩余次数
     * @param adEventId 
     */
    public static getAdEventRemainCount(adEventId: string): number {
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) return 0;

        // alu不通过
        if (adEventData.aluId && !mgrAlu.check(adEventData.aluId)) {
            // cc.log("alu un pass")
            return 0;
        }

        // 概率为0的不通过
        let ratio = adEventData.ratio;
        if (adEventData.ratioFromCopKey && adEventData.ratioFromCopKey.length > 0) {
            ratio = mgrSdk.getCopNumberValueByKey(adEventData.ratioFromCopKey);
        }
        if (ratio <= 0) {
            return 0;
        }

        // 判断剩余次数itemId
        if (adEventData.remainCountItemId > 0) {
            return mgrPlayer.getItemAmount(adEventData.remainCountItemId);

        } else {
            // 没限制，始终返回1
            return 1;
        }
    }

    /**
     * 获取广告事件剩余cd 
     * @param adEventId 
     */
    public static getAdEventRemainCd(adEventId: string): number {
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) return 0;

        if (adEventData.cd > 0) {
            let lastFinishedTime = this.getLastFinishedTime(adEventId);
            let cdFinishTime = lastFinishedTime + adEventData.cd;

            return Math.max(0, cdFinishTime - Tools.time());
        }

        return 0;
    }

    /**
     * 获取上次完成的时间
     * @param adEventId 
     */
    public static getLastFinishedTime(adEventId: string): number {
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) return 0;

        let cdGroup = adEventData.id;
        if (adEventData.cdGroup) {
            cdGroup = adEventData.cdGroup;
        }

        return this.lastFinishedTimes[cdGroup] || 1;
    }

    /**
     * 标记广告播放完成
     * @param adEventId 
     */
    public static markFinished(adEventId: string): void {
        let adEventData = mgrCfg.get("ad_event_db", adEventId);
        if (!adEventData) return;

        let cdGroup = adEventData.id;
        if (adEventData.cdGroup) {
            cdGroup = adEventData.cdGroup;
        }

        this.lastFinishedTimes[cdGroup] = Tools.time();
        this.saveRecord();
    }






    public static closeAdv(adEventId: string) {
        let adEventData = mgrCfg.get_from_ad_event_db(adEventId);
        if (!adEventData) return;

        mgrSdk.closeAdv(adEventData.type);
    }


    /**
     * 广告的 广告类型是否可用
     * @param adEventId 
     */
    public static isAdTypeValid(adEventId: string): boolean {
        let adEventData = mgrCfg.get_from_ad_event_db(adEventId);
        if (!adEventData) return true;

        switch (adEventData.type) {
            case "video": return Const.AD_VIDEO_VALID_COUNT > 0;
            // case "interstitial": return Const.
        }

        // 没用限制的类型就直接返回true
        return true;
    }


    public static isIgnoreAd() {
        return mgrPlayer.getItemAmount(Const.ITEM_ID_WIPE_AD) > 0
    }


}