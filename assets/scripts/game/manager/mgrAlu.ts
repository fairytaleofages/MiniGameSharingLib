import Manager from "../../ulframework/manager/Manager";
import Const from "../Const";
import Tools from "../../ulframework/utils/Tools";
import mgrCop from "./mgrCop";
import mgrCfg from "./mgrCfg";
import mgrStage from "./mgrStage";

// const { ccclass } = cc._decorator;

const OPERATOR_HANDLERS = {
    "==": (a, b) => { return a == b; },
    "!=": (a, b) => { return a != b; },
    ">": (a, b) => { return a > b; },
    ">=": (a, b) => { return a >= b; },
    "<": (a, b) => { return a < b; },
    "<=": (a, b) => { return a <= b; },
};

// @ccclass
export default class mgrAlu extends Manager {
    ///// 成员变量 /////
    public static OPERATOR_HANDLERS = OPERATOR_HANDLERS;










    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()
    }

    protected static loadRecord(): void {
        super.loadRecord();
    }

    protected static saveRecord(): void {
        super.saveRecord();
    }









    ///// 模块1 /////









    ///// 模块2 /////
    /**
     * 生成check用参考数据
     */
    public static calcCheckData(): { [key: string]: number | string } {
        let checkDatas = {
            payChannel: this.getCheckPayChannel(),
            platform: this.getCheckPlatform(),
            stageProgress: mgrStage.getStageProgress() || 0,
        };

        // 写入cop
        Tools.forEachMap(mgrCop.getCops(), (k, v) => {
            // 尝试转换为数字
            let numberValue = parseFloat(v);
            checkDatas[k] = isNaN(numberValue) ? v : numberValue;
        });

        return checkDatas;
    }

    public static getCheckPayChannel(): string {
        return "unknown";
    }

    public static getCheckPlatform(): string {
        return "unknown";
    }

    /**
     * 检查指定的alu是否通过 
     * @param id 
     */
    public static check(id: string): boolean {
        // 没有过滤器，默认为通过
        if (!id) return true;

        let data = mgrCfg.get("alu_db", id);
        if (!data) return false;

        let result = true;

        let checkDatas = this.calcCheckData();
        for (let i = 0; i < data.conditions.length; i++) {
            const condition = data.conditions[i];
            let aluHandler = OPERATOR_HANDLERS[condition.operator];
            if (aluHandler) {
                let r = aluHandler(checkDatas[condition.key], condition.value);

                if (condition.bLogicOr) {
                    result = result || r;
                } else {
                    result = result && r;
                }
            } else {
                cc.warn("mgrAlu.check unknown operator", condition.operator);
            }
        }

        return result;
    }

    /**
     * 连续检测多个aluId
     * 逻辑关系为and
     * @param ids 
     */
    public static checkIds(ids: string[]): boolean {
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (!this.check(id)) {
                return false;
            }
        }

        return true;
    }









}