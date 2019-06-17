import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";
import mgrCfg from "../../manager/mgrCfg";
import mgrSign from "../../manager/mgrSign";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vSignSmallItem extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vSignSmallItem"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonItem: {
				varname: "buttonItem",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonItem" }],
			},
			CC_labelCount: { varname: "labelCount", vartype: cc.Label },
			CC_labelTitle: { varname: "labelTitle", vartype: cc.Label },
			CC_nodeBg: { varname: "nodeBg", vartype: cc.Node },
			CC_nodeGeted: { varname: "nodeGeted", vartype: cc.Node },
			CC_nodeMask: { varname: "nodeMask", vartype: cc.Node },
			CC_spriteIcon: { varname: "spriteIcon", vartype: cc.Sprite },
		};
	}
	protected buttonItem: ScaleableButton = null;
	protected labelCount: cc.Label = null;
	protected labelTitle: cc.Label = null;
	protected nodeBg: cc.Node = null;
	protected nodeGeted: cc.Node = null;
	protected nodeMask: cc.Node = null;
	protected spriteIcon: cc.Sprite = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.buildUI();

		this.fillData();
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

	private buildUI() {

	}

	public fillData() {
		if (!this.isResourceLoaded()) return;
		//签到的第几天
		let day = this.context.day;
		let signDay = mgrSign.getSignDay();
		let signIndex = mgrSign.getSignIndex();

		let signData: T_SIGN_DB = null;

		if (day < signDay) {
			//过了签到时间, 
			signData = mgrCfg.quietGet("sign_db", day, 0);
			this.nodeGeted.active = true
		}
		else if (day == signDay) {
			//x显示当前的物品
			signData = mgrCfg.quietGet("sign_db", day, signIndex);
			if (!signData) {
				//今天签完了，显示第一个
				signData = mgrCfg.quietGet("sign_db", day, 0);
				this.nodeGeted.active = true
			}
			else {
				//显示当前需要签到的
				this.nodeGeted.active = false
			}
		}
		else {
			// --还没签
			signData = mgrCfg.quietGet("sign_db", day, 0);
			this.nodeGeted.active = false
		}


		let itemData = mgrCfg.get_from_item_template_db(signData.rewardItemId)
		this.spriteIcon.loadSpriteFrameAndKeepSize(itemData.icon)
		this.labelTitle.string = ""//ul.format("第%d天", day);
		this.labelCount.string = "x" + signData.rewardAmount;


	}








	////// 事件 /////
	// @view export events begin
	onTouchButtonItem(e: EventTouchEx): void {
		if (!e.isClick()) return;

		if (this.context.fOnClick) {
			this.context.fOnClick(this.context.day)
		}
	}

	// @view export events end










}


