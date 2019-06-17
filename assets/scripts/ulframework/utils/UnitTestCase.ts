const { ccclass, property } = cc._decorator;

@ccclass
export default class UnitTestCase {
    public name: string;
    public assertCount = 0;
    public assertFaildCount = 0;

    ///// 成员方法 /////

    /** 执行准备工作 */
    public prepare() {

    }

    /** 运行单元测试 */
    public run() {

    }

    /** 执行清理工作 */
    public cleanup() {
        
    }

    ///// 断言方法 /////
    /** 断言相等 */
    protected assertEquals(desc: string, reality: any, expect: any) {
        this.assertCount++;
        if (expect != reality) {
            cc.error(ul.format("%s: 断言异常：%s 期望==[%s] 实际值：[%s]", this.name, desc, expect, reality));
            this.assertFaildCount++;
        } else {
            if (this.isLogPassInfo()) {
                cc.log(ul.format("%s: 断言通过: %s", this.name, desc));
            }
        }
    }

    /** 断言不等 */
    protected assertNotEquals(desc: string, reality: any, expect: any) {
        this.assertCount++;
        if (expect == reality) {
            cc.error(ul.format("%s: 断言异常：%s 期望!=[%s] 实际值：[%s]", this.name, desc, expect, reality));
            this.assertFaildCount++;
        } else {
            if (this.isLogPassInfo()) {
                cc.log(ul.format("%s: 断言通过: %s", this.name, desc));
            }
        }
    }

    protected isLogPassInfo(): boolean {
        return false;
    }
}