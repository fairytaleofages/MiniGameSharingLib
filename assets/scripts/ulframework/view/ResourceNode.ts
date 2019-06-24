import { ResourceType } from "../../game/Const";
import Spine from "./Spine";
import mgrPool from "../../game/manager/mgrPool";
import mgrDirector from "../../game/manager/mgrDirector";
import AnimNode from "./AnimNode";
import Particle from "./Particle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResourceNode extends cc.Node {
    public resType: ResourceType;
    public resId: string;

    public nodeSprite: cc.Node;
    public spine: Spine;
    public movName: string;
    public particle: Particle;





    ///// 生命周期 //////
    /**
     * 通过resType和resId构造ResourceNode
     * @param resType 
     * @param resId 
     */
    constructor(resType: ResourceType, resId: string, movName: string);
    /**
     * 通过配置表中的resource构造ResourceNode
     * @param resource [resType: ResourceType, resId: string]
     */
    constructor(resource: any[]);
    constructor(arg1: ResourceType | any[], arg2?: string, arg3?: string) {
        super();

        let resType: ResourceType;
        let resId: string;

        if (arg1 instanceof Array) {
            resType = arg1[0];
            resId = arg1[1];
        } else {
            resType = arg1;
            resId = arg2;
        }

        let node: any = new cc.Node();

        if (resType == null || !resId) {
            // cc.warn("mgrDirector.loadResourceNode faild! resType=[%s], resId=[%s].", resType, resId);
            return node;
        }

        this.resType = resType;
        this.resId = resId;

        this.movName = arg3;

        this.loadRes();
    }

    _onPreDestroy() {
        this.unloadRes();

        if (super["_onPreDestroy"]) {
            super["_onPreDestroy"]();
        }
    }









    ///// 内部逻辑 //////
    private loadRes() {
        this.unloadRes();

        let resType = this.resType;
        let resId = this.resId;

        if (resType == ResourceType.sprite) {
            if (resId && resId != "") {     
                let nodeSprite = mgrPool.get("sprite", resId);
                nodeSprite.parent = this;
                // cc.log("load sprite", resId, nodeSprite)
                this.nodeSprite = nodeSprite;
            }
        } else if (resType == ResourceType.spine) {
            let spine: Spine = mgrPool.get("spine", resId);
            if (spine) {
                // cc.log("load spine", resId, spine)
                spine.parent = this;
                this.spine = spine;
                if (this.movName) {
                    this.spine.play(this.movName, true);
                }
            }
        }
        else if (resType == ResourceType.particle) {
            let particle: Particle = mgrPool.get("particle", resId);
            if (particle) {
                // cc.log("load spine", resId, spine)
                particle.parent = this;
                this.particle = particle;
            }
        }
        else if (resType == ResourceType.animNode) {
            let animNode: AnimNode = mgrPool.get("animNode", resId);
            if (animNode) {
                // cc.log("load spine", resId, spine)
                animNode.parent = this;
                animNode.play();
            }
        }
    }

    private unloadRes() {
        let resType = this.resType;
        let resId = this.resId;

        if (resType == ResourceType.sprite) {
            if (cc.isValid(this.nodeSprite)) {
                // cc.log("this.nodeSprite.destroy();")
                this.nodeSprite.removeFromParent();
                mgrPool.put(this.nodeSprite)
            }
            this.nodeSprite = null;

        } else if (resType == ResourceType.spine) {
            if (cc.isValid(this.spine)) {
                // cc.log("this.spine.removeFromParent();")
                this.spine.removeFromParent();
                mgrPool.put(this.spine);
            }
            this.spine = null;
        }
        else if (resType == ResourceType.particle) {
            if (cc.isValid(this.particle)) {
                // cc.log("this.spine.removeFromParent();")
                this.particle.removeFromParent();
                mgrPool.put(this.particle);
            }
            this.particle = null;
        }
    }









    ///// 外部接口 /////
    /**
     * 尝试播放spine的动画
     * 如果spine不存在，则不会响应
     * @param movName 参数同Spine.play
     * @param bLoop 参数同Spine.play
     */
    public tryPlaySpineMov(movNames: any, bLoop?: boolean) {
        if (cc.isValid(this.spine)) {
            this.spine.play(movNames, bLoop);
        }
    }

    public setAnchorPoint(point: number | cc.Vec2, y?: number) {
        super.setAnchorPoint(point, y);

        if (this.nodeSprite) {
            this.nodeSprite.setAnchorPoint(point, y);
        }
    }



}