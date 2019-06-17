import mgrCake from './../manager/mgrCake';
import mgrCfg from './../manager/mgrCfg';

/**
 * 蛋糕展示主体
 * - 接口1: replace(partId) 替换部件规则: 存在同层级, 将会被替换, 否则直接装配上
 * - 接口2: takeOff(partId) 脱掉部件: 将资源归还
 * - 接口3: takeOffAll() 脱掉所有的部件: 将资源全部归还
 * - 接口4: getAllPartIds() 获取所有已装配部件
 * 
 */
export default class sAvatar {
    private zIndex2Res: {
        [zIndex: number]: {
            resType: number,
            resId: string,
            pos: cc.Vec2,
            scale:number,
            fromTo: number
        }
    }
    private partIds: number[]
    constructor() {
        this.zIndex2Res = {}
        this.partIds = []
    }

    /**
     * 替换部件
     * @param partId 
     */
    public replace(partId: number) {
        //查看当前实体中是否存在该部件
        if (this.partIds.indexOf(partId) >= 0) {
            return false;
        }
        //获取当前部件的资源
        let partData = mgrCfg.get_from_cake_part_db(partId)
        let partTypeData = mgrCfg.get_from_cake_type_db(partData.type)

        //默认糕体的前置id为0
        let preBodyId = 0
        if(partTypeData.prePartType > 0){
            for (let index = 0; index < this.partIds.length; index++) {
                const prePartId = this.partIds[index];
                let prePartData = mgrCfg.get_from_cake_part_db(prePartId)
                if(prePartData.type == partTypeData.prePartType){
                    preBodyId = prePartId
                }
            }
        }
        let resInfos = mgrCake.getResByPartId(partId, preBodyId)
        //替换部件
        let willReplacePartId: { [partId: number]: number } = {}
        for (const k in resInfos) {
            let res = resInfos[k]
            //必要检查
            if (res) {
                let zIndex = parseInt(k)
                let oldRes = this.zIndex2Res[zIndex]
                //先记录下将要被替换的部件
                if (oldRes) willReplacePartId[oldRes.fromTo] = oldRes.fromTo
                //直接替换当前资源
                this.zIndex2Res[zIndex] = {
                    resType: res.resType,
                    resId: res.resId,
                    pos: res.pos,
                    scale: res.scale,
                    fromTo: partId,
                }
            }
        }

        this.partIds.push(partId)

        //去除老部件
        for (const k in willReplacePartId) {
            let oldPartId = parseInt(k)
            if (willReplacePartId[oldPartId]) {
                let oldResInfos = mgrCake.getResByPartId(oldPartId)
                for (const key in oldResInfos) {
                    //必要检查
                    if (oldResInfos[key]) {
                        let zIndex = parseInt(key)
                        let entityRes = this.zIndex2Res[zIndex]
                        if (entityRes.fromTo == oldPartId) this.zIndex2Res[zIndex] = null
                    }
                }

                this.partIds.splice(this.partIds.indexOf(oldPartId), 1)
            }
        }

        return true
    }

    /**
     * 脱下部件
     * @param partId 
     */
    public takeOff(partId: number) {
        if (this.partIds.indexOf(partId) < 0) return
        let resInfos = mgrCake.getResByPartId(partId)
        for (const key in resInfos) {
            //必要检查
            if (resInfos[key]) {
                let zIndex = parseInt(key)
                this.zIndex2Res[zIndex] = null
            }
        }
    }

    /**
     * 脱下所有部件
     */
    public takeOffAll() {
        this.partIds = []
        this.zIndex2Res = {}
    }

    /**
     * 获取所有的资源
     */
    public getAllPartIds() {
        return this.partIds
    }


    public getKernelData() {
        return this.zIndex2Res
    }
}