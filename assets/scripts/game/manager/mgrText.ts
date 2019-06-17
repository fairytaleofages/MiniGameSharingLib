import Manager from "../../ulframework/manager/Manager";
import mgrCfg from "./mgrCfg";
import Tools from "../../ulframework/utils/Tools";

const { ccclass } = cc._decorator;

@ccclass
export default class mgrText extends Manager {
    ///// 成员变量 /////
    private static textMapping: { [key: string]: string };

    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()
        this.textMapping = {};
        this.processTextDb();
    }

    protected static loadRecord(): void {
        super.loadRecord();
    }

    protected static saveRecord(): void {
        super.saveRecord();
    }

    private static processTextDb() {
        mgrCfg.forDb("text_db", (key, value) => {
            this.textMapping[key] = value.text;
        });
    }

    // ----- 接口 -----
    // function mgrText:get(id)
    //     return self.textMapping[id] or string.format("%%%s%%", id)
    // end

    // function mgrText:format(id, ...)
    //     local text = self.textMapping[id]
    //     if not text then return string.format("%%%s%%", id) end

    //     return string.format(text, ...)
    // end

    public static get(id: string) {
        let text = this.textMapping[id];
        if (!text) {
            text = id;
        }
        return text;
    }

    public static format(id, ...args) {
        let text = this.textMapping[id];
        if (!text) {
            return ul.format("%%s%", id)
        }
        return ul.format(text, ...args);
    }
}