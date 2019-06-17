export default interface IReuseLayouter {
    /**
     * 获取坐标
     * @param index 第几个cell
     */
    getPos(index: number): cc.Vec2;
    
    /**
     * 获取单元格size
     */
    getCellSize(): cc.Size;

    /**
     * 设置列表size
     */
    setListSize(size: cc.Size): void;

    /**
     * 获取容器尺寸
     */
    getContainerSize(count: number): cc.Size;
    
    /**
     * 获取边距
     */
    getPending(): number;

    /**
     * 获取jump偏移值
     */
    getJumpOffset(): cc.Vec2;

    /**
     * 是否开启水平滑动
     */
    isHorizontalScroll(): boolean;

    /**
     * 是否开启垂直滑动
     */
    isVerticalScroll(): boolean;
}