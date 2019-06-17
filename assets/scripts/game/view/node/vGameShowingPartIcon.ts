import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import vAvatar from "./vAvatar";
import mgrCfg from "../../manager/mgrCfg";
import { CakePartType } from "../../Const";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vGameShowingPartIcon extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vGameShowingPartIcon"; }
	protected _getResourceBindingConfig() {
		return {
			CC_spriteIcon: { varname: "spriteIcon", vartype: cc.Sprite },
		};
	}
	protected spriteIcon: cc.Sprite = null;
	// @view export resources end
	private partId: number = 0
	private viewAvatar: vAvatar = null










	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.viewAvatar = new vAvatar()
		this.viewAvatar.parent = this.spriteIcon.node
		this.viewAvatar.scale = 0.25

		this._refresh()
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
	public fillByPartId(partId){
		this.partId = partId
		this._refresh()
	}


	private _refresh(){
		if(!this.isResourceLoaded()) return
		if(!this.partId) return
		let partData = mgrCfg.get_from_cake_part_db(this.partId)

		this.spriteIcon.spriteFrame = null
		this.viewAvatar.takeOffAll()
		if (partData && partData.type == CakePartType.body) {
			this.viewAvatar.replace(this.partId)
		}
		else {
			this.spriteIcon.loadSpriteFrame(partData.icon);
		}
	}






	////// 事件 /////
	// @view export events begin
	// @view export events end










}