import * as
ULSdk
from '../ulsdkmiddleware/ulsdkmiddleware.js';

import {
	cConfig
} from '../assets/cConfig.js';
import * as HttpRequest from '../net/httprequest.js';


var CurrentChannelObj = null;
var ConfigJsonObj = null;
var currentChannel = null;
export function initManager(channel) {

	try {

		ConfigJsonObj = JSON.parse(cConfig);

	} catch (e) {
		console.error("initManager...cConfig..json解析失败！")
		return
	}

	currentChannel = channel;
	console.log("ULSDK_TEST...............InitManager....channel..", currentChannel)
	initCurrentChannelObj(channel)

}

function initCurrentChannelObj(channel) {
	console.log("ULSDK_TEST...............InitManager....initCurrentChannelObj ..")
	switch (channel) {
		case "limi":
			CurrentChannelObj = require('../ulsdkmodules/sdkLiMiModule/ulsdkLiMiModule.js');
			break
		case "weixin":
			CurrentChannelObj = require('../ulsdkmodules/sdkWeiXinModule/ulsdkWeiXinModule.js');
			break
		case "oppo":
			CurrentChannelObj = require('../ulsdkmodules/ulsdkOppoModule/ulsdkOppoModule.js');
			break
		case "xiaomi":
			CurrentChannelObj = require('../ulsdkmodules/ulsdkXiaoMiModule/ulsdkXiaoMiModule.js');
			break
		case "m4399mingame":
			CurrentChannelObj = require('../ulsdkmodules/ulsdkM4399minGameModule/ulsdkM4399minGameModule.js');
			break
		case "vivo":
			CurrentChannelObj = require('../ulsdkmodules/ulsdkVivoModule/ulsdkVivoModule.js');
			break
		case "oppoqg":
			CurrentChannelObj = require('../ulsdkmodules/ulsdkOppoQgModule/ulsdkOppoQgModule.js');
			break
		case "headline":
			CurrentChannelObj = require('../ulsdkmodules/ulsdkHeadLineModule/ulsdkHeadLineModule.js');
			break
		case "baidu":
			CurrentChannelObj = require('../ulsdkmodules/ulsdkBaiduModule/ulsdkBaiduModule.js');
			break
		case "kaixin":
			CurrentChannelObj = require('../ulsdkmodules/ulsdkKaiXinModule/ulsdkKaiXinModule.js');
			break
		default:
			console.log("ULSDK_TEST...............InitManager.没有该渠道...", channel)
			break
	}

	if (CurrentChannelObj) {
		console.log("ULSDK_TEST..........初始化，模块.....InitManager......", CurrentChannelObj)
		CurrentChannelObj.initModule()

	} else {
		console.error("ULSDK_TEST...............InitManager.....ERROR...")
	}


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
		console.error("ULSDK_TEST......游戏不在任何一个渠道！")
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
		case "/c/userLogin": //   调用渠道登录接口
			CurrentChannelObj.userLogin(dataObj);
			break;
		case "/c/userIsLogin": //   用户是否登录
			CurrentChannelObj.userIsLogin(dataObj);
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
		case "/c/recorderGameVideo":
			CurrentChannelObj.recorderGameVideo(dataObj);
			break
		case "/c/shareGameVideo":
			CurrentChannelObj.shareGameVideo(dataObj);
			break
		case "/c/jumpOtherGame":
			CurrentChannelObj.jumpOtherGame(dataObj);
			break;

		case "/c/openRecommendation":
			CurrentChannelObj.openRecommendation(dataObj);
			break;
		case "/c/closeRecommendation":
			CurrentChannelObj.closeRecommendation(dataObj);
			break;

		default:
			console.log("ULSDK_TEST.........没有该指令", cmdStr)

	}
}
export function manageSdkResponse(resultJson) {
	// console.log("setVersion...manageSdkResponse.", resultJson)
	ULSdk.response(resultJson)
}
