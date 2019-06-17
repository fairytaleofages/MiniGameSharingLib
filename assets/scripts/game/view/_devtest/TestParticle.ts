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
import Particle from "../../../ulframework/view/Particle";
import mgrPool from "../../manager/mgrPool";
import mgrTip from "../../manager/mgrTip";
import Timer from "../../../ulframework/utils/Timer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestParticle extends SceneBase {
	// @view export resources begin
	protected _getResourceName() { return "_devtest/TestParticle"; }
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

	private selectedParticleId: string = null;
	private reuseList: ReuseList;
	private nodeRoot: cc.Node;

	private particle: Particle;











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
	private buildUi(): void {

		let menu = new DebugMenu([
			[
				"dispose",
				() => {
					if (this.particle) {
						this.particle.removeFromParent();
						mgrPool.put(this.particle);
						this.particle = null;
					}
				},
			],
			[
				"playOnce",
				() => {
					if (!this.selectedParticleId) return;

					mgrTip.playParticleOnce(this.selectedParticleId, Tools.random(mgrDirector.width), Tools.random(mgrDirector.height));
					// mgrTip.playParticle(this.selectedParticleId, 0, 0);
				},
			],
			[
				"读取数据",
				() => {
					if (!this.selectedParticleId) return;
					ul.dump(jsb);

					let particleData = mgrCfg.get("particle_db", this.selectedParticleId);
					let url = cc.url.raw(ul.format("resources/%s.plist", particleData.filename));
					cc.loader.load(url, (err, data) => {
						cc.log("particle:");
						cc.log(url);
						cc.log(data);



						// let imageData = data.textureImageData;

						// cc.log("cc", cc);
						// let image = new cc["Image"];
						// cc.log(image);
					});
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
					this.onSelectParticleId(cell.data.id);
				}
			})
		});
		reuseList.setSetter((cell, data) => {
			// cc.log("setter", cell, data)
			let color = cc.color(255, 255, 255);
			cell.label.node.color = (data.id == this.selectedParticleId) ? cc.color(127, 255, 127) : cc.color(255, 255, 255);
			cell.label.string = ul.format("%s-%s", data.id, data.name);
		});
		reuseList.setContentSize(this.layoutList.node.getContentSize());

		let datas = [];
		mgrCfg.forDb("particle_db", (k, v) => {
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

	private onSelectParticleId(particleId: string): void {
		this.selectedParticleId = particleId;
		this.reuseList.refreshActiveCells();

		let particleData = mgrCfg.get("particle_db", particleId);
		this.labelTitle.string = ul.format("%s-%s", particleData.id, particleData.name);

		if (this.particle) {
			this.particle.removeFromParent();
			mgrPool.put(this.particle);
			this.particle = null;
		}

		let particle: Particle = mgrPool.get("particle", particleId);
		particle.parent = this.nodeRoot;

		let ps = particle.getComponent(cc.ParticleSystem);

		// Timer.callLater(0.1, () => {
		// 	ps["_sgNode"].setBlendAdditive(false);
		// });

		// 只播放一次的粒子不保存引用
		if (!particleData.bPlayOnce) {
			this.particle = particle;
		}
	}










	////// 事件 /////
	// @view export events begin
	// @view export events end










}