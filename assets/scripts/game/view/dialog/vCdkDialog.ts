import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrTip from "../../manager/mgrTip";
import mgrSdk from "../../manager/mgrSdk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vCdkDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vCdkDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonSure: {
				varname: "buttonSure",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSure" }],
			},
			CC_editboxCdk: { varname: "editboxCdk", vartype: cc.EditBox },
		};
	}
	protected buttonSure: ScaleableButton = null;
	protected editboxCdk: cc.EditBox = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
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
	onTouchButtonSure(e: EventTouchEx): void {
		if(!e.isClick()) return

		let str = this.editboxCdk.string
		if(!str || str.length <= 0){
			mgrTip.showMsgTip("请输入正确的sdk")
			return
		}

		mgrSdk.useCdk(str);
	}

	// @view export events end










}
