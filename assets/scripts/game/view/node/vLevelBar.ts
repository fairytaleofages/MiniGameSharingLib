
const {ccclass, property} = cc._decorator;

/**
 *  new 一个添加到某个节点上，通过设置样式来进行展示
 */

const DEFAULT_WIDTH = 19;
const DEFAULT_HEIGHT = 17;

@ccclass
export default class vLevelBar extends cc.Node {
    private maxLevel:number = 5;
    private curLevel:number = 5;
    private space:number = -5;
    private itemPath: string = "2d/ui/common/star";
    private layoutStyle:cc.Layout.Type = cc.Layout.Type.HORIZONTAL;

    private levelSprites:object = {};
    //构造函数
    constructor() {
        super();
    }

    /**
     * setItemPath 设置显示的图片路劲， 如果不设置， 那么使用默认的路劲
     */
    public setItemPath(path:string) {
        this.itemPath = path;
    }

    /**
     * setLevel 设置等级， 根据等级来排列
     */
    public setLevel(maxL:number, curL:number) {
        this.maxLevel = maxL;
        this.curLevel = curL;

        this.generate();
    }

    /**
     * setLayoutStyle
     * @param layoutStyle 放置方式
     */
    public setLayoutStyle(layoutStyle:cc.Layout.Type) {
        this.layoutStyle = layoutStyle;
    }

    /**
     * setSpace
     * 
     * @param space 间距
     * */
    public setSpace(space:number) {
        this.space = space;
    }
    

    /**
     * generate
     */
    public generate() {
        for (let index = 0; index < this.maxLevel; index++) {
            let itemNode: cc.Node = this.levelSprites[index];
            if (itemNode == null) {
                itemNode = new cc.Node();
                itemNode.parent = this;
                this.levelSprites[index] = itemNode;

                let sprite = itemNode.addComponent(cc.Sprite);
                sprite.loadSpriteFrame( this.itemPath );

                itemNode.setContentSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
            }
        }

        //生成layout组件
        let layOutComponent = this.getComponent(cc.Layout);
        if (layOutComponent == null) {
            layOutComponent = this.addComponent(cc.Layout);
            layOutComponent.type = this.layoutStyle;
            layOutComponent.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            if (this.layoutStyle == cc.Layout.Type.HORIZONTAL) {
                layOutComponent.spacingX = this.space;    
            }
            else{
                layOutComponent.spacingY = this.space;
            }
            this.setAnchorPoint(0.5,0.5);
            
            
        }

        let i = this.maxLevel;
        for (; i > 0; i--) {
            let itemNode: cc.Node = this.levelSprites[i - 1];
            if (i > this.curLevel) {
                itemNode.active = false;
            }
            else {
                itemNode.active = true;
            }
        }

        layOutComponent.updateLayout();
    }
}