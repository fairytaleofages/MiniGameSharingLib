// const { ccclass } = cc._decorator;

// @ccclass
export default class Timer {
    ///// 静态方法 /////
    /**
     * 延迟调用回调
     * @param span 时间（秒）
     * @param callback 回调
     * @param node? 可选，绑定到节点上
     */
    public static callLater(span: number, callback: ((timer: Timer) => void), node?: cc.Node): void {
        let timer = new Timer(span, 1, callback);
        
        if (node) {
            timer.startAndBindToNode(node);
        } else {
            timer.start();
        }
    }

    /**
     * 启动循环调用timer
     * @param span 间隔时间（秒）
     * @param callback 回调
     * @param bIgnoreForeverWarn true:永久调用，不报警
     */
    public static callLoop(span: number, callback: ((timer: Timer) => void), bIgnoreForeverWarn: boolean): void;
    /**
     * 启动循环调用timer，绑定在宿主节点上
     * @param span 间隔时间（秒）
     * @param callback 回调
     * @param node 宿主节点，节点销毁后timer停止
     */
    public static callLoop(span: number, callback: ((timer: Timer) => void), node?:cc.Node):void;
    public static callLoop(span: number, callback: ((timer: Timer) => void), e?: cc.Node|boolean): void {
        let timer = new Timer(span, -1, callback);

        // cc.log("callLoop", span, callback, e);

        if (e == true) {
            // boolean 模式重载
            let bIgnoreForeverWarn = e;
            timer.start(bIgnoreForeverWarn);
            
        } else if (e instanceof cc.Node) {
            // node 模式重载
            let node = e;
            timer.startAndBindToNode(e);

        } else {
            timer.start();
        }
    }











    ///// 生命周期 /////
    private _repeatCount:number = -1;
    private _span:number = 1;
    private _callback:((timer:Timer)=>void) = null;
    private _intervalId:number = null;
    private _count:number = 0;

    private _bindingNode: cc.Node;

    /**
     * 构造一个Timer
     * @param span 间隔（秒）
     * @param times 重复次数，-1为永久运行
     * @param callback 回调
     */
    constructor(span: number, repeatCount:number, callback:((timer:Timer)=>void)) {
        this._span = span;
        this._repeatCount = repeatCount;
        this._callback = callback;
    }

    private _onSpan(): void {
        // 次数+1
        this._count++;

        // 调用回调
        if (this._callback) {
            try {
                this._callback(this);
            } catch (error) {
                cc.warn("警告] Timer._onSpan callback has error", error);
            }
        }

        // 检测是否需要停止
        if (this._repeatCount >= 0 && this._count >= this._repeatCount) {
            this.stop();
        }
    }









    ///// 接口 /////
    /**
     * 判断Timer是否正在运行
     */
    public isRunning(): boolean {
        return this._intervalId != null;
    }

    /**
     * 获取当前运行的次数
     */
    public get count():number {
        return this._count;
    }

    /**
     * 获取运行间隔
     */
    public get span(): number {
        return this._span;
    }

    /**
     * 判断timer是否正在运行
     * @param parent 宿主node
     */
    startAndBindToNode(parent: cc.Node):Timer {
        // cc.log("startAndBindToNode", parent)
        let node = new cc.Node();
        let component = node.addComponent(cc.Component);
        if (component._isOnLoadCalled == 0) {
            component["onLoad"] = () => {
                // cc.log("onLoad")
                this.start(true);
            }
        } else {
            // onLoad已经错过了
            this.start(true);
        }

        component["onDestroy"] = () => {
            this.stop()
        };
        node.parent = parent;

        this._bindingNode = node;

        return this;
    }

    /**
     * 开始timer
     * @param bIgnoreForeverWarn 是否禁用永久运行警告（无宿主的永久运行timer，在start时会给予警告）
     */
    start(bIgnoreForeverWarn: boolean = false):Timer {
        this.stop();

        if (!this._callback) {
            cc.warn("警告] Timer.start callback未设置！");
            return this;
        }

        // 如果是无限循环模式，给予警告
        if (!bIgnoreForeverWarn && this._repeatCount < 0) {
            cc.warn("警告] Timer.start, this timer will never stop!");
            cc.warn("警告]     please use startAndBindToNode");
            cc.warn("警告]     or your can stop timer in callback. use e:stop()");
            // console.trace();
        }

        this._count = 0;
        this._intervalId = setInterval(this._onSpan.bind(this), this.span * 1000);

        return this;
    }

    /**
     * 停止timer
     */
    stop(): Timer {
        if (this._intervalId != null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
        return this;
    }










}