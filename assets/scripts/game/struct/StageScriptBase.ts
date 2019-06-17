import mgrCfg from "../manager/mgrCfg";
import mgrStage from "../manager/mgrStage";
import mgrDirector from "../manager/mgrDirector";
import vGameFailedDialog from "../view/dialog/vGameFailedDialog";
import Tools from "../../ulframework/utils/Tools";

export default class StageScriptBase {
    public context: any = {}
    private minCount = 4
    public pools: { [type: number]: number[] } = {}

    constructor(context) {
        this.context = context

        let stageData = mgrCfg.get_from_stage_db(this.context.stageId)
        for (let i = 1; i <= 6; i++) {
            let pool: number[] = stageData['pool' + i.toString()]
            this.pools[i] = pool
        }
    }

    /**生成顾客列表 */
    generateCustomerIds() {
        let stageData = mgrCfg.get_from_stage_db(this.context.stageId)
        return ul.clone(stageData.customerIds)
    }

    /**生成部件 */
    generatePartIds(mustExistPartId: number) {
        let stageData = mgrCfg.get_from_stage_db(this.context.stageId)
        let partIds: number[] = []
        let count = 0
        for (let i = 1; i <= 6; i++) {
            if (!!mustExistPartId) {
                //如果当前类型与必须存在的部件内省匹配, 则不进行随机
                let mustExistPartData = mgrCfg.get_from_cake_part_db(mustExistPartId)
                if (mustExistPartData.type == i) {
                    partIds.push(mustExistPartId)
                    count++
                    mustExistPartId = 0
                    continue;
                }
            }
            let pool: number[] = stageData['pool' + i.toString()]
            let ratio: number = stageData['pool' + i.toString() + 'Ratio']
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
        return true
    }

    /**显示分数 */
    isShowScore() {
        return false
    }

    isPartDefaultOpen() {
        return false
    }

    /**结算 */
    finishGame(param) {
        let remainTime = param.remainTime
        let result = mgrStage.finishStage(this.context.stageId, remainTime)
        if (result.rating > 0) {
            mgrDirector.openDialog("vGameSettlementDialog", {
                result: result,
            })
        }
        else {
            mgrDirector.openDialog("vGameFailedDialog", {
                result: result
            })
        }
    }
}