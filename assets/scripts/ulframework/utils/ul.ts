function _convert(match?, nosign?) {
    if (nosign) {
        match.sign = '';
    } else {
        match.sign = match.negative ? '-' : match.sign;
    }
    var l = match.min - match.argument.length + 1 - match.sign.length;
    var pad = new Array(l < 0 ? 0 : l).join(match.pad);
    if (!match.left) {
        if (match.pad == "0" || nosign) {
            return match.sign + pad + match.argument;
        } else {
            return pad + match.sign + match.argument;
        }
    } else {
        if (match.pad == "0" || nosign) {
            return match.sign + match.argument + pad.replace(/0/g, ' ');
        } else {
            return match.sign + match.argument + pad;
        }
    }
}

function ul_format(): string {
    if (typeof arguments == "undefined") { return null; }
    if (arguments.length < 1) { return null; }
    if (typeof arguments[0] != "string") { return null; }
    if (typeof RegExp == "undefined") { return null; }
    var string = arguments[0];
    var exp = new RegExp(/(%([%]|(\-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g);
    var matches = new Array();
    var strings = new Array();
    var convCount = 0;
    var stringPosStart = 0;
    var stringPosEnd = 0;
    var matchPosEnd = 0;
    var newString = '';
    var match = null;
    while (match = exp.exec(string)) {
        if (match[9]) { convCount += 1; }
        stringPosStart = matchPosEnd;
        stringPosEnd = exp.lastIndex - match[0].length;
        strings[strings.length] = string.substring(stringPosStart, stringPosEnd);
        matchPosEnd = exp.lastIndex;
        matches[matches.length] = {
            match: match[0],
            left: match[3] ? true : false,
            sign: match[4] || '',
            pad: match[5] || ' ',
            min: match[6] || 0,
            precision: match[8],
            code: match[9] || '%',
            negative: parseInt(arguments[convCount]) < 0 ? true : false,
            argument: String(arguments[convCount])
        };
    }
    strings[strings.length] = string.substring(matchPosEnd);
    if (matches.length == 0) { return string; }
    if ((arguments.length - 1) < convCount) { return null; }
    var code = null;
    var match = null;
    var substitution = null;
    var i = null;
    for (i = 0; i < matches.length; i++) {
        if (matches[i].code == '%') { substitution = '%' }
        else if (matches[i].code == 'b') {
            matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(2));
            substitution = _convert(matches[i], true);
        }
        else if (matches[i].code == 'c') {
            matches[i].argument = String(String.fromCharCode(Math.abs(parseInt(matches[i].argument))));
            substitution = _convert(matches[i], true);
        }
        else if (matches[i].code == 'd') {
            matches[i].argument = String(Math.abs(parseInt(matches[i].argument)));
            substitution = _convert(matches[i]);
        }
        else if (matches[i].code == 'f') {
            matches[i].argument = String(Math.abs(parseFloat(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
            substitution = _convert(matches[i]);
        }
        else if (matches[i].code == 'o') {
            matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(8));
            substitution = _convert(matches[i]);
        }
        else if (matches[i].code == 's') {
            matches[i].argument = matches[i].argument.substring(0, matches[i].precision ? matches[i].precision : matches[i].argument.length)
            substitution = _convert(matches[i], true);
        }
        else if (matches[i].code == 'x') {
            matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
            substitution = _convert(matches[i]);
        }
        else if (matches[i].code == 'X') {
            matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
            substitution = _convert(matches[i]).toUpperCase();
        }
        else {
            substitution = matches[i].match;
        }
        newString += strings[i];
        newString += substitution;
    }
    newString += strings[i];
    return newString;
}

function ul_formatDate(date: Date, fmt: string): string {
    var o = {
        "M+": date.getMonth() + 1,                 //月份   
        "d+": date.getDate(),                    //日   
        "h+": date.getHours(),                   //小时   
        "m+": date.getMinutes(),                 //分   
        "s+": date.getSeconds(),                 //秒   
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
        "S": date.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
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
function _dump(arr, level?) {
    var dumped_text = "";
    if (!level) level = 0;

    //The padding given at the beginning of the line.
    var level_padding = "";
    for (var j = 0; j < level + 1; j++) level_padding += "    ";

    if (typeof (arr) == 'object') { //Array/Hashes/Objects 
        for (var item in arr) {
            var value = arr[item];

            if (typeof (value) == 'object') { //If it is an array,
                dumped_text += level_padding + "'" + item + "' ...\n";
                dumped_text += _dump(value, level + 1);
            } else {
                dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
            }
        }
    } else { //Stings/Chars/Numbers etc.
        dumped_text = "===>" + arr + "<===(" + typeof (arr) + ")";
    }
    return dumped_text;
}

function ul_dump(data: any, tag?: string, level?: number) {
    // if (cc.sys.isBrowser) {
    //     // 浏览器直接info即可
    //     cc.info("dump:", tag, data);

    // } else {
    let text = _dump(data);
    console.log("dump-begin", tag);
    console.log(text);
    console.log("dump-end")
    // }
}

function ul_action_float(duration: number, start: number, end: number, callbak: (value: number) => void): cc.ActionInterval {
    let action = cc.delayTime(duration);
    action["update"] = (progress) => {
        callbak(start * (1 - progress) + end * progress);
    }
    return action;
}


function getType(obj) {
    //tostring会返回对应不同的标签的构造函数
    let toString = Object.prototype.toString;
    let map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
    };
    // if (obj instanceof Element) {
    //     return 'element';
    // }
    return map[toString.call(obj)];
}

function deepClone(data) {
    let type = getType(data);
    let obj;
    if (data instanceof cc.Node) {
        //节点数据过大, 使用引用, 避免栈溢出
        return data;
    } else if (type === 'object') {
        obj = {};
    } else if (type === 'array') {
        obj = [];
    } else {
        //不再具有下一层次
        return data;
    }
    if (type === 'array') {
        for (let i = 0, len = data.length; i < len; i++) {
            obj.push(deepClone(data[i]));
        }
    } else if (type === 'object') {
        for (let key in data) {
            obj[key] = deepClone(data[key]);
        }
    }
    return obj;
}

function ul_length(data: any): number {
    let type = getType(data);
    if (type === "array") {
        return data.length;
    }
    else if (type === "object") {
        let length = 0;
        for (const key in data) {
            const element = data[key];
            if (element) {
                length++;
            }
        }
        return length;
    }
    else {
        return 0;
    }
}

function ul_clamp(cur: number, min: number, max: number) {
    if (cur < min) {
        cur = min;
    }
    if (cur > max) {
        cur = max;
    }
    return cur;
}


///// 导入到ul中 /////
ul.format = ul_format;
ul.formatDate = ul_formatDate;
ul.dump = ul_dump;

ul.actionFloat = ul_action_float;
ul.clone = deepClone;
ul.length = ul_length;
ul.clamp = ul_clamp;
ul.getType = getType