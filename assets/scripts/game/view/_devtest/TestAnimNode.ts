import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import SceneBase from "../../../ulframework/view/SceneBase";
import DebugMenu from "../../../ulframework/view/DebugMenu";
import mgrDirector from "../../manager/mgrDirector";
import DebugMouseControlNode from "../../../ulframework/view/DebugMouseControlNode";
import LayerColor from "../node/LayerColor";
import AnimNode from "../../../ulframework/view/AnimNode";
import mgrPool from "../../manager/mgrPool";
import ReuseList from "../../../ulframework/view/ReuseList";
import Tools from "../../../ulframework/utils/Tools";
import ReuseLayouterVBox from "../../../ulframework/view/ReuseLayouterVBox";
import mgrCfg from "../../manager/mgrCfg";
import mgrTip from "../../manager/mgrTip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestAnimNode extends SceneBase {
	// @view export resources begin
	protected _getResourceName() { return "_devtest/TestAnimNode"; }
	protected _getResourceBindingConfig() {
		return {
			CC_labelTitle: { varname: "labelTitle", vartype: cc.Label },
			CC_layoutBg: { varname: "layoutBg", vartype: cc.Layout },
			CC_layoutList: { varname: "layoutList", vartype: cc.Layout },
		};
	}
	protected labelTitle: cc.Label = null;
	protected layoutBg: cc.Layout = null;
	protected layoutList: cc.Layout = null;
	// @view export resources end
	private nodeRoot: cc.Node;
	private animNode: AnimNode;
	private selectedAnimId: string = null;
	private reuseList: ReuseList;











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
		super.onResourceLoaded();

		this.buildUi();
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
	private buildUi() {
		let menu = new DebugMenu([
			// [
			// 	"创建",
			// 	async () => {
			// 		if (this.nodeAnim) return;

			// 		// cc.log("结束");

			// 		cc.loader.loadRes("2d/anim_node/pet_skill/zi_01", cc.Prefab, (err, prefab) => {
			// 			let node: cc.Node = cc.instantiate(prefab);

			// 			node.parent = this.nodeRoot;

			// 			let animation = node.getComponent(cc.Animation);
			// 			animation.play(animation.getClips()[0].name);

			// 			/**
			// 				play : 开始播放时
			// 				stop : 停止播放时
			// 				pause : 暂停播放时
			// 				resume : 恢复播放时
			// 				lastframe : 假如动画循环次数大于 1，当动画播放到最后一帧时
			// 				finished : 动画播放完成时
			// 			 */
			// 			animation.on("play", (e) => { cc.log("play", e) });
			// 			animation.on("stop", (e) => { cc.log("stop", e) });
			// 			animation.on("pause", (e) => { cc.log("pause", e) });
			// 			animation.on("resume", (e) => { cc.log("resume", e) });
			// 			animation.on("lastframe", (e) => { cc.log("lastframe", e) });
			// 			animation.on("finished", (e) => { cc.log("finished", e) });

			// 			this.nodeAnim = node;
			// 		});
			// 	}
			// ],
			// [
			// 	"销毁",
			// 	async () => {
			// 		// cc.log("结束");

			// 		if (cc.isValid(this.nodeAnim)) {
			// 			this.nodeAnim.destroy();
			// 			this.nodeAnim = null;
			// 		}
			// 	}
			// ],
			// [
			// 	"暂停",
			// 	async () => {
			// 		// cc.log("结束");
			// 		if (!this.nodeAnim) return;
			// 		let animation = this.nodeAnim.getComponent(cc.Animation);
			// 		animation.pause();
			// 	}
			// ],
			// [
			// 	"恢复",
			// 	async () => {
			// 		// cc.log("结束");
			// 		if (!this.nodeAnim) return;
			// 		let animation = this.nodeAnim.getComponent(cc.Animation);
			// 		animation.resume();
			// 	}
			// ],
			// [
			// 	"create AnimNode",
			// 	() => {
			// 		if (this.animNode) return;

			// 		let animNode = mgrPool.get("animNode", "pet_skill_name_01");
			// 		animNode.parent = nodeRoot;

			// 		animNode.registerEventCallback((e) => {
			// 			cc.log("onEvent", e.name, e.clipName);
			// 		});

			// 		animNode.play();

			// 		this.animNode = animNode;
			// 	},
			// ],
			// [
			// 	"destroy AnimNode",
			// 	() => {
			// 		if (cc.isValid(this.animNode)) {
			// 			mgrPool.put(this.animNode);
			// 			this.animNode.removeFromParent();
			// 			this.animNode = null;
			// 		}
			// 	},
			// ],
			// [
			// 	"reset AnimNode",
			// 	() => {
			// 		if (!this.animNode) return;

			// 		this.animNode.reset();
			// 		this.animNode.play();
			// 	},
			// ],
			// [
			// 	"unregisterEvent AnimNode",
			// 	() => {
			// 		if (!this.animNode) return;

			// 		this.animNode.unregisterEventCallback();
			// 	},
			// ],
			[
				"dispose",
				() => {
					if (this.animNode) {
						this.animNode.removeFromParent();
						mgrPool.put(this.animNode);
						this.animNode = null;
					}
				},
			],
			[
				"playOnce",
				() => {
					if (!this.selectedAnimId) return;

					mgrTip.playAnimNodeOnce(this.selectedAnimId, Tools.random(mgrDirector.width), Tools.random(mgrDirector.height));
				},
			],

		], 250, 50, 4)
		menu.parent = this;
		menu.x = this.width / 2 + 10 - 310;
		menu.y = this.height / 2 - 60;



		let reuseList = new ReuseList()
		reuseList.parent = this.layoutList.node;
		reuseList.setLayouter(new ReuseLayouterVBox()
			.setCellSize(300 - 8, 50)
			.setGap(4)
			.setPending(4));
		reuseList.setCreator((cell) => {
			let layerBg = new LayerColor(cc.color(0, 0, 0, 63));
			layerBg.parent = cell;
			layerBg.setContentSize(cell.getContentSize());
			cell.layerBg = layerBg;

			let nodeLabel = new cc.Node();
			nodeLabel.parent = cell;
			let label = nodeLabel.addComponent(cc.Label);
			label.fontSize = 18;
			label.verticalAlign = cc.Label.VerticalAlign.CENTER;
			cell.label = label;

			Tools.registerTouchHandler(cell, (e) => {
				let cell = e.target;

				if (e.name == "ended") {
					// cc.log("click", cell.data);
					this.onSelectAnimId(cell.data.id);
				}
			})
		});
		reuseList.setSetter((cell, data) => {
			// cc.log("setter", cell, data)
			let color = cc.color(255, 255, 255);
			cell.label.node.color = (data.id == this.selectedAnimId) ? cc.color(127, 255, 127) : cc.color(255, 255, 255);
			cell.label.string = ul.format("%s-%s", data.id, data.name);
		});
		reuseList.setContentSize(this.layoutList.node.getContentSize());

		let datas = [];
		mgrCfg.forDb("anim_node_db", (k, v) => {
			datas.push(v);
		})
		reuseList.setDatas(datas);

		this.reuseList = reuseList;

		let nodeRoot = new DebugMouseControlNode();
		nodeRoot.parent = this;
		nodeRoot.setPosition(0, -mgrDirector.height / 4);
		this.nodeRoot = nodeRoot;

		let dot = new LayerColor(cc.color(255, 0, 0, 255));
		dot.parent = nodeRoot;
		dot.zIndex = (2);
		dot.setContentSize(4, 4);
	}

	private onSelectAnimId(animId: string) {
		this.selectedAnimId = animId;
		this.reuseList.refreshActiveCells();

		let animData = mgrCfg.get("anim_node_db", animId);
		this.labelTitle.string = ul.format("%s-%s", animData.id, animData.name);

		if (this.animNode) {
			this.animNode.removeFromParent();
			mgrPool.put(this.animNode);
			this.animNode = null;
		}

		let animNode: AnimNode = mgrPool.get("animNode", animId);
		animNode.parent = this.nodeRoot;

		animNode.play();

		this.animNode = animNode;

		animNode.registerEventCallback((e) => {
			cc.log("onAnimEvent", e);
		});
	}










	////// 事件 /////
	// @view export events begin
	// @view export events end










}