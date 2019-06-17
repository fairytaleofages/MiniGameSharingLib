import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vMoreGameDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vMoreGameDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
		};
	}
	protected buttonClose: ScaleableButton = null;
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
	onTouchButtonClose(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }

		this.closeDialog();
	}

	// @view export events end










}