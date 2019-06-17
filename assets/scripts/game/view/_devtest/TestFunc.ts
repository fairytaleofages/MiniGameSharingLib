import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import SceneBase from "../../../ulframework/view/SceneBase";
import ReuseList from "../../../ulframework/view/ReuseList";
import ReuseLayouterVBox from "../../../ulframework/view/ReuseLayouterVBox";
import LayerColor from "../node/LayerColor";
import Tools from "../../../ulframework/utils/Tools";
import mgrCfg from "../../manager/mgrCfg";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestFunc extends SceneBase {
	// @view export resources begin
	protected _getResourceName() { return "_devtest/TestFunc"; }
	protected _getResourceBindingConfig() {
		return {
			CC_labelTitle: { varname: "labelTitle", vartype: cc.Label },
			CC_layoutBg: { varname: "layoutBg", vartype: cc.Layout },
			CC_layoutList: { varname: "layoutList", vartype: cc.Layout },
		};
	}
	protected labelTitle: cc.Label = null;
	protected layoutBg: cc.Layout = null;
	protected layoutList: cc.Layout = null;
	// @view export resources end

	reuseList: ReuseList = null









	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();


		let reuseList = new ReuseList()
		reuseList.parent = this.layoutList.node;
		reuseList.setLayouter(new ReuseLayouterVBox()
			.setCellSize(300 - 8, 50)
			.setGap(4)
			.setPending(4));
		reuseList.setCreator((cell) => {
			let layerBg = new LayerColor(cc.color(0, 0, 0, 63));
			layerBg.parent = cell;
			layerBg.setContentSize(cell.getContentSize());
			cell.layerBg = layerBg;

			let nodeLabel = new cc.Node();
			nodeLabel.parent = cell;
			let label = nodeLabel.addComponent(cc.Label);
			label.fontSize = 18;
			label.verticalAlign = cc.Label.VerticalAlign.CENTER;
			cell.label = label;

			Tools.registerTouchHandler(cell, (e) => {
				let cell = e.target;

				if (e.name == "ended") {
					// cc.log("click", cell.data);
					cell.data.func()
				}
			})
		});
		reuseList.setSetter((cell, data) => {
			// cc.log("setter", cell, data)
			cell.label.string = ul.format("%s", data.name);
		});
		reuseList.setContentSize(this.layoutList.node.getContentSize());

		let datas = [
			{
				name: "深度拷贝测试",
				func: ()=>{
					//数组
					let arr = [1,2,3,"abc","def", "__a"]
					cc.log("org,arr:",arr)
					let _arr = ul.clone(arr)
					cc.log(_arr)
					//对象
					let obj = {
						["abc"]:123,
						["123"]:"abc",
						[0]: 1,
						[1]: 1,
						[2]: 1,
						[3]: 1,
						[4]: 1,
					}
					cc.log("org,obj:",obj)
					let _obj = ul.clone(obj)
					cc.log(_obj)
				}
			}
		];
		reuseList.setDatas(datas);

		this.reuseList = reuseList;
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










	////// 事件 /////
	// @view export events begin
	// @view export events end










}