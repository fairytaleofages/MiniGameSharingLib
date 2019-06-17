import ScaleableButton from "../../../ulframework/component/ScleableButton";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";
import ViewBase from "../../../ulframework/view/ViewBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vAirDrop extends ViewBase {
	// @view export resources begin
	protected _getResourceName() { return "node/vAirDrop"; }
	protected _getResourceBindingConfig() {
		return {
			CC_buttonItem: {
				varname: "buttonItem",
				vartype: ScaleableButton,
				events: [{ bindMethod: "registerOnTouchCallback", method: "onTouchButtonItem" }],
			},
			CC_nodeUmbrella: { varname: "nodeUmbrella", vartype: cc.Node },
		};
	}
	protected buttonItem: ScaleableButton = null;
	protected nodeUmbrella: cc.Node = null;
	// @view export resources end











	////// 生命周期 /////
	onLoad() {
		super.onLoad();
	}

	onResourceLoaded() {
        super.onResourceLoaded();
        

        this.actionIn();
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

    private actionIn () {
        this.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo( 6, 0, 0 ),
                cc.repeat(
                    cc.sequence(
                        cc.rotateTo( 0.5, 10).easing(cc.easeOut(1.5)),
                        cc.rotateTo( 1, -10).easing(cc.easeInOut(1.5)),
                        cc.rotateTo( 0.5, 0).easing(cc.easeIn(1.5)),
                    ),
                    3
                )
            ),
            cc.callFunc(()=>{
                this.actionUmbrella();
            }),
        ));
    }

    private actionUmbrella () {
        this.nodeUmbrella.runAction( cc.fadeOut(1.0) );
    }






	////// 事件 /////
	// @view export events begin
	onTouchButtonItem(e: EventTouchEx): void {
        if ( !e.isClick() ) {return;}
        
        if ( this.context.fOnclick ) {
            this.context.fOnclick( this.context.type );
        }
	}

	// @view export events end










}
