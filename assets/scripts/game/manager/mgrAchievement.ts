import Manager from "../../ulframework/manager/Manager";
import sAchievement from "../struct/sAchievement";
import { AchievementState } from "../Const";
import mgrTip from "./mgrTip";
import mgrRecord from "./mgrRecord";
import Tools from "../../ulframework/utils/Tools";
import mgrCfg from "./mgrCfg";
import mgrPlayer from "./mgrPlayer";
import Timer from "../../ulframework/utils/Timer";
import mgrSound from "./mgrSound";

// const { ccclass } = cc._decorator;

// @ccclass
export default class mgrAchievement extends Manager {
    ///// 成员变量 /////
    private static achievements: { [id: number]: sAchievement } = {};

    private static cmdQueue: { [cmd: string]: boolean } = {};

    private static bAchievementTipEnabled = true;












    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this.loadRecord();

        this.registerListeners({
            MSG_ACHIEVEMENT_STATE_CHANGED: this.onMsgAchievementStateChanged,
            MSG_ITEM_AMOUNT_CHANGED: this.onMsgItemAmountChanged,
            MSG_STAGE_RATING_CHAGNED: this.onMsgStageRatingChanged,
            MSG_PET_LEVEL_CHANGED: this.onMsgPetLevelChanged,
            MSG_PET_ADVENTURE_CHANGED: this.onMsgPetAdventureChanged,
            MSG_PET_COMBINE_LOG_CHANGED: this.onMsgPetCombineLogChanged,
            MSG_PVE_COUNT_CHANGED: this.onMsgPveCountChanged,
        });

        Timer.callLoop(0.1, this.onTimerLoop.bind(this), true);
    }

    protected static loadRecord(): void {
        super.loadRecord();

        let record = mgrRecord.getData("achievement") || {};

        let achievementDatas = record.achievementDatas || {};

        mgrCfg.forDb_from_achievement_db((k, v) => {
            let achievement = new sAchievement(v.id);

            let recordData = achievementDatas[v.id];
            if (recordData) {
                achievement.setState(recordData.state);
            } else {
                achievement.setState(AchievementState.unlocked);
            }

            this.achievements[v.id] = achievement;
        });

        this.refreshAchievement(null, true);
    }

    protected static saveRecord(): void {
        super.saveRecord();

        let achievementDatas = {};
        Tools.forEachMap(this.achievements, (k, v) => {
            achievementDatas[v.id] = {
                state: v.state,
            };
        });

        let record = {
            achievementDatas: achievementDatas,
        };

        mgrRecord.setData("achievement", record);
    }

    private static onTimerLoop(timer: Timer) {
        this.tryRefreshAchievement();
    }









    ///// 数据读取 /////
    public static refreshAchievement(cmd: string, bSkipEffect?: boolean): void {
        let bNeedSave = false;

        Tools.forEachMap(this.achievements, (k, achievement: sAchievement) => {
            let bChanged = achievement.refreshState(cmd);
            bNeedSave = bNeedSave || bChanged;
            if (bChanged && !bSkipEffect) {
                // 播放特效
                this.sendMsg("MSG_ACHIEVEMENT_STATE_CHANGED", {
                    achievementId: achievement.id,
                    state: achievement.state,
                });
            }
        });

        if (bNeedSave) {
            this.saveRecord();
        }
    }

    /**
     * 领取奖励
     * @param aid 
     * @param reason 
     * @return [itemId, amount]
     */
    public static obtainReward(aid: number, reason: string): number[] {
        let achievement = this.achievements[aid];
        if (!achievement) {
            cc.warn(ul.format("mgrAchievement.obtainReward, achievement not found! aid = %s", aid));
            return [null, null];
        }

        if (achievement.state != AchievementState.finished) {
            cc.warn(ul.format("mgrAchievement.obtainReward, achievement state id not finished! aid = %s", aid));
            return [null, null];
        }

        // 发奖
        let itemId = achievement.template.rewardItemId;
        let amount = achievement.template.rewardAmount;
        if (itemId != 0) {
            mgrPlayer.addItemAmount(itemId, amount, reason);
        }

        // 标记为已领取
        achievement.setState(AchievementState.received);
        this.saveRecord();

        this.sendMsg("MSG_ACHIEVEMENT_STATE_CHANGED", {
            achievementId: achievement.id,
            state: achievement.state,
        });

        return [itemId, amount];
    }

    /**
     * 获取成就对象
     * @param aid 
     */
    public static getAchievement(aid: number): sAchievement {
        let achievement = this.achievements[aid];

        if (!achievement) {
            cc.warn(ul.format("mgrAchievement.getAchievement achievement not found, aid = %s", aid));
            return null;
        }

        return achievement;
    }

    /**
     * 通过category获取对应的achievement数组
     * @param category 
     */
    public static getAchievementsByCategory(category: number): sAchievement[] {
        let arr = [];

        Tools.forEachMap(this.achievements, (k, v: sAchievement) => {
            if (v.template.category == category) {
                arr.push(v);
            }
        });

        return arr;
    }

    public static tryRefreshAchievement() {
        /**
         * 在成就刷新的过程中，可能会触发MSG_ACHIEVEMENT_STATE_CHANGED
         * 按照原本的逻辑，这个msg会无法被刷新，并没抛弃掉
         * 
         * 这里的刷新算法调整为，先将cmdQueue中的cmd备份到cmds中
         * 在刷新之前清空cmdQueue
         * 遍历cmds进行刷新
         * 
         * 如果在刷新过程中产生了新的msg，会保留在msgQueue中，等待下一次tryRefreshAchievement进行处理
         */
        let cmds: string[] = null;

        Tools.forEachMap(this.cmdQueue, (cmd: string, v) => {
            if (!cmds) cmds = [];
            cmds.push(cmd);
        });

        if (cmds) {
            this.cmdQueue = {};
            for (let i = 0; i < cmds.length; i++) {
                let cmd = cmds[i];
                this.refreshAchievement(cmd);
            }
        }
    }

    /** 判断指定的成就是否已经完成 */
    public static isAchievementCompleted(aid: number): boolean {
        if (!aid) return false;

        let achievement = this.getAchievement(aid);
        if (!achievement) return false;

        let state = achievement.state;

        return state == AchievementState.finished || state == AchievementState.received;
    }

    /** 判断传入的的成就是否全部完成 */
    public static isAchievementsAllCompleted(aids: number[]): boolean {
        if (!aids) return false;

        for (let i = 0; i < aids.length; i++) {
            const aid = aids[i];

            if (!this.isAchievementCompleted(aid)) return false;
        }

        return true;
    }

    /**
     * 计算可领取的成就的数量
     * @param category 
     */
    public static getAchievementCanReceiveCount(category: number): number {
        let count = 0;

        Tools.forEachMap(this.achievements, (k, a: sAchievement) => {
            if (a.template.category == category && a.state == AchievementState.finished) {
                count++;
            }
        });

        return count;
    }

    private static playAchievementTip(achievement: sAchievement): void {
        if (!this.bAchievementTipEnabled) return;

        // cc.warn('playAchievementTip')
        mgrTip.showMsgTip(ul.format("成就完成：%s", achievement.template.name));

    }

    /**
     * 设置成就提示开关（仅供单元测试使用）
     * @param bEnabled 
     */
    public static _setAchievementTipEnabled(bEnabled: boolean): void {
        // cc.log("_setAchievementTipEnabled", bEnabled);
        this.bAchievementTipEnabled = bEnabled;
    }

    /**
     * 通过类型获得当前需要显示的成就
     * @param e 
     */
    public static getShowAchievementsByCategory(category: number) {
        let map: { [subCategory: number]: sAchievement[] } = {};

        Tools.forEachMap(this.achievements, (k, v: sAchievement) => {
            if (v.template.category == category) {
                if (!map[v.template.subCategory]) {
                    map[v.template.subCategory] = [];
                }
                map[v.template.subCategory].push(v);
            }
        });

        let result = [];
        Tools.forEachMap(map, (k, achievements: sAchievement[]) => {
            // let subCategory = arr[i];
            achievements = Tools.sortArrayByField(achievements, "id");
            for (let index = 0; index < achievements.length; index++) {
                const achi: sAchievement = achievements[index];
                if (index < (achievements.length - 1)) {
                    if (achi.state <= AchievementState.finished) {
                        result.push(achi);
                        break;
                    }
                }
                else {
                    result.push(achi);
                }
            }
        });

        return result;
    }

    //获取当前成就的星级 和 总星级
    //subCategory的阶段
    public static getAchievementLevel(achievementId: number): number[] {
        let achievement = mgrAchievement.getAchievement(achievementId);
        let category = achievement.template.category;
        let subCategory = achievement.template.subCategory;
        let arr: any[] = [];
        Tools.forEachMap(this.achievements, (k, v: sAchievement) => {
            if (v.template.category == category && v.template.subCategory == subCategory) {
                arr.push(v);
            }
        });
        arr = Tools.sortArrayByField(arr, "id");
        for (let index = 0; index < arr.length; index++) {
            const achi: sAchievement = arr[index];
            if (achi.id == achievementId) {
                return [index + 1, arr.length];
            }
        }
        return [1, 1];
    }






    ///// 事件监控 /////
    private static onMsgAchievementStateChanged(e): void {
        // 处理提示
        let data = e;
        let aid = data.achievementId;
        let state = data.state;

        if (state == AchievementState.finished) {
            let achievement = this.achievements[aid];
            if (achievement.template.bNeedTip) {
                this.playAchievementTip(achievement);
            }
        }
        this.cmdQueue["MSG_ACHIEVEMENT_STATE_CHANGED"] = true;
    }

    private static onMsgItemAmountChanged(e): void {
        this.cmdQueue["MSG_ITEM_AMOUNT_CHANGED"] = true;
    }

    private static onMsgStageRatingChanged(e): void {
        this.cmdQueue["MSG_STAGE_RATING_CHAGNED"] = true;
    }

    private static onMsgPetLevelChanged(e): void {
        this.cmdQueue["MSG_PET_LEVEL_CHANGED"] = true;
    }

    private static onMsgPetAdventureChanged(e): void {
        this.cmdQueue["MSG_PET_ADVENTURE_CHANGED"] = true;
    }

    private static onMsgPetCombineLogChanged(e): void {
        this.cmdQueue["MSG_PET_COMBINE_LOG_CHANGED"] = true;
    }

    private static onMsgPveCountChanged(e): void {
        this.cmdQueue["MSG_PVE_COUNT_CHANGED"] = true;
    }











}