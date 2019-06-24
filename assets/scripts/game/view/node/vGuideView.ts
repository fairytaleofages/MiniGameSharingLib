import mgrCfg from "../../manager/mgrCfg";
import mgrGuide from "../../manager/mgrGuide";
import Spine from "../../../ulframework/view/Spine";
import mgrPool from "../../manager/mgrPool";
import vGuideMask from "./vGuideMask";
import vGuideTip from "./vGuideTip";
import vGuideArrow from "./vGuideArrow";
import ViewBase from "../../../ulframework/view/ViewBase";
import { GuideMaskType } from "../../Const";
import mgrSound from "../../manager/mgrSound";
import Timer from "../../../ulframework/utils/Timer";
import Tools from "../../../ulframework/utils/Tools";
import mgrDirector from "../../manager/mgrDirector";
import AnimNode from "../../../ulframework/view/AnimNode";

const { ccclass, property } = cc._decorator;

const ACTION_TAG_FADE = 1;
const ACTION_TAG_MOVE = 2;
const TIP_GAP = 10;
const SLIDE_SPEED = 450;

@ccclass
export default class vGuideView extends ViewBase {
    private bHide = false;
    private nodeSpine: cc.Node;
    // private spineClick: Spine;
    private animClick: AnimNode;
    private mask: vGuideMask;
    private tip: vGuideTip;
    private arrow: vGuideArrow;

    private slideIndex: number = 0;










    ///// 生命周期 /////
    onLoad() {
        super.onLoad();
    }

    update(dt: number) {
        super.update(dt);

        this.updatePos();
    }

    onDestroy() {
        super.onDestroy();

        if (!this.bHide) {
            cc.warn("vGuideView.onCleanup 引导异常退出，并没有调用过hideAndRemove函数")
            cc.warn("  尝试取消引导")
            mgrGuide.cancelGuide();
        }

        // if (cc.isValid(this.spineClick)) {
        //     mgrPool.put(this.spineClick);
        //     this.spineClick.removeFromParent();
        //     this.spineClick = null;
        // }
        if (cc.isValid(this.animClick)) {
            mgrPool.put(this.animClick);
            this.animClick.removeFromParent();
            this.animClick = null;
        }
    }









    ///// 内部逻辑 /////
    private buildUi() {
        let guideId = this.context.guideId;
        let step = this.context.step;
        let guideData = mgrCfg.get("guide_db", guideId, step);

        // 如果控件已存在，则销毁
        if (cc.isValid(this.mask)) {
            this.mask.destroy();
            this.mask = null;
        }

        if (cc.isValid(this.tip)) {
            this.tip.destroy();
            this.tip = null;
        }

        if (cc.isValid(this.arrow)) {
            this.arrow.destroy();
            this.arrow = null;
        }

        // // mask
        this.mask = new vGuideMask();
        this.mask.parent = this;
        this.mask.setMaskType(guideData.maskType);

        // tip
        if (guideData.tipContent) {
            this.tip = new vGuideTip({ guideId: guideId, step: step });
            this.tip.parent = this;
        }

        // arrow
        if (guideData.arrowType == "click") {
            let sx = (guideData.bFlipArrow ? -1 : 1)

            let nodeSpine = new cc.Node();
            nodeSpine.parent = this;
            nodeSpine.scaleX = sx;
            nodeSpine.rotation = guideData.arrowRotate;
            this.nodeSpine = nodeSpine;

            let anim = mgrPool.get("animNode", "guideclick");
            anim.parent = nodeSpine;
            this.animClick = anim;

            // let spineClick = mgrPool.get("spine", "ui_guide_click");
            // spineClick.parent = nodeSpine;
            // spineClick.play("mov_1", true);

            // this.spineClick = spineClick;;

        } else if (guideData.arrowType == "slide") {
            this.arrow = new vGuideArrow();
            this.arrow.parent = this;
            this.arrow.scaleX = (guideData.bFlipArrow ? -1 : 1);

            this.playSlideArrowAction();
        }
    }

    private playSlideArrowAction() {
        let guideId = this.context.guideId;
        let step = this.context.step;
        let guideData = mgrCfg.get("guide_db", guideId, step);

        let nodes = mgrGuide.getGuideNodes(guideData.nodeNames);
        // cc.log("playSlideArrowAction", nodes);
        if (nodes.length < 2) {
            cc.warn("vGuideView.playSlideArrowAction nodes not enough!");
            this.arrow.destroy();
            this.arrow = null;
            return;
        }

        let index = this.slideIndex % nodes.length;
        let node = nodes[index];
        let rect = Tools.convertRectToNodeSpace(this, Tools.calcNodeBoundingBoxToWorld(node, guideData.nodeExt));

        if (index == 0) {
            // 第一个点直接移动过去即可
            this.arrow.setPosition(rect.center);
            this.arrow.opacity = 0;
            this.arrow.runAction(cc.sequence(
                cc.fadeIn(0.3),
                cc.callFunc(this.playSlideArrowAction.bind(this)),
            ));

        } else if (index == nodes.length - 1) {
            // 最后一个点移动后淡出
            let temp = this.arrow.position.sub(rect.center).mag();
            let duration = temp / SLIDE_SPEED;
            this.arrow.runAction(cc.sequence(
                cc.moveTo(duration, rect.center),
                cc.fadeOut(0.3),
                cc.callFunc(this.playSlideArrowAction.bind(this)),
            ));

        } else {
            // 中途点，直接移动即可
            let temp = this.arrow.position.sub(rect.center).mag();
            let duration = temp / SLIDE_SPEED;
            this.arrow.runAction(cc.sequence(
                cc.moveTo(duration, rect.center),
                cc.callFunc(this.playSlideArrowAction.bind(this)),
            ));
        }

        // 下一次滑向下一个点
        this.slideIndex++;
    }

    public show() {
        this.buildUi();

        let guideId = this.context.guideId;
        let step = this.context.step;
        let guideData = mgrCfg.get("guide_db", guideId, step);

        // 播放音效
        if (guideData.soundId) {
            mgrSound.play(guideData.soundId);
        }

        // mask淡入
        if (this.mask) {
            this.mask.fadeIn();
        }

        if (this.arrow) {
            this.arrow.stopActionByTag(ACTION_TAG_FADE);
            this.arrow.opacity = 0;
            this.arrow.runAction(cc.fadeIn(0.3)).setTag(ACTION_TAG_FADE);
        }

        if (this.nodeSpine) {
            this.nodeSpine.stopActionByTag(ACTION_TAG_FADE);
            this.nodeSpine.opacity = 0;
            this.nodeSpine.runAction(cc.fadeIn(0.3)).setTag(ACTION_TAG_FADE);
        }

        if (this.tip) {
            this.tip.stopActionByTag(ACTION_TAG_FADE);
            this.tip.opacity = 0;
            this.tip.runAction(cc.fadeIn(0.3)).setTag(ACTION_TAG_FADE);
        }
    }

    public hideAndRemove() {
        this.bHide = true;

        // mask淡出
        if (cc.isValid(this.mask)) {
            this.mask.fadeOut();
        }

        if (cc.isValid(this.arrow)) {
            this.arrow.stopAllActions();
            this.arrow.runAction(cc.fadeOut(0.3));
        }

        if (cc.isValid(this.nodeSpine)) {
            this.nodeSpine.stopAllActions();
            this.nodeSpine.runAction(cc.fadeOut(0.3));
        }

        if (cc.isValid(this.tip)) {
            this.tip.stopAllActions();
            this.tip.runAction(cc.fadeOut(0.3));
        }

        Timer.callLater(0.3, () => { this.destroy() }, this);
    }

    private updatePos() {
        let guideId = this.context.guideId;
        let step = this.context.step;
        let guideData = mgrCfg.get("guide_db", guideId, step);

        let worldRect = this.calcFirstNodeRect();
        let rect = Tools.convertRectToNodeSpace(this, worldRect);
        // cc.log("updatePos", rect);

        // 0. mask
        if (this.mask) {
            this.mask.setRect(worldRect);
        }

        // 1. tip
        if (this.tip) {
            if (rect) {
                let x = 0, y = 0, apx = 0, apy = 0;

                let dir = guideData.tipDir || "left";
                if (dir == "left" || dir == "leftTop" || dir == "leftBottom") { x = rect.x - TIP_GAP; apx = 1; }
                else if (dir == "right" || dir == "rightTop" || dir == "rightBottom") { x = rect.xMax + TIP_GAP; apx = 0; }
                else { x = rect.center.x; apx = 0.5 };

                if (dir == "top" || dir == "leftTop" || dir == "rightTop") { y = rect.yMax + TIP_GAP; apy = 0; }
                else if (dir == "bottom" || dir == "leftBottom" || dir == "rightBottom") { y = rect.y - TIP_GAP; apy = 1; }
                else { y = rect.center.y; apy = 0.5 };

                cc.log("update tipPos", apx, apy, x, y);
                this.tip.setAnchorPoint(apx, apy);
                this.tip.x = x + (guideData.tipOffset[0] || 0);
                this.tip.y = y + (guideData.tipOffset[1] || 0);
            } else {
                // 居中即可
                this.tip.setAnchorPoint(0.5, 0.5);
                this.tip.x = (guideData.tipOffset[0] || 0);
                this.tip.y = (guideData.tipOffset[1] || 0);
            }
        }

        // 2. arrow
        if (this.nodeSpine && guideData.arrowType == "click") {
            // click模式，定位arrow到中心点
            if (!rect) {
                cc.warn("vGuideView.updatePos rect not found!");
            } else {
                if (cc.isValid(this.nodeSpine)) {
                    this.nodeSpine.setPosition(rect.center);
                }
            }
        }
    }

    private calcFirstNodeRect(): cc.Rect {
        let guideId = this.context.guideId;
        let step = this.context.step;
        let guideData = mgrCfg.get("guide_db", guideId, step);
        let nodeName = guideData.nodeNames[0];
        if (!nodeName) return null;

        let node = mgrGuide.getGuideNode(nodeName);
        if (!node) return null;

        return Tools.calcNodeBoundingBoxToWorld(node, guideData.nodeExt);
    }









    ///// 事件 /////










}