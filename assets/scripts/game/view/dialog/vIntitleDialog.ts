import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrPlayer from './../../manager/mgrPlayer';

const {ccclass, property} = cc._decorator;

@ccclass
export default class vIntitleDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vIntitleDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonRandom: {
				varname: "buttonRandom",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonRandom" }],
			},
			CC_buttonSure: {
				varname: "buttonSure",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSure" }],
			},
			CC_labelName: { varname: "labelName", vartype: cc.Label },
		};
	}
	protected buttonRandom: ScaleableButton = null;
	protected buttonSure: ScaleableButton = null;
	protected labelName: cc.Label = null;
	// @view export resources end









	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		let name = mgrPlayer.calcRandomName()
		this.labelName.string = name
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
	onTouchButtonRandom(e: EventTouchEx): void {
		if(!e.isClick()) return
		let name = mgrPlayer.calcRandomName()
		this.labelName.string = name
	}

	onTouchButtonSure(e: EventTouchEx): void {
		if(!e.isClick()) return

		let name = this.labelName.string
		mgrPlayer.setName(name)
		this.closeDialog()

		if(this.context.endCallback instanceof Function){
			this.context.endCallback()
		}
	}

	// @view export events end










}

