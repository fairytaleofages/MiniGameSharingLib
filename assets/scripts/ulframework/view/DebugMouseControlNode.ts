import mgrDirector from "../../game/manager/mgrDirector";

const { ccclass, property } = cc._decorator;

const BUTTON_MIDDLE = cc.Event.EventMouse.BUTTON_RIGHT;
const BUTTON_RIGHT = cc.Event.EventMouse.BUTTON_MIDDLE;

@ccclass
export default class DebugMouseControlNode extends cc.Node {
    private mousePressd: any;
    private bPressedCtrl: boolean;
    // private _lastMouseX: number;
    // private _lastMouseY: number;
    private _listener: cc.EventListener;

    ///// 生命周期 /////
    constructor() {
        super();

        this.registerEvents();
    }

    cleanup() {
        if (this._listener) {
            cc.eventManager.removeListener(this._listener);
        }
    }









    ///// 内部逻辑 /////
    private registerEvents(): void {
        // cc.log("registerEvents");
        this.mousePressd = {};

        // this._lastMouseX = 0;
        // this._lastMouseY = 0;

        this.registerMouseListener();
    }

    private registerMouseListener(): void {
        // cc.log("registerMouseListener");
        let listener = cc.EventListener.create({
            event: cc.EventListener["MOUSE"],
            onMouseUp: (e) => {
                e.name = "up";
                this.onMouseHandler(e);
            },
            onMouseMove: (e) => {
                e.name = "move";
                this.onMouseHandler(e);
            },
            onMouseDown: (e) => {
                e.name = "down";
                this.onMouseHandler(e);
            },
            onMouseScroll: (e) => {
                e.name = "scroll";
                this.onMouseHandler(e);
            },
        });
        cc.eventManager.addListener(listener, this);
    }









    ///// 事件 /////
    private onCameraTranslation(dx: number, dy: number): void {
        // 高精度模式
        if (this.bPressedCtrl) {
            dx *= 0.1;
            dy *= 0.1;
        }

        let x = this.x;
        let y = this.y;
        this.setPosition(x + dx, y + dy);
    }

    private onCameraZoom(dy: number, x: number, y: number): void {
        dy = cc.misc.clampf(dy, -1, 1);

        // 模拟器上滚轮是反的
        if (cc.sys.isBrowser) {
            dy *= -1;
        }

        // 高精度模式
        if (this.bPressedCtrl) {
            dy *= 0.1;
        }

        let p0 = this.convertToNodeSpace(cc.v2(x, y));
        let scale = this.scale;
        this.scale = Math.max(0.5, scale + (-dy * 0.5));

        let p1 = this.convertToWorldSpace(p0);
        let rx = this.x;
        let ry = this.y;

        this.setPosition(rx + (x - p1.x), ry + (y - p1.y));
    }

    private onMouseHandler(e: cc.Event.EventMouse) {
        let btn = e.getButton();
        let p = e.getLocation();
        // p.y = mgrDirector.size.height - p.y;
        let sx = e.getScrollX();
        let sy = e.getScrollY();

        let name = e["name"];

        // cc.log("onMouseHandler", e["name"], p.x, p.y, btn, sx, sy);
        switch (name) {
            case "down":
                // cc.log("down", btn)
                this.mousePressd[btn] = true;
                break;

            case "move":
                if (this.mousePressd[BUTTON_MIDDLE]) {
                    this.onCameraTranslation(e.getDeltaX(), e.getDeltaY());
                }
                break;

            case "up":
                // cc.log("up", btn)
                this.mousePressd[btn] = false;
                
                if (btn == BUTTON_RIGHT) {
                    // 回归原点
                    this.setPosition(0, 0);
                    this.scale = 1;
                }

                break;

            case "scroll":
                this.onCameraZoom(sy, p.x, p.y);
                break;
        }
    }
}