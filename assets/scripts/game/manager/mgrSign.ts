import Manager from "../../ulframework/manager/Manager";
import mgrRecord from "./mgrRecord";
import Const, { SignState } from "../Const";
import Tools from "../../ulframework/utils/Tools";
import mgrCfg from "./mgrCfg";
import mgrPlayer from "./mgrPlayer";
import mgrCop from "./mgrCop";

const { ccclass, property } = cc._decorator;

type TSignResult = {
    bSuccessd: boolean,
    rewardItemId: number,
    rewardAmount: number,
}

@ccclass
export default class mgrSign extends Manager {
    ///// 成员变量 /////
    private static signedDay: number = null;
    private static signedIndex: number = null;
    private static lastSignTime: number = null;










    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this.loadRecord();
    }

    protected static loadRecord(): void {
        super.loadRecord();

        let record = mgrRecord.getData("sign") || {};

        this.signedDay = record.signedDay || 0;
        this.signedIndex = record.signedIndex || 0;
        this.lastSignTime = record.lastSignTime || 0;
    }

    protected static saveRecord(): void {
        super.saveRecord();

        let record = {
            signedDay: this.signedDay,
            signedIndex: this.signedIndex,
            lastSignTime: this.lastSignTime,
        };

        mgrRecord.setData("sign", record);
    }









    ///// 接口 /////
    /**
     * 结合当前数据，获取签到状态
    */
    public static getState(): SignState {
        if (Tools.isOneDay(Tools.time(), this.lastSignTime)) {
            // 上次签到的时间是今天

            // 判断余下的是否可点
            let day = this.getSignDay();
            let index = this.getSignIndex();
            let dayDatas = mgrCfg.get("sign_db", day) || [];
            let data = dayDatas[index];

            if (!data) {
                return SignState.signed;
            } else {
                // 判断时间
                if (this.lastSignTime + data.rewardGap <= Tools.time()) {
                    return SignState.canSign;
                } else {
                    return SignState.waitGap;
                }
            }

        } else {
            // 判断是否有签到数据
            let day = this.getSignDay();
            let data = mgrCfg.quietGet("sign_db", day, 0);

            if (!data) {
                return SignState.signOver;
            } else {
                return SignState.canSign;
            }
        }
    }

    // 提取现在签到的day
    public static getSignDay(): number {
        if (Tools.isOneDay(Tools.time(), this.lastSignTime)) {
            return this.signedDay;
        } else {
            return this.signedDay + 1;
        }
    }

    // 提取现在签到的index
    public static getSignIndex(): number {
        if (Tools.isOneDay(Tools.time(), this.lastSignTime)) {
            // 上次签到是今天
            return this.signedIndex;
        } else {
            return 0;
        }
    }

    public static getSignedDayCount(){
        return this.signedDay
    }

    /**
     * 签到
     * @return TSignResult返回值
    */
    public static sign(): TSignResult {
        let result: any = { bSuccessd: false };

        let state = this.getState();
        if ( state != SignState.canSign) return result;

        let day = this.getSignDay();
        let index = this.getSignIndex();
        let data = mgrCfg.get_from_sign_db( day, index );

        // 调整签到当前签到的数据
        this.lastSignTime = Tools.time();
        this.signedDay = day;
        this.signedIndex = index + 1;
        this.saveRecord();

        // 发奖
        let rewardItemId = data.rewardItemId;
        let rewardAmount = data.rewardAmount;
        mgrPlayer.addItemAmount(rewardItemId, rewardAmount, "签到");


        // 准备返回值
        result.bSuccessd = true;
        result.rewardItemId = rewardItemId;
        result.rewardAmount = rewardAmount;

        return result;
    }

    /** 获取领取下一个奖励的剩余时间 */
    public static getRemainTime(): number {
        let state = this.getState();
        if (state != SignState.waitGap) return 0;


        let day = this.getSignDay();
        let index = this.getSignIndex();
        let dayDatas = mgrCfg.get("sign_db", day) || [];
        let data = dayDatas[index];

        if (!data) return 0;

        let receiveTime = this.lastSignTime + data.rewardGap;
        return Math.max(0, receiveTime - Tools.time());
    }

    public static getBadgeCout(){
        if (mgrSign.getState() == SignState.canSign) {
            return 1;
        }
        else{
            return 0;
        }
    }



    /** 获取签到会奖励的部件arr */
    public static getAllRewardParts () {
        let partIds = [];
        mgrCfg.forDb( "sign_db",( key, datas)=>{
            for (let index = 0; index < datas.length; index++) {
                const element: T_SIGN_DB = datas[index];
                let itemId = element.rewardItemId;
                let itemData = mgrCfg.get_from_item_template_db( itemId );
                if ( !!itemData && itemData.flag == Const.ITEM_FLAG_PART ) {
                    partIds.push( itemId );
                }
            }
        });

        return partIds;
    }



    public static isSignOver () {
        if ( this.signedDay == 7 && this.getState() == SignState.signOver ) {
            return true;
        }
        return false;
    }










}