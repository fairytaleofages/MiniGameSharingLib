import mgrCfg from "../../game/manager/mgrCfg";
import mgrDirector from "../../game/manager/mgrDirector";
import Tools from "../utils/Tools";
import IPoolManagerCaceableObject from "../utils/IPoolManagerCacheableObject";

// const { ccclass, property } = cc._decorator;

type TCallbackEvent = {
    name: string,
    movName: string,        // 对应spine中的动作名称，如idle_01
    movKey: string,         // 对应spine_db中的movKey，如mov_1
    bLoop: boolean,
};

// @ccclass
export default class Spine extends cc.Node implements IPoolManagerCaceableObject {
    public spineData: T_SPINE_DB;
    private bLoaded = false;

    private asyncData = null;
    private asyncAttach = [];
    private asyncMix = [];
    private skinName = "normal";







    ///// 生命周期 //////
    constructor(spineId: string) {
        super();

        this.spineData = mgrCfg.get("spine_db", spineId);

        let skeleton = this.addComponent(sp.Skeleton);

        this._loadSkeletonData();
    }









    ///// 外部接口 /////
    private _loadSkeletonData(): void {
        let spineData = this.spineData;

        mgrDirector.loadRes(spineData.jsonFileName, sp.SkeletonData, (err, skeletonData) => {
            if (err) {
                cc.warn("Spine._loadSkeletonData error:", err);
                return;
            }

            if (!cc.isValid(this)) return;

            // cc.log("on skeletonData loaded", skeletonData)

            let skeleton = this.getComponent(sp.Skeleton);
            skeleton.skeletonData = skeletonData;

            // skeleton.defaultSkin = "normal";
            skeleton.defaultSkin = this.skinName;
            // skeleton.defaultAnimation = spineData.mov_1;

            skeleton.premultipliedAlpha = spineData.bPremultipliedAlpha == true;
            // skeleton["_refresh"]();
            skeleton["_updateSkeletonData"]();

            this.bLoaded = true;

            if ( this.asyncData ) {
                this.play(this.asyncData.movNames, this.asyncData.bLoop );
            }
            for (let index = 0; index < this.asyncAttach.length; index++) {
                const element = this.asyncAttach[index];
                skeleton.setAttachment( element[0], element[1] );
            }
            for (let index = 0; index < this.asyncMix.length; index++) {
                const element = this.asyncMix[index];
                skeleton.setMix( element[0], element[1], element[2] );
            }
        });
    }

    /**
     * 重置到默认状态
     */
    public reset() {
        this.active = true;
        this.rotation = 0;
        this.setPosition(0, 0);
        this.scaleX = this.spineData.scaleX;
        this.scaleY = this.spineData.scaleY;
        this.color = cc.color(255, 255, 255);
        this.opacity = 255;

        let skeleton = this.getComponent(sp.Skeleton);
        skeleton.timeScale = 1;
        skeleton.setToSetupPose();
    }

    /**
     * 播放动画
     * 播放1个动画
     * @param movName 动画名称 "mov_1" 或使用spine.json中的movName "idle_01"
     * @param bLoop 是否开启循环模式 默认开启
     */
    public play(movName: string, bLoop?: boolean);

    /**
     * 播放动画
     * 播放1-n个动画
     * @param movNames 动画列表 ["mov_1", "move_2"] 或者使用spine.json中的movName ["idle_01", "idle_02"]
     * @param bLoop 最后一个mov是否开启循环模式 默认开启
     */
    public play(movNames: string[], bLoop?: boolean);

    public play(movNames: string | string[], bLoop?: boolean) {
        // cc.log("play", movNames, typeof(movNames), movNames instanceof Array);
        if (!(movNames instanceof Array)) {
            movNames = [movNames];
        }

        if (bLoop == null) bLoop = true;

        if (movNames.length <= 0) {
            cc.warn("Spine.play movName of found!");
            return;
        }

        this.asyncData = {
            movNames: movNames,
            bLoop: bLoop,
        }

        if (!this.bLoaded) return;
        if (!cc.isValid(this)) return;

        this.asyncData = null;
        // cc.log("  do play", movNames, typeof (movNames), movNames instanceof Array);

        let spineData = this.spineData;
        let skeleton = this.getComponent(sp.Skeleton);
        for (let i = 0; i < movNames.length; i++) {
            let movName = movNames[i];

            if (spineData[movName]) {
                movName = spineData[movName];
            }

            let _bLoop = (bLoop ? (i == movNames.length - 1) : false);

            if (i == 0) {
                // cc.log("  setAnimation", movName);
                skeleton.defaultAnimation = movName;
                skeleton.setAnimation(0, movName, _bLoop);
            } else {
                skeleton.addAnimation(0, movName, _bLoop);
            }
        }
    }

    public setPause ( isPause: boolean ) {
        let skeleton = this.getComponent(sp.Skeleton);
        skeleton.timeScale = isPause ? 0 : 1;
    }

    /**
     * 设置播放速率
     * @param scale 1:原始速度  2:2倍速
     */
    public setTimeScale(scale: number) {
        let skeleton = this.getComponent(sp.Skeleton);
        skeleton.timeScale = scale;
    }


    public registerEventCallback(callback: (e: TCallbackEvent) => void): void {
        this.unregisterEventCallback();

        if (!callback) return;

        let cb = (event, name) => {
            // cc.log("event", event);

            let animation = event.animation;
            let movName = animation ? animation.name : "unknown";
            let movKey = "unknown";

            Tools.forEachMap(this.spineData, (k, v) => {
                if (v == movName) {
                    movKey = k;
                    return true;
                }
            });

            let e = {
                name: name,
                movName: movName,
                movKey: movKey,
                bLoop: event.loop,
            }
            callback(e);
        }

        let skeleton = this.getComponent(sp.Skeleton);

        skeleton.setStartListener((e) => { cb(e, "start"); });
        skeleton.setEndListener((e) => { cb(e, "end"); });
        skeleton.setCompleteListener((e) => { cb(e, "cpmplete"); });
        skeleton.setEventListener((e) => { cb(e, "event"); });
    }

    public unregisterEventCallback() {
        let skeleton = this.getComponent(sp.Skeleton);

        skeleton.setStartListener(null);
        skeleton.setEndListener(null);
        skeleton.setCompleteListener(null);
        skeleton.setEventListener(null);
    }

    public isLoaded(): boolean {
        return this.bLoaded;
    }


    public trySetAttachment ( slot: string, atta: string ) {
        if ( !this.bLoaded ) {
            this.asyncAttach.push( [ slot, atta ] );
            return;
        }

        let skeleton = this.getComponent(sp.Skeleton);
        skeleton.setAttachment( slot, atta );
    }


    public trySetMix (fromName: string, toName: string, duration: number) {
        let spineData = this.spineData;
        let fromAnimation = spineData[fromName];
        let toAnimation = spineData[toName];
        if ( !fromAnimation || !toAnimation ) { return; }
        if ( !this.bLoaded ) {
            this.asyncMix.push( [ fromAnimation, toAnimation, duration ] );
            return;
        }

        let skeleton = this.getComponent(sp.Skeleton);
        skeleton.setMix( fromAnimation, toAnimation, duration );
    }


    public trySetSkin ( skinName: string ) {
        this.skinName = skinName;
        if ( this.bLoaded ) {
            let skeleton = this.getComponent(sp.Skeleton);
            skeleton.setSkin( skinName );
        }
    }


}