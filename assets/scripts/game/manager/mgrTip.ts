import Manager from "../../ulframework/manager/Manager";
import mgrDirector from "./mgrDirector";
import Timer from "../../ulframework/utils/Timer";
import vPromptDialog from "../view/dialog/vPromptDialog";
import vMsgTip from "../view/node/vMsgTip";
import Const from "../Const";
import mgrCfg from "./mgrCfg";
import Tools from "../../ulframework/utils/Tools";
import mgrPool from "./mgrPool";
import Particle from "../../ulframework/view/Particle";
import Spine from "../../ulframework/view/Spine";
import mgrShop from "./mgrShop";
import AnimNode from "../../ulframework/view/AnimNode";
import mgrAd from "./mgrAd";
import mgrPlayer from "./mgrPlayer";
import vMark from "../view/node/vMark";
import vDebugPickerDialog from "../view/dialog/vDebugPickerDialog";

const { ccclass } = cc._decorator;

type TGotItemTipData = {
    itemId: number,
    amount: number,
    amountSteps: number[][],
    customerContext?: any,
}

type TMsgTipData = {
    text: string,
    startPosition?: cc.Vec2,
    color?: cc.Color,
    outlineColor?: cc.Color,
    deltaY?: number,
}

@ccclass
export default class mgrTip extends Manager {
    ///// 成员变量 /////
    private static msgTipQueue: TMsgTipData[];
    private static msgTipTimer: Timer;

    private static iconTipQueue: { [id: string]: { icon: string, startPos: cc.Vec2, endPos: cc.Vec2, text: string, interval: number }[] };
    private static iconTipTimer: Timer;

    private static defaultGotItemQueue: TGotItemTipData[] = [];
    private static gotItemQueues: TGotItemTipData[][] = [mgrTip.defaultGotItemQueue];
    private static gotItemDialogShowingFlags: { [queueIndex: number]: boolean } = {};

    private static waitingDialog = null;







    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this.msgTipQueue = [];
        this.iconTipQueue = {};
    }

    protected static loadRecord(): void {
        super.loadRecord();
    }

    protected static saveRecord(): void {
        super.saveRecord();
    }




    ///// picker /////
    /**
     * 显示piacker
     * @param title 
     * @param conf 
     * @param callback 
     */
    public static showPicker(title: string, conf: { text: string, value: any }[], callback: (value: any) => void): void {
        let dialog = new vDebugPickerDialog({
            title: title,
            conf: conf,
            callback: callback,
        })
        dialog.openDialog(true);
    }




    ///// prompt /////
    /**
     * 显示无按钮的提示框
     * @param title 
     * @param content 
     */
    public static alertPrompt0(title: string, content: string): vPromptDialog {
        return this._alertPrompt(title, content, [], []);
    }

    /**
     * 显示一个按钮的提示框
     * @param title 
     * @param content 
     * @param btnText 
     * @param callback return true，点击按钮后不关闭对话框
     */
    public static alertPrompt(title: string, content: string, btnText: string, callback?: () => (boolean | void)): vPromptDialog {
        return this._alertPrompt(title, content, [btnText], [callback]);
    }

    /**
     * 显示两个按钮的提示框
     * @param title 
     * @param content 
     * @param btnText1 
     * @param btnText2 
     * @param callback1 return true，点击按钮后不关闭对话框
     * @param callback2 return true，点击按钮后不关闭对话框
     */
    public static alertPrompt2(title: string, content: string, btnText1: string, btnText2: string, callback1?: () => (boolean | void), callback2?: () => (boolean | void)): vPromptDialog {
        return this._alertPrompt(title, content, [btnText1, btnText2], [callback1, callback2]);
    }

    /**
     * 显示两个按钮的提示框
     * @param title 
     * @param content 
     * @param btnText1 
     * @param btnText2
     * @param btnText3
     * @param callback1 return true，点击按钮后不关闭对话框
     * @param callback2 return true，点击按钮后不关闭对话框
     * @param callback3 return true，点击按钮后不关闭对话框
     */
    public static alertPrompt3(title: string, content: string, btnText1: string, btnText2: string, btnText3: string, callback1?: () => (boolean | void), callback2?: () => (boolean | void), callback3?: () => (boolean | void)): vPromptDialog {
        return this._alertPrompt(title, content, [btnText1, btnText2, btnText3], [callback1, callback2, callback3]);
    }

    /**
     * 显示提示框内部实现
     * @param title 
     * @param content
     * @param btnTexts 
     * @param callbacks 
     */
    private static _alertPrompt(title: string, content: string, btnTexts: string[], callbacks: (() => (boolean | void))[]): vPromptDialog {
        let dialog = new vPromptDialog({
            title: title,
            content: content,
            btnTexts: btnTexts,
            callbacks: callbacks,
        });
        dialog.openDialog();
        return dialog;
    }










    ///// msgTip /////
    /**
     * 显示消息
     * @param text
     * @param startPosition 
     */
    public static showMsgTip(text: string, startPosition?: cc.Vec2, color?: cc.Color, outlineColor?: cc.Color, deltaY?: number): void {
        startPosition = startPosition || cc.v2(mgrDirector.width * 0.5, mgrDirector.height * 0.75);

        this.msgTipQueue.push({ text: text, startPosition: startPosition, color: color, outlineColor: outlineColor, deltaY: deltaY });

        if (!this.msgTipTimer) {
            let timer = new Timer(1, -1, this._onMsgTipTimerLoop.bind(this));
            timer.start(true);
            this.msgTipTimer = timer;

            // 第一帧手动触发
            this._onMsgTipTimerLoop(timer);
        }
    }

    private static _onMsgTipTimerLoop(timer: Timer) {
        // cc.log("_onMsgTipTimerLoop", this.msgTipQueue.length);

        if (this.msgTipQueue.length <= 0) {
            timer.stop();
            this.msgTipTimer = null;
            return;
        }

        let data = this.msgTipQueue.shift();

        let msgTip = new vMsgTip();
        msgTip.setText(data.text);

        if (data.color) {
            msgTip.setColorEx(data.color, data.outlineColor);
        } else {
            // 默认用creator设置的值即可
            // msgTip.setColor(cc.color(255, 255, 255), cc.color(0x66, 0x66, 0x66));
        }

        msgTip.play(data.startPosition, data.deltaY);
    }

    public static getTipRootNode(): cc.Node {
        let UIRoot = mgrDirector.getUIRoot();
        let node = UIRoot.getChildByName("__tip_root__");

        if (!cc.isValid(node)) {
            node = new cc.Node();
            node.parent = UIRoot;
            node.name = "__tip_root__";
            node.zIndex = (Const.GLOBAL_ORDER_TIP);
        }

        return node;
    }

    public static getTipIconRootNode(): cc.Node {
        let UIRoot = mgrDirector.getUIRoot();
        let node = UIRoot.getChildByName("__tip_icon_root__");

        if (!cc.isValid(node)) {
            node = new cc.Node();
            node.parent = UIRoot;
            node.name = "__tip_icon_root__";
            node.zIndex = (Const.GLOBAL_ORDER_TIP_ICON);
        }

        return node;
    }


    public static getTipIceNode(): cc.Node {
        let UIRoot = mgrDirector.getUIRoot();
        let node = UIRoot.getChildByName("__tip_ice__");

        if (!cc.isValid(node)) {
            node = new cc.Node();
            node.parent = UIRoot;
            node.name = "__tip_ice__";
            node.position = cc.v2( -mgrDirector.width / 2, -mgrDirector.height / 2);
            node.zIndex = (Const.GLOBAL_ORDER_TIP);
        }

        return node;
    }






    ///// 获得物品提示 /////
    /**
     * 显示获得物品提示
     * 使用默认队列
     * @param itemId 
     * @param amount 
     * @param amountSteps 
     */
    public static addGotItemTip(itemId: number, amount: number, amountSteps?: number[][], customerContext?: any): void {
        this.defaultGotItemQueue.push({
            itemId: itemId,
            amount: amount,
            amountSteps: amountSteps,
            customerContext: customerContext,
        });
        this._tryShowGotItemDialog();
    }

    /**
     * 插入获得物品提示
     * 使用默认队列
     * 最高优先级
     * @param itemId 
     * @param amount 
     * @param amountSteps 
     */
    public static insertGotItemTip(itemId: number, amount: number, amountSteps?: number[][], customerContext?: any): void {
        this.defaultGotItemQueue.unshift({
            itemId: itemId,
            amount: amount,
            amountSteps: amountSteps,
            customerContext: customerContext,
        });
        this._tryShowGotItemDialog();
    }

    /**
        概述：
        获得物品的时候，使用ul.mgrTip:addGotItemTip(...)来显示获得的物品
        如果同时获得多次物品，调用多次addGotItemTip即可
        mgrTip会维护一个队列，依次展示不同的gotItemTip

        但是，如果在vGotItemTip中，触发到了购买商品或者领取成就的逻辑，那么新得到的东西，需要最优先进行展示
        但是触发这个新物品的vGotItemTip依然存在，按照传统的addGotItemTip就无法处理两个vGotItemTip并存逻辑

        针对这种特殊的情况，新增了添加获得物品组的方法
        默认的addGotItemTip都采用default的队列
        采用group形式添加的提示，将针对这个group单独新增队列

        举例说明：
        传统模式，得到abc
        show-a
        close-a
        show-b
        close-b
        show-c
        close-c

        在a中，购买得到了d和e
        show-a
            addGotItemTipGroup({{itemId = d}, {itemId = e}})
            show-d
            close-d
            show-e
            close-e
        close-a
        show-b
        close-b
        show-c
        close-c
     */
    public static addGotItemTipGroup(datas: TGotItemTipData[]): void {
        // 在队列中查找一个空白队列
        let queue: TGotItemTipData[] = null;

        Tools.forEachMap(this.gotItemQueues, (k, v) => {
            if (v != this.defaultGotItemQueue && v.length <= 0) {
                queue = v;
                return true;
            }
        });

        if (!queue) {
            queue = [];
            this.gotItemQueues.push(queue);
        }

        for (let i = 0; i < datas.length; i++) {
            const v = datas[i];
            queue.push(v);
        }

        this._tryShowGotItemDialog();
    }

    private static _tryShowGotItemDialog(): void {
        // 遍历队列
        for (let queueIndex = 0; queueIndex < this.gotItemQueues.length; queueIndex++) {
            const queue = this.gotItemQueues[queueIndex];

            if (!this.gotItemDialogShowingFlags[queueIndex]) {
                // 处理这个队列
                if (queue.length > 0) {
                    // 标记为展示用
                    this.gotItemDialogShowingFlags[queueIndex] = true;

                    let v = queue.shift();

                    let viewName = "vGotItemDialog";

                    let context: any = {};
                    if (v.customerContext) {
                        Tools.forEachMap(v.customerContext, (k, v) => {
                            context[k] = v;
                        });
                    }

                    context.itemId = v.itemId;
                    context.amount = v.amount;
                    context.amountSteps = v.amountSteps;
                    context.fOnDialogClose = () => {
                        this.gotItemDialogShowingFlags[queueIndex] = false;
                        if (v.customerContext && v.customerContext.fOnDialogClose instanceof Function) {
                            v.customerContext.fOnDialogClose();
                        }
                        this._tryShowGotItemDialog();
                    };

                    mgrDirector.openDialog(viewName, context);
                }
            }
        }
    }

    /**
     * 是否所有的gotItemTip显示完毕
     * @return true:显示完毕
     */
    public static isAllGotItemTipDisplayed(): boolean {
        // 判断是否有任何对话框正在展示中
        let bFind = false;
        Tools.forEachMap(this.gotItemDialogShowingFlags, (k, v) => {
            if (v) {
                bFind = true;
                return true;
            }
        })
        if (bFind) return false;

        // 判断队列中是否有对话框等待中
        for (let i = 0; i < this.gotItemQueues.length; i++) {
            const queue = this.gotItemQueues[i];
            if (queue.length > 0) return false;
        }

        return true;
    }

    /**
     * 显示物品详情对话框
     * @param itemId 
     * @param amount 
     * @param context 
     */
    public static showItemDetailDialog(itemId: number, amount?: number, context?: any) {
        context = context || {};
        if (amount == null) amount = 1;

        context.itemId = itemId;
        context.amount = amount;

        // 目前只有一个itemDetailDialog
        // 后续如果需要区分部件、物品等，参照game23的方式来
        let viewName = "vItemDetailDialog";

        mgrDirector.openDialog(viewName, context);
    }

    /**
     * 判断等待对话框是否打开
     */
    public static isWaitingDialogOpened() {
        return this.waitingDialog != null;
    }

    /**
     * 打开等待对话框
     * @param title 
     * @param content 
     * @param btnText 
     */
    public static openWaitingDialog(title?: string, content?: string, btnText?: string) {
        if (this.isWaitingDialogOpened()) {
            return;
        }
        let dialog = new vPromptDialog({
            title: title || "提示",
            content: content || "请稍候...",
            btnTexts: [btnText || "取消"],
            fOnDialogClose: () => {
                this.waitingDialog = null;
            },
        });
        dialog.openDialog();
        this.waitingDialog = dialog;
    }

    /**
     * 关闭等待对话框
     */
    public static closeWaitingDialog() {
        if (this.waitingDialog) {
            this.waitingDialog.closeDialog();
            this.waitingDialog = null;
        }
    }








    ///// 特效相关 /////
    /**
     * 播放粒子特效(一次)
     * @param particleId 对应particle_db中的id
     * @param x world坐标系 [0, 0]是屏幕左下角
     * @param y world坐标系 [0, 0]是屏幕左下角
     * @param scale
     * @param specialParent 播放到特定的parent上
     */
    public static playParticleOnce(particleId: string, x: number, y: number, scale?: number, specialParent?: cc.Node): void {
        let particle: Particle = mgrPool.get("particle", particleId);
        if (!particle) return;

        particle.parent = specialParent || this.getTipRootNode();

        // 转换坐标
        particle.position = particle.parent.convertToNodeSpace(cc.v2(x, y));

        if (scale != null) particle.scale = scale;
        particle.setAutoRemoveOnFinish(true);
    }

    /**
     * 播放spine动画一次
     * @param spineId 对应spine_db中的id
     * @param x world坐标系 [0, 0]是屏幕左下角
     * @param y world坐标系 [0, 0]是屏幕左下角
     * @param scale 
     * @param specialParent 播放到特定的parent上
     */
    public static playSpineOnce(spineId: string, x: number, y: number, scale?: number, specialParent?: cc.Node) {
        let spine: Spine = mgrPool.get("spine", spineId);
        if (!spine) return;

        spine.parent = specialParent || this.getTipRootNode();

        // 转换坐标
        spine.position = spine.parent.convertToNodeSpace(cc.v2(x, y));

        if (scale != null) spine.scale = scale;

        spine.play("mov_1", false);
        spine.registerEventCallback((e) => {
            if (e.name == "cpmplete") {
                spine.removeFromParent();
                mgrPool.put(spine);
                spine = null;
            }
        });
    }

    /**
     * 播放AnimNode一次
     * @param spineId 对应spine_db中的id
     * @param x world坐标系 [0, 0]是屏幕左下角
     * @param y world坐标系 [0, 0]是屏幕左下角
     * @param scale
     * @param specialParent 播放到特定的parent上
     */
    public static playAnimNodeOnce(animId: string, x: number, y: number, scalex?: number, scaley?: number, specialParent?: cc.Node, rotate?: number) {
        let tempNode = new cc.Node();
        let animNode: AnimNode = mgrPool.get("animNode", animId);
        if (!animNode) return;

        tempNode.parent = specialParent || this.getTipRootNode();
        animNode.parent = tempNode;

        // 转换坐标
        if ( specialParent ) {
            tempNode.position = cc.v2(x, y);
        } else {
            tempNode.position = tempNode.parent.convertToNodeSpace(cc.v2(x, y));
        }

        if (!!scalex) tempNode.scaleX = scalex;
        if (!!scaley) tempNode.scaleY = scaley;
        if (!!rotate) tempNode.rotation = rotate;

        animNode.play();
        animNode.registerEventCallback((e) => {
            if (e.name == "finished") {
                animNode.removeFromParent();
                mgrPool.put(animNode);
                animNode = null;
                tempNode.destroy();
            }
        });
    }

    //在指定的位置创建一章图片,  并播放一个动画, 指定下次重复改过程的间隔
    public static showIconTips(itemId: number, amount: number, startPos?: cc.Vec2, endPos?: cc.Vec2, queueId?: string) {
        let icon = mgrCfg.get("item_template_db", itemId, "icon");
        let text = ul.format("*%d", amount);

        startPos = startPos || new cc.Vec2(0, 0);
        endPos = endPos || new cc.Vec2(60, 60);
        //世界坐标转本地坐标
        startPos = cc.v2(startPos.x - mgrDirector.width / 2, startPos.y - mgrDirector.height / 2);
        endPos = cc.v2(endPos.x - mgrDirector.width / 2, endPos.y - mgrDirector.height / 2);

        if (queueId) {
            // cc.log(queueId);
            let interval = 0.5;
            if (!this.iconTipQueue[queueId]) {
                this.iconTipQueue[queueId] = [];
            }
            if (this.iconTipQueue[queueId].length == 0) {
                //队列第一个直接弹出
                interval = 0;
            }
            this.iconTipQueue[queueId].push({ icon: icon, startPos: startPos, endPos: endPos, text: text, interval: interval });
            if (!this.iconTipTimer) {
                this.iconTipTimer = new Timer(0.1, -1, this._onShowIconTimerCallback.bind(this));
                this.iconTipTimer.start(true);

                // this._onShowIconTimerCallback();
            }
        }
        else {
            this._playShowIcon({ icon: icon, startPos: startPos, endPos: endPos, text: text });
        }
    }

    /**
     * 通过adReward检测，是展示iconTip还是gotItem
     */
    public static showIconTipsWithAdRewardCheck(itemId: number, amount: number, startPos?: cc.Vec2, endPos?: cc.Vec2, queueId?: string) {
        let adEventId = "got_item_addition_reward";
        let bTrigger = mgrAd.preCheckCanTriggerAdEvent(adEventId);
        if (bTrigger) {
            // 触发了额外奖励，使用vGotItemDialog打开
            cc.log("vGotItemDialog.initAdRewad trigger a ad reward.", adEventId);
            let adEventData = mgrCfg.get("ad_event_db", adEventId);
            let adRewards = mgrPlayer.openItemBox(adEventData.param.rewardBoxId);

            // this.addGotItemTipGroup([{
            //     itemId: itemId,
            //     amount: amount,
            //     amountSteps: [[amount, 0]],
            //     customerContext: {
            //         adEventId: adEventId,
            //         adRewards: adRewards,
            //     },
            // }]);
            this.addGotItemTip(itemId, amount, null, { adEventId: adEventId, adRewards: adRewards });
        } else {
            // 使用iconTip展示
            this.showIconTips(itemId, amount, startPos, endPos, queueId);
        }
    }

    private static _onShowIconTimerCallback() {
        let isEmpty = true;

        Tools.forEachMap(this.iconTipQueue, (k, v) => {
            if (v && v.length > 0) {
                isEmpty = false;
            }
        });

        if (isEmpty) {
            this.iconTipTimer.stop();
            this.iconTipTimer = null;
            return;
        }

        //对所有队列同时出队
        Tools.forEachMap(this.iconTipQueue, (k, queue) => {
            if (queue && queue.length > 0) {
                //每次回调减去时间间隔
                let data = queue[0];
                data.interval -= 0.1;
                if (data.interval <= 0) {
                    data = queue.shift();
                    this._playShowIcon(data);
                }
            }
            else {
                this.iconTipQueue[k] = [];
            }
        });
    }


    private static _playShowIcon(data: any) {
        // let tip = new vIconTip();
        // tip.parent = this.getTipRootNode();
        // tip.setPosition(data.startPos);
        // tip.scale = 0.0;

        // tip.setIcon(data.icon);
        // tip.setText(data.text);

        // // let actionPosUp = cc.moveBy(0.3, cc.v2(0, 40)).easing(cc.easeOut(3.0));
        // // let actionScaleUp = cc.scaleTo(0.3, 1).easing(cc.easeOut(3.0));
        // // let actionPosDown = cc.moveTo(0.8, data.endPos).easing(cc.easeIn(3.0));
        // // let actionScaleDown = cc.scaleTo(0.8, 0.1).easing(cc.easeIn(3.0));
        // tip.play(cc.sequence(
        //     cc.spawn(
        //         cc.moveBy(0.3, 0, 60).easing(cc.easeIn(1.5)),
        //         cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
        //     ),

        //     // 缓慢漂浮
        //     cc.moveBy(0.3, 0, 5),

        //     cc.spawn(
        //         cc.jumpTo(0.5, data.endPos, 100, 1).easing(cc.easeIn(1.5)),
        //         cc.sequence(
        //             cc.scaleTo(0.2, 1).easing(cc.easeInOut(1.5)),
        //             cc.delayTime(0.1),
        //             cc.scaleTo(0.2, 0.5).easing(cc.easeOut(1.5))
        //         ),
        //     ),

        //     // cc.spawn(actionPosUp, actionScaleUp),
        //     // cc.spawn(actionPosDown, actionScaleDown),
        //     cc.removeSelf(),
        // ))
    }

    //通用获取途径
    // 方式： 游戏中如果物品不足，统一弹出物品详情界面，通过物品详情界面，点击购买或者前往获取。
    // 填表方式： 仅填写需要的物品的buySource字段， 不填默认走商品快速购买途径。
    // 获取流程： 检查buysource字段值。
    // 1.	默认当做商品快速购买
    //     1.如果商品表中有对应的商品id， 直接兑换：  货币不足重走流程
    //     2.如果商品表中没有， 走shoprouter表， 弹出对应的礼包
    //     3.如果上述情况都不存在， 弹出  物品不足提示
    // 2.	跳转到社区比赛
    // 3.	去到商城的某一页签
    // 4.	跳转到农场

    /**
     * 通用获取途径
     * 方式： 游戏中如果物品不足，统一弹出物品详情界面，通过物品详情界面，点击购买或者前往获取。
     * 填表方式： 仅填写需要的物品的buySource字段， 不填默认走商品快速购买途径。
     * 获取流程： 检查buysource字段值。
     * 1.	默认当做商品快速购买
     *     1.如果商品表中有对应的商品id， 直接兑换：  货币不足重走流程
     *     2.如果商品表中没有， 走shoprouter表， 弹出对应的礼包
     *     3.如果上述情况都不存在， 弹出  物品不足提示
     * 2.	跳转到社区比赛
     * 3.	去到商城的某一页签
     * 4.	跳转到农场
     * @param itemId 
     * @param reason 
     */
    public static showCommonRouter(itemId: number, reason: string) {
        let itemData = mgrCfg.get("item_template_db", itemId);
        let buySource = itemData.buySource || 1; //默认情况下是1， 商品快速购买
        let commonRouterData = mgrCfg.get("common_router_db", buySource);

        let checkFun = this["__checkCommonRouter" + commonRouterData.router.toString()];
        if (checkFun instanceof Function) {
            let result = checkFun({ itemId: itemId });
            if (result == 1) {
                //通过
            }
            else if (result == 0) {
                //直接跳过物品界面
                let fun = this["__commonRouter" + commonRouterData.router.toString()];
                let param: any = {};
                param.param = commonRouterData.param || {};
                param.itemId = itemId;
                param.reason = reason;
                let result = fun(param);
                return result;
            }
            else {
                //给出提示
                mgrTip.showMsgTip(ul.format("%s不足", itemData.name));
                cc.warn("error: this router is checked, and not pass" + itemId);
                return;
            }
        }
        else {
            cc.warn("error: this router is not exist!!!" + itemId);
        }

        mgrTip.showItemDetailDialog(itemId, null,
            {
                callback: (): boolean => {
                    let fun = this["__commonRouter" + commonRouterData.router.toString()];
                    let param: any = {};
                    param.param = commonRouterData.param || {};
                    param.itemId = itemId;
                    param.reason = reason;
                    let result = fun(param);
                    return result;
                },
                bCanBuy: commonRouterData.router == 1,
                bCanGet: commonRouterData.router != 1,
                routerDes: commonRouterData.name,
            })
    }

    public static __commonRouter1(param: any) {
        return true
    }
    public static __commonRouter2(param: any) {
        // mgrDirector.openDialog("vShopMallDialog");
        return true
    }
    public static __commonRouter3(param: any) {

        return true
    }

    /**
     * 
     * @param param 
     * return : 1: 正常通过，0： 跳过界面： -1 不通过
     */
    public static __checkCommonRouter1(param: any): number {
        //检查商品表中是否存在
        let shopData = mgrCfg.get("shop_template_db", param.itemId);
        if (!shopData) {
            //检查shoprouter表中的商品id的奖励物品中是否存在该物品
            //根据shoprouter表的设定， 小于等于100的是物品的获取， 大于100的是功能埋点
            let shopRouterData = mgrCfg.get("shop_router_db", param.itemId);
            if (shopRouterData) {
                return 0;
            }
            else {
                return -1;
            }
        }
        else {
            return 1;
        }
    }

    /**
     * 
     * @param param 
     * return : 1: 正常通过，0： 跳过界面： -1 不通过
     */
    public static __checkCommonRouter2(param: any): number {
        return 1;
    }

    /**
     * 
     * @param param 
     * return : 1: 正常通过，0： 跳过界面： -1 不通过
     */
    public static __checkCommonRouter3(param: any): number {
        return 1;
    }

    /**
     * 
     * @param param 
     * return : 1: 正常通过，0： 跳过界面： -1 不通过
     */
    public static __checkCommonRouter4(param: any): number {
        return 1;
    }

    /**
   * 
   * @param param 
   * return : 1: 正常通过，0： 跳过界面： -1 不通过
   */
    public static __checkCommonRouter5(param: any): number {
        return 1;
    }

    // /**
    //  * 设置角标的值
    //  * @param node 
    //  * @param count 
    //  * @param offsetX 
    //  * @param offsetY 
    //  */
    // public static setCountBadgeValue(node: cc.Node, count: number, offsetX?: number, offsetY?: number, scale?: number): void {
    //     if (count > 0) {
    //         this.addCountBadge(node, count, offsetX, offsetY, scale);
    //     } else {
    //         this.removeCountBadge(node);
    //     }
    // }

    // public static addCountBadge(node: cc.Node, count: number, offsetX?: number, offsetY?: number, scale?: number): void {
    //     // let countBadge = node["__count_badge"] as vCountBadge;
    //     // if (countBadge == null) {
    //     //     countBadge = new vCountBadge();
    //     //     node.addChild(countBadge, 9999);
    //     //     node["__count_badge"] = countBadge;
    //     //     countBadge.scale = 0.8;

    //     //     countBadge.runAction(cc.repeatForever(
    //     //         cc.spawn(
    //     //             cc.sequence(
    //     //                 cc.rotateTo(0.07, 10),
    //     //                 cc.rotateTo(0.07, -10),
    //     //                 cc.rotateTo(0.07, 10),
    //     //                 cc.rotateTo(0.07, 0)
    //     //             ),
    //     //             cc.sequence(
    //     //                 cc.moveBy(0.07, cc.v2(0, -2)),
    //     //                 cc.moveBy(0.07, cc.v2(1, 0)),
    //     //                 cc.moveBy(0.07, cc.v2(0, 2)),
    //     //                 cc.moveBy(0.07, cc.v2(-1, 0)),
    //     //             )
    //     //         ),
    //     //     ));
    //     // }

    //     // countBadge.setCount(count);

    //     // //offset
    //     // offsetX = offsetX || 0;
    //     // offsetY = offsetY || 0;
    //     // scale = scale || 1;

    //     // let size = node.getContentSize();
    //     // countBadge.setPosition(size.width / 2 * 0.8 + offsetX, size.height / 2 * 0.8 + offsetY);
    //     // countBadge.scale = scale;
    // }

    // public static removeCountBadge(node: cc.Node): void {
    //     // let countBadge = node["__count_badge"];
    //     // if (countBadge) {
    //     //     node.removeChild(countBadge);
    //     //     node["__count_badge"] = null;
    //     // }
    // }

    public static setCountBadgeValue (node: cc.Node, count: number, offsetX?: number, offsetY?: number, scale?: number): void {
        let nodeMark = node["__mark"] as vMark;
        if ( count > 0 ) {
            if ( !nodeMark ) {
                nodeMark = new vMark();
                node.addChild( nodeMark, 99 );
                node["__mark"] = nodeMark;
            }
            offsetX = offsetX || 0;
            offsetY = offsetY || 0;
            scale = scale || 1;

            let size = node.getContentSize();
            let sizeScale = 0.8;
            nodeMark.setPosition(size.width / 2 * sizeScale + offsetX, size.height / 2 * sizeScale + offsetY);
            nodeMark.scale = scale;
            nodeMark.setCount( count );
        } else {
            if ( !!nodeMark ) {
                node.removeChild( nodeMark );
                node["__mark"] = null;
            }
        }
    }

    public static addChildToCanvas ( node: cc.Node, worldPos: cc.Vec2) {
        node.parent = this.getTipRootNode();
        node.setPosition( node.parent.convertToNodeSpace( worldPos ) );
    }


    public static playIconTip(itemId: number, amount: number, nodeParent: cc.Node, isCrit: boolean = false ) {
        // let icon = mgrCfg.get("item_template_db", itemId, "icon");
        // let countStr = Tools.formatNumToStr( amount );
        // if ( mgrRole.isLuckyTime() ) {
        //     countStr = Tools.formatNumToStr( amount / 2 ) + "x2";
        // }
        // let text = "*" + countStr;
        // if ( isCrit ) {
        //     text = "暴击"+ countStr;
        // }

        // let tip = new vIconTip();
        // tip.parent = nodeParent;

        // tip.setIcon(icon);
        // tip.setText(text);

        // tip.runAction(cc.spawn(
		// 	// cc.scaleTo(0.05, 1).easing(cc.easeIn(2)),
		// 	cc.moveBy(0.8, 0, 50 ).easing(cc.easeOut(1.2)),
		// 	cc.sequence(
		// 		// cc.fadeIn(0.15).easing(cc.easeIn(2)),
		// 		cc.delayTime(0.65),
		// 		cc.fadeOut(0.3),
        //         // cc.removeSelf( true ),
        //         cc.callFunc(()=>{
        //             tip.removeFromParent();
        //             tip.destroy();
        //         })
		// 	),
		// ));
    }
    

    public static playBlood ( x: number, y: number ) {
        mgrDirector.loadRes("2d/anim_node/blood_boom/blood_boom", cc.Prefab, (err, prefab) => {
            if (err) {
                return;
            }

            let node: any = cc.instantiate(prefab);
            node.parent = this.getTipRootNode();
            node.position = node.parent.convertToNodeSpace(cc.v2(x, y));
        });
    }

}