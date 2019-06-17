import CfgParser from "../../ulframework/utils/CfgParser";
import Manager from "../../ulframework/manager/Manager";
import Tools from "../../ulframework/utils/Tools";
import mgrAlu from "./mgrAlu";
import mgrDirector from './mgrDirector';

const TASKS = [

    ["achievement_db", "m"],
    ["achievement_target_db", "m"],
    ["ad_event_db", "m"],
    ["alu_db", "m"],
    ["anim_node_db", "m"],


    ["cake_part_db", "m"],
    ["cake_materail_db", "m"],
    ["cake_type_db", "m"],
    ["cop_db", "m"],
    ["cop_process_db", "m"],
    ["customer_db", "m"],

    ["guide_db", "ma"],

    ["item_template_db", "m"],
    ["item_recover_db", "m"],

    ["jump_other_game_db", "m"],

    ["particle_db", "m"],

    ["sign_db", "ma"],
    ["sound_db", "m"],
    ["spine_db", "m"],
    ["stage_db", "m"],
    ["stage_chapter_db", "m"],
    ["shop_template_db", "m"],

    ["random_name_part1_db", "a"],
    ["random_name_part2_db", "a"],

];

declare function require(moduleName: string): any;

export default class mgrCfg extends Manager {
    ///// 成员变量 /////










    ///// 生命周期 /////
    /**
     * 所有的db数据
     */
    private static allDbs = {};    // {dbName:db}
    /**
     * 所有配置表的规则
     */
    private static dbRules: { [dbName: string]: string } = {};

    protected static onLoad(): void {
        super.onLoad();
        // 初始化
        cc.log("mgrCfg.onLoad");
    }








    /** 获得加载urls */
    public static getLoadUrls() {
        let urlArr = [];
        for (let index = 0; index < TASKS.length; index++) {
            const element = TASKS[index];
            const name = element[0];
            urlArr.push(`cfg/${name}`);
        }
        return urlArr;
    }

    /** 加工配置表 */
    public static processDb() {

        for (let index = 0; index < TASKS.length; index++) {
            const element = TASKS[index];
            const name = element[0];
            const rule = element[1];
            let url = `cfg/${name}`;

            let data = cc.loader.getRes(url);
            if (!data) {
                cc.error(`mgrCfg processDb error, data is null, url:${url}`);
                continue;
            }

            let db = CfgParser.parseCfgByJsonObj(name, data.json, rule);
            if (db) {
                // cc.log("配置表加载成功：", name, db);
                this.allDbs[name] = db;
            } else {
                cc.warn("警告] 配置表加载失败！", name);
                continue;
            }
        }

        this._combineItemTemplatedb();
        this._processTextDb();
        this._processAchievementDb();
        this._processAluDb();
        this._processStageDb();
    }
    
    ///// getLoadHandlers /////




    ///// 访问模块 /////
    /**
     * 获取db对象
     * @param dbName 配置表名称
     */
    public static getDb(dbName: string): any {
        let db = this.allDbs[dbName || ""];
        if (!db) {
            cc.warn(`[警告] mgrCfg.getDb db not found! dbName=[${dbName}]`);
        }
        return db;
    }

    /**
     * 获取排序后的db对象
     * @param dbName 
     * @param fields 
     */
    public static getDbAndSortByField(dbName: string, fields: string | string[]): any[] {
        let db = this.getDb(dbName);
        if (!db) return [];

        let arr = [];
        Tools.forEachMap(db, (k, v) => {
            arr.push(v);
        });

        // 重载，允许只有一个字符串
        if (typeof (fields) == "string") {
            fields = [fields];
        } else {
            fields = fields;
        }
        return Tools.sortArrayByField(arr, fields);
    }

    /**
     * 提取配置表中的数据
     * @param dbName 配置表名称
     * @param key1 第一层key
     * @param key2 第二层key（可选）
     * @param key3 第三层key（可选）
     * @param bQuiet 是否为安静模式（未找到不报警）
     */
    public static get(dbName: string, key1: any, key2: any = null, key3: any = null, bQuiet = false): any {
        let db = this.getDb(dbName)
        if (!db) return null;

        let value = db[key1];
        if (value == null) {
            if (!bQuiet) cc.warn(`[警告] mgrCfg.get [${dbName}.csv]中数据未找到, key1=[${key1}]`);
            return value;
        }

        if (key2 != null) {
            value = value[key2];
            if (value == null) {
                if (!bQuiet) cc.warn(`[警告] mgrCfg.get [${dbName}.csv]中数据未找到, key1=[${key1}], key2=[${key2}]`);
                return value;
            }
        }

        if (key3 != null) {
            value = value[key3];
            if (value == null) {
                if (!bQuiet) cc.warn(`[警告] mgrCfg.get [${dbName}.csv]中数据未找到, key1=[${key1}], key2=[${key2}], key3=[${key3}]`);
                return value;
            }
        }

        return value;
    }

    /**
     * 提取配置表中的数据
     * 采用安静模式执行（未找到不报警）
     * @param dbName 配置表名称
     * @param key1 第一层key
     * @param key2 第二层key（可选）
     * @param key3 第三层key（可选）
     */
    public static quietGet(dbName: string, key1: any, key2: any = null, key3: any = null): any {
        return this.get(dbName, key1, key2, key3, true);
    }

    /** 遍历db */
    public static forDb(dbName: string, callback: (key: string, value: any) => (boolean | void)): void {
        let db = this.getDb(dbName);
        if (db) {
            Tools.forEachMap(db, callback);
        }
    }









    ///// 数据加工 /////
    private static _processStageDb() {
        //增加script
        this.forDb_from_stage_db((k, v) => {
            let _moudule = null
            if (v.scriptName && v.scriptName != "") _moudule = require(v.scriptName)
            if (!_moudule) {
                cc.warn("加载关卡脚本出错: ", v.scriptName);
                return
            }
            let scriptClase = _moudule.default
            let script = new scriptClase({
                stageId: v.id
            })
            v["script"] = script
        })
    }

    // 合并物品表
    private static _combineItemTemplatedb() {
        // let item_template_db = this.getDb("item_template_db");
        // mgrCfg.forDb_from_cake_part_db((k, v) => {
        //     if (item_template_db[v.id]) {
        //         cc.warn("部件id与物品id冲突: ", v.id)
        //         return
        //     }
        //     item_template_db[v.id] = {
        //         id: v.id,
        //         name: v.name,
        //         icon: v.icon,
        //         flag: 0,
        //     }
        // })
    }

    private static _processTextDb() {
        let arr = [];
        // this.forDb("badword_db", (k, v) => {
        //     arr.push(v.word);
        // });
        this.allDbs["badword_db"] = arr;
    }

    private static _processAchievementDb() {
        Tools.forEachMap(this.getDb("achievement_target_db"), (k, v) => {
            let cmdHash = {};

            for (let i = 0; i < v.cmds.length; i++) {
                const cmd = v.cmds[i];
                cmdHash[cmd] = true;
            }
            v.cmdHash = cmdHash;
        });

        // cc.log("achievement_target_db", this.getDb("achievement_target_db"));
    }

    private static _processAluDb() {
        let logicOrKeys = [];
        let keyKeys = [];
        let operatorKeys = [];
        let valueKeys = [];

        for (let i = 1; i <= 5; i++) {
            logicOrKeys.push("logic_or_" + i);
            keyKeys.push("key_" + i);
            operatorKeys.push("operator_" + i);
            valueKeys.push("value_" + i);
        }

        let checkData = mgrAlu.calcCheckData();
        let handlers = mgrAlu.OPERATOR_HANDLERS;

        let newDb = {};

        this.forDb("alu_db", (k, v) => {
            // 创建格式化后的Data
            let conditions = [];
            let newData = {
                id: v.id,
                name: v.name,
                conditions: conditions,
            };
            newDb[v.id] = newData;

            // 格式化数据
            for (let i = 0; i < 5; i++) {
                let bLogicOr = v[logicOrKeys[i]] == true;
                let key = v[keyKeys[i]];
                let operator = v[operatorKeys[i]];
                let value = v[valueKeys[i]];

                if (key) {
                    // 检测key是否存在
                    // if (checkData[key] == null) {
                    // cc.warn(ul.format("逻辑运算符配置【alu_db】中 checkKey未找到：%s", key));

                    // } else if (handlers[operator] == null) {
                    if (handlers[operator] == null) {
                        cc.warn(ul.format("逻辑运算符配置【alu_db】中 sysmbol未找到：%s", operator));

                    } else {
                        // value优先使用数字
                        let numberValue = parseFloat(value);
                        value = isNaN(numberValue) ? value : numberValue;

                        let condition = {
                            bLogicOr: bLogicOr,
                            key: key,
                            operator: operator,
                            value: value,
                        };
                        conditions.push(condition);
                    }
                }
            }
        });

        // 替换alu_db
        this.allDbs["alu_db"] = newDb;

        // cc.log("alu_db", this.getDb("alu_db"));
    }







    // @cfg export getters begin


    public static get_from_alu_db(key1: any, key2?: any, key3?: any): T_ALU_DB { return this.get("alu_db", key1, key2, key3); }
    public static forDb_from_alu_db(callback: (key: string, value: T_ALU_DB) => (boolean | void)): void { this.forDb("alu_db", callback); }
    public static get_from_cop_db(key1: any, key2?: any, key3?: any): T_COP_DB { return this.get("cop_db", key1, key2, key3); }
    public static forDb_from_cop_db(callback: (key: string, value: T_COP_DB) => (boolean | void)): void { this.forDb("cop_db", callback); }
    public static get_from_cop_process_db(key1: any, key2?: any, key3?: any): T_COP_PROCESS_DB { return this.get("cop_process_db", key1, key2, key3); }
    public static forDb_from_cop_process_db(callback: (key: string, value: T_COP_PROCESS_DB) => (boolean | void)): void { this.forDb("cop_process_db", callback); }
    public static get_from_achievement_db(key1: any, key2?: any, key3?: any): T_ACHIEVEMENT_DB { return this.get("achievement_db", key1, key2, key3); }
    public static forDb_from_achievement_db(callback: (key: string, value: T_ACHIEVEMENT_DB) => (boolean | void)): void { this.forDb("achievement_db", callback); }
    public static get_from_achievement_target_db(key1: any, key2?: any, key3?: any): T_ACHIEVEMENT_TARGET_DB { return this.get("achievement_target_db", key1, key2, key3); }
    public static forDb_from_achievement_target_db(callback: (key: string, value: T_ACHIEVEMENT_TARGET_DB) => (boolean | void)): void { this.forDb("achievement_target_db", callback); }
    public static get_from_spine_db(key1: any, key2?: any, key3?: any): T_SPINE_DB { return this.get("spine_db", key1, key2, key3); }
    public static forDb_from_spine_db(callback: (key: string, value: T_SPINE_DB) => (boolean | void)): void { this.forDb("spine_db", callback); }
    public static get_from_anim_node_db(key1: any, key2?: any, key3?: any): T_ANIM_NODE_DB { return this.get("anim_node_db", key1, key2, key3); }
    public static forDb_from_anim_node_db(callback: (key: string, value: T_ANIM_NODE_DB) => (boolean | void)): void { this.forDb("anim_node_db", callback); }
    public static get_from_particle_db(key1: any, key2?: any, key3?: any): T_PARTICLE_DB { return this.get("particle_db", key1, key2, key3); }
    public static forDb_from_particle_db(callback: (key: string, value: T_PARTICLE_DB) => (boolean | void)): void { this.forDb("particle_db", callback); }
    public static get_from_stage_db(key1: any, key2?: any, key3?: any): T_STAGE_DB { return this.get("stage_db", key1, key2, key3); }
    public static forDb_from_stage_db(callback: (key: string, value: T_STAGE_DB) => (boolean | void)): void { this.forDb("stage_db", callback); }
    public static get_from_ad_event_db(key1: any, key2?: any, key3?: any): T_AD_EVENT_DB { return this.get("ad_event_db", key1, key2, key3); }
    public static forDb_from_ad_event_db(callback: (key: string, value: T_AD_EVENT_DB) => (boolean | void)): void { this.forDb("ad_event_db", callback); }
    public static get_from_sign_db(key1: any, key2?: any, key3?: any): T_SIGN_DB { return this.get("sign_db", key1, key2, key3); }
    public static forDb_from_sign_db(callback: (key: string, value: T_SIGN_DB) => (boolean | void)): void { this.forDb("sign_db", callback); }
    public static get_from_item_template_db(key1: any, key2?: any, key3?: any): T_ITEM_TEMPLATE_DB { return this.get("item_template_db", key1, key2, key3); }
    public static forDb_from_item_template_db(callback: (key: string, value: T_ITEM_TEMPLATE_DB) => (boolean | void)): void { this.forDb("item_template_db", callback); }
    public static get_from_item_recover_db(key1: any, key2?: any, key3?: any): T_ITEM_RECOVER_DB { return this.get("item_recover_db", key1, key2, key3); }
    public static forDb_from_item_recover_db(callback: (key: string, value: T_ITEM_RECOVER_DB) => (boolean | void)): void { this.forDb("item_recover_db", callback); }
    public static get_from_guide_db(key1: any, key2?: any, key3?: any): T_GUIDE_DB { return this.get("guide_db", key1, key2, key3); }
    public static forDb_from_guide_db(callback: (key: string, value: T_GUIDE_DB) => (boolean | void)): void { this.forDb("guide_db", callback); }
    public static get_from_sound_db(key1: any, key2?: any, key3?: any): T_SOUND_DB { return this.get("sound_db", key1, key2, key3); }
    public static forDb_from_sound_db(callback: (key: string, value: T_SOUND_DB) => (boolean | void)): void { this.forDb("sound_db", callback); }
    public static get_from_armor_db(key1: any, key2?: any, key3?: any): T_ARMOR_DB { return this.get("armor_db", key1, key2, key3); }
    public static forDb_from_armor_db(callback: (key: string, value: T_ARMOR_DB) => (boolean | void)): void { this.forDb("armor_db", callback); }
    public static get_from_gun_db(key1: any, key2?: any, key3?: any): T_GUN_DB { return this.get("gun_db", key1, key2, key3); }
    public static forDb_from_gun_db(callback: (key: string, value: T_GUN_DB) => (boolean | void)): void { this.forDb("gun_db", callback); }
    public static get_from_gun_detail_db(key1: any, key2?: any, key3?: any): T_GUN_DETAIL_DB { return this.get("gun_detail_db", key1, key2, key3); }
    public static forDb_from_gun_detail_db(callback: (key: string, value: T_GUN_DETAIL_DB) => (boolean | void)): void { this.forDb("gun_detail_db", callback); }
    public static get_from_bullet_db(key1: any, key2?: any, key3?: any): T_BULLET_DB { return this.get("bullet_db", key1, key2, key3); }
    public static forDb_from_bullet_db(callback: (key: string, value: T_BULLET_DB) => (boolean | void)): void { this.forDb("bullet_db", callback); }
    public static get_from_enemy_db(key1: any, key2?: any, key3?: any): T_ENEMY_DB { return this.get("enemy_db", key1, key2, key3); }
    public static forDb_from_enemy_db(callback: (key: string, value: T_ENEMY_DB) => (boolean | void)): void { this.forDb("enemy_db", callback); }
    public static get_from_jump_other_game_db(key1: any, key2?: any, key3?: any): T_JUMP_OTHER_GAME_DB { return this.get("jump_other_game_db", key1, key2, key3); }
    public static forDb_from_jump_other_game_db(callback: (key: string, value: T_JUMP_OTHER_GAME_DB) => (boolean | void)): void { this.forDb("jump_other_game_db", callback); }
    public static get_from_stage_chapter_db(key1: any, key2?: any, key3?: any): T_STAGE_CHAPTER_DB { return this.get("stage_chapter_db", key1, key2, key3); }
    public static forDb_from_stage_chapter_db(callback: (key: string, value: T_STAGE_CHAPTER_DB) => (boolean | void)): void { this.forDb("stage_chapter_db", callback); }
    public static get_from_shop_template_db(key1: any, key2?: any, key3?: any): T_SHOP_TEMPLATE_DB { return this.get("shop_template_db", key1, key2, key3); }
    public static forDb_from_shop_template_db(callback: (key: string, value: T_SHOP_TEMPLATE_DB) => (boolean | void)): void { this.forDb("shop_template_db", callback); }
    public static get_from_cake_part_db(key1: any, key2?: any, key3?: any): T_CAKE_PART_DB { return this.get("cake_part_db", key1, key2, key3); }
    public static forDb_from_cake_part_db(callback: (key: string, value: T_CAKE_PART_DB) => (boolean | void)): void { this.forDb("cake_part_db", callback); }
    public static get_from_cake_materail_db(key1: any, key2?: any, key3?: any): T_CAKE_MATERAIL_DB { return this.get("cake_materail_db", key1, key2, key3); }
    public static forDb_from_cake_materail_db(callback: (key: string, value: T_CAKE_MATERAIL_DB) => (boolean | void)): void { this.forDb("cake_materail_db", callback); }
    public static get_from_cake_type_db(key1: any, key2?: any, key3?: any): T_CAKE_TYPE_DB { return this.get("cake_type_db", key1, key2, key3); }
    public static forDb_from_cake_type_db(callback: (key: string, value: T_CAKE_TYPE_DB) => (boolean | void)): void { this.forDb("cake_type_db", callback); }
    public static get_from_customer_db(key1: any, key2?: any, key3?: any): T_CUSTOMER_DB { return this.get("customer_db", key1, key2, key3); }
    public static forDb_from_customer_db(callback: (key: string, value: T_CUSTOMER_DB) => (boolean | void)): void { this.forDb("customer_db", callback); }
    // @cfg export getters end






}