import Manager from "../../ulframework/manager/Manager";
import mgrRecord from "./mgrRecord";
import Tools from "../../ulframework/utils/Tools";
import Timer from "../../ulframework/utils/Timer";

const { ccclass } = cc._decorator;


const MINUTE_INCOME = 0.5;
const OFFLINE_MAX_TIME = 60 * 60 * 8;
const OFFLINE_SETTLE_MIN_TIME = 60 * 60;

@ccclass
export default class mgrRole extends Manager {
    ///// 成员变量 /////

    /**下线时间 */
    private static goOfflineTime: number = 0
    /**尚未结算的离线奖励队列 */
    private static willSettlementOfflineTimeQueue: number[] = []




    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()
        this.loadRecord();

        //上线结算
        this.trySettlementLastOfflineTime()
        //开启计时器  刷新下线时间(间隔1分钟)
        Timer.callLoop(60, () => {
            this.goOfflineTime = Tools.time()
            this.saveRecord()
        })
    }

    protected static loadRecord(): void {
        super.loadRecord();

        let record = mgrRecord.getData("role") || {};

        this.goOfflineTime = record.goOfflineTime || Tools.time();
        this.willSettlementOfflineTimeQueue = record.willSettlementOfflineTimeQueue || []
        this.saveRecord();
    }

    protected static saveRecord(): void {
        super.saveRecord();

        let record = {
            goOfflineTime: this.goOfflineTime,
            willSettlementOfflineTimeQueue: this.willSettlementOfflineTimeQueue,
        };

        mgrRecord.setData("role", record);
    }

    /**
     * 尝试结算最近一次的下线时间
     */
    private static trySettlementLastOfflineTime() {
        let goOnlineTime = Tools.time()
        let deltaTime = Math.floor(goOnlineTime - this.goOfflineTime)
        if (deltaTime >= OFFLINE_SETTLE_MIN_TIME) {
            this.willSettlementOfflineTimeQueue.push(deltaTime)
        }
    }

    // 尝试 结算离线收入
    public static getOfflineReward(): number[] {
        let pastTime = 0;
        let income = 0
        for (let index = 0; index < this.willSettlementOfflineTimeQueue.length; index++) {
            const time = this.willSettlementOfflineTimeQueue[index];
            pastTime += time
        }

        pastTime = pastTime > OFFLINE_MAX_TIME ? OFFLINE_MAX_TIME : pastTime
        income = Math.ceil(pastTime / 60 * MINUTE_INCOME)
        return [pastTime, income]
    }

    public static markOfflineRewardGeted() {
        this.willSettlementOfflineTimeQueue = []
        this.goOfflineTime = Tools.time();
        this.saveRecord();
    }
}
