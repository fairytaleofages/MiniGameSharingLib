import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrSign from "../../manager/mgrSign";
import Const, { SignState, AdMode } from "../../Const";
import mgrTip from "../../manager/mgrTip";
import mgrSdk from "../../manager/mgrSdk";
import Timer from "../../../ulframework/utils/Timer";
import vSignSmallItem from "../node/vSignSmallItem";
import mgrAd from "../../manager/mgrAd";
import vSignBigItem from "../node/vSignBigItem";
import mgrPlayer from "../../manager/mgrPlayer";

const { ccclass, property } = cc._decorator;

const AD_ID_SIGN = "double_reward_sign";

@ccclass
export default class vSignDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vSignDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_buttonNoAd: {
				varname: "buttonNoAd",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonNoAd" }],
			},
			CC_buttonSignCarefulDouble: {
				varname: "buttonSignCarefulDouble",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSignCarefulDouble" }],
			},
			CC_buttonSignCarefulSingle: {
				varname: "buttonSignCarefulSingle",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSignCarefulSingle" }],
			},
			CC_buttonSignReleax: {
				varname: "buttonSignReleax",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonSignReleax" }],
			},
			CC_labelButtonSignReleax: { varname: "labelButtonSignReleax", vartype: cc.Label },
			CC_labelDay: { varname: "labelDay", vartype: cc.Label },
			CC_nodeAdIconReleax: { varname: "nodeAdIconReleax", vartype: cc.Node },
			CC_nodeCareful: { varname: "nodeCareful", vartype: cc.Node },
			CC_nodeItem1: { varname: "nodeItem1", vartype: cc.Node },
			CC_nodeItem2: { varname: "nodeItem2", vartype: cc.Node },
			CC_nodeItem3: { varname: "nodeItem3", vartype: cc.Node },
			CC_nodeItem4: { varname: "nodeItem4", vartype: cc.Node },
			CC_nodeItem5: { varname: "nodeItem5", vartype: cc.Node },
			CC_nodeItem6: { varname: "nodeItem6", vartype: cc.Node },
			CC_nodeItem7: { varname: "nodeItem7", vartype: cc.Node },
			CC_nodeNoAd: { varname: "nodeNoAd", vartype: cc.Node },
			CC_nodeNoSign: { varname: "nodeNoSign", vartype: cc.Node },
			CC_nodeReleax: { varname: "nodeReleax", vartype: cc.Node },
			CC_nodeSignReleax: { varname: "nodeSignReleax", vartype: cc.Node },
			CC_nodeSigned: { varname: "nodeSigned", vartype: cc.Node },
			CC_nodeToogleParent: { varname: "nodeToogleParent", vartype: cc.Node },
			CC_toggleDoubleReward: { varname: "toggleDoubleReward", vartype: cc.Toggle },
		};
	}
	protected buttonClose: ScaleableButton = null;
	protected buttonNoAd: ScaleableButton = null;
	protected buttonSignCarefulDouble: ScaleableButton = null;
	protected buttonSignCarefulSingle: ScaleableButton = null;
	protected buttonSignReleax: ScaleableButton = null;
	protected labelButtonSignReleax: cc.Label = null;
	protected labelDay: cc.Label = null;
	protected nodeAdIconReleax: cc.Node = null;
	protected nodeCareful: cc.Node = null;
	protected nodeItem1: cc.Node = null;
	protected nodeItem2: cc.Node = null;
	protected nodeItem3: cc.Node = null;
	protected nodeItem4: cc.Node = null;
	protected nodeItem5: cc.Node = null;
	protected nodeItem6: cc.Node = null;
	protected nodeItem7: cc.Node = null;
	protected nodeNoAd: cc.Node = null;
	protected nodeNoSign: cc.Node = null;
	protected nodeReleax: cc.Node = null;
	protected nodeSignReleax: cc.Node = null;
	protected nodeSigned: cc.Node = null;
	protected nodeToogleParent: cc.Node = null;
	protected toggleDoubleReward: cc.Toggle = null;
	// @view export resources end



    private items: vSignSmallItem[] = [];
    
    /** 是否可以触发广告 */
	private bCanTrigAd: boolean = false;





	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		
	}

	start() {
		super.start();
	}

	update(dt: number) {
		super.update(dt);
		if (!this.isResourceLoaded()) {
			return;
		}
		if (this.bClosing) {
			return;
		}
		this.fillData();

	}

	onDestroy() {
		super.onDestroy();
	}


	onOpenDialogCompleted() {
        this.buildUI();
		this.fillData();
		
		this.fillAd();

        this.registerListeners({
            MSG_AD_EVENT_SUCCESSD: this.onMsgAdEventSuccessd,
        })
	}







	////// 内部逻辑 /////
	private buildUI() {

        let nodeArr = [
            this.nodeItem1,
            this.nodeItem2,
            this.nodeItem3,
            this.nodeItem4,
            this.nodeItem5,
			this.nodeItem6,
			this.nodeItem7
        ]
		for (let i = 0; i <= nodeArr.length; i++) {
			let item = new vSignSmallItem({
				day: i + 1,
				fOnClick: this.onClickItem.bind(this),
			})
			// item.setContentSize( 150, 160 );s
			item.parent = nodeArr[i];

			this.items.push( item );
		}
	}



	private fillData() {
		if(this.items.length <= 0) return

		let signDay = mgrSign.getSignDay();
		for (let index = 0; index < this.items.length; index++) {
			const item = this.items[index];

			item.fillData();

			if (signDay == ( index + 1 ) && mgrSign.getState() == SignState.canSign) {
				item["__focused"] = true;

				if (!(item as cc.Node).getActionByTag(1)) {
					item.stopAllActions();
					item.setScale(1);
					(item as cc.Node).runAction(cc.repeatForever(cc.sequence(
						cc.scaleTo(0.5, 1.1).easing(cc.easeInOut(1.5)),
						cc.scaleTo(0.5, 1).easing(cc.easeInOut(1.5)),
					))).setTag(1);
				}
			}
			else {
				item["__focused"] = false;
				item.stopAllActions();
				item.setScale(1);
			}
        }
        
        if (mgrSign.getState() == SignState.canSign) {
			this.nodeSigned.active = false
			this.nodeNoSign.active = true

			// let item = this.nodeSignReleax;

			// if (!item.getActionByTag(1)) {
			// 	item.stopAllActions();
			// 	item.setScale(1);
			// 	item.runAction(cc.repeatForever(cc.sequence(
			// 		cc.scaleTo(0.5, 1.1).easing(cc.easeInOut(1.5)),
			// 		cc.scaleTo(0.5, 1).easing(cc.easeInOut(1.5)),
			// 	))).setTag(1);
			// }
		}
		else {
			this.nodeSigned.active = true
			this.nodeNoSign.active = false

			// let item = this.nodeSign;
			// item.stopAllActions(); 
			// item.setScale(1);
			// item.active = true;
			
		}

		this.labelDay.string = mgrSign.getSignedDayCount().toString()
	}


	private fillAd(){
		this.bCanTrigAd = mgrAd.preCheckCanTriggerAdEvent(AD_ID_SIGN);

		this.nodeNoAd.active = !this.bCanTrigAd
		this.nodeReleax.active = this.bCanTrigAd && mgrSdk.getCopAdMode() == AdMode.releax;
		this.nodeCareful.active = this.bCanTrigAd && mgrSdk.getCopAdMode() == AdMode.careful;
		//宽松模式
		this.toggleDoubleReward.node.on('toggle', this.refreshAdIcon.bind(this));
		this.refreshAdIcon();
		//严格模式  none
	}


	private _sign() {
		let result = mgrSign.sign();
		if (result.bSuccessd) {
			mgrTip.addGotItemTip(result.rewardItemId, result.rewardAmount);
			this.fillData();
		}
	}

	private canSign(){
		let state = mgrSign.getState();
		if (state == SignState.canSign) {
			return true
		}
		else if (state == SignState.signed) {
			mgrTip.showMsgTip("已经签过了");
			return false
		}
		else if (state == SignState.signOver) {
			mgrTip.showMsgTip("已经不能签到了");
			return false
		}
		else if (state == SignState.waitGap) {
			mgrTip.showMsgTip("再等等");
			return false
		}
	}


    private refreshAdIcon () {
        let isChecked = this.toggleDoubleReward.isChecked;
        cc.log("refreshAdIcon isChecked : ",isChecked);
		this.nodeAdIconReleax.active = isChecked;
    }




	////// 事件 /////
	// @view export events begin
	onTouchButtonClose(e: EventTouchEx): void {
		if (!e.isClick()) return;
		this.closeDialog();
	}

	onTouchButtonNoAd(e: EventTouchEx): void {
		if (!e.isClick()) return;
		//无广告直接签到
		if (this.canSign()) this._sign()
	}
    
	onTouchButtonSignCarefulDouble(e: EventTouchEx): void {
		if (!e.isClick()) return;
		//严格模式下看广告
		if (this.canSign()) mgrAd.triggerAdEvent(AD_ID_SIGN,null,true)
	}

	onTouchButtonSignCarefulSingle(e: EventTouchEx): void {
		if (!e.isClick()) return;
		//严格模式下, 不看广告
		if (this.canSign()) this._sign()
	}
	onTouchButtonSignReleax(e: EventTouchEx): void {
		if (!e.isClick()) return;
		//宽松模式下
		let bChecked = this.toggleDoubleReward.isChecked
		if (this.canSign()){
			if(bChecked){
				mgrAd.triggerAdEvent(AD_ID_SIGN, null, true)
			}
			else{
				this._sign()
			}
		}
	}
	

	// @view export events end

	onClickItem(day) {
		// let signDay = mgrSign.getSignDay();
		// if (day < signDay) {
		// 	mgrTip.showMsgTip("签到时间已过")
		// }
		// else if (day == signDay) {
		// 	this.trySign();
		// }
		// else {
		// 	mgrTip.showMsgTip("再等等")
		// }
	}

    onMsgAdEventSuccessd(e) {
		let data = e;

		let adEventId = data.adEventId;
		if ( adEventId == AD_ID_SIGN ) {
			let result = mgrSign.sign();
			if (result.bSuccessd) {
				mgrPlayer.addItemAmount(result.rewardItemId, result.rewardAmount, "广告签到");
				mgrTip.addGotItemTip(result.rewardItemId, result.rewardAmount * 2);
				this.fillData();
			}
		}

    }






}













