import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrCfg from "../../manager/mgrCfg";
import mgrPool from "../../manager/mgrPool";
import Spine from "../../../ulframework/view/Spine";
import mgrPlayer from "../../manager/mgrPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vGuideTip extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vGuideTip"; }
	protected _getResourceBindingConfig() {
		return {
			CC_labelContent: { varname: "labelContent", vartype: cc.Label },
			CC_labelName: { varname: "labelName", vartype: cc.Label },
			CC_nodeArrow: { varname: "nodeArrow", vartype: cc.Node },
			CC_nodeSpine: { varname: "nodeSpine", vartype: cc.Node },
			CC_spriteNameBg: { varname: "spriteNameBg", vartype: cc.Sprite },
		};
	}
	protected labelContent: cc.Label = null;
	protected labelName: cc.Label = null;
	protected nodeArrow: cc.Node = null;
	protected nodeSpine: cc.Node = null;
	protected spriteNameBg: cc.Sprite = null;
	// @view export resources end

	private spine: Spine = null;











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.buildUi();
	}

	start() {
		super.start();
	}

	update(dt: number) {
		super.update(dt);
	}

	onDestroy() {
		if (cc.isValid(this.spine)) {
			mgrPool.put(this.spine);
			this.spine.removeFromParent();
		}
		this.spine = null;

		super.onDestroy();
	}










	////// 内部逻辑 /////
	private buildUi() {
		let guideId = this.context.guideId;
		let step = this.context.step;
		let guideData = mgrCfg.get("guide_db", guideId, step);

		if (guideData.tipSpineId) {
			let spine: Spine = mgrPool.get("spine", guideData.tipSpineId);
			if (spine) {
				spine.parent = this.nodeSpine;
				spine.play("mov_1", true)
				this.spine = spine;
			}
		}

		if (guideData.tipName) {
			this.spriteNameBg.node.active = true;
			this.labelName.string = guideData.tipName;
		} else {
			this.spriteNameBg.node.active = false;
		}

		let tipContent: string = guideData.tipContent;
		tipContent = tipContent.replace("PLAYER_NAME", mgrPlayer.getName());

		this.labelContent.string = tipContent;
		this.nodeArrow.active = !guideData.bTipArrowDisabled;
	}

	public setAnchorPoint(apx: number, apy: number) {
		if (!this.isResourceLoaded()) return;

		this.nodeResource.setAnchorPoint(apx, apy);
	}










	////// 事件 /////
	// @view export events begin
	// @view export events end










}


