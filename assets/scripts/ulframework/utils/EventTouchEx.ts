const { ccclass, property } = cc._decorator;

@ccclass
export default class EventTouchEx extends cc.Event.EventTouch {
    private CLICK_RANGE_SQ = 20 * 20;

    /**
     * 简写的事件类型：began, moved, ended
     */
    public name:string = "";

    /**
     * 是否为点击
     */
    // PS 这个实现是假的，具体实现代码为后面的prototype
    public isClick():boolean {
        return false;
    }

    public isInClickRange(): boolean {
        return false;
    }
}
const CLICK_RANGE_SQ = 20 * 20;

cc.Event.EventTouch.prototype["isClick"] = function ():boolean {
    // cc.log("isClick", this.name);
    if (!(this.name == "ended" || this.name == "cancelled")) return false;
    let p0 = this.getStartLocation();
    let p1 = this.getLocation();
    // let distance = cc.pDistanceSQ(p0, p1);
    let distance = p0.sub(p1).magSqr();
    // cc.log("isClick", p0, p1, distance);
    return distance <= CLICK_RANGE_SQ;
}

cc.Event.EventTouch.prototype["isInClickRange"] = function (): boolean {
    let p0 = this.getStartLocation();
    let p1 = this.getLocation();
    let distance = p0.sub(p1).magSqr();
    // cc.log("isClick", p0, p1, distance);
    return distance <= CLICK_RANGE_SQ;
}