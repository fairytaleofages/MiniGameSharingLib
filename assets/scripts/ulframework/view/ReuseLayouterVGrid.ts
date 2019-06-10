import IReuseLayouter from "./IReuseLayouter";

const { ccclass, property } = cc._decorator;

/**
	垂直网格布局器

	┌───────────────────┐
	│ ┌───┐ ┌───┐ ┌───┐ │
	│ │ 1 │ │ 2 │ │ 3 │ │
	│ └───┘ └───┘ └───┘ │
	│ ┌───┐ ┌───┐ ┌───┐ │
	│ │ 4 │ │ 5 │ │ 6 │ │
	│ └───┘ └───┘ └───┘ │
	│ ┌───┐ ┌───┐ ┌───┐ │
	│ │ 7 │ │ 8 │ │ 9 │ │
	│ └───┘ └───┘ └───┘ │
	│ ...               │

	local layouter = ul.ReuseLayouterVGrid:create()
		:setCellSize(100, 50) 		-- 单元格尺寸（宽、高）
		:setCols(3) 				-- 设置每行单元格的列数
		:setGap(4, 4) 				-- 设置单元格指尖的间距（水平间距、垂直间距）
		:setPending(4) 				-- 设置top/bottom单元格，距离顶/底的距离
 */
@ccclass
export default class ReuseLayouterVGrid implements IReuseLayouter {
    ///// 成员变量 /////
    private cellSize = cc.size(0, 0);
    private cols = 0;
    private hgap = 0;
    private vgap = 0;
    private pending = 0;
    private containerWidth = 0;
    private cellLeft = 0;










    //// 初始化相关 /////
    /**
     * 设置单元格尺寸
     * @param width 宽度
     * @param height 高度
     */
    public setCellSize(width: number, height: number): ReuseLayouterVGrid;

    /**
     * 设置单元格尺寸
     * @param size cc.Size对象
     */
    public setCellSize(size: cc.Size): ReuseLayouterVGrid;
    public setCellSize(width: (cc.Size | number), height?: number): ReuseLayouterVGrid {
        if (width instanceof cc.Size) {
            this.cellSize = width;
        } else {
            this.cellSize = cc.size(width, height || 0);
        }
        this.tryBuildLeft();

        return this;
    }

    /**
     * 设置水平方向有多少个单元格
     * @param cols 
     */
    public setCols(cols: number): ReuseLayouterVGrid {
        this.cols = cols;
        this.tryBuildLeft();

        return this;
    }

    /**
     * 设置单元格间距
     */
    public setGap(hgap: number, vgap: number): ReuseLayouterVGrid {
        this.hgap = hgap;
        this.vgap = vgap;

        return this;
    }

    /**
     * 设置单元格到边框的间距
     * @param pending 
     */
    public setPending(pending: number): ReuseLayouterVGrid {
        this.pending = pending;

        return this;
    }

    /**
     * 设置容器宽度
     * @param containerWidth 
     */
    public setContainerWidth(containerWidth: number): ReuseLayouterVGrid {
        this.containerWidth = containerWidth;
        this.tryBuildLeft();
        return this;
    }

    private tryBuildLeft() {
        let cols = this.cols;
        let cw = this.cellSize.width;
        let pw = this.containerWidth;
        let gap = this.hgap;

        if (cols == 0 || cw == 0 || pw == 0) return;

        let cellsWidth = cols * cw + (cols - 1) * gap;
        this.cellLeft = Math.floor((pw - cellsWidth) / 2);
    }









    ///// 实现接口 /////
    /**
     * 获取坐标
     * @param index 第几个cell
     */
    getPos(index: number): cc.Vec2 {
        let col = (index % this.cols)
        let row = Math.floor(index / this.cols)

        let x = this.cellLeft + col * (this.cellSize.width + this.hgap)
        let y = -this.pending - row * (this.cellSize.height + this.vgap)

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
        let rows = Math.ceil(count / this.cols);

        let height = this.pending * 2 + this.cellSize.height * rows + this.vgap * (rows - 1);
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