import Manager from "../../ulframework/manager/Manager";
import Timer from "../../ulframework/utils/Timer";
import mgrSdk from "./mgrSdk";

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

    private static _record_compress_key_map: { [key: string]: string } = {}
    private static _record_uncompress_key_map: { [key: string]: string } = {}

    private static _gobal_key_index: number = 0






    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()
        //
        this.__generate_key_map();

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


    ///////// 网络存档相关 ///////////
    public static setUserId(userId) {
        if (!userId) {
            console.log("--->> userId is invaild!", userId)
            return
        }
        this.record["userId"] = userId
        //请求网络存档
        mgrSdk.getServerRecord()
    }

    public static onReceivedServerStorage(strData: string) {
        if (!strData) {
            console.log("--->> cloud storage is invaild!")
            return
        }
        try {
            let recordData = JSON.parse(strData)
            if (!recordData) {
                console.log("--->> cloud storage is damaged!")
                return
            }

            // recordData = this.__uncompress(recordData)

            //保存userId(假如登录就能获得空白存档)
            recordData["userId"] = this.record["userId"]
            //覆盖本地存档
            this.record = recordData

            this.sendMsg("MSG_RECORD_RESET")
        } catch (error) {
            console.log(error)
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
        // let compressRecord = this.__compress(this.record)
        let recordText = JSON.stringify(this.record);
        cc.sys.localStorage.setItem(RECORD_DATA_KEY, recordText);
        // console.log(recordText)
        //云存档
        if (this.record["userId"]) {
            let record = ul.clone(this.record)
            record["player"].historyGotItems = null
            record["player"].historyDailyMaxGotItems = null
            record["player"].historyDailyMaxUsedItems = null
            let recordText = JSON.stringify(record);
            mgrSdk.saveServerRecord(recordText)
        }
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


    //////////////// 存档压缩 //////////////////
    private static __generate_key_map() {
        cc.loader.loadRes("cfg/_record.json", (error, res) => {
            if (error) {
                console.log(error)
            }
            else {
                let templateRecord = res.json
                this.__generate_key_map_real(templateRecord)

                // cc.log(templateRecord)
                // /// 尝试压缩
                // let compressData = this.__compress(templateRecord)
                // cc.log("//////////////////compress//////////////////////////")
                // cc.log(compressData)
                // cc.log("//////////////////uncmpress//////////////////////////")
                // //解压缩
                // let uncompressData = this.__uncompress(compressData)
                // cc.log(uncompressData)
            }
        })
    }

    private static __generate_key_map_real(data) {
        if (ul.getType(data) != "object" && ul.getType(data) != "array") return
        for (const key in data) {
            this._record_compress_key_map[key] = this._gobal_key_index.toString()
            this._record_uncompress_key_map[this._gobal_key_index.toString()] = key
            this._gobal_key_index++
            this.__generate_key_map_real(data[key])
        }
    }

    /**
     * 压缩
     * @param data 
     */
    private static __compress(data: any) {
        //只压缩键值
        if (ul.getType(data) != "object" && ul.getType(data) != "array") return data

        let newData: any = {}
        for (const key in data) {
            newData[this._record_compress_key_map[key] || key] = this.__compress(data[key])
        }

        return newData
    }

    /**
     * 解压
     * @param str 
     */
    private static __uncompress(data: any) {
        //只解压缩键值
        if (ul.getType(data) != "object" && ul.getType(data) != "array") return data

        let newData: any = {}
        for (const key in data) {
            newData[this._record_uncompress_key_map[key] || key] = this.__uncompress(data[key])
        }

        return newData
    }






}