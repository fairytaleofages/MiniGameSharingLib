import Manager from "../../ulframework/manager/Manager";
import PoolManager from "../../ulframework/utils/PoolManager";
import mgrCfg from "./mgrCfg";
import Spine from "../../ulframework/view/Spine";
import Particle from "../../ulframework/view/Particle";
import mgrDirector from "./mgrDirector";
import AnimNode from "../../ulframework/view/AnimNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mgrPool extends Manager {
    ///// 成员变量 /////
    private static poolManager: PoolManager;










    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this.poolManager = new PoolManager();
        this._regsiterPoolConfig();
    }

    protected static loadRecord(): void {
        super.loadRecord();
    }

    protected static saveRecord(): void {
        super.saveRecord();
    }









    ///// 注册pool接口 /////
    private static _regsiterPoolConfig(): void {
        // spine动画
        this.poolManager.register(
            "spine",
            (id) => {
                // creator
                // cc.log("pool spine creator");
                let spineData = mgrCfg.get("spine_db", id);
                if (!spineData) return null;

                let spine = new Spine(id);
                return spine;
            },
            (node) => {
                // resettter
                if (node instanceof Spine) {
                    node.reset();
                }
            },
            (node) => {
                // cleanuper
                if (node instanceof Spine) {
                    node.stopAllActions();
                    node.unregisterEventCallback();
                }
            },
            (node) => {
                // destroyer
                let skeleton = node.getComponent(sp.Skeleton);
                let skeletonDta = skeleton.skeletonData;

                let deps = cc.loader.getDependsRecursively(skeletonDta);
                cc.loader.release(deps);
                cc.loader.release(skeletonDta);
            },
            1000
        );

        // animNode
        this.poolManager.register(
            "animNode",
            (id) => {
                // creator

                let animData = mgrCfg.get("anim_node_db", id);
                if (!animData) return null;

                let animNode = new AnimNode(id);
                return animNode;
            },
            (node) => {
                // resettter
                if (node instanceof AnimNode) {
                    node.reset();
                }
            },
            (node) => {
                // cleanuper
                if (node instanceof AnimNode) {
                    node.stopAllActions();
                    node.unregisterEventCallback();
                }
            },
            (node) => {
                // destroyer
            },
            1000
        );

        // particle粒子
        this.poolManager.register(
            "particle",
            (id) => {
                // creator
                // cc.log("pool particle creator");
                let particleData = mgrCfg.get("particle_db", id);
                if (!particleData) return null;

                let particle = new Particle(id);
                return particle;
            },
            (node) => {
                // resettter
                if (node instanceof Particle) {
                    node.reset();
                }
            },
            (node) => {
                // cleanuper
            },
            (node) => {
                // destroyer
            },
            1000
        );
        //view
        this.poolManager.register(
            "view",
            (viewName) => {
                // creator
                return mgrDirector.createView(viewName);
            },
            (node) => {
                // resettter
            },
            (node) => {
                // cleanuper
            },
            (node) => {
                // destroyer
            },
            1000
        );
        //sprite
        this.poolManager.register(
            "sprite",
            (resId) => {
                // creator
                // cc.log("pool sprite creator");
                return mgrDirector.createSpriteNode(resId);
            },
            (node) => {
                // resettter
            },
            (node) => {
                // cleanuper
            },
            (node) => {
                // destroyer
                let sprite = node.getComponent(cc.Sprite);
                let spriteFrame = sprite.spriteFrame;

                let deps = cc.loader.getDependsRecursively(spriteFrame);
                cc.loader.release(deps);
                cc.loader.release(spriteFrame);
            },
            1000
        );
    }









    ///// 访问接口 /////
    /**
     * 从pool中获取对象
     * @param poolId [spine]
     * @param poolKey 对应的id
     * @return 输出类型为cc.Node，考虑到外部使用方便，这里使用any类型
     */
    public static get(poolId: string, poolKey: string): any {
        return this.poolManager.get(poolId, poolKey);
    }

    /**
     * 归还一个对象
     * @param node 
     */
    public static put(node: cc.Node): void {
        this.poolManager.put(node);
    }

    /**
     * 清空pool
     * @param poolId 
     * @param poolKey 
     */
    public static clean(poolId?: string, poolKey?: string): void {
        cc.log(" public static clean(poolId?: string, poolKey?: string) ");
        if (this.poolManager) {
            this.poolManager.clean(poolId, poolKey);
        }
        // cc.Director
        // cc.textureCache.removeAllTextures();
    }









}