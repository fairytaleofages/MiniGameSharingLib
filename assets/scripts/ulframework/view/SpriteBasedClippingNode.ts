// const { ccclass, property } = cc._decorator;

const OUT_SCREEN_X = 1024 * 1024;

let ONE = 1;
let ZERO = 0;
let SRC_ALPHA = 770;
let SRC_COLOR = 768;
let DST_ALPHA = 772;
let DST_COLOR = 774;
let ONE_MINUS_SRC_ALPHA = 771;
let ONE_MINUS_SRC_COLOR = 769;
let ONE_MINUS_DST_ALPHA = 773;
let ONE_MINUS_DST_COLOR = 77;

// @ccclass
export default class SpriteBasedClippingNode extends cc.Node {
    /** 是否翻转蒙版 */
    private bInverted = false;
    /** 渲染节点 */
    private nodeRender: cc.Node;
    /** 蒙版节点 */
    private nodeStencil: cc.Node;
    /** 渲染宽度 */
    private renderWidth: number;
    /** 渲染高度 */
    private renderHeight: number;
    /** renderTexture */
    private renderTexture: any;









    ///// 生命周期 /////
    public constructor(renderWidth: number, renderHeight: number) {
        super();

        this.renderWidth = renderWidth;
        this.renderHeight = renderHeight;

        this.setContentSize(renderWidth, renderHeight);

        let renderTexture = new cc["RenderTexture"](renderWidth, renderHeight);
        this["_sgNode"].addChild(renderTexture);
        this.renderTexture = renderTexture;

        let nodeRender = new cc.Node();
        nodeRender.parent = this;
        nodeRender.x = OUT_SCREEN_X;
        nodeRender.y = renderHeight / 2;
        this.nodeRender = nodeRender;

        let nodeStencil = new cc.Node();
        nodeStencil.parent = this;
        nodeStencil.x = OUT_SCREEN_X;
        nodeStencil.y = renderHeight / 2;
        this.nodeStencil = nodeStencil;
    }









    ///// 内部逻辑 /////









    ///// 外部接口 /////
    /**
     * 设置是否翻转蒙版
     * @param bInverted false*默认值:只有蒙版中透明的部分才显示原图 true:只有蒙版中不透明的部分才显示原图
     */
    public setInverted(bInverted: boolean): void {

    }

    /**
     * 获取渲染节点
     * 需要渲染的东西直接添加到渲染节点中
     * 渲染节点位于ClippingNode的中心位置
     */
    public getRenderNode(): cc.Node {
        return this.nodeRender;
    }

    /**
     * 获取蒙版节点
     * 用于裁剪的蒙版节点，需要当做蒙版的节点添加到蒙版节点中
     * 蒙版节点位于ClippingNode的中心位置
     */
    public getStencilNode(): cc.Node {
        return this.nodeStencil;
    }

    /**
     * 刷新renderTexture
     */
    public flush(): void {
        let nodeRender = this.nodeRender;
        let nodeStencil = this.nodeStencil;
        let renderTexture = this.renderTexture;

        renderTexture.clear(0, 0, 0, 0);
        renderTexture.begin();

        // 绘制visit部分
        nodeRender.x = this.renderWidth / 2;
        nodeRender["_sgNode"].visit();
        nodeRender.x = OUT_SCREEN_X

        // 绘制蒙版部分
        // 提取所有的Sprite组件，设置混色模式
        let dstBlendFactor = this.bInverted ? SRC_ALPHA : ONE_MINUS_SRC_ALPHA;
        let sprites = nodeStencil.getComponentsInChildren(cc.Sprite);
        for (let i = 0; i < sprites.length; i++) {
            let sprite = sprites[i];
            sprite.srcBlendFactor = ZERO;
            sprite.dstBlendFactor = dstBlendFactor;
        }

        nodeStencil.x = this.renderWidth / 2;
        nodeStencil["_sgNode"].visit();
        nodeStencil.x = OUT_SCREEN_X

        renderTexture.end();
    }










}