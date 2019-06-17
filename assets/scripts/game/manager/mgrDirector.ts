import Manager from "../../ulframework/manager/Manager";
import DialogBase from '../../ulframework/view/DialogBase';
import ViewBase from "../../ulframework/view/ViewBase";
import Const, { ResourceType } from "../Const";
import mgrPool from "./mgrPool";
import Tools from "../../ulframework/utils/Tools";
import Timer from "../../ulframework/utils/Timer";
import vWarpSceneNode from "../view/node/vWarpSceneNode";


declare function require(moduleName: string): any;
const { ccclass } = cc._decorator;

@ccclass
export default class mgrDirector extends Manager {
    ///// 成员变量 /////










    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad();

        cc.view.setResizeCallback(this.onViewResize.bind(this));

        cc.log("mgrDirector.onLoad");
    }









    ///// view相关 /////
    /**
     * 加载Node
     * @param viewPath view路径，基于view目录，如 resources/view/node/vItemIcon，传入"node/vItemIcon"
     * @param context 上下文数据
     * @param callback 加载成功回调，如果加载失败则参数为null
     */
    public static loadNode(viewPath: string, callback: ((prefab: cc.Node) => void)): void {
        let path = "view/" + viewPath;

        this.loadRes(path, cc.Prefab, (err, prefab) => {
            if (err) {
                cc.warn("警告] mgrDirector.loadNode load prefab:", err);
                callback(null);
                return;
            }

            let node: any = cc.instantiate(prefab);

            callback(node);
        });
    }










    ///// view体系的load /////
    /**
     * 创建一个view（继承自ViewBase的view对象）
     * @param viewName view名称，如 view/scene/vHudScene，直接传入vHudScene
     * @param context 上下文
     */
    public static createView(viewName: string, context?: any): ViewBase {
        let _module = require(viewName);
        if (!_module) {
            cc.warn("mgrDirector.createView module not found!", viewName);
            return;
        }
        // cc.log("module", _module);
        let viewClass = _module.default;
        context = context || {}
        context.__viewName = viewName

        let view: ViewBase = new viewClass(context);
        view.name = viewName;

        return view;
    }

    /**
     * 切换scene
     * @param viewName scene名称 如 view/scene/vHudScene，直接传入vHudScene
     * @param context 
     */
    public static enterScene(viewName: string, context?: any): void {
        let sceneRoot = this.getSceneRoot()
        if (context && context.resolutionRange) {
            sceneRoot["_resolution_range"] = context.resolutionRange;
        }

        this.refreshSceneSize();
        //移除原场景
        for (let index = 0; index < sceneRoot.children.length; index++) {
            const element = sceneRoot.children[index];
            element.destroy()
        }
        //移除UI(like dialog)
        let UIRoot = this.getUIRoot()
        for (let index = 0; index < UIRoot.children.length; index++) {
            const element = UIRoot.children[index];
            element.destroy()
        }
        // 切换场景，清除dialog标志
        DialogBase.clearViews();


        //新建场景
        let view = this.createView(viewName, context);
        view.parent = sceneRoot;
    }

    public static warpSceneWithEffect(viewName: string, context?: any, callback?: () => void): void {
        //打开遮罩
        let mask = this.getMask()
        mask.active = true

        let warpView = this.getWarpSceneNode()
        warpView.context = {
            fOnFadeInCompleted: () => {
                this.enterScene(viewName,context)
                warpView.playEffectOut()
            },

            fOnFadeOutCompleted: () => {
                //关闭遮罩
                let mask = this.getMask()
                mask.active = false
                //回调
                if (callback instanceof Function) {
                    callback();
                }
            }
        }

        warpView.playEffectIn()
    }

    private static refreshSceneSize() {
        let sceneRoot = this.getSceneRoot()
        let resolutionRange = sceneRoot["_resolution_range"] || Const.RESOLUTION_RANGE;

        let nodeCanvas = this.getCanvas()
        let deviceSize = cc.view.getFrameSize();
        let deviceRatio = deviceSize.width / deviceSize.height;

        let maxWidth = resolutionRange.maxWidth;
        let minWidth = resolutionRange.minWidth;
        let maxHeight = resolutionRange.maxHeight;
        let minHeight = resolutionRange.minHeight;

        let designWidth = minWidth;
        let designHeight = minHeight;

        // cc.warn("refreshSceneSize");
        // cc.log("deviceSize", deviceSize.width, deviceSize.height);
        // cc.log("deviceRatio", deviceRatio);

        let canvas = nodeCanvas.getComponent(cc.Canvas);
        if (deviceRatio <= minWidth / minHeight) {
            if (deviceRatio < minWidth / maxHeight) {
                // 超高
                // cc.log("超高", deviceRatio);
                designWidth = minWidth;
                designHeight = maxHeight;

                nodeCanvas.setContentSize(designWidth, designHeight);
                canvas.designResolution = cc.size(designWidth, designHeight);
                canvas.fitHeight = true;
                canvas.fitWidth = true;

                // cc.view.setDesignResolutionSize(designWidth, designHeight, cc.ResolutionPolicy.FIXED_WIDTH);

            } else {
                canvas.designResolution = cc.size(designWidth, designHeight);
                /**
                 *  耿骁霄：此处有坑！！！
                 * 必须先设置fitHeight再设置fitWidth，否则在网页debug模式，view会错位！
                */
                canvas.fitHeight = false;
                canvas.fitWidth = true;
                // cc.log("cc.view", cc.view);
            }
        } else {
            if (deviceRatio > maxWidth / minHeight) {
                // 超宽
                // cc.log("超宽", deviceRatio);
                designWidth = maxWidth;
                designHeight = minHeight;

                nodeCanvas.setContentSize(designWidth, designHeight);
                canvas.designResolution = cc.size(designWidth, designHeight);
                canvas.fitHeight = true;
                canvas.fitWidth = true;

                // cc.view.setDesignResolutionSize(designWidth, designHeight, cc.ResolutionPolicy.FIXED_HEIGHT);

            } else {
                // 匹配
                /**
                 *  耿骁霄：此处有坑！！！
                 * 必须先设置fitHeight再设置fitWidth，否则在网页debug模式，view会错位！
                */
                canvas.fitHeight = true;
                canvas.fitWidth = false;
                canvas.designResolution = cc.size(designWidth, designHeight);
            }
        }
    }

    private static onViewResize() {
        this.refreshSceneSize();

        this.sendMsg("MSG_VIEW_RESIZE");
    }

    /**
     * 打开一个弹出框
     * @param viewName 弹出框名称，如view/dialog/vPromptDialog传入vPromptDialog
     * @param context 
     * @param bImmediately 
     */
    public static openDialog(viewName: string, context?: any, bImmediately?: boolean): DialogBase {
        cc.log("openDialog begin ", DialogBase.CUR_VIEWS);
        if (!!DialogBase.CUR_VIEWS[viewName]) {
            cc.warn(`dialog ${viewName} have already create`);
            return;
        }

        let view = this.createView(viewName, context);

        if (view instanceof DialogBase) {
            view.openDialog(bImmediately);
            return view;
        } else {
            cc.warn("mgrDirecotr.openDialog view not a dialog!", viewName);
            if (cc.isValid(view)) {
                view.destroy();
            }
        }

        return null;
    }









    ///// 查询接口 /////
    /** scene的尺寸 */
    public static get size(): cc.Size {
        let scene = cc.director.getScene();
        let canvas = scene.getChildByName("Canvas");
        let size = canvas.getContentSize();
        return size;
    }

    /** scene的宽度 */
    public static get width(): number {
        return this.size.width;
    }

    /** scene的高度 */
    public static get height(): number {
        return this.size.height;
    }

    /** scene的高度 */
    public static get center(): cc.Vec2 {
        let size = this.size;
        return cc.v2(size.width / 2, size.height / 2);
    }

    /** 获取当前scene的canvas */
    public static getCanvas(): cc.Node {
        let scene = cc.director.getScene();
        let canvas = scene.getChildByName("Canvas");
        return canvas;
    }

    /**
     * 获取所有资源的根节点
     */
    public static getRoot() {
       return this.getCanvas().getChildByName("root")
    }

    public static getSceneRoot() {
        return this.getRoot().getChildByName("sceneRoot")
    }

    public static getUIRoot() {
        return this.getRoot().getChildByName("UIRoot")
    }

    public static getAudioRoot(){
        return this.getRoot().getChildByName("AudioRoot")
    }

    public static getSharingMusicAudioResource(){
        return this.getAudioRoot().getChildByName("music").getComponent(cc.AudioSource)
    }
    
    public static getSharingEffectAudioResource(){
        return this.getAudioRoot().getChildByName("effect").getComponent(cc.AudioSource)
    }

    public static getWarpSceneNode(): vWarpSceneNode {
        let root = this.getRoot()
        let warpSceneNode = root.getChildByName("__warpSceneNode")
        if (!warpSceneNode) {
            warpSceneNode = new vWarpSceneNode();
            warpSceneNode.parent = root
            warpSceneNode.name = "__warpSceneNode"
            warpSceneNode.zIndex = Const.GLOBAL_ORDER_WARP_SCENE_NODE
        }
        return warpSceneNode as vWarpSceneNode
    }

    public static getMask() {
        let root = this.getRoot();
        let mask = root.getChildByName("__mask")
        if (!mask) {
            mask = new cc.Node()
            mask.parent = root
            mask.zIndex = Const.GLOBAL_ORDER_MASK
            mask.name = "__mask"
            mask.setContentSize(this.size)
            Tools.registerTouchHandler(mask, () => {
                cc.log("-- touch mask --")
            })
            //默认关闭
            mask.active = false
        }
        return mask
    }

    // 是否设备分辨率超高（针对刘海屏）
    public static isDeviceOverHeight() {
        let deviceSize = cc.view.getFrameSize();
        let deviceRatio = deviceSize.width / deviceSize.height;

        // 超高 宽高比 小于 1/2
        if (deviceRatio < 0.5) {
            return true;
        }

        return false;
    }








    ///// 创建接口 /////
    /**
     * 创建一个带有Sprite的Node
     * @param textureUrl 资源贴图
     */
    public static createSpriteNode(textureUrl: string): cc.Node {
        let node = new cc.Node();
        let sprite = node.addComponent(cc.Sprite);

        sprite.loadSpriteFrame(textureUrl);

        return node;
    }

    public static tryGetRes(url: string, type: any) {
        let resource = cc.loader.getRes(url, type);
        return resource;
    }

    /**
     * 扩展版本loadRes
     * 优先使用cc.loader.getRes尝试获取资源
     * @param url 
     * @param type 
     * @param completeCallback 
     */
    public static loadRes<T extends cc.Asset>(url: string, type: { new(): T }, completeCallback: (error: Error, resource: T) => void): void {
        let resource = cc.loader.getRes(url, type);
        if (resource != null) {
            completeCallback(null, resource);
            return;
        }

        let anyType: any = type;
        cc.loader.loadRes(url, anyType, completeCallback);
    }










    ///// resource node /////
    /**
     * 加载资源节点
     * @param resType
     * @param resId
     */
    public static loadResourceNode(resType: ResourceType, resId: string): cc.Node;
    /**
     * 加载资源节点
     * 配合配置表中的简便的配置方式
     * @param resource 格式：[resType: ResourceType, resId: string]
     */
    public static loadResourceNode(resource: any[]): cc.Node;

    public static loadResourceNode(arg1: ResourceType | any[], arg2?: string): cc.Node {
        let resType: ResourceType;
        let resId: string;

        if (arg1 instanceof Array) {
            resType = arg1[0];
            resId = arg1[1];
        } else {
            resType = arg1;
            resId = arg2;
        }

        let node: any = new cc.Node();

        if (resType == null || !resId) {
            cc.warn("mgrDirector.loadResourceNode faild! resType=[%s], resId=[%s].", resType, resId);
            return node;
        }

        if (resType == ResourceType.sprite) {
            let nodeSprite = this.createSpriteNode(resId);
            nodeSprite.parent = node;
            node.nodeSprite = nodeSprite;
        }

        node.__resType = resType;

        return node;
    }

    public static destoryResourceNode() {

    }









}