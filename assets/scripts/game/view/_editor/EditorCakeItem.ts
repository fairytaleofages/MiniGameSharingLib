import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import SceneBase from './../../../ulframework/view/SceneBase';
import { CakePartType } from "../../Const";
import ReuseList from "../../../ulframework/view/ReuseList";
import mgrCfg from './../../manager/mgrCfg';
import mgrCake from './../../manager/mgrCake';
import Tools from './../../../ulframework/utils/Tools';
import mgrTip from './../../manager/mgrTip';
import ReuseLayouterVBox from "../../../ulframework/view/ReuseLayouterVBox";
import vAvatar from "../node/vAvatar";
import EditorTransformController from "./EditorTransformController";
import ResourceNode from './../../../ulframework/view/ResourceNode';

const { ccclass, property } = cc._decorator;

@ccclass
export default class EditorCakeItem extends SceneBase {
	// @view export resources begin
	protected _getResourceName() { return "_editor/EditorCakeItem"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonBody: {
				varname: "buttonBody",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonBody" }],
			},
			CC_buttonDecoSelectOneBody: {
				varname: "buttonDecoSelectOneBody",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonDecoSelectOneBody" }],
			},
			CC_buttonFirstLayerBodySelect: {
				varname: "buttonFirstLayerBodySelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonFirstLayerBodySelect" }],
			},
			CC_buttonFirstLayerDecoSelect: {
				varname: "buttonFirstLayerDecoSelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonFirstLayerDecoSelect" }],
			},
			CC_buttonFirstLayerOrnamentSelect: {
				varname: "buttonFirstLayerOrnamentSelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonFirstLayerOrnamentSelect" }],
			},
			CC_buttonFirstLayerPlateSelect: {
				varname: "buttonFirstLayerPlateSelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonFirstLayerPlateSelect" }],
			},
			CC_buttonFirstLayerSideSelect: {
				varname: "buttonFirstLayerSideSelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonFirstLayerSideSelect" }],
			},
			CC_buttonFirstLayerTopSelect: {
				varname: "buttonFirstLayerTopSelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonFirstLayerTopSelect" }],
			},
			CC_buttonInside: {
				varname: "buttonInside",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonInside" }],
			},
			CC_buttonInsideDeco: {
				varname: "buttonInsideDeco",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonInsideDeco" }],
			},
			CC_buttonOrnament: {
				varname: "buttonOrnament",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonOrnament" }],
			},
			CC_buttonOrnamentSelectOneBody: {
				varname: "buttonOrnamentSelectOneBody",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonOrnamentSelectOneBody" }],
			},
			CC_buttonPlate: {
				varname: "buttonPlate",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonPlate" }],
			},
			CC_buttonPlateSelectOneBody: {
				varname: "buttonPlateSelectOneBody",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonPlateSelectOneBody" }],
			},
			CC_buttonSecondLayerBodySelect: {
				varname: "buttonSecondLayerBodySelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSecondLayerBodySelect" }],
			},
			CC_buttonSecondLayerSideSelect: {
				varname: "buttonSecondLayerSideSelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSecondLayerSideSelect" }],
			},
			CC_buttonSecondLayerTopSelect: {
				varname: "buttonSecondLayerTopSelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSecondLayerTopSelect" }],
			},
			CC_buttonSideSelectOneBody: {
				varname: "buttonSideSelectOneBody",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSideSelectOneBody" }],
			},
			CC_buttonThirdLayerBodySelect: {
				varname: "buttonThirdLayerBodySelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonThirdLayerBodySelect" }],
			},
			CC_buttonThirdLayerSideSelect: {
				varname: "buttonThirdLayerSideSelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonThirdLayerSideSelect" }],
			},
			CC_buttonThirdLayerTopSelect: {
				varname: "buttonThirdLayerTopSelect",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonThirdLayerTopSelect" }],
			},
			CC_buttonTop: {
				varname: "buttonTop",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonTop" }],
			},
			CC_buttonTopSelectOneBody: {
				varname: "buttonTopSelectOneBody",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonTopSelectOneBody" }],
			},
			CC_labelTitle: { varname: "labelTitle", vartype: cc.Label },
			CC_nodeBg: { varname: "nodeBg", vartype: cc.Node },
			CC_nodeBodyOperation: { varname: "nodeBodyOperation", vartype: cc.Node },
			CC_nodeDecoOperation: { varname: "nodeDecoOperation", vartype: cc.Node },
			CC_nodeEditorControllerParent: { varname: "nodeEditorControllerParent", vartype: cc.Node },
			CC_nodeList: { varname: "nodeList", vartype: cc.Node },
			CC_nodeOrnamentOperation: { varname: "nodeOrnamentOperation", vartype: cc.Node },
			CC_nodePlateOperation: { varname: "nodePlateOperation", vartype: cc.Node },
			CC_nodeRoot: { varname: "nodeRoot", vartype: cc.Node },
			CC_nodeSideOperation: { varname: "nodeSideOperation", vartype: cc.Node },
			CC_nodeTopOperation: { varname: "nodeTopOperation", vartype: cc.Node },
			CC_nodeTrash: { varname: "nodeTrash", vartype: cc.Node },
		};
	}
	protected buttonBody: ScaleableButton = null;
	protected buttonDecoSelectOneBody: ScaleableButton = null;
	protected buttonFirstLayerBodySelect: ScaleableButton = null;
	protected buttonFirstLayerDecoSelect: ScaleableButton = null;
	protected buttonFirstLayerOrnamentSelect: ScaleableButton = null;
	protected buttonFirstLayerPlateSelect: ScaleableButton = null;
	protected buttonFirstLayerSideSelect: ScaleableButton = null;
	protected buttonFirstLayerTopSelect: ScaleableButton = null;
	protected buttonInside: ScaleableButton = null;
	protected buttonInsideDeco: ScaleableButton = null;
	protected buttonOrnament: ScaleableButton = null;
	protected buttonOrnamentSelectOneBody: ScaleableButton = null;
	protected buttonPlate: ScaleableButton = null;
	protected buttonPlateSelectOneBody: ScaleableButton = null;
	protected buttonSecondLayerBodySelect: ScaleableButton = null;
	protected buttonSecondLayerSideSelect: ScaleableButton = null;
	protected buttonSecondLayerTopSelect: ScaleableButton = null;
	protected buttonSideSelectOneBody: ScaleableButton = null;
	protected buttonThirdLayerBodySelect: ScaleableButton = null;
	protected buttonThirdLayerSideSelect: ScaleableButton = null;
	protected buttonThirdLayerTopSelect: ScaleableButton = null;
	protected buttonTop: ScaleableButton = null;
	protected buttonTopSelectOneBody: ScaleableButton = null;
	protected labelTitle: cc.Label = null;
	protected nodeBg: cc.Node = null;
	protected nodeBodyOperation: cc.Node = null;
	protected nodeDecoOperation: cc.Node = null;
	protected nodeEditorControllerParent: cc.Node = null;
	protected nodeList: cc.Node = null;
	protected nodeOrnamentOperation: cc.Node = null;
	protected nodePlateOperation: cc.Node = null;
	protected nodeRoot: cc.Node = null;
	protected nodeSideOperation: cc.Node = null;
	protected nodeTopOperation: cc.Node = null;
	protected nodeTrash: cc.Node = null;
	// @view export resources end
	/**选中的类型 */
	private curSelectedType: CakePartType = CakePartType.body
	private curSelectedPartId: number = null

	private listParts: ReuseList = null

	private viewAvatar: vAvatar = null

	private editController: EditorTransformController = null



	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		this.buildUi()
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
		this.viewAvatar = new vAvatar();
		this.viewAvatar.parent = this.nodeRoot
		this.viewAvatar.setTouchNodeCallback(this.onTouchRes.bind(this));

		this.editController = new EditorTransformController()
		this.editController.parent = this.nodeEditorControllerParent

		let layouterG = new ReuseLayouterVBox()
			.setCellSize(200, 60)
			.setGap(10)
			.setPending(10)
		let reuseList = new ReuseList()
		reuseList.parent = this.nodeList;
		reuseList.setContentSize(this.nodeList.getContentSize());
		reuseList.setLayouter(layouterG);
		reuseList.setCreator((cell) => {
			let node = new cc.Node()
			let font = node.addComponent(cc.Label)
			font.fontSize = 24

			node.parent = cell
			cell.item = node

			Tools.registerTouchHandler(cell, (e: EventTouchEx) => {
				if (!e.isClick()) return
				this.selectPart(cell.item.data.id)
			})
		});
		reuseList.setSetter((cell, data) => {
			let str = ul.format("%s", mgrCfg.get_from_cake_part_db(data.id, "name"));
			(cell.item as cc.Node).getComponent(cc.Label).string = str
			cell.item.materialData = data;
			(cell.item as cc.Node).color = this.curSelectedPartId == data.id ? cc.color(0, 255, 0) : cc.color(255, 255, 255)
			cell.item.data = data
		});
		this.listParts = reuseList;
	}

	private fillPartListByType(type: CakePartType) {
		this.curSelectedType = type
		//显示部件列表
		let datas = mgrCake.getPartsByType(type)
		this.listParts.setDatas(datas)
	}


	private selectPart(partId: number) {
		this.curSelectedPartId = partId

		let partData = mgrCfg.get_from_cake_part_db(partId)


		this.nodeBodyOperation.active = partData.type == CakePartType.body
		this.nodeSideOperation.active = partData.type == CakePartType.side
		this.nodeDecoOperation.active = partData.type == CakePartType.sideDeco
		this.nodeTopOperation.active = partData.type == CakePartType.top
		this.nodeOrnamentOperation.active = partData.type == CakePartType.ornament
		this.nodePlateOperation.active = partData.type == CakePartType.plate

		this.listParts.refreshActiveCells()

		this.setPrePartId(0)
		this.viewAvatar.takeOffAll()
		this.viewAvatar.replace(partId)
	}

	__operate_body_showShapePicker(layer) {
		let shapes = mgrCake.getShapesByType(this.curSelectedType)
		let config = []
		for (let index = 0; index < shapes.length; index++) {
			const shapeType = shapes[index];
			let shapeName = mgrCake.getShapeName(this.curSelectedType, shapeType)
			config.push({
				text: shapeName,
				value: {
					layer: layer,
					shape: shapeType
				}
			})
		}

		mgrTip.showPicker('选中一个形状', config, (value) => {
			this.__operate_body_SelectOneShape(value)
		})
	}

	__operate_body_SelectOneShape(value: { layer: number, shape: number }) {
		let colors = mgrCake.getColorsByTypeShapeType(this.curSelectedType, value.shape)
		let config = []
		for (let index = 0; index < colors.length; index++) {
			const element = colors[index];
			config.push({
				text: element.colorName,
				value: {
					layer: value.layer,
					shape: value.shape,
					color: element.colorId,
				}
			})
		}

		mgrTip.showPicker('选中一个颜色', config, (value) => {
			this.__operate_body_SelectOneColor(value)
		})
	}

	__operate_body_SelectOneColor(value: { layer: number, shape: number, color: number }) {
		cc.log("@@@:__operate_body_SelectOneColor")
		//将数据更新的editdata
		let data = mgrCfg.get_from_cake_part_db(this.curSelectedPartId)
		let resInfo = mgrCake.getRestByType_ShapeType_Color(this.curSelectedType, value.shape, value.color)

		// cc.log(data["editorData"])
		//所有的部件都会有一个前置id , 糕体的前置id就是0, 其他的就是糕体
		let preBodyId = this.getPreBodyId(this.curSelectedPartId)
		// 不同的层对应不同的层级  如果层相同 那么将会替换旧的
		let typeData = mgrCfg.get_from_cake_type_db(this.curSelectedType)
		cc.log(typeData.defaultIndexs)
		let zIndex = typeData.defaultIndexs[value.layer - 1]

		let editorData = data["editorData"][preBodyId] || []

		for (let index = 0; index < editorData.length; index++) {
			const element = editorData[index];
			if (element.zIndex == zIndex) {
				editorData.splice(index, 1)
				break
			}
		}

		editorData.push(
			{
				resType: resInfo.resType,
				resId: resInfo.resId,
				pos: cc.v2(0, 0),
				zIndex: zIndex,
				scale: 1,
			}
		)

		data["editorData"][preBodyId] = editorData

		// cc.log(data["editorData"])
		this.viewAvatar.takeOffAll()

		this.viewAvatar.replace(preBodyId)
		this.viewAvatar.setOpacityExByPartId(180, preBodyId)
		this.viewAvatar.offResNodeTouByPartId(preBodyId)

		this.viewAvatar.replace(this.curSelectedPartId)
	}

	getPreBodyId(partId:number){
		let partData = mgrCfg.get_from_cake_part_db(partId)
		let partTypeData = mgrCfg.get_from_cake_type_db(partData.type)
		if (partTypeData.prePartType == 0){
			return 0
		}
		else{
			return this.getPrePartId()
		}
	}

	onTouchRes(e: EventTouchEx) {
		let target: ResourceNode = e.target

		//只有当前选中部件可以操作, 避免误操作
		if(!(target && target["__partId"] == this.curSelectedPartId)) return

		//保存当前需要修改的数据的序号
		let data = mgrCfg.get_from_cake_part_db(this.curSelectedPartId)
		let modifyKey = 1
		/**所有非当前修改zIndex */
		let zIndexs: { [zIndex: number]: number } = {}
		let preBodyId = this.getPreBodyId(this.curSelectedPartId)
		let editorData = data["editorData"][preBodyId] || []

		for (let index = 0; index < editorData.length; index++) {
			const element = editorData[index];
			if (element.resType == target.resType && element.resId == target.resId && element.zIndex == target.zIndex) {
				modifyKey = index
			}
			if (element.zIndex != modifyKey){
				zIndexs[element.zIndex] = element.zIndex
			}
		}
		if (Tools.isWorldInLocalNode(this.nodeTrash, target.convertToWorldSpaceAR(cc.v2(0, 0)))) {
			//拖放到垃圾箱
			editorData.splice(modifyKey, 1)
			this.viewAvatar.takeOffAll()
			this.viewAvatar.replace(this.curSelectedPartId)
		}
		else {
			target.setPosition(target.parent.convertToNodeSpaceAR(e.getLocation()));

			//先更新拖动数据
			// cc.log(data["editorData"])
			let modifyElement = editorData[modifyKey]
			modifyElement.pos = target.position
			modifyElement.scale = target.scale
			modifyElement.zIndex = target.zIndex

			this.editController.setTarget(target, () => {
				if (zIndexs[target.zIndex] != null) {
					mgrTip.showMsgTip("出错啦, 层级重复, 快检查一下吧")
					return
				}
				let modifyElement = editorData[modifyKey]
				modifyElement.pos = target.position
				modifyElement.scale = target.scale
				modifyElement.zIndex = target.zIndex
			})
		}

	}

	showBodyPicker(){
		let config: { text: string, value: any }[] = []
		let parts = mgrCake.getPartsByType(CakePartType.body)
		for (let index = 0; index < parts.length; index++) {
			const part = parts[index];
			config.push({
				text: part.name,
				value: part.id,
			})
		}

		mgrTip.showPicker("选一个糕体吧", config, (partId) => {
			this.setPrePartId(partId)
			this.viewAvatar.replace(partId)
			this.viewAvatar.setOpacityExByPartId(180, partId)
			this.viewAvatar.offResNodeTouByPartId(partId)
		})
	}

	private prePartId: number = 0
	setPrePartId(partId){
		this.prePartId = partId
	}

	getPrePartId(){
		return this.prePartId
	}




	////// 事件 /////
	// @view export events begin
	onTouchButtonBody(e: EventTouchEx): void {
		this.fillPartListByType(CakePartType.body)
	}

	onTouchButtonInside(e: EventTouchEx): void {
		this.fillPartListByType(CakePartType.side)
	}

	onTouchButtonInsideDeco(e: EventTouchEx): void {
		this.fillPartListByType(CakePartType.sideDeco)
	}

	onTouchButtonOrnament(e: EventTouchEx): void {
		this.fillPartListByType(CakePartType.ornament)
	}

	onTouchButtonPlate(e: EventTouchEx): void {
		this.fillPartListByType(CakePartType.plate)
	}

	onTouchButtonTop(e: EventTouchEx): void {
		this.fillPartListByType(CakePartType.top)
	}

	///// 操作蛋糕糕体 /////
	onTouchButtonFirstLayerBodySelect(e: EventTouchEx): void {
		if (!e.isClick()) return

		this.__operate_body_showShapePicker(1)
	}

	onTouchButtonSecondLayerBodySelect(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.__operate_body_showShapePicker(2)
	}

	onTouchButtonThirdLayerBodySelect(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.__operate_body_showShapePicker(3)
	}

	
	////编辑纹理的操作 /////////////////
	onTouchButtonSideSelectOneBody(e: EventTouchEx): void {
		if (!e.isClick()) return

		this.showBodyPicker()
	}

	onTouchButtonFirstLayerSideSelect(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.__operate_body_showShapePicker(1)
	}

	onTouchButtonSecondLayerSideSelect(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.__operate_body_showShapePicker(2)
	}

	onTouchButtonThirdLayerSideSelect(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.__operate_body_showShapePicker(3)
	}

	/// 编辑顶部相关操作///
	onTouchButtonTopSelectOneBody(e: EventTouchEx): void {
		if (!e.isClick()) return

		this.showBodyPicker()
	}

	onTouchButtonFirstLayerTopSelect(e: EventTouchEx): void {
		if (!e.isClick()) return

		this.__operate_body_showShapePicker(1)
	}

	onTouchButtonSecondLayerTopSelect(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.__operate_body_showShapePicker(2)
	}

	onTouchButtonThirdLayerTopSelect(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.__operate_body_showShapePicker(3)
	}

	//边花 ///
	onTouchButtonDecoSelectOneBody(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.showBodyPicker()
	}
	onTouchButtonFirstLayerDecoSelect(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.__operate_body_showShapePicker(1)
	}

	//摆件//
	onTouchButtonOrnamentSelectOneBody(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.showBodyPicker()
	}
	onTouchButtonFirstLayerOrnamentSelect(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.__operate_body_showShapePicker(1)
	}

	//盘子//
	onTouchButtonPlateSelectOneBody(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.showBodyPicker()
	}
	onTouchButtonFirstLayerPlateSelect(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.__operate_body_showShapePicker(1)
	}
	// @view export events end










}











