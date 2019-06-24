import Tools from "../utils/Tools";
import EventTouchEx from "../utils/EventTouchEx";


const { ccclass, property } = cc._decorator;

/**
 * 可缩放的按钮
 * 对标2dx时代的onTouchWithAction
 */
@ccclass
export default class ScaleableButton extends cc.Component {
    ///// 静态变量区 /////
    private static soundPlayHandler: () => void = null;

    /**
     * 设置播放声音回调
     * @param callback 
     */
    public static setSoundPlayHandler(callback: () => void): void {
        this.soundPlayHandler = callback;
    }









    private fOnTouchCallback = null;
    private _bFocused = false;
    private isAction = true;

    private touchDownRect: cc.Rect;










    ///// 生命周期 /////
    onLoad() {
    }

    onEnable() {
        Tools.registerTouchHandler(this.node, this.onTouchHandler.bind(this));
    }

    onDisable() {
        Tools.unregisterTouchHandler(this.node)
    }

    public registerOnTouchCallback(callback: (e: EventTouchEx) => void): void {
        this.fOnTouchCallback = callback;
    }

    private triggerOnTouchCallback(e: EventTouchEx) {
        if (this.fOnTouchCallback) {
            this.fOnTouchCallback(e);
        }
    }

    private _doDownAction(sx: number, sy: number) {
        if (this.isAction == false) {
            return;
        }
        let node = this.node;
        node.stopAllActions();
        node.runAction(
            cc.scaleTo(0.1, 0.85 * sx, 0.85 * sy).easing(cc.easeIn(2)),
        );
    }

    private _doUpAction(sx: number, sy: number) {
        if (this.isAction == false) {
            return;
        }
        let node = this.node;
        node.stopAllActions();
        node.runAction(cc.sequence(
            cc.scaleTo(0.1, 1.1 * sx, 1.1 * sy).easing(cc.easeIn(2)),
            cc.scaleTo(0.075, 0.95 * sx, 0.95 * sy),
            cc.scaleTo(0.03, 1 * sx, 1 * sy),
        ));
    }

    private _doCancellAction(sx: number, sy: number) {
        if (this.isAction == false) {
            return;
        }
        let node = this.node;
        node.stopAllActions();
        node.runAction(cc.sequence(
            cc.scaleTo(0.15, 1.05 * sx, 1.05 * sy).easing(cc.easeQuadraticActionInOut()),
            cc.scaleTo(0.1, 1 * sx, 1 * sy).easing(cc.easeOut(2)),
        ));
    }

    //设置是否有action
    public setActionEnable(enable: boolean) {
        this.isAction = enable;
    }







    ///// 事件 //////
    onTouchHandler(e: EventTouchEx) {
        let sx = 1;
        let sy = 1;

        // 处理缩放相关
        if (e.name == "began") {
            this.touchDownRect = Tools.calcNodeBoundingBoxToWorld(this.node);
            // cc.log("down", this.touchDownRect);
            // cc.log("  p", e.getLocation());

            this._doDownAction(sx, sy);
            this._bFocused = true;

            if (ScaleableButton.soundPlayHandler instanceof Function) {
                ScaleableButton.soundPlayHandler();
            }

        } else if (e.name == "moved") {
            // let bInNode = Tools.isWorldLocaInNode(this.node, e.getLocation());

            // 由于this.node伴随action会改变尺寸，可能导致缩小后，down的点就不在范围内了
            // let bInNode = cc.rectContainsPoint(this.touchDownRect, e.getLocation())
            let bInNode = this.touchDownRect.contains( e.getLocation() );
            // cc.log("move", this.touchDownRect);
            // cc.log("  p", e.getLocation());

            if (this._bFocused) {
                if (!bInNode) {
                    this._bFocused = false;
                    this._doCancellAction(sx, sy);
                }
            } else {
                if (bInNode) {
                    this._bFocused = true;
                    this._doDownAction(sx, sy);
                }
            }

        } else {
            // cancelled or ended
            // cc.log("end", this._bFocused, e.isClick());
            if (this._bFocused) {
                this._bFocused = false;
                this._doUpAction(sx, sy);
            }
        }

        this.triggerOnTouchCallback(e);
    }









}