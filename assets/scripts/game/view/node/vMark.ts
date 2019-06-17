import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vMark extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vMark"; }
	protected _getResourceBindingConfig() {
		return {
			CC_labelCount: { varname: "labelCount", vartype: cc.Label },
			CC_nodeRedPoint: { varname: "nodeRedPoint", vartype: cc.Node },
		};
	}
	protected labelCount: cc.Label = null;
	protected nodeRedPoint: cc.Node = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.refreshCount();
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

	public setCount ( num: number ) {
		this.context.count = num;
		if ( !this.isResourceLoaded() ) { return; }

		this.refreshCount();
	}

	private refreshCount () {
		let countStr = this.context.count || "";
		this.labelCount.string = countStr;
	}








	////// 事件 /////
	// @view export events begin
	// @view export events end










}
