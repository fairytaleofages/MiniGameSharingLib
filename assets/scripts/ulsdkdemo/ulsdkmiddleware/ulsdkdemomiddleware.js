import * as ULSdkManager from '../ulsdkmanager/ulsdkdemomanager.js';
import * as SDKTools from '../sdktools/sdkdemotools.js';

// console.log('middleWare.. 初始化..Manager.....', ULSdkManager)

var callbackHalder = null;

export function initSdk() {

	// let currentChannel = SDKTools.getQueryString("channel");
	let currentChannel = "ulsdkdemo"

	ULSdkManager.initManager(currentChannel)

	console.log("ULSDK_TEST.........初始化sdk......currentChannel..", currentChannel)
}
export function setGameCallback(func) {

	//游戏调用传入方法		        
	callbackHalder = func;

	console.log("ULSDK_TEST........setGameCallback....success.....")
}

export function request(requestJson) {

	try {

		let requestJsonObj = JSON.parse(requestJson);
		let cmdStr = requestJsonObj["cmd"]
		let dataObj = requestJsonObj["data"]
		ULSdkManager.manageSdkRequest(cmdStr, dataObj);
		console.log("ULSDK_TEST........request func is .... !", requestJson)
		console.log(requestJson)
	} catch (e) {
		console.log("ULSDK_TEST....request.....json解析失败！")
		console.log(e)
		 return 
	}
	
}

export function response(resultJson) {
	//返回消息给游戏
	if (callbackHalder != null) {
		callbackHalder(resultJson);

	} else {
		console.log("ULSDK_TEST.........callbackHalder func is null !")
	};

}