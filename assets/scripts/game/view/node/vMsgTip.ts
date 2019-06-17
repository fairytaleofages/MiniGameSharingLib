import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrTip from "../../manager/mgrTip";
import mgrDirector from "../../manager/mgrDirector";
import Const from "../../Const";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vMsgTip extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vMsgTip"; }
	protected _getResourceBindingConfig() {
		return {
			CC_labelContent: { varname: "labelContent", vartype: cc.Label },
		};
	}
	protected labelContent: cc.Label = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.buildUi();

		this.fillData();
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
	private buildUi() {
		// 将msg的宽度调整为屏幕宽度的90%
		this.labelContent.node.width = mgrDirector.width * 0.9;
	}

	private fillData () {
		if ( !!this.context.text ) {
			this.setText( this.context.text );
		}
		if ( !!this.context.textColor ) {
			this.setColorEx( this.context.textColor, this.context.outlineColor );
		}
	}

	/**
	 * 设置文本
	 * @param text 
	 */
	public setText(text: string) {
		this.context.text = text;
		
 		if (!this.isResourceLoaded()) return;

		this.labelContent.string = text;
	}

	/**
	 * 设置msg颜色
	 * @param textColor 文字颜色
	 * @param outlineColor?	包边颜色，不传则禁用包边 
	 */
	public setColorEx(textColor: cc.Color, outlineColor?: cc.Color) {

		this.context.textColor = textColor;
		this.context.outlineColor = outlineColor;

 		if (!this.isResourceLoaded()) return;

		this.labelContent.node.color = textColor;

		let labelOutline = this.labelContent.getComponent(cc.LabelOutline);
		if (!outlineColor) {
			labelOutline.enabled = false;
		} else {
			labelOutline.enabled = true;
			labelOutline.color = outlineColor;
		}
	}

	/**
	 * 播放msg
	 * @param startPosition? 起始位置
	 */
	public play(startPosition?: cc.Vec2, deltaY?: number) {
		this.parent = mgrTip.getTipRootNode();

		deltaY = deltaY || 50;

		let p0 = startPosition || mgrDirector.center;
		let p1 = cc.v2(p0.x, p0.y + deltaY);

		// cc.log(p0.x, p0.y, p1.x, p1.y);

		// 转换一次坐标
		p0 = this.parent.convertToNodeSpace(p0);
		p1 = this.parent.convertToNodeSpace(p1);

		// this.cascadeOpacity = true;
		this.scale = 0;
		this.setPosition(p0);

		this.stopAllActions();
		this.runAction(cc.spawn(
			cc.scaleTo(0.15, 1).easing(cc.easeIn(2)),
			cc.moveTo(1.1, p1).easing(cc.easeOut(1.2)),
			cc.sequence(
				cc.fadeIn(0.15).easing(cc.easeIn(2)),
				cc.delayTime(0.65),
				cc.fadeOut(0.3),
				cc.removeSelf(),
			),
		));
	}










	////// 事件 /////
	// @view export events begin
	// @view export events end










}