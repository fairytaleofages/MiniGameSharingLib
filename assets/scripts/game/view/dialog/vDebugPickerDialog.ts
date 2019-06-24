import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import ReuseList from "../../../ulframework/view/ReuseList";
import ReuseLayouterVBox from "../../../ulframework/view/ReuseLayouterVBox";
import LayerColor from "../node/LayerColor";
import Tools from "../../../ulframework/utils/Tools";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vDebugPickerDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vDebugPickerDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_labelTitle: { varname: "labelTitle", vartype: cc.Label },
			CC_layoutList: { varname: "layoutList", vartype: cc.Layout },
		};
	}
	protected labelTitle: cc.Label = null;
	protected layoutList: cc.Layout = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

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
	buildUi() {
		this.labelTitle.string = this.context.title;

		let layoutList = this.layoutList;

		let reuseList = new ReuseList();
		reuseList.setLayouter(new ReuseLayouterVBox()
			.setCellSize(390, 50)
			.setGap(4)
			.setPending(0));
		reuseList.setCreator((cell) => {
			let layerBg = new LayerColor(cc.color(0, 0, 0, 63));
			layerBg.parent = cell;
			layerBg.setContentSize(cell.getContentSize());

			let nodeLabel = new cc.Node();
			nodeLabel.parent = cell;

			let label = nodeLabel.addComponent(cc.Label);
			label.fontSize = 20;
			label.verticalAlign = cc.Label.VerticalAlign.CENTER;

			cell["label"] = label;

			Tools.registerTouchHandler(cell, (e) => {
				let cell = e.target;
				if (e.name == "began") {
					cell.label.node.color = cc.color(0, 255, 0)
				} else if (e.name == "ended" || e.name == "cancelled") {
					cell.label.node.color = cc.color(255, 255, 255)
				}

				if (e.isClick()) {
					cc.log("click", cell.data);

					let callback = this.context.callback;
					if (callback instanceof Function) {
						callback(cell.data.value);
						this.closeDialog(true);
					}
				}
			})
		});
		reuseList.setSetter((cell, data) => {
			// cc.log("setter", cell, data)
			cell["label"].string = data.text;
		});
		reuseList.parent = layoutList.node;
		reuseList.setContentSize(layoutList.node.getContentSize());

		let datas = this.context.conf;
		reuseList.setDatas(datas);
	}










	////// 事件 /////
	// @view export events begin
	// @view export events end










}