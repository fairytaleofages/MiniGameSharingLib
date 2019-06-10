import * as
ULSdkManager
from '../ulsdkmanager/ulsdkmanager.js';

let copJsonData = null;
export  var IsGetCopData = false;
export function getRequestUrl(copUrl, channelId,  gameId, gameVersion) {


	copUrl = copUrl + "?gameid=" + gameId + "&qudao=" + channelId + "&version=" + gameVersion

	return copUrl
}

export function initCopInfo(copUrl, channelId,  gameId, gameVersion) {

	let copUrlOk = getRequestUrl(copUrl, channelId,  gameId, gameVersion)

	console.log("initCopInfo.......channelId....", channelId)

	let netTimeout = ULSdkManager.getConfigByKey("netTimeout")
	var ajax = ''
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari 
		ajax = new XMLHttpRequest();
	} else { // code for IE6, IE5 
		ajax = new ActiveXObject("Microsoft.XMLHTTP");
	}
	//步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
	ajax.open('get', copUrlOk);
	//步骤三:发送请求
	ajax.send();

	var timeout = false;
	var netTimer = setTimeout(function() {
		timeout = true;
		ajax.abort();
	}, netTimeout);

	//步骤四:注册事件 onreadystatechange 状态改变就会调用
	ajax.onreadystatechange = function() {

		if (timeout) {
		　	console.log("initCopInfo.......copJsonData....timeout...")
			clearTimeout(netTimer);
		}
		
		if (ajax.readyState == 4 && ajax.status == 200) {
			//步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
			　　
			copJsonData = ajax.responseText

			console.log("initCopInfo.......copJsonData....", copJsonData)

		}
		IsGetCopData = true
	}

}
export function getCopData(defaultCopConfig, channelCopConfig, sdkCopConfig) {

	// 替换渠道独有的策略
	for (var k in channelCopConfig) {

		defaultCopConfig[k] = channelCopConfig[k]

	}
	
	let config = copDataReplace(defaultCopConfig)
	for (var s in sdkCopConfig) {

		config[s] = sdkCopConfig[s]
	}
	return JSON.stringify(config);

}

function copDataReplace(dataObj) {

	if (copJsonData == null) {
		console.log("copObj.....copDataReplace........1111111.", copJsonData)
		return dataObj
	}

	var copObj = JSON.parse(copJsonData);
	console.log("copObj.....copDataReplace........222222.", copJsonData)
	var getCopStatus = copObj.hasOwnProperty('code')
	if (getCopStatus && (copObj['code'] == -1)) {

		return dataObj;　　

	};
	//替换cop后台配置的策略
	for (var m in copObj) {

		dataObj[m] = copObj[m]

	}
	return dataObj;　　

}