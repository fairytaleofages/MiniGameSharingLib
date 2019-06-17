import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import SceneBase from "../../../ulframework/view/SceneBase";
import mgrSound from "../../manager/mgrSound";
import mgrDirector from "../../manager/mgrDirector";
import mgrPlayer from "../../manager/mgrPlayer";
import Tools from "../../../ulframework/utils/Tools";
import mgrGuide from "../../manager/mgrGuide";
import mgrTip from "../../manager/mgrTip";
import Timer from "../../../ulframework/utils/Timer";
import mgrSign from "../../manager/mgrSign";
import vTitleBar from "../node/vTitleBar";
import Const, { SignState, AdMode } from "../../Const";
import mgrStage from "../../manager/mgrStage";
import mgrAd from "../../manager/mgrAd";
import mgrSdk from "../../manager/mgrSdk";
import vJumpOtherGame from "../node/vJumpOtherGame";
import vRankScene from './vRankScene';
import vDevTestScene from "./vDevTestScene";
import vIntitleDialog from "../dialog/vIntitleDialog";
import mgrRole from "../../manager/mgrRole";
import vStageChooseDialog from './../dialog/vStageChooseDialog';
import mgrShop from "../../manager/mgrShop";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vHubScene extends SceneBase {
	// @view export resources begin
	protected _getResourceName() { return "scene/vHubScene"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonDevTest: {
				varname: "buttonDevTest",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonDevTest" }],
			},
			CC_buttonFreeMall: {
				varname: "buttonFreeMall",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonFreeMall" }],
			},
			CC_buttonMatch: {
				varname: "buttonMatch",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonMatch" }],
			},
			CC_buttonMoreGame: {
				varname: "buttonMoreGame",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonMoreGame" }],
			},
			CC_buttonSetting: {
				varname: "buttonSetting",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSetting" }],
			},
			CC_buttonShare: {
				varname: "buttonShare",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonShare" }],
			},
			CC_buttonSign: {
				varname: "buttonSign",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSign" }],
			},
			CC_buttonStart: {
				varname: "buttonStart",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonStart" }],
			},
			CC_nodeBg: { varname: "nodeBg", vartype: cc.Node },
			CC_nodeJumpOtherGame: { varname: "nodeJumpOtherGame", vartype: cc.Node },
			CC_nodeLeftTop: { varname: "nodeLeftTop", vartype: cc.Node },
			CC_nodeStart: { varname: "nodeStart", vartype: cc.Node },
			CC_nodeTitleBar: { varname: "nodeTitleBar", vartype: cc.Node },
			CC_nodeTop: { varname: "nodeTop", vartype: cc.Node },
		};
	}
	protected buttonDevTest: ScaleableButton = null;
	protected buttonFreeMall: ScaleableButton = null;
	protected buttonMatch: ScaleableButton = null;
	protected buttonMoreGame: ScaleableButton = null;
	protected buttonSetting: ScaleableButton = null;
	protected buttonShare: ScaleableButton = null;
	protected buttonSign: ScaleableButton = null;
	protected buttonStart: ScaleableButton = null;
	protected nodeBg: cc.Node = null;
	protected nodeJumpOtherGame: cc.Node = null;
	protected nodeLeftTop: cc.Node = null;
	protected nodeStart: cc.Node = null;
	protected nodeTitleBar: cc.Node = null;
	protected nodeTop: cc.Node = null;
	// @view export resources end









	////// 生命周期 /////
	onLoad() {
		super.onLoad();
		mgrSound.play(1);
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.uiFadeIn();
		this.buildUi();
		this.fillData();

		this.registerListeners({
			MSG_SHARE_RESULT: this.onMsgShareResult,
			MSG_ADV_VALID_COUNT: this.onMsgAdValidCount,
			MSG_WALL_CHANGE: this.onMsgWallChange,
		});

		this.refreshBts();
		//尝试打开
		if (mgrPlayer.getName().length <= 0) {
			mgrDirector.openDialog("vIntitleDialog", {
				endCallback: () => {
					this._tryGuide();
					this._tryOpenSomeDialog();
					this._tryAlertWxgzhReward();
				}
			})
		}
		else {
			this._tryGuide();
			this._tryOpenSomeDialog();
			this._tryAlertWxgzhReward();
		}




		//如果从关卡回来, 则一定打开关卡保证游戏流畅性
		if (this.context.bFromStage) {
			mgrDirector.openDialog("vStageChooseDialog")
		}

		///广告
		if (mgrAd.preCheckCanTriggerAdEvent("wrap_scene")) {
			mgrAd.triggerAdEvent("wrap_scene", null, true);
		} else {
			mgrAd.triggerAdEvent("banner_all");
		}

        // 交叉推荐
        // mgrSdk.openCrossRecommend(0, 0)
        let size = cc.view.getFrameSize();
        if ( mgrDirector.isDeviceOverHeight() ) {
            mgrSdk.openCrossRecommend( 10, Math.floor( size.height * 0.21 ) );
        } else {
            mgrSdk.openCrossRecommend( 10, Math.floor( size.height * 0.16 ) );
        }
	}

	start() {
		super.start();
	}

	update(dt: number) {
		super.update(dt);
		this.refreshBts()
	}

	onDestroy() {
		mgrAd.closeAdv("banner_all");
		mgrSdk.closeCrossRecommend()
		super.onDestroy();
	}









	////// 内部逻辑 /////

	private _tryOpenSomeDialog() {
		if (mgrGuide.isGuiding()) { return; }
		// 离线奖励
		let [pastTime, income] = mgrRole.getOfflineReward();
		if (pastTime > 0) {
			mgrDirector.openDialog("vOfflineDialog", {
				pastTime: pastTime,
				income: income,
			});
			return;
		}

		// 签到
		if (mgrStage.getStageProgress() == 0) { return; }
		if (mgrSign.getState() == SignState.canSign) {
			mgrDirector.openDialog("vSignDialog");
			return
		}
	}

	private _tryGuide() {
		mgrGuide.registerGuideNode("vHubScene.buttonStage", this.buttonStart.node);
		if (mgrStage.getStageProgress() == 0) {
			this.sendMsg("MSG_GUIDE_POINT", { id: "vHubScene.beginHubGuide" });
		}
	}

	private uiFadeIn() {
        this.nodeTop.y = mgrDirector.height / 2;
        this.nodeLeftTop.x = -mgrDirector.width / 2;
        this.nodeLeftTop.y = mgrDirector.height / 2;

        // 刘海屏
        if ( mgrDirector.isDeviceOverHeight() ) {
            this.nodeTop.y = mgrDirector.height / 2 - 50;
            this.nodeLeftTop.y = mgrDirector.height / 2 - 50;
		}
	}

	private buildUi() {

		this.refreshBg();

		let titleBar = new vTitleBar({ bHideEnergy: false });
		titleBar.parent = this.nodeTitleBar;

		let jumpOtherGame = new vJumpOtherGame();
		jumpOtherGame.parent = this.nodeJumpOtherGame;

		let time = 0.4;
		this.nodeStart.runAction(cc.repeatForever(
			cc.sequence(
				cc.scaleTo(time, 1.05),
				cc.scaleTo(time, 1)
			)
		));

		if (mgrDirector.isDeviceOverHeight()) {
			this.nodeTitleBar.parent.y = mgrDirector.height / 2 - 50
		}
	}

	private fillData() {

	}

	private refreshBg() {
		// this.nodeBg.color = mgrPlayer.getCurSkinWallColor();
	}


	private refreshBts() {
		if (!this.isResourceLoaded()) return
		this.buttonShare.node.active = mgrPlayer.canShare();
		this.buttonMoreGame.node.active = mgrSdk.getCopByKey("b_more_game") == "1";
		this.buttonSign.node.active = !mgrSign.isSignOver();
		this.buttonFreeMall.node.active = mgrShop.canSupplyItem(Const.ITEM_ID_GOLD) || mgrShop.canSupplyItem(Const.ITEM_ID_ENERGY);

		this.buttonDevTest.node.active = CC_DEBUG
	}

	// 尝试提示微信公众号奖励
	private _tryAlertWxgzhReward() {
		if (mgrPlayer.isNeedAlertWxgzhReward) {
			let count = mgrPlayer.takeWxgzhReward();
			Timer.callLater(0.5, () => {
				mgrTip.showMsgTip("微信公众号奖励 金币x" + count);
			})
			if (!mgrGuide.isGuiding()) {
				mgrTip.addGotItemTip(Const.ITEM_ID_GOLD, count);
			}
		}
	}





	////// 事件 /////
	// @view export events begin
	onTouchButtonSetting(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		mgrDirector.openDialog("vSettingDialog");
		// mgrDirector.enterScene("vDevTestScene");
	}

	onTouchButtonShare(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		mgrPlayer.tryShowShare(null);
	}

	onTouchButtonSign(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		mgrDirector.openDialog("vSignDialog");
	}

	onTouchButtonMoreGame(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		mgrDirector.openDialog("vMoreGameDialog");
	}

	onTouchButtonStart(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		this.sendMsg("MSG_GUIDE_POINT", { id: "vHubScene.buttonStage.click" });
		mgrDirector.openDialog("vStageChooseDialog");
	}
	onTouchButtonFreeMall(e: EventTouchEx): void {
		if (!e.isClick()) { return; }
		mgrDirector.openDialog("vShopDialog")
	}

	onTouchButtonMatch(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		mgrDirector.enterScene("vRankScene")
	}

	onTouchButtonDevTest(e: EventTouchEx): void {
		if (!e.isClick()) { return; }
		mgrDirector.enterScene("vDevTestScene")
	}

	// @view export events end

	private onMsgShareResult(e) {
		this.refreshBts();
	}

	private onMsgAdValidCount(e) {
		this.refreshBts();
	}

	private onMsgWallChange(e) {
		this.refreshBg();
	}
}
































