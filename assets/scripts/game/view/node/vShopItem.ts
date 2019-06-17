import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrCfg from "../../manager/mgrCfg";
import mgrShop from "../../manager/mgrShop";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vShopItem extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vShopItem"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonBuy: {
				varname: "buttonBuy",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonBuy" }],
			},
			CC_buttonItem: {
				varname: "buttonItem",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonItem" }],
			},
			CC_labelContent: { varname: "labelContent", vartype: cc.Label },
			CC_labelDesc: { varname: "labelDesc", vartype: cc.Label },
			CC_nodeBg1: { varname: "nodeBg1", vartype: cc.Node },
			CC_nodeBg2: { varname: "nodeBg2", vartype: cc.Node },
			CC_spriteGiftIcon: { varname: "spriteGiftIcon", vartype: cc.Sprite },
		};
	}
	protected buttonBuy: ScaleableButton = null;
	protected buttonItem: ScaleableButton = null;
	protected labelContent: cc.Label = null;
	protected labelDesc: cc.Label = null;
	protected nodeBg1: cc.Node = null;
	protected nodeBg2: cc.Node = null;
	protected spriteGiftIcon: cc.Sprite = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
        super.onResourceLoaded();
        
        this.refresh();
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

    public fillData(shopId: number) {
		this.context.shopId = shopId;

		this.refresh();
	}

    private refresh() {
        if (!this.isResourceLoaded()) return;

        let shopId = this.context.shopId;
        if ( !shopId ) { return; }

        this.nodeBg1.active = shopId == 11;
        this.nodeBg2.active = shopId != 11;

        let shopData = mgrCfg.get_from_shop_template_db( shopId );
        if ( !shopData ) { return; }

        this.labelContent.string = shopData.desc;
        this.labelDesc.string = `${shopData.price}元 购买`;

        this.spriteGiftIcon.loadSpriteFrame(shopData.sprIcon);

    }






	////// 事件 /////
	// @view export events begin
	onTouchButtonBuy(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }
        
        mgrShop.requestBuy( this.context.shopId );
	}

	onTouchButtonItem(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }
        
        mgrShop.requestBuy( this.context.shopId );
	}

	// @view export events end










}