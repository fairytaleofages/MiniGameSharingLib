import Manager from "../../ulframework/manager/Manager";
import mgrCfg from "./mgrCfg";

const { ccclass } = cc._decorator;

/**
 * TODO
 * 完整的屏蔽字过滤功能包含filter接口
 * prj.game23中完整的过滤方案，需要迁移到ts中
 */
@ccclass
export default class mgrWordFilter extends Manager {
    ///// 成员变量 /////
    /** 被过滤的词语 */
    private static REP_STR = "**";
    /** 需要屏蔽的符号 */
    private static REP_NO_SYMBOL = /[\!\@\#\$\%\^\&\*\(\)\`\~\<\>\,\.\/\?\;\:\'\"\[\]\{\}\\\|\-\=\_\+\n\r\t\b ]/g;
    // private static REP_NO_SYMBOL = /[!@#$%]/;

    /**
     * 屏蔽字库
     */
    private static badwords: string[];

    // /**
    //  * 首字母分组的屏蔽字库
    //  */
    // private static badwordsGroupByHead: { [headStr: string]: string[] };










    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this._loadWords();
    }

    protected static loadRecord(): void {
        super.loadRecord();
    }

    protected static saveRecord(): void {
        super.saveRecord();
    }









    ///// 配置文件读取相关 /////
    private static _loadWords(): void {
        if (!this.badwords) {
            let badwords = mgrCfg.getDb("badword_db");
            this._processBadwords(badwords);
        }
    }

    private static _processBadwords(badwords: string[]): void {
        this.badwords = badwords;

        // cc.log("_processBadwords")
        // cc.log("  badwords", badwords);
    }









    ///// 检测接口 /////
    /**
     * 检查传入的字符串
     * @param str 
     * @return 是否通过检测 true：通过
     */
    public static checkStr(str: string): boolean {
        if (!str) return true;

        let badwords = this.badwords;

        // cc.log("checkStr", str);
        // ul.dump(badwords, "badwords");

        for (let i = 0; i < badwords.length; i++) {
            if (str.match(badwords[i])) {
                // cc.warn(ul.format("mgrWordFilter find bad word str=[%s], word=[%s]", str, badwords[i]));
                return false;
            }
        }
        return true;
    }

    /**
     * 过滤关键字
     * @param str 
     * @param repStr 替换文本
     */
    public static filterStr(str: string, repStr?: string): string {
        repStr = repStr || this.REP_STR;

        let badwords = this.badwords;
        for (let i = 0; i < badwords.length; i++) {
            str = str.replace(badwords[i], repStr);
        }

        return str;
    }

    /**
     * 检测是否含有非法符号
     * @param str 
     */
    public static hasSymbol(str: string): boolean {
        // let pattern = new RegExp(this.REP_NO_SYMBOL);
        let ret = str.match(this.REP_NO_SYMBOL);

        if (ret) return true;

        return false;
    }

    /**
     * 过滤非法符号
     * @param str 
     */
    public static filterSymbol(str: string): string {
        if (!str) return "";

        str = str.replace(this.REP_NO_SYMBOL, "");

        return str;
    }









}