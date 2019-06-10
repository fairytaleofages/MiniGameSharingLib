import mgrCfg from "../../game/manager/mgrCfg";
import mgrDirector from "../../game/manager/mgrDirector";
import Tools from "../utils/Tools";
import LifeCycleMonitor from "../component/LifeCycleMonitor";
import IPoolManagerCaceableObject from "../utils/IPoolManagerCacheableObject";

// const { ccclass, property } = cc._decorator;

type TCallbackEvent = {
    name: string,
    clipName: string,        // 对应clipName
};

// @ccclass
export default class AnimNode extends cc.Node implements IPoolManagerCaceableObject {
    public animData: any;
    private nodeResource: cc.Node = null;
    private callback: (e: TCallbackEvent) => void;
    private clipName = null;








    ///// 生命周期 //////
    constructor(animId: string) {
        super();

        this.animData = mgrCfg.get("anim_node_db", animId);

        let monitor = this.addComponent(LifeCycleMonitor);
        monitor.setOnLoadCallback(this.onLoad.bind(this));
    }
    /**
     * 子类覆盖后请务必调用 super.onLoad()!
     * <警告> 子类复用后必须使用super调用父类的接口！
     * @deprecated 禁止覆盖！
     * @requires super.onLoad()
     */
    protected onLoad() {
        this._loadResourceNode();
    }

    _onPreDestroy() {
        if (cc.isValid(this.nodeResource)) {
            let animation = this.nodeResource.getComponent(cc.Animation);
            if (cc.isValid(animation)) {
                animation.stop();
            }
        }

        if (super["_onPreDestroy"]) {
            super["_onPreDestroy"]();
        }
    }









    ///// 外部接口 /////
    private _loadResourceNode(): void {
        let animData = this.animData;

        // cc.log("_loadResourceNode", this.animData);

        mgrDirector.loadRes(animData.prefabFileName, cc.Prefab, (err, prefab) => {
            if (err) {
                cc.warn("AnimNode._loadResourceNode error:", err);
                return;
            }

            if (!cc.isValid(this)) {
                cc.warn("AnimNode._loadResourceNode on loadRes finish, this is invalid!");
                return;
            }

            let node = cc.instantiate(prefab);
            node.parent = this;

            this.nodeResource = node;
            // if ( !!this.clipName ) {
                this.play( this.clipName );
            // }

            if ( !!this.callback ) {
                this.registerEventCallback( this.callback );
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
        this.scaleX = this.animData.scaleX;
        this.scaleY = this.animData.scaleY;
        // this.setColorEx(cc.color(255, 255, 255));
        this.opacity = 255;

        // let particleSystems = this.nodeResource.getComponentsInChildren(cc.ParticleSystem);
        // for (let i = 0; i < particleSystems.length; i++) {
        //     const ps = particleSystems[i];
        //     ps.resetSystem();
        // }
    }

    /**
     * 播放动画
     * @param clipName clip
     */
    public play(clipName?: string) {
        // cc.log("play", clipName);
        this.clipName = clipName;
        if (!this.nodeResource) return;
        if (!cc.isValid(this)) return;

        let animation = this.nodeResource.getComponent(cc.Animation);
        if (!cc.isValid(animation)) return;

        if (!clipName) {
            let clips = animation.getClips();
            if (clips.length > 0) {
                clipName = clips[0].name;
            } else {
                cc.warn("AnimNode.play clip not found!", clipName);
            }
        }

        // cc.log("call play", clipName);

        animation.play(clipName);
    }

    /**
     * 注册事件回调
     * @param callback 
     */
    public registerEventCallback(callback: (e: TCallbackEvent) => void) {
        this.callback = callback;
        if (!this.nodeResource) return;
        if (!cc.isValid(this)) return;

        this.unregisterEventCallback();
        this.callback = callback;


        let animation = this.nodeResource.getComponent(cc.Animation);
        animation.on("play", this.onAnimationPlay, this);
        animation.on("stop", this.onAnimationStop, this);
        animation.on("pause", this.onAnimationPause, this);
        animation.on("resume", this.onAnimationResume, this);
        animation.on("lastframe", this.onAnimationLastframe, this);
        animation.on("finished", this.onAnimationFinished, this);
    }

    /**
     * 注销事件回调
     */
    public unregisterEventCallback() {
        this.callback = null;

        let animation = this.nodeResource.getComponent(cc.Animation);
        animation.off("play", this.onAnimationPlay, this);
        animation.off("stop", this.onAnimationStop, this);
        animation.off("pause", this.onAnimationPause, this);
        animation.off("resume", this.onAnimationResume, this);
        animation.off("lastframe", this.onAnimationLastframe, this);
        animation.off("finished", this.onAnimationFinished, this);
    }

    public isLoaded(): boolean {
        return cc.isValid(this.nodeResource);
    }

    private _onEvent(e, name: string) {
        if (!cc.isValid(this.nodeResource)) return;

        let animation = this.nodeResource.getComponent(cc.Animation);
        let clipName = animation.currentClip.name;

        // cc.log("_onEvent", name, clipName)

        if (this.callback instanceof Function) {
            this.callback({ name: name, clipName: clipName });
        }
    }

    private onAnimationPlay(e) {
        this._onEvent(e, "play");
    }

    private onAnimationStop(e) {
        this._onEvent(e, "stop");
    }

    private onAnimationPause(e) {
        this._onEvent(e, "pause");
    }

    private onAnimationResume(e) {
        this._onEvent(e, "resume");
    }

    private onAnimationLastframe(e) {
        this._onEvent(e, "lastframe");
    }

    private onAnimationFinished(e) {
        this._onEvent(e, "finished");
    }

    public setColorEx(color: cc.Color) {
        Tools.setCascadeColor(this, color);
    }











}