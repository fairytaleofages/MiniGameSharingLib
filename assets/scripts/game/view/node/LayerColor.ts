import mgrDirector from "../../manager/mgrDirector";

// const { ccclass } = cc._decorator;

// @ccclass
export default class LayerColor extends cc.Node {
    private nodeSprite:cc.Node;

    constructor(color:cc.Color) {
        super();

        let nodeSprite = new cc.Node();
        nodeSprite.parent = this;

        let alpha = color.getA();
        color.setA(255);
        nodeSprite.color = color;
        // cc.log("opacity", nodeSprite, alpha);
        nodeSprite.opacity = alpha;
        color.setA(alpha);
        this.nodeSprite = nodeSprite;

        let sprite = nodeSprite.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        mgrDirector.loadRes("2d/default/white_dot", cc.SpriteFrame, (err, spriteFrame) => {
            if (err) return;
            
            let size = nodeSprite.getContentSize()
            sprite.spriteFrame = spriteFrame;
            nodeSprite.setContentSize(size);

            // cc.log("LayerColor.after loadRes", size, nodeSprite.getAnchorPoint(), nodeSprite.getPosition());
            // cc.log("  ", this.getContentSize(), this.getAnchorPoint(), this.getPosition());
        });
    }

    setContentSize(width: cc.Size | number, height?: number): void {
        super.setContentSize(width, height);

        // cc.log("LayerColor.setContentSize", width, height);

        this.nodeSprite.setContentSize(width, height);

        // cc.log("  after setConentSize", this.getContentSize(), this.nodeSprite.getContentSize());
    }

    setAnchorPoint(x: cc.Vec2 | number, y?: number): void {
        super.setAnchorPoint(x, y);

        // cc.log("LayerColor.setAnchorPoint", x, y);

        this.nodeSprite.setAnchorPoint(x, y);
    }

    set color(c: cc.Color) {
        this["_color"] = c;
        this.nodeSprite.color = c;
    }
}