import mgrDirector from "../../game/manager/mgrDirector";
import LifeCycleMonitor from "../component/LifeCycleMonitor";
import MsgHandler from "../utils/MsgHandler";
import Tools from "../utils/Tools";

// const { ccclass, property } = cc._decorator;

// @ccclass
export default class ViewBase extends cc.Node {
    /**
     * 资源节点，对应prefab或者scene加载的资源
     */
    protected nodeResource: cc.Node;

    /**
     * 消息处理器内部实例
     */
    private _msgHander: MsgHandler;
    /**
     * 上下文，类型为Object
     */
    public context: any;


    /**
     * 构造方法
     * @param context 上下文
     */
    constructor(context: any = {}) {
        super();

        if (!context) context = {};
        this.context = context;
        this._msgHander = new MsgHandler();

        this._bindLifeCycle();
    }

    _onPreDestroy() {
        this.onDestroy();

        if (super["_onPreDestroy"]) {
            super["_onPreDestroy"]();
        }
    }










    ///// 生命周期中调用msg相关接口 //////
    /**
     * 子类覆盖后请务必调用 super.onLoad()!
     * <警告> 子类复用后必须使用super调用父类的接口！
     * @deprecated 禁止覆盖！
     * @requires super.onLoad()
     */
    protected onLoad() {
        this.startProcMsg();
        this._loadResource();
    }

    /**
     * nodeResource加载完毕回调
     */
    protected onResourceLoaded() {
    }

    /**
     * 对应cc.Component.start
     */
    protected start() {
    }

    /**
     * 对应cc.Component.update
     */
    protected update(dt: number) {
    }

    /**
     * 子类覆盖后请务必调用 super.onDestroy()!
     * <警告> 子类复用后必须使用super调用父类的接口！
     * @deprecated 禁止覆盖！
     * @requires super.onDestroy()
     */
    protected onDestroy() {
        this.stopProcMsg();
    }










    ///// 实现MsgHandler相关的功能
    /**
     * 注册监听器
     * this.registerListeners({
     *      "MSG_TEST":this.onMsgTest,
     * });
     * @param listeners {msgName:listeners};
     */
    protected registerListeners(listeners: any): void {
        Tools.forEachMap(listeners, (k, listener) => {
            listeners[k] = listener.bind(this);
        });
        this._msgHander.registerListeners(listeners);
    }

    /**
     * 开启消息处理器
     */
    protected startProcMsg(): void {
        this._msgHander.startProcMsg();
    }

    /**
     * 停止消息处理器
     */
    public stopProcMsg(): void {
        this._msgHander.stopProcMsg();
    }

    /**
     * 发送消息
     * @param msgName 消息名称
     * @param data 数据，通过e.e进行获取
     */
    public sendMsg(msgName: string, data?: any): void {
        this._msgHander.sendMsg(msgName, data);
    }









    ///// reousrce加载相关 /////
    protected _getResourceName(): string {
        return "";
    }

    protected _getResourceBindingConfig(): any {
        return {};
    }

    protected _loadResource() {
        let resourceName = this._getResourceName();
        if (!resourceName) {
            // cc.warn("ViewBase._loadResource resourceName not found!");
            // 没有resourceName，直接完成生命周期
            this.nodeResource = this;
            this.onResourceLoaded();
            this.nodeResource = this;
            return;
        }

        mgrDirector.loadNode(resourceName, ( nodePrefab )=>{
            let nodeResource = nodePrefab;

            if (!cc.isValid(this)) {
                cc.warn("ViewBase._loadResource when nodeResource laod finished, this is unvaliad!");
                return;
            };

            cc.log("@@@resourceName: ", resourceName)
            let nodeResourceParent = new cc.Node();
            nodeResourceParent.parent = this;
            nodeResource.parent = nodeResourceParent;
    
            if (nodeResource.x != 0 || nodeResource.y != 0) {
                // cc.warn("ViewBase._loadResource nodeResource pos not [0, 0]!", resourceName);
                nodeResource.setPosition(0, 0);
            }
    
            let nodeMapping = this._buildNodeMapping(nodeResource);
            // cc.log("nodeMapping", nodeMapping)
    
            // 绑定
            Tools.forEachMap(this._getResourceBindingConfig(), (name: string, v: any) => {
                let node: cc.Node = nodeMapping[name];
    
                if (!node) {
                    cc.warn("ViewBase._loadResource node not found!", name);
                    return;
                }
    
                let obj = null;
                if (v.vartype == cc.Node) {
                    // 保存节点
                    obj = node;
                } else {
                    // 尝试查找组件
                    obj = node.getComponent(v.vartype);
                    // cc.log("obj =>", v.vartype["__proto__"]["__classname__"], v.varname, obj)
                    if (!obj) {
                        cc.warn("ViewBase._loadResource obj not found!", name);
    
                        // 没找到，返回null？
                    } else {
                        // 绑定事件
                        let events = v.events;
                        if (events) {
                            for (let i = 0; i < events.length; i++) {
                                const v = events[i];
                                let bindMethodName = v.bindMethod;
                                let methodName = v.method;
    
                                // let bindMethod = obj[bindMethodName];
                                // let method = this[methodName];
    
                                if (!(obj[bindMethodName] instanceof Function)) {
                                    cc.warn(ul.format("ViewBase._loadResource bindMethod not found! varname=[%s] bindMethodName=[%s]", v.varname, bindMethodName));
                                    continue;
                                }
    
                                if (!(this[methodName] instanceof Function)) {
                                    cc.warn(ul.format("ViewBase._loadResource method not found! varname=[%s] method=[%s]", v.varname, methodName));
                                    continue;
                                }
    
                                obj[bindMethodName](this[methodName].bind(this));
                            }
                        }
                    }
                }
    
                this[v.varname] = obj;
            });
    
            cc.log("  after loaded, trigger onResourceLoaded")
    
            // 解释一下这个奇怪的赋值方式
            // 期望中，onResourceLoaded需要先调用，但是nodeReousrce需要提前赋值
            this.nodeResource = nodeResource;
            this.onResourceLoaded();
    
        });
    }

    private _buildNodeMapping(node: cc.Node, mapping?: any): any {
        if (!mapping) mapping = {};

        // cc.log("buildMapping", node.name);

        if (node.name) {
            mapping[node.name] = node;
        }

        let children = node.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            this._buildNodeMapping(child, mapping);
        }

        return mapping;
    }

    private _bindLifeCycle() {
        let monitor = this.addComponent(LifeCycleMonitor);
        monitor.setOnLoadCallback(this.onLoad.bind(this));
        monitor.setStartCallback(this.start.bind(this));
        monitor.setUpdateCallback(this.update.bind(this));
        // monitor.setOnDestroyCallback(this.onDestroy.bind(this));
    }






    /** 判断Resource是否加载完毕 */
    protected isResourceLoaded() {
        return cc.isValid(this.nodeResource);
    }


}