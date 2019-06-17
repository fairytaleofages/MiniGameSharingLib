import Manager from "../../ulframework/manager/Manager";
import mgrRecord from "./mgrRecord";
import mgrCfg from './mgrCfg';
import TaskManager from "../../ulframework/utils/TaskManager";
import { CakePartType } from "../Const";
import Tools from './../../ulframework/utils/Tools';
import mgrPlayer from "./mgrPlayer";
import mgrTip from "./mgrTip";

const { ccclass } = cc._decorator;



@ccclass
export default class mgrCake extends Manager {
    ///// 成员变量 /////
    private static materials: {
        [partType: number]:
        {
            [kindType: number]:
            {
                [colorType: number]: T_CAKE_MATERAIL_DB
            }
        }
    } = {}

    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()
        this.loadRecord();

        let taskManager = new TaskManager()
        taskManager.push([
            this._processCakePartDb.bind(this),
        ])

        taskManager.push([
            this._processCakeMaterialDb.bind(this),
        ])

        taskManager.start(() => {
            cc.log("mgrCake 所有任务执行完毕")
        })
    }

    protected static loadRecord(): void {
        super.loadRecord();

        let record = mgrRecord.getData("cake") || {};
    }

    protected static saveRecord(): void {
        super.saveRecord();

        let record = {
        };

        mgrRecord.setData("cake", record);
    }
    ///////////// 内部逻辑 /////////
    /**
     * 加载每个部件的配置位置
     */
    private static _processCakePartDb(finishCallback) {
        // 拷贝数据
        let item_template_db = mgrCfg.getDb("item_template_db");
        mgrCfg.forDb_from_cake_part_db((k, v) => {
            if (item_template_db[v.id]) {
                cc.warn("部件id与物品id冲突: ", v.id)
                return
            }
            item_template_db[v.id] = {
                id: v.id,
                name: v.name,
                icon: v.icon,
                flag: 0,
            }
        })
        //默认拥有
        mgrCfg.forDb_from_cake_part_db((k, v) => {
           if(v.bDefault == true){
               mgrPlayer._setItemAmount(v.id,1)
           }
        })
        //加载编辑数据 && 
        cc.loader.loadRes('cfg/cake/cake_editor_data.json', (error, editorData) => {
            if (error) {
                cc.log(error)
                finishCallback()
            }
            else {
                cc.log(editorData)
                mgrCfg.forDb_from_cake_part_db((key, value) => {
                    let partEditorData = editorData.json[value.id] || {}
                    value["editorData"] = partEditorData
                })
                finishCallback()
            }
        })
    }

    private static _processCakeMaterialDb(finishCallback) {
        mgrCfg.forDb_from_cake_materail_db((k,v)=>{
            if(this.materials[v.type] == null) this.materials[v.type] = {}
            if(this.materials[v.type][v.kindId] == null) this.materials[v.type][v.kindId] = {}
            this.materials[v.type][v.kindId][v.colorId] = v
        })

        finishCallback()
    }


    ///////////// 外部接口 /////////////
    public static getShapesByType(type:CakePartType){
        let datas = this.materials[type]
        let shapes = []
        for (const k in datas){
            if(datas[k]){
                let shapeType = parseInt(k)
                shapes.push(shapeType)
            }
        }
        return shapes
    }

    public static getShapeName(type: CakePartType, shapeType: number){
        let data = this.materials[type][shapeType]
        for(const k in data){
            return data[k].kindName
        }
    }


    public static getColorsByTypeShapeType(type: CakePartType, shapeType: number){
        let datas = this.materials[type][shapeType]
        let colors:T_CAKE_MATERAIL_DB[] = []
        for(const k in datas){
            if(datas[k]){
                colors.push(datas[k])
            }
        }

        return colors
    }

    public static getRestByType_ShapeType_Color(type: CakePartType, shapeType: number, colorType: number){
        let data = this.materials[type][shapeType][colorType]
        return{
            resType:data.resType,
            resId: data.resId,
        }
    }

    
    public static getPartsByType(type: CakePartType){
        let partDatas:T_CAKE_PART_DB[] = []
        mgrCfg.forDb_from_cake_part_db((k,v)=>{
            if(v.type == type) partDatas.push(v)
        })

        return partDatas;
    }

    /**
     * 获取资源
     * @param partId 
     * @param prePartId 
     */
    public static getResByPartId(partId, prePartId:number = 0) {
        let partData = mgrCfg.get_from_cake_part_db(partId)
        let __ret: { [zIndex: number]: { resType: number, resId: string, pos: cc.Vec2, scale: number } } = {}
        let editData = partData["editorData"][prePartId] || []
        if(editData.length <= 0){
            //有的部件并没有前置关系, 所以使用默认资源
            editData = partData["editorData"][0] || []
        }
        for(const k in editData){
            let resInfo: {resType:number, resId: string, pos: cc.Vec2, zIndex:number, scale: number} = editData[k]
            if(resInfo){
                __ret[resInfo.zIndex] = {
                    resType: resInfo.resType,
                    resId: resInfo.resId,
                    pos: resInfo.pos,
                    scale: resInfo.scale
                }
            }
        }
        return __ret
    }

    public static saveEditorData() {
        cc.log("@@  saveEditorData")
        let editorData: any = {}
        mgrCfg.forDb_from_cake_part_db((k, v) => {
            editorData[v.id] = v["editorData"]
        })

        cc.log(editorData)
        
        if (cc.sys.isBrowser) return
        let jsonText = JSON.stringify(editorData);
        // cc.log(jsonText);
        //检查所有的资源
        for(const k1 in editorData){
            let partEditorData = editorData[k1]
            for(const k2 in partEditorData){
                let preEditorData = partEditorData[k2]
                for(const k3 in preEditorData){
                    let res = preEditorData[k3]
                    let url = Tools.calcResourcesRawUrl(res.resId)
                    // cc.log(jsb.fileUtils)
                    if(!jsb.fileUtils.isFileExist(url)){
                        mgrTip.alertPrompt2("提示",ul.format("%s不存在,是否删除?",url),"是","否",()=>{
                            (preEditorData as Array<any>).splice(parseInt(k3),1)
                        })
                        return
                    }
                }
            }
        }
        
        let url = Tools.calcResourcesRawUrl("resources/cfg/cake/cake_editor_data.json");
        cc.log("@@@ url:",url)
        jsb.fileUtils.writeStringToFile(jsonText, url);
    }


    public static calcScoreByPartIds(partIds: number[]){
        let score = 0
        for (let index = 0; index < partIds.length; index++) {
            const partId = partIds[index];
            let partData = mgrCfg.get_from_cake_part_db(partId)
            score += partData.score
        }

        return score
    }
}
