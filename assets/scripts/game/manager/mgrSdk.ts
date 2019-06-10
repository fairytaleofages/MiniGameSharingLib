import Manager from "../../ulframework/manager/Manager";
import Const, { AdMode } from "../Const";
import mgrNative from "./mgrNative";
import mgrTip from "./mgrTip";
import mgrCop from "./mgrCop";


const { ccclass } = cc._decorator;

/**
 * sdk 管理器
 * 整合iso和android的sdk
 */
@ccclass
export default class mgrSdk extends Manager {
    //变量区
    private static DEBUG = true;





    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad();

        this.registerListeners({
            "MSG_NATIVE_CALLBACK": this.onMsgNativeCallback,
        });

        this.startProcMsg()
    }

    public static onLoadingComplete() {
        this.setVersion(2);
    }


    /**
     * 获取cop的number类型值
     * 
     * @param key 
     */
    public static getCopNumberValueByKey(key): number {
        return mgrCop.getNumberValue(key);
    }
    /**
     * 获取cop值
     * 默认返回 ""
     * 
     * @param key 
     */
    public static getCopByKey(key): string {
        return mgrCop.get(key);
    }


    /** 是否开启录屏 */
    public static isOpenVideoRecord () {
        return this.isCopOpenVideoRecord() && Const.IS_OPEN_VIDEO_RECORD;
    }

    /** 是否cop开启录屏 */
    public static isCopOpenVideoRecord () {
        return mgrSdk.getCopByKey("b_record_video") == "1" && mgrSdk.getCopByKey("sdk_is_open_videorecord") == "1";
    }

    /** 获取广告cop模式 */
    public static getCopAdMode (): AdMode {
        return mgrSdk.getCopNumberValueByKey("ad_mode");
    }

    /** 是否 cop 开启支付 */
    public static isOpenPay () {
        return Const.IS_COP_OPEN_PAY;
    }











    ///// 通信模块 /////
    /**
     * 发送消息至ULSDK
     * @param params 
     */
    public static sendMsgToSdk(params) {
        mgrNative.callNative("sendMsgToSdk", params);
    }


    public static onMsgNativeCallback(e) {
        let data = e;
        let responseData = data.responseData;
        let cmd = responseData.cmd;

        console.log("mgrSdk.onMsgNativeCallback", cmd)
        // ul.dump(data, "nativeCallback.data");

        switch (cmd) {
            // copinfo
            case "/c/channelInfoResult": {
                console.info("channelInfoResult");
                let data = responseData.data || {};

                // 渠道信息返回
                console.info("  copInfo", data.copInfo);
                mgrCop.onReceiveSdkCop(data.copInfo);

                this.sendMsg("MSG_CHANNEL_INFO_RESULT");
                break;
            }

            // 用户信息
            case "/c/getLoginUserMessage": {
                console.log("/c/getLoginUserMessage");
                let data = responseData.data || {};
                Const.IS_SHOW_URL_AD_ICON = data.isShowUrlAdIcon;
                Const.IS_COP_OPEN_PAY = data.isClosePay == 0 ? true : false;
                break;
            }

            // 登录结果
            case "/c/userLoginResult": {
                console.log("/c/userLoginResult");
                let data = responseData.data || {};
                if ( parseInt(data.code) == 1 ) {
                    console.info("登录 成功");
                    mgrTip.showMsgTip("登录成功");
                    this.sendMsg("MSG_SDK_USER_LOGIN_SUCCESS");
                } else {
                    console.info("登录 失败 ");
                    mgrTip.showMsgTip("登录失败");
                }
                break;
            }

            // 广告次数限制
            case "/c/advValidCount": {
                console.log("/c/advValidCount");
                let countData: {
                    video: number,
                    banner: number,
                    interstitial: number,
                    native: number
                } = responseData.data;

                Const.AD_VIDEO_VALID_COUNT = countData.video;
            
                this.sendMsg("MSG_ADV_VALID_COUNT", responseData.data);

                break;
            }

            // 广告显示回调
            case "/c/advShowResult": {
                console.log("/c/advShowResult");
                this.sendMsg("MSG_ADV_SHOW_RESULT", responseData.data);
                break;
            }

            // 关闭广告回调
            case "/c/closeAdvResult": {
                console.log("/c/closeAdvResult");
                this.sendMsg("MSG_ADV_CLOSE_RESULT", responseData.data);
                break;
            }

            // 分享回调
            case "/c/shareResult": {
                console.log("/c/shareResult");
                let data = responseData.data || {};
                let userData = data.userData || "";
                let bSuccess = false;
                if (parseInt(data.code) == 1) {
                    console.info("---/c/shareResult successed");
                    bSuccess = true;
                }
                else {
                    console.info("---/c/shareResult faild")
                }
                this.sendMsg("MSG_SHARE_RESULT", { bSuccess: bSuccess, userData: userData });
                break;
            }

            // 上传排行榜数据
            case "/c/saveRankResult": {
                console.log("/c/saveRankResult");
                let data = responseData.data || {};
                if ( parseInt(data.code) == 1 ) {
                    console.info("上传排行榜成功");
                } else {
                    console.info("上传排行榜失败");
                }
                break;
            }

            // 获取排行榜数据
            case "/c/getRankResult": {
                console.log("/c/getRankResult");
                let data = responseData.data || {};
                if ( parseInt(data.code) == 1 ) {
                    console.info("获取排行榜成功");
                    this.sendMsg("MSG_GET_RANK_RESULT", { msg: data.msg });
                } else {
                    console.info("获取排行榜失败");
                }
                break;
            }

            /** 今日头条 录屏行为 */
            case "/c/recorderVideoResult": {
                console.log("/c/recorderVideoResult");
                let data = responseData.data || {};
                if ( parseInt(data.code) == 1 ) {
                    console.info("录屏行为 成功 action: ", data.action);
                    this.sendMsg("MSG_SDK_RECORD_VIDEO_RESULT", { action: data.action, msg: data.msg });
                } else {
                    console.info("录屏行为 失败 action: ", data.action);
                    console.info("录屏行为 失败 msg: ", data.msg);
                }
                break;
            }

            /** 今日头条 录屏分享 */
            case "/c/shareVideoResult": {
                console.log("/c/shareVideoResult");
                let data = responseData.data || {};
                if ( parseInt(data.code) == 1 ) {
                    console.info("录屏分享 成功 msg: ", data.msg);
                    this.sendMsg("MSG_SDK_SHARE_VIDEO_RESULT", { isSuccess: true });
                } else {
                    console.info("录屏分享 失败 msg: ", data.msg);
                    this.sendMsg("MSG_SDK_SHARE_VIDEO_RESULT", { isSuccess: false });
                }
                break;
            }
            
            /** 统计 */
            case "/c/megadataServer": {
                console.log("/c/megadataServer");
                break;
            }

            /** 互推 */
            case "/c/jumpGameResult": {
                console.log("/c/jumpGameResult");
                break;
            }

            /** 微信公众号进入游戏 */
            case "/c/extraBonus": {
                console.log("/c/extraBonus");
                let data = responseData.data || {};
                if ( parseInt(data.isInitGame) == 1 ) {
                    console.info("微信公众号进入 初始化");
                    this.sendMsg("MSG_WX_GZH_ENTER_INIT");
                } else {
                    console.info("微信公众号进入 游戏中");
                    this.sendMsg("MSG_WX_GZH_ENTER_GAME");
                }
                break;
            }

            /** 开启交叉推荐结果 */
            case "/c/openRecommendationResult": {
                console.log("/c/openRecommendationResult");
                break;
            }

            /** 关闭交叉推荐结果 */
            case "/c/closeRecommendationResult": {
                console.log("/c/closeRecommendationResult");
                break;
            }

            /** 支付结果 */
            case "/c/payResult": {
                console.log("/c/payResult");
                mgrTip.closeWaitingDialog();
                let data = responseData.data || {};
                let payData = data.payData || {};
                let payInfo = payData.payInfo || {}; 
                if ( parseInt(data.code) == 1 ) {
                    console.info("支付 成功 msg: ", data.msg);
                    this.sendMsg("MSG_SDK_PAY_SUC", { payId: payInfo.payId });
                } else {
                    console.info("支付 失败 msg: ", data.msg);
                    mgrTip.showMsgTip(data.msg);
                }
                break;
            }
           
        
            default:
                break;
        }
        
    }




    ///// 统计模块 /////

    /** 统计 */
    public static staticSdk ( data: string[] ) {
        this.sendMsgToSdk({
            cmd: "/c/megadataServer",
            data: data,
        });
    }

    /** 关卡开始统计 关卡id */
    public static statisOnStageStart(stageId: number) {
        if (this.DEBUG) {
            console.info("mgrSdk:statisOnStageStart(stageId)", stageId)
        }
        let data = ["level",stageId.toString()];
        this.staticSdk( data );
    }

    /** 签到统计
     * @param day 签到天数
     * @param times 天的第几次
     */
    public static statisOnSign(day: number, times: number) {
        if (this.DEBUG) {
            console.info("mgrSdk:statisOnSign(day)", day, " times: ", times);
        }
        let data = ["sign", day.toString(), times.toString()];
        this.staticSdk( data );
    }

    public static statisOnAddItemAmount(itemId: number, amountDelta: number, reason: string) {
    }

    public static statisOnItemBought(shopId: number, amount: number, reason: string) {
    }
    
    public static statisCommonEvent(e) {
    }







    ///// 其他接口 /////
    
    /** sdk第一步交互 */
    public static setVersion(version) {
        this.sendMsgToSdk({
            // cmd: "setVersion",
            cmd: "/c/setVersion",
            data: version,
        });
    }

    /** 分享 */
    public static shareImage(title: string, content: string, url: string, imagePath: string) {
        if (this.DEBUG) {
            console.info("mgrSdk:shareImage", title, content, url, imagePath)
        }

        this.sendMsgToSdk({
            cmd: "/c/openShare",
            data: {
                title: title,
                content: content,
                url: url,
                imagePath: imagePath,
                userData: "clientSend",
            },
        })
    }

    /** 关闭广告 */
    public static closeAdv ( type: string, userData?: object ) {
        this.sendMsgToSdk({
            cmd: "/c/closeAdv",
            data: {
                type: type,
                userData: userData
            }
        });
    }

    /** 上传排行数据 */ 
    public static uploadRankSdk ( totalIncome: number ) {
        console.log("uploadRankSdk");
        let time = new Date().getTime();
        mgrSdk.sendMsgToSdk({
            cmd: "/c/saveRankData",
            data: {
                startTime: (time - 10000).toString(),
                endTime: time.toString(),
                rankName: "排行榜",
                score: totalIncome,

                // 排序方式，从大到小，2从小到大，更多看文档
                order: 1,
            }
        });
    }

    /** 请求排行数据 */ 
    public static getRankListSdk ( rankType: number = 0, count: number = 100 ) {
        console.log("getRankListSdk");
        mgrSdk.sendMsgToSdk({
            cmd: "/c/getRankData",
            data: {
                // 请求数据数量
                dataNum: count,
                rankName: "排行榜",
                // 排序方式，从大到小，2从小到大
                order: 1,
                // 0: 好友排行榜，1: 群排行榜，2: 讨论组排行榜，3: C2C二人转，4: 普通排行榜(世界排行榜)
                rankType: rankType,
            }
        });
    }

    /** 开启互动广告 */
    public static openAdH5() {
        console.log("mgrSdk openAdH5");
        this.sendMsgToSdk({
            cmd: "/c/openAdv",
            data: {
                type: "url",
                gravity: null,
                userData: null,
            }
        });
    }

    /** 今日头条 录屏功能 */ 
    public static recordGameVideo ( action: string = "start", durTime: number = 120 ) {
        console.log("mgrsdk recordGameVideo");
        mgrSdk.sendMsgToSdk({
            cmd: "/c/recorderGameVideo",
            data: {
                // 行为 start开始， pause暂停，resume恢复，stop停止
                action: action,
                // 录制时间 10-120 秒 int
                durationTime: durTime,
            }
            
        });
    }

    /** 今日头条 录屏分享 */ 
    public static shareGameVideo () {
        console.log("mgrsdk shareGameVideo");
        mgrSdk.sendMsgToSdk({
            cmd: "/c/shareGameVideo",
        });
    }

    /** 登录 */ 
    public static userLogin () {
        console.log("mgrsdk userLogin");
        mgrSdk.sendMsgToSdk({
            cmd: "/c/userLogin",
        });
    }

    /** 互推广告 */
    public static jumpOtherGame( index: string ) {
        console.log("mgrSdk jumpOtherGame");
        this.sendMsgToSdk({
            cmd: "/c/jumpOtherGame",
            data: {
                gameIndex: index,
                userData: null,
            }
        });
    }


    /** 开启交叉推荐 */
    public static openCrossRecommend ( left: number, top: number, type: string = "carousel" ) {
        console.log("mgrSdk openCrossRecommend");
        this.sendMsgToSdk({
            cmd: "/c/openRecommendation",
            data: {
                type: type,
                style: {
                    left: left,
                    top: top,
                },
            }
        });
    }

    /** 关闭交叉推荐 */
    public static closeCrossRecommend () {
        console.log("mgrSdk closeCrossRecommend");
        this.sendMsgToSdk({
            cmd: "/c/closeRecommendation",
            data: null,
        });
    }


    /** 拉起支付 */
    public static openPay ( payId: string ) {
        console.log("mgrSdk openPay");
        if ( mgrTip.isWaitingDialogOpened() ) {
            mgrTip.showMsgTip("有商品正在支付中，请稍后再购买");
            return;
        }
        mgrTip.openWaitingDialog("提示", "支付中...");
        this.sendMsgToSdk({
            cmd: "/c/openPay",
            data: {
                payInfo: {
                    payId: payId
                },
            }
        });
    }

}