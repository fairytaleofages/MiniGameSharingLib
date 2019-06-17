import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import vAvatar from "../node/vAvatar";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vShowCakeDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vShowCakeDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_nodeAvatar: { varname: "nodeAvatar", vartype: cc.Node },
		};
	}
	protected nodeAvatar: cc.Node = null;
	// @view export resources end


	private viewAvatar: vAvatar = null








	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		this.viewAvatar = new vAvatar()
		this.viewAvatar.parent = this.nodeAvatar
		this.viewAvatar.replacePartIdArray(this.context.partIds)
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










	////// 事件 /////
	// @view export events begin
	// @view export events end










}