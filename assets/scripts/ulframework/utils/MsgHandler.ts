import Tools from "./Tools";

// const { ccclass } = cc._decorator;

// @ccclass
export default class MsgHandler {
    /**
     * 注册的监听器
     * {msgName:listeners};
     */
    private registeredListeners: any;
    /**
     * 已开始的监听器
     * {msgName:listeners};
     */
    private startedListeners: any;
    /**
     * 是否已开始
     */
    private bStarted;

    private eventTarget: cc.EventTarget;

    /**
     * 构造方法
     * @param eventTarget 事件目标，默认为cc.game
     */
    constructor(eventTarget?: cc.EventTarget) {
        this.eventTarget = eventTarget || cc.game;

        this.registeredListeners = {};
        this.startedListeners = {};
        this.bStarted = false;
    }

    /**
     * 注册监听器
     * @param listeners {msgName:listeners};
     */
    public registerListeners(listeners: any): void {
        Tools.forEachMap(listeners, (msgName, listener) => {
            if (this.registeredListeners[msgName] != null) {
                cc.log(`[警告] MsgHandler.registerListeners msg重复注册！ msgName=${msgName}`);
            }

            // 包装一层try-catch
            let safeListener = (e)=>{
                try {
                    listener(e);
                } catch (error) {
                    cc.error("MsgHandler.listener has error!", error);
                }
            };
            this.registeredListeners[msgName] = safeListener;
        });

        if (this.bStarted) {
            this.startProcMsg();
        }
    }

    /**
     * 开启消息处理器
     */
    public startProcMsg(): void {
        this.bStarted = true;

        // cc.log("startProcMsg")
        Tools.forEachMap(this.registeredListeners, (msgName, listener) => {
            if (!this.startedListeners[msgName]) {
                const listener = this.registeredListeners[msgName];

                // cc.log("  start", msgName, listener);
                this.eventTarget.on(msgName, listener, this);
                this.startedListeners[msgName] = listener;
            }
        });
    }

    /**
     * 停止消息处理器
     */
    public stopProcMsg(): void {
        Tools.forEachMap(this.startedListeners, (msgName, listener) => {
            this.eventTarget.off(msgName, listener, this);
        });

        this.bStarted = false
        this.startedListeners = {}
    }

    /**
     * 发送消息
     * @param msgName 消息名称
     * @param data 数据，通过e.e进行获取
     */
    public sendMsg(msgName: string, data?: any): void {
        try {
            this.eventTarget.emit(msgName, data)
        } catch (error) {
            cc.error("MsgHandler.sendMsg has exception", error);
        }
    }
}