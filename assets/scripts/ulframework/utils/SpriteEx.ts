import mgrDirector from "../../game/manager/mgrDirector";

/**
 * 加载贴图
 * @param url 贴图资源url
 */
cc.Sprite.prototype["loadSpriteFrame"] = function (url: string): void {
    mgrDirector.loadRes(url, cc.SpriteFrame, (err, spriteFrame) => {
        if (err) {
            cc.error(err.message);
            return;
        }

        if (!cc.isValid(this)) return;

        this.spriteFrame = spriteFrame;
    });
}

/**
 * 加载贴图并保持sprite的尺寸
 * @param url 贴图资源url
 */
cc.Sprite.prototype["loadSpriteFrameAndKeepSize"] = function (url: string): void {
    let node: cc.Node = this.node;
    if (!node) {
        cc.warn("SpriteEx.loadSpriteFrameAndKeepSize node not found!");
        return;
    }

    mgrDirector.loadRes(url, cc.SpriteFrame, (err, spriteFrame) => {
        if (err) {
            cc.error(err.message);
            return;
        }

        if (!cc.isValid(this)) return;

        if (!this["__origin_width"]) {
            this["__origin_width"] = node.width * node.scaleX;
            this["__origin_height"] = node.height * node.scaleY;
        }

        let ow: number = this["__origin_width"];
        let oh: number = this["__origin_height"];

        this.spriteFrame = spriteFrame;

        node.scale = Math.min(ow / node.width, oh / node.height)
    });
}

/**
 * 加载贴图并保持sprite的尺寸
 * @param spriteFrame
 */
cc.Sprite.prototype["setSpriteFrameAndKeepSize"] = function (spriteFrame: cc.SpriteFrame): void {
    let node: cc.Node = this.node;
    if (!node) {
        cc.warn("SpriteEx.setSpriteFrameAndKeepSize node not found!");
        return;
    }
    if (!cc.isValid(spriteFrame)) return;

    if (!this["__origin_width"]) {
        this["__origin_width"] = node.width * node.scaleX;
        this["__origin_height"] = node.height * node.scaleY;
    }

    let ow: number = this["__origin_width"];
    let oh: number = this["__origin_height"];

    this.spriteFrame = spriteFrame;

    node.scale = Math.min(ow / node.width, oh / node.height);
}