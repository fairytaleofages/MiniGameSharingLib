import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrDirector from "../../manager/mgrDirector";
import Const, { GuideMaskType } from "../../Const";
import Tools from "../../../ulframework/utils/Tools";
import mgrTip from "../../manager/mgrTip";
import mgrGuide from "../../manager/mgrGuide";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vGuideMask extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vGuideMask"; }
	protected _getResourceBindingConfig() {
		return {
			CC_nodeLeftBottom: { varname: "nodeLeftBottom", vartype: cc.Node },
			CC_spriteBlockBottom: { varname: "spriteBlockBottom", vartype: cc.Sprite },
			CC_spriteBlockLeft: { varname: "spriteBlockLeft", vartype: cc.Sprite },
			CC_spriteBlockRight: { varname: "spriteBlockRight", vartype: cc.Sprite },
			CC_spriteBlockTop: { varname: "spriteBlockTop", vartype: cc.Sprite },
			CC_spriteHole: { varname: "spriteHole", vartype: cc.Sprite },
		};
	}
	protected nodeLeftBottom: cc.Node = null;
	protected spriteBlockBottom: cc.Sprite = null;
	protected spriteBlockLeft: cc.Sprite = null;
	protected spriteBlockRight: cc.Sprite = null;
	protected spriteBlockTop: cc.Sprite = null;
	protected spriteHole: cc.Sprite = null;
	// @view export resources end

	private rect: cc.Rect = null;
	private maskType = GuideMaskType.none_passAll;
	private bFadeIn = false;

	private _mask_click_last_time = 0;
	private _mask_click_count = 0;











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.updateMask();
		this.updateListeners();
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
	public setMaskType(maskType: GuideMaskType): void {
		this.maskType = maskType;

		this.updateMask();
		this.updateListeners();
	}

	public setRect(rect: cc.Rect) {
		this.rect = rect;
		this.updateMask();
	}

	private updateListeners() {
		if (!this.isResourceLoaded()) return;

		let maskType = this.maskType;
		
		this.spriteHole.node.opacity = 0;
		this.spriteBlockLeft.node.opacity = 0;
		this.spriteBlockRight.node.opacity = 0;
		this.spriteBlockTop.node.opacity = 0;
		this.spriteBlockBottom.node.opacity = 0;

		// 卸载所有监听器
		Tools.unregisterTouchHandler(this.spriteHole.node);
		Tools.unregisterTouchHandler(this.spriteBlockLeft.node);
		Tools.unregisterTouchHandler(this.spriteBlockRight.node);
		Tools.unregisterTouchHandler(this.spriteBlockTop.node);
		Tools.unregisterTouchHandler(this.spriteBlockBottom.node);

		// 处理操作拦截
		if (maskType == GuideMaskType.mask_passAll || maskType == GuideMaskType.none_passAll) {
			// 所有区域可点穿

		} else if (maskType == GuideMaskType.mask_blockAll || maskType == GuideMaskType.none_blockkAll) {
			// 所有区域不可点穿
			Tools.registerTouchHandler(this.spriteHole.node, this.onTouchMask.bind(this), true);
			Tools.registerTouchHandler(this.spriteBlockLeft.node, this.onTouchMask.bind(this), true);
			Tools.registerTouchHandler(this.spriteBlockRight.node, this.onTouchMask.bind(this), true);
			Tools.registerTouchHandler(this.spriteBlockTop.node, this.onTouchMask.bind(this), true);
			Tools.registerTouchHandler(this.spriteBlockBottom.node, this.onTouchMask.bind(this), true);

		} else if (maskType == GuideMaskType.mask_passHole || maskType == GuideMaskType.none_passHole) {
			// 4个mask区域不可点穿
			Tools.registerTouchHandler(this.spriteBlockLeft.node, this.onTouchMask.bind(this), true);
			Tools.registerTouchHandler(this.spriteBlockRight.node, this.onTouchMask.bind(this), true);
			Tools.registerTouchHandler(this.spriteBlockTop.node, this.onTouchMask.bind(this), true);
			Tools.registerTouchHandler(this.spriteBlockBottom.node, this.onTouchMask.bind(this), true);
		}
	}

	private updateMask() {
 		if (!this.isResourceLoaded()) return;

		// 调整整个mask的尺寸
		this.nodeResource.setContentSize(mgrDirector.size);
		this.nodeLeftBottom.getComponent(cc.Widget).updateAlignment();
		let size = this.nodeResource.getContentSize();

		let rect = this.rect;
		let maskType = this.maskType;


		let bShowMask = maskType == GuideMaskType.mask_blockAll || maskType == GuideMaskType.mask_passAll || maskType == GuideMaskType.mask_passHole;
		// cc.log("vGuideMask.setRect", bShowMask, rect);

		// 处理block的形状
		if (rect) {
			// 有rect，按照rect区域显示
			// 调整hole的位置
			this.spriteHole.node.x = rect.x;
			this.spriteHole.node.y = rect.y;
			this.spriteHole.node.setContentSize(rect.size);

			// 调整left
			let widget = this.spriteBlockLeft.getComponent(cc.Widget);
			widget.left = 0;
			widget.right = size.width - rect.x;
			widget.top = 0;
			widget.bottom = 0;
			widget.updateAlignment();

			// 调整right
			widget = this.spriteBlockRight.getComponent(cc.Widget);
			widget.left = rect.xMax;
			widget.right = 0;
			widget.top = 0;
			widget.bottom = 0;
			widget.updateAlignment();

			// 调整top
			widget = this.spriteBlockTop.getComponent(cc.Widget);
			widget.left = rect.x;
			widget.right = size.width - rect.xMax;
			widget.top = 0;
			widget.bottom = rect.yMax;
			widget.updateAlignment();

			// 调整bottom
			this.spriteBlockBottom.enabled = true;
			widget = this.spriteBlockBottom.getComponent(cc.Widget);
			widget.left = rect.x;
			widget.right = size.width - rect.xMax;
			widget.top = size.height - rect.y;
			widget.bottom = 0;
			widget.updateAlignment();
		} else {
			// 无rect，只显示left，并设置为全屏
			// cc.log("disable spriteHole");
			let widget = this.spriteBlockLeft.getComponent(cc.Widget);
			widget.left = 0;
			widget.right = 0;
			widget.top = 0;
			widget.bottom = 0;
			widget.updateAlignment();
		}

		// 处理block的显示情况
		if (bShowMask) {
			if (rect) {
				// 有rect，都显示
				this.spriteHole.enabled = true;
				this.spriteBlockLeft.enabled = true;
				this.spriteBlockRight.enabled = true;
				this.spriteBlockTop.enabled = true;
				this.spriteBlockBottom.enabled = true;
			} else {
				// 无rect，只显示left
				this.spriteHole.enabled = false;
				this.spriteBlockLeft.enabled = true;
				this.spriteBlockRight.enabled = false;
				this.spriteBlockTop.enabled = false;
				this.spriteBlockBottom.enabled = false;
			}

		} else {
			// 不显示mask
			this.spriteHole.enabled = false;
			this.spriteBlockLeft.enabled = false;
			this.spriteBlockRight.enabled = false;
			this.spriteBlockTop.enabled = false;
			this.spriteBlockBottom.enabled = false;
		}

	}

	public fadeIn() {
		this.bFadeIn = true;

 		if (!this.isResourceLoaded()) return;

		let node = this.nodeLeftBottom;
		if (!cc.isValid(node)) return;

		node.opacity = 0;
		node.stopAllActions();
		node.runAction(cc.fadeIn(0.3));
	}

	public fadeOut() {
		this.bFadeIn = false;

 		if (!this.isResourceLoaded()) return;

		let node = this.nodeLeftBottom;
		if (!cc.isValid(node)) return;

		node.stopAllActions();
		node.runAction(cc.fadeOut(0.3));
	}

	private _onClickMaskLeftTop() {
		let last = this._mask_click_last_time || 0;

		if (Tools.time() - last < 0.5) {
			this._mask_click_count++;
		} else {
			this._mask_click_count = 0;
		}

		cc.log("vGuideMask._onClickMaskLeftTop", this._mask_click_count);

		this._mask_click_last_time = Tools.time();

		if (this._mask_click_count >= 19) {
			this._mask_click_count = 0;

			// 弹出提示
			let dialog = mgrTip.alertPrompt2("提示", "是否跳过新手引导？", "取消", "跳过", null, () => {
				mgrGuide._debugCancelDebug();
			});
			// 比普通的dialog更高
			dialog.parent.zIndex = (Const.GLOBAL_ORDER_DIALOG + 1);
		}
	}










	////// 事件 /////
	// @view export events begin
	// @view export events end
	private onTouchMask(e: EventTouchEx) {
		// cc.log("onTouchMask", e.name, e.getLocation());

		if (e.isClick()) {
			this.sendMsg("MSG_GUIDE_POINT", { id: "vGuideMask.click" });

			// 判断是否在屏幕左上角
			if (e.getLocationX() <= 100 && e.getLocationY() >= mgrDirector.height - 100) {
				this._onClickMaskLeftTop();
			}
		}
	}










}
