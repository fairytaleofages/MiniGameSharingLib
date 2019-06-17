
import sAvatar from './../../struct/sAvatar';
import ResourceNode from './../../../ulframework/view/ResourceNode';
import EventTouchEx from './../../../ulframework/utils/EventTouchEx';
import Tools from './../../../ulframework/utils/Tools';
import mgrCfg from './../../manager/mgrCfg';
/**
 * 使用savatar 作为内核 做内容显示
 */
export default class vAvatar extends cc.Node {
    private kernel: sAvatar = null
    private root: cc.Node = null
    private resNodes: ResourceNode[] = []

    constructor() {
        super("vAvatar")
        this.kernel = new sAvatar()
        this.root = new cc.Node("root")
        this.root.parent = this

        // let layerColor = new LayerColor(cc.color(0,255,0,150))
        // layerColor.setContentSize(300,300)
        // layerColor.parent = this
    }

    private debugCallback: (e: EventTouchEx) => void

    private defaultPartIds: number[] = []

    /// 内部逻辑 /////
    /**
     * 根基kernel的内容刷新显示
     */
    private _refresh() {
        /**用于保存上一帧的节点 用于重用 */
        let __temp_res_node = this.resNodes
        this.resNodes = []
        let getNodeFromLastFrame = (resType: number, resId: string) => {
            for (let index = 0; index < __temp_res_node.length; index++) {
                const resNode = __temp_res_node[index];
                if (resNode.resType == resType && resNode.resId == resId) {
                    __temp_res_node.splice(index, 1)
                    return resNode
                }
            }
        }

        // 生成新的资源
        let zIndex2Res = this.kernel.getKernelData()
        for (const k in zIndex2Res) {
            if (zIndex2Res[k]) {
                let zIndex = parseInt(k)
                let res = zIndex2Res[k]

                let resNode = getNodeFromLastFrame(res.resType, res.resId)
                if (resNode == null) {
                    resNode = new ResourceNode(res.resType, res.resId, "mov_1")
                    resNode.setContentSize(100, 100)
                    resNode.parent = this.root

                    if (this.debugCallback) {
                        Tools.registerTouchHandler(resNode, this.debugCallback);
                    }
                }

                if (resNode.nodeSprite) {
                    let Sprite = resNode.nodeSprite.getComponent(cc.Sprite)
                    Sprite.type = cc.Sprite.Type.SIMPLE
                }

                resNode.setPosition(res.pos)
                resNode.zIndex = zIndex
                resNode.scale = res.scale
                resNode["__partId"] = res.fromTo

                this.resNodes.push(resNode)
            }
        }

        //移除所有无法被重用的就资源
        for (let index = 0; index < __temp_res_node.length; index++) {
            const resNode = __temp_res_node[index];
            this.root.removeChild(resNode)
            resNode.destroy()
        }
        __temp_res_node = []
    }

    // 外部接口 /////
    public replace(partId) {
        let partData = mgrCfg.get_from_cake_part_db(partId);
        if (!partData) return
        let typeData = mgrCfg.get_from_cake_type_db(partData.type)
        if (typeData.prePartType != 0) {
            //如果有前置, 可以直接替换
            this.kernel.replace(partId)
        }
        else {
            //如果没有前置, 说明它可能是其他物品的前置, 需要重置
            this.kernel.replace(partId)
            let oldPartIds = this.kernel.getAllPartIds()

            let allNopePrePartIds: number[] = []
            let allHavePrePartIds: number[] = []
            for (let index = 0; index < oldPartIds.length; index++) {
                const oldPartId = oldPartIds[index];
                let oldPartData = mgrCfg.get_from_cake_part_db(oldPartId)
                let oldPartTypeData = mgrCfg.get_from_cake_type_db(oldPartData.type)
                if (oldPartTypeData.prePartType == 0) {
                    allNopePrePartIds.push(oldPartId)
                }
                else {
                    allHavePrePartIds.push(oldPartId)
                }
            }

            this.kernel.takeOffAll()
            for (let index = 0; index < allNopePrePartIds.length; index++) {
                const element = allNopePrePartIds[index];
                this.kernel.replace(element)
            }

            for (let index = 0; index < allHavePrePartIds.length; index++) {
                const element = allHavePrePartIds[index];
                this.kernel.replace(element)
            }
        }
        this._refresh()

        if (typeData.bWithFillEffect) {
            let resNodes = this.getResNodesByPartId(partId)
            for (const k in resNodes) {
                let resNode = resNodes[k]
                if (resNode && resNode.nodeSprite) {
                    let spirte = resNode.nodeSprite.getComponent(cc.Sprite);
                    spirte.type = cc.Sprite.Type.FILLED;
                    spirte.fillType = cc.Sprite.FillType.HORIZONTAL;
                    spirte.fillStart = 0;
                    spirte.fillRange = 0;
                    resNode.runAction(ul.actionFloat(0.5, 0, 100, (value) => {
                        spirte.type = cc.Sprite.Type.FILLED;
                        spirte.fillType = cc.Sprite.FillType.HORIZONTAL;
                        spirte.fillStart = 0;
                        spirte.fillRange = value / 100;
                    }));
                }
            }
        }
    }

    public replacePartIdArray(partIds: number[]) {
        let newPartIds = ul.clone(partIds)
        newPartIds = ul.clone(newPartIds.sort((a, b) => {
            if (a < b) return -1
            if (a = b) return 0
            if (a > b) return 1
        }));
        // cc.log(partIds)
        for (let index = 0; index < newPartIds.length; index++) {
            const partId = newPartIds[index];
            this.kernel.replace(partId)
        }
        this._refresh()
    }

    public takeOff(partId) {
        this.kernel.takeOff(partId)
        this._refresh()
    }

    public takeOffAll() {
        this.kernel.takeOffAll()

        for (let index = 0; index < this.defaultPartIds.length; index++) {
            const partId = this.defaultPartIds[index];
            this.kernel.replace(partId)
        }

        // cc.log("111所有部件:", this.kernel.getAllPartIds())
        this._refresh()
    }

    public getPartIds() {
        return this.kernel.getAllPartIds()
    }

    ////////// 编辑器接口 ///////
    public setTouchNodeCallback(callback: (e: EventTouchEx) => void) {
        this.debugCallback = callback
    }

    /*     public setDefaultPartIds(partIds: number[]) {
            this.defaultPartIds = partIds
        }
    
    
        public getDefaultPartIds() {
            return this.defaultPartIds
        } */

    public getResNodesByPartId(partId: number) {
        let resNodes: ResourceNode[] = []
        for (let index = 0; index < this.resNodes.length; index++) {
            const resNode = this.resNodes[index];
            if (resNode["__partId"] == partId) {
                resNodes.push(resNode)
            }
        }
        return resNodes
    }

    /**
     *设置透明度
     * @param opacity 0-255
     */
    public setOpacityExByPartId(opacity: number, partId: number) {
        let resNodes = this.getResNodesByPartId(partId)
        for (let index = 0; index < resNodes.length; index++) {
            const resNode = resNodes[index];
            resNode.opacity = opacity
        }
    }

    /**
     * 临时取消资源节点的点击事件(再次刷新后会重置)
     * @param partId  部件ID
     */
    public offResNodeTouByPartId(partId: number) {
        let resNodes = this.getResNodesByPartId(partId)
        for (let index = 0; index < resNodes.length; index++) {
            const resNode = resNodes[index];
            Tools.unregisterTouchHandler(resNode)
        }
    }
}