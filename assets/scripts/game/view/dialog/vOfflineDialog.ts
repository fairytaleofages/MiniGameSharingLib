import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrPlayer from "../../manager/mgrPlayer";
import Const, { AdMode } from "../../Const";
import mgrTip from "../../manager/mgrTip";
import mgrAd from "../../manager/mgrAd";
import mgrSdk from "../../manager/mgrSdk";
import mgrRole from "../../manager/mgrRole";

const {ccclass, property} = cc._decorator;

const AD_ENENT_ID = "offline_reward";

@ccclass
export default class vOfflineDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vOfflineDialog"; }
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
			CC_buttonNoAd: {
				varname: "buttonNoAd",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonNoAd" }],
			},
			CC_labelButtonSignReleax: { varname: "labelButtonSignReleax", vartype: cc.Label },
			CC_labelContent: { varname: "labelContent", vartype: cc.Label },
			CC_labelTipCareful: { varname: "labelTipCareful", vartype: cc.Label },
			CC_labelTipReleax: { varname: "labelTipReleax", vartype: cc.Label },
			CC_nodeAdIconReleax: { varname: "nodeAdIconReleax", vartype: cc.Node },
			CC_nodeCareful: { varname: "nodeCareful", vartype: cc.Node },
			CC_nodeGetReleax: { varname: "nodeGetReleax", vartype: cc.Node },
			CC_nodeNoAd: { varname: "nodeNoAd", vartype: cc.Node },
			CC_nodeReleax: { varname: "nodeReleax", vartype: cc.Node },
			CC_nodeToogleParent: { varname: "nodeToogleParent", vartype: cc.Node },
			CC_toggleDoubleReward: { varname: "toggleDoubleReward", vartype: cc.Toggle },
		};
	}
	protected buttonCarefulDouble: ScaleableButton = null;
	protected buttonCarefulSingle: ScaleableButton = null;
	protected buttonClose: ScaleableButton = null;
	protected buttonGetReleax: ScaleableButton = null;
	protected buttonNoAd: ScaleableButton = null;
	protected labelButtonSignReleax: cc.Label = null;
	protected labelContent: cc.Label = null;
	protected labelTipCareful: cc.Label = null;
	protected labelTipReleax: cc.Label = null;
	protected nodeAdIconReleax: cc.Node = null;
	protected nodeCareful: cc.Node = null;
	protected nodeGetReleax: cc.Node = null;
	protected nodeNoAd: cc.Node = null;
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
        
		this.fillData();
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

	isClickShadowClose(){
		return false
	}








	////// 内部逻辑 /////


    fillData () {
        let pastTime = this.context.pastTime;
        let income = this.context.income;

        let hour = Math.floor( pastTime / 3600 );
		let minute = Math.floor(pastTime / 60) % 60;
		// 巴啦啦冰淇淋店, 在您离线的4小时16分钟(最大20小时)期间获得1200金币
        let timeStr = "";
        if ( hour ) { timeStr += hour + "小时" }
        if ( minute ) { timeStr += minute + "分钟" }
		let content = "巴啦啦蛋糕店, 在您离线的" + timeStr + "（最大8小时）,期间获得 " + income + " 金币";
        this.labelContent.string = content;
    }


	private fillAd() {
		let bTriggered = mgrAd.preCheckCanTriggerAdEvent(AD_ENENT_ID)
		this.nodeNoAd.active = !bTriggered
		this.nodeReleax.active = bTriggered && mgrSdk.getCopAdMode() == AdMode.releax;
		this.nodeCareful.active = bTriggered && mgrSdk.getCopAdMode() == AdMode.careful;

		//宽松模式
		this.toggleDoubleReward.node.on('toggle', this.refreshAdIcon.bind(this));
		this.refreshAdIcon();
		//严格模式  non
	}


	private refreshAdIcon() {
		let isChecked = this.toggleDoubleReward.isChecked;
		cc.log("refreshAdIcon isChecked : ", isChecked);
		this.nodeAdIconReleax.active = isChecked;
	}

	private gotReward(factor:number = 1){
		let income = this.context.income;
		mgrPlayer.addItemAmount(Const.ITEM_ID_GOLD, income * factor, "广告奖励");
		mgrTip.addGotItemTip(Const.ITEM_ID_GOLD, income * factor, null);
		mgrRole.markOfflineRewardGeted()
	}




	////// 事件 /////
	// @view export events begin
	onTouchButtonClose(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }
        this.gotReward()
        this.closeDialog();
	}

	onTouchButtonCarefulDouble(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		mgrAd.triggerAdEvent(AD_ENENT_ID, null, true)
	}

	onTouchButtonCarefulSingle(e: EventTouchEx): void {
		if (!e.isClick()) { return; }
		this.gotReward()
		this.closeDialog();
	}

	onTouchButtonGetReleax(e: EventTouchEx): void {
        if ( !e.isClick() ) { return; }

        if ( this.toggleDoubleReward.isChecked ) {
            mgrAd.triggerAdEvent(AD_ENENT_ID, null, true)
        } else {
            this.gotReward()
		    this.closeDialog();
        }
	}

	onTouchButtonNoAd(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }
		this.gotReward()
		this.closeDialog();
	}
	// @view export events end

    private onMsgAdEventSuccessd(e) {
		let data = e;

        let adEventId = data.adEventId;
        if( adEventId == AD_ENENT_ID ) {
            this.gotReward(2)
            this.closeDialog();
        }

    }








}


