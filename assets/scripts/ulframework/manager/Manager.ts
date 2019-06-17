import MsgHandler from "../utils/MsgHandler";
import Tools from "../utils/Tools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Manager {
    ///// 静态方法 /////
    private static _managerInstances: (typeof Manager)[] = [];

    public static loadAllManagers() {    
        for (let i = 0; i < this._managerInstances.length; i++) {
            let manager = this._managerInstances[i];
            try {
                manager.onLoad();
            } catch (error) {
                cc.error("Manager.loadAllManager has error", error);
            }
        }
    }








    ///// 生命周期 /////
    private static _msgHander: MsgHandler;
    private static _bNetworkResponseRegistered = false;
    // protected constructor() {
    //     Manager._managerInstances.push(this);

    //     // manager的监听器默认启动
    //     this._msgHander = new MsgHandler();
    //     this._msgHander.startProcMsg();        
    // }

    /**
     * 初始化
     */
    public static init(): void {
        Manager._managerInstances.push(this);

        // manager的监听器默认启动
        this._msgHander = new MsgHandler();
        this._msgHander.startProcMsg();
    }

    /**
     * 初始化回调
     */
    protected static onLoad(): void {
        this.registerListeners({
            "MSG_RECORD_RESET": this.loadRecord,
        });

        if (!this._bNetworkResponseRegistered) {
            this._bNetworkResponseRegistered = true;
            this.onRegisterNetworkResponseListeners();
        }
    }

    /**
     * 加载存档
     * 伴随生命周期自动调用
     */
    protected static loadRecord(): void {

    }

    /**
     * 保存存档
     */
    protected static saveRecord(): void {

    }

    /**
     * 注册网络剧监听器
     */
    protected static onRegisterNetworkResponseListeners() {

    }










    ///// 实现MsgHandler相关的功能
    /**
     * 注册监听器
     * this.registerListeners({
     *      "MSG_TEST":this.onMsgTest,
     * });
     * @param listeners {msgName:listeners};
     */
    protected static registerListeners(listeners: any): void {
        Tools.forEachMap(listeners, (k, listener) => {
            listeners[k] = listener.bind(this);
        });
        this._msgHander.registerListeners(listeners);
    }

    /**
     * 开启消息处理器
     */
    protected static startProcMsg(): void {
        this._msgHander.startProcMsg();
    }

    /**
     * 停止消息处理器
     */
    protected static stopProcMsg(): void {
        this._msgHander.stopProcMsg();
    }

    /**
     * 发送消息
     * @param msgName 消息名称
     * @param data 数据，通过e.e进行获取
     */
    public static sendMsg(msgName: string, data?: any): void {
        this._msgHander.sendMsg(msgName, data);
    }
}