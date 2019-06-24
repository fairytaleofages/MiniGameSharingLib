// import Manager from "../../ulframework/manager/Manager";
// import UnitTestCase from "../../ulframework/utils/UnitTestCase";
// import mgrRecord from "./mgrRecord";
// import mgrAchievement from "./mgrAchievement";
// import Tools from "../../ulframework/utils/Tools";


// const { ccclass, property } = cc._decorator;

// @ccclass
// export default class mgrUnitTest extends Manager {
//     ///// 成员变量 /////
//     private static backupRecordText: string;

//     /** 是否允许native平台开启测试 */
//     private static bAllowNativeTest = false;
//     /** 是否允许浏览器平台开启测试 */
//     private static bAllowBrowserTest = false;










//     ///// 生命周期 /////
//     protected static onLoad() {
//         super.onLoad()

//         this.runAllTestCase();
//     }

//     protected static loadRecord(): void {
//         super.loadRecord();
//     }

//     protected static saveRecord(): void {
//         super.saveRecord();
//     }









//     ///// 模块1 /////
//     private static runAllTestCase() {
//         // 检查环境
//         if (!window["__modular"]) {
//             cc.warn("mgrUnitTest window.__modular未找到，无法启动单元测试。");
//             return;
//         }

//         if (cc.sys.isBrowser && !this.bAllowBrowserTest) {
//             cc.warn("不允许浏览器运行单元测试，需要开启mgrUnitTest.bAllowBrowserTest");
//             return;
//         }

//         if (cc.sys.isNative && !this.bAllowNativeTest) {
//             cc.warn("不允许原生运行单元测试，需要开启mgrUnitTest.bAllowNativeTest");
//             return;
//         }

//         let testCases: UnitTestCase[] = [];

//         /**
//          * 解释：
//          * 这里遍历window.__modular，获取单元测试目录下的所有文件
//          * 依次创建case对象，并调用run方法
//          */
//         let searchString = "scripts/game/unit_test/";
//         let moduleNameMap = window["__modular"]["nameMap"];
//         for (const moduleName in moduleNameMap) {
//             const modulePath: string = moduleNameMap[moduleName];

//             if (modulePath.indexOf(searchString) >= 0) {
//                 // cc.log("find!");
//                 // cc.log(moduleName, modulePath);

//                 let _module = window["__modular"]["modules"][modulePath];
//                 let _class = _module.module.exports[moduleName];

//                 let obj = new _class;
//                 if (obj instanceof UnitTestCase) {
//                     // 写入name
//                     obj.name = moduleName;
//                     testCases.push(obj);
//                 }
//             }
//         }

//         let assertCount = 0;
//         let assertFaildCount = 0;
//         let beginTime = Tools.time();
//         cc.log(ul.format("开始单元测试 测试数：%d", testCases.length));

//         mgrAchievement._setAchievementTipEnabled(false);

//         for (let i = 0; i < testCases.length; i++) {
//             const testCase = testCases[i];
//             try {
//                 this.backupRecord();                 
//                 testCase.run();

//             } catch (error) {
//                 throw error;
//                 // cc.warn(ul.format("%s: error: [%s]", error));
//             } finally {
//                 this.revertRecord();
//             }
//             assertCount += testCase.assertCount;
//             assertFaildCount += testCase.assertFaildCount;
//         }
//         mgrAchievement._setAchievementTipEnabled(true);
        
//         let usedTime = Tools.time() - beginTime;
//         cc.log(ul.format("单元测试结束 断言数：%d, 失败：%d 用时：%dms", assertCount, assertFaildCount, usedTime * 1000));
//     }









//     ///// 辅助功能 /////
//     /** 备份存档 */
//     private static backupRecord(): void {
//         this.backupRecordText = JSON.stringify(mgrRecord["record"]);
//         mgrRecord["_setDebugBanWrite"](true);
//         mgrRecord.resetRecord();

//         // cc.log("backupRecord")
//     }

//     /** 还原存档 */
//     private static revertRecord(): void {
//         if (!this.backupRecordText) return;
//         // cc.log("revertRecord")

//         mgrRecord["_setDebugBanWrite"](false);
//         mgrRecord["_readRecord"](this.backupRecordText);
//         this.sendMsg("MSG_RECORD_RESET");
//     }









// }