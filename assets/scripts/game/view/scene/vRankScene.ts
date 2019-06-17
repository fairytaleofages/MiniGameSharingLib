import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import SceneBase from "../../../ulframework/view/SceneBase";
import ReuseLayouterVBox from './../../../ulframework/view/ReuseLayouterVBox';
import ReuseList from "../../../ulframework/view/ReuseList";
import vRankItem from "../node/vRankItem";
import mgrRank from './../../manager/mgrRank';
import Const from "../../Const";
import Tools from './../../../ulframework/utils/Tools';
import mgrDirector from './../../manager/mgrDirector';
import mgrStage from "../../manager/mgrStage";
import mgrAd from "../../manager/mgrAd";
import vAdLuckyMatchDialog from './../../../../../temp/BackupAssets/assets/scripts/game/view/dialog/vAdLuckyMatchDialog';

const { ccclass, property } = cc._decorator;

@ccclass
export default class vRankScene extends SceneBase {
	// @view export resources begin
	protected _getResourceName() { return "scene/vRankScene"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_buttonMatch: {
				varname: "buttonMatch",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonMatch" }],
			},
			CC_labelNoneTip: { varname: "labelNoneTip", vartype: cc.Label },
			CC_labelRank: { varname: "labelRank", vartype: cc.Label },
			CC_nodeLeftTop: { varname: "nodeLeftTop", vartype: cc.Node },
			CC_nodeList: { varname: "nodeList", vartype: cc.Node },
		};
	}
	protected buttonClose: ScaleableButton = null;
	protected buttonMatch: ScaleableButton = null;
	protected labelNoneTip: cc.Label = null;
	protected labelRank: cc.Label = null;
	protected nodeLeftTop: cc.Node = null;
	protected nodeList: cc.Node = null;
	// @view export resources end

	private reuseListRankPlayers: ReuseList = null
	private requestCd: number = 1;//秒  避免拖动请求过快
	private lastRequestTime: number = 0;

	private rankId: number = Const.SERVER_RANK_ID


	private bLucky: boolean = false





	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.bLucky = mgrAd.preCheckCanTriggerAdEvent("more_20persent_pvp_score")

        this.uiFadeIn();
		this.buildUi()
		this.fillData()

		this.registerListeners({
			MSG_PVP_RESPONSE_PLAYER_FROM_RANK: this.onMsgPvpResponsePlayerFromRank.bind(this),
			MSG_PVP_SELF_DATA_CHANGED: this.onMsgPvpSelfDataChanged.bind(this),
        })
        
        ///广告
		if (mgrAd.preCheckCanTriggerAdEvent("wrap_scene")) {
			mgrAd.triggerAdEvent("wrap_scene", null, true);
		} else {
			mgrAd.triggerAdEvent("banner_all");
		}
	}

	start() {
		super.start();
	}

	update(dt: number) {
		super.update(dt);
	}

	onDestroy() {
        mgrAd.closeAdv("banner_all");
		super.onDestroy();
	}










    ////// 内部逻辑 /////
    
    private uiFadeIn() {
        this.nodeLeftTop.x = -mgrDirector.width / 2;
        this.nodeLeftTop.y = mgrDirector.height / 2;

        // 刘海屏
        if ( mgrDirector.isDeviceOverHeight() ) {
            // this.nodeLeftTop.y = mgrDirector.height / 2 - 50;
		}
	}

	private buildUi() {
		//列表
		let layouterG = new ReuseLayouterVBox()
			.setCellSize(460, 86)
			.setGap(0)
			.setPending(0)
		let reuseList = new ReuseList()
		reuseList.parent = this.nodeList;
		reuseList.setContentSize(this.nodeList.getContentSize());
		reuseList.setLayouter(layouterG);
		reuseList.setCreator((cell) => {
			let item = new vRankItem()
			item.parent = cell
			cell.item = item
		});
		reuseList.setSetter((cell, data) => {
			let item: vRankItem = cell.item
			item.fillBySRankPlayer(data)

			//如果当前是最后一个, 请求下一批次
			let players = mgrRank.getPlayers(this.rankId)
			if (players[players.length - 1].rank == data.rank) {
				if (Tools.time() - this.lastRequestTime > this.requestCd) {
					this.lastRequestTime = Tools.time()
					mgrRank.requestNextBatchPlayers(this.rankId)
				}
			}
		});
		this.reuseListRankPlayers = reuseList;
	}

	private fillData() {
		let players = mgrRank.getPlayers(this.rankId)
		this.labelNoneTip.node.active = players.length <= 0

		this.reuseListRankPlayers.setDatas(players)

		let selfData = mgrRank.getSelfPlayer(this.rankId)
		
		cc.log("@@selfRank: ", selfData)
		if (!selfData || selfData.rank > 100 || selfData.rank < 0) {
			this.labelRank.string = "未上榜"
		}
		else {
			this.labelRank.string = ul.format("第%d名", selfData.rank)
		}
	}







	////// 事件 /////
	// @view export events begin
	onTouchButtonMatch(e: EventTouchEx): void {
		if (!e.isClick()) return
		if (!mgrStage.tryBeginStage(10000)) { return; }

		//检查广告
		if (this.bLucky){
			mgrDirector.openDialog("vAdLuckyMatchDialog")
		}
		else{
			mgrDirector.enterScene("vGameScene", { stageId: 10000 });
		}
	}

	onTouchButtonClose(e: EventTouchEx): void {
		if (!e.isClick()) return
		mgrDirector.enterScene("vHubScene")
	}

	// @view export events end

	onMsgPvpResponsePlayerFromRank(e) {
		this.fillData()
	}



	onMsgPvpSelfDataChanged(e) {
		this.fillData()
	}





}


