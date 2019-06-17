import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrAd from "../../manager/mgrAd";
import mgrStage from "../../manager/mgrStage";
import mgrCfg from "../../manager/mgrCfg";

const { ccclass, property } = cc._decorator;

const AD_ENENT_ID = "open_chapter";

@ccclass
export default class vNextChapterDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vNextChapterDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_buttonOpen: {
				varname: "buttonOpen",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonOpen" }],
			},
			CC_labelStage: { varname: "labelStage", vartype: cc.Label },
			CC_nodeAdIcon: { varname: "nodeAdIcon", vartype: cc.Node },
		};
	}
	protected buttonClose: ScaleableButton = null;
	protected buttonOpen: ScaleableButton = null;
	protected labelStage: cc.Label = null;
	protected nodeAdIcon: cc.Node = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.fillData();

		this.registerListeners({
			MSG_AD_EVENT_SUCCESSD: this.onMsgAdEventSuccessd,
			// MSG_AD_EVENT_CLOSED: this.onMsgAdEventSuccessd,
		})
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

	private fillData() {
		let chapterId = this.context.chapterId;
		let chapterData = mgrCfg.get_from_stage_chapter_db(chapterId);
		if (!!chapterData) {
			let data = chapterData.stageIds;
			this.labelStage.string = ul.format("第%d-%d关", data[0], data[data.length - 1]);
		}

		let canAd = mgrAd.preCheckCanTriggerAdEvent(AD_ENENT_ID)
		this.nodeAdIcon.active = canAd;
	}


	private openDo() {
		let chapterId = this.context.chapterId;
		mgrStage.openChapter(chapterId);
		if (this.context.callFun) {
			this.context.callFun();
		}
		this.closeDialog();
	}





	////// 事件 /////
	// @view export events begin
	onTouchButtonClose(e: EventTouchEx): void {
		if (!e.isClick()) { return; }

		this.closeDialog();
	}

	onTouchButtonOpen(e: EventTouchEx): void {
		if (!e.isClick()) { return; }


		// 有广告，触发广告
		if (mgrAd.preCheckCanTriggerAdEvent(AD_ENENT_ID)) {
			mgrAd.triggerAdEvent(AD_ENENT_ID, null, true);
		} else {
			this.openDo();
		}
	}

	// @view export events end

	onMsgAdEventSuccessd(e) {
		let data = e;

		let adEventId = data.adEventId;
		if (adEventId == AD_ENENT_ID) {
			this.openDo();
		}

	}








}

