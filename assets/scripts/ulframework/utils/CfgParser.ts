/**
 * 配置表解析器
 * 
 * 使用ts重写版本
 * 
 * 算法分析
 * 数据源：
 * {
 *      "types":["I", "S", "I"],
 *      "fields":["id", "name", "price"],
 *      "values":[
 *          ["1", "item1", "100"],
 *          ["2", "item2", "200"],
 *      ]
 * }
 * 
 * 预处理数据
 * [
 *      {"id":1, "name":"item1", "price":100},
 *      {"id":2, "name":"item2", "price":200},
 * ]
 * 
 * 
 *    解析参数rules分为两部分：前缀和解析方式：
 *    1、解析方式是一个规则的字符串,包含两种类型
 *    "m"为map类型，"a"为array类型
 *        两者可组合使用，但必须满足以下条件
 *        1>"m"可出现多次
 *        2>"a"最多出现一次，且只能在末端
 *
 *        以下为有效规制:
 *        "mm"，"mmma"，"a"
 *        以下为无效规则:
 *        "aa"，"mam"
 *
 *        例子:
 *        "m"解析成如下格式:                     "mm"解析成如下格式:
 *        data = {                                data = {
 *            key1 = {},                                key1 = {
 *            key2 = {},                                    key11 = {},
 *        }                                             key12 = {},
 *                                                    },
 *                                                    key2 = {
 *                                                        key21 = {},
 *                                                        key22 = {},
 *                                                    }
 *                                                }
 *
 *        "a"解析成如下格式:                     "ma"解析成如下格式:
 *        data = {                                data = {
 *            {},                                     key1 = {
 *            {},                                         {},
 *        }                                             {},
 *                                                    },
 *                                                    key2 = {
 *                                                        {},
 *                                                        {},
 *                                                    },
 *                                                }
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class CfgParser {
    ///// 接口 /////
    /**
     * 通过json对象解析配置表
     * @param name 配置表名称（用于提示）
     * @param rawData json对象
     * @param rule 规则字符串 m mm mmm a ma mma 等
     */
    public static parseCfgByJsonObj(name: string, rawData: any, rule: string): any {
        // 预处理数据
        let datas = this.preprocess(name, rawData);
        // cc.log("preprocessedData", datas);

        // 按照rule格式化db
        let db = this.formatDb(name, datas, rule, rawData.fields);

        return db;
    }









    ///// 字段解析 /////
    private static PARSE_FUNCTIONS = {
        "A": CfgParser.parseArray,
        "O": CfgParser.parseObject,
        "N": CfgParser.parseString,
        "S": CfgParser.parseString,
        "I": CfgParser.parseNumber,
        "F": CfgParser.parseNumber,
        "B": CfgParser.parseBoolean,
    };

    private static PARSE_DEFAULT_VALUE_CREATORS = {
        "A": () => { return []; },
        "O": () => { return {}; },
        "N": () => { return ""; },
        "S": () => { return ""; },
        "I": () => { return 0; },
        "F": () => { return 0; },
        "B": () => { return false; },
    };

    /**
     * 解析为数字
     */
    private static parseNumber(srcValue): number {
        let value = parseFloat(srcValue);
        if (isNaN(value)) {
            value = null;
        }
        return value;
    }

    /**
     * 直接返回对应的string
     */
    private static parseString(srcValue: string): string {
        return srcValue;
    }

    /**
     * 解析为Array： "[1,2,3]"
     */
    private static parseArray(srcValue: string): string {
        let value = null;
        try {
            value = JSON.parse(srcValue)
            if (!(value instanceof Array)) {
                value = null;
            }
        } catch (error) {
            // 吃掉
        }
        return value;
    }

    /**
     * 解析为Object：'{"key1":1, "key2":"value2"}'
     */
    private static parseObject(srcValue: string): string {
        let value = null;
        try {
            value = JSON.parse(srcValue)
            if (!(value instanceof Object)) {
                value = null;
            }
        } catch (error) {
            // 吃掉
        }
        return value;
    }

    private static parseBoolean(srcValue: string): boolean {
        return srcValue == "TRUE" || srcValue == "true";
    }

    /**
     * 解析传入的value
     * @param srcValue 值
     * @param type 类型
     */
    private static parseValue(srcValue: string, type: string): any {
        let parseFunction = this.PARSE_FUNCTIONS[type];

        if (!parseFunction) {
            // cc.warn("[警告] Cfg.parseValue 未知类型：", type);
            return "";
        }

        let value = parseFunction(srcValue);
        if (value == null) {
            // 数据为空直接设置为默认值
            // 数据不为空则报警
            let defaultValue = this.PARSE_DEFAULT_VALUE_CREATORS[type]();
            if (srcValue.length > 0) {
                cc.log(`[警告] CfgParser.parseValue 解析错误：type=${type}, srcValue=[${srcValue}], 默认值=[${defaultValue}]]`);
            }
            return defaultValue;
        }

        return value;
    }

    /**
     * 预处理数据
     * @param name 配置表名称
     * @param rawDatas 原始数据
     */
    private static preprocess(name: string, rawData: any): any {
        let preprocessedData = []

        let types: string[] = rawData.types || [];
        let fields: string[] = rawData.fields || [];
        let allValues: any[] = rawData.values || [];

        if (allValues.length <= 0) {
            cc.log(`[警告] CfgParser.preprocessData ${name} 数据为空`);
            return;
        }

        // 检查长度
        if (types.length != allValues[0].length || fields.length != allValues[0].length) {
            cc.log(`[警告] CfgParser.preprocessData  ${name} 数据长度不匹配！`);
            return [];
        }

        for (let i = 0; i < allValues.length; i++) {
            const values = allValues[i];

            let data = {}
            for (let j = 0; j < values.length; j++) {
                const type = types[j];
                const field = fields[j];
                const value = values[j];

                // cc.log(i, type, field, value);

                data[field] = this.parseValue(value, type);
            }
            preprocessedData.push(data);
        }

        return preprocessedData;
    }









    ///// 数据结构处理 /////
    /**
     * 按照rule格式化db
     * @param name 配置表名称
     * @param datas 数据数组
     * @param rule 规则 m mm a ma mma ...
     */
    private static formatDb(name: string, datas: any[], ruleString: string, fields: string[]): any {
        let rules = ruleString.split("");

        let root = {};

        // 遍历数据
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];

            let container = root;
            // 提取容器
            for (let j = 0; j < rules.length - 1; j++) {
                // 这里遍历的是非最后一个rule
                let field = fields[j];
                let value = data[field];
                let _container = container[value]

                // cc.log(`发现第${j}层容器`);
                if (!_container) {
                    // cc.log("  准备创建容器", j, rules[rules.length - 1])
                    if (j == rules.length - 2 && rules[rules.length - 1] == "a") {
                        // cc.log("  array");
                        _container = [];
                    } else {
                        // cc.log("  map");
                        _container = {};
                    }
                    container[value] = _container
                }
                container = _container;
            }

            // cc.log(i, data, root)

            // 末位rule
            // cc.log(`第${rules.length-1}层，写入数据`);
            let rule = rules[rules.length - 1];
            if (rule == "m") {
                // 写入数据
                let field = fields[rules.length - 1];
                let value = data[field];

                if (container[value] != null) {
                    // db[id1][id2][id3]
                    let text = "db";
                    for (let j = 0; j < rules.length; j++) {
                        text += `[${data[fields[j]]}]`;
                    }
                    cc.log(`[警告] CfgParser.formatDb  ${name} 字段被覆盖！`, text, container[value]);
                }
                container[value] = data;

            } else if (rule == "a") {
                // 数组
                // 检查容器类型
                if (!(container instanceof Array)) {
                    // 容器不是数组
                    if (rules.length == 1) {
                        container = [];
                        root = container;
                    } else {
                    }
                }

                if (container instanceof Array) {
                    container.push(data);

                } else {
                    cc.log(`[警告] CfgParser.formatDb  ${name} a模式，容器不是数组！`)
                }
            }

        }

        return root;
    }









}