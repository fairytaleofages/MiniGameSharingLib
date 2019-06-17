import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrDirector from "../../manager/mgrDirector";
import DebugMenu from "../../../ulframework/view/DebugMenu";
import ReuseList from "../../../ulframework/view/ReuseList";
import ReuseLayouterVBox from "../../../ulframework/view/ReuseLayouterVBox";
import Const from "../../Const";
import mgrAlu from "../../manager/mgrAlu";
import mgrSdk from "../../manager/mgrSdk";
import mgrCop from "../../manager/mgrCop";
import Tools from "../../../ulframework/utils/Tools";
import mgrTip from "../../manager/mgrTip";
import mgrRecord from "../../manager/mgrRecord";
import mgrDebug from "../../manager/mgrDebug";
import Timer from "../../../ulframework/utils/Timer";
import mgrShop from "../../manager/mgrShop";
import mgrPlayer from "../../manager/mgrPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vDebugInfoDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vDebugInfoDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_nodeInfo: { varname: "nodeInfo", vartype: cc.Node },
			CC_nodeMenu: { varname: "nodeMenu", vartype: cc.Node },
		};
	}
	protected nodeInfo: cc.Node = null;
	protected nodeMenu: cc.Node = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.nodeResource.setContentSize(mgrDirector.size);
		this.nodeInfo.getComponent(cc.Widget).updateAlignment();

		this.buildUi();
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

	isShadowEnabled() {
		return false;
	}










	////// 内部逻辑 /////
	private buildUi() {
		let menu = new DebugMenu([
			[
				"关闭",
				() => {
					this.closeDialog(true);
				}
			],
			[
				"time",
				() => {
					mgrTip.showMsgTip(ul.format("time:%s", Tools.time()));
				}
			],
			// [
			// 	"测试SDK",
			// 	() => {
			// 		mgrDirector.enterScene("TestSdk", { backSceneName: "scene.vRoomScene" });
			// 	}
			// ],
			[
				"重置存档",
				() => {
					// mgrTip.alertPrompt2("警告", "清理存档后无法恢复，并且需要重启！！！", "取消", "清理", null, () => {
						mgrRecord.resetRecord();
						mgrTip.showMsgTip("ojbk");
						Timer.callLater(0.5, () => {
							cc.audioEngine.stopAll();
							cc.game["restart"]();
						});
					// })
				}
			],
			[
				"log->console",
				() => {
					cc.log = console.log;
					cc.log("cc.log is refrence to cc.info");
				}
			],
			// [
			// 	"unlock all",
			// 	() => {
			// 		mgrTip.showMsgTip("unlock all!");
			// 		mgrDebug.bUnlockAllStage = true;
			// 	}
            // ],
            // [
			// 	"addDiamond",
			// 	() => {
			// 		mgrTip.showMsgTip("add diamond!");
			// 		mgrPlayer.addItemAmount(Const.ITEM_ID_GOLD,500,"测试");
			// 	}
			// ],
		], 200, 50, 4)
		menu.parent = this.nodeMenu;
		menu.x = 5;
		menu.y = -5;


		let fontSize = 16;
		let nodeList = this.nodeInfo;
		let reuseList = new ReuseList()
		reuseList.parent = nodeList;
		reuseList.setLayouter(new ReuseLayouterVBox()
			.setCellSize(nodeList.getContentSize().width - 8, fontSize)
			.setGap(4)
			.setPending(4));
		reuseList.setCreator((cell) => {
			// let layerBg = new LayerColor(cc.color(255, 0, 0, 255));
			// layerBg.parent = cell;
			// layerBg.setContentSize(cell.getContentSize());
			// cell.layerBg = layerBg;

			let nodeLabel = new cc.Node();
			nodeLabel.parent = cell;
			// nodeLabel.setContentSize(cell.getContentSize());
			let label = nodeLabel.addComponent(cc.Label);
			label.fontSize = fontSize;
			label.lineHeight = fontSize;
			label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
			label.verticalAlign = cc.Label.VerticalAlign.CENTER;
			label.overflow = cc.Label.Overflow.SHRINK;
			nodeLabel.setContentSize(cell.getContentSize());
			cell.label = label;

		});
		reuseList.setSetter((cell, data) => {
			cell.label.string = data;
		});
		reuseList.setContentSize(nodeList.getContentSize());
		let widget = reuseList.addComponent(cc.Widget);
		widget.top = 0;
		widget.bottom = 0;
		widget.right = 0;
		widget.left = 0;
		widget.isAlignOnce = false;


		let texts = [
			"调试信息：",
		];

		// // Patch信息
		// if (!Const.LOCAL_PATCH_INFO) {
		// 	texts.push("Const.LOCAL_PATCH_INFO未找到！");
		// } else {
		// 	texts.push(ul.format("[LOCAL_PATCH_INFO.CHANNEL] = [%s]", Const.LOCAL_PATCH_INFO.CHANNEL));
		// 	if (Const.LOCAL_PATCH_INFO.CONF) {
		// 		texts.push(ul.format("[LOCAL_PATCH_INFO.CONF.B_SKIP_PAYMENT] = [%s]", Const.LOCAL_PATCH_INFO.CONF.B_SKIP_PAYMENT));
		// 		texts.push(ul.format("[LOCAL_PATCH_INFO.CONF.B_DISABLE_DEVTEST_BUTTON] = [%s]", Const.LOCAL_PATCH_INFO.CONF.B_DISABLE_DEVTEST_BUTTON));
		// 		texts.push(ul.format("[LOCAL_PATCH_INFO.CONF.PUBLISH_CHANNEL] = [%s]", Const.LOCAL_PATCH_INFO.CONF.PUBLISH_CHANNEL));

		// 	} else {
		// 		texts.push("Const.LOCAL_PATCH_INFO.CONF未找到！");
		// 	}

		// }

		// texts.push(ul.format("GAME_VERSION = [%s]", Const.GAME_VERSION));
		// texts.push(ul.format("uid = [%s]", mgrPlayer.getUid()));
		// texts.push(ul.format("mgrAlu.getCheckPayChannel = [%s]", mgrAlu.getCheckPayChannel()));
		// texts.push(ul.format("mgrAlu.getCheckPlatform = [%s]", mgrAlu.getCheckPlatform()));
		// texts.push(ul.format("ANDROID_SWITCH_MORE_GAME = [%s]", Const.ANDROID_SWITCH_MORE_GAME));
		// texts.push(ul.format("ANDROID_SWITCH_ABOUT = [%s]", Const.ANDROID_SWITCH_ABOUT));
		// texts.push(ul.format("ANDROID_SWITCH_THIRD_EXIT = [%s]", Const.ANDROID_SWITCH_THIRD_EXIT));
		// texts.push(ul.format("ANDROID_SWITCH_MUSIC_ENABLED = [%s]", Const.ANDROID_SWITCH_MUSIC_ENABLED));
		// texts.push(ul.format("sdcardPath = [%s]", mgrSdk["sdcardPath"]));

		let cops = mgrCop.getCops();
		let keys = Object.keys(cops);
		keys.sort();

		texts.push("cop:");
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			let value = cops[key];
			texts.push(ul.format("  [%s] = [%s]", key, value));
		}

		// // banShopIds
		// let ids = [];
		// Tools.forEachMap(mgrShop["banShopIds"], (k, v) => { if (v) ids.push(k) });
		// texts.push(ul.format("banShopIds = [%s]", ids.join(",")));

		texts.push("");
		texts.push("ultralisk 成都雷兽互动 版权所有");


		reuseList.setDatas(texts);
	}










	////// 事件 /////
	// @view export events begin
	// @view export events end










}