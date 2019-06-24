import Tools from "./Tools";

// const { ccclass, property } = cc._decorator;

/**
 * 固定随机数生成器
 */
// @ccclass
export default class Randomizer {
    private originSeed: number;
    private seed: number;

    private static staticFixedRandomizer: Randomizer = null;











    ///// 生命周期 /////
    public constructor(seed?: number) {
        if (seed == null) {
            seed = new Date().getTime();
        }
        this.originSeed = seed;
        this.seed = seed;
    }









    ///// 接口 /////
    /**
     * 获取当前的种子
     */
    public getSeed(): number {
        return this.seed;
    }

    /**
     * 获取原始种子
     */
    public getOriginSeed(): number {
        return this.originSeed;
    }

    /**
     * 设置随机数种子
     * @param seed 
     */
    public setSeed(seed: number): void {
        this.originSeed = seed;
        this.seed = seed;
    }

    /**
     * 获取一个整数随机数
     * random(3) => [1, 3]
     * random(2, 5) => [2, 5]
     * random() => [0, 1)
     * @param min 最小值
     * @param max 最大值 
     */
    public random(min?: number, max?: number): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        let r = this.seed / (233280.0);

        if (min == null && max == null) {
            return r;
        } else if (max == null) {
            return Math.floor(r * min + 1);
        } else {
            return Math.floor(r * (max - min + 1) + min);
        }
    }

    /**
     * 只随机，不return（用于内部计算）
     */
    private _pureRandomWithoutReturn() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
    }








    ///// 静态函数 /////
    private static _getStaticRandomizer(): Randomizer {
        if (!this.staticFixedRandomizer) {
            this.staticFixedRandomizer = new Randomizer();
        }
        return this.staticFixedRandomizer;
    }

    /**
     * 计算固定位置的随机数
     * random(3) => [1, 3]
     * random(2, 5) => [2, 5]
     * random() => [0, 1)
     * <警告>每次调用此方法，会将index之前的占位都随机一次，产生大量开销，如需频繁调用，请使用calcFixedRandoms
     * @param seed 种子
     * @param index 第几个数（0：第一次）
     * @param min 最小值
     * @param max 最大值
     */
    public static calcFixedRandom(seed: number, index: number, min?: number, max?: number): number {
        if (index < 0) {
            cc.warn("FixedRandomizer.calcFixedRandom index must >= 0");
            index = 0;
        }

        let randomizer = this._getStaticRandomizer();
        randomizer.setSeed(seed);

        // 预先随机，废弃掉index之前的数字
        for (let i = 0; i < index; i++) {
            randomizer._pureRandomWithoutReturn();
        }

        return randomizer.random(min, max);
    }

    /**
     * 计算固定的N个随机数
     * random(3) => [1, 3]
     * random(2, 5) => [2, 5]
     * random() => [0, 1)
     * @param seed 种子
     * @param count 随机数数量
     * @param min 最小值
     * @param max 最大值
     */
    public static calcFixedRandoms(seed: number, count: number, min?: number, max?: number): number[] {
        let numbers = [];

        let randomizer = this._getStaticRandomizer();
        randomizer.setSeed(seed);

        for (let i = 0; i < count; i++) {
            numbers.push(randomizer.random(min, max));
        }

        return numbers;
    }









    ///// 测试代码 /////
    public static _test() {
        // 测试随机数生成器
        cc.log("randomizer(1)");
        let randomizer = new Randomizer(1);
        for (let i = 0; i < 10; i++) {
            cc.log(i, randomizer.random(100), randomizer.getSeed());
        }

        cc.log("calcFixedRandoms(1)");
        let numbers = Randomizer.calcFixedRandoms(1, 10, 100);
        for (let i = 0; i < numbers.length; i++) {
            cc.log(i, numbers[i]);
        }

        cc.log("calcFixedRandom(1)");
        for (let i = 0; i < 10; i++) {
            cc.log(i, Randomizer.calcFixedRandom(1, i, 100));
        }

        cc.log("randomizer(2)");
        randomizer = new Randomizer(2);
        for (let i = 0; i < 10; i++) {
            cc.log(i, randomizer.random(100), randomizer.getSeed());
        }

        cc.log("随机分布测试")
        let hash = {};
        randomizer = new Randomizer(1);
        for (let i = 0; i < 100 * 10; i++) {
            let r = randomizer.random(100);
            hash[r] = (hash[r] || 0) + 1;
        }
        cc.log(hash);

        cc.log("系统random分布测试")
        hash = {};
        // randomizer = new FixedRandomizer(1);
        for (let i = 0; i < 100 * 10; i++) {
            let r = Tools.random(100);
            hash[r] = (hash[r] || 0) + 1;
        }
        cc.log(hash);
    }










}