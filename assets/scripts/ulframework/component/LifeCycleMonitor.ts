
const { ccclass, property } = cc._decorator;

@ccclass
export default class LifeCycleMonitor extends cc.Component {
    private fOnLoad = null;
    private fStart = null;
    private fUpdate = null;
    private fOnDestroy = null;









    ///// 生命周期 //////
    onLoad() {
        if (this.fOnLoad) {
            this.fOnLoad();
        }
    }

    start() {
        if (this.fStart) {
            this.fStart();
        }
    }

    update(dt: number) {
        if (this.fUpdate) {
            this.fUpdate(dt);
        }
    }

    onDestroy() {
        if (this.fOnDestroy) {
            this.fOnDestroy();
        }
    }









    ///// 接口 /////
    public setOnLoadCallback(callback: () => void) {
        this.fOnLoad = callback;
    }
    
    public setUpdateCallback(callback: () => void) {
        this.fUpdate = callback;
    }

    public setStartCallback(callback: () => void) {
        this.fStart = callback;
    }

    public setOnDestroyCallback(callback: () => void) {
        this.fOnDestroy = callback;
    }









}