import Tools from "./Tools";

const { ccclass, property } = cc._decorator;

type TCreator = (id: string) => cc.Node;
type TResetter = (node: cc.Node) => void;
type TCleanuper = (node: cc.Node) => void;
type TDestroyer = (node: cc.Node) => void;

/**
 * PoolManager
 * 缓冲池管理器
 *
 * 用于对常用的对象进行缓冲
 *
 * 缓冲对象的生命周期:
 * cretor 			-- 创建
 * resetter 		-- 重置
 * destroyer 		-- 销毁
 *
 * 举例：
 * 第一次获取：
 * cretor
 * resetter
 *
 * 归还：
 * retain
 *
 * 第二次获取：
 * release
 * resetter
 *
 * 归还（销毁）
 * dedstoryer
 *
 *
 * poolConfig = {
 * 	[key] = {creator, resetter, destroyer},
 * }
 *
 * 具体分析：
 * 对于armature类型的对象，不同的armatureData并不能进行复用
 * 需要在armature类型的pool，添加一个key的二维pool
 *
 * 鉴于从pool返回的node，在release的一瞬间就会被销毁
 * 那么从pool返回的所有对象，默认都retain一次，在销毁的时候再release
 */
@ccclass
export default class PoolManager {
    private pools: {
        [poolId: string]: {
            [poolKey: string]: cc.Node[],
        },
    };

    private poolConfigs: {
        [poolId: string]: {
            creator: TCreator,
            resetter: TResetter,
            cleanuper: TCleanuper,
            destroyer: TDestroyer,
            maxCount: number,
        }
    };









    ///// 生命周期 /////
    constructor() {
        this.pools = {};
        this.poolConfigs = {};
    }








    ///// 内部逻辑 /////
    private _getPool(poolId: string, poolKey: string | number): cc.Node[] {
        let group = this.pools[poolId];
        if (!group) {
            group = {};
            this.pools[poolId] = group;
        }

        let pool = group[poolKey];
        if (!pool) {
            pool = [];
            group[poolKey] = pool;
        }

        return pool;
    }

    private _safeRelease(node: cc.Node): void {
        // 好像没啥好释放的
    }









    ///// 外部接口 /////
    /**
     * 注册缓冲池
     * @param poolId 
     * @param creator 
     * @param resetter
     * @param cleanuper
     * @param destroyer 
     * @param TDestroyer 
     * @param maxCount 
     */
    public register(poolId: string, creator: TCreator, resetter: TResetter, cleanuper: TCleanuper, destroyer: TDestroyer, maxCount: number): void {
        this.poolConfigs[poolId] = {
            creator: creator,
            resetter: resetter,
            cleanuper: cleanuper,
            destroyer: destroyer,
            maxCount: maxCount,
        };
    }

    /**
     * 获取对象
     * @param poolId 
     * @param poolKey 
     */
    public get(poolId: string, poolKey?: string): cc.Node {
        if (!poolId) {
            cc.warn("PoolManager.get need a poolId");
            return;
        }

        let config = this.poolConfigs[poolId];
        if (!config) {
            cc.warn(ul.format("PoolManager.get config not found! poolId = %s", poolId));
            return;
        }

        if (poolKey == null) poolKey = "__default__";

        // cc.log("PoolManager.get", poolId, poolKey);
        let pool = this._getPool(poolId, poolKey);
        for (let i = 0; i < pool.length; i++) {
            const v = pool[i];
            // cc.log(i, v, v["_UID"]);
        }

        let node = pool.shift();

        // cc.log("after shift");
        for (let i = 0; i < pool.length; i++) {
            const v = pool[i];
            // cc.log(i, v, v["_UID"]);
        }

        if (node && node.parent) {
            cc.warn("[warn] PoolManager.get, node already has a parent!");
            node = null;
        }

        if (!node) {
            // 创建node
            node = config.creator(poolKey);
            if (node) {
                node["__pool_id"] = poolId;
                node["__pool_key"] = poolKey;

                // TODO creator中cc.Node没有retain
                // node.retain();
            }
        }

        if (node) {
            if (config.resetter) {
                config.resetter(node);
            }
            node["__pool_flag_inpool"] = null;
        }

        return node;
    }

    /**
     * 归还对象
     * @param node 
     */
    public put(node: cc.Node): void {
        if (!node) {
            cc.warn("PoolManager.put node is nil!")
            return;
        }

        // 提取pool参数，如果没有，则直接扔掉
        let poolId = node["__pool_id"];
        let poolKey = node["__pool_key"];

        if (!poolId) {
            return;
        }

        if (!poolKey) {
            cc.warn("PoolManager.put obj.__pool_key not found!");
            return;
        }

        if (!cc.isValid(node)) {
            cc.warn("PoolManager.put obj not valid.");
            return;
        }

        let config = this.poolConfigs[poolId];
        if (!config) {
            cc.warn(ul.format("PoolManager.put config not found! poolId = %s", poolId));
            return;
        }

        if (node["__pool_flag_inpool"]) {
            cc.warn("PoolManager.put obj is already in pool!");
            return;
        }

        let pool = this._getPool(poolId, poolKey);

        if (pool.length < config.maxCount) {
            if (config.cleanuper) {
                config.cleanuper(node);
            }

            // 写入标记
            node["__pool_flag_inpool"] = true;

            pool.push(node);

        } else {
            // pool已满，销毁
            if (config.destroyer) {
                config.destroyer(node);
            }
            this._safeRelease(node);
        }
    }

    public clean(poolId?: string, poolKey?: string) {
        // cc.log("clean", poolId, poolKey)
        Tools.forEachMap(this.pools, (pid: string, v: any) => {
            if (!poolId || poolId == pid) {
                let config = this.poolConfigs[pid];
                let destroyer = config.destroyer;

                Tools.forEachMap(v, (pkey: string, pool: cc.Node[]) => {
                    if (!poolKey || poolKey == pkey) {
                        for (let i = 0; i < pool.length; i++) {
                            let node = pool[i];

                            // cc.log("destroy", pkey, i, node["__pool_id"]);
                            if (destroyer) {
                                destroyer(node);
                            }
                            this._safeRelease(node);
                        }

                        v[pkey] = null;
                    }
                });
            }
        });
    }










}