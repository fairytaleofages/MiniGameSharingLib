import mgrCfg from "../../game/manager/mgrCfg";
import mgrDirector from "../../game/manager/mgrDirector";
import Tools from "../utils/Tools";
import IPoolManagerCaceableObject from "../utils/IPoolManagerCacheableObject";

// const { ccclass, property } = cc._decorator;

// @ccclass
export default class Particle extends cc.Node implements IPoolManagerCaceableObject {
    public particleData: any;
    private bAutoRemoveOnFinish: boolean;

    private bLoaded = false;








    ///// 生命周期 //////
    constructor(particleId: string) {
        super();


        let particleData = mgrCfg.get_from_particle_db( particleId );

        let ps = this.addComponent(cc.ParticleSystem);
        // ps.file = cc.url.raw(ul.format("resources/%s.plist", particleData.filename));
        // let url = cc.url.raw(ul.format("resources/%s.plist", particleData.filename));
        // ps.file = { nativeUrl: url };

        if (particleData.positionType != "") {
            ps.positionType = parseInt(particleData.positionType);
        }

        this.particleData = particleData;
        this.bAutoRemoveOnFinish = particleData.bPlayOnce;

        if ( !!particleData.texturename ) {
            mgrDirector.loadRes( particleData.texturename, cc.SpriteFrame,( err: Error, res: cc.SpriteFrame )=>{
                if (err) {
                    cc.warn("Particle loadRes error:", err.message);
                    return;
                }
    
                if (!cc.isValid(this)) return;
    
                // cc.log("Particle loadRes spr res : ",res);
                ps.spriteFrame = res;
    
                // this._monitor.registerAsyncValue("bLoaded", true);
            } );
        }
        mgrDirector.loadRes( particleData.filename, cc.ParticleAsset,( err: Error, res: cc.ParticleAsset )=>{
            if (err) {
                cc.warn("Particle loadRes error:", err.message);
                return;
            }

            if (!cc.isValid(this)) return;

            // cc.log("Particle loadRes res : ",res);
            ps.file = res;

            this.bLoaded = true;
        } );
        
    }









    ///// 外部接口 /////
    /**
     * 重置到默认状态
     */
    public reset() {
        let ps = this.getComponent(cc.ParticleSystem);
        ps.autoRemoveOnFinish = this.bAutoRemoveOnFinish;
        ps.resetSystem();
    }

    /**
     * 设置播放完成后自动remove
     * @param bAutoRemoveOnFinish 
     */
    public setAutoRemoveOnFinish(bAutoRemoveOnFinish: boolean) {
        this.bAutoRemoveOnFinish = bAutoRemoveOnFinish;

        let ps = this.getComponent(cc.ParticleSystem);
        ps.autoRemoveOnFinish = this.bAutoRemoveOnFinish;
    }

    public isLoaded(): boolean {
        return this.bLoaded;
    }










}