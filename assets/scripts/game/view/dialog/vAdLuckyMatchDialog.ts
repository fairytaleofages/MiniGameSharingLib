import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrSdk from './../../manager/mgrSdk';
import { AdMode } from "../../Const";
import mgrStage from "../../manager/mgrStage";
import mgrDirector from "../../manager/mgrDirector";
import mgrAd from "../../manager/mgrAd";

const AD_ID = "more_20persent_pvp_score";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vAdLuckyMatchDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vAdLuckyMatchDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonCarefulDouble: {
				varname: "buttonCarefulDouble",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonCarefulDouble" }],
			},
			CC_buttonCarefulSingle: {
				varname: "buttonCarefulSingle",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonCarefulSingle" }],
			},
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_buttonGetReleax: {
				varname: "buttonGetReleax",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonGetReleax" }],
			},
			CC_labelButtonSignReleax: { varname: "labelButtonSignReleax", vartype: cc.Label },
			CC_labelTipCareful: { varname: "labelTipCareful", vartype: cc.Label },
			CC_labelTipReleax: { varname: "labelTipReleax", vartype: cc.Label },
			CC_nodeAdIconReleax: { varname: "nodeAdIconReleax", vartype: cc.Node },
			CC_nodeCareful: { varname: "nodeCareful", vartype: cc.Node },
			CC_nodeGetReleax: { varname: "nodeGetReleax", vartype: cc.Node },
			CC_nodeReleax: { varname: "nodeReleax", vartype: cc.Node },
			CC_nodeToogleParent: { varname: "nodeToogleParent", vartype: cc.Node },
			CC_toggleDoubleReward: { varname: "toggleDoubleReward", vartype: cc.Toggle },
		};
	}
	protected buttonCarefulDouble: ScaleableButton = null;
	protected buttonCarefulSingle: ScaleableButton = null;
	protected buttonClose: ScaleableButton = null;
	protected buttonGetReleax: ScaleableButton = null;
	protected labelButtonSignReleax: cc.Label = null;
	protected labelTipCareful: cc.Label = null;
	protected labelTipReleax: cc.Label = null;
	protected nodeAdIconReleax: cc.Node = null;
	protected nodeCareful: cc.Node = null;
	protected nodeGetReleax: cc.Node = null;
	protected nodeReleax: cc.Node = null;
	protected nodeToogleParent: cc.Node = null;
	protected toggleDoubleReward: cc.Toggle = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		this.fillAd()

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
	private fillAd(){
		this.nodeReleax.active = mgrSdk.getCopAdMode() == AdMode.releax;
		this.nodeCareful.active = mgrSdk.getCopAdMode() == AdMode.careful;

		//宽松模式
		this.toggleDoubleReward.node.on('toggle', this.refreshAdIcon.bind(this));
		this.refreshAdIcon();
		//严格模式  none

	}

	private refreshAdIcon() {
		let isChecked = this.toggleDoubleReward.isChecked;
		cc.log("refreshAdIcon isChecked : ", isChecked);
		this.nodeAdIconReleax.active = isChecked;
	}





	private enterGame(bAddition:boolean = false){
		mgrDirector.enterScene("vGameScene", { 
			stageId: 10000,
			bAddition: bAddition,
		});
	}


	////// 事件 /////
	// @view export events begin
	onTouchButtonCarefulDouble(e: EventTouchEx): void {
		if(!e.isClick()) return
		mgrAd.triggerAdEvent(AD_ID,null, true)
	}

	onTouchButtonCarefulSingle(e: EventTouchEx): void {
		if(!e.isClick()) return
		this.enterGame()
	}

	onTouchButtonClose(e: EventTouchEx): void {
		if(!e.isClick()) return
		// this.enterGame()
		this.closeDialog()
	}

	onTouchButtonGetReleax(e: EventTouchEx): void {
		if(!e.isClick()) return
		if (this.toggleDoubleReward.isChecked) {
			mgrAd.triggerAdEvent(AD_ID, null, true)
		}
		else {
			this.enterGame()
		}
	}

	// @view export events end

	onMsgAdEventSuccessd(e) {
		if (e.adEventId == AD_ID) {
			this.enterGame(true)
		}
	}








}