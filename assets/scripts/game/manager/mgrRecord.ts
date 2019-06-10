import Manager from "../../ulframework/manager/Manager";
import Timer from "../../ulframework/utils/Timer";

const { ccclass } = cc._decorator;

const RECORD_DATA_KEY = "record_game62";
// const RECORD_AGE_KEY = "__age__";
const RECORD_VERSION_KEY = "__version__";
/**
 * 存档版本号：
 * 1： 2018-6-21：未知不兼容现象，强制清档
 */
const RECORD_VERSION_VALUE = 1;

@ccclass
export default class mgrRecord extends Manager {
    ///// 成员变量 /////

    /**
     * 核心存档数据
     * {key:value}
     */
    private static record: any = {};

    private static bNeedFlush: boolean = false;

    private static _bDebugBanWrite: boolean = false;









    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        // 加载存档
        this._readRecord();

        Timer.callLoop(0.1, this.onTimerSpan.bind(this), true);
    }

    private static onTimerSpan(timer) {
        if (this.bNeedFlush) {
            this.bNeedFlush = false;

            this._writeRecord();
        }
    }









    ///// IO相关 /////
    /**
     * 读取存档
     */
    private static _readRecord(recordText?: string) {
        if (!recordText) {
            recordText = cc.sys.localStorage.getItem(RECORD_DATA_KEY);
        }
        // cc.log("recordText", recordText);

        if (!recordText) {
            cc.warn("警告] mgrRecord._readRecord 存档未找到！重置存档！");
            this.resetRecord();
            return;
        }

        let record = JSON.parse(recordText);
        if (!record) {
            cc.warn("警告] mgrRecord._readRecord 存档数据损坏！重置存档！");
            this.resetRecord();
            return;
        }

        if (record[RECORD_VERSION_KEY] != RECORD_VERSION_VALUE) {
            cc.warn("警告] mgrRecord._readRecord 存档版本改变！重置存档！");
            this.resetRecord();
            return;
        }

        this.record = record;
    }

    /**
     * 写入存档（内部实现）
     */
    private static _writeRecord() {
        // cc.log("mgrRecord._writeRecord");
        let recordText = JSON.stringify(this.record);
        cc.sys.localStorage.setItem(RECORD_DATA_KEY, recordText);
    }

    /**
     * 请求写入存档（不会立即执行）
     */
    private static _requestFlush() {
        if (this._bDebugBanWrite) {
            // cc.log("bDebugBanWrite");
            return;
        }

        this.bNeedFlush = true;
        // this._writeRecord();
    }

    /**
     * 禁用存档写入
     * 内部测试方法，严禁使用！
     * @param bBanWrite 
     */
    private static _setDebugBanWrite(bBanWrite: boolean) {
        this._bDebugBanWrite = bBanWrite;
    }









    ///// 存取接口 /////
    /**
     * 读取存档数据
     * @param key
     */
    public static getData(key: string): any {
        return this.record[key];
    }

    /**
     * 设置存档数据
     * @param key 
     * @param value 
     */
    public static setData(key: string, value: Object) {
        this.record[key] = value;
        // this.record[RECORD_AGE_KEY] = (this.record[RECORD_AGE_KEY] || 0) + 1;
        this._requestFlush();
    }

    /**
     * 重置存档
     */
    public static resetRecord() {
        this.record = {};
        // this.record[RECORD_AGE_KEY] = 0;
        this.record[RECORD_VERSION_KEY] = RECORD_VERSION_VALUE;
        this._requestFlush();

        this.sendMsg("MSG_RECORD_RESET");
    }









}