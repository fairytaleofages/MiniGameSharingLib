declare namespace ul {
    /**
     * 格式化字符串
     * @param args c风格的format参数：format("%02d-%s", 1, "a")
     */
    export function format(...args): string;

    /**
     * 格式化日期
     * yyyy年MM月dd日 hh时mm分ss秒
     * @param date 
     * @param fmt y+:年 M+:月 d+:日 h+:时 m+:分 s+:秒 q+:季度 S:毫秒
     */
    export function formatDate(date: Date, fmt: string): string;

    /**
     * Function : dump()
     * Arguments: The data - array,hash(associative array),object
     *    The level - OPTIONAL
     * Returns  : The textual representation of the array.
     * This function was inspired by the print_r function of PHP.
     * This will accept some data as the argument and return a
     * text that will be a more readable version of the
     * array/hash/object that is given.
     * Docs: http://www.openjs.com/scripts/others/dump_function_php_print_r.php
     */
    export function dump(data: any, tag?: string, level?: number): void;


    /**
     * 数字连续变化动画, 可以和action一起使用
     * @param duration 持续时间
     * @param start 开始数值
     * @param end 结束数值
     * @param callbak 回调
     */
    export function actionFloat(duration: number, start: number, end: number, callbak: Function): cc.ActionInterval;

    /**深度拷贝 */
    export function clone(data: any): any;

    /**
     * 长度
     * @param data 
     */
    export function length(data: any): number;

    /**
     * 
     * @param cur 
     * @param min 
     * @param max 
     */
    export function clamp(cur: number, min: number, max: number);

    export function getType(data: any);
}

