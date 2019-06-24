import Manager from "../../ulframework/manager/Manager";
import mgrRecord from "./mgrRecord";
import Tools from "../../ulframework/utils/Tools";
import mgrCfg from "./mgrCfg";
import vGuideView from "../view/node/vGuideView";
import mgrDirector from "./mgrDirector";
import mgrTip from "./mgrTip";
import Const from "../Const";
import mgrSound from "./mgrSound";

const { ccclass, property } = cc._decorator;

const DEBUG = false;

@ccclass
export default class mgrGuide extends Manager {
    ///// 成员变量 /////
    /** 已注册的引导节点 */
    private static registeredNodes: { [name: string]: cc.Node } = {};

    private static activeGuideId: number;
    private static activeGuideStep: number;
    private static bStart = false;
    //保存在注册节点后需要出发的引导
    private static reactiveGuideId: number;
    private static reactiveGuideStep: number;

    /** 调试用，禁用引导 */
    private static bDebugCloseGuide = false;

    private static guideView: vGuideView;

    /** 已完成的引导 */
    private static completedGuideIds: { [guideId: number]: boolean } = {};

    /** 激活的引导 */
    private static availableGuideIds: number[] = [];










    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this.loadRecord();

        this.registerListeners({
            MSG_GUIDE_POINT: this.onMsgGuidePoint.bind(this),
            MSG_PLAY_SOUND603: this.onMsgPlaySound603.bind(this),
            MSG_PLAY_SOUND604: this.onMsgPlaySound604.bind(this),
            MSG_PLAY_SOUND605: this.onMsgPlaySound605.bind(this),
        });
    }

    protected static loadRecord(): void {
        super.loadRecord();

        let record = mgrRecord.getData("guide") || {};

        // cc.log("record", record)

        let ids = record.completedGuideIds || [];
        let hash = {};
        for (let i = 0; i < ids.length; i++) {
            hash[ids[i]] = true;
        }

        // cc.log("hash", hash)
        this.completedGuideIds = hash;

        this.refreshAvailableGuideIds();
    }

    protected static saveRecord(): void {
        super.saveRecord();

        let ids = [];
        Tools.forEachMap(this.completedGuideIds, (k, v) => {
            if (v == true) {
                ids.push(parseInt(k));
            }
        });


        let record = {
            completedGuideIds: ids,
        };
        // cc.log("saveRecord", record);
        mgrRecord.setData("guide", record);
    }

    /** 刷新可用的引导ids */
    private static refreshAvailableGuideIds(): void {
        let ids = [];
        mgrCfg.forDb("guide_db", (k, v) => {
            let id = parseInt(k);
            if (!this.completedGuideIds[id]) {
                ids.push(id);
            }
        });

        ids.sort();

        this.availableGuideIds = ids;

        cc.log("refreshAvailableGuideIds", ids);
    }









    ///// 引导节点相关 /////
    /**
     * 注册引导节点
     * @param name 用于引导中引用的name
     * @param node 
     */
    public static registerGuideNode(name: string, node: cc.Node): void {
        if (DEBUG) cc.log("mgrGuide.registerGuideNode", name, node);
        if (this.registeredNodes[name] && this.registeredNodes[name] == node) {
            if (DEBUG)
                cc.log("  node already registered", name);
            return;
        }

        if (!cc.isValid(node)) {
            cc.warn(ul.format("mgrGuide.registerGuideNode node is invalid! name = %s.", name));
            return;
        }

        if (this.registeredNodes[name]) {
            this.unregisterGuideNode(name);
        }

        this.registeredNodes[name] = node;
        this.sendMsg("MSG_GUIDE_POINT", { id: ul.format("%s.register", name) });

        // 添加监听器
        // let triggerNode = new cc.Node();
        // let component = node.addComponent(cc.Component);
        // component["onDestroy"] = () => {
        //     if (!node["__guide_trigger_node"]) return;
        //     node["__guide_trigger_node"] = null;
        //     this.unregisterGuideNode(name);
        // };
        // component["onDisable"] = () => {
        //     if (!node["__guide_trigger_node"]) return;
        //     node["__guide_trigger_node"] = null;
        //     this.unregisterGuideNode(name);
        // };
        // triggerNode.parent = node;
        // node["__guide_trigger_node"] = triggerNode;

        //在注册成功后尝试启动正在运行的引导
        if (DEBUG) cc.log(this.reactiveGuideId);
        if (DEBUG) cc.log(this.reactiveGuideStep);
        if (DEBUG) cc.log(this.bStart);
        if (this.reactiveGuideId != null && this.reactiveGuideStep != null && this.bStart == false) {
            // 尝试开启下一步
            let guideData = mgrCfg.get("guide_db", this.reactiveGuideId, this.reactiveGuideStep);


            // 自动启动
            let nodes = this.getGuideNodes(guideData.nodeNames);

            // cc.log("nodes", nodes);
            // cc.log("guideData", guideData);
            if (nodes.length <= 0 && guideData.nodeNames.length > 0) {
                return;
            }

            // 启动
            this.startGuide(this.reactiveGuideId, this.reactiveGuideStep);
            this.reactiveGuideId = null;
            this.reactiveGuideStep = null;
        }
    }

    public static unregisterGuideNode(name: string): void {
        // cc.log("mgrGuide.unregisterGuideNode", name);
        let node = this.registeredNodes[name];
        if (!node) {
            if (DEBUG) cc.warn(ul.format("mgrGuide.unregisterGuideNode node not found! name = %s.", name));
            return;
        }

        // 移除triggerNode
        let triggerNode: cc.Node = node["__guide_trigger_node"];
        if (cc.isValid(triggerNode)) {
            triggerNode.removeComponent(cc.Component);
            triggerNode.destroy();
            node["__guide_trigger_node"] = null;
        }

        this.onGuideNodeUnregister(name);
        this.sendMsg("MSG_GUIDE_POINT", { id: ul.format("%s.unregister", name) });
        this.registeredNodes[name] = null;
    }

    public static getGuideNode(name: string): cc.Node {
        let node = this.registeredNodes[name];
        if (!cc.isValid(node)) return null;
        return node;
    }

    public static getGuideNodes(names: string): cc.Node[] {
        let nodes = [];
        if (!names) return nodes;

        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let node = this.getGuideNode(name);
            if (node) {
                nodes.push(node);
            }
        }

        return nodes;
    }

    /**
     * 是否引导中
     */
    public static isGuiding(): boolean {
        return cc.isValid(this.guideView) || this.activeGuideId != null;
    }









    ///// 引导流程 /////
    /**
     * 取消当前的引导
     */
    public static cancelGuide(): void {
        // if (DEBUG) 
        cc.log(" 取消引导", this.activeGuideId, this.activeGuideStep);

        let msgGuideId = this.activeGuideId;
        let msgGuideStep = this.activeGuideStep;

        this.activeGuideId = null;
        this.activeGuideStep = null;
        this.bStart = false;

        if (cc.isValid(this.guideView)) {
            this.guideView.hideAndRemove();
            this.guideView = null;
        }

        let guideData = mgrCfg.quietGet("guide_db", msgGuideId, msgGuideStep);
        if (guideData && guideData.endMsg.length >= 1) {
            let [msg, msgData] = guideData.endMsg;
            cc.log("-----sendmg", msg, msgData);
            this.sendMsg(msg, msgData);
        }
    }

    /**
     * 开始引导
     * @param guideId 
     * @param step 
     */
    public static startGuide(guideId: number, step: number): void {
        // if (DEBUG) 
        cc.log("开始引导", guideId, step);

        this.activeGuideId = guideId;
        this.activeGuideStep = step;
        this.bStart = true;

        let guideData = mgrCfg.get("guide_db", guideId, step);
        if (!guideData) return;

        let guideNodes = this.getGuideNodes(guideData.nodeNames);

        // 查找guide所在的parent
        let parent: cc.Node = null;
        let order = Const.GLOBAL_ORDER_DIALOG;

        parent = this._searchParentFromCanvas(guideNodes[0]);

        if (DEBUG) cc.log("  _searchParentFromCanvas", parent);

        if (!parent) {
            let scene = cc.director.getScene()
            let canvas = scene.getChildByName("Canvas");
            parent = canvas;
        }

        let p = parent.convertToNodeSpace(cc.v2(mgrDirector.width / 2, mgrDirector.height / 2));

        if (DEBUG) {
            cc.log("  order", order);
            cc.log("  p", p.x, p.y);
        }

        let guideView = new vGuideView({ guideId: guideId, step: step });
        guideView.parent = parent;
        guideView.zIndex = order;
        guideView.show();
        this.guideView = guideView;

        if (guideData.startMsg.length >= 1) {
            let [msg, msgData] = guideData.startMsg;
            this.sendMsg(msg, msgData);
        }
    }

    /**
     * 搜索节点在canvas上的parent节点
     * @param node 
     */
    private static _searchParentFromCanvas(node: cc.Node): cc.Node {
        if (!cc.isValid(node)) return null;

        let scene = cc.director.getScene()
        let canvas = scene.getChildByName("Canvas");

        let p = node.parent;

        while (p) {
            if (p == canvas) return node;

            node = p;

            p = node.parent;
        }

        return null;
    }

    private static completeGuide(guideId: number, step: number): void {
        if (DEBUG) cc.log("@@@@@@ : completeGuide", guideId, step);

        let guideDatas = mgrCfg.get("guide_db", guideId);

        if (!guideDatas) {
            if (DEBUG) cc.warn(ul.format("mgrGuide.completeGuide guides not found, id = %d.", guideId))
            this.cancelGuide();
            return;
        }

        // 判断是否全部完成
        if (step >= guideDatas.length - 1) {
            // 最后一条，标记为完成
            if (!guideDatas[0].bRepeat) {
                this.completedGuideIds[guideId] = true;
                this.saveRecord();
                this.refreshAvailableGuideIds();
            }

            this.cancelGuide();

        } else {
            // 还有下一步            
            this.cancelGuide();

            this.activeGuideId = guideId;
            this.activeGuideStep = step + 1;
            this.bStart = false;

            // 尝试开启下一步
            let guideData = mgrCfg.get("guide_db", this.activeGuideId, this.activeGuideStep);

            // 如果下一步没有startTrigger，则可以自动启动
            if (guideData.startTrigger.length <= 0) {
                // 自动启动
                let nodes = this.getGuideNodes(guideData.nodeNames);

                // cc.log("nodes", nodes);
                // cc.log("guideData", guideData);
                if (nodes.length <= 0 && guideData.nodeNames.length > 0) {
                    if (DEBUG) cc.warn("mgrGuide.completeGuide, start next guide, but node not found!", this.activeGuideId, this.activeGuideStep);
                    let activeGuideId = this.activeGuideId;
                    let activeGuideStep = this.activeGuideStep;
                    this.cancelGuide();

                    this.reactiveGuideId = activeGuideId;
                    this.reactiveGuideStep = activeGuideStep;
                    return;
                }

                // 启动
                this.startGuide(this.activeGuideId, this.activeGuideStep);
            }
        }
    }

    public static onGuidePoint(id: string, data: any): void {
        if (this.bDebugCloseGuide) {
            // cc.warn("mgrmgrGuide.onGuidePoint guide is disable!", id);
            return;
        }

        if (DEBUG) {
            cc.log("mgrGuide.onGuidePoint", id);
            if (data) {
                Tools.forEachMap(data, (k, v) => {
                    cc.log(ul.format("  data: [%s] = %s", k, v.toString()));
                });
            }
        }

        if (this.activeGuideId != null && this.activeGuideStep != null) {
            if (DEBUG) cc.log("  发现正在运行的引导", this.activeGuideId, this.activeGuideStep);
            this._tryStopGuide(id, data);

        }

        if (this.activeGuideId == null || this.activeGuideStep == null) {
            if (DEBUG) cc.log("  没有正在运行的引导");
            this._tryStartGuide(id, data);
        }
    }

    private static _tryStartGuide(id: string, data: any): void {
        if (DEBUG) cc.log("  开始查找可启动的引导");

        for (let i = 0; i < this.availableGuideIds.length; i++) {
            let guideId = this.availableGuideIds[i];
            let guideDatas = mgrCfg.get("guide_db", guideId);

            for (let step = 0; step < guideDatas.length; step++) {
                let guideData = guideDatas[step];
                if (guideData.bStartStep && this._checkGuideCanStart(guideData, id, data)) {
                    if (DEBUG) cc.log("  找到可以启动的引导，启动：", guideData.id, guideData.step);

                    // 开启引导
                    this.startGuide(guideData.id, guideData.step);
                    return;
                }
                else {
                    if (guideData.startTrigger && guideData.startTrigger != "" && id == guideData.startTrigger[0][0]) {

                        this.reactiveGuideId = guideData.id;
                        this.reactiveGuideStep = guideData.step;
                    }
                }
            }
        }

        if (DEBUG) cc.log("  查找完毕，没有可启动的引导");
    }

    private static _tryStopGuide(id: string, data: any): void {
        if (DEBUG) cc.log("  开始查找可停止的引导");

        // 当前已经有激活的引导
        // 判断取消or完成
        let guideData = mgrCfg.get("guide_db", this.activeGuideId, this.activeGuideStep);

        if (this.bStart) {
            // 当前引导已经开始
            // 1. 判断是否需要取消
            if (this._checkTrigger(guideData.cancelTrigger, id, data)) {
                if (DEBUG) cc.log("  触发cancel条件，取消引导");

                this.cancelGuide();
                return;
            }

            // 2. 判断是否已完成
            if (this._checkTrigger(guideData.completeTrigger, id, data)) {
                if (DEBUG) cc.log("  触发complete条件，完成引导");

                this.completeGuide(this.activeGuideId, this.activeGuideStep);

                // 结束之后，如果activeGuideId和activeGuideStep还存在，则尝试开启下一步
                if (this.activeGuideId && this.activeGuideStep && !this.bStart) {
                    if (DEBUG) cc.log("  complete后存在需要启动的引导，尝试使用当前guideid启动")
                    let guideData = mgrCfg.get("guide_db", this.activeGuideId, this.activeGuideStep);
                    if (this._checkGuideCanStart(guideData, id, data)) {
                        if (DEBUG) cc.log("  触发start条件，开启引导");

                        this.startGuide(guideData.id, guideData.step);
                        return;
                    }
                }
                return;
            }

        } else {
            // 当前引导没有开始
            if (this._checkGuideCanStart(guideData, id, data)) {
                if (DEBUG) cc.log("  触发start条件，开启引导");

                this.startGuide(guideData.id, guideData.step);
                return;
            }
        }
    }

    private static _checkTrigger(trigger: any[], id: string, data: any) {
        // cc.log("++++++++++_checkTrigger", trigger, id, data);
        for (let i = 0; i < trigger.length; i++) {
            let [_id, condition] = trigger[i];

            // cc.log("cccccccccc  ", i, _id, condition)

            if (_id == id) {
                // cc.log("AAAAAAAAAAAAAAAAAAAA");
                let bPass = true;
                if (condition && Object.keys(condition).length > 0) {
                    Tools.forEachMap(condition, (ck, cv) => {
                        // cc.log("BBBBBBBBBBB");
                        if (data[ck] != cv) {
                            bPass = false;
                            return true;
                        }
                    });
                }

                if (bPass) return true;
            }
        }

        return false;
    }

    private static _checkGuideCanStart(guideData: any, id: string, data: any): boolean {
        // 检查start条件
        if (!this._checkTrigger(guideData.startTrigger, id, data)) {
            if (DEBUG) cc.log(ul.format("    [%d-%d]引导无法启动，startTrigger未满足", guideData.id, guideData.step));
            return false;
        }

        // 检查节点
        if (guideData.nodeNames.length > 0) {
            let nodes = this.getGuideNodes(guideData.nodeNames);
            if (nodes.length <= 0) {
                if (DEBUG) cc.log(ul.format("    [%d-%d]引导无法启动，guideNode未找到", guideData.id, guideData.step));
                return false;
            }
        }

        return true;
    }

    public static _debugCancelDebug() {
        this.bDebugCloseGuide = true;
        this.cancelGuide();

        mgrTip.showMsgTip("取消新手引导");
    }









    ///// 事件 /////
    public static onGuideNodeUnregister(name: string): void {
        // cc.log("mgrGuide.onGuideNodeUnregister", name);

        let guideId = this.activeGuideId;
        let step = this.activeGuideStep;

        if (guideId != null && step != null) {
            let guideData = mgrCfg.get("guide_db", guideId, step);

            for (let i = 0; i < guideData.nodeNames.length; i++) {
                let nodeName = guideData.nodeNames[i];
                if (nodeName == name) {
                    cc.warn("mgrGuide.onGuideNodeUnregister active guild's node unregister! cancel it!", guideId, step, name);
                    this.cancelGuide();
                    return;
                }
            }
        }
    }

    public static onMsgGuidePoint(e): void {
        let cmdData = e
        let id: string = cmdData.id;

        if (DEBUG) cc.log("mgrGuide.onMsgGuidePoint", id, cmdData);
        this.onGuidePoint(id, cmdData);
    }



    public static getbDebugCloseGuide() {
        if (DEBUG) cc.log(":(this.bDebugCloseGuide:", this.bDebugCloseGuide)
        return this.bDebugCloseGuide;
    }


    public static onMsgPlaySound603() {
        mgrSound.play(603);
    }
    public static onMsgPlaySound604() {
        mgrSound.play(604);
    }
    public static onMsgPlaySound605() {
        mgrSound.play(605);
    }

}