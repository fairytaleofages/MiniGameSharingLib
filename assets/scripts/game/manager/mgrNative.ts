import Manager from "../../ulframework/manager/Manager";
import Timer from "../../ulframework/utils/Timer";
import Base64 from "../../ulframework/utils/Base64";
import ULNativeController from "../../Lib/ULNativeController";

/**
 * 本地管理器
 * 用于管理与native相关的代码交互操作
 * 初步规划为与各种sdk相关的代码在这里编写
 * 涉及到Android和iOS的不同, 平台通讯代码或许会有不同的改动
 * 考虑到多平台通讯的机智并不相同, 通讯的部分采用json进行交互
 */

/** java ULNativaController类名 */
const JAVA_FILE_PATH = "org/cocos2dx/javascript/ULNativeController";
/** java接口返回值 */
const JAVA_PARAMS_RETURN = "(Ljava/lang/String;)Ljava/lang/String;";
/** java回调全局函数名 */
const JAVA_CALLBACK_NAME = "JAVACALLBACK";

/** oc ULNativeController类名 */
const OC_FILE_NAME = "ULNativeController";
const OC_CALLBACK_NAME = "OCCALLBACK";



function JAVACALLBACK(base64JsonStr: string) {
    console.info("on JAVACALLBACK", base64JsonStr)
    try {
        let jsonStr = Base64.decode(base64JsonStr)
        mgrNative._onNativeCallbackJava(jsonStr);
    } catch (error) {
        cc.warn("JAVACALLBACK decode base64 faild! direct use base64JsonStr");
        mgrNative._onNativeCallbackJava(base64JsonStr);
    }
}

function OCCALLBACK(base64JsonStr: string) {
    console.info("on OCCALLBACK", base64JsonStr)
    try {
        let jsonStr = Base64.decode(base64JsonStr)
        mgrNative._onNativeCallbackObjc(jsonStr);
    } catch (error) {
        cc.warn("OCCALLBACK decode base64 faild! direct use base64JsonStr");
        mgrNative._onNativeCallbackObjc(base64JsonStr);
    }
}

const { ccclass } = cc._decorator;

@ccclass
export default class mgrNative extends Manager {
    private static nativeCallbackPending: any[] = null;
    private static bRegisterNativeCallback: boolean = false;


    //生命周期
    protected static onLoad(): void {
        super.onLoad();
        // 初始化
        console.info("mgrNative.onLoad");
        window[JAVA_CALLBACK_NAME] = JAVACALLBACK;
        window[OC_CALLBACK_NAME] = OCCALLBACK;

        //本地回调队列
        //用于将调用callback归并到游戏逻辑的timer中
        this.nativeCallbackPending = [];
        //这里初始化 重置变量
        if (!this.bRegisterNativeCallback) {
            this.bRegisterNativeCallback = true;
            this.registerNativeCallback();
        }

        Timer.callLoop(1 / 60, this.onTimer.bind(this), true);
    }

    private static onTimer() {
        let pending = this.nativeCallbackPending;
        if (pending.length > 0) console.info("mgrNative.onTimer", pending.length);
        while (pending.length > 0) {
            let responseData = pending.shift();

            console.info("ready send MSG_NATIVE_CALLBACK");
            // ul.dump(responseData, "responseData");

            this.sendMsg("MSG_NATIVE_CALLBACK", { responseData: responseData })
        }
    }

    /**
     * 注册本地回调
     */
    public static registerNativeCallback() {
            this._registerNativeCallbackJs()
    }

    /**
     * 通用回调
     */
    private static onNativeCallback(data: any) {
        console.info("onNativeCallback", data);
        ul.dump(data, "data");
        if (data) {
            this.nativeCallbackPending.push(data);
        }
    }
    

    // h5
    private static _registerNativeCallbackJs () {
        try {
			ULNativeController["initSdk"]();

			var funcName = "setGameCallback" ;
			if (ULNativeController && (typeof (ULNativeController[funcName]) == "function")) {
				ULNativeController[funcName](this._onNativeCallbackJs.bind(this));
			}
		} catch (error) {
			cc.error("注册失败", error)
		}
    }

    //js的本地回调
	public static _onNativeCallbackJs(jsonStr){

		console.log("---callback from ulsdk=", jsonStr)
		let dataTable = null;
		try {
			dataTable = JSON.parse(jsonStr);
		} catch (error) {
			console.log("回调后JSON解析失败", error)
		}

		console.log("--解析后的对象=",dataTable)

		this.onNativeCallback(dataTable)
	}


    /**
     * 注册Android 本地回调
     */
    private static _registerNativeCallbackJava() {
        //FIXME 假设Java已经有这个函数了


        // console.info("current platform is: cc.sys.OS_ANDROID");
        // jsb.reflection.callStaticMethod(
        //     "org/cocos2dx/javascript/AppActivity",
        //     "setCallFuncName",
        //     "(Ljava/lang/String;)Ljava/lang/String;",
        //     "JAVACALLBACK");

        jsb.reflection.callStaticMethod(
            JAVA_FILE_PATH,
            "setCallFuncName",
            JAVA_PARAMS_RETURN,
            JAVA_CALLBACK_NAME
        );
    }

    /**
     * 注册ios本地回调
     */
    private static _registerNativeCallbackObjc() {
        // TODO ULNativeController.mm中，保存静态变量有点问题，暂时跳过，强制写死为OCCALLBACK
        // this._callNativeObjc("setCallbackName", { callbackName: OC_CALLBACK_NAME });
    }


    /**
     * java的本地回调
     * @param jsonStr 
     */
    public static _onNativeCallbackJava(jsonStr: string) {
        let data = {};

        try {
            data = JSON.parse(jsonStr || "");
        } catch (error) {
            cc.warn("mgrNative._onNativeCallbackJava jsonStr error!");
            data["text"] = jsonStr;
        }

        this.onNativeCallback(data);
    }

    /**
     * objc的本地回调
     * @param jsonStr 
     */
    public static _onNativeCallbackObjc(jsonStr: string) {
        let data = {};

        try {
            data = JSON.parse(jsonStr || "");
        } catch (error) {
            cc.warn("mgrNative._onNativeCallbackObjc jsonStr error!");
            data["text"] = jsonStr;
        }

        this.onNativeCallback(data);
    }

    //////////////////通讯相关////////////////////////////
    /**
     * 将一个消息发往json
     * @param cmd 
     * @param dataTable 
     */
    public static callNative(cmd: string, dataTable?: any): any {
        dataTable = dataTable || {};
            this._callNativeJs(cmd, dataTable);
    }

    //将一个消息发送到js本地代码
	public static _callNativeJs(cmd, dataTable){
		try {
			let jsonStr = JSON.stringify(dataTable) ;
			
			var funcName = cmd;
			if (ULNativeController && (typeof (ULNativeController[funcName]) == "function")) {
				return ULNativeController[funcName](jsonStr)
			}else{
				console.log("-----没有找到ULNativeController")
			}

		} catch (error) {
			console.log("注册失败", error)
		}
		
		
		return null;
	}


    /**
     * 将一个消息发送到java本地代码
     * @param cmd 
     * @param dataTable 
     */
    private static _callNativeJava(cmd, dataTable): any {
        try {
            let jsonStr = JSON.stringify(dataTable);
            let retJson = jsb.reflection.callStaticMethod(
                JAVA_FILE_PATH,
                cmd,
                JAVA_PARAMS_RETURN,
                jsonStr
            );
            let retData = JSON.parse(retJson);
            return retData;
        } catch (error) {
            cc.warn("mgrNative._onNativeCallbackJava jsonStr error!");
            return { error: error };
        }
    }

    /**
     * 将一个消息发送到objc本地代码
     * @param cmd 
     * @param dataTable 
     */
    private static _callNativeObjc(cmd, dataTable) {
        // cc.log("pass _callNativeObjc", cmd)
        try {
            let jsonStr = JSON.stringify(dataTable);
            let retJson = jsb.reflection.callStaticMethod(
                OC_FILE_NAME,
                cmd + ":", // 拼接一个冒号代表参数
                jsonStr
            );
            let retData = JSON.parse(retJson);
            return retData;
        } catch (error) {
            cc.warn("mgrNative._callNativeObjc jsonStr error!");
            return { error: error };
        }
    }

}