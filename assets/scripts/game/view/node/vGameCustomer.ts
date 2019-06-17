import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrTip from './../../manager/mgrTip';
import mgrCfg from './../../manager/mgrCfg';
import Spine from "../../../ulframework/view/Spine";
import vAvatar from "./vAvatar";
import mgrPool from './../../manager/mgrPool';
import Tools from './../../../ulframework/utils/Tools';
import { CakePartType } from "../../Const";
import mgrDirector from './../../manager/mgrDirector';
import vShowCakeDialog from './../dialog/vShowCakeDialog';

const { ccclass, property } = cc._decorator;

@ccclass
export default class vGameCustomer extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vGameCustomer"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonScale: {
				varname: "buttonScale",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonScale" }],
			},
			CC_nodeAvatar: { varname: "nodeAvatar", vartype: cc.Node },
			CC_nodeBubble: { varname: "nodeBubble", vartype: cc.Node },
			CC_nodeSpine: { varname: "nodeSpine", vartype: cc.Node },
		};
	}
	protected buttonScale: ScaleableButton = null;
	protected nodeAvatar: cc.Node = null;
	protected nodeBubble: cc.Node = null;
	protected nodeSpine: cc.Node = null;
	// @view export resources end

	private spine: Spine = null
	private viewAvatar: vAvatar = null
	private minCount = 4

	constructor(context) {
		super(context)
		this.setPosition(cc.v2(700, 0))
		this.init(this.context.stageId, this.context.mustExistPartId)
	}





	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.viewAvatar = new vAvatar()
		this.viewAvatar.parent = this.nodeAvatar
		this.nodeBubble.scale = 0
		this._refresh()

		if(this.context.needMoveToCenter){
			this.moveToCenter(this.context.moveToCenterCallback)
		}
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








	private finishedPartIds: number[] = []
	private needFinishPartIds: number[] = []

	////// 内部逻辑 /////
	/**
	 * 
	 * @param stageId 
	 * @param mustExistPartId  必须存在的部件
	 */
	private init(stageId: number, mustExistPartId: number) {
		//从关卡中随机出部件
		let stageData = mgrCfg.get_from_stage_db(stageId)

		this.needFinishPartIds = stageData["script"].generatePartIds(mustExistPartId)
		let orders = {
			[CakePartType.plate]: 1,
			[CakePartType.body]: 2,
			[CakePartType.sideDeco]: 3,
			[CakePartType.side]: 4,
			[CakePartType.top]: 5,
			[CakePartType.ornament]: 6,
		}
		this.needFinishPartIds =this.needFinishPartIds.sort((a,b)=>{
			let a_part_data = mgrCfg.get_from_cake_part_db(a)
			let a_order = orders[a_part_data.type]
			let b_part_data = mgrCfg.get_from_cake_part_db(b)
			let b_order = orders[b_part_data.type]
			if(a_order < b_order) return -1
			if(a_order == b_order) return 0
			if(a_order > b_order) return 1
		})
		for (let index = 0; index < this.needFinishPartIds.length; index++) {
			const partId = this.needFinishPartIds[index];
			cc.log(partId)
		}
	}

	private _refresh() {
		let customerId = this.context.customerId
		let customerData = mgrCfg.get_from_customer_db(customerId)
		if (this.spine) {
			mgrPool.put(this.spine)
			this.spine.removeFromParent()
			this.spine = null
		}
		this.spine = mgrPool.get("spine", customerData.spineId)
		this.spine.parent = this.nodeSpine
		this.spine.play("mov_3", true)


		this.viewAvatar.takeOffAll()
		this.viewAvatar.replacePartIdArray(this.needFinishPartIds)
	}


	///////////外部接口//////////////////
	/**
	 * 移动到等待
	 */
	public moveToWatting() {
		this.stopAllActions()
		this.runAction(cc.moveTo(0.5, cc.v2(300, 0)));
	}

	/**
	 * 移动到中央
	 */
	public moveToCenter(callback: () => void) {
		if(!this.isResourceLoaded()) {
			this.context.needMoveToCenter = true
			this.context.moveToCenterCallback = callback
			return
		}
		this.stopAllActions()
		this.runAction(
			cc.sequence(
				cc.moveTo(0.3, cc.v2(130, 0)),
				cc.callFunc(() => {
					this.nodeBubble.runAction(cc.scaleTo(0.3, 1, 1))
					callback()
				})
			)
		)
	}

	/**
	 * 不是我要得
	 */
	public playErrorAction() {
		this.spine.stopAllActions()
		this.spine.runAction(cc.sequence(
			cc.moveTo(0.1, -10, 0),
			cc.moveTo(0.1, 10, 0),
			cc.moveTo(0.1, -10, 0),
			cc.moveTo(0.1, 10, 0),
			cc.moveTo(0.1, 0, 0),
		))

		this.spine.play(["mov_1", "mov_3"], true)
	}

	/**
	 * 移动到外面
	 * @param finishCallback 
	 */
	public moveToOut(finishCallback: () => void) {
		this.stopAllActions()
		this.runAction(
			cc.sequence(
				cc.callFunc(() => {
					this.nodeBubble.runAction(cc.scaleTo(0.3, 1, 1))
				}),
				cc.delayTime(0.3),
				cc.moveTo(0.5, cc.v2(-1000, 0)),
				cc.callFunc(() => {
					finishCallback();
				})
			)
		)
		this.spine.play("mov_2")
	}

	//获取当前需要完成的部件id
	public getCurrentPartId() {
		if (this.needFinishPartIds.length > 0) {
			return this.needFinishPartIds[0]
		}
		return null
	}

	public getCurrentPartType() {
		let needFinishPartId = this.getCurrentPartId()
		if (needFinishPartId) {
			let partData = mgrCfg.get_from_cake_part_db(needFinishPartId)
			return partData.type
		}

		return null
	}

	//尝试完成当前的部件id
	public markCurrentPartId(partId) {
		let needFinishPartId = this.getCurrentPartId()
		if (needFinishPartId && partId == needFinishPartId) {
			this.needFinishPartIds.splice(this.needFinishPartIds.indexOf(partId), 1)
			this.finishedPartIds.push(partId)
			return true
		}

		return false
	}

	public checkCurrentPartId(partId) {
		let needFinishPartId = this.getCurrentPartId()
		if (needFinishPartId && partId == needFinishPartId) {
			return true
		}

		//摇个头
		//TODO播个音效
		this.playErrorAction()
		return false
	}

	//s是否全部完成
	public isAllFinished() {
		return this.needFinishPartIds.length <= 0
	}

	public getAvatarWorldPos() {
		return this.viewAvatar.convertToWorldSpaceAR(cc.v2(0, 0))
	}







	////// 事件 /////
	// @view export events begin
	onTouchButtonScale(e: EventTouchEx): void {
		if (!e.isClick()) return

		mgrDirector.openDialog("vShowCakeDialog", {
			partIds: this.viewAvatar.getPartIds()
		})
	}

	// @view export events end










}



