import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrCfg from "../../manager/mgrCfg";
import mgrStage from "../../manager/mgrStage";
import mgrDirector from './../../manager/mgrDirector';
import mgrGuide from "../../manager/mgrGuide";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vChapterItem extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vChapterItem"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonStage1: {
				varname: "buttonStage1",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonStage1" }],
			},
			CC_buttonStage2: {
				varname: "buttonStage2",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonStage2" }],
			},
			CC_buttonStage3: {
				varname: "buttonStage3",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonStage3" }],
			},
			CC_buttonStage4: {
				varname: "buttonStage4",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonStage4" }],
			},
			CC_buttonStage5: {
				varname: "buttonStage5",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonStage5" }],
			},
			CC_buttonStage6: {
				varname: "buttonStage6",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonStage6" }],
			},
			CC_buttonStage7: {
				varname: "buttonStage7",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonStage7" }],
			},
			CC_buttonStage8: {
				varname: "buttonStage8",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonStage8" }],
			},
			CC_labelName: { varname: "labelName", vartype: cc.Label },
		};
	}
	protected buttonStage1: ScaleableButton = null;
	protected buttonStage2: ScaleableButton = null;
	protected buttonStage3: ScaleableButton = null;
	protected buttonStage4: ScaleableButton = null;
	protected buttonStage5: ScaleableButton = null;
	protected buttonStage6: ScaleableButton = null;
	protected buttonStage7: ScaleableButton = null;
	protected buttonStage8: ScaleableButton = null;
	protected labelName: cc.Label = null;
	// @view export resources end

	private items: any[] = null;









	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.buildUi();
		this.refresh();
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

	public fillData(chapterId: number) {
		this.context.chapterId = chapterId;

		this.refresh();
	}

	private refresh() {
		if (!this.isResourceLoaded()) return;
		let chapterId = this.context.chapterId;
		if (!chapterId) { return; }

		let chapterData = mgrCfg.get_from_stage_chapter_db(chapterId);
		if (!chapterData) { return; }

		console.log("@@@: chapterId", chapterId)
		if (chapterId == 101) {
			//新手引导
			if (mgrStage.getStageProgress() == 0) {
				mgrGuide.registerGuideNode("vStageScene.buttonStageFirst", this.buttonStage1.node)
				this.sendMsg("MSG_GUIDE_POINT", { id: "vStageScene.beginStageGuide" });
			}
		}


		let str = chapterData.name.replace("_", "-");
		this.labelName.string = str

		//刷新所有关卡的显示
		for (let i = 1; i <= 8; i++) {
			let stageId = chapterData.stageIds[i - 1]
			let node: cc.Node = this['buttonStage' + i.toString()].node
			let lockNode = node.getChildByName("lock")
			let unlockNode = node.getChildByName("unlock")
			let star1 = node.getChildByName("star1")
			let star2 = node.getChildByName("star2")
			let star3 = node.getChildByName("star3")
			let name = node.getChildByName("bgName").getChildByName("name").getComponent(cc.Label)

			let stageData = mgrCfg.get_from_stage_db(stageId)
			name.string = stageData.name

			if (mgrStage.isStageUnlocked(stageId)) {
				//
				lockNode.active = false
				unlockNode.active = true
				star1.getChildByName("light").active = mgrStage.getStageRating(stageId) >= 1
				star1.getChildByName("unlock").active = false


				star2.getChildByName("light").active = mgrStage.getStageRating(stageId) >= 2
				star2.getChildByName("unlock").active = false

				star3.getChildByName("light").active = mgrStage.getStageRating(stageId) >= 3
				star3.getChildByName("unlock").active = false
			}
			else {
				lockNode.active = true
				unlockNode.active = false
				star1.getChildByName("light").active = false
				star1.getChildByName("unlock").active = true

				star2.getChildByName("light").active = false
				star2.getChildByName("unlock").active = true

				star3.getChildByName("light").active = false
				star3.getChildByName("unlock").active = true
			}
		}
	}

	private selectStage(index: number) {
		index = index - 1
		let chapterData = mgrCfg.get_from_stage_chapter_db(this.context.chapterId)
		let stageId = chapterData.stageIds[index]

		if(this.context.fOnClickStage){
			this.context.fOnClickStage(stageId)
		}
	}




	////// 事件 /////
	// @view export events begin
	onTouchButtonStage1(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.selectStage(1)

		this.sendMsg("MSG_GUIDE_POINT", { id: "vStageScene.buttonStageItem.click" });
	}

	onTouchButtonStage2(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.selectStage(2)
	}

	onTouchButtonStage3(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.selectStage(3)
	}

	onTouchButtonStage4(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.selectStage(4)
	}

	onTouchButtonStage5(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.selectStage(5)
	}

	onTouchButtonStage6(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.selectStage(6)
	}

	onTouchButtonStage7(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.selectStage(7)
	}

	onTouchButtonStage8(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.selectStage(8)
	}
	// @view export events end










}


