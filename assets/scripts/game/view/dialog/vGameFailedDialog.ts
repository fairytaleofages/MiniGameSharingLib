import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrDirector from './../../manager/mgrDirector';
import mgrSound from "../../manager/mgrSound";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vGameFailedDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vGameFailedDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_buttonConfirm: {
				varname: "buttonConfirm",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonConfirm" }],
			},
			CC_labelNpcWord: { varname: "labelNpcWord", vartype: cc.Label },
			CC_nodeStart1: { varname: "nodeStart1", vartype: cc.Node },
			CC_nodeStart2: { varname: "nodeStart2", vartype: cc.Node },
			CC_nodeStart3: { varname: "nodeStart3", vartype: cc.Node },
		};
	}
	protected buttonClose: ScaleableButton = null;
	protected buttonConfirm: ScaleableButton = null;
	protected labelNpcWord: cc.Label = null;
	protected nodeStart1: cc.Node = null;
	protected nodeStart2: cc.Node = null;
	protected nodeStart3: cc.Node = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
		mgrSound.play(104)
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


	isClickShadowClose(){
		return false
	}







	////// 内部逻辑 /////










	////// 事件 /////
	// @view export events begin
	onTouchButtonClose(e: EventTouchEx): void {
		if(!e.isClick())return
		mgrDirector.enterScene("vHubScene",{
			bFromStage: true,
		})
	}

	onTouchButtonConfirm(e: EventTouchEx): void {
		if(!e.isClick())return
		mgrDirector.enterScene("vHubScene",{
			bFromStage: true,
		})
	}

	// @view export events end










}