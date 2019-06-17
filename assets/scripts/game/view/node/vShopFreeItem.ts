import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrCfg from "../../manager/mgrCfg";
import mgrAd from "../../manager/mgrAd";
import mgrTip from "../../manager/mgrTip";
import Const from './../../Const';
import mgrStage from "../../manager/mgrStage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vShopFreeItem extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vShopFreeItem"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonItem: {
				varname: "buttonItem",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonItem" }],
			},
			CC_buttonWatch: {
				varname: "buttonWatch",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonWatch" }],
			},
			CC_labelAcount: { varname: "labelAcount", vartype: cc.Label },
			CC_labelCDTime: { varname: "labelCDTime", vartype: cc.Label },
			CC_nodeBg1: { varname: "nodeBg1", vartype: cc.Node },
			CC_nodeBg2: { varname: "nodeBg2", vartype: cc.Node },
			CC_spriteGiftIcon: { varname: "spriteGiftIcon", vartype: cc.Sprite },
			CC_spriteIcon: { varname: "spriteIcon", vartype: cc.Sprite },
		};
	}
	protected buttonItem: ScaleableButton = null;
	protected buttonWatch: ScaleableButton = null;
	protected labelAcount: cc.Label = null;
	protected labelCDTime: cc.Label = null;
	protected nodeBg1: cc.Node = null;
	protected nodeBg2: cc.Node = null;
	protected spriteGiftIcon: cc.Sprite = null;
	protected spriteIcon: cc.Sprite = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.refresh();
	}

	start() {
		super.start();
	}

	update(dt: number) {
		super.update(dt);

		if (!this.isResourceLoaded()) { return; }

		if (!!this.context.adEventId) {
			this.fillAdButtonLabel();
		}
	}

	onDestroy() {
		super.onDestroy();
	}










	////// 内部逻辑 /////

	public fillData(adEventId: string) {
		this.context.adEventId = adEventId;

		this.refresh();
	}

	private refresh() {
		if (!this.isResourceLoaded()) return;

		let adEventId = this.context.adEventId;
        if (!adEventId) { return; }
        
        this.nodeBg1.active = adEventId == "free_energy";
        this.nodeBg2.active = adEventId != "free_energy";

		let adData = mgrCfg.get_from_ad_event_db(adEventId);
		if (!adData) { return; }
		let reward = adData.param.rewards[0];

		let itemData = mgrCfg.get_from_item_template_db(reward[0]);
		if (!itemData) { return; }
		this.labelAcount.string = ul.format("x%d", adEventId == "free_gold" ? this.getFreeDiamondCount() : reward[1]);
		this.spriteIcon.loadSpriteFrame(itemData.icon);
		let giftIcon = {
			[Const.ITEM_ID_GOLD]: "2d/ui/mall/icon01",
			[Const.ITEM_ID_ENERGY]: "2d/ui/mall/icon02",
		}
		this.spriteGiftIcon.loadSpriteFrame(giftIcon[itemData.id])
	}

	private fillAdButtonLabel() {
		let adEventId = this.context.adEventId;
		let remainCd = mgrAd.getAdEventRemainCd(adEventId);
		if (remainCd <= 0) {
			this.labelCDTime.string = "";
		} else {
			let minute = Math.floor(remainCd / 60) % 60;
			let second = Math.floor(remainCd) % 60;
			let str = ul.format("%02d:%02d", minute, second)
			this.labelCDTime.string = str;
		}
	}


    private getFreeDiamondCount () {
        return 20 + (mgrStage.getStageProgress() + 1) * 3;
    }




	////// 事件 /////
	// @view export events begin
	onTouchButtonItem(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		let adEventId = this.context.adEventId;
		let remainCd = mgrAd.getAdEventRemainCd(adEventId);
		if (remainCd > 0) {
			mgrTip.showMsgTip("广告冷却中");
			return;
		}

		
		if (adEventId == "free_gold") {
			cc.log("@@@@@@@@@@@@@@@@@@@@AAAAA")
			let amount = this.getFreeDiamondCount();
			mgrAd.triggerAdEvent(this.context.adEventId, {
				rewards: [[Const.ITEM_ID_GOLD, amount, amount]],
				rewardBoxId: 0,
			}, true);
		}
		else {
			cc.log("@@@@@@@@@@@@@@@@@@@@BBBBBB")
			mgrAd.triggerAdEvent(this.context.adEventId, null, true);
		}
	}
	onTouchButtonWatch(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		let adEventId = this.context.adEventId;
		let remainCd = mgrAd.getAdEventRemainCd(adEventId);
		if (remainCd > 0) {
			mgrTip.showMsgTip("广告冷却中");
			return;
		}

		if (adEventId == "free_gold") {
			cc.log("@@@@@@@@@@@@@@@@@@@@AAAAA")
			let amount = this.getFreeDiamondCount();
			mgrAd.triggerAdEvent(this.context.adEventId, {
				rewards: [[Const.ITEM_ID_GOLD, amount, amount]],
				rewardBoxId: 0,
			}, true);
		}
		else {
			cc.log("@@@@@@@@@@@@@@@@@@@@BBBBBB")
			mgrAd.triggerAdEvent(this.context.adEventId, null, true);
		}
	}
	// @view export events end










}





