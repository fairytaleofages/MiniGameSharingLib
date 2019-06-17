import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrDirector from "../../manager/mgrDirector";
import ReuseList from "../../../ulframework/view/ReuseList";
import Tools from "../../../ulframework/utils/Tools";
import vTitleBar from "../node/vTitleBar";
import ReuseLayouterVGrid from "../../../ulframework/view/ReuseLayouterVGrid";
import mgrAd from "../../manager/mgrAd";
import mgrCfg from "../../manager/mgrCfg";
import mgrPlayer from "../../manager/mgrPlayer";
import vShopFreeItem from "../node/vShopFreeItem";
import ReuseLayouterVBox from './../../../ulframework/view/ReuseLayouterVBox';
import mgrPool from "../../manager/mgrPool";
import mgrShop from "../../manager/mgrShop";
import mgrSdk from "../../manager/mgrSdk";
import Const from "../../Const";



export default class vShopDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vShopDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonBack: {
				varname: "buttonBack",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonBack" }],
			},
			CC_nodeBg: { varname: "nodeBg", vartype: cc.Node },
			CC_nodeLeftTop: { varname: "nodeLeftTop", vartype: cc.Node },
			CC_nodeListFree: { varname: "nodeListFree", vartype: cc.Node },
			CC_nodeTitleBar: { varname: "nodeTitleBar", vartype: cc.Node },
			CC_nodeTop: { varname: "nodeTop", vartype: cc.Node },
		};
	}
	protected buttonBack: ScaleableButton = null;
	protected nodeBg: cc.Node = null;
	protected nodeLeftTop: cc.Node = null;
	protected nodeListFree: cc.Node = null;
	protected nodeTitleBar: cc.Node = null;
	protected nodeTop: cc.Node = null;
	// @view export resources end

    private listFree: ReuseList = null;







    constructor(context){
		super(context);
		this.context.bImmediately = true;
	}

	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
        super.onResourceLoaded();
        
        // resize
        this.nodeResource.setContentSize( mgrDirector.size );
        
        this.uiFadeIn();
        this.buildUi();
		this.fillData();

		this.registerListeners({  
			MSG_AD_EVENT_SUCCESSD: this.onMsgAdEventSuccessd,
			MSG_ADV_VALID_COUNT:this.onMsgAdvValidCount
		})
	}

	start() {
		super.start();
	}

	update(dt: number) {
		super.update(dt);
	}

	onDestroy() {
        //释放缓存池中的资源
		let cells = this.listFree.getActiveCellsByFilter((cell: any): boolean => {
			return true;
		})
		cells.forEach(cell => {
			if (cell.item) {
				cell.item.removeFromParent();
				mgrPool.put(cell.item);
				cell.item = null;
			}
		});
		super.onDestroy();
	}










	////// 内部逻辑 /////

    private uiFadeIn() {
        this.nodeTop.y = mgrDirector.height / 2;
        this.nodeLeftTop.x = -mgrDirector.width / 2;
        this.nodeLeftTop.y = mgrDirector.height / 2;

        // 刘海屏
        if ( mgrDirector.isDeviceOverHeight() ) {
            this.nodeTop.y = mgrDirector.height / 2 - 50;
            this.nodeLeftTop.y = mgrDirector.height / 2 - 50;
		}
	}

    buildUi () {
		let titleBar = new vTitleBar( );
		titleBar.parent = this.nodeTitleBar;

		if (mgrDirector.isDeviceOverHeight()) {
			this.nodeTitleBar.parent.y = mgrDirector.height / 2 - 50
		}
        // free
        let layouterG = new ReuseLayouterVBox()
			.setCellSize(466, 185)
			.setGap(0)
			.setPending(10)
		let reuseList = new ReuseList()
		reuseList.parent = this.nodeListFree;
		reuseList.setContentSize(this.nodeListFree.getContentSize());
		reuseList.setLayouter(layouterG);
		reuseList.setCreator((cell) => {
		});
		reuseList.setSetter( ( cell, data ) => {
			let viewName = data.uiViewName;
			if (!!viewName) {
				if (cell.item && cell.item.__pool_key != viewName) {
					mgrPool.put(cell.item);
					cell.item.removeFromParent(false);
					cell.item = null;
				}

				if (!cell.item) {
					cell.item = mgrPool.get("view", viewName);
					cell.item.parent = cell;
				}

				cell.item.fillData(data.id);
			}
		});
		this.listFree = reuseList;
		// this.listFree.setTouchScrollEnabled(false)
	}

	fillData () {
        let datas = [];

        if ( mgrSdk.isOpenPay() ) {
            let arr = mgrShop.getAllShopItemListByCategory( [2] );
            for (let index = 0; index < arr.length; index++) {
                const element = arr[index];
                datas.push( {
                    id: element.id,
                    uiViewName: "vShopItem",
                } )
            }
        }


		let adEventId1 = "free_gold";
        let adEventId2 = "free_energy";
        
		if ( mgrAd.preCheckCanTriggerAdEventWithoutCd( adEventId1 ) ) {
            datas.push( {
                id: adEventId1,
                uiViewName: "vShopFreeItem",
            } )
		}
		if ( mgrAd.preCheckCanTriggerAdEventWithoutCd( adEventId2 ) ) {
            datas.push( {
                id: adEventId2,
                uiViewName: "vShopFreeItem",
            } )
        }
        

        this.listFree.setDatas( datas );
	}







	////// 事件 /////
	// @view export events begin
	onTouchButtonBack(e: EventTouchEx): void {
		if ( !e.isClick() ) { return; }
        
        this.closeDialog();
	}

    // @view export events end


	onMsgAdEventSuccessd(e) {
	}
	
	onMsgAdvValidCount(){
		if(Const.AD_VIDEO_VALID_COUNT <= 0) {
			this.closeDialog();
		}
	}

}

