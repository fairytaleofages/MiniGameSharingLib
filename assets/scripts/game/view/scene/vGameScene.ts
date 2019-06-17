import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import SceneBase from "../../../ulframework/view/SceneBase";
import mgrDirector from "../../manager/mgrDirector";
import mgrCfg from './../../manager/mgrCfg';
import ReuseLayouterHGrid from './../../../ulframework/view/ReuseLayouterHGrid';
import ReuseList from "../../../ulframework/view/ReuseList";
import Tools from "../../../ulframework/utils/Tools";
import vGamePartIcon from "../node/vGamePartIcon";
import FSMSceneBase from './../../../ulframework/view/FSMSceneBase';
import vGameCustomer from "../node/vGameCustomer";
import { CakePartType, AdMode } from "../../Const";
import mgrPlayer from "../../manager/mgrPlayer";
import mgrTip from './../../manager/mgrTip';
import { timer } from "../../../ulsdkdemo/sdktools/sdkdemotools";
import Timer from './../../../ulframework/utils/Timer';
import ReuseLayouterVGrid from "../../../ulframework/view/ReuseLayouterVGrid";
import vAvatar from "../node/vAvatar";
import mgrStage from "../../manager/mgrStage";
import vGameSettlementDialog from './../dialog/vGameSettlementDialog';
import mgrCake from './../../manager/mgrCake';
import mgrSdk from './../../manager/mgrSdk';
import singlePageReuseList from './../node/singlePageReuseList';
import vAdTryDialog from './../../../../../temp/BackupAssets/assets/scripts/game/view/dialog/vAdTryDialog';
import mgrGuide from './../../manager/mgrGuide';
import mgrSound from './../../manager/mgrSound';
import DialogBase from './../../../ulframework/view/DialogBase';
import vHubScene from './vHubScene';
import vGameShowingPartIcon from "../node/vGameShowingPartIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vGameScene extends FSMSceneBase {
	// @view export resources begin
	protected _getResourceName() { return "scene/vGameScene"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonBack: {
				varname: "buttonBack",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonBack" }],
			},
			CC_labelCustomerCount: { varname: "labelCustomerCount", vartype: cc.Label },
			CC_labelScore: { varname: "labelScore", vartype: cc.Label },
			CC_labelTime: { varname: "labelTime", vartype: cc.Label },
			CC_labelWatting: { varname: "labelWatting", vartype: cc.Label },
			CC_nodeAvatar: { varname: "nodeAvatar", vartype: cc.Node },
			CC_nodeCustomer: { varname: "nodeCustomer", vartype: cc.Node },
			CC_nodeLeftTop: { varname: "nodeLeftTop", vartype: cc.Node },
			CC_nodeList: { varname: "nodeList", vartype: cc.Node },
			CC_nodeOperationCheck: { varname: "nodeOperationCheck", vartype: cc.Node },
			CC_nodeStars: { varname: "nodeStars", vartype: cc.Node },
			CC_nodeTop: { varname: "nodeTop", vartype: cc.Node },
			CC_nodeType1: { varname: "nodeType1", vartype: cc.Node },
			CC_nodeType2: { varname: "nodeType2", vartype: cc.Node },
			CC_nodeType3: { varname: "nodeType3", vartype: cc.Node },
			CC_nodeType4: { varname: "nodeType4", vartype: cc.Node },
			CC_nodeType5: { varname: "nodeType5", vartype: cc.Node },
			CC_nodeType6: { varname: "nodeType6", vartype: cc.Node },
			CC_progressBarStar1: { varname: "progressBarStar1", vartype: cc.ProgressBar },
			CC_progressBarStar2: { varname: "progressBarStar2", vartype: cc.ProgressBar },
			CC_progressBarStar3: { varname: "progressBarStar3", vartype: cc.ProgressBar },
			CC_progressBarTime: { varname: "progressBarTime", vartype: cc.ProgressBar },
		};
	}
	protected buttonBack: ScaleableButton = null;
	protected labelCustomerCount: cc.Label = null;
	protected labelScore: cc.Label = null;
	protected labelTime: cc.Label = null;
	protected labelWatting: cc.Label = null;
	protected nodeAvatar: cc.Node = null;
	protected nodeCustomer: cc.Node = null;
	protected nodeLeftTop: cc.Node = null;
	protected nodeList: cc.Node = null;
	protected nodeOperationCheck: cc.Node = null;
	protected nodeStars: cc.Node = null;
	protected nodeTop: cc.Node = null;
	protected nodeType1: cc.Node = null;
	protected nodeType2: cc.Node = null;
	protected nodeType3: cc.Node = null;
	protected nodeType4: cc.Node = null;
	protected nodeType5: cc.Node = null;
	protected nodeType6: cc.Node = null;
	protected progressBarStar1: cc.ProgressBar = null;
	protected progressBarStar2: cc.ProgressBar = null;
	protected progressBarStar3: cc.ProgressBar = null;
	protected progressBarTime: cc.ProgressBar = null;
	// @view export resources end
	private listParts: ReuseList = null
	private viewAvatar: vAvatar = null


	private ST_ENTER = 1
	private ST_GAME_GENERATE_CUSTOMER = 2
	private ST_SELECT_PART = 3
	private ST_WAITTING = 4
	private ST_PALYING_ANIMATION = 5
	private ST_SETTLEMENT = 6

	/**等待队伍中的客人id */
	private queueCustomerIds: number[] = []
	/**必须要的部件id */
	private mustExistPartIds: number[] = []
	/**处理中的客人 */
	private activeCustomers: vGameCustomer[] = []
	/**已完成的客人id */
	private completeCustomerIds: number[] = []
	/**正在处理的客人 */
	private processingCustomer: vGameCustomer = null
	/**本关试用部件 */
	private curTryPartIds: { [partId: number]: boolean } = []

	private score: number = 0

	private remainTime: number = 0
	private maxTime: number = 0
	private starCalcTime: number[] = null

	private GAME_STATE_RUNING = 1
	private GAME_STATE_END = 2
	private gameState = this.GAME_STATE_RUNING


	////// 生命周期 /////
	onLoad() {
		super.onLoad();
		mgrSound.play(2)
	}

	onResourceLoaded() {
        super.onResourceLoaded();
        
        this.uiFadeIn();
		this.buildUi();

		this.fillData()

		this.registerAllState()
		this.setNextState(this.ST_ENTER)

		this.tryRecordVideo()

		this.registerListeners({
			MSG_TRY_SUCCESSFUL: this.onMsgTrySuccessful,
		})

		this.registerListeners({
			MSG_ITEM_AMOUNT_CHANGED: this.onMsgItemAmountChanged
		})

		mgrGuide.registerGuideNode("vGameScene.nodeAvatar", this.nodeAvatar)
	}

	start() {
		super.start();
	}

	update(dt: number) {
		super.update(dt);

		if (!this.isResourceLoaded()) return
		if (DialogBase.hasDialogExists()) return
		if (this.gameState == this.GAME_STATE_END) return
		if(this.context.stageId > 1) this.remainTime -= dt
		
		if (this.remainTime <= 0) {
			this.gameState = this.GAME_STATE_END
			cc.log("hubsceneupdate: this.ST_SETTLEMENT")
			this.setNextState(this.ST_SETTLEMENT)
		}

		let persent = this.remainTime / this.maxTime
		this.progressBarTime.progress = persent
		this.labelTime.string = Tools.formatTime(this.remainTime, "%M:%S")

		let stageData = mgrCfg.get_from_stage_db(this.context.stageId)

		if (stageData["script"].isShowStar()) {
			this.nodeStars.active = true
			let filed1 = this.starCalcTime[0]
			let filed2 = this.starCalcTime[1]

			this.progressBarStar1.progress = persent > filed2 ? 1 : (persent > filed1 ? 1 : persent / filed1)
			this.progressBarStar2.progress = persent > filed2 ? 1 : (persent > filed1 ? (persent - filed1) / (filed2 - filed1) : 0)
			this.progressBarStar3.progress = persent > filed2 ? (persent - filed2) / (1 - filed2) : 0

			this.labelCustomerCount.string = ul.format("剩余顾客: %d", this.queueCustomerIds.length)
		}
		else {
			this.nodeStars.active = false

			this.labelCustomerCount.string = "剩余顾客: ∞"
		}
		if (stageData["script"].isShowScore()) {
			this.labelScore.node.active = true
			this.labelScore.string = ul.format("当前分数：%d", this.score);
		}
		else {
			this.labelScore.node.active = false
		}
	}

	onDestroy() {
		super.onDestroy();
	}

	/**注册所有状态 */
	registerAllState() {
		this.registerState(this.ST_ENTER, "__st_enter_enter", "__st_enter_execute", "__enter_leave");
		this.registerState(this.ST_GAME_GENERATE_CUSTOMER, "__st_generate_customer_enter", "__st_generate_customer_execute", "__generate_customer_leave");
		this.registerState(this.ST_SELECT_PART, "__st_select_part_enter", "__st_select_part_execute", "__select_part_leave");
		this.registerState(this.ST_WAITTING, "__st_waitting_enter", "__st_waitting_execute", "__waitting_leave");
		this.registerState(this.ST_PALYING_ANIMATION, "__st_playing_animation_enter", "__st_playing_animation_execute", "__playing_animation_leave");
		this.registerState(this.ST_SETTLEMENT, "__st_settlement_enter", "__st_settlement_execute", "__settlement_leave");
	}


	////// 内部逻辑 /////
	private tryRecordVideo() {
		if (mgrSdk.isOpenVideoRecord()) {
			mgrSdk.recordGameVideo("start", 120)
		}
    }
    
    private uiFadeIn() {
        this.nodeTop.y = mgrDirector.height / 2;
        this.nodeLeftTop.x = -mgrDirector.width / 2;
        this.nodeLeftTop.y = mgrDirector.height / 2;

        // 刘海屏
        if ( mgrDirector.isDeviceOverHeight() ) {
            this.nodeTop.y = mgrDirector.height / 2 - 50;
            // this.nodeLeftTop.y = mgrDirector.height / 2 - 50;
		}
	}

	private buildUi() {
		if (mgrDirector.isDeviceOverHeight()) {
			this.nodeTop.y = mgrDirector.height / 2 - 50
		}

		this.viewAvatar = new vAvatar()
		this.viewAvatar.parent = this.nodeAvatar
		//先显示类型列表
		for (let i = 1; i <= 6; i++) {
			let node = this["nodeType" + i.toString()];
			let icon = (node as cc.Node).getChildByName("icon").getComponent(cc.Sprite);
			let typeData = mgrCfg.get_from_cake_type_db(i)
			icon.loadSpriteFrameAndKeepSize(typeData.icon)

			Tools.registerTouchHandler(node, (e: EventTouchEx) => {
				if (!e.isClick()) return
				// this.selectPartType(i);
			})
		}
		//列表
		let layouterG = new ReuseLayouterVGrid()
			.setCellSize(85, 105)
			.setGap(20, 0)
			.setCols(5)
			.setPending(15)
		let reuseList = new ReuseList()
		reuseList.parent = this.nodeList;
		reuseList.setContentSize(this.nodeList.getContentSize());
		reuseList.setLayouter(layouterG);
		reuseList.setCreator((cell) => {
			let item = new vGamePartIcon({
				fOnClick: this.selectPart.bind(this),
			});
			item.parent = cell
			cell.item = item
		});
		reuseList.setSetter((cell, data) => {
			let item: vGamePartIcon = cell.item

			let stageData = mgrCfg.get_from_stage_db(this.context.stageId)
			item.fillByPartId(data, !!this.curTryPartIds[data] || stageData["script"].isPartDefaultOpen())

			if (data == 60001) {
				if (mgrStage.getStageProgress() == 0) {
					mgrGuide.registerGuideNode("vGameScene.nodeBody", cell)
					this.sendMsg("MSG_GUIDE_POINT", { id: "vGameScene.beginGameGuide" });
				}
			}
			// cc.log("@@ setter partId: ", data)
			if (data == 10001) {
				mgrGuide.registerGuideNode("vGameScene.nodeSide", cell)
			}
		});
		this.listParts = reuseList;
		this.listParts.setTouchScrollEnabled(false)
		// this.listParts.setDebugLineEnabled(true)
	}

	private fillData() {
		let stageData = mgrCfg.get_from_stage_db(this.context.stageId);
		this.remainTime = stageData.time
		this.maxTime = stageData.time
		this.starCalcTime = stageData.starCalcTime
	}


	__st_enter_enter() {
		//检出当前关卡的所有顾客
		let stageData = mgrCfg.get_from_stage_db(this.context.stageId)
		this.queueCustomerIds = stageData["script"].generateCustomerIds()
		this.setNextState(this.ST_GAME_GENERATE_CUSTOMER)
		this.mustExistPartIds = ul.clone(stageData.poolAd)
	}
	__st_enter_execute() { }
	__enter_leave() { }

	__st_generate_customer_enter() {
		//为当前游戏生成顾客, 先让顾客数量为1
		if (this.queueCustomerIds.length <= 0) {
			//顾客已经处理完毕, 进入结算
			this.setNextState(this.ST_SETTLEMENT)
		}
		else {
			let mustExistPartId: number = this.mustExistPartIds.length > 0 ? this.mustExistPartIds.splice(0, 1)[0] : null
			//在没有广告时, 不随机
			mustExistPartId = mgrSdk.getCopAdMode() == AdMode.none ? null : mustExistPartId
			let customerId = this.queueCustomerIds.splice(0, 1)[0]
			this.processingCustomer = new vGameCustomer({
				stageId: this.context.stageId,
				customerId: customerId,
				mustExistPartId: mustExistPartId,
			})
			this.processingCustomer.parent = this.nodeCustomer
			this.processingCustomer.moveToCenter(() => {
				this.setNextState(this.ST_SELECT_PART)
			})

		}
	}
	__st_generate_customer_execute() { }
	__generate_customer_leave() { }

	__st_select_part_enter() {
		if (!this.processingCustomer.isAllFinished()) {
			//显示部件选择
			this.nodeList.scale = 1;
            this.labelWatting.node.active = false;
            
			//读取当前需要选择的部件类型, 并选中, 并等待当前的部件完成
			let needSeletPartType = this.processingCustomer.getCurrentPartType()
			this.selectPartType(needSeletPartType)
			this.setNextState(this.ST_WAITTING)
		}
		else {
			//隐藏部件选择
			this.nodeList.scale = 0;
			this.labelWatting.node.active = true;


			//保存
			this.completeCustomerIds.push(this.processingCustomer.context.customerId)
			let partIds = this.viewAvatar.getPartIds()
			this.viewAvatar.takeOffAll()

			//创建一个新的蛋糕  飞过去
			let newViewAvatar = new vAvatar()
			newViewAvatar.parent = this.nodeAvatar
			newViewAvatar.replacePartIdArray(partIds)

			newViewAvatar.runAction(cc.sequence(
				cc.spawn(
					cc.moveTo(0.3, this.nodeAvatar.convertToNodeSpaceAR(this.processingCustomer.getAvatarWorldPos())),
					cc.scaleTo(0.3, 0.45 / 0.6),
				),
				// cc.fadeOut(0.1),
				cc.callFunc(() => {
					this.processingCustomer.moveToOut(() => {
						this.setNextState(this.ST_GAME_GENERATE_CUSTOMER)
						this.processingCustomer.destroy()
						this.processingCustomer = null
					})
				}),
				cc.removeSelf()
			))

			this.score += mgrCake.calcScoreByPartIds(partIds)

			this.labelScore.node.runAction(cc.sequence(
				cc.scaleTo(0.3, 0.9),
				cc.scaleTo(0.3, 1.1),
				cc.scaleTo(0.3, 1.0)
			))
		}
	}
	__st_select_part_execute() { }
	__select_part_leave() { }


	__st_waitting_enter() {
		//什么也不做, 等待用户输入
	}
	__st_waitting_execute() { }
	__waitting_leave() { }

	__st_playing_animation_enter() {
		//什么也不做, 等待动画播放完成
	}
	__st_playing_animation_execute() { }
	__playing_animation_leave() { }

	__st_settlement_enter() {
		let stageData = mgrCfg.get_from_stage_db(this.context.stageId)
		stageData["script"].finishGame({
			remainTime: this.remainTime,
			score: this.score,
			customerCount: this.completeCustomerIds.length,
			bAddition: this.context.bAddition,
		})
		this.gameState = this.GAME_STATE_END
	}
	__st_settlement_execute() {
		if (DialogBase.hasDialogExists()) return
		mgrDirector.enterScene("vHubScene", {
			bFromStage: true,
		})
	}
	__settlement_leave() { }
	///////////////////////////////////////////////


	private selectPartType(type: CakePartType) {
		for (let i = 1; i <= 6; i++) {
			let node: cc.Node = this["nodeType" + i.toString()];
			let seleted = node.getChildByName("selected")
			let normal = node.getChildByName("normal")

			seleted.active = i == type
			normal.active = i != type
			node.scaleX = i == type ? 1.1 : 1
			node.scaleY = i == type ? 1.15 : 1
		}
		//显示部件列表
		this.fillPartList(type)
	}

	private fillPartList(type: CakePartType) {
		let stageData = mgrCfg.get_from_stage_db(this.context.stageId);
		let pool: number[] = stageData["script"].pools[type]

		let _temp_pool: number[] = ul.clone(pool)
		if (_temp_pool.indexOf(this.processingCustomer.getCurrentPartId()) < 0) {
			_temp_pool.push(this.processingCustomer.getCurrentPartId())
		}
		//从池子里面挑出多余的 并且不是当前需要的部件
		while (_temp_pool.length > 10) {
			let randomIndex = Tools.random(0, _temp_pool.length - 1)
			if (_temp_pool[randomIndex] != this.processingCustomer.getCurrentPartId()) {
				_temp_pool.splice(randomIndex, 1)
			}
		}

		//需要随机打乱一下
		let newPartIds: number[] = []
		while (_temp_pool.length > 0) {
			// let randomIndex = Tools.random(0, _temp_pool.length - 1)
			// newPartIds.push(_temp_pool.splice(randomIndex, 1)[0])

			newPartIds.push(_temp_pool.splice(0, 1)[0])
		}



		this.listParts.setDatas(newPartIds)
	}


	private showingPartIcon: vGameShowingPartIcon = null
	private selectPart(e: EventTouchEx, partId: number) {
		//需要在等待用户输入时
		if (this.getState() != this.ST_WAITTING) return
		//避免切换状态的间隔时间内操作, 造成逻辑错误
		if (this.getNextState() && this.getNextState() != this.ST_WAITTING) return

		//是否可用
		let stageData = mgrCfg.get_from_stage_db(this.context.stageId)
		if (mgrPlayer.getItemAmount(partId) <= 0 && this.curTryPartIds[partId] == null && !stageData['script'].isPartDefaultOpen()) {
			if (!e.isClick()) return
			if (stageData.poolAd.indexOf(partId) < 0) {
				//金币购买
				mgrDirector.openDialog("vBuyItemDialog", {
					partId: partId
				})
			}
			else {
				//广告试用
				mgrDirector.openDialog("vAdTryDialog", {
					partId: partId
				})
			}
			return
		}
		//表现
		if (e.name == "began") {
			this.showingPartIcon = new vGameShowingPartIcon()
			this.showingPartIcon.fillByPartId(partId)
			this.showingPartIcon.parent = mgrTip.getTipIceNode();
			let originPos = this.showingPartIcon.parent.convertToNodeSpaceAR(e.getLocation())
			this.showingPartIcon.setPosition(originPos)
			this.showingPartIcon["__originPos"] = originPos
		}
		//避免未执行begin  就执行了end  || canclled
		if (!this.showingPartIcon) return

		if (e.name == "moved") {
			this.showingPartIcon.setPosition(this.showingPartIcon.parent.convertToNodeSpaceAR(e.getLocation()))
		}
		else if (e.name == "cancelled" || e.name == "ended") {
			if (Tools.isWorldInLocalNode(this.nodeOperationCheck, e.getLocation())) {
				if (this.processingCustomer.checkCurrentPartId(partId)) {
					//操作和验证成功
					//播放效果
					//使用临时变量(保证不会再下次创建时打乱本次)
					this.setNextState(this.ST_PALYING_ANIMATION)

					let tempNode = this.showingPartIcon
					this.showingPartIcon = null
					let destPos = tempNode.parent.convertToNodeSpaceAR(this.nodeAvatar.convertToWorldSpaceAR(cc.v2(0, 0)))
					tempNode.runAction(cc.sequence(
						cc.spawn(
							cc.moveTo(0.2, destPos),
							cc.fadeOut(0.2)
						),
						cc.callFunc(() => {
							this.processingCustomer.markCurrentPartId(partId)

							this.viewAvatar.replace(partId)
							tempNode.destroy()
							tempNode = null
							this.setNextState(this.ST_SELECT_PART)

							Timer.callLater(0.1,()=>{
								this.sendMsg("MSG_GUIDE_POINT", { id: "vGameScene.materialMake" });
							})
						})
					))
					return
				}
			}
			//取消
			//使用临时变量(保证不会再下次创建时打乱本次)
			let tempNode = this.showingPartIcon
			this.showingPartIcon = null

			tempNode.runAction(cc.sequence(
				cc.spawn(
					cc.moveTo(0.2, tempNode["__originPos"]),
					cc.fadeOut(0.2)
				),
				cc.callFunc(() => {
					tempNode.destroy()
					tempNode = null
				})
			))
		}
	}










	////// 事件 /////
	// @view export events begin
	onTouchButtonBack(e: EventTouchEx): void {
		if (!e.isClick()) return
		// cc.log("TODO vGameScene.onTouchButtonBack");
		mgrTip.alertPrompt2("提示", "提前退出不能获得本关奖励哦~", "退出", "取消", () => {
			mgrDirector.enterScene("vHubScene")
		})
	}

	// @view export events end


	onMsgTrySuccessful(e) {
		this.curTryPartIds[e.partId] = true
		this.listParts.refreshActiveCells()
	}


	onMsgItemAmountChanged() {
		this.listParts.refreshActiveCells()
	}




}







