import LayerColor from "../../game/view/node/LayerColor";
import Tools from "../utils/Tools";

// const { ccclass, property } = cc._decorator;

// @ccclass
export default class DebugMenu extends cc.Node {
    /**
     * 
     * @param conf 格式：[[name, callback], [name, callback]
     */
    constructor(conf:any[], itemWidth:number, itemHeight:number, gap=4) {
        super();

        // 计算尺寸
        let width = itemWidth + gap * 2;
        let height = (itemHeight * conf.length) + (gap * (conf.length + 1));

        // cc.log("DebugMenu.size", width, height);

        let bg = new LayerColor(cc.color(63, 63, 63, 191));
        bg.parent = this;
        bg.setContentSize(width, height)
        bg.setAnchorPoint(0, 1)

        let top = -gap;
        for (let i = 0; i < conf.length; i++) {
            const v = conf[i];
            let text = v[0];
            let callback = v[1];

            // cc.log(i, text, callback);

            let item = new LayerColor(cc.color(0, 0, 0, 63));
            item.parent = bg;
            item.setContentSize(itemWidth, itemHeight);

            item.x = gap + itemWidth / 2;
            item.y = top - (i * (gap + itemHeight)) - itemHeight / 2;

            let nodeLabel = new cc.Node();
            nodeLabel.parent = item

            let label = nodeLabel.addComponent(cc.Label);
            label.fontSize = 20;
            label.string = text;
            label.verticalAlign = cc.Label.VerticalAlign.CENTER;

            // cc.log("labelSize", nodeLabel.getContentSize());

            Tools.registerTouchHandler(item, (e)=>{
                if (e.name == "began") {
                    nodeLabel.color = cc.color(0, 255, 0)
                } else if (e.name == "ended") {
                    nodeLabel.color = cc.color(255, 255, 255)

                    callback();
                }
            })
        }
    }
}