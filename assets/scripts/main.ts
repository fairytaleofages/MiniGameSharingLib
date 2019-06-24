const {ccclass, property} = cc._decorator;

/**
 * 程序入口
 */
@ccclass
export default class main extends cc.Component {
    @property({type: cc.Node})
    public sceneRoot: cc.Node = null


    start () {
        let view = null;
        // if (cc.sys.isNative) {
        //     view = new vUpdaterScene();
        // }else {
            // view = new vLoadingScene();
        // }

        // let view = new vLoadingScene();
        view.parent = this.sceneRoot;
    }
}
