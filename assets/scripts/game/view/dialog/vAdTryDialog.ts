import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import DialogBase from "../../../ulframework/view/DialogBase";
import mgrCfg from './../../manager/mgrCfg';
import mgrAd from "../../manager/mgrAd";
import vAvatar from "../node/vAvatar";
import { CakePartType } from "../../Const";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vAdTryDialog extends DialogBase {
	// @view export resources begin
	protected _getResourceName() { return "dialog/vAdTryDialog"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonClose: {
				varname: "buttonClose",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonClose" }],
			},
			CC_buttonWatch: {
				varname: "buttonWatch",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonWatch" }],
			},
			CC_nodeAdIcon: { varname: "nodeAdIcon", vartype: cc.Node },
			CC_spriteIcon: { varname: "spriteIcon", vartype: cc.Sprite },
		};
	}
	protected buttonClose: ScaleableButton = null;
	protected buttonWatch: ScaleableButton = null;
	protected nodeAdIcon: cc.Node = null;
	protected spriteIcon: cc.Sprite = null;
	// @view export resources end

	private adEventId: string = "free_try_part";

	private viewAvatar: vAvatar = null







	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();
		this.viewAvatar = new vAvatar()
		this.viewAvatar.parent = this.spriteIcon.node
		this.viewAvatar.scale = 0.35


		this.fillData()
		this.registerListeners({
			MSG_AD_EVENT_SUCCESSD: this.onMsgAdEventSuccessd,
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



	////// 内部逻辑 /////
	private fillData(){
		let partData = mgrCfg.get_from_cake_part_db(this.context.partId)
		this.spriteIcon.spriteFrame = null
		this.viewAvatar.takeOffAll()
		if (partData && partData.type == CakePartType.body) {
			this.viewAvatar.replace(this.context.partId)
		}
		else {
			this.spriteIcon.loadSpriteFrame(partData.icon);
        }
        

        this.nodeAdIcon.active = mgrAd.preCheckCanTriggerAdEvent( this.adEventId );
	}









	////// 事件 /////
	// @view export events begin
	onTouchButtonClose(e: EventTouchEx): void {
		if(!e.isClick()) return;

		this.closeDialog()
	}

	onTouchButtonWatch(e: EventTouchEx): void {
		if(!e.isClick()) return;

        // 能看广告就看广告，不能直接试用
        if ( mgrAd.preCheckCanTriggerAdEvent( this.adEventId ) ) {
            mgrAd.triggerAdEvent(this.adEventId,{partId: this.context.partId}, true)
        } else {
            this.sendMsg("MSG_TRY_SUCCESSFUL",{partId: this.context.partId})
			this.closeDialog()
        }
	}

	// @view export events end

	onMsgAdEventSuccessd(e){
		if(e.adEventId == this.adEventId){
			this.sendMsg("MSG_TRY_SUCCESSFUL",{partId: e.userData.partId})
			this.closeDialog()
		}
	}








}
