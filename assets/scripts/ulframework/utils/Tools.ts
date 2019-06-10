import EventTouchEx from "./EventTouchEx";
import Const from "../../game/Const";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Tools {
    private static _debugTime: number = null;

    /**
     * 获取毫秒级time
     * @returns time 单位秒
     */
    public static time(): number {
        if (this._debugTime != null) {
            return this._debugTime;

        } else {
            return new Date().getTime() / 1000;
        }
    }

    /**
     * 设置调试用的时间，会覆盖time
     * @param time 
     */
    public static _setDebugTime(time: number) {
        this._debugTime = time;
    }

	/**
	 * 是否是同一天
	 * @param seconds1 单位秒
	 * @param seconds2 单位秒
	 */
    public static isOneDay(seconds1: number, seconds2: number): boolean {
        var d1 = new Date(seconds1 * 1000);
        var d2 = new Date(seconds2 * 1000);

        return d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
    }

    /**
     * 注册触摸事件
     * 使用cc.Node.on实现，无法提供“穿透”，所有的事件会被target的树拦截
     * @param node 绑定事件的节点
     * @param handler 事件处理回调 (e)=>{} e.name为cocos2dx中保留的三个值：began, moved, ended
     * @param bEnableMultiTouch 是否开启多点触摸，默认关闭
     */
    public static registerTouchHandler(_node: cc.Node, handler: (e: EventTouchEx) => void, bEnableMultiTouch = false) {
        // 使用any覆盖node，我们需要往node中添加很多数据
        let node: any = _node;

        if (!node) return;
        if (!handler) return;


        let fOnTouchBegan = (e: EventTouchEx) => {
            let touchId = e.getID() || 0;
            if (!bEnableMultiTouch && node.__touch_id != null) return false;
            e.name = "began";
            e.stopPropagation()
            node.__touch_id = touchId
            handler(e);

            return true;
        };

        let fOnTouchMoved = (e) => {
            let touchId = e.getID() || 0;
            if (!bEnableMultiTouch && touchId != node.__touch_id) return;
            // if (node.__touch_id == null) return;
            e.name = "moved";
            handler(e);
        };

        let fOnTouchEnded = (e) => {
            let touchId = e.getID() || 0;
            if (!bEnableMultiTouch && touchId != node.__touch_id) return;
            // if (node.__touch_id == null) return;
            e.name = "ended"
            node.__touch_id = null;
            handler(e);
        };

        let fOnTouchCancelled = (e) => {
            let touchId = e.getID() || 0;
            if (!bEnableMultiTouch && touchId != node.__touch_id) return;
            // if (node.__touch_id == null) return;
            e.name = "cancelled"
            node.__touch_id = null;
            handler(e);
        };

        node.on(cc.Node.EventType.TOUCH_START, fOnTouchBegan);
        node.on(cc.Node.EventType.TOUCH_MOVE, fOnTouchMoved);
        node.on(cc.Node.EventType.TOUCH_END, fOnTouchEnded);
        node.on(cc.Node.EventType.TOUCH_CANCEL, fOnTouchCancelled);
    }

    /**
     * 卸载节点的触摸事件
     * 使用cc.Node.off实现
     * @param node 绑定事件的节点
     */
    public static unregisterTouchHandler(node: cc.Node) {
        node.off(cc.Node.EventType.TOUCH_START, null);
        node.off(cc.Node.EventType.TOUCH_MOVE, null);
        node.off(cc.Node.EventType.TOUCH_END, null);
        node.off(cc.Node.EventType.TOUCH_CANCEL, null);
    }

    /**
     * 遍历数据结构，返回长度
     * @param obj 数组 or obj
     */
    public static getObjSize(obj: any[] | {}) {
        if (!obj) {
            return 0;
        }

        if (Array.isArray(obj)) {
            return obj.length;
        }

        let count = 0;
        Tools.forEachMap(obj, (k, v) => {
            count++;
        });
        return count;
    }

    /**
     * 获取一个整数随机数
     * random() => [0, 1)
     * random(3) => [1, 3]
     * random(2, 5) => [2, 5]
     * @param min 最小值
     * @param max 最大值 
     */
    public static random(min?: number, max?: number) {
        if (min == null && max == null) {
            return Math.random();
        } else if (max == null) {
            return Math.floor(Math.random() * min + 1);
        } else {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    }

    /**
     * 将一个数字缩放到指定的范围内
     * ia和ib为输入的范围，如果n超过范围，会被设置为边界值
     * oa和ob为输出的范围，将按照n在输入范围的比例，缩放到输出范围的对应的值
     * @param n 数字
     * @param ia 输入最小值
     * @param ib 输入最大值
     * @param oa 输出最小值
     * @param ob 输出最大值
     */
    public static scaleInRange(n: number, ia: number, ib: number, oa: number, ob: number): number {
        if (ia < ib) {
            if (n < ia) n = ia;
            if (n > ib) n = ib;
        } else {
            if (n < ib) n = ib;
            if (n > ia) n = ia;
        }

        let iDistance = ib - ia;
        let oDistance = ob - oa;

        return (n - ia) / iDistance * oDistance + oa;
    }

    /**
     * 检测传入的世界坐标点，是否在节点范围内
     * @param node 
     * @param worldLocation 
     * @param boundExt 
     */
    public static isWorldInLocalNode(node: cc.Node, worldLocation: cc.Vec2, boundExt?: number): boolean {
        let rect = Tools.calcNodeBoundingBoxToWorld(node);
        if (boundExt != null) {
            rect.x -= boundExt;
            rect.y -= boundExt;
            rect.width += boundExt * 2;
            rect.height += boundExt * 2;
        }

        return rect.contains(worldLocation);
    }

    /**
     * 计算递归缩放值
     * @param node 
     */
    public static calcRecursiveScale(node: cc.Node): number {
        let scale = 1;

        // cc.log("calcRecursiveScale", node, scale);

        do {
            scale *= node.getScale();
            // cc.log("  scale", scale);
            node = node.parent;
            // cc.log("  node", node);

        } while (node != null);

        return scale;
    }

    /**
     * 获取轮盘算法的目标
     * @param arr 数据数组，如[[weight:1, data:"1"]] 或者 [[1, 100]]
     * @param weightKey 权重所在的key，如果数据为数组，这个key是index
     * @return 轮盘选中的数据
     */
    public static calcWheelTarget(arr: any[], weightKey: number | string): any {
        let totalWeight = 0;

        // 1. 第一轮循环，提取权重
        for (let i = 0; i < arr.length; i++) {
            const v = arr[i];
            let w = parseInt(v[weightKey]);

            if (isNaN(w)) {
                cc.warn(ul.format("Tools.calcWheelTarget weight field not found! key=[%s]", weightKey))
                return null;
            }

            totalWeight += w;
        }

        // 2. 随机一个值，判断是谁
        let rw = this.random(totalWeight);
        for (let i = 0; i < arr.length; i++) {
            const v = arr[i];
            let w = parseInt(v[weightKey]);

            if (rw <= w) {
                return v;
            } else {
                rw -= w;
            }
        }

        return null;
    }

    /**
     * 对一个数组进行排序
     * 如: arr = Tools.sortArrayByField(arr, "id");
     * @param array 数组
     * @param field 排序的key，带上前缀-为倒序
     */
    public static sortArrayByField(array: any[], field: string): any[];

    /**
     * 对一个数组进行排序
     * 如: arr = Tools.sortArrayByField(arr, ["id", "-order"]);
     * @param array 数组
     * @param fields 排序的keys，带上前缀-为倒序
     */
    public static sortArrayByField(array: any[], fields: string[]): any[];

	/**
	 * 针对element进行排序
	 * @param array 
	 * @param fields 
	 */
    public static sortArrayByField(array: any[], fields: string | string[]) {
        // 重载，允许只有一个字符串
        // cc.log("---typeof( fields )=",typeof( fields ))
        if (typeof (fields) == "string") {
            fields = [fields];
        } else {
            fields = fields;
        }

        // 处理一次fields
        let fieldConfig = [];
        for (let k in fields) {
            let v = fields[k];
            if (v && v != "") {
                // cc.log(v)
                if (v.substring(0, 1) === "-") {
                    let tmpField = v.substring(1, v.length);
                    if (tmpField && tmpField != "") {
                        fieldConfig.push([tmpField, true]);
                    }
                }
                else {
                    fieldConfig.push([v, false]);
                }
            }
        }

        // -- 按照优先级进行排序
        let sorter = (a: any, b: any): number => {
            let ret = 0

            for (let k in fieldConfig) {
                let v = fieldConfig[k];
                let field = v[0];
                let desc = v[1];

                let v1 = a[field];
                let v2 = b[field];
                if (v1 != null) {
                    if (desc) {
                        ret = v2 - v1;
                    } else {
                        ret = v1 - v2;
                    }

                    if (ret != 0) {
                        return ret;
                    }
                }
            }
            return ret;
        }

        let sorted = [];
        for (let i = 0; i < array.length; i++) {
            const v = array[i];
            sorted.push(v);
        }
        sorted.sort(sorter);
        return sorted
    }

    public static bubbleSort(arr: any[], sorter: (a, b) => number) {
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            // for (var i = 0; i < len - 1; i++) {
            //     for (var j = i + 1; j < len; j++) {
            for (var j = 0; j < len - 1 - i; j++) {
                let ret = sorter(arr[j], arr[j + 1]);

                if (ret > 0) {
                    var temp = arr[j + 1];        //元素交换
                    arr[j + 1] = arr[j];
                    arr[j] = temp;
                }

                // if (arr[j] > arr[j + 1]) {        //相邻元素两两对比
                //     var temp = arr[j + 1];        //元素交换
                //     arr[j + 1] = arr[j];
                //     arr[j] = temp;
                // }
            }
        }
        return arr;
    }

    /**
     * 遍历[key-value]结构的map
     * @param map 
     * @param callback return tuue：中断循环
     */
    public static forEachMap(map: any, callback: (key: string, value: any) => (boolean | void)): void {
        if (!map) return;

        let keys = Object.keys(map);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = map[key];

            if (value != null) {
                if (callback(key, value)) break;
            }
        }
    }









    ///// tile排序相关 /////

    /**
     * 计算tile的排序
     * 耿骁霄：这段原始排序算法，请勿删除
     * @param 数据源，格式：{ x: number, y: number, width: number, height: number }
     */
    private static _origin_sortTiles<T>(arr: T[]): T[] {
        // if (true) return this.sortTiles_grid_opt(arr);
        // if (true) return this.sortTiles_opt_by_cache_index(arr);
        // let compareCount = 0;
        let isCover = (a, b): boolean => {
            // compareCount++;
            return b.right > a.x && b.top > a.y;
        }

        let sortedArr: T[] = [];

        let len = arr.length;
        for (let i = 0; i < len; i++) {
            let a = arr[i];
            let indexA = sortedArr.indexOf(a);

            for (let j = 0, len = arr.length; j < len; j++) {
                if (i == j) continue;
                let b = arr[j];

                // 判断是否覆盖
                if (isCover(a, b)) {
                    let indexB = sortedArr.indexOf(b);
                    // cc.log("  index:", indexA, indexB);

                    // 处理a
                    if (indexA < 0) {
                        // sorted中没有a，追加到末尾
                        sortedArr.push(a);
                        indexA = sortedArr.length - 1;
                    }

                    // 处理b
                    if (indexB < 0) {
                        // sorted中没有b，追加到末尾
                        sortedArr.push(b);
                        indexB = sortedArr.length - 1;
                    }

                    // 尝试判断顺序
                    if (indexB < indexA) {
                        // cc.log("  b存在，并且在a的前面");

                        // 将a移动到b的前面
                        sortedArr.splice(indexA, 1);
                        sortedArr.splice(indexB, 0, a);

                        indexA = indexB;
                    }
                }
            }
        }

        // 对比原始数组，找到未使用的，追加到sorted的末尾
        for (let i = 0; i < arr.length; i++) {
            let a = arr[i];

            if (sortedArr.indexOf(a) < 0) {
                // 发现未知数据，追加到sorted
                sortedArr.push(a);
            }
        }

        // cc.log("compareCount", compareCount)

        return sortedArr;
    }

    /**
     * 计算tile的排序
     * 基于原始算法，深度优化indexOf
     * 采用indexCache，预先将sortedArr中的index缓存下来，避免频繁的indexOf操作，提速800%！
     * @param 数据源，格式：{ x: number, y: number, width: number, height: number }
     */
    public static sortTiles<T>(arr: T[]): T[] {

        // let compareCount = 0;
        // let updateIndexCount = 0;
        let isCover = (a, b): boolean => {
            // compareCount++;
            return b.right > a.x && b.top > a.y;
        }

        // // 预先写入id
        for (let i = 0; i < arr.length; i++) {
            const v: any = arr[i];
            v._id = i;
        }

        // cc.log(arr);

        let sortedArr: T[] = [];

        /** [id] = index */
        let indexCache = {};

        let len = arr.length;
        for (let i = 0; i < len; i++) {
            let a: any = arr[i];
            // let indexA = sortedArr.indexOf(a);
            let indexA = indexCache[a._id];

            for (let j = 0; j < len; j++) {
                if (i == j) continue;
                let b: any = arr[j];

                // 判断是否覆盖
                if (isCover(a, b)) {
                    let indexB = indexCache[b._id];
                    // let indexB = sortedArr.indexOf(b);
                    // cc.log("  index:", indexA, indexB);

                    // 处理a
                    if (indexA == null) {
                        // sorted中没有a，追加到末尾
                        sortedArr.push(a);
                        indexA = sortedArr.length - 1;
                        indexCache[a._id] = indexA;
                    }

                    // 处理b
                    if (indexB == null) {
                        // sorted中没有b，追加到末尾
                        sortedArr.push(b);
                        indexB = sortedArr.length - 1;
                        indexCache[b._id] = indexB;
                    }

                    // 尝试判断顺序
                    if (indexB < indexA) {
                        // cc.log("  b存在，并且在a的前面");

                        // 更新index缓存
                        for (let k = indexB; k < indexA; k++) {
                            let temp: any = sortedArr[k];
                            indexCache[temp._id]++;
                        }

                        // 将a移动到b的前面
                        sortedArr.splice(indexA, 1);
                        sortedArr.splice(indexB, 0, a);

                        // updateIndexCount++;

                        indexA = indexB;
                        indexCache[a._id] = indexA;
                    }
                }
            }
        }

        // 对比原始数组，找到未使用的，追加到sorted的末尾
        for (let i = 0; i < arr.length; i++) {
            let a: any = arr[i];

            if (indexCache[a._id] == null) {
                // 发现未知数据，追加到sorted
                sortedArr.push(a);
            }
        }

        // cc.log("compareCount", compareCount, updateIndexCount)

        return sortedArr;
    }

    /**
     * 将worldRect转换到节点坐标系
     * @param node 
     * @param worldRect 
     */
    public static convertRectToNodeSpace(node: cc.Node, worldRect: cc.Rect): cc.Rect {
        if (!worldRect) return null;

        let p0 = cc.v2(worldRect.xMin, worldRect.yMin);
        let p1 = cc.v2(worldRect.xMax, worldRect.yMax);

        p0 = node.convertToNodeSpaceAR(p0);
        p1 = node.convertToNodeSpaceAR(p1);

        let xMin = Math.min(p0.x, p1.x);
        let yMin = Math.min(p0.y, p1.y);
        let xMax = Math.max(p0.x, p1.x);
        let yMax = Math.max(p0.y, p1.y);
        let width = xMax - xMin;
        let height = yMax - yMin;

        return new cc.Rect(xMin, yMin, width, height);
    }

    /**
     * 将节点坐标系的rect转换到世界坐标系
     * @param node 
     * @param rect 
     */
    public static convertRectToWorldSpace(node: cc.Node, rect: cc.Rect): cc.Rect {
        if (!rect) return null;

        let p0 = cc.v2(rect.xMin, rect.yMin);
        let p1 = cc.v2(rect.xMax, rect.yMax);

        // cc.log("p0", p0.x, p0.y);
        // cc.log("p1", p1.x, p1.y);

        p0 = node.convertToWorldSpaceAR(p0);
        p1 = node.convertToWorldSpaceAR(p1);

        // cc.log("p0", p0.x, p0.y);
        // cc.log("p1", p1.x, p1.y);

        let xMin = Math.min(p0.x, p1.x);
        let yMin = Math.min(p0.y, p1.y);
        let xMax = Math.max(p0.x, p1.x);
        let yMax = Math.max(p0.y, p1.y);
        let width = xMax - xMin;
        let height = yMax - yMin;

        return new cc.Rect(xMin, yMin, width, height);
    }

    /**
     * 计算node自身的包围盒，在世界坐标系的rect
     * 基于cc.Node.getBoundingBox()进行计算
     * PS：cc.Node.getBoundingBoxToWorld()会级联计算所有children的包围框
     * @param node 
     * @param boundExt 可选，范围扩大值
     */
    public static calcNodeBoundingBoxToWorld(node: cc.Node, boundExt?: number): cc.Rect {
        let box = node.getBoundingBox();

        if (boundExt) {
            box.x -= boundExt;
            box.y -= boundExt;
            box.width += boundExt * 2;
            box.height += boundExt * 2;
        }

        let rect = Tools.convertRectToWorldSpace(node.parent, box);
        return rect;
    }

    /**
     * 格式化时间
     * @param time 秒
     * @param format 格式化字符串  %h%H%m%M%s%S 大写的补全2位
     * sample:
     * 3701 "%H:%M:%S" -> "01:01:41"
     * 3701 "%h:%m:%s" -> "1:1:41"
     * 3701 "%h:%M:%S" -> "1:01:41"
     */
    public static formatTime(time: number, format: string): string {
        let hour = Math.floor(time / 3600);
        let minute = Math.floor(time / 60) % 60;
        let second = Math.floor(time) % 60;

        if (format.match("%h")) {
            format = format.replace("%h", hour.toString());
        }

        if (format.match("%H")) {
            format = format.replace("%H", ul.format("%02d", hour));
        }

        if (format.match("%m")) {
            format = format.replace("%m", minute.toString());
        }

        if (format.match("%M")) {
            format = format.replace("%M", ul.format("%02d", minute));
        }

        if (format.match("%s")) {
            format = format.replace("%s", second.toString());
        }

        if (format.match("%S")) {
            format = format.replace("%S", ul.format("%02d", second));
        }

        return format;
    }

    
    /**
     * formatFullTime
     * @param timeStamp 时间戳
     * @param format 格式化字符串  %h%H%m%M%s%S 大写的补全2位 分钟为tm与月区分，大写也是TM
     * sample:
     * "%y-%m-%d %H:%TM:%S" -> "2017-1-5 01:01:41"
     */
    public static formatFullTime ( timeStamp: number, format: string ) {
        var time = new Date(timeStamp);
        var y = time.getFullYear();
        var m = time.getMonth()+1;
        var d = time.getDate();
        var h = time.getHours();
        var tm = time.getMinutes();
        var s = time.getSeconds();
        if (format.match("%y")) {
            format = format.replace("%y", y.toString());
        }

        if (format.match("%m")) {
            format = format.replace("%m", m.toString());
        }

        if (format.match("%M")) {
            format = format.replace("%M", ul.format("%02d", m));
        }

        if (format.match("%d")) {
            format = format.replace("%d", d.toString());
        }

        if (format.match("%D")) {
            format = format.replace("%D", ul.format("%02d", d));
        }

        if (format.match("%h")) {
            format = format.replace("%h", h.toString());
        }

        if (format.match("%H")) {
            format = format.replace("%H", ul.format("%02d", h));
        }

        if (format.match("%tm")) {
            format = format.replace("%tm", tm.toString());
        }

        if (format.match("%TM")) {
            format = format.replace("%TM", ul.format("%02d", tm));
        }

        if (format.match("%s")) {
            format = format.replace("%s", s.toString());
        }

        if (format.match("%S")) {
            format = format.replace("%S", ul.format("%02d", s));
        }
        return format;
    }

    /**
     * 递归设置所有颜色
     * @param node 
     * @param color 
     */
    public static setCascadeColor(node: cc.Node, color: cc.Color) {
        // 1. 自己
        node.color = color;

        // 2. children
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            this.setCascadeColor(child, color);
        }
    }

    /** 生成UUID */
    public static generateUUID(): string {
        let d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        return uuid;
    };

    /**
     * 解析逻辑表达式数组
     * @param array {true, "or", {true, "and", "not", false}}
     */
    public static parseLogicExpressionArray(array: (boolean | string | any[])[]): boolean {
        let ret = true;
        let bSymbolNot = false;
        let logicSymbol = null;

        // cc.log("parseLogicExpressionArray", array);

        for (let i = 0; i < array.length; i++) {
            let v = array[i];

            // cc.log("  ", i, v);
            // 逻辑数组，直接parse作为一个value使用
            if (Array.isArray(v)) {
                v = this.parseLogicExpressionArray(v);
            }

            switch (typeof v) {
                case "string": {
                    // 这是一个符号
                    switch (v) {
                        case "not": {
                            // 发现not，调整not标志
                            bSymbolNot = !bSymbolNot;
                            // cc.log("    find not")
                            break;
                        }
                        case "and": {
                            if (logicSymbol) {
                                cc.warn(ul.format("Tools.parseLogicExpressionArray exp='%s' symbol overload index=[%d], origin_symbol=[%s], new_symbol=[%s]", JSON.stringify(array), i, logicSymbol, v));
                            }
                            logicSymbol = "and";
                            break;
                        }
                        case "or": {
                            if (logicSymbol) {
                                cc.warn(ul.format("Tools.parseLogicExpressionArray exp='%s' symbol overload index=[%d], origin_symbol=[%s], new_symbol=[%s]", JSON.stringify(array), i, logicSymbol, v));
                            }
                            logicSymbol = "or";
                            break;
                        }
                        default: {
                            cc.warn(ul.format("Tools.parseLogicExpressionArray exp='%s' unknown symbol index=[%d], symbol=[%s]", JSON.stringify(array), i, v));
                            break;
                        }
                    }
                    break;
                }
                case "boolean": {
                    // 这是一个boolean值
                    if (bSymbolNot) {
                        v = !v;
                        bSymbolNot = false;
                    }

                    if (!logicSymbol || logicSymbol == "and") {
                        // and操作符（默认为and）
                        ret = ret && v as boolean;
                    } else {
                        // or操作符
                        ret = ret || v as boolean;
                    }
                    break;
                }
            }
        }

        // cc.log("  ret", ret)

        return ret;
    }

    /**
     * 递归一个节点所有的child
     * @param node 
     * @param callback 
     */
    public static recursionChildren(node: cc.Node, callback: (child: cc.Node) => void) {
        if (!cc.isValid(node)) return;
        if (!callback) return;

        for (let i = 0; i < node.children.length; i++) {
            let child = node.children[i];
            if (!cc.isValid(child)) continue;

            callback(child);

            this.recursionChildren(child, callback);
        }
    }


    // 数值转换
    public static formatNumToStr ( count: number ): string {
        let str = count.toString();
        if ( count >= 1000 * 1000 * 1000 * 1000 ) {
            str = Math.floor(count / 10 / 1000 / 1000 / 1000) / 100 + "mm";
        }
        else if ( count >= 1000 * 1000 * 1000 ) {
            str = Math.floor(count / 10 / 1000 / 1000) / 100 + "km";
        }
        else if ( count >= 1000 * 1000 ) {
            str = Math.floor(count / 10 / 1000) / 100 + "m";
        }
        else if ( count >= 1000 ) {
            str = Math.floor(count / 10) / 100 + "k";
        }

        return str;
    }

    /** 获取节点世界坐标 */
    public static getNodeWorldPosAR ( node: cc.Node ) {
        return node.parent.convertToWorldSpaceAR( node.getPosition() );
    }


    //---------------------- 61 线段找交点 start ---------

    /** 判断线段是否与矩形相交 */
    public static getIntersectPointLineWithRect ( lineStart: cc.Vec2, lineEnd: cc.Vec2, rect: cc.Rect ) {

        let point: cc.Vec2 = null;
        let temp: cc.Vec2 = null;

        // 包含
        if ( rect.contains(lineStart) || rect.contains(lineEnd) ) {
            point = lineStart.clone();
        }

        let leftDown = cc.v2( rect.xMin, rect.yMin );
        let leftUp = cc.v2( rect.xMin, rect.yMax );
        let rigtDown = cc.v2( rect.xMax, rect.yMin );
        let rightUp = cc.v2( rect.xMax, rect.yMax );
        if (this.isIntersectLineWithLine(lineStart, lineEnd, leftDown, leftUp)) {
            temp = this.getIntersectPointLineWithLine( lineStart, lineEnd, leftDown, leftUp );
        }
        if (this.isIntersectLineWithLine(lineStart, lineEnd, leftUp, rightUp)) {
            temp = this.getIntersectPointLineWithLine( lineStart, lineEnd, leftUp, rightUp );
        }
        if (this.isIntersectLineWithLine(lineStart, lineEnd, rightUp, rigtDown)) {
            temp = this.getIntersectPointLineWithLine( lineStart, lineEnd, rightUp, rigtDown );
        }
        if (this.isIntersectLineWithLine(lineStart, lineEnd, rigtDown, leftDown)) {
            temp = this.getIntersectPointLineWithLine( lineStart, lineEnd, rigtDown, leftDown );
        }

        if ( !!temp ) {
            point = temp;
        }

        return point;
    }

    /** 判断两条线段是否相交 */
    private static isIntersectLineWithLine ( l1Start: cc.Vec2, l1End: cc.Vec2, l2Start: cc.Vec2, l2End: cc.Vec2 ) {
        return this.quickReject(l1Start, l1End, l2Start, l2End) && this.straddle(l1Start, l1End, l2Start, l2End);
    }

    /** 快速排序。  true=通过， false=不通过 */
    private static quickReject( l1Start: cc.Vec2, l1End: cc.Vec2, l2Start: cc.Vec2, l2End: cc.Vec2 ){
        let l1xMax = Math.max(l1Start.x, l1End.x);
        let l1yMax = Math.max(l1Start.y, l1End.y);
        let l1xMin = Math.min(l1Start.x, l1End.x);
        let l1yMin = Math.min(l1Start.y, l1End.y);
    
        let l2xMax = Math.max(l2Start.x, l2End.x);
        let l2yMax = Math.max(l2Start.y, l2End.y);
        let l2xMin = Math.min(l2Start.x, l2End.x);
        let l2yMin = Math.min(l2Start.y, l2End.y);
    
        if (l1xMax < l2xMin || l1yMax < l2yMin || l2xMax < l1xMin || l2yMax < l1yMin) {
            return false;
        }
    
        return true;
    }

    /** 跨立实验 */
    private static straddle( l1Start: cc.Vec2, l1End: cc.Vec2, l2Start: cc.Vec2, l2End: cc.Vec2 ){
        let l1x1 = l1Start.x;
        let l1x2 = l1End.x;
        let l1y1 = l1Start.y;
        let l1y2 = l1End.y;
        let l2x1 = l2Start.x;
        let l2x2 = l2End.x;
        let l2y1 = l2Start.y;
        let l2y2 = l2End.y;

        if (( ( (l1x1 - l2x1) * (l2y2 - l2y1) - (l1y1 - l2y1) * (l2x2 - l2x1) ) *
              ( (l1x2 - l2x1) * (l2y2 - l2y1) - (l1y2 - l2y1) * (l2x2 - l2x1) ) ) > 0 ||
            ( ( (l2x1 - l1x1) * (l1y2 - l1y1) - (l2y1 - l1y1) * (l1x2 - l1x1) ) *
              ( (l2x2 - l1x1) * (l1y2 - l1y1) - (l2y2 - l1y1) * (l1x2 - l1x1) ) ) > 0)
        {
            return false;
        }

        return true;
    }

    /** 两条线段交点 */
    private static getIntersectPointLineWithLine ( l1Start: cc.Vec2, l1End: cc.Vec2, l2Start: cc.Vec2, l2End: cc.Vec2 ) {
        let l1x1 = l1Start.x;
        let l1x2 = l1End.x;
        let l1y1 = l1Start.y;
        let l1y2 = l1End.y;
        let l2x1 = l2Start.x;
        let l2x2 = l2End.x;
        let l2y1 = l2Start.y;
        let l2y2 = l2End.y;
        /** 1 解线性方程组, 求线段交点. **/

        // 如果分母为0 则平行或共线, 不相交 
        var denominator = (l1y2 - l1y1) * (l2x2 - l2x1) - (l1x1 - l1x2) * (l2y1 - l2y2);
        if (denominator == 0) {
            return null;
        }

        // 线段所在直线的交点坐标 (x , y) 
        var x = ( (l1x2 - l1x1) * (l2x2 - l2x1) * (l2y1 - l1y1)
                + (l1y2 - l1y1) * (l2x2 - l2x1) * l1x1
                - (l2y2 - l2y1) * (l1x2 - l1x1) * l2x1 ) / denominator;
                
        var y = -( (l1y2 - l1y1) * (l2y2 - l2y1) * (l2x1 - l1x1)
                 + (l1x2 - l1x1) * (l2y2 - l2y1) * l1y1
                 - (l2x2 - l2x1) * (l1y2 - l1y1) * l2y1 ) / denominator;

        /** 2 判断交点是否在两条线段上 **/
        if (
            // 交点在线段1上 
            (x - l1x1) * (x - l1x2) <= 0 && (y - l1y1) * (y - l1y2) <= 0
            // 且交点也在线段2上 
            && (x - l2x1) * (x - l2x2) <= 0 && (y - l2y1) * (y - l2y2) <= 0
        ) {

            // 返回交点p 
            return cc.v2( x, y);
        }
        //否则不相交 
        return null;
    }

    //---------------------- 61 线段找交点 start ---------

    /** 通过向量计算在cocos中的旋转角度 */
    public static getRotateByVector ( vect: cc.Vec2 ) {
        let rotate = 0;
        let x = vect.x;
        let y = vect.y;
        if ( x != 0) {
            let fudu = Math.atan( y / x );
            rotate = -1 * fudu * Const.RADIAN2EULAR;
        } else {
            if ( y > 0 ) {
                rotate = -90;
            } else if ( y < 0 ) {
                rotate = 90;
            }
        }
        return rotate;
    }

    
    public static calcPointOnArc = function (x0, y0, r, angle) {
        let x1, y1
        let _rad = (angle) * Math.PI / 180 // math_rad(angle)
        x1 = Math.cos(_rad) * r + x0
        y1 = Math.sin(_rad) * r + y0

        return [x1, y1]
    }

    /** 将角度转向量 */
    public static degreesToVector (rotate: number) {
        let radian = cc.misc.degreesToRadians(rotate); // 将角度转换为弧度
        let comVec = cc.v2(1, 0);// 一个水平向右的对比向量
        let dirVec = comVec.rotate(-radian);// 将对比向量旋转给定的弧度返回一个新的向量
        return dirVec;
    }

    /** 将向量转角度 */
    public static vectorToDegress (dirVec: cc.Vec2) {
        let comVec = cc.v2(1, 0);// 水平向右的对比向量
        let radian = dirVec.signAngle(comVec); // 求方向向量与对比向量间的弧度
        let degree = cc.misc.radiansToDegrees(radian); // 将弧度转换为角度
        return degree;
    }


    /**
     * 计算资源的原始路径
     * arg: resources/cfg/data/hello.json
     * return: D:/ude2/prj.game40/client/assets/resources/cfg/data/hello.json
     * @param url 
     */
    public static calcResourcesRawUrl(url: string): string {
        // 1. 计算根目录
        let resourceRootUrl = cc.url.raw("resources/")

        // 2. 去除参数的resources/
        let urlWithoutResources = url.replace("resources/", "");

        // 3. 拼接
        return resourceRootUrl + urlWithoutResources;
    }

}