import IReuseLayouter from "./IReuseLayouter";

const { ccclass, property } = cc._decorator;

/**
	水平布局器

	┌────────────────────────────────────
	│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
	│ │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │
	│ └───┘ └───┘ └───┘ └───┘ └───┘ ...
	└────────────────────────────────────

	local layouter = ul.ReuseLayouterHBox:create()
		:setCellSize(100, 50) 		-- 单元格尺寸（宽、高）
		:setGap(4) 					-- 设置水平单元格间距
		:setPending(4) 				-- 设置left/right单元格，距离左/右的距离
 */
@ccclass
export default class ReuseLayouterHBox implements IReuseLayouter {
    ///// 成员变量 /////
    private cellSize = cc.size(0, 0);
    private gap = 0;
    private pending = 0;
    private containerHeight = 0;
    private cellTop = 0;










    //// 初始化相关 /////
    /**
     * 设置单元格尺寸
     * @param width 宽度
     * @param height 高度
     */
    public setCellSize(width: number, height: number): ReuseLayouterHBox;

    /**
     * 设置单元格尺寸
     * @param size cc.Size对象
     */
    public setCellSize(size: cc.Size): ReuseLayouterHBox;
    public setCellSize(width: (cc.Size | number), height?: number): ReuseLayouterHBox {
        if (width instanceof cc.Size) {
            this.cellSize = width;
        } else {
            this.cellSize = cc.size(width, height || 0);
        }
        this.tryBuildHeight();

        return this;
    }

    /**
     * 设置单元格间距
     * @param gap 
     */
    public setGap(gap: number): ReuseLayouterHBox {
        this.gap = gap;

        return this;
    }

    /**
     * 设置单元格到边框的间距
     * @param pending 
     */
    public setPending(pending: number): ReuseLayouterHBox {
        this.pending = pending;

        return this;
    }

    /**
     * 设置容器高度
     * @param containerHeight 
     */
    public setContainerHeight(containerHeight: number): ReuseLayouterHBox {
        this.containerHeight = containerHeight;
        this.tryBuildHeight();
        return this;
    }

    private tryBuildHeight() {
        let ch = this.cellSize.height;
        let ph = this.containerHeight;

        if (ch == 0 || ph == 0) return;

        this.cellTop = Math.floor((ph - ch) / 2);
    }









    ///// 实现接口 /////
    /**
     * 获取坐标
     * @param index 第几个cell
     */
    getPos(index: number): cc.Vec2 {
        let x = this.pending + index * (this.cellSize.width + this.gap);
        let y = -this.cellTop;

        x += this.cellSize.width / 2;
        y -= this.cellSize.height / 2;

        return cc.v2(x, y);
    }

    /**
     * 获取单元格size
     */
    getCellSize(): cc.Size {
        return this.cellSize;
    }

    /**
     * 设置列表size
     */
    setListSize(size: cc.Size): void {
        this.setContainerHeight(size.height);
    }

    /**
     * 获取容器尺寸
     */
    getContainerSize(count: number): cc.Size {
        let width = this.pending * 2 + this.cellSize.width * count + this.gap * (count - 1);
        return cc.size(width, this.containerHeight);
    }

    /**
     * 获取边距
     */
    getPending(): number {
        return this.pending;
    }

    /**
     * 获取jump偏移值
     */
    getJumpOffset(): cc.Vec2 {
        return cc.v2(-this.pending, 0);
    }

    /**
     * 是否开启水平滑动
     */
    isHorizontalScroll(): boolean {
        return true;
    }

    /**
     * 是否开启垂直滑动
     */
    isVerticalScroll(): boolean {
        return false;
    }
}