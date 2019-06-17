import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EditorTransformController extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "_editor/EditorTransformController"; }
	protected _getResourceBindingConfig() {
		return {
			CC_editboxScale: { varname: "editboxScale", vartype: cc.EditBox },
			CC_editboxX: { varname: "editboxX", vartype: cc.EditBox },
			CC_editboxY: { varname: "editboxY", vartype: cc.EditBox },
			CC_editboxZ: { varname: "editboxZ", vartype: cc.EditBox },
		};
	}
	protected editboxScale: cc.EditBox = null;
	protected editboxX: cc.EditBox = null;
	protected editboxY: cc.EditBox = null;
	protected editboxZ: cc.EditBox = null;
	// @view export resources end


	private target: cc.Node = null


	private onValueChanged: (target)=>void = null





	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		this.editboxX.node.on('text-changed', this.__on_value_changed.bind(this))
		this.editboxY.node.on('text-changed', this.__on_value_changed.bind(this))
		this.editboxZ.node.on('text-changed', this.__on_value_changed.bind(this))
		this.editboxScale.node.on('text-changed', this.__on_value_changed.bind(this))
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



	private fillData() {
		if (this.target && cc.isValid(this.target)) {
			this.editboxX.string = this.target.x.toString()
			this.editboxY.string = this.target.y.toString()
			this.editboxZ.string = this.target.zIndex.toString()
			this.editboxScale.string = this.target.scale.toString()
		}
		else {
			this.editboxX.string = "zero"
			this.editboxY.string = "zero"
			this.editboxZ.string = "zero"
			this.editboxZ.string = "zero"
		}
	}

	





	////// 内部逻辑 /////
	__on_value_changed(){
		if (!(this.target && cc.isValid(this.target))) return
		this.target.setPosition(parseFloat(this.editboxX.string) || this.target.x, parseFloat(this.editboxY.string) || this.target.y)
		this.target.zIndex = Math.floor(parseFloat(this.editboxZ.string) || this.target.zIndex)
		cc.log(this.editboxScale.string)
		this.target.scale = parseFloat(this.editboxScale.string) || this.target.scale
		this.onValueChanged(this.target);

		// this.fillData()
	}

	/////////////
	public setTarget(target: cc.Node, onValueChanged:(target)=>void) {
		this.target = target
		this.fillData()
		this.onValueChanged = onValueChanged;

		// this.onValueChanged(this.target);
	}









	////// 事件 /////
	// @view export events begin
	// @view export events end










}

