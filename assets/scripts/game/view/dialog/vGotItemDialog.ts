import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrCfg from "../../manager/mgrCfg";
import mgrPlayer from "../../manager/mgrPlayer";
import mgrPool from "../../manager/mgrPool";
import AnimNode from "../../../ulframework/view/AnimNode";
import mgrSound from "../../manager/mgrSound";
import mgrAd from "../../manager/mgrAd";
import Tools from "../../../ulframework/utils/Tools";
import { CakePartType } from "../../Const";
import vAvatar from './../node/vAvatar';

const { ccclass, property } = cc._decorator;

@ccclass
export default class vGotItemDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vGotItemDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_labelDesc: { varname: "labelDesc", vartype: cc.Label },
			CC_nodeEff: { varname: "nodeEff", vartype: cc.Node },
			CC_spriteIcon: { varname: "spriteIcon", vartype: cc.Sprite },
		};
	}
	protected buttonClose: ScaleableButton = null;
	protected labelDesc: cc.Label = null;
	protected nodeEff: cc.Node = null;
	protected spriteIcon: cc.Sprite = null;
	// @view export resources end
	// private levelBar: vLevelBar = null;
	private viewAvatar: vAvatar = null







	////// 生命周期 /////
	onLoad() {
		super.onLoad();

		mgrSound.play(102);
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		this.buildUi();
		this.fillData();

		mgrPlayer.markDisplayedGotItem(this.context.itemId);
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

	onOpenDialogCompleted() {
		this.nodeEff.scale = 0;
		let animNode = mgrPool.get("animNode", "jiesuan");

		animNode.play();
		animNode.parent = this.nodeEff;


		this.nodeEff.runAction(cc.scaleTo(0.1, 2, 2));
	}






	////// 内部逻辑 /////
	private buildUi() {
		this.viewAvatar = new vAvatar()
		this.viewAvatar.parent = this.spriteIcon.node
		this.viewAvatar.scale = 0.5
	}

	private fillData() {
		let itemId = this.context.itemId;
		let amount = this.context.amount;
		let itemData = mgrCfg.get_from_item_template_db(itemId);

		// // name
		// this.labelName.string = itemData.name;

		// icon
		// this.spriteIcon.loadSpriteFrameAndKeepSize(itemData.icon);
		this.spriteIcon.spriteFrame = null
		let partData = mgrCfg.get_from_cake_part_db(itemId)
		if(partData && partData.type == CakePartType.body){
			this.viewAvatar.replace(itemId)
		}
		else{
			this.spriteIcon.loadSpriteFrame(itemData.icon);
		}
		// desc
		// this.labelDesc.string = itemData.name + "*" + Tools.formatNumToStr( amount );
		this.labelDesc.string = itemData.name + "*" + amount;

	}










	////// 事件 /////
	// @view export events begin
	onTouchButtonClose(e: EventTouchEx): void {
		if (!e.isClick()) return;

		this.closeDialog();
	}
	// @view export events end







}






