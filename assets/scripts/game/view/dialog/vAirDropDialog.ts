import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrAd from "../../manager/mgrAd";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vAirDropDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vAirDropDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonAd: {
				varname: "buttonAd",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonAd" }],
			},
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_labelContent: { varname: "labelContent", vartype: cc.Label },
			CC_nodeType1: { varname: "nodeType1", vartype: cc.Node },
			CC_nodeType2: { varname: "nodeType2", vartype: cc.Node },
			CC_nodeType3: { varname: "nodeType3", vartype: cc.Node },
			CC_nodeType4: { varname: "nodeType4", vartype: cc.Node },
		};
	}
	protected buttonAd: ScaleableButton = null;
	protected buttonClose: ScaleableButton = null;
	protected labelContent: cc.Label = null;
	protected nodeType1: cc.Node = null;
	protected nodeType2: cc.Node = null;
	protected nodeType3: cc.Node = null;
	protected nodeType4: cc.Node = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
        super.onResourceLoaded();
        
        this.fillData();

        this.registerListeners({
            MSG_AD_EVENT_SUCCESSD: this.onMsgAdEventSuccessd,
        })
	}

	start() {
		super.start();
	}

	update(dt: number) {
		super.update(dt);
	}

	onDestroy() {
		super.onDestroy();
	}










	////// 内部逻辑 /////

    private fillData () {
        let type = this.context.type;

        this.nodeType1.active = false;
        this.nodeType2.active = false;
        this.nodeType3.active = false;
        this.nodeType4.active = false;

        switch (type) {
            case 1: {
                this.labelContent.string = "看广告获得此关 无限子弹 效果";
                this.nodeType1.active = true;
                break;
            }
            case 2: {
                this.labelContent.string = "看广告获得 抵挡5次射击 保护罩";
                this.nodeType2.active = true;
                break;
            }
            case 3: {
                this.labelContent.string = "看广告 随机试用一把 全满级枪";
                this.nodeType3.active = true;
                break;
            }
            case 4: {
                this.labelContent.string = "看广告 回满血量，防具耐久";
                this.nodeType4.active = true;
                break;
            }
        }
    }








	////// 事件 /////
	// @view export events begin
	onTouchButtonAd(e: EventTouchEx): void {
        if ( !e.isClick() ) {return;}
        
        mgrAd.triggerAdEvent("air_drop", { type: this.context.type }, true)
	}

	onTouchButtonClose(e: EventTouchEx): void {
        if ( !e.isClick() ) {return; }
        
        this.closeDialog();
	}

	// @view export events end

    onMsgAdEventSuccessd(e) {
		let data = e;

		let adEventId = data.adEventId;
		if ( adEventId == "air_drop" ) {
			this.closeDialog();
		}

    }








}