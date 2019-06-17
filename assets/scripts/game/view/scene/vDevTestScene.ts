import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import SceneBase from "../../../ulframework/view/SceneBase";
import mgrDirector from "../../manager/mgrDirector";
import EditorCakeItem from './../_editor/EditorCakeItem';

const { ccclass, property } = cc._decorator;

@ccclass
export default class vDevTestScene extends SceneBase {
	// @view export resources begin
	protected _getResourceName() { return "scene/vDevTestScene"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonBack: {
				varname: "buttonBack",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonBack" }],
			},
			CC_labelTitle: { varname: "labelTitle", vartype: cc.Label },
			CC_layoutBg: { varname: "layoutBg", vartype: cc.Layout },
			CC_nodeButtonItemTemplate: { varname: "nodeButtonItemTemplate", vartype: cc.Node },
			CC_nodeScrollViewContent: { varname: "nodeScrollViewContent", vartype: cc.Node },
			CC_scrollViewList: { varname: "scrollViewList", vartype: cc.ScrollView },
		};
	}
	protected buttonBack: ScaleableButton = null;
	protected labelTitle: cc.Label = null;
	protected layoutBg: cc.Layout = null;
	protected nodeButtonItemTemplate: cc.Node = null;
	protected nodeScrollViewContent: cc.Node = null;
	protected scrollViewList: cc.ScrollView = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		// cc.log("this", this);

		this.labelTitle.string = this.name;
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










	////// 内部逻辑 /////
	buildUi(): void {
		/**
		 * abcdefg
		 * hijklmn
		 * opqrst
		 * uvwxyz
		 */
		let config: any = [
			["_Editor", "EditorCakeItem", { resolutionRange: { minWidth: 1920, maxWidth: 1920, minHeight: 1080, maxHeight: 1080 } }],
			["_Hub", "vHubScene"],
			["_Sign", "vSignDialog"],
			["_debugInfo", "vDebugInfoDialog"],

			["AnimNode", "TestAnimNode"],
			["Particle", "TestParticle"],
			["Sound", "TestSound"],
			["Spine", "TestSpine"],
			["Func", "TestFunc"],
		];

		for (let i = 0; i < config.length; i++) {
			const [text, name, context] = config[i];
			// cc.log(i, text, name);

			// 添加按钮
			let nodeButton = cc.instantiate(this.nodeButtonItemTemplate);
			nodeButton.getChildByName("Label").getComponent(cc.Label).string = text;
			nodeButton.parent = this.nodeScrollViewContent;

			nodeButton.name = name;
			nodeButton["context"] = context;

			// // 注册点击事件
			nodeButton.getComponent(ScaleableButton).registerOnTouchCallback(this.onTouchButtonItem.bind(this));
		}

		// 隐藏模板
		this.nodeButtonItemTemplate.active = false;

		this.scrollViewList.cancelInnerEvents = false;
	}










	////// 事件 /////
	// @view export events begin
	onTouchButtonBack(e: EventTouchEx): void {
		if (!e.isClick()) return;
		mgrDirector.enterScene("vHubScene");
	}

	// @view export events end

	onTouchButtonItem(e: EventTouchEx): void {
		if (!e.isClick()) return;

		// 克隆一份按钮
		let nodeButton = cc.instantiate(this.buttonBack.node);

		// cc.log("click", e.target.name)
		mgrDirector.enterScene(e.target.name, e.target.context);

		// 在屏幕右上角添加一个按钮
		nodeButton.parent = cc.director.getScene().getChildByName("Canvas");
		nodeButton.zIndex = (1000);

		let buttonSize = nodeButton.getContentSize();
		nodeButton.getComponent(ScaleableButton).registerOnTouchCallback((e: EventTouchEx) => {
			if (!e.isClick()) return;
			mgrDirector.enterScene("vDevTestScene");
		});
	}










}