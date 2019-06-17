import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrSound from "../../manager/mgrSound";
import mgrTip from "../../manager/mgrTip";
import mgrSdk from "../../manager/mgrSdk";
import Const from "../../Const";
import Tools from "../../../ulframework/utils/Tools";
import mgrDirector from "../../manager/mgrDirector";
import vCdkDialog from "./vCdkDialog";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vSettingDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vSettingDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonCdk: {
				varname: "buttonCdk",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonCdk" }],
			},
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_buttonEffect: {
				varname: "buttonEffect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonEffect" }],
			},
			CC_buttonMusic: {
				varname: "buttonMusic",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonMusic" }],
			},
			CC_buttonVideoRecord: {
				varname: "buttonVideoRecord",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonVideoRecord" }],
			},
			CC_nodeBg: { varname: "nodeBg", vartype: cc.Node },
			CC_nodeCdk: { varname: "nodeCdk", vartype: cc.Node },
			CC_nodeKefu: { varname: "nodeKefu", vartype: cc.Node },
			CC_nodeSwitchCloseEffect: { varname: "nodeSwitchCloseEffect", vartype: cc.Node },
			CC_nodeSwitchCloseMusic: { varname: "nodeSwitchCloseMusic", vartype: cc.Node },
			CC_nodeSwitchCloseVideoRecord: { varname: "nodeSwitchCloseVideoRecord", vartype: cc.Node },
			CC_nodeSwitchOpenEffect: { varname: "nodeSwitchOpenEffect", vartype: cc.Node },
			CC_nodeSwitchOpenMusic: { varname: "nodeSwitchOpenMusic", vartype: cc.Node },
			CC_nodeSwitchOpenVideoRecord: { varname: "nodeSwitchOpenVideoRecord", vartype: cc.Node },
			CC_nodeVideoRecord: { varname: "nodeVideoRecord", vartype: cc.Node },
		};
	}
	protected buttonCdk: ScaleableButton = null;
	protected buttonClose: ScaleableButton = null;
	protected buttonEffect: ScaleableButton = null;
	protected buttonMusic: ScaleableButton = null;
	protected buttonVideoRecord: ScaleableButton = null;
	protected nodeBg: cc.Node = null;
	protected nodeCdk: cc.Node = null;
	protected nodeKefu: cc.Node = null;
	protected nodeSwitchCloseEffect: cc.Node = null;
	protected nodeSwitchCloseMusic: cc.Node = null;
	protected nodeSwitchCloseVideoRecord: cc.Node = null;
	protected nodeSwitchOpenEffect: cc.Node = null;
	protected nodeSwitchOpenMusic: cc.Node = null;
	protected nodeSwitchOpenVideoRecord: cc.Node = null;
	protected nodeVideoRecord: cc.Node = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.refreshEffect();
		this.refreshMusic();
		this.refreshVideoRecord();

		this.nodeVideoRecord.active = mgrSdk.isCopOpenVideoRecord();
		this.nodeCdk.active = mgrSdk.getCopNumberValueByKey("b_cdk") == 1
		this.nodeKefu.active = mgrSdk.getCopNumberValueByKey("b_kefu_email") == 1
        
        Tools.registerTouchHandler(this.nodeBg, this.onTouchNodeBg.bind(this));
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

	refreshEffect () {
		let bSound = mgrSound.getEffectVolume() > 0;
		this.nodeSwitchCloseEffect.active = !bSound;
		this.nodeSwitchOpenEffect.active = bSound;
	}

	refreshMusic () {
		let bSound = mgrSound.getMusicVolmue() > 0;
		this.nodeSwitchCloseMusic.active = !bSound;
		this.nodeSwitchOpenMusic.active = bSound;
	}

	refreshVideoRecord () {
		let open = mgrSdk.isOpenVideoRecord();
		this.nodeSwitchCloseVideoRecord.active = !open;
		this.nodeSwitchOpenVideoRecord.active = open;
	}







	////// 事件 /////
	// @view export events begin
	onTouchButtonClose(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }

		this.closeDialog();
	}

	onTouchButtonEffect(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }

		if ( mgrSound.getEffectVolume() > 0 ) {
			mgrSound.setEffectVolume( 0 );
		} else {
			mgrSound.setEffectVolume( 1 );
		}

		this.refreshEffect();
	}

	onTouchButtonMusic(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }

		if ( mgrSound.getMusicVolmue() > 0 ) {
			mgrSound.setMusicVomue( 0 );
		} else {
			mgrSound.setMusicVomue( 1 );
		}

		this.refreshMusic();
	}

	onTouchButtonVideoRecord(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }

		if ( Const.IS_OPEN_VIDEO_RECORD ) {
			Const.IS_OPEN_VIDEO_RECORD = false;
			mgrTip.showMsgTip("关闭自动录制");
		} else {
			Const.IS_OPEN_VIDEO_RECORD = true;
			mgrTip.showMsgTip("开启自动录制");
		}

		this.refreshVideoRecord();
	}

	onTouchButtonCdk(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }

		mgrDirector.openDialog("vCdkDialog")
	}

	// @view export events end

    private onTouchNodeBg(e: EventTouchEx) {
		// cc.log("onTouchNodeBg", e.name, e.getLocation());
		// 左右摇摆20次打开测试界面

		if (e.name == "began") {
			this["_b_drag_to_right"] = true;
			this["_turn_count"] = 0;
			this["_b_poped"] = false;
		} else if (e.name == "moved") {
			let p0 = e.getStartLocation();
			let p = e.getLocation();

			if (this["_b_drag_to_right"]) {
				// 刚在是在往右
				if (p.x < p0.x - 20) {
					this["_b_drag_to_right"] = false;
					this["_turn_count"]++;
					cc.log("turn left", this["_turn_count"]);
				}
			} else {
				// 刚才是在往左
				if (p.x > p0.x + 20) {
					this["_b_drag_to_right"] = true;
					this["_turn_count"]++;
					cc.log("turn right", this["_turn_count"]);
				}
			}

			if (!this["_b_poped"]) {
				if (this["_turn_count"] >= 20) {
					mgrDirector.openDialog("vDebugInfoDialog", null, true);
					this["_b_poped"] = true;
				}
			}
		}
	}








}


