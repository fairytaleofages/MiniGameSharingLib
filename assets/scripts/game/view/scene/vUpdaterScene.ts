import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import SceneBase from "../../../ulframework/view/SceneBase";
import mgrDirector from "../../manager/mgrDirector";
import Tools from "../../../ulframework/utils/Tools";
import Const from "../../Const";
import Timer from "../../../ulframework/utils/Timer";
import vUpdaterSceneBase from "../../../ulframework/updater/vUpdaterSceneBase";
import mgrSound from "../../manager/mgrSound";


const { ccclass, property } = cc._decorator;

@ccclass
export default class vUpdaterScene extends vUpdaterSceneBase {
	// @view export resources begin
	protected _getResourceName() { return "scene/vUpdaterScene"; }
	protected _getResourceBindingConfig() {
		return {
			CC_labelProcess: { varname: "labelProcess", vartype: cc.Label },
			CC_nodeLoadAni: { varname: "nodeLoadAni", vartype: cc.Node },
			CC_nodeStar: { varname: "nodeStar", vartype: cc.Node },
			CC_progressBar: { varname: "progressBar", vartype: cc.ProgressBar },
		};
	}
	protected labelProcess: cc.Label = null;
	protected nodeLoadAni: cc.Node = null;
	protected nodeStar: cc.Node = null;
	protected progressBar: cc.ProgressBar = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

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










	////// UI逻辑 /////
	protected buildUi() {
		super.buildUi();
	}

	protected onUiMsg(msg: string, data?: any) {
		super.onUiMsg(msg, data);

		if (msg == "UPDATER_UI_MSG_GET_VERSION") {
			this.progressBar.progress = 0;
			this.labelProcess.string = "进入中";

		} else if (msg == "UPDATER_UI_MSG_DOWNLOAD_PROGRESS") {
			if (!data) return;
			let bytePercent: number = cc.clampf(data.bytePercent || 0, 0, 1);
			let filePercent: number = cc.clampf(data.filePercent || 0, 0, 1)

			let patchCount = this.patchs.length;
			let patchIdx = this.patchIdx;

			// 进度条的算法
			// 首先按照补丁的数量进行拆分
			// 每个补丁的进度按照currPercent进行填充
			let progress = (bytePercent + patchIdx) / patchCount;
			this.progressBar.progress = progress;
			// this.labelProcess.string = ul.format("下载中：%d/%d %d\%", patchIdx + 1, patchCount, progress * 100);
			this.labelProcess.string = "进入中.";

		} else if (msg == "UPDATER_UI_MSG_DOWNLOAD_SUCCESS") {
			this.progressBar.progress = 1;
			// this.labelProcess.string = "更新完成";
			this.labelProcess.string = "进入中..";
			
		} else if (msg == "UPDATER_UI_MSG_ENTER_NEXT_SCENE") {
			mgrDirector.enterScene("vLoadingScene");
		}
	}








	///// 更新器逻辑 /////










	////// 事件 /////
	// @view export events begin
	// @view export events end










}

