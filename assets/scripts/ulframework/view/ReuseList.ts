import IReuseLayouter from "./IReuseLayouter";
import LayerColor from "../../game/view/node/LayerColor";
import Timer from "../utils/Timer";
import ViewBase from "./ViewBase";

const { ccclass, property } = cc._decorator;

/**
	复用型列表
    
    形态：
    ReuseList为一个节点
    自身的size和锚点，对应为scrollView所在的区域（裁剪也是裁剪这个范围）
    
    裁剪使用this.addComponent(cc.Mask)实现
    ScrollView使用this.addComponent(cc.ScrollView)实现
    
    所有的内容放在
    nodeContainer中，这是this的第一子节点，并绑定在ScrollView.content中
    nodeContainer的锚点固定为0, 1（左上角）
    
    每个cell是一个独立的cc.Node，锚点为[0.5, 0.5]
    

	大量数据的列表，每个data对应一个cell，会来带巨大的性能开销
	针对这种情况，封装了这个复用型列表 re-use list

	列表的滑动是基于ccui.ScrolView完成的

	layouer:
		列表中cell的布局，通过布局器完成，目前已集成的布局器有
		ReuseLayouterVBox
		ReuseLayouterHBox
		ReuseLayouterVGrid
		ReuseLayouterHGrid

	creator:
		cell样式的编辑通过creator完成
		每个cell第一次初始化的时候会调用一次creator
		creator用于创建cell的子控件，例：

		creator = function(cell)
			cell.label = cc.Label:createWithSystemFont("", nil, 24)
		end

		ps: creator期间是没有data的，需要将子控件的创建和赋值逻辑分离

	setter:
		cell被使用的时候，会和一个data进行绑定
		setter用于对cell中的控件赋值，例：

		setter = function(cell, data)
			cell.label:setString(tostring(data.id))
		end

	其他方法，具体查询各个方法头部的注释

	ReuseList使用sample：

	local layouter = ul.ReuseLayouterVGrid:create()
		:setCellSize(131, 144)
		:setCols(4)
		:setGap(6, 10)
		:setPending(10)

	local list = ul.ReuseList:create()
		:addTo(self)
		:setCreator(function(cell)
			local item = self:getApp():createView("node.vShopItemNormal", {
				fOnClick = function(shopId)
					self:selectShopItem(shopId)
				end
				})
				:addTo(cell)
			cell.item = item

			end)
		:setSetter(function(cell, data)
			-- print("setter", cell.__cell_id, data.id)
			cell.item:fillByShopId(data.id)
			cell.item:setSelected(data.id == self.selectedId)
			end)
		:setLayouter(layouter)
		-- :setDebugLineEnabled(true)
		-- :setClippingEnabled(true)
		-- :setBounceEnabled(true)
		-- :setReuseEnabled(true)
		:setContentSize(display.width - 20, display.height - 20)
		:setAnchorPoint(0, 0)
		:move(10, 10)
 */
@ccclass
export default class ReuseList extends cc.Node {
    ///// 成员变量 /////
    private _CELL_ID = 0;

    protected datas: any[] = [];
    protected cells: any[] = [];
    private cellPool = [];

    private layouter: IReuseLayouter;
    private creator: (cell: any) => void;
    private setter: (cell: any, data: any) => void;

    private bInit = false;

    private nodeContainer: cc.Node;

    private bDebugLineEnabled = false;
    private bClippingEnabled = true;
    private bReuseEnabled = true;
    private bElasticEnabled = true;
    private bTouchScrollEnabled = true;

    private bAsyncSetterEnabled = false;
    private asyncTimer: Timer;

    private asyncSetterTasks: any[];

    private fOnContainerMoved = null;







    ///// 生命周期 /////
    constructor() {
        super();
    }

    private onAsyncTimerSpan(timer: Timer) {
        // cc.log("onAsyncTimerSpan");

        let tasks = this.asyncSetterTasks;
        if (tasks != null && tasks.length > 0) {
            let task = tasks[0];
            tasks.splice(0, 1);

            let cell = task[0];
            let data = task[1];

            // cc.log("call setter", cell, data)
            this.setter(cell, data);
            cell.active = true;
        }
    }









    ///// 内部逻辑 /////
    private init() {
        let layouter = this.layouter;
        let size = this.getContentSize();

        // 设置布局器的尺寸
        layouter.setListSize(size);

        // 背景
        if (this.bDebugLineEnabled) {
            let layer = new LayerColor(cc.color(255, 255, 0, 63));
            layer.parent = this;
            layer.setContentSize(this.getContentSize());
            layer.setAnchorPoint(this.getAnchorPoint());
        }

        // 创建内容节点
        let nodeContainer = new cc.Node();
        nodeContainer.setAnchorPoint(0, 1);
        nodeContainer.parent = this;
        nodeContainer.setPosition(0,0)
        this.nodeContainer = nodeContainer;

        // 创建scrollView
        let scrollView = this.addComponent(cc.ScrollView);
        scrollView.horizontal = layouter.isHorizontalScroll();
        scrollView.vertical = layouter.isVerticalScroll();
        scrollView.content = nodeContainer;
        scrollView.cancelInnerEvents = false;
        scrollView.elastic = this.bElasticEnabled;

        // 处理屏蔽scroll touch操作相关代码
        // 拦截ScrollView的onEnable函数，在enable后调用_tryApplayTouchScrollEnabled
        let __origin_onEnable = scrollView["onEnable"];
        scrollView["onEnabled"] = () => {
            __origin_onEnable();
            this._tryApplayTouchScrollEnabled();
        };
        this._tryApplayTouchScrollEnabled();

        // 蒙版
        if (this.bClippingEnabled) {
            let mask = this.addComponent(cc.Mask);
        }

        // 注册scrolling事件
        this.on("scrolling", this.onScrolling, this);
    }

    /**
     * 重新加载列表
     * 所有单元格会被放回pool，重新分配
     */
    public reloadList(): void {
        // 检查必要的接口
        if (this.layouter == null) { cc.log("[错误] ReuseList.reloadList layouter not found!"); return; }
        if (this.creator == null) { cc.log("[错误] ReuseList.reloadList creator not found!"); return; }
        if (this.setter == null) { cc.log("[错误] ReuseList.reloadList setter not found!"); return; }

        // 初始化
        if (!this.bInit) {
            this.bInit = true;
            this.init();
        }

        let layouter = this.layouter;
        let datas = this.datas;
        let cells = this.cells;

        let listSize = this.getContentSize();
        let containerSize = layouter.getContainerSize(datas.length);

        let containerWidth = Math.max(listSize.width, containerSize.width);
        let containerHeight = Math.max(listSize.height, containerSize.height);

        // cc.log("containerWidth, containerHeight", containerWidth, containerHeight)

        // 提取relaod之前的scroll位置
        let scrollView = this.getComponent(cc.ScrollView);
        let originOffset = scrollView.getScrollOffset();

        this.nodeContainer.setContentSize(containerWidth, containerHeight);

        // 还原reload之前的位置
        scrollView.scrollToOffset(originOffset);

        // 回收所有的cell
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            this.putCellToPool(cell);
        }
        this.cells = [];

        this.onContainerMoved();
    }

    /**
     * 更新单元格的状态
     * 按照列表当前的可视范围，处理单元格的激活、取消激活逻辑
     * 这个方法经过优化，流程比较绕
     */
    public updateCellState(): void {
        // cc.log("updateCellState")

        let layouter = this.layouter;
        let nodeContainer = this.nodeContainer;
        let datas = this.datas;
        let cells = this.cells;

        let apx = this.width * this.anchorX;
        let apy = this.height * this.anchorY;

        // nodeConent基于parent的左下角的坐标
        let x = nodeContainer.x + apx;
        let y = nodeContainer.y + apy;

        // cc.log("  x, y", x, y);

        let listSize = this.getContentSize();
        let top = -(y - listSize.height);
        let bottom = -y;
        let left = -x;
        let right = -x + listSize.width;
        let cellSize = layouter.getCellSize();
        let cw = cellSize.width;
        let ch = cellSize.height;

        let isCellActive = (i: number) => {
            if (!this.bReuseEnabled) return true;

            let p = layouter.getPos(i);

            return bottom < p.y + ch / 2 &&
                p.y - ch / 2 < top &&
                left < p.x + cw / 2 &&
                p.x - cw / 2 < right;
        };

        // cc.log("  top", top);
        // cc.log("  bottom", bottom);
        // cc.log("  left", left);
        // cc.log("  right", right);

        // for (let i = 0; i < datas.length; i++) {
        //     const data = datas[i];
        //     cc.log(i, data, isCellActive(i));
        // }

        // 1. 从cell头部开始遍历
        // cc.log("1. 从头部开始遍历")
        let deletePending = [];
        for (let ci = 0; ci < cells.length; ci++) {
            const cell = cells[ci];
            let di = cell.__data_index;

            if (!isCellActive(di)) {
                deletePending.push(ci)
                // cc.log("  remove");
            } else {
                // cc.log("  找到了有效的cell，break");
                break;
            }
        }
        for (let i = deletePending.length - 1; i >= 0; i--) {
            const ci = deletePending[i];
            let cell = cells[ci];
            cells.splice(ci, 1);
            this.putCellToPool(cell);
        }

        let firstCell = cells[0];
        if (firstCell) {
            let index = firstCell.__data_index;
            // cc.log("1.2 index向前找", index, 0);
            for (let di = index - 1; di >= 0; di--) {
                if (isCellActive(di)) {
                    // cc.log("  在范围内，添加")
                    let cell = this.getCellFromPool();
                    cells.splice(0, 0, cell);

                    let data = datas[di];
                    this._callCellSetter(cell, data);

                    cell.__data_index = di;
                    cell.zIndex = (di);
                    cell.data = data;
                    cell.setPosition(layouter.getPos(di));
                    // cc.log("move", di, layouter.getPos(di))
                } else {
                    // cc.log("  不在范围内，remove")
                    break;
                }
            }
        } else {
            // cc.log("  一个cell都没找到，拉通遍历一次");
            for (let di = 0; di < datas.length; di++) {
                if (isCellActive(di)) {
                    // cc.log("  在范围内，添加")
                    let cell = this.getCellFromPool();
                    cells.push(cell);

                    let data = datas[di];
                    this._callCellSetter(cell, data);

                    cell.__data_index = di;
                    cell.zIndex = (di);
                    cell.data = data;
                    cell.setPosition(layouter.getPos(di));
                    // cc.log("move", di, layouter.getPos(di))
                }
            }
        }

        // cc.log("2. 从末尾开始遍历")
        // cc.log("2.1 遍历cell尝试删除", cells.length - 1, 0);
        for (let ci = cells.length - 1; ci >= 0; ci--) {
            const cell = cells[ci];
            let di = cell.__data_index;

            if (!isCellActive(di)) {
                // cc.log("  不再范围内，remove")
                this.putCellToPool(cell);
                cells.splice(ci, 1);
            } else {
                // cc.log("  在范围内，break");
                break;
            }
        }

        let lastCell = cells[cells.length - 1];
        if (lastCell) {
            let index = lastCell.__data_index;

            // cc.log("2.2 向后遍历cell", index + 1, datas.length - 1);
            for (let di = index + 1; di < datas.length; di++) {
                if (isCellActive(di)) {
                    // cc.log("  在范围内，添加")
                    let cell = this.getCellFromPool();
                    cells.push(cell);

                    let data = datas[di];
                    this._callCellSetter(cell, data);

                    cell.__data_index = di;
                    cell.zIndex = (di);
                    cell.data = data;
                    cell.setPosition(layouter.getPos(di));
                    // cc.log("move", di, layouter.getPos(di))
                }
            }
        }
    }

    /** 从缓冲池中取一个cell */
    private getCellFromPool(): any {
        let pool = this.cellPool;
        let cell = null;
        if (pool.length > 0) {
            cell = pool.splice(0, 1)[0];
        }

        if (!cell) {
            let cellSize = this.layouter.getCellSize();

            this._CELL_ID++;

            cell = new ViewBase();
            cell.parent = this.nodeContainer;
            cell.setContentSize(cellSize);
            cell["__cell_id"] = this._CELL_ID;

            this.creator(cell);

            // cc.log("create cell", cell.__cell_id)

            if (this.bDebugLineEnabled) {
                let nodeGraphics = new cc.Node();
                nodeGraphics.setContentSize(cellSize);
                nodeGraphics.parent = cell;
                let graphics = nodeGraphics.addComponent(cc.Graphics);
                graphics.clear();
                graphics.lineWidth = 2;
                graphics.strokeColor = cc.color(255, 255, 0, 255);
                graphics.rect(0, 0, cellSize.width, cellSize.height);
                graphics.stroke();

                let nodeLabel = new cc.Node();
                nodeLabel.parent = cell;
                let label = nodeLabel.addComponent(cc.Label);
                label.string = cell["__cell_id"].toString();
                label.fontSize = 14;
                nodeLabel.setAnchorPoint(0, 1);
                nodeLabel.setPosition(-cellSize.width / 2 + 2, cellSize.height / 2 - 2);
                nodeLabel.color = cc.color(255, 255, 0, 255);
            }
        }

        cell.active = true;

        return cell;
    }

    /** 将cell放回缓冲池 */
    private putCellToPool(cell: any) {
        cell.active = false;
        this.cellPool.push(cell);
    }

    /** 计算百分比的坐标 */
    private _calcPercentPos(x: number, y: number): cc.Vec2 {
        let listSize = this.getContentSize();
        let containerSize = this.nodeContainer.getContentSize();
        let percentX = x / (containerSize.width - listSize.width);
        let percentY = y / (containerSize.height - listSize.height);

        percentY = 1 - percentY;

        // cc.log("percent", percentX, percentY);

        percentX = cc.misc.clampf(percentX, 0, 1);
        percentY = cc.misc.clampf(percentY, 0, 1);

        return cc.v2(percentX, percentY);
    }

    /**
     * 调用cell的setter方法
     * 如果是异步加载模式，则将当前的cell添加的异步加载队列中
     * @param cell 
     * @param data 
     */
    private _callCellSetter(cell: any, data: any) {
        if (this.bAsyncSetterEnabled) {
            // 异步处理，添加到tasks中
            let tasks = this.asyncSetterTasks;
            if (tasks == null) {
                tasks = [];
                this.asyncSetterTasks = tasks;
            }

            // 加入队列前隐藏cell
            cell.active = false;

            // 检测队列中是否有该cell的setter任务
            for (let i = tasks.length - 1; i >= 0; i--) {
                let task = tasks[i];
                if (task[0] == cell) {
                    tasks.splice(i, 1);
                }
            }

            // 添加任务
            tasks.push([cell, data]);

        } else {
            // 同步处理，直接调用
            this.setter(cell, data);
        }
    }









    ///// getters and setters /////

    /**
     * 设置布局器
     * @param layouter 
     */
    public setLayouter(layouter: IReuseLayouter): ReuseList {
        this.layouter = layouter;
        return this;
    }

    /**
     * 设置单元格构建器
     * 每个单元格 会且只会被调用一次creator
     * @param creator 
     */
    public setCreator(creator: (cell: any) => void): ReuseList {
        this.creator = creator;
        return this;
    }

    /**
     * 设置单元格的设置器
     * 每个单元格需要刷新数据时会被调用
     * @param setter 
     */
    public setSetter(setter: (cell: any, data: any) => void): ReuseList {
        this.setter = setter;
        return this;
    }

    /**
     * 设置数据集
     * 设置后会重新加载列表
     * @param datas 数组格式的数据 [{}, {}, {}];
     */
    public setDatas(datas: any[]): ReuseList {
        this.datas = datas;

        this.reloadList();

        return this;
    }

    /**
     * 获取数据集
     * 请勿干坏事！
     */
    public getDatas(): any[] {
        return this.datas;
    }

    /**
     * 通过筛选器获取已激活的单元格数组
     * @param fFilter return true -> 通过筛选
     */
    public getActiveCellsByFilter(fFilter: (cell: any) => boolean): any[] {
        let cells = [];

        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (fFilter(cell)) {
                cells.push(cell);
            }
        }

        return cells;
    }

    /** 设置是否绘制debugLine */
    public setDebugLineEnabled(enabled: boolean): ReuseList {
        this.bDebugLineEnabled = enabled;
        return this;
    }

    /** 是否开启复用 */
    public setReuseEnabled(enabled: boolean): ReuseList {
        this.bReuseEnabled = enabled;
        return this;
    }

    /** 设置是否开启蒙版 */
    public setClippingEnabled(enabled: boolean): ReuseList {
        this.bClippingEnabled = enabled;
        return this;
    }

    /** 是否允许滚动超过边界 */
    public setElasticEnabled(enabled: boolean): ReuseList {
        this.bElasticEnabled = enabled;
        return this;
    }

    /** 是否允许触摸滑动 */
    public setTouchScrollEnabled(enabled: boolean): ReuseList {
        this.bTouchScrollEnabled = enabled;
        this._tryApplayTouchScrollEnabled();
        return this;
    }

    /**
     * 应用禁用scrollView触摸的配置
     * 由于scrollView没有提供单纯的setTouchEnabled函数
     * 这里直接禁用scrollView，但是恢复scrollView的update调用
     */
    private _tryApplayTouchScrollEnabled() {
        let scrollView = this.getComponent(cc.ScrollView);
        if (!cc.isValid(scrollView)) return;

        if (!this.bTouchScrollEnabled) {
            // 注销scrollView的touch事件
            scrollView["_unregisterEvent"]();


        } else {
            // 恢复scrollView的touch事件
            scrollView["_registerEvent"]()
        }
    }

    /** 设置是否开异步加载模式*/
    public setAsyncSetterEnabled(enabled: boolean): ReuseList {
        this.bAsyncSetterEnabled = enabled;

        if (enabled) {
            if (this.asyncTimer == null) {
                cc.log("start Timer");
                this.asyncTimer = new Timer(1 / 60, -1, this.onAsyncTimerSpan.bind(this));
                this.asyncTimer.startAndBindToNode(this);
            }
        } else {
            if (this.asyncTimer != null) {
                this.asyncTimer.stop();
            }
        }

        return this;
    }

    /** 设置内容移动的回调 */
    public setOnContainerMoved(callback): ReuseList {
        this.fOnContainerMoved = callback;
        return this;
    }










    ///// 外部接口 //////

    /** 
     * 刷新已激活的所有单元格
     * 依次调用对应的settter方法
     */
    public refreshActiveCells(): void {
        let cells = this.cells;
        let datas = this.datas;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            let data = datas[cell.__data_index];
            this._callCellSetter(cell, data);
        }
    }

    /** 跳转到列表头部 */
    public jumpToHead(): void {
        this.scrollToHead(0, false);
    }

    /** 跳转到列表尾部 */
    public jumpToTail(): void {
        this.scrollToTail(0, false);
    }

    /**
     * 跳转到指定的index
     * @param index 
     * @param offset 偏移值
     */
    public jumpToIndex(index: number, offset?: cc.Vec2): void {
        this.scrollToIndex(index, offset, 0, false);
    }

    /**
     * 跳转到指定的index
     * @param index 
     * @param offset 偏移值
     */
    public jumpToData(data: any, offset?: cc.Vec2): void {
        this.scrollToData(data, offset, 0, false);
    }

    /**
     * 滑动到头部
     * @param timeInSecond defaultValue = 0.3
     * @param attenuated defaultValue = true
     */
    public scrollToHead(timeInSecond = 0.3, attenuated = true): void {
        let scrollView = this.getComponent(cc.ScrollView);

        if (scrollView.vertical && scrollView.horizontal) scrollView.scrollToTopLeft(timeInSecond, attenuated);
        else if (scrollView.vertical) scrollView.scrollToTop(timeInSecond, attenuated);
        else if (scrollView.horizontal) scrollView.scrollToLeft(timeInSecond, attenuated);

        if (timeInSecond <= 0) this.onContainerMoved();
    }

    /**
     * 滑动到列表尾部
     * @param timeInSecond defaultValue = 0.3
     * @param attenuated defaultValue = true
     */
    public scrollToTail(timeInSecond = 0.3, attenuated = true): void {
        let scrollView = this.getComponent(cc.ScrollView);

        if (scrollView.vertical && scrollView.horizontal) scrollView.scrollToBottomRight(timeInSecond, attenuated);
        else if (scrollView.vertical) scrollView.scrollToBottom(timeInSecond, attenuated);
        else if (scrollView.horizontal) scrollView.scrollToRight(timeInSecond, attenuated);

        if (timeInSecond <= 0) this.onContainerMoved();
    }

    /**
     * 滑动到到指定的cellIndex
     * @param index
     * @param offset 偏移值
     * @param timeInSecond defaultValue = 0.3
     * @param attenuated defaultValue = true
     */
    public scrollToIndex(index: number, offset?: cc.Vec2, timeInSecond = 0.3, attenuated = true): void {
        let scrollView = this.getComponent(cc.ScrollView);

        cc.log("jumpToIndex", index);

        let cellPos = this.layouter.getPos(index);
        let cellSize = this.layouter.getCellSize();

        let x = cellPos.x;
        let y = -cellPos.y;

        // 定位到cell的left top位置
        let jumpOffset = this.layouter.getJumpOffset();
        x += -cellSize.width / 2 + jumpOffset.x;
        y += -cellSize.height / 2 + jumpOffset.y;

        // 计算百分比
        let percentPos = this._calcPercentPos(x, y);

        scrollView.stopAutoScroll();
        scrollView.scrollTo(percentPos, timeInSecond, attenuated);
        this.onContainerMoved();
    }

    /**
     * 滑动到到指定的cellData
     * @param data
     * @param offset 偏移值
     * @param timeInSecond defaultValue = 0.3
     * @param attenuated defaultValue = true
     */
    public scrollToData(data: any, offset?: cc.Vec2, timeInSecond = 0.3, attenuated = true): void {
        let index = this.datas.indexOf(data);
        if (index < 0) return;

        this.scrollToIndex(index, offset, timeInSecond, attenuated);
    }







    ///// 事件 /////

    /** container移动事件 */
    public onContainerMoved(e?) {
        
        this.updateCellState();

        if (this.fOnContainerMoved) {
            this.fOnContainerMoved(this, this.cells);
        }

    }

    private onScrolling(e) {
        this.onContainerMoved(e);
    }










}