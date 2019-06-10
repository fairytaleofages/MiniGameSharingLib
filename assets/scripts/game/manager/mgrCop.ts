import Manager from "../../ulframework/manager/Manager";
import mgrCfg from "./mgrCfg";
import Tools from "../../ulframework/utils/Tools";

const { ccclass } = cc._decorator;

@ccclass
export default class mgrCop extends Manager {
    ///// 成员变量 /////
    /**
     * 本地cop，服务器的配置
     */
    private static localCop: { [key: string]: string } = {};
    /**
     * 远端cop，服务器的配置
     */
    private static remoteCop: { [key: string]: string } = {};

    private static sdkCop: { [key: string]: string } = {};









    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this.loadLocalCop();
        cc.log("mgrCop.onLoad");
    }

    protected static loadRecord(): void {
        super.loadRecord();
    }

    protected static saveRecord(): void {
        super.saveRecord();
    }

    private static loadLocalCop(): void {
        let localCop = {};

        mgrCfg.forDb("cop_db", (k, v) => {
            localCop[k] = v.defaultValue;
        });

        this.processCop(localCop);
        this.localCop = localCop;
        cc.log("localCop:", localCop);
    }

    private static processCop(cop: { [key: string]: string }) {
        cc.log("mgrCop.processCop")
        mgrCfg.forDb("cop_process_db", (k, v) => {
            let value = cop[k];
            if (value == null) {
                // cc.warn("mgrCop.processCop value not found! key = ", k);
                return;
            }

            let arr = value.split(v.splitChar) || [];

            cc.log("  process", k, arr);

            for (let i = 0; i < v.outputFieldNames.length; i++) {
                const fieldName = v.outputFieldNames[i];
                let fieldValue = arr[i];

                if (fieldValue == null) {
                    cc.warn(ul.format("mgrCop.processCop fieldValue not found! index = %d, fieldName = %s", i, fieldName));
                } else {
                    cc.log("  set", fieldName, fieldValue)
                    cop[fieldName] = fieldValue;
                }
            }
        });
    }









    ///// 访问模块 /////
    /**
     * 获取原始的cop值
     * @param key 
     */
    public static get(key: string): string {
        let value = this.remoteCop[key];

        if (value != null) return value;

        return this.localCop[key];
    }

    /**
     * 获取number类型的cop值
     * @param key 
     */
    public static getNumberValue(key: string): number {
        let value = this.get(key);
        if (value == null) return 0;

        let number = parseFloat(value);

        if (isNaN(number)) return 0;

        return number;
    }

    /**
     * 获取boolean类型的cop值
     * @param key 
     */
    public static getBooleanValue(key: string): boolean {
        let value = this.get(key);
        if (value == null) return false;

        value = value.toLowerCase();

        return value == "1" || value == "true";
    }

    /**
     * 获取所有的cop
     */
    public static getCops(): { [key: string]: string } {
        let cops = {};

        // mgrCfg.forDb("cop_db", (k, v) => {
        //     cops[v.key] = v.defaultValue;
        // });

        Tools.forEachMap(this.localCop, (k, v) => {
            cops[k] = v;
        })

        Tools.forEachMap(this.remoteCop, (k, v) => {
            cops[k] = v;
        })

        return cops;
    }









    ///// 赋值模块 /////
    public static setRemoteValue(key: string, value: string) {
        if (key == null) {
            cc.warn("mgrCop.setRemoteValue key not found!");
            return;
        }

        this.remoteCop[key] = value;
        this.processCop(this.remoteCop);
    }

    public static onReceiveSdkCop(configInfo) {
        cc.log("mgrCop.onReceiveSdkCop");
        this.remoteCop = JSON.parse(configInfo || "") || {};
        this.processCop(this.remoteCop);
    }



}