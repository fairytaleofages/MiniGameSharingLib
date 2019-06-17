import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import SceneBase from "../../../ulframework/view/SceneBase";
import ReuseList from "../../../ulframework/view/ReuseList";
import ReuseLayouterVBox from "../../../ulframework/view/ReuseLayouterVBox";
import LayerColor from "../node/LayerColor";
import mgrAlu from "../../manager/mgrAlu";
import mgrCfg from "../../manager/mgrCfg";
import Tools from "../../../ulframework/utils/Tools";
import DebugMenu from "../../../ulframework/view/DebugMenu";
import mgrTip from "../../manager/mgrTip";
import mgrSound from "../../manager/mgrSound";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestSound extends SceneBase {
	// @view export resources begin
	protected _getResourceName() { return "_devtest/TestSound"; }
	protected _getResourceBindingConfig() {
		return {
			CC_layoutBg: { varname: "layoutBg", vartype: cc.Layout },
			CC_layoutList: { varname: "layoutList", vartype: cc.Layout },
			CC_sliderEffect: { varname: "sliderEffect", vartype: cc.Slider },
			CC_sliderMusic: { varname: "sliderMusic", vartype: cc.Slider },
		};
	}
	protected layoutBg: cc.Layout = null;
	protected layoutList: cc.Layout = null;
	protected sliderEffect: cc.Slider = null;
	protected sliderMusic: cc.Slider = null;
	// @view export resources end

	private reuseList: ReuseList;
	private selectedSoundId: number;

	private audioId: number;











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
		let reuseList = new ReuseList()
		reuseList.parent = this.layoutList.node;
		reuseList.setLayouter(new ReuseLayouterVBox()
			.setCellSize(300 - 8, 50)
			.setGap(4)
			.setPending(4));
		reuseList.setCreator((cell) => {
			let layerBg = new LayerColor(cc.color(0, 0, 0, 255));
			layerBg.parent = cell;
			layerBg.setContentSize(cell.getContentSize());
			cell.layerBg = layerBg;

			let nodeLabel = new cc.Node();
			nodeLabel.parent = cell;
			let label = nodeLabel.addComponent(cc.Label);
			label.fontSize = 18;
			label.verticalAlign = cc.Label.VerticalAlign.CENTER;
			// label.overflow = cc.Label.Overflow.SHRINK;
			cell.label = label;

			Tools.registerTouchHandler(cell, (e) => {
				if (!e.isClick()) return;
				this.onSelectSound(cell.data.id);
			});
		});
		reuseList.setSetter((cell, data) => {
			// cc.log("setter", cell, data)
			cell.label.string = ul.format("%d[%d]-%s", data.id, data.type, data.name);
			cell.label.node.color = this.selectedSoundId == data.id ? cc.color(0, 255, 0) : cc.color(255, 255, 255);
		});
		reuseList.setContentSize(this.layoutList.node.getContentSize());

		let datas = [];
		mgrCfg.forDb("sound_db", (k, v) => {
			datas.push(v);
		})
		reuseList.setDatas(datas);

		let menu = new DebugMenu([
			[
				"播放",
				() => {
					let soundId = this.selectedSoundId;
					if (!soundId) {
						mgrTip.showMsgTip("请先选择一个声音");
						return;
					}

					mgrSound.play(soundId);
				},
			],
			[
				"停止",
				() => {
					mgrSound.stopAll();
				},
			],
		], 250, 50, 4)
		menu.parent = this;
		menu.x = -this.width / 2 + 10 + 310;
		menu.y = this.height / 2 - 60;
		
		this.sliderMusic.node.on("slide", this.onSlideSliderMusic.bind(this));
		this.sliderEffect.node.on("slide", this.onSlideSliderEffect.bind(this));

		// 读取默认值
		this.sliderMusic.progress = mgrSound.getMusicVolmue();
		this.sliderEffect.progress = mgrSound.getEffectVolume();

		this.reuseList = reuseList;
	}

	private onSelectSound(soundId: number) {
		this.selectedSoundId = soundId;
		this.reuseList.refreshActiveCells();
	}










	////// 事件 /////
	// @view export events begin
	// @view export events end

	private onSlideSliderMusic(e) {
		let slider = e.target.getComponent(cc.Slider);
		cc.log("onSlideSliderMusic", slider.progress);

		mgrSound.setMusicVomue(slider.progress);
	}

	private onSlideSliderEffect(e) {
		let slider = e.target.getComponent(cc.Slider);
		cc.log("onSlideSliderEffect", slider.progress);

		mgrSound.setEffectVolume(slider.progress);
	}











}






