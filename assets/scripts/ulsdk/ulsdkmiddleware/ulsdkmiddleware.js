import * as ULSdkManager from '../ulsdkmanager/ulsdkmanager.js';
import * as SDKTools from '../sdktools/sdktools.js';

console.log('middleWare.. 初始化..Manager.....', ULSdkManager)

var callbackHalder = null;

export function initSdk() {
	 
	let currentChannel = "vivo"
	
	if (!currentChannel) {

		currentChannel = SDKTools.getQueryString("channel");
	}

	ULSdkManager.initManager(currentChannel)

	console.log("ULSDK_TEST.........初始化sdk......currentChannel..", currentChannel)
}
export function setGameCallback(func) {

	//游戏调用传入方法		        
	callbackHalder = func;
	console.log("ULSDK_TEST........setGameCallback....success.....")
}

export function request(requestJson) {

	let requestJsonObj = null
	try {

		requestJsonObj = JSON.parse(requestJson);

	} catch (e) {
		console.error("ULSDK_TEST....request.....json解析失败！")
		console.error(JSON.stringify(e))
		return 
	}

	if (requestJsonObj) {
		let cmdStr = requestJsonObj["cmd"]
		let dataObj = requestJsonObj["data"]

		console.log("ULSDK_TEST........request func is .... !", requestJson)
		ULSdkManager.manageSdkRequest(cmdStr, dataObj);

	}	
}

export function response(resultJson) {
	//返回消息给游戏
	if (callbackHalder != null) {
		
		callbackHalder(resultJson);

	} else {
		console.error("ULSDK_TEST.........callbackHalder func is null !")
	};

}