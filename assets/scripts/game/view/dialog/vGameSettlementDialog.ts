import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import ReuseList from './../../../ulframework/view/ReuseList';
import ReuseLayouterHBox from './../../../ulframework/view/ReuseLayouterHBox';
import vGameSettlementItem from "../node/vGameSettlementItem";
import mgrStage, { TStageResult } from "../../manager/mgrStage";
import mgrDirector from './../../manager/mgrDirector';
import mgrAd from "../../manager/mgrAd";
import mgrSdk from './../../manager/mgrSdk';
import { AdMode } from "../../Const";
import mgrPlayer from './../../manager/mgrPlayer';
import mgrTip from './../../manager/mgrTip';
import mgrSound from "../../manager/mgrSound";
import Const from './../../Const';
import Timer from './../../../ulframework/utils/Timer';
import Tools from "../../../ulframework/utils/Tools";

const AD_ID_REWARD = "game_reward";
const { ccclass, property } = cc._decorator;

@ccclass
export default class vGameSettlementDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vGameSettlementDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonCarefulDouble: {
				varname: "buttonCarefulDouble",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonCarefulDouble" }],
			},
			CC_buttonCarefulSingle: {
				varname: "buttonCarefulSingle",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonCarefulSingle" }],
			},
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_buttonGetReleax: {
				varname: "buttonGetReleax",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonGetReleax" }],
			},
			CC_buttonNoAd: {
				varname: "buttonNoAd",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonNoAd" }],
			},
			CC_buttonShareVide: {
				varname: "buttonShareVide",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonShareVide" }],
			},
			CC_labelButtonSignReleax: { varname: "labelButtonSignReleax", vartype: cc.Label },
			CC_labelNpcWord: { varname: "labelNpcWord", vartype: cc.Label },
			CC_labelTipCareful: { varname: "labelTipCareful", vartype: cc.Label },
			CC_labelTipReleax: { varname: "labelTipReleax", vartype: cc.Label },
			CC_nodeAdIconReleax: { varname: "nodeAdIconReleax", vartype: cc.Node },
			CC_nodeCareful: { varname: "nodeCareful", vartype: cc.Node },
			CC_nodeGetReleax: { varname: "nodeGetReleax", vartype: cc.Node },
			CC_nodeList: { varname: "nodeList", vartype: cc.Node },
			CC_nodeNoAd: { varname: "nodeNoAd", vartype: cc.Node },
			CC_nodeProgress: { varname: "nodeProgress", vartype: cc.Node },
			CC_nodeReleax: { varname: "nodeReleax", vartype: cc.Node },
			CC_nodeShareVideoReward: { varname: "nodeShareVideoReward", vartype: cc.Node },
			CC_nodeStart1: { varname: "nodeStart1", vartype: cc.Node },
			CC_nodeStart2: { varname: "nodeStart2", vartype: cc.Node },
			CC_nodeStart3: { varname: "nodeStart3", vartype: cc.Node },
			CC_nodeToogleParent: { varname: "nodeToogleParent", vartype: cc.Node },
			CC_toggleDoubleReward: { varname: "toggleDoubleReward", vartype: cc.Toggle },
		};
	}
	protected buttonCarefulDouble: ScaleableButton = null;
	protected buttonCarefulSingle: ScaleableButton = null;
	protected buttonClose: ScaleableButton = null;
	protected buttonGetReleax: ScaleableButton = null;
	protected buttonNoAd: ScaleableButton = null;
	protected buttonShareVide: ScaleableButton = null;
	protected labelButtonSignReleax: cc.Label = null;
	protected labelNpcWord: cc.Label = null;
	protected labelTipCareful: cc.Label = null;
	protected labelTipReleax: cc.Label = null;
	protected nodeAdIconReleax: cc.Node = null;
	protected nodeCareful: cc.Node = null;
	protected nodeGetReleax: cc.Node = null;
	protected nodeList: cc.Node = null;
	protected nodeNoAd: cc.Node = null;
	protected nodeProgress: cc.Node = null;
	protected nodeReleax: cc.Node = null;
	protected nodeShareVideoReward: cc.Node = null;
	protected nodeStart1: cc.Node = null;
	protected nodeStart2: cc.Node = null;
	protected nodeStart3: cc.Node = null;
	protected nodeToogleParent: cc.Node = null;
	protected toggleDoubleReward: cc.Toggle = null;
	// @view export resources end
	private itemsReuseList: ReuseList = null

	private result: TStageResult = null

	private magnification: number = 1
	private bGetedReward: boolean = false


	////// 生命周期 /////
	onLoad() {
		super.onLoad();
		if (mgrSdk.isOpenVideoRecord()) {
			mgrSdk.recordGameVideo("stop")
		}

		mgrSound.play(103)
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		this.result = this.context.result
		this.bGetedReward = false

		this.buildUi()
		this.fillData()
		this.fillAd()

		this.registerListeners({
            MSG_AD_EVENT_SUCCESSD: this.onMsgAdEventSuccessd,
            MSG_SDK_SHARE_VIDEO_RESULT: this.onMsgSdkShareVideoResult,
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



	isClickShadowClose() {
		return false
	}

	onOpenDialogCompleted(){
		return
		let index = 0
		Timer.callLoop(0.1,(timer:Timer)=>{
			index ++
			mgrTip.playParticleOnce("blood_boom_01",Tools.random(50,mgrDirector.width-50),Tools.random(100,mgrDirector.height-100))
			if(index >= 15){
				timer.stop()
			}
		})
	}






	////// 内部逻辑 /////
	private buildUi() {
		//列表
		let layouterG = new ReuseLayouterHBox()
			.setCellSize(84, 84)
			.setGap(10)
			.setPending(10)
		let reuseList = new ReuseList()
		reuseList.parent = this.nodeList;
		reuseList.setContentSize(this.nodeList.getContentSize());
		reuseList.setLayouter(layouterG);
		reuseList.setCreator((cell) => {
			let item = new vGameSettlementItem();
			item.parent = cell
			cell.item = item
		});
		reuseList.setSetter((cell, data) => {
			let item: vGameSettlementItem = cell.item
			item.fillByItemId(data.itemId, data.amount)
		});
		this.itemsReuseList = reuseList;
		this.itemsReuseList.setTouchScrollEnabled(false)
	}

	private fillData() {
		//npc文本
		this.labelNpcWord.string = this.result.rating > 0 ? "你做的真的太棒了!" : "失败了真可惜"
		this.nodeStart1.active = this.result.rating >= 1
		this.nodeStart2.active = this.result.rating >= 2
		this.nodeStart3.active = this.result.rating >= 3
        this.buttonShareVide.node.active = mgrSdk.isOpenVideoRecord();
        this.nodeShareVideoReward.active = mgrPlayer.getItemAmount(Const.ITEM_ID_VIDEO_SHARE_COUNT) > 0;

		let datas = []
		if (this.result.rewardNum > 0) {
			datas.push({
				itemId: Const.ITEM_ID_GOLD,
				amount: this.result.rewardNum
			})
		}

		this.itemsReuseList.setDatas(datas)
		let [cur, max] = mgrStage.getPowerCountAndMax()
		this.nodeProgress.height = cur / max * (47 * 0.8)
	}

	private fillAd() {

		let bTriggered = mgrAd.preCheckCanTriggerAdEvent(AD_ID_REWARD);
		this.nodeNoAd.active = !bTriggered;
		this.nodeReleax.active = bTriggered && mgrSdk.getCopAdMode() == AdMode.releax;
		this.nodeCareful.active = bTriggered && mgrSdk.getCopAdMode() == AdMode.careful;

		//宽松模式
		this.toggleDoubleReward.node.on('toggle', this.refreshAdIcon.bind(this));
		this.refreshAdIcon();
		//严格模式  none

		this.labelTipReleax.string = "双倍奖励"
		this.labelTipCareful.string = "观看广告获得双倍奖励!"
		if (mgrStage.isPowerFull()) {
			this.magnification = 7
			this.labelTipReleax.string = "八倍奖励"
			this.labelTipCareful.string = "观看广告获得八倍奖励!"
		}
	}


	private refreshAdIcon() {
		let isChecked = this.toggleDoubleReward.isChecked;
		cc.log("refreshAdIcon isChecked : ", isChecked);
		this.nodeAdIconReleax.active = isChecked;
	}

	private tryCloseDialog() {
		if (this.bClosing) return;
		//给个提示/ 其实奖励早发了
		let datas = this.itemsReuseList.getDatas()
		for (let index = 0; index < datas.length; index++) {
			const element = datas[index];
			mgrTip.addGotItemTip(element.itemId, element.amount)
		}
		this.bGetedReward = true
		this.closeDialog()
	}




	////// 事件 /////
	// @view export events begin
	onTouchButtonClose(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.tryCloseDialog()
	}

	onTouchButtonCarefulDouble(e: EventTouchEx): void {
		if (!e.isClick()) return
		mgrAd.triggerAdEvent(AD_ID_REWARD, null, true)
	}

	onTouchButtonCarefulSingle(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.tryCloseDialog()
	}

	onTouchButtonNoAd(e: EventTouchEx): void {
		if (!e.isClick()) return
		this.tryCloseDialog()
	}

	onTouchButtonGetReleax(e: EventTouchEx): void {
		if (!e.isClick()) return
		if (this.toggleDoubleReward.isChecked) {
			mgrAd.triggerAdEvent(AD_ID_REWARD, null, true)
		}
		else {
			this.tryCloseDialog()
		}
	}

	onTouchButtonShareVide(e: EventTouchEx): void {
		if (!e.isClick()) return
		if (mgrSdk.isOpenVideoRecord()) {
			mgrSdk.shareGameVideo()
		}
	}
	// @view export events end


	onMsgAdEventSuccessd(e) {
		if (this.bGetedReward == true) return
		if (e.adEventId == AD_ID_REWARD) {
			let datas = this.itemsReuseList.getDatas()
			for (let index = 0; index < datas.length; index++) {
				const element = datas[index];
				mgrPlayer.addItemAmount(element.itemId, element.amount * this.magnification, "结算广告奖励")
				mgrTip.addGotItemTip(element.itemId, element.amount * (this.magnification + 1))
            }
            if ( this.magnification > 1 ) {
                mgrStage.cleanPowerCount()
            }
			this.bGetedReward = true
			this.closeDialog()
		}
	}

    onMsgSdkShareVideoResult (e) {
        let data = e;
        if ( data.isSuccess ) {
            this.buttonShareVide.node.active = false;
        } 
    }





}






