import ViewBase from "./ViewBase";
import { FSMObject } from '../utils/FSMObject';
import DialogBase from "./DialogBase";
import SceneBase from './SceneBase';

const { ccclass, property } = cc._decorator;

@ccclass
export default class FSMSceneBase extends SceneBase {
    /**
     * 状态机的内部实现
     */
    private _fsmObject: FSMObject;









    ///// 生命周期 /////
    /**
     * 子类覆盖后请务必调用 super.onLoad()!
     * <警告> 子类复用后必须使用super调用父类的接口！
     * @deprecated 禁止覆盖！
     * @requires super.onLoad()
     */
    protected onLoad() {
        this._fsmObject = new FSMObject();
        super.onLoad();
    }

    /**
     * 对应cc.Component.update
     */
    protected update(dt: number) {
        super.update(dt);

        if (this._fsmObject) {
            this._fsmObject.update(dt);
        }
    }

    /**
     * 子类覆盖后请务必调用 super.onDestroy()!
     * <警告> 子类复用后必须使用super调用父类的接口！
     * @deprecated 禁止覆盖！
     * @requires super.onDestroy()
     */
    protected onDestroy() {
        super.onDestroy();

        if (this._fsmObject) {
            this._fsmObject.destroy();
        }
    }










    ///// 实现状态机相关的功能 /////

    /**
     * 获取当前状态
     */
    public getState(): number {
        return this._fsmObject.getState();
    }

    public getNextState():number{
        return this._fsmObject.getNextState();
    }
    /**
     * 设置next状态
     */
    public setNextState(stateID: number): void {
        this._fsmObject.setNextState(stateID);
    }

    /**
     * 移除一个状态
     * @param stateID 
     */
    protected removeState(stateID: number): void {
        this._fsmObject.removeState(stateID);
    }

    /**
     * 注册状态机
     * @param stateID 
     * @param enterName 回调的方法名称
     * @param executeName 回调的方法名称
     * @param leaveName 回调的方法名称
     */
    protected registerState(stateID: number, enterName?: string, executeName?: string, leaveName?: string): void {
        let enter = null;
        let execute = null;
        let leave = null;

        if (enterName) {
            enter = this[enterName];
            if (enter) enter = enter.bind(this);
        }

        if (executeName) {
            execute = this[executeName];
            if (execute) execute = execute.bind(this);
        }

        if (leaveName) {
            leave = this[leaveName];
            if (leave) leave = leave.bind(this);
        }

        this._fsmObject.registerState(stateID, enter, execute, leave);
    }
}