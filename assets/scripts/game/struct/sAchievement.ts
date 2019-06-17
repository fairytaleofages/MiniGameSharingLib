import Const, { AchievementState } from "../Const";
import mgrCfg from "../manager/mgrCfg";
import mgrAchievement from "../manager/mgrAchievement";
import mgrPlayer from "../manager/mgrPlayer";
import mgrStage from "../manager/mgrStage";

// const { ccclass, property } = cc._decorator;

const DATA_KEYS = ["data1", "data2", "data3", "data4"];

// @ccclass
export default class sAchievement {
    public id: number;
    public template: any;
    public count: number;
    public maxCount: number;
    public state: AchievementState;








    ///// 内部逻辑 /////
    constructor(id: number) {
        this.id = id;
        this.template = mgrCfg.get("achievement_db", id);

        this.count = 0;
        this.maxCount = 0;
        this.state = AchievementState.unlocked;
    }








    ///// 外部接口 /////
    /**
     * 设置状态
     */
    public setState(state: AchievementState): void {
        this.state = state;
    }

    /**
     * 刷新次数
     * @param cmd 
     */
    public refreshCount(cmd: string): void {
        // cc.log("refreshCount", cmd);
        let template = this.template;
        let targetType = template.targetType;

        let targetData = mgrCfg.get("achievement_target_db", targetType);
        if (!targetData) {
            cc.warn(ul.format("sAchievement.refreshCount target not found! targetType = %s", targetType));
            return;
        }

        // 过滤cmd
        if (cmd && !targetData.cmdHash[cmd]) {
            return;
        }

        let handler = this[targetData.calcCountHandlerName];
        if (!(handler instanceof Function)) {
            cc.warn(ul.format("sAchievement.refreshCount handler not found! handler = %s", targetData.calcCountHandlerName));
            return;
        }

        let [count, maxCount] = handler.bind(this)();

        let bChanged = (this.count != null && this.count != count);

        this.count = count;
        this.maxCount = maxCount;

        if (bChanged) {
            mgrAchievement.sendMsg("MSG_ACHIEVEMENT_COUNT_CHANGED", { achievementId: this.id });
        }
    }

    /**
     * 刷新状态
     * @param cmd 
     * @return 状态是否发生改变
     */
    public refreshState(cmd): boolean {
        // 不是已激活的状态，不需要刷新
        if (this.state != AchievementState.unlocked && this.maxCount != 0) {
            return false;
        }

        this.refreshCount(cmd);

        if (this.state == AchievementState.unlocked && this.maxCount <= this.count) {
            this.state = AchievementState.finished;
            return true;
        }

        return false;
    }









    ///// 刷新次数逻辑 /////
    // 关卡x获得y
    private _calcCount1(): number[] {
        let template = this.template;
        let count = 0;
        let maxCount = 1;

        let stageId = template.data1;
        let requiredRating = template.data2;

        let rating = mgrStage.getStageRating(stageId);
        if (requiredRating <= rating) {
            count = 1;
        } else {
            count = 0;
        }
        maxCount = 1;

        return [count, maxCount];
    }

    // 第x章累计获得y个z
    private _calcCount2(): number[] {
        let template = this.template;
        let count = 0;
        let maxCount = 1;

        let chapterId = template.data1;
        let requiredCount = template.data2;
        let requiredRating = template.data3;

        let chapter = mgrCfg.quietGet("stage_chapter_db", chapterId);

        count = 0;
        if (!chapter) {
            cc.warn("sAchievement._calcCount2 chapter not found!", chapterId);
        } else {
            for (let i = 0; i < chapter.stageIds.length; i++) {
                const stageId = chapter.stageIds[i];
                let rating = mgrStage.getStageRating(stageId);
                if (requiredRating <= rating) {
                    count++;
                }
            }
        }
        maxCount = requiredCount;

        return [count, maxCount];
    }

    // 拥有的x物品，数量达到y
    private _calcCount4(): number[] {
        let template = this.template;
        let count = 0;
        let maxCount = 1;

        let itemId = template.data1;
        let requiredAmount = template.data2;

        count = mgrPlayer.getItemAmount(itemId);
        maxCount = requiredAmount;

        return [count, maxCount];
    }

    // -- 拥有x类部件y个
    // function sAchievement:_calcCount5()
    //     local template, count, maxCount = self.template, 0, 1

    //     local itemFlag, requiredCount = template.data1, template.data2

    //     local db = ul.mgrCfg:getDb("item_template_db")

    //     count = sAchievement.__getItemAmountByFlag(itemFlag)
    //     maxCount = requiredCount

    //     return count, maxCount
    // end

    // 拥有x类部件y个
    private _calcCount5(): number[] {
        let template = this.template;
        let count = 0;
        let maxCount = 1;

        let itemFlag = template.data1;
        let requiredAmount = template.data2;

        count = this.__getItemAmountByFlag(itemFlag);
        maxCount = requiredAmount;

        return [count, maxCount];
    }

    // 历史获得x物品y个
    private _calcCount7(): number[] {
        let template = this.template;
        let count = 0;
        let maxCount = 1;

        let itemId = template.data1;
        let requiredAmount = template.data2;

        count = mgrPlayer.getItemHistoryGotAmount(itemId);
        maxCount = requiredAmount;

        return [count, maxCount];
    }

    // 指定套装收集完整
    private _calcCount10(): number[] {
        let template = this.template;
        let count = 0;
        let maxCount = 1;

        let suitId = template.data1;

        let suitData = mgrCfg.quietGet("suit_db", suitId);
        if (!suitData) {
            cc.warn("sAchievement._calcCount10 suit not found!", suitId);
        } else {
            for (let i = 0; i < suitData.partIds.length; i++) {
                const partId = suitData.partIds[i];
                if (mgrPlayer.getItemAmount(partId) > 0) {
                    count++;
                }
            }
            maxCount = suitData.partIds.length;
        }

        return [count, maxCount];
    }

    // 指定成就全部完成
    private _calcCount20(): number[] {
        let template = this.template;
        let count = 0;
        let maxCount = 0;

        for (let i = 0; i < DATA_KEYS.length; i++) {
            const key = DATA_KEYS[i];
            let aid = template[key];

            if (aid) {
                maxCount++;
                if (mgrAchievement.isAchievementCompleted(aid)) {
                    count++;
                }
            }
        }

        return [count, maxCount];
    }

    // 指定的物品全部拥有
    private _calcCount21(): number[] {
        let template = this.template;
        let count = 0;
        let maxCount = 0;

        let itemIds = template.customData.itemIds;

        if (itemIds) {
            maxCount = itemIds.length;

            for (let i = 0; i < itemIds.length; i++) {
                const itemId = itemIds[i];
                if (mgrPlayer.getItemAmount(itemId) > 0) {
                    count++;
                }
            }
        }

        return [count, maxCount];
    }










    ///// 辅助方法 /////
    private __getItemAmountByFlag(itemFlag: number): number {
        // TODO 优化

        let count = 0;

        mgrCfg.forDb("item_template_db", (k, v) => {
            if (v.flag == itemFlag) {
                if (mgrPlayer.getItemAmount(v.id) > 0) {
                    count += 1;
                }
            }
        });

        return count;
    }











}