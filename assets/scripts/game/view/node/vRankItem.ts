import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import sRankPlayer from "../../struct/sRankPlayer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vRankItem extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vRankItem"; }
	protected _getResourceBindingConfig() {
		return {
			CC_labelName: { varname: "labelName", vartype: cc.Label },
			CC_labelRank: { varname: "labelRank", vartype: cc.Label },
			CC_labelScore: { varname: "labelScore", vartype: cc.Label },
			CC_nodeRank1: { varname: "nodeRank1", vartype: cc.Node },
			CC_nodeRank2: { varname: "nodeRank2", vartype: cc.Node },
			CC_nodeRank3: { varname: "nodeRank3", vartype: cc.Node },
		};
	}
	protected labelName: cc.Label = null;
	protected labelRank: cc.Label = null;
	protected labelScore: cc.Label = null;
	protected nodeRank1: cc.Node = null;
	protected nodeRank2: cc.Node = null;
	protected nodeRank3: cc.Node = null;
	// @view export resources end

	private player:sRankPlayer = null









	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		this._refresh()
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
	public fillBySRankPlayer(player:sRankPlayer){
		this.player = player
		this._refresh()
	}

	private _refresh(){
		if(!this.isResourceLoaded()) return
		if(!this.player) return

		let player = this.player
		this.nodeRank1.active = player.rank == 1
		this.nodeRank2.active = player.rank == 2
		this.nodeRank3.active = player.rank == 3
		this.labelRank.node.active = player.rank > 3
		this.labelRank.string = player.rank.toString()
		this.labelName.string = player.name
		this.labelScore.string = player.score.toString()
	}









	////// 事件 /////
	// @view export events begin
	// @view export events end










}
