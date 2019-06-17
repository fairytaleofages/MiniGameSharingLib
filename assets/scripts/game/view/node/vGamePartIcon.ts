import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrCfg from "../../manager/mgrCfg";
import mgrPlayer from './../../manager/mgrPlayer';
import { CakePartType } from "../../Const";
import vAvatar from "./vAvatar";
import Tools from "../../../ulframework/utils/Tools";
import mgrSound from "../../manager/mgrSound";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vGamePartIcon extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vGamePartIcon"; }
	protected _getResourceBindingConfig() {
		return {
			CC_nodeBg: { varname: "nodeBg", vartype: cc.Node },
			CC_nodeLock: { varname: "nodeLock", vartype: cc.Node },
			CC_spriteBg: { varname: "spriteBg", vartype: cc.Sprite },
			CC_spriteIcon: { varname: "spriteIcon", vartype: cc.Sprite },
		};
	}
	protected nodeBg: cc.Node = null;
	protected nodeLock: cc.Node = null;
	protected spriteBg: cc.Sprite = null;
	protected spriteIcon: cc.Sprite = null;
	// @view export resources end
	private partId: number = 0
	private viewAvatar: vAvatar = null
	private bTry: boolean = false








	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		this.viewAvatar = new vAvatar()
		this.viewAvatar.parent = this.spriteIcon.node
		this.viewAvatar.scale = 0.18
		this.spriteBg.node.active = !this.context.bWithoutBg

		
		Tools.registerTouchHandler(this.nodeBg, this.onTouchButtonBg.bind(this))
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



	////////外部接口/////
	public fillByPartId(partId, bTry){
		this.partId = partId
		this.bTry = bTry
		this._refresh()
	}

	private _refresh(){
		if(!this.isResourceLoaded()) return
		if(!this.partId) return
		let partData = mgrCfg.get_from_cake_part_db(this.partId)
		this.nodeLock.active = mgrPlayer.getItemAmount(this.partId) <= 0 && !this.bTry

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
	onTouchButtonBg(e: EventTouchEx): void {
		if(e.name == "began"){
			mgrSound.play(101);
		}

		if(this.context.fOnClick instanceof Function){
			this.context.fOnClick(e,this.partId)
		}
	}
	// @view export events end










}





