import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vPromptDialog extends DialogBase {
	// @view export resources begina
	protected _getResourceName() { return "dialog/vPromptDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_button1: {
				varname: "button1",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButton1" }],
			},
			CC_button2: {
				varname: "button2",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButton2" }],
			},
			CC_button3: {
				varname: "button3",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButton3" }],
			},
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_labelContent: { varname: "labelContent", vartype: cc.Label },
			CC_labelTitle: { varname: "labelTitle", vartype: cc.Label },
		};
	}
	protected button1: ScaleableButton = null;
	protected button2: ScaleableButton = null;
	protected button3: ScaleableButton = null;
	protected buttonClose: ScaleableButton = null;
	protected labelContent: cc.Label = null;
	protected labelTitle: cc.Label = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		// title
		this.labelTitle.string = this.context.title || "标题";

		// content
		this.labelContent.string = this.context.content || "内容";

		// btnTexts
		let btnTexts: string[] = this.context.btnTexts || [];
		for (let i = 0; i < 2; i++) {
			let button: ScaleableButton = this["button" + (i + 1)];
			// cc.log("button", i, button);
			let label = button.node.getComponentInChildren(cc.Label);
			let btnText = btnTexts[i];

			if (btnText != null) {
				label.string = btnTexts[i];
			} else {
				button.node.active = false;
			}
		}

		// buttonClose
		this.buttonClose.node.active = false;

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

	isClickShadowClose() {
		return this.context.btnTexts.length <= 0;
	}

	onOpenDialogCompleted () {
        super.onOpenDialogCompleted();
    }








	////// 内部逻辑 /////
	private triggerCallback(index): void {
		let callbacks = this.context.callbacks || [];
		let callback = callbacks[index];

		if (callback == null || !callback()) {
			this.closeDialog();
		}
	}










	////// 事件 /////
	// @view export events begin
	onTouchButton1(e: EventTouchEx): void {
		if (!e.isClick()) return;
		
		this.triggerCallback(0);
	}

	onTouchButton2(e: EventTouchEx): void {
		if (!e.isClick()) return;

        this.triggerCallback(1);
	}

	onTouchButton3(e: EventTouchEx): void {
		if (!e.isClick()) return;

		this.triggerCallback(2);
	}

	onTouchButtonClose(e: EventTouchEx): void {
		if (!e.isClick()) return;

		this.closeDialog();
	}
	// @view export events end










}


