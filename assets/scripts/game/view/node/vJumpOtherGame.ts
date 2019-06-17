import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrCfg from "../../manager/mgrCfg";
import mgrSdk from "../../manager/mgrSdk";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vJumpOtherGame extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vJumpOtherGame"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonIcon: {
				varname: "buttonIcon",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonIcon" }],
			},
			CC_spriteIcon: { varname: "spriteIcon", vartype: cc.Sprite },
		};
	}
	protected buttonIcon: ScaleableButton = null;
	protected spriteIcon: cc.Sprite = null;
	// @view export resources end

	private showIndex: number = 0;
	private dbData: T_JUMP_OTHER_GAME_DB = null;








	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		this.nodeResource.active = mgrSdk.getCopByKey("b_jump_other_game") == "1";

		this.changeIndex();
		this.repeatAction();
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

	private repeatAction () {
		let num = 15;
		let dur = 0.125;
		this.runAction(cc.repeatForever(cc.sequence(
			cc.delayTime( 1.5 ),
			cc.rotateTo( dur, num ).easing(cc.easeOut(1.5)),
			cc.rotateTo( dur * 2, -num ).easing(cc.easeInOut(1.5)),
			cc.rotateTo( dur * 2, num ).easing(cc.easeInOut(1.5)),
			cc.rotateTo( dur * 2, -num ).easing(cc.easeInOut(1.5)),
			cc.rotateTo( dur, 0 ).easing(cc.easeIn(1.5)),
			cc.delayTime( 1.5 ),
			cc.callFunc(()=>{
				this.changeIndex();
			})
		)));
	}

	private changeIndex () {
		let db = mgrCfg.getDb("jump_other_game_db");
		let len = ul.length(db);
		this.showIndex++;
		if ( this.showIndex > len ) {
			this.showIndex = 1;
		}

		this.dbData = mgrCfg.get_from_jump_other_game_db( this.showIndex );
		if ( !this.dbData ) {
			this.stopAllActions();
			this.spriteIcon.spriteFrame = null;
			this.active = false;
			return;
		}
		this.spriteIcon.loadSpriteFrame( this.dbData.icon );
	}








	////// 事件 /////
	// @view export events begin
	onTouchButtonIcon(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }

		if ( !this.dbData ) { return; }
		mgrSdk.jumpOtherGame( this.dbData.gameIndex );
	}

	// @view export events end










}