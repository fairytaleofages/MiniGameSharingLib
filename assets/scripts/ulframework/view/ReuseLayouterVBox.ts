import IReuseLayouter from "./IReuseLayouter";

const { ccclass, property } = cc._decorator;

/**
	垂直布局器

	┌───────┐
	│ ┌───┐ │
	│ │ 1 │ │
	│ └───┘ │
	│ ┌───┐ │
	│ │ 2 │ │
	│ └───┘ │
	│ ┌───┐ │
	│ │ 3 │ │
	│ └───┘ │
	│ ...   │

	local layouter = ul.ReuseLayouterVBox:create()
		:setCellSize(100, 50) 		-- 单元格尺寸（宽、高）
		:setGap(4) 					-- 设置垂直单元格间距
		:setPending(4) 				-- 设置top/bottom单元格，距离顶/底的距离
		:setContainerWidth(120) 	-- 设置容器的宽度
 */
@ccclass
export default class ReuseLayouterVBox implements IReuseLayouter {
    ///// 成员变量 /////
    private cellSize = cc.size(0, 0);
    private gap = 0;
    private pending = 0;
    private containerWidth = 0;
    private cellLeft = 0;










    //// 初始化相关 /////
    /**
     * 设置单元格尺寸
     * @param width 宽度
     * @param height 高度
     */
    public setCellSize(width: number, height: number): ReuseLayouterVBox;

    /**
     * 设置单元格尺寸
     * @param size cc.Size对象
     */
    public setCellSize(size: cc.Size): ReuseLayouterVBox;
    public setCellSize(width: (cc.Size | number), height?: number): ReuseLayouterVBox {
        if (width instanceof cc.Size) {
            this.cellSize = width;
        } else {
            this.cellSize = cc.size(width, height || 0);
        }
        this.tryBuildLeft();

        return this;
    }

    /**
     * 设置单元格间距
     * @param gap 
     */
    public setGap(gap: number): ReuseLayouterVBox {
        this.gap = gap;

        return this;
    }

    /**
     * 设置单元格到边框的间距
     * @param pending 
     */
    public setPending(pending: number): ReuseLayouterVBox {
        this.pending = pending;

        return this;
    }

    /**
     * 设置容器宽度
     * @param containerWidth 
     */
    public setContainerWidth(containerWidth: number): ReuseLayouterVBox {
        this.containerWidth = containerWidth;
        this.tryBuildLeft();
        return this;
    }

    private tryBuildLeft() {
        let cw = this.cellSize.width;
        let pw = this.containerWidth;

        if (cw == 0 || pw == 0) return;

        this.cellLeft = Math.floor((pw - cw) / 2);
    }









    ///// 实现接口 /////
    /**
     * 获取坐标
     * @param index 第几个cell
     */
    getPos(index: number): cc.Vec2 {
        let x = this.cellLeft;
        let y = -this.pending - index * (this.cellSize.height + this.gap);

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
        this.setContainerWidth(size.width);
    }

    /**
     * 获取容器尺寸
     */
    getContainerSize(count: number): cc.Size {
        let height = this.pending * 2 + this.cellSize.height * count + this.gap * (count - 1);
        return cc.size(this.containerWidth, height)
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
        return cc.v2(0, -this.pending);
    }

    /**
     * 是否开启水平滑动
     */
    isHorizontalScroll(): boolean {
        return false;
    }

    /**
     * 是否开启垂直滑动
     */
    isVerticalScroll(): boolean {
        return true;
    }
}