import ReuseList from "./ReuseList";
import Tools from "../utils/Tools";
import EventTouchEx from "../utils/EventTouchEx";

const { ccclass, property } = cc._decorator;

/**
 * 因不影响已有功能，故不往reuseList里面添加任何代码，
 * 所以需要确保在setter过后一定要有 主动调用 onContainerMoved
 * 
 * sample
 *  let cellScale1 = 0.82;
    let cellScale2 = 1;
    let cellWidth = 400 * cellScale1;
    let cellHeight = 500 * cellScale1;
    let listSize = this.nodeList.getContentSize();

    let layouterB = new ReuseLayouterHBox()
        .setCellSize(cellWidth, cellHeight)
        .setGap(5)
        .setPending((listSize.width - cellWidth) / 2)
    reusePageView = new ReusePageView();
    reusePageView.parent = this.nodeList;
    reusePageView.setContentSize(this.nodeList.getContentSize());
    reusePageView.setLayouter(layouterB);
    reusePageView.setCreator((cell) => {
        let layerBg = new LayerColor(cc.color(0, 0, 0, 63));
        layerBg.parent = cell;
        layerBg.setContentSize(cell.getContentSize());
        cell.item = layerBg;
    });
    reusePageView.setSetter((cell, data) => {
        // cell.item.fillData( data );
        cell.item.setScale( cellScale1 );
    });
    // 位置代码
    reusePageView.setOnCellMovedListener( ( cell: any, centerRatio: number, distance: number ) => {
        let scale = Tools.scaleInRange( centerRatio, 0, 1, cellScale1, cellScale2 );
        cell.item.setScale( scale );
        cell.zIndex = ( listSize.width - distance );
    });
 */

@ccclass
export default class ReusePageView extends ReuseList {

    private fOnCellMoved = null;    // cell 移动回调 需先设置
    private indexWhenBegan: number = 0;
    private touchBeganTime: number = 0;

    constructor() {
        super();
        Tools.registerTouchHandler( this, this.onTouchHandler.bind(this) );
    }

    /**
     * 额外添加一层触摸事件 提供翻页功能
     * @param e 
     */
    private onTouchHandler ( e:EventTouchEx ) {
        if ( e.name == "began" ) {
            let nearestIndex = this.calcNearestIndex();
            this.indexWhenBegan = nearestIndex;
            this.touchBeganTime = new Date().getTime();
        } else if (e.name == "ended" || e.name == "cancelled") {
            let nearestIndex = this.calcNearestIndex();
            let p0 = e.getStartLocation();
            let p1 = e.getLocation();
            let time = (new Date().getTime() - this.touchBeganTime) / 100;
            let speed = ( p0.x - p1.x ) / time;


            let maxIndex = this.datas.length - 1;
            if ( nearestIndex >= 0 ) {
                if ( nearestIndex == this.indexWhenBegan ) {
                    if ( speed >= 50 && nearestIndex < maxIndex ) {
                        nearestIndex = nearestIndex + 1;
                    } 
                    else if ( speed <= -50 && nearestIndex > 0 ) {
                        nearestIndex = nearestIndex - 1;
                    }
                }

                if (nearestIndex == 0 && this.indexWhenBegan == 0 && speed < 0 ) {
                    // 左边向左 有 自动回弹 不进行任何动作
                }
                else if ( nearestIndex == maxIndex && this.indexWhenBegan == maxIndex && speed > 0 ) {
                    // 右边向右 有 自动回弹 不进行任何动作
                } 
                else {
                    this.scrollToIndex( nearestIndex, null, 0.5, true );
                }

            }

        }
    }

    // 获得最近的index，cocos2d用的是 cell index，这边用的是 data index
    public calcNearestIndex (): number {
        let listCenterInScrollX = this.getListCenterInScrollX();

        let nearestDistance = Number.POSITIVE_INFINITY;
        let nearestIndex = -1;
        for (let index = 0; index < this.cells.length; index++) {
            const cell = this.cells[index];
            let cellSize = cell.getContentSize();
            let cellPos = cell.getPosition();
            let cellCenterX = cellPos.x// + cellSize.width / 2;
            let distance = Math.abs( listCenterInScrollX - cellCenterX );
            if ( distance < nearestDistance ) {
                nearestDistance = distance;
                // nearestIndex = index;
                nearestIndex = cell.__data_index;
            }
        }

        return nearestIndex;
    }

    public getCellByDataIndex ( dataIndex: number ) {
        for (let index = 0; index < this.cells.length; index++) {
            const element = this.cells[index];
            if ( element.__data_index == dataIndex ) {
                return element;
            }
        }
    }

    // 获得 当前滚动 在列表中心 的x偏移
    public getListCenterInScrollX () {
        let scrollView: cc.ScrollView = this.getComponent( cc.ScrollView );
        let p = scrollView.getScrollOffset();
        let listSize = this.getContentSize();
        let listCenterX = listSize.width / 2;
        let listCenterInScrollX = listCenterX - p.x;

        return listCenterInScrollX;
    }


    // 位置移动时调用 或 重新setter时调用
    public onContainerMoved ( e? ) {
        super.onContainerMoved();

        if ( this.fOnCellMoved ) {
            let listCenterInScrollX = this.getListCenterInScrollX();
            for (let index = 0; index < this.cells.length; index++) {
                const cell: cc.Node = this.cells[index];
                let cellSize = cell.getContentSize();
                let cellPos = cell.getPosition();
                let cellCenterX = cellPos.x// + cellSize.width / 2;

                let distance = Math.abs( listCenterInScrollX - cellCenterX );
                let angle = Tools.scaleInRange( distance, 5, cellSize.width, 0, Math.PI / 2 );
                let canterRatio = Tools.scaleInRange( Math.sin(angle), 0, 1, 1, 0 );

                this.fOnCellMoved( cell, canterRatio, distance );
            }
        }

    }

    // 回调（关于大小缩放的，如不需要大小缩放，可以不用设置回调）
    public setOnCellMovedListener ( callback: any ) {
        this.fOnCellMoved = callback;
    }


}