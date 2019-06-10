import Manager from "../../ulframework/manager/Manager";
import mgrCfg from "./mgrCfg";
import mgrRecord from "./mgrRecord";
import mgrTip from "./mgrTip";
import mgrPlayer from "./mgrPlayer";
import Const from "../Const";
import mgrDebug from "./mgrDebug";
import mgrAchievement from "./mgrAchievement";
import mgrDirector from "./mgrDirector";
import mgrShop from "./mgrShop";
import mgrSdk from "./mgrSdk";

const { ccclass } = cc._decorator;


export type TStageResult = {
    stageId: number,
    rating: number,
    rewardNum: number,
}

const FULL_POWER_COUNT = 5;

@ccclass
export default class mgrStage extends Manager {
    ///// 成员变量 /////

    // 关卡数据，记录下 通关关卡
    private static stageDatas: { [stageId: number]: { rating: number } } = {};
    // 关卡进度 与 mgrAlu 相关
    private static stageProgress: number;   
    // 章节开启
    private static chapterOpened = null;


    // 临时变量
    private static bEndDoubleReward: boolean = true;
    // 5倍奖励 能量
    private static powerCount: number = 0;



    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this.loadRecord();
    }

    protected static loadRecord(): void {
        super.loadRecord();

        let record = mgrRecord.getData("stage") || {};

        this.stageDatas = record.stageDatas || {};
        this.stageProgress = record.stageProgress || 0;
        this.chapterOpened = record.chapterOpened || null;
        this.powerCount = record.powerCount || 0

        if ( !this.chapterOpened ) {
            this.chapterOpened = {};
            mgrCfg.forDb_from_stage_chapter_db(( k, v )=>{
                this.chapterOpened[ v.id ] = v.bOpen;
            })
        }


        // 确保所有的stage都有数据
        mgrCfg.forDb_from_stage_db((k, v) => {
            let data = this.stageDatas[v.id] || {
                rating: 0,
            }
            this.stageDatas[v.id] = data;
        });

        // cc.log("loadRecord", this.stageDatas);
    }

    protected static saveRecord(): void {
        super.saveRecord();

        let record = {
            stageDatas: this.stageDatas,
            stageProgress: this.stageProgress,
            chapterOpened: this.chapterOpened,
            powerCount: this.powerCount,
        };

        mgrRecord.setData("stage", record);
    }








    ///// 关卡流程 /////
    public static tryBeginStage(stageId: number): boolean {
        let stage = mgrCfg.get_from_stage_db( stageId );
        if (!stage) {
            cc.warn("mgrStage.tryBeginStage stage not found!", stageId);
            mgrTip.showMsgTip("stage not found!" + stageId);
            return false;
        }

        // 解锁检查
		let unlock = this.isStageUnlocked( stageId );
		if ( !unlock ) {
			mgrTip.showMsgTip("尚未解锁");
			return false;
		}

		// 检测体力
        // begin的时候不消耗体力，只是检测
        let count = stage.costs;
        let itemId = Const.ITEM_ID_ENERGY;
        if ( mgrPlayer.getItemAmount(itemId) < count ) {
            mgrShop.tipItemNotEnough( itemId );
            mgrShop.tryOpenShop( itemId );
            return false;
        }

        return true;
    }

    // 检查消耗
    public static checkStageCost (stageId: number): boolean {
        let stage = mgrCfg.get_from_stage_db( stageId );
        if (!stage) { return false }

        // 检测体力
        let count = stage.costs;
        let itemId = Const.ITEM_ID_ENERGY;
        if ( mgrPlayer.getItemAmount(itemId) < count ) {
            return false;
        }

        return true;
    }

    /**
     * 开始关卡，立即扣除体力
     * @param stageId 
     */
    public static beginStage( stageId: number ) {
        let stage = mgrCfg.get_from_stage_db( stageId );
        if (!stage) {
            cc.warn("mgrStage.beginStage stage not found!", stageId);
            return;
        }
        // 4. 扣除体力
        // let count = stage.costs;
        // if (count > 0) {
        //     mgrPlayer.addItemAmount(Const.ITEM_ID_ENERGY, -count, "关卡消耗");
        // }

        mgrSdk.statisOnStageStart( stageId );
    }
    

    public static getRatingByRemainTime(stageId:number, remainTime: number){
        let stageData = mgrCfg.get_from_stage_db(stageId)
        let starCalcTime = stageData.starCalcTime
        let filed1 = starCalcTime[0]
        let filed2 = starCalcTime[1]

        let persent = remainTime / stageData.time
        if(persent >= filed2) return 3
        if(persent >= filed1) return 2
        if(persent > 0) return 1
        
        return 0
    }
    /**
     * 结束关卡
     * @param stageId 关卡id
     */
    public static finishStage(stageId: number,remainTime:number): TStageResult {
        let stage = mgrCfg.get_from_stage_db( stageId );
        if (!stage) {
            cc.warn("mgrStage.finishStage stage not found!", stageId);
            return;
        }

        let recordRating = this.getStageRating(stageId);
        let bRatingChanged = false;

        // 1. 记录关卡进度
        if (stage.stageProgress && stage.stageProgress > 0 && this.stageProgress < stage.stageProgress) {
            this.stageProgress = stage.stageProgress;
        }

        // 2 rating 改变
        /**
         * 0 未通关
         * 1 通关
         */
        let rating = this.getRatingByRemainTime(stageId,remainTime);
        if (rating > recordRating) {
            this.stageDatas[stageId].rating = rating;
            bRatingChanged = true;
        }

        // 发奖
        let rewardCount = stage.passReward;
        if ( bRatingChanged && recordRating <= 0 ) {
            rewardCount = stage.firstReward;
            mgrPlayer.addItemAmount(Const.ITEM_ID_GOLD, rewardCount, "关卡");
        } else {
            if ( rewardCount > 0 ) {
                mgrPlayer.addItemAmount(Const.ITEM_ID_GOLD, rewardCount, "关卡");
            }
        }

        // 6. 广播评级奖励（成就需要）
        if (bRatingChanged) {
            this.sendMsg("MSG_STAGE_RATING_CHAGNED", { stageId: stageId, rating: rating });
            this.saveRecord();
        }

        //  4. 扣除体力
        let count = stage.costs;
        if (count > 0) {
            mgrPlayer.addItemAmount(Const.ITEM_ID_ENERGY, -count, "关卡消耗");
        }

        if(rating >= 1){
            mgrStage.tryAddPowerCount();
        }

        return {
            stageId: stageId,
            rating: rating,
            rewardNum: rewardCount
        };
    }

    /** 开启章节 */
    public static openChapter ( chapterId: number ) {
        this.chapterOpened[ chapterId ] = true;
        this.saveRecord();
    }






    ///// 游戏数据访问 /////


    /** 获取当前关卡进度 */
    public static getStageProgress(): number {
        return this.stageProgress;
    }

    /** 获取关卡评级 */
    public static getStageRating(stageId: number): number {
        let stageData = this.stageDatas[stageId];
        if (!stageData) return 0;

        return stageData.rating || 0;
    }

    /** 
     * 判断关卡是否解锁
     * 解锁条件
     * 现在解锁是通过unlockAid进行存放的
     * 如果没有unlockAid，或者对应的成就已经完成，则关卡解锁
     */
    public static isStageUnlocked(stageId: number): boolean {
        if (mgrDebug.bUnlockAllStage) return true;

        let stage = mgrCfg.get_from_stage_db( stageId );
        if (!stage) return false;

        let aids = stage.unlockAids;
        for (let i = 0; i < aids.length; i++) {
            const aid = aids[i];
            if (!mgrAchievement.isAchievementCompleted(aid)) return false;
        }

        return true;
    }


    /**
     * 通过stageId查询chapterId
     * @param stageId 
     * @return chapterId
     */
    public static calcChapterIdByStageId(stageId: number): number {
        let chapterId;
        let index = -1;
        mgrCfg.forDb("stage_chapter_db", (k, v) => {
            index++;
            for (let i = 0; i < v.stageIds.length; i++) {
                if (stageId == v.stageIds[i]) {
                    chapterId = v.id;
                    return true;
                }
            }
        });

        return chapterId;
    }

    // 获取最近的章节id
    public static getLastChapterId (): number {
        let stageId = 0;
        mgrCfg.forDb_from_stage_db( (key, value)=>{
            stageId = value.id;
            if ( value.stageProgress == this.getStageProgress() + 1 ) {
                return true;
            }
        });

        return this.calcChapterIdByStageId( stageId );
    }

    /** 获取最近的章节是否开启 */
    public static isChapterOpen ( chapterId: number) {
        if(!chapterId) return true
        return this.chapterOpened[chapterId] || false;
    }



    public static isEndDoubleReward () {
        return this.bEndDoubleReward;
    }

    public static setEndDoubleReward ( bool: boolean ) {
        this.bEndDoubleReward = bool;
    }


    /** 增加能量 */
    public static tryAddPowerCount () {
        this.powerCount++;
        if ( this.powerCount > FULL_POWER_COUNT ) {
            this.powerCount = FULL_POWER_COUNT;
        }
    }

    /** 清空能量 */
    public static cleanPowerCount () {
        this.powerCount = 0;
    }

    /** 获取能量 */
    public static getPowerCountAndMax () {
        return [this.powerCount, FULL_POWER_COUNT];
    }

    /** 能量满了 */
    public static isPowerFull () {
        return this.powerCount == FULL_POWER_COUNT;
    }

   
}
