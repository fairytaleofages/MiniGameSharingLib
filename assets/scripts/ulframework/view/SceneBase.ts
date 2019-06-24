import ViewBase from "./ViewBase";
import mgrDirector from "../../game/manager/mgrDirector";

const { ccclass } = cc._decorator;

@ccclass
export default class SceneBase extends ViewBase {
    onResourceLoaded() {
        super.onResourceLoaded();

        this.refreshSize();

        this.registerListeners({
            MSG_VIEW_RESIZE: this.onMsgViewResize,
        });

        this.sendMsg( "MSG_SCENE_LOADED" )
    }

    private refreshSize() {
        let size = mgrDirector.size
        this.setContentSize(size);
        this.nodeResource.setContentSize(size);

        let widgets = this.nodeResource.getComponentsInChildren(cc.Widget);
        for (let i = 0; i < widgets.length; i++) {
            const widget = widgets[i];
            widget.updateAlignment();
        }
    }

    private onMsgViewResize() {
        this.refreshSize();
    }
}