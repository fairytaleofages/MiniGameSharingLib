import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import SceneBase from "../../../ulframework/view/SceneBase";
import DebugMenu from "../../../ulframework/view/DebugMenu";
import ReuseList from "../../../ulframework/view/ReuseList";
import ReuseLayouterVBox from "../../../ulframework/view/ReuseLayouterVBox";
import LayerColor from "../node/LayerColor";
import Tools from "../../../ulframework/utils/Tools";
import mgrCfg from "../../manager/mgrCfg";
import DebugMouseControlNode from "../../../ulframework/view/DebugMouseControlNode";
import mgrDirector from "../../manager/mgrDirector";
import Spine from "../../../ulframework/view/Spine";
import mgrPool from "../../manager/mgrPool";
import mgrTip from "../../manager/mgrTip";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestSpine extends SceneBase {
	// @view export resources begin
	protected _getResourceName() { return "_devtest/TestSpine"; }
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

	private selectedSpineId: string = null;
	private reuseList: ReuseList;
	private nodeRoot: cc.Node;

	private spine: Spine;











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

		if (this.spine) {
			this.spine.removeFromParent();
			mgrPool.put(this.spine);
			this.spine = null;
		}
	}










	////// 内部逻辑 /////
	private buildUi() {

		let menu = new DebugMenu([
			[
				"dispose",
				() => {
					if (this.spine) {
						this.spine.removeFromParent();
						mgrPool.put(this.spine);
						this.spine = null;
					}
				},
			],
			[
				"mov_1",
				() => {
					if (!this.spine) return;
					this.spine.play("mov_1", this.spine.spineData._bDebugLoop);
				},
			],
			[
				"mov_2",
				() => {
					if (!this.spine) return;
					this.spine.play("mov_2", this.spine.spineData._bDebugLoop);
				},
			],
			[
				"mov_3",
				() => {
					if (!this.spine) return;
					this.spine.play("mov_3", this.spine.spineData._bDebugLoop);
				},
			],
			[
				"mov_4",
				() => {
					if (!this.spine) return;
					this.spine.play("mov_4", this.spine.spineData._bDebugLoop);
				},
			],
			[
				"mov_5",
				() => {
					if (!this.spine) return;
					this.spine.play("mov_5", this.spine.spineData._bDebugLoop);
				},
			],
			[
				"mov_6",
				() => {
					if (!this.spine) return;
					this.spine.play("mov_6", this.spine.spineData._bDebugLoop);
				},
			],
			[
				"mov_7",
				() => {
					if (!this.spine) return;
					this.spine.play("mov_7", this.spine.spineData._bDebugLoop);
				},
			],
			[
				"mov_8",
				() => {
					if (!this.spine) return;
					this.spine.play("mov_8", this.spine.spineData._bDebugLoop);
				},
            ],
            [
				"mov_9",
				() => {
					if (!this.spine) return;
					this.spine.play("mov_9", this.spine.spineData._bDebugLoop);
				},
            ],
            // [
			// 	"mov_10",
			// 	() => {
			// 		if (!this.spine) return;
			// 		this.spine.play("mov_10", this.spine.spineData._bDebugLoop);
			// 	},
            // ],
            // [
			// 	"mov_11",
			// 	() => {
			// 		if (!this.spine) return;
			// 		this.spine.play("mov_11", this.spine.spineData._bDebugLoop);
			// 	},
            // ],
            // [
			// 	"mov_12",
			// 	() => {
			// 		if (!this.spine) return;
			// 		this.spine.play("mov_12", this.spine.spineData._bDebugLoop);
			// 	},
            // ],
            [
				"skin1",
				() => {
					if (!this.spine) return;
                    let spineData = this.spine.getComponent(sp.Skeleton);
                    spineData.setSkin("normal");
				},
            ],
            [
				"skin2",
				() => {
					if (!this.spine) return;
					let spineData = this.spine.getComponent(sp.Skeleton);
                    spineData.setSkin("normal1");
				},
            ],
            [
				"skin3",
				() => {
					if (!this.spine) return;
                    let spineData = this.spine.getComponent(sp.Skeleton);
                    spineData.setSkin("normal2");
				},
            ],
            [
				"skin4",
				() => {
					if (!this.spine) return;
                    let spineData = this.spine.getComponent(sp.Skeleton);
                    spineData.setSkin("normal3");
				},
            ],
            [
				"skin5",
				() => {
					if (!this.spine) return;
                    let spineData = this.spine.getComponent(sp.Skeleton);
                    spineData.setSkin("normal4");
				},
            ],
			[
				"playOnce",
				() => {
					if (!this.selectedSpineId) return;

					mgrTip.playSpineOnce(this.selectedSpineId, Tools.random(mgrDirector.width), Tools.random(mgrDirector.height));
				},
            ],
            [
				"head",
				() => {
                    if (!this.spine) return;
                    
                    if ( !this["headIndex"] ) {
                        this["headIndex"] = 1;
                    } 
                    switch (this["headIndex"]) {
                        case 1: { this.spine.getComponent(sp.Skeleton).setAttachment("toukui","toukui"); break;}
                        case 2: { this.spine.getComponent(sp.Skeleton).setAttachment("toukui","toukui02"); break;}
                        case 3: { this.spine.getComponent(sp.Skeleton).setAttachment("toukui","toukui03"); break;}
                        case 4: { this.spine.getComponent(sp.Skeleton).setAttachment("toukui",null); break;}
                    }
                    this["headIndex"]++;
                    if ( this["headIndex"] > 4 ) {
                        this["headIndex"] = 1;
                    }
				},
            ],
            [
				"cloth",
				() => {
					if (!this.spine) return;
                    if ( !this["clothIndex"] ) {
                        this["clothIndex"] = 1;
                    } 
                    switch (this["clothIndex"]) {
                        case 1: { this.spine.getComponent(sp.Skeleton).setAttachment("fangdanyi","fangdanyi"); break;}
                        case 2: { this.spine.getComponent(sp.Skeleton).setAttachment("fangdanyi","fangdanyi02"); break;}
                        case 3: { this.spine.getComponent(sp.Skeleton).setAttachment("fangdanyi","fangdanyi03"); break;}
                        case 4: { this.spine.getComponent(sp.Skeleton).setAttachment("fangdanyi",null); break;}
                    }
                    this["clothIndex"]++;
                    if ( this["clothIndex"] > 4 ) {
                        this["clothIndex"] = 1;
                    }
				},
            ],
            [
				"gun",
				() => {
					if (!this.spine) return;
                    if ( !this["gunIndex"] ) {
                        this["gunIndex"] = 1;
                    } 
                    switch (this["gunIndex"]) {
                        case 1: { 
                            this.spine.getComponent(sp.Skeleton).setAttachment("qiang","98K"); 
                            this.spine.getComponent(sp.Skeleton).setAttachment("danjia",null); 
                            break;
                        }
                        case 2: { 
                            this.spine.getComponent(sp.Skeleton).setAttachment("qiang","AK47"); 
                            this.spine.getComponent(sp.Skeleton).setAttachment("danjia","AK47-danjia"); 
                            break;
                        }
                        case 3: { 
                            this.spine.getComponent(sp.Skeleton).setAttachment("qiang","AWM"); 
                            this.spine.getComponent(sp.Skeleton).setAttachment("danjia","AWM-danjia"); 
                            break;
                        }
                        case 4: { 
                            this.spine.getComponent(sp.Skeleton).setAttachment("qiang","HK416"); 
                            this.spine.getComponent(sp.Skeleton).setAttachment("danjia","HK416-danjia"); 
                            break;
                        }
                        case 5: { 
                            this.spine.getComponent(sp.Skeleton).setAttachment("qiang","M16"); 
                            this.spine.getComponent(sp.Skeleton).setAttachment("danjia","M16-danjia"); 
                            break;
                        }
                        case 6: { 
                            this.spine.getComponent(sp.Skeleton).setAttachment("qiang","M249"); 
                            this.spine.getComponent(sp.Skeleton).setAttachment("danjia","M249-danjia"); 
                            break;
                        }
                        case 7: { 
                            this.spine.getComponent(sp.Skeleton).setAttachment("qiang","SPAS12"); 
                            this.spine.getComponent(sp.Skeleton).setAttachment("danjia",null); 
                            break;
                        }
                        case 8: { 
                            this.spine.getComponent(sp.Skeleton).setAttachment("qiang","UMP45"); 
                            this.spine.getComponent(sp.Skeleton).setAttachment("danjia","UMP45-danjia"); 
                            break;
                        }
                    }
                    this["gunIndex"]++;
                    if ( this["gunIndex"] > 8 ) {
                        this["gunIndex"] = 1;
                    }
				},
            ],
		], 250, 50, 4)
		menu.parent = this;
		menu.x = this.width / 2 - 260;
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
					this.onSelectSpineId(cell.data.id);
				}
			})
		});
		reuseList.setSetter((cell, data) => {
			// cc.log("setter", cell, data)
			let color = cc.color(255, 255, 255);
			cell.label.node.color = (data.id == this.selectedSpineId) ? cc.color(127, 255, 127) : cc.color(255, 255, 255);
			cell.label.string = ul.format("%s-%s", data.id, data.name);
		});
		reuseList.setContentSize(this.layoutList.node.getContentSize());

		let datas = [];
		mgrCfg.forDb("spine_db", (k, v) => {
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

	private onSelectSpineId(spineId: string) {
		this.selectedSpineId = spineId;
		this.reuseList.refreshActiveCells();

		let spineData = mgrCfg.get("spine_db", spineId);
		this.labelTitle.string = ul.format("%s-%s", spineData.id, spineData.name);

		if (this.spine) {
			this.spine.removeFromParent();
			mgrPool.put(this.spine);
			this.spine = null;
		}

		let spine: Spine = mgrPool.get("spine", spineId);
		spine.parent = this.nodeRoot;

		// spine.play("mov_1", true);
		spine.play("mov_2", true);
		// spine.play("mov_3", true);

		this.spine = spine;

        let time = Tools.time();
		spine.registerEventCallback((e) => {
            cc.log("onSpineEvent", e);
            cc.log("used time ", time - Tools.time());
            time = Tools.time();
		});

		// cc.log("spine", spine);
	}










	////// 事件 /////
	// @view export events begin
	// @view export events end










}
