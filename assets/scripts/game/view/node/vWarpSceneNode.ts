import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrDirector from "../../manager/mgrDirector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vWarpSceneNode extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vWarpSceneNode"; }
	protected _getResourceBindingConfig() {
		return {
			CC_labelTip: { varname: "labelTip", vartype: cc.Label },
			CC_nodeBottom: { varname: "nodeBottom", vartype: cc.Node },
			CC_nodeCloudBottom: { varname: "nodeCloudBottom", vartype: cc.Node },
			CC_nodeCloudCenter: { varname: "nodeCloudCenter", vartype: cc.Node },
			CC_nodeCloudTop: { varname: "nodeCloudTop", vartype: cc.Node },
		};
	}
	protected labelTip: cc.Label = null;
	protected nodeBottom: cc.Node = null;
	protected nodeCloudBottom: cc.Node = null;
	protected nodeCloudCenter: cc.Node = null;
	protected nodeCloudTop: cc.Node = null;
	// @view export resources end
	private originPos: cc.Vec2[] = [];
	private duration: number = 0.6;

	private needToPlayFadeInAfterLoaded: boolean = false







	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		//resize
		this.nodeResource.setContentSize(mgrDirector.size);

		this.originPos.push(this.nodeCloudTop.getPosition());
		this.originPos.push(this.nodeCloudCenter.getPosition());
		this.originPos.push(this.nodeCloudBottom.getPosition());
		this.originPos.push(this.nodeBottom.getPosition());

		this.duration = this.context.duration || this.duration;

		this.registerListeners({
            MSG_SCENE_LOADED: this.onMsgSceneLoaded,
        });

		//设置到默认值
		this.setAsDefault()

		if(this.needToPlayFadeInAfterLoaded){
			this.playEffectIn()
		}
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
	private setAsDefault(){
		//左侧幕布
		let node = this.nodeCloudCenter;
		node.stopAllActions();
		node.setPosition(cc.v2(-mgrDirector.size.width - 200, node.y))

		//右侧幕布
		node = this.nodeCloudTop;
		node.stopAllActions();
		node.setPosition(cc.v2(mgrDirector.size.width + 200, node.y));

		node = this.nodeCloudBottom;
		node.stopAllActions();
		node.setPosition(cc.v2(mgrDirector.size.width + 200, node.y));
	}

	/**
	 * 进入动画
	 */
	public playEffectIn() {
		if(!this.isResourceLoaded()){
			this.needToPlayFadeInAfterLoaded = true
			return
		}
		//左侧幕布
		let node = this.nodeCloudCenter;
		node.stopAllActions();
		node.setPosition(cc.v2(-mgrDirector.size.width - 200, node.y))
		node.runAction(cc.sequence(
			cc.moveTo(this.duration, this.originPos[0]).easing(cc.easeIn(1.5)),
			cc.delayTime(0.01),
			cc.callFunc(() => {
				cc.log("    fOnFadeInCompleted");
				if (this.context.fOnFadeInCompleted instanceof Function) {
					this.context.fOnFadeInCompleted();
				}
			}),
		));
	
		//右侧幕布
		node = this.nodeCloudTop;
		node.stopAllActions();
		node.setPosition(cc.v2(mgrDirector.size.width + 200, node.y));
		node.runAction( cc.moveTo(this.duration, this.originPos[1]).easing(cc.easeIn(1.5)) );

		node = this.nodeCloudBottom;
		node.stopAllActions();
		node.setPosition(cc.v2(mgrDirector.size.width + 200, node.y));
		node.runAction( cc.moveTo(this.duration, this.originPos[2]).easing(cc.easeIn(1.5)) );

	}

	/**
	 * 退出动画
	 */
	public playEffectOut() {
		//左侧幕布
		let node = this.nodeCloudCenter;
		node.stopAllActions();
		node.runAction(cc.sequence(
			cc.moveTo(this.duration, cc.v2(-mgrDirector.size.width - 200, node.y)).easing(cc.easeOut(1.5)),
			cc.delayTime(0.01),
			cc.callFunc(() => {
				// cc.log("    fOnFadeOutCompleted");
				if (this.context.fOnFadeOutCompleted instanceof Function) {
					this.context.fOnFadeOutCompleted();
					this.removeFromParent();
					this.destroy();
				}
			}),
		));

	
		//右侧幕布
		node = this.nodeCloudTop;
		node.stopAllActions();
		node.runAction( cc.moveTo(this.duration, cc.v2(mgrDirector.size.width + 200, node.y)).easing(cc.easeOut(1.5)) );

		node = this.nodeCloudBottom;
		node.stopAllActions();
		node.runAction( cc.moveTo(this.duration, cc.v2(mgrDirector.size.width + 200, node.y)).easing(cc.easeOut(1.5)) );
	}







	////// 事件 /////
	// @view export events begin

	// @view export events end

	onMsgSceneLoaded () {
		this.playEffectOut();
	}









}







