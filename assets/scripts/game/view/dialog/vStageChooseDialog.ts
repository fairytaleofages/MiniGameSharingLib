import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ReuseList from "../../../ulframework/view/ReuseList";
import mgrAd from "../../manager/mgrAd";
import mgrTip from "../../manager/mgrTip";
import mgrDirector from "../../manager/mgrDirector";
import mgrStage from "../../manager/mgrStage";
import mgrCfg from "../../manager/mgrCfg";
import vChapterItem from "../node/vChapterItem";
import ReuseLayouterVBox from "../../../ulframework/view/ReuseLayouterVBox";
import vTitleBar from "../node/vTitleBar";
import vJumpOtherGame from "../node/vJumpOtherGame";
import mgrPlayer from "../../manager/mgrPlayer";
import mgrSdk from "../../manager/mgrSdk";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrGuide from "../../manager/mgrGuide";
import ReuseLayouterHBox from "../../../ulframework/view/ReuseLayouterHBox";
import { AdMode } from "../../Const";

const AD_ID_BANNER = "banner_stage_choose";

export default class vStageChooseDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vStageChooseDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonBack: {
				varname: "buttonBack",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonBack" }],
			},
			CC_buttonLeft: {
				varname: "buttonLeft",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonLeft" }],
			},
			CC_buttonRight: {
				varname: "buttonRight",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonRight" }],
			},
			CC_nodeBg: { varname: "nodeBg", vartype: cc.Node },
			CC_nodeJumpOtherGame: { varname: "nodeJumpOtherGame", vartype: cc.Node },
			CC_nodeLeftTop: { varname: "nodeLeftTop", vartype: cc.Node },
			CC_nodeListChapter: { varname: "nodeListChapter", vartype: cc.Node },
			CC_nodeListChapterButton: { varname: "nodeListChapterButton", vartype: cc.Node },
			CC_nodeTitleBar: { varname: "nodeTitleBar", vartype: cc.Node },
			CC_nodeTop: { varname: "nodeTop", vartype: cc.Node },
		};
	}
	protected buttonBack: ScaleableButton = null;
	protected buttonLeft: ScaleableButton = null;
	protected buttonRight: ScaleableButton = null;
	protected nodeBg: cc.Node = null;
	protected nodeJumpOtherGame: cc.Node = null;
	protected nodeLeftTop: cc.Node = null;
	protected nodeListChapter: cc.Node = null;
	protected nodeListChapterButton: cc.Node = null;
	protected nodeTitleBar: cc.Node = null;
	protected nodeTop: cc.Node = null;
	// @view export resources end

	private listChapter: ReuseList = null;
	private curIndex = 0







	constructor(context) {
		super(context);
		this.context.bImmediately = true;
	}

	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		// resize
		this.nodeResource.setContentSize(mgrDirector.size);

        this.uiFadeIn();
		this.buildUi();
		this.fillData();
		this.goToLastChapter();
		this.refreshButton()

		if (mgrGuide.isGuiding()) {
			this.listChapter.setTouchScrollEnabled(false);
		}

		this.registerListeners({
		})

		this.tryOpenChapter(mgrStage.getLastChapterId(), null);
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

	buildUi() {
		let titleBar = new vTitleBar({ bHideDiamond: false });
		titleBar.parent = this.nodeTitleBar;

		if (mgrDirector.isDeviceOverHeight()) {
			this.nodeTitleBar.parent.y = mgrDirector.height / 2 - 50
		}

		let jumpOtherGame = new vJumpOtherGame();
		jumpOtherGame.parent = this.nodeJumpOtherGame;

		// this.nodeBg.color = mgrPlayer.getCurSkinWallColor();

		let layouterVB = new ReuseLayouterHBox()
			.setCellSize(576, 732)
			.setGap(0)
			.setPending(0)
		let reuseList = new ReuseList()
		reuseList.parent = this.nodeListChapter;
		reuseList.setContentSize(this.nodeListChapter.getContentSize());
		reuseList.setLayouter(layouterVB);
		reuseList.setCreator((cell) => {
			let item = new vChapterItem({
				fOnClickStage: this.onClickStage.bind(this)
			});
			item.parent = cell;
			cell.item = item;
		});
		reuseList.setSetter((cell, data) => {
			let item: vChapterItem = cell.item;
			item.fillData(data);
		});
		this.listChapter = reuseList;
		this.listChapter.setTouchScrollEnabled(false)
	}

	fillData() {
		let datas = [];
		mgrCfg.forDb_from_stage_chapter_db((key, value) => {
			datas.push(value.id);
		});
		this.listChapter.setDatas(datas);
	}

	goToLastChapter() {
		let chapterId = mgrStage.getLastChapterId();
		this.listChapter.jumpToData(chapterId, null);
		this.curIndex = chapterId % 100 - 1
	}


	// 尝试开启章节
	private tryOpenChapter(chapterId: number, callback: () => void) {
		if (!mgrStage.isChapterOpen(chapterId)) {
			if (!mgrAd.preCheckCanTriggerAdEvent("open_chapter")) {
				//无广告,直接开启章节
				mgrStage.openChapter(chapterId)
				if (callback instanceof Function) {
					callback()
				}
			}
			else {
				let data: any = { chapterId: chapterId };
				data.callFun = callback
				mgrDirector.openDialog("vNextChapterDialog", data);
			}
			return true;
		}

		return false;
	}


	// 关卡确认
	private enterStage(stageId) {
		if (mgrStage.tryBeginStage(stageId)) {
			mgrStage.beginStage(stageId)
			mgrDirector.enterScene("vGameScene", {
				stageId: stageId
			})
		}
	}


	private onClickStage(stageId) {
		if(!mgrStage.isStageUnlocked(stageId)){
			mgrTip.showMsgTip("尚未解锁")
			return
		}
		if(!this.tryOpenChapter(mgrStage.calcChapterIdByStageId(stageId), ()=>{
			this.enterStage(stageId)
		})){
			this.enterStage(stageId)
		}
	}

	private refreshButton(){
		this.buttonLeft.node.active = this.curIndex > 0
		this.buttonRight.node.active = this.curIndex < this.listChapter.getDatas().length - 1
	}




	////// 事件 /////
	// @view export events begin
	onTouchButtonBack(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		this.closeDialog();
	}

	onTouchButtonLeft(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		this.curIndex = this.curIndex - 1 > 0 ? this.curIndex - 1 : 0
		this.listChapter.scrollToIndex(this.curIndex)
		this.refreshButton()
	}

	onTouchButtonRight(e: EventTouchEx): void {
		if (!e.isClick()) { return; }
		this.curIndex = this.curIndex + 1 < this.listChapter.getDatas().length ? this.curIndex + 1 : this.listChapter.getDatas().length - 1
		this.listChapter.scrollToIndex(this.curIndex)
		this.refreshButton()
	}
	// @view export events end




}

