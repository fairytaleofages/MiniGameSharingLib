import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrCfg from "../../manager/mgrCfg";
import Manager from "../../../ulframework/manager/Manager";
import mgrDirector from "../../manager/mgrDirector";
import SceneBase from "../../../ulframework/view/SceneBase";
import mgrSdk from "../../manager/mgrSdk";
import mgrSound from "../../manager/mgrSound";
import Tools from "../../../ulframework/utils/Tools";

import mgrRank from './../../manager/mgrRank';
import mgrNative from './../../manager/mgrNative';
import Const from './../../Const';

declare function require(moduleName: string): any;


const { ccclass, property } = cc._decorator;

@ccclass
export default class vLoadingScene extends SceneBase {
	// @view export resources begin
	protected _getResourceName() { return "scene/vLoadingScene"; }
	protected _getResourceBindingConfig() {
		return {
			CC_nodeProgress: { varname: "nodeProgress", vartype: cc.Node },
		};
	}
	protected nodeProgress: cc.Node = null;
	// @view export resources end

	private curProgress: number = 0;









	////// 生命周期 /////
	onLoad() {
		cc.log("vLoadingScene.onLoad");
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		// 优先注册监听
		this.registerListeners({
			MSG_CHANNEL_INFO_RESULT: this.onMsgChannelInfoResult,
		});

		this.buildUi();
		this.beginLoading();
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
	}

	private beginLoading() {
		this.context.beginTime = Tools.time();

		//加载所有配置表
		let cfgUrls = mgrCfg.getLoadUrls();

		// 加载需要优先加载的资源，确保下次加载更快速
		let preloadNames = [
			// "2d/part/body",
			"2d/animation/defaultDialogOpen",
			"2d/animation/defaultDialogClose",
		];

		// 合并所有urls，进行加载
		let urls = cfgUrls.concat(preloadNames);
		cc.loader.loadResArray(urls, (completedCount: number, totalCount: number, item: any) => {
			let temp = completedCount / totalCount;
			this.curProgress = temp > this.curProgress ? temp : this.curProgress;
			this.updateProgress();
		}, (error: Error, resource: any[]) => {
			if (error) {
				cc.error("loadResArray error : ", error.message);
			}
			this.loadFinish();
		}
		);

		this.updateProgress();
	}

	private loadFinish() {

		// 加工配置表
		mgrCfg.processDb();

		// 加载manager
		Manager.loadAllManagers();

		mgrRank.requestSelfData(Const.SERVER_RANK_ID)
		mgrRank.requestNextBatchPlayers(Const.SERVER_RANK_ID)

		// 注入声音播放接口
		ScaleableButton.setSoundPlayHandler(() => {
			mgrSound.play(101);
		});

		let usedTime = Tools.time() - this.context.beginTime;
		cc.log(`loading finish, 用时${usedTime * 1000}ms`);

		mgrSdk.onLoadingComplete();
	}

	private updateProgress() {
		cc.log("@:this.process: ", this.curProgress)
		this.nodeProgress.height = this.curProgress * 280
	}

	private startGame() {
		mgrDirector.enterScene("vHubScene");
	}







	////// 事件 /////
	// @view export events begin
	// @view export events end

	onMsgChannelInfoResult(e) {
		this.startGame();
	}







}








