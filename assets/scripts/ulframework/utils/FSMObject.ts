const { ccclass, property } = cc._decorator;

/** 默认状态 */
const ST_NONE = -1

/**
 * 有限状态机
 */
@ccclass
export class FSMObject {
    /** 状态回调 */
    private _states: { [x: number]: { leave: any; execute: any; enter: any; }; };
    /** 下一个状态 */
    private _nextStateID: any;
    /** 当前状态 */
    private _currentStateID: any;




    public constructor() {
        // 预设空状态
        this._currentStateID = ST_NONE
        this._nextStateID = ST_NONE
        this._states = {
            [ST_NONE]: { leave: null, execute: null, enter: null }
        }
    }

    /**
     * 注册状态
     * @param stateID 
     * @param enter 
     * @param execute 
     * @param leave 
     */
    public registerState(stateID: number, enter: () => void = null, execute: (dt: number) => void = null, leave: () => void = null): void {
        if (this._states[stateID] != null) {
            cc.warn("警告] FSMObject.registerState state override!", stateID);
        }
        this._states[stateID] = { enter: enter, execute: execute, leave: leave }
    }

    /**
     * 移除一个状态
     * @param stateID 
     */
    public removeState(stateID: number): void {
        this._states[stateID] = null
    }

    /**
     * 更新
     * @param dt 
     */
    public update(dt: number): void {
        // cc.log( "update state.", this._nextStateID, this._currentStateID )

        if (this._nextStateID != null) {
            var leave = this._states[this._currentStateID].leave
            if (leave) {
                leave()
            }

            this._currentStateID = this._nextStateID
            this._nextStateID = null

            var enter = this._states[this._currentStateID].enter
            if (enter) {
                enter()

                // 如果在enter之后状态发生了变化，重新执行一次
                if (this._nextStateID) {
                    return this.update(dt)
                }
            }
        }

        if (!this._states) return;

        var callback = this._states[this._currentStateID].execute
        if (callback) {
            callback(dt)
        }
    }

    /**
     * 设置next状态
     */
    public setNextState(stateID: number) {
        // cc.log("---setNextState,stateID=",stateID)
        this._nextStateID = stateID
    }

    /**
     * 获取当前状态
     */
    public getState(): number {
        return this._currentStateID
    }


    public getNextState(): number {
        return this._nextStateID
    }

    /**
     * 销毁
     */
    public destroy(): void {
        this._states = null
    }
}