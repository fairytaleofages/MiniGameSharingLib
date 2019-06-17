import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrCfg from './../../manager/mgrCfg';
import mgrShop from "../../manager/mgrShop";
import vAvatar from "../node/vAvatar";
import { CakePartType } from "../../Const";
import vTitleBar from "../node/vTitleBar";
import mgrDirector from "../../manager/mgrDirector";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vBuyItemDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vBuyItemDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonBuy: {
				varname: "buttonBuy",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonBuy" }],
			},
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_labelBuy: { varname: "labelBuy", vartype: cc.Label },
			CC_labelName: { varname: "labelName", vartype: cc.Label },
			CC_nodeTitleBar: { varname: "nodeTitleBar", vartype: cc.Node },
			CC_nodeTop: { varname: "nodeTop", vartype: cc.Node },
			CC_spriteIcon: { varname: "spriteIcon", vartype: cc.Sprite },
		};
	}
	protected buttonBuy: ScaleableButton = null;
	protected buttonClose: ScaleableButton = null;
	protected labelBuy: cc.Label = null;
	protected labelName: cc.Label = null;
	protected nodeTitleBar: cc.Node = null;
	protected nodeTop: cc.Node = null;
	protected spriteIcon: cc.Sprite = null;
	// @view export resources end


	private viewAvatar: vAvatar = null








	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
        super.onResourceLoaded();
        
        this.uiFadeIn();

        let titleBar = new vTitleBar();
		titleBar.parent = this.nodeTitleBar;

		this.viewAvatar = new vAvatar()
		this.viewAvatar.parent = this.spriteIcon.node
		this.viewAvatar.scale = 0.35


		let partData = mgrCfg.get_from_cake_part_db(this.context.partId)
		this.spriteIcon.spriteFrame = null
		this.viewAvatar.takeOffAll()
		if (partData && partData.type == CakePartType.body) {
			this.viewAvatar.replace(this.context.partId)
		}
		else {
			this.spriteIcon.loadSpriteFrame(partData.icon);
		}

		// let partData = mgrCfg.get_from_cake_part_db(this.context.partId)
		let shopData = mgrCfg.get_from_shop_template_db(this.context.partId)
		let priceUnitItemData = mgrCfg.get_from_item_template_db(shopData.priceUnit)
		cc.log("AA:", shopData.priceUnit, shopData.price)
		this.labelBuy.string = ul.format("%d%s购买", shopData.price, priceUnitItemData.name || "")
		this.labelName.string = partData.name

		this.registerListeners({
			MSG_SHOP_BUY_SUCCESSED: this.onShopBuySucceed
		})
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

    private uiFadeIn() {
        this.nodeTop.y = mgrDirector.height / 2;

        // 刘海屏
        if ( mgrDirector.isDeviceOverHeight() ) {
            this.nodeTop.y = mgrDirector.height / 2 - 50;
		}
	}








	////// 事件 /////
	// @view export events begin
	onTouchButtonBuy(e: EventTouchEx): void {
		if(!e.isClick()) return
		cc.log("partId:",this.context.partId)
		mgrShop.requestBuy(this.context.partId);
	}

	onTouchButtonClose(e: EventTouchEx): void {
		if(!e.isClick()) return
		this.closeDialog()
	}

	// @view export events end


	onShopBuySucceed(e){
		this.closeDialog()
	}







}


