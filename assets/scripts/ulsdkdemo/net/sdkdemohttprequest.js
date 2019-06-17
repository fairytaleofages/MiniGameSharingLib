import * as
ULSdkManager
from '../ulsdkmanager/ulsdkdemomanager.js';
import * as SDKTools from '../sdktools/sdkdemotools.js';

console.log("httpRequest......", ULSdkManager)

//获得cdk数据
export function useCdkey(dataObj) {

	let userId = dataObj['userId'];
	let cdkStr = dataObj['cdkStr'];
	let channelId = dataObj['channelId'];

	let appId = ULSdkManager.getConfigByKey("cdk_app_id")
	let netTimeout = ULSdkManager.getConfigByKey("netTimeout")

	let cdkUrl = ULSdkManager.getConfigByKey("useCDKEYUrl") + "?userId=" + userId + "&cdkStr=" + cdkStr + "&appId=" + appId + "&channelId=" + channelId;

	console.log(cdkUrl);
	var ajax = ''
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari 
		ajax = new XMLHttpRequest();
	} else { // code for IE6, IE5 
		ajax = new ActiveXObject("Microsoft.XMLHTTP");
	}
	//步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
	ajax.open('get', cdkUrl);
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
			var resultData = {};
			resultData['cmd'] = "/c/useCdkey";

			var dataObject = {};
			dataObject['code'] = "-1";
			dataObject['message'] = "请求超时";

			resultData["data"] = dataObject;
			//将JSON对象转化为JSON字符
			var cdkResultJson = JSON.stringify(resultData);

			ULSdkManager.manageSdkResponse(cdkResultJson);　　　
		}
		clearTimeout(netTimer);
		if (ajax.readyState == 4 && ajax.status == 200) {
			//步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
			　　
			let resultData = ajax.responseText
			resultData = resultData.replace("\"[", "[");
			resultData = resultData.replace("]\"", "]");
			resultData = resultData.replace("\"0\"", "\"1\"");
			resultData = resultData.replace("message", "data");

			var resultDataObj = JSON.parse(resultData);
			console.log("success.....loginRequest.....", resultDataObj)
			var cdkResult = {};
			cdkResult["cmd"] = "/c/useCdkey";
			cdkResult["data"] = resultDataObj;

			var cdkResultJson = JSON.stringify(cdkResult); //将JSON对象转化为JSON字符
			ULSdkManager.manageSdkResponse(cdkResultJson);

		}
	}

}
//上传大数据
export function postMegaData(dataObj, userId) {
	//	{"typeid":"3","updata":["game","start"]}
	//{"cmd":"cmd","data":["game","start"]}
	let currentChannel = ULSdkManager.getCurrentChannel()
	let gameId = ULSdkManager.getConfigByKey("gameId")
	let megadataServerTypeId = ULSdkManager.getConfigByKey("megadataServerTypeId")
	let netTimeout = ULSdkManager.getConfigByKey("netTimeout")

	let megadataUrl = ULSdkManager.getConfigByKey("megadataUrl")
	console.log("postMegaData....", gameId, ULSdkManager)
	dataObj.unshift(gameId, userId, currentChannel)
	var updata = {}
	updata['typeid'] = megadataServerTypeId;
	updata['updata'] = dataObj;
	let postData = "updata=" + JSON.stringify(updata);

	var ajax = ''
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari 
		ajax = new XMLHttpRequest();
	} else { // code for IE6, IE5 
		ajax = new ActiveXObject("Microsoft.XMLHTTP");
	}
	//步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
	ajax.open('post', megadataUrl, true);
	ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
	//步骤三:发送请求
	ajax.send(postData);
	var timeout = false;
	var netTimer = setTimeout(function() {
		timeout = true;
		ajax.abort();
	}, netTimeout);
	//步骤四:注册事件 onreadystatechange 状态改变就会调用
	ajax.onreadystatechange = function() {
		if (timeout) {

			console.log("大数据请求--------------超时！");

			var resultData = {};
			resultData['cmd'] = "/c/megadataServer";

			var dataObject = {};
			dataObject['code'] = "-1";
			dataObject['message'] = "请求超时";

			resultData["data"] = dataObject;
			//将JSON对象转化为JSON字符
			var cdkResultJson = JSON.stringify(resultData);

			ULSdkManager.manageSdkResponse(cdkResultJson);　　　　
			clearTimeout(netTimer);
			return
		};
		clearTimeout(netTimer);
		if (ajax.readyState == 4 && ajax.status == 200) {
			//步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
			　　
			let resultData = ajax.responseText
			var resultDataObj = {};
			console.log("success.....postMegaData..resultData...", resultData)
			var megaDataResult = {};
			megaDataResult["cmd"] = "/c/megadataServer";
			if (resultData == "Successful") {

				resultDataObj["code"] = '1';
				resultDataObj["message"] = 'Successful';

				console.log("大数据请求--------------Successful！");

			} else {

				resultDataObj["code"] = '0';
				resultDataObj["message"] = resultData;
			}
			megaDataResult["data"] = resultDataObj;
			// console.log("success.....postMegaData..resultData...", ULSdkManager)
			var megaDataResultJson = JSON.stringify(megaDataResult);
			ULSdkManager.manageSdkResponse(megaDataResultJson);
		}
	}
}

//渠道初始化时访问服务器，请求未处理订单数据
export function channelLogin(mUserId, requestType) {

	//--登陆时获取未发货订单信息--
	let netTimeout = ULSdkManager.getConfigByKey("netTimeout")
	let postData = 'userId=' + mUserId
	let loginUrl = ULSdkManager.getConfigByKey("loginUrl")

	let currentModule = ULSdkManager.getCurrentModule()

	console.log("channelLogin---loginData:", mUserId);
	try {


		var ajax = ''
		if (window.XMLHttpRequest) {
			// code for IE7+, Firefox, Chrome, Opera, Safari 
			ajax = new XMLHttpRequest();
		} else { // code for IE6, IE5 
			ajax = new ActiveXObject("Microsoft.XMLHTTP");
		}
		//步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
		ajax.open('post', loginUrl, true);
		ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
		//步骤三:发送请求
		ajax.send(postData);
		var timeout = false;
		var netTimer = setTimeout(function() {
			timeout = true;
			ajax.abort();
		}, netTimeout);
		//步骤四:注册事件 onreadystatechange 状态改变就会调用
		ajax.onreadystatechange = function() {
			if (timeout) {

				console.log("登录请求-支付数据---------------超时！");
				clearTimeout(netTimer);
				return
			};
			clearTimeout(netTimer);
			if (ajax.readyState == 4 && ajax.status == 200) {
				//步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
				　　
				let payParams = ajax.responseText

				if (payParams == "" || payParams == null || payParams == undefined) {
					console.log("channelLogin--服务端数据获取异常");
				} else {
					if (payParams == "empty") { //没有支付未发货的订单
						console.log("channelLogin---无支付未发货订单");
					} else { //获取到未发货订单信息数组

						currentModule.LoginCallback(JSON.parse(payParams));
						if (requestType == "1") { //计时器的请求获取的数据
							console.log("ChannelLogin---:定时器获取到数据,关闭定时器避免多余请求浪费资源-----")
							clearTimeout(SDKTools.timer);
						}
					}
				}
				console.log("initCopInfo.......copJsonData....", payParams)
			}
		}

	} catch (e) {
		console.log("channelLogin---异常信息:", e);
	}

}