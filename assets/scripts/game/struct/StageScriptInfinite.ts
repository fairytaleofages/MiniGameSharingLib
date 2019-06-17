import mgrCfg from "../manager/mgrCfg";
import mgrStage from "../manager/mgrStage";
import mgrDirector from "../manager/mgrDirector";
import mgrRank from './../manager/mgrRank';
import Const from "../Const";
import vInfiniteSettlementDialog from './../view/dialog/vInfiniteSettlementDialog';
import Tools from "../../ulframework/utils/Tools";

export default class StageScriptInfinite {
    public context: any = {}
    private minCount = 4
    public pools:{[type:number]: number[]} = {}

    constructor(context) {
        this.context = context

        let pools = {}
        mgrCfg.forDb_from_cake_part_db((k, v) => {
            if (!pools[v.type]) pools[v.type] = []
            pools[v.type].push(v.id)
        })
        this.pools = pools
    }

    /**生成顾客列表 */
    generateCustomerIds() {
        //获取1000个. 
        let customerIds = []
        let index = 0
        while (index < 1000) {
            mgrCfg.forDb_from_customer_db((k, v) => {
                if (Math.random() > 0.5) {
                    index++
                    customerIds.push(v.id)
                }
            })
        }
        return customerIds
    }


    /**生成部件 */
    generatePartIds(mustExistPartId: number) {
        let pools = this.pools
        let ratios = {
            [1]: 100,
            [2]: 100,
            [3]: 100,
            [4]: 50,
            [5]: 50,
            [6]: 100,
        }

        let partIds: number[] = []
        let count = 0
        for (let i = 1; i <= 6; i++) {
            let pool: number[] = pools[i]
            let ratio: number = ratios[i]
            //当剩余个数 小于等于 到最小个数所需的个数时, 
            ratio = 6 - i <= this.minCount - count ? 100 : ratio
            if (pool.length > 0 && ratio >= Tools.random(1, 100)) {
                let partId = pool[Tools.random(0, pool.length - 1)]
                partIds.push(partId)
                count++;
            }
        }

        return partIds
    }

    /**显示星级 */
    isShowStar() {
        return false
    }

    /**显示分数 */
    isShowScore() {
        return true
    }

    isPartDefaultOpen(){
        return true
    }

    /**结算 */
    finishGame(param) {
        mgrDirector.openDialog("vInfiniteSettlementDialog", {
            score: param.score,
            customerCount: param.customerCount,
            bAddition: param.bAddition,
        })
    }
}