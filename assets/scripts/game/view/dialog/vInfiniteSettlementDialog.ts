import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrDirector from "../../manager/mgrDirector";
import vHubScene from "../scene/vHubScene";
import mgrRank from './../../manager/mgrRank';
import Const from "../../Const";
import mgrTip from './../../manager/mgrTip';
import mgrSdk from './../../manager/mgrSdk';
import mgrPlayer from "../../manager/mgrPlayer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vInfiniteSettlementDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vInfiniteSettlementDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonBack: {
				varname: "buttonBack",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonBack" }],
			},
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_buttonShare: {
				varname: "buttonShare",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonShare" }],
			},
			CC_labelCustomerCount: { varname: "labelCustomerCount", vartype: cc.Label },
			CC_labelHistoryMaxScore: { varname: "labelHistoryMaxScore", vartype: cc.Label },
			CC_labelNpcWord: { varname: "labelNpcWord", vartype: cc.Label },
			CC_labelScore: { varname: "labelScore", vartype: cc.Label },
			CC_nodeStart1: { varname: "nodeStart1", vartype: cc.Node },
			CC_nodeStart2: { varname: "nodeStart2", vartype: cc.Node },
			CC_nodeStart3: { varname: "nodeStart3", vartype: cc.Node },
		};
	}
	protected buttonBack: ScaleableButton = null;
	protected buttonClose: ScaleableButton = null;
	protected buttonShare: ScaleableButton = null;
	protected labelCustomerCount: cc.Label = null;
	protected labelHistoryMaxScore: cc.Label = null;
	protected labelNpcWord: cc.Label = null;
	protected labelScore: cc.Label = null;
	protected nodeStart1: cc.Node = null;
	protected nodeStart2: cc.Node = null;
	protected nodeStart3: cc.Node = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded()
		this.buttonShare.node.active = mgrSdk.getCopNumberValueByKey("b_share") == 1 && mgrPlayer.canShare()
		this.fillData()
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


	isClickShadowClose(){
		return false
	}







	////// 内部逻辑 /////
	private fillData(){
		this.labelCustomerCount.string = this.context.customerCount
		this.labelScore.string = this.context.bAddition ? ul.format("%d(+20%%)", this.context.score*1.2): this.context.score.toString()
		this.labelHistoryMaxScore.string = mgrRank.getMaxScore(Const.SERVER_RANK_ID).toString()
	}








	preClose(){
		let score = this.context.bAddition ? this.context.score * 1.2: this.context.score
		if(score > mgrRank.getMaxScore(Const.SERVER_RANK_ID)){
			mgrTip.alertPrompt("提交","本次表现非常好！创造了新的记录!","确定",()=>{
				mgrRank.setMaxScore(Const.SERVER_RANK_ID,score)
				mgrRank.requestUploadToRank(Const.SERVER_RANK_ID, mgrRank.getMaxScore(Const.SERVER_RANK_ID))
				mgrDirector.enterScene("vRankScene")
			})
		}
		else{
			mgrDirector.enterScene("vRankScene")
		}
	}



	////// 事件 /////
	// @view export events begin
	onTouchButtonBack(e: EventTouchEx): void {
		if(!e.isClick())return
		this.preClose()
	}

	onTouchButtonClose(e: EventTouchEx): void {
		if(!e.isClick())return
		this.preClose()
	}

	onTouchButtonShare(e: EventTouchEx): void {
		if(!e.isClick())return
		mgrPlayer.tryShowShare(null)
	}

	// @view export events end










}
