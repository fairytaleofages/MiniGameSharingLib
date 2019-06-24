import * as
ULSdk
from '../ulsdkmiddleware/ulsdkdemomiddleware.js';

import {
	cConfig
} from '../assets/sdkdemocConfig.js';
import * as HttpRequest from '../net/sdkdemohttprequest.js';


var CurrentChannelObj = null;
var ConfigJsonObj = null;
var currentChannel = null;
export function initManager(channel) {

	try {

		ConfigJsonObj = JSON.parse(cConfig);

	} catch (e) {
		console.log("initManager.....json解析失败！")

		return
	}

	currentChannel = channel;
	// 
	CurrentChannelObj = require('../ulsdkmodules/sdkDemoModule/sdkDemoModule.js');
	CurrentChannelObj.initModule(channel)
	console.log("ULSDK_TEST...............InitManager......", CurrentChannelObj)
}


export function getCurrentChannel() {
	return currentChannel
}
export function getCurrentModule() {
	return CurrentChannelObj
}
export function getConfigByKey(key) {
	return ConfigJsonObj[key]
}

export function manageSdkRequest(cmdStr, dataObj) {

	if (CurrentChannelObj == null) {
		console.log("ULSDK_TEST......游戏不在任何一个渠道！")
		return
	};
	
	switch (cmdStr) {

		case "/c/setVersion": //    设置版本 并获取用户信息
			console.log("setVersion...ManageSdkRequest.", dataObj)
			// BK.Script.log("ULSDK_TEST........setVersion...ManageSdkRequest.", dataObj)
			CurrentChannelObj.setVersion();
			break;
		case "/c/openPay": //     打开支付
			CurrentChannelObj.openPay(dataObj);
			break;
		case "/c/openShare": //     打开分享			
			CurrentChannelObj.openShare(dataObj);
			break;
		case "/c/loginRole": //   登录上报
			CurrentChannelObj.loginRoleInfo(dataObj);
			break;
		case "/c/loginOut": //      用户登出
			CurrentChannelObj.loginOut(dataObj);
			break;
		case "/c/openAdv":
			CurrentChannelObj.openAdv(dataObj);
			break;
		case "/c/closeAdv":
			CurrentChannelObj.closeAdv(dataObj);
			break;
		case "/c/saveRankData":
			console.log("ULSDK_TEST.....saveRankData>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>==========manageSdkRequest====")
			CurrentChannelObj.saveRankData(dataObj);
			break;
		case "/c/getRankData":
			CurrentChannelObj.getRankData(dataObj);
			break;
		case "/c/useCdkey": //      使用cdk
			HttpRequest.useCdkey(dataObj);
			break;
		case "/c/megadataServer": //      大数据上传
			HttpRequest.postMegaData(dataObj, CurrentChannelObj.getUserId());
			break;
		case "/c/createRole": //      创角上报
			HttpRequest.postMegaData(new Array("/d/createNewRole", dataObj["roleName"]), CurrentChannelObj.getUserId());
			break;
		default:
			console.log("ULSDK_TEST.........没有该指令", cmdStr)
			
	}
}
export function manageSdkResponse(resultJson) {
	console.log("setVersion...manageSdkResponse.", resultJson)
	ULSdk.response(resultJson)


}