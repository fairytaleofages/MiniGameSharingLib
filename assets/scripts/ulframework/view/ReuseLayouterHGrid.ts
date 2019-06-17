import IReuseLayouter from "./IReuseLayouter";

const { ccclass, property } = cc._decorator;

/**
	水平网格布局器

	┌───────────────────
	│ ┌───┐ ┌───┐ ┌───┐
	│ │ 1 │ │ 3 │ │ 5 │
	│ └───┘ └───┘ └───┘
	│ ┌───┐ ┌───┐ ┌───┐
	│ │ 2 │ │ 4 │ │ 6 │
	│ └───┘ └───┘ └───┘

	local layouter = ul.ReuseLayouterHGrid:create()
		:setCellSize(100, 50) 		-- 单元格尺寸（宽、高）
		:setRows(3) 				-- 设置每行单元格的列数
		:setGap(4, 4) 				-- 设置单元格指尖的间距（水平间距、垂直间距）
		:setPending(4) 				-- 设置top/bottom单元格，距离顶/底的距离
 */
@ccclass
export default class ReuseLayouterHGrid implements IReuseLayouter {
    ///// 成员变量 /////
    private cellSize = cc.size(0, 0);
    private rows = 0;
    private hgap = 0;
    private vgap = 0;
    private pending = 0;
    private containerHeight = 0;
    private cellTop = 0;










    //// 初始化相关 /////
    /**
     * 设置单元格尺寸
     * @param width 宽度
     * @param height 高度
     */
    public setCellSize(width: number, height: number): ReuseLayouterHGrid;

    /**
     * 设置单元格尺寸
     * @param size cc.Size对象
     */
    public setCellSize(size: cc.Size): ReuseLayouterHGrid;
    public setCellSize(width: (cc.Size | number), height?: number): ReuseLayouterHGrid {
        if (width instanceof cc.Size) {
            this.cellSize = width;
        } else {
            this.cellSize = cc.size(width, height || 0);
        }
        this.tryBuildTop();

        return this;
    }

    /**
     * 设置水平方向有多少个单元格
     * @param rows 
     */
    public setRows(rows: number): ReuseLayouterHGrid {
        this.rows = rows;
        this.tryBuildTop();

        return this;
    }

    /**
     * 设置单元格间距
     */
    public setGap(hgap: number, vgap: number): ReuseLayouterHGrid {
        this.hgap = hgap;
        this.vgap = vgap;

        return this;
    }

    /**
     * 设置单元格到边框的间距
     * @param pending 
     */
    public setPending(pending: number): ReuseLayouterHGrid {
        this.pending = pending;

        return this;
    }

    /**
     * 设置容器宽度
     * @param containerHeight 
     */
    public setContainerHeight(containerHeight: number): ReuseLayouterHGrid {
        this.containerHeight = containerHeight;
        this.tryBuildTop();
        return this;
    }

    private tryBuildTop() {
        let rows = this.rows;
        let ch = this.cellSize.height;
        let ph = this.containerHeight;
        let gap = this.vgap;

        if (rows == 0 || ch == 0 || ph == 0) return;

        let cellsHeight = rows * ch + (rows - 1) * gap;
        this.cellTop = Math.floor((ph - cellsHeight) / 2);
    }









    ///// 实现接口 /////
    /**
     * 获取坐标
     * @param index 第几个cell
     */
    getPos(index: number): cc.Vec2 {
        let col = Math.floor(index / this.rows);
        let row = (index % this.rows);

        let x = this.pending + col * (this.cellSize.width + this.hgap);
        let y = -this.cellTop - row * (this.cellSize.height + this.vgap);

        // let x = this.cellTop + col * (this.cellSize.width + this.hgap)
        // let y = -this.pending - row * (this.cellSize.height + this.vgap)

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
        let cols = Math.ceil(count / this.rows);

        let width = this.pending * 2 + this.cellSize.width * cols + this.hgap * (cols - 1);
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