import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import Timer from "../../../ulframework/utils/Timer";
import mgrPlayer from "../../manager/mgrPlayer";
import Tools from "../../../ulframework/utils/Tools";
import Const from "../../Const";
import mgrCfg from './../../manager/mgrCfg';
import mgrSdk from './../../manager/mgrSdk';
import mgrDirector from './../../manager/mgrDirector';
import vShopDialog from './../dialog/vShopDialog';
import mgrShop from "../../manager/mgrShop";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vTitleBar extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vTitleBar"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonDiamond: {
				varname: "buttonDiamond",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonDiamond" }],
			},
			CC_buttonEnergy: {
				varname: "buttonEnergy",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonEnergy" }],
			},
			CC_labelAmountDiamond: { varname: "labelAmountDiamond", vartype: cc.Label },
			CC_labelAmountEnergy: { varname: "labelAmountEnergy", vartype: cc.Label },
			CC_labelRecoverTime: { varname: "labelRecoverTime", vartype: cc.Label },
			CC_nodeDiamondAddIcon: { varname: "nodeDiamondAddIcon", vartype: cc.Node },
			CC_nodeEnergyAddIcon: { varname: "nodeEnergyAddIcon", vartype: cc.Node },
			CC_spriteIconDiamond: { varname: "spriteIconDiamond", vartype: cc.Sprite },
			CC_spriteIconEnergy: { varname: "spriteIconEnergy", vartype: cc.Sprite },
		};
	}
	protected buttonDiamond: ScaleableButton = null;
	protected buttonEnergy: ScaleableButton = null;
	protected labelAmountDiamond: cc.Label = null;
	protected labelAmountEnergy: cc.Label = null;
	protected labelRecoverTime: cc.Label = null;
	protected nodeDiamondAddIcon: cc.Node = null;
	protected nodeEnergyAddIcon: cc.Node = null;
	protected spriteIconDiamond: cc.Sprite = null;
	protected spriteIconEnergy: cc.Sprite = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.refreshData();

		if (this.context.bHideEnergy) {
			this.labelAmountEnergy.node.parent.active = false;
		}
		if (this.context.bHideDiamond) {
			this.labelAmountDiamond.node.parent.active = false;
		}

		this.registerListeners({
			MSG_ITEM_AMOUNT_CHANGED: this.onMsgItemAmountChanged,
		});

		//显示时间
		Timer.callLoop(0.1, this.onTimerLoop.bind(this), this);

		this.spriteIconDiamond.loadSpriteFrameAndKeepSize(mgrCfg.get_from_item_template_db(Const.ITEM_ID_GOLD).icon)
		this.spriteIconEnergy.loadSpriteFrameAndKeepSize(mgrCfg.get_from_item_template_db(Const.ITEM_ID_ENERGY).icon)
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

	private refreshData() {
		if (!this.isResourceLoaded()) return;

		this.labelAmountDiamond.string = mgrPlayer.getItemAmount(Const.ITEM_ID_GOLD).toString();

		let energy = mgrPlayer.getItemAmount(Const.ITEM_ID_ENERGY);
		let maxEnergy = mgrPlayer.getRecoverMaxAmount(Const.ITEM_ID_ENERGY);
		this.labelAmountEnergy.string = ul.format("%d/%d", energy, maxEnergy);

		//时间显示
		let recoverTime = mgrPlayer.getRecoverRemainTime(Const.ITEM_ID_ENERGY)
		if (recoverTime != null) {
			this.labelRecoverTime.node.active = true;
			this.labelRecoverTime.string = Tools.formatTime(recoverTime, "%M:%S");
		}
		else {
			this.labelRecoverTime.string = "";
			this.labelRecoverTime.node.active = false;
        }
        
        this.nodeDiamondAddIcon.active = mgrShop.canSupplyItem(Const.ITEM_ID_GOLD);
        this.nodeEnergyAddIcon.active = mgrShop.canSupplyItem(Const.ITEM_ID_ENERGY);

	}




	private onTimerLoop() {
		this.refreshData();
	}









	////// 事件 /////
	// @view export events begin
	onTouchButtonDiamond(e: EventTouchEx): void {
		if(!e.isClick()) return

		mgrShop.tryOpenShop( Const.ITEM_ID_GOLD );
	}
	onTouchButtonEnergy(e: EventTouchEx): void {
        if(!e.isClick()) return
        
		mgrShop.tryOpenShop( Const.ITEM_ID_ENERGY );
	}
	// @view export events end


	private onMsgItemAmountChanged(e) {
		this.refreshData();
	}







}



