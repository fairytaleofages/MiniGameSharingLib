import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrCfg from './../../manager/mgrCfg';

const { ccclass, property } = cc._decorator;

@ccclass
export default class vGameSettlementItem extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vGameSettlementItem"; }
	protected _getResourceBindingConfig() {
		return {
			CC_labelName: { varname: "labelName", vartype: cc.Label },
			CC_spriteIcon: { varname: "spriteIcon", vartype: cc.Sprite },
		};
	}
	protected labelName: cc.Label = null;
	protected spriteIcon: cc.Sprite = null;
	// @view export resources end
	private itemId: number = 0
	private amount: number = 0









	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
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
	public fillByItemId(itemId: number, amount: number) {
		this.itemId = itemId
		this.amount = amount
		this._refresh()
	}

	private _refresh() {
		if (!this.isResourceLoaded()) return
		if (!this.itemId) return
		let itemData = mgrCfg.get_from_item_template_db(this.itemId)
		this.spriteIcon.loadSpriteFrameAndKeepSize(itemData.icon)
		if (this.amount > 1) {
			this.labelName.string = itemData.name + "x" + this.amount.toString()
		}
		else {
			this.labelName.string = itemData.name
		}
	}









	////// 事件 /////
	// @view export events begin
	// @view export events end










}
