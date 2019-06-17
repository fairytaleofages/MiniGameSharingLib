import mgrDirector from "../../game/manager/mgrDirector";
import LayerColor from "../../game/view/node/LayerColor";
import Tools from "../utils/Tools";
import EventTouchEx from "../utils/EventTouchEx";
import ViewBase from "./ViewBase";
import Const from "../../game/Const";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DialogBase extends ViewBase {
    ///// 静态方法 /////
    public static GLOBAL_DIALOG_COUNT = 0;
    /**
     * 是否有弹出框存在
     */
    public static hasDialogExists(): boolean {
        return this.GLOBAL_DIALOG_COUNT > 0;
    }

    /** 当前存在的views */
    public static CUR_VIEWS = {};

    /** view 名字 */
    private _viewName: string = "";


    /**
     * 构造方法
     * @param context 上下文
     */
    constructor(context: any = {}) {
        super( context );
        let viewName = context.__viewName || ""
        if ( !!viewName ) {
            this._viewName = viewName;
            DialogBase.CUR_VIEWS[ viewName ] = true;
        }
    }

    /** 清除所有views的标志 */
    public static clearViews () {
        DialogBase.CUR_VIEWS = {};
    }




    ///// 生命周期 /////
    static ACTION_TAG_OPEN = 1
    static ACTION_TAG_CLOSE = 2

    private layerShadow: cc.Node;
    private nodeRoot: cc.Node;
    protected bClosing = false;
    private DEFAULT_SHADOW_OPACITY = 200;

    private bOpenCompleted = false;

    protected onLoad() {
        super.onLoad();

        // cc.log("DialogBase.onLoad");
        DialogBase.GLOBAL_DIALOG_COUNT++;
        // cc.log("@@@retain:", DialogBase.GLOBAL_DIALOG_COUNT);
    }

    protected onResourceLoaded () {
        super.onResourceLoaded();

        // 判断是否需要action
        if (this.context.bImmediately) {
            if (this.layerShadow) {
                this.layerShadow.active = true;
            }
            this._onOpenDialogCompleted();

        } else {
            // 使用action打开
            let duration = 0.3
            if (this.layerShadow) {
                this.layerShadow.active = true;
                this.layerShadow.opacity = 0;
                this.layerShadow.runAction(
                    cc.fadeTo(duration, this.getShadowOpacity())
                ).setTag(DialogBase.ACTION_TAG_OPEN);
            }

            if (this.bClosing) return;

            let animation = this.getComponent(cc.Animation);
            if (cc.isValid(animation)) {
                let aniState = animation.play("defaultDialogOpen");
                aniState.speed = aniState.duration / duration;

                animation.on("finished", () => {
                    this._onOpenDialogCompleted();
                    animation.targetOff(this);
                }, this);

                animation.setCurrentTime(1 / 60)

            } else {
                // animation未找到，使用action打开
                this.scale = 0.5;
                this.runAction(cc.sequence(
                    cc.scaleTo(duration, 1).easing(cc.easeBackOut()),
                    cc.callFunc(this._onOpenDialogCompleted.bind(this))
                )).setTag(DialogBase.ACTION_TAG_OPEN);
            }
        }


    }

    protected onDestroy() {
        super.onDestroy();

        // cc.log("DialogBase.onDestroy");
        DialogBase.GLOBAL_DIALOG_COUNT--;
        // cc.log("@@@reduce:", DialogBase.GLOBAL_DIALOG_COUNT);

        if (!this.bClosing) {
            this.bClosing = true;

            if (this.context.fOnDialogClose && this.context.fOnDialogClose instanceof Function) {
                this.context.fOnDialogClose();
            }
        }
    }

    /**
     * 弹出框打开后的回调
     */
    private _onOpenDialogCompleted() {
        this.onOpenDialogCompleted();

        this.bOpenCompleted = true;
    }

    protected onOpenDialogCompleted() {

    }

    protected _loadResource() {
        // 加载animation
        let animation = this.getComponent(cc.Animation);
        if (!animation) {
            animation = this.addComponent(cc.Animation);

            let clips = [
                mgrDirector.tryGetRes("2d/animation/defaultDialogOpen", cc.AnimationClip),
                mgrDirector.tryGetRes("2d/animation/defaultDialogClose", cc.AnimationClip),
            ]

            for (let i = 0; i < clips.length; i++) {
                animation.addClip(clips[i])
            }
        }

        super._loadResource();
    }










    ///// 内部逻辑 //////










    ///// 接口 //////
	/**
	 * 打开弹出框
	 * @param bImmediately true：立即打开，忽略action
	 */
    public openDialog(bImmediately: boolean = false) {
        // 插入到scene中
        let UIRoot = mgrDirector.getUIRoot()

        this.nodeRoot = new cc.Node();
        this.nodeRoot.parent = UIRoot;
        this.nodeRoot.zIndex = (Const.GLOBAL_ORDER_DIALOG);

        // 加载layerShadow
        if (this.isShadowEnabled()) {
            let layerShadow = new LayerColor(cc.color(0, 0, 0, this.getShadowOpacity()));
            layerShadow.setContentSize(cc.winSize);
            layerShadow.zIndex = (-1);
            layerShadow.parent = this.nodeRoot;
            layerShadow.active = false;

            Tools.registerTouchHandler(layerShadow, this.onTouchLayerShadow.bind(this), true);

            this.layerShadow = layerShadow;
        }
        bImmediately = bImmediately || this.context.bImmediately;
        this.context.bImmediately = bImmediately;

        
        this.parent = this.nodeRoot;


        // this.sendMsg("MSG_GUIDE_POINT", { id: "DialogBase.openDialog" });
    }

	/**
	 * 
	 * @param bImmediately true：立即关闭，忽略action
	 */
    public closeDialog(bImmediately: boolean = false) {
        if (this.bClosing) return;
        DialogBase.CUR_VIEWS[this._viewName] = false;

        this.bClosing = true;

        this.closeDialogEx(bImmediately);
    }

    private closeDialogEx(bImmediately: boolean) {
        // this.sendMsg("MSG_GUIDE_POINT", { id: "DialogBase.closeDialog" });

        // cc.log("closeDialog", this.context);

        // 触发回调
        if (this.context.fOnDialogClose && this.context.fOnDialogClose instanceof Function) {
            this.context.fOnDialogClose();
        }

        // 处理layerShadow
        if (cc.isValid(this.layerShadow)) {
            Tools.unregisterTouchHandler(this.layerShadow);
            this.layerShadow.stopActionByTag(DialogBase.ACTION_TAG_OPEN);
        }

        // 停止node的动作
        this.stopActionByTag(DialogBase.ACTION_TAG_OPEN);

        // 判断是否需要播放关闭的action
        if (cc.isValid(this.nodeRoot)) {
            if (bImmediately) {
                // 直接关闭
                this.nodeRoot.destroy()
            } else {
                // 播放动画关闭
                let duration = 0.2;

                if (this.layerShadow) {
                    this.layerShadow.runAction(
                        cc.fadeOut(duration)
                    )//.setTag(DialogBase.ACTION_TAG_CLOSE);
                }
                this.runAction(cc.spawn(
                    cc.scaleTo(duration, 1.2, 0).easing(cc.easeBackIn()),
                    cc.sequence(
                        cc.delayTime(duration * 0.7),
                        cc.fadeOut(duration * 0.3).easing(cc.easeOut(2.0)),
                        cc.callFunc(() => {
                            this.nodeRoot.destroy()
                        }),
                    )
                )).setTag(DialogBase.ACTION_TAG_CLOSE);

            }
        }
    }










    ///// 子类钩子函数 /////
    /**
     * 是否开启shadow
     */
    protected isShadowEnabled(): boolean {
        return true;
    }

    /**
     * 获取shadow透明度
     * @returns 0-255
     */
    protected getShadowOpacity(): number {
        return this.DEFAULT_SHADOW_OPACITY;
    }

    /**
     * 点击shadow后是否关闭弹出框
     */
    protected isClickShadowClose(): boolean {
        return true;
    }

    /**
     * 播放开启后的音效
     * 默认不处理，如果需求，子类复写本方法后播放
     */
    protected playOpenDialogSound(): void {

    }










    ///// 事件 //////
    onTouchLayerShadow(e: EventTouchEx) {
        if (!e.isClick()) return;

        if (!this.bOpenCompleted) {
            cc.warn("DialogBase.onTouchLayerShadow dialog is opening");
            return;
        }

        if (this.isClickShadowClose()) {
            this.sendMsg("MSG_GUIDE_POINT", { id: "DialogBase.shadow.click" });
            this.closeDialog();
        }
    }
}