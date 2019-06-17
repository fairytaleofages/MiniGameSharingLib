import Manager from "../../ulframework/manager/Manager";
import mgrCop from "./mgrCop";
import mgrDirector from "./mgrDirector";
import mgrTip from "./mgrTip";
import mgrGuide from "./mgrGuide";
import mgrPlayer from "./mgrPlayer";
import Const from "../Const";
import mgrCake from './mgrCake';

const { ccclass } = cc._decorator;

@ccclass
export default class mgrDebug extends Manager {
    ///// 成员变量 /////
    /** 是否按下了ctrl键 */
    public static bPressedCtrl = false;
    /** 是否按下了Alt键 */
    public static bPressedAlt = false;
    /** 是否按下了Shift键 */
    public static bPressedShift = false;

    /**
     * 调试开关，是否解锁所有关卡
     */
    public static bUnlockAllStage = false;










    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this.registerKeyboardListener();

        this.registerListeners({
            MSG_NETWORK_RESPONSE: this.onMsgNetworkResponse,
        });
    }

    protected static loadRecord(): void {
        super.loadRecord();
    }

    protected static saveRecord(): void {
        super.saveRecord();
    }











    ///// 快捷键 /////
    private static onKeyDown(keyDesc: string) {
        switch (keyDesc) {
            case "a":
                mgrPlayer["_items"][Const.ITEM_ID_GOLD ] = 0;
                break;
            case "b":
                // mgrPlayer.addItemAmount(Const.ITEM_FLAG_MONEY,50,"测试");
                mgrPlayer.addItemAmount(Const.ITEM_ID_GOLD,500,"测试");
                break;
            case "ctrl_b":
                // mgrPlayer.addItemAmount(Const.ITEM_FLAG_MONEY,50,"测试");
                mgrPlayer.addItemAmount(Const.ITEM_ID_GOLD,500* 100,"测试");
                break;
            case "c":
                cc.log("cops", mgrCop.getCops());
                break;
            case "d":
                break;
            case "e":
                break;
            case "f":
                break;
            case "g":
                // 直接进入关卡
                // mgrDirector.enterScene("vKitchenScene", { stageId: 102, petId: 106, petLevel: 10 });
                break;
            case "ctrl_g":
                mgrGuide._debugCancelDebug();
                break;
            case "h":
                // 回主界面
                // mgrDirector.enterScene("vRoomScene");
                break;
            case "i":
                break;
            case "j":
                break;
            case "k":
                break;
            case "l":
                break;
            case "m":
                this.bUnlockAllStage = true;
                mgrTip.showMsgTip("所有关卡已解锁")
                break;
            case "n":
                break;
            case "o":
                break;
            case "p":
                break;
            case "q":
                break;
            case "r":
                // cc.log("showRouterTargetWithDialog", 23);
                // mgrShop.showRouterTargetWithDialog(23, "美食券不足");
                break;
            case "s":
                break;
            case "ctrl_s":
                mgrCake.saveEditorData()
                mgrTip.showMsgTip("存储部件编辑数据成功")
                break
            case "t":
                mgrDirector.enterScene("vDevTestScene");
                break;
            case "u":
                break;
            case "v":
                break;
            case "w":
                break;
            case "x":
                break;
            case "y":
                break;
            case "z":
                break;
            case "1":
                // mgrDirector.enterScene("vKitchenScene", { stageId: 510 });
                break
            case "2":
                // mgrDirector.enterScene("vKitchenScene", { stageId: 910 });
                break
            case "3":
                // mgrDirector.enterScene("vKitchenScene", { stageId: 810 });
                break
            case "4":
                // mgrDirector.enterScene("vKitchenScene", { stageId: 310 });
                break
            case "5":
                // mgrDirector.enterScene("vKitchenScene", { stageId: 110 });
                break
            case "ctrl_1":
                // mgrDirector.enterScene("vKitchenScene", { stageId: 505 });
                break
            case "ctrl_2":
                // mgrDirector.enterScene("vKitchenScene", { stageId: 905 });
                break
            case "ctrl_3":
                // mgrDirector.enterScene("vKitchenScene", { stageId: 805 });
                break
            case "ctrl_4":
                // mgrDirector.enterScene("vKitchenScene", { stageId: 305 });
                break
            case "ctrl_5":
                // mgrDirector.enterScene("vKitchenScene", { stageId: 105 });
                break
        }

        this.sendMsg("MSG_DEBUG_KEY_DOWN", { keyDesc: keyDesc });
    }









    ///// 快捷键监听函数区 /////
    private static registerKeyboardListener() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onSystemKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onSystemKeyUp, this);
    }

    private static onSystemKeyDown(e) {
        let keyCode = e["keyCode"];

        switch (keyCode) {
            case cc.macro.KEY.alt:
                this.bPressedAlt = true;
                break;
            case cc.macro.KEY.ctrl:
                this.bPressedCtrl = true;
                break;
            case cc.macro.KEY.shift:
                this.bPressedShift = true;
                break;
            default:
                let keyDesc = this._genKeyDesc(keyCode);
                this.onKeyDown(keyDesc);
                break;
        }
    }

    private static onSystemKeyUp(e) {
        let keyCode = e["keyCode"];

        switch (keyCode) {
            case cc.macro.KEY.alt:
                this.bPressedAlt = false;
                break;
            case cc.macro.KEY.ctrl:
                this.bPressedCtrl = false;
                break;
            case cc.macro.KEY.shift:
                this.bPressedShift = false;
                break;
        }
    }

    private static _genKeyDesc(keyCode: number): string {
        let text = "";

        if (this.bPressedCtrl) text += "ctrl_";
        if (this.bPressedAlt) text += "alt_";
        if (this.bPressedShift) text += "shift_";

        let keyName = null;
        for (const key in cc.macro.KEY) {
            const v = cc.macro.KEY[key];
            if (v == keyCode.toString()) {
                text += key;
                break
            }
        }

        return text;
    }









    ///// 事件 /////
    private static onMsgNetworkResponse(e) {
        let data = e;

        cc.log("onMsgNetworkResponse", data)
    }









}