import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as HttpReq from '../../net/httprequest.js';
import * as ULCop from '../../net/ULCop.js';
import * as Md5 from '../../sdktools/ULMd5.js';
import * as SDKTools from '../../sdktools/sdktools.js';

var VivoAdv = require('./ulsdkVivoModuleAdv.js');
let mUserId = ""
let isGetUserId = false
let copJsonObj = null

let sdkCopConfig = null
let isClosePay = 1 
class ModulesVivo {

	initModule() {

		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")

		isClosePay = this.getChannelConfigByKey("isClosePay")

		this.initSdkCopConfig()
		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)	
		VivoAdv.initAdv(mUserId)
		// console.log("md5-----js loadJs jquery-1.8.3.min",Md5)
	}

	initSdkCopConfig(){
		sdkCopConfig = new Object()
		sdkCopConfig["sdk_is_open_videorecord"] = "0" 
	}

	setVersion() {
		let setVersionDelay = ULSdkManager.getConfigByKey("setVersionDelay")

		if (ULCop.IsGetCopData) {

			console.log("ULSDK_TEST.........setVersion...数据初始化完成==========console=======isGetUserId====", ULCop.IsGetCopData)
			this.doSetVerSion()
		} else {

			console.log("ULSDK_TEST........setVersion...数据未初始化完成--------console-----延时------------", setVersionDelay, ULCop.IsGetCopData)
			let obj = this
			setTimeout(function() {

				obj.doSetVerSion()

			}, setVersionDelay)
		}

	}

	doSetVerSion() {

		let postData = new Array()
		postData.push("login")
		HttpReq.postMegaData(postData, mUserId)

		console.log("ULSDK_TEST.......doSetVerSion...-------------延时-----", isGetUserId, ULCop.IsGetCopData)

		// alert("doSetVerSion...mUserId.."+mUserId)
		let resultObj = {};

		let isShowUrlAdIcon = false;

		let defaultCopConfig = ULSdkManager.getConfigByKey("commonCopConfig")
		let channelCopConfig = this.getChannelConfigByKey("copDefaultConfig")
		let copJsonData = ULCop.getCopData(defaultCopConfig, channelCopConfig, sdkCopConfig)

		if (copJsonData) {

			copJsonObj = JSON.parse(copJsonData)
			if (copJsonObj.hasOwnProperty('s_sdk_adv_show_url_list')) {
				if (copJsonObj['s_sdk_adv_show_url_list']) {

					isShowUrlAdIcon = true;
				}
			}
		}
		
		isShowUrlAdIcon = false;

		let isOpenShare = this.getChannelConfigByKey("isOpenShare")
		let isUseSdkRank = this.getChannelConfigByKey("isUseSdkRank")
		let dataObj = {
			userId: mUserId,
			isClosePay: isClosePay,
			isOpenShare: isOpenShare,
			isUseSdkRank: isUseSdkRank,
			isShowUrlAdIcon: isShowUrlAdIcon,
			jumpGamesCount: 0
		};
		resultObj["cmd"] = "/c/getLoginUserMessage";
		resultObj["data"] = dataObj;
		let resultJson = JSON.stringify(resultObj); //将JSON对象转化为JSON字符
		ULSdkManager.manageSdkResponse(resultJson);
		console.log("setVersion:", resultObj);

		let channelInfoResult = {};
		channelInfoResult["cmd"] = "/c/channelInfoResult";
		let channelInfoDataObj = {};

		channelInfoDataObj["copInfo"] = copJsonData
		channelInfoResult["data"] = channelInfoDataObj;

		let channelInfoJson = JSON.stringify(channelInfoResult); //将JSON对象转化为JSON字符

		ULSdkManager.manageSdkResponse(channelInfoJson);

		
	}

	getUserId() {
		return mUserId
	}

	userLogin(dataObj) {

	}

	userIsLogin(dataObj) {

	}

	openShare(dataObj) {

	}


	openPay(dataObj) {

		console.log("openPay---openPay---", JSON.stringify(dataObj))

		let payId = dataObj["payInfo"]["payId"];
		let payDataObj = ULSdkManager.getConfigByKey("pay_code")

		try {
			var moneyStr = payDataObj[payId]["price"];
		} catch (e) {
			let resultErrObj = {};
			resultErrObj["cmd"] = "/c/payResult";
			let resultDataObj = {};
			resultDataObj["code"] = "0";
			resultDataObj["msg"] = "payId 不存在";
			resultDataObj["payData"] = dataObj;
			resultErrObj["data"] = resultDataObj;

			let resultErrObjJson = JSON.stringify(resultErrObj);　　　
			ULSdkManager.manageSdkResponse(resultErrObjJson);
			return
		}

		let netTimeout = ULSdkManager.getConfigByKey("netTimeout")
		let qgUrl = this.getChannelConfigByKey("qgUrl")

		let version = this.getChannelConfigByKey("version")
		let appSecret = this.getChannelConfigByKey("appSecret") 
		let packageName = this.getChannelConfigByKey("packageName") 
		let cpOrderNumber = this.getMark()
		let notifyUrl = "http://113.98.231.125:8051/vcoin/notifyStubAction"
		let orderTime = this.formatDate(new Date())
		let orderAmount = moneyStr + ".00"
		let orderTitle = payDataObj[payId]["proName"];
		let orderDesc = ULSdkManager.getConfigByKey("gameName")

		let signMethod = "MD5"

		let md5Secret = Md5.md5Sign(appSecret); // MD5.hex_md5(appSecret);
		md5Secret = md5Secret.toLowerCase();

		let md5Sign = "cpOrderNumber=" + cpOrderNumber + "&notifyUrl=" + notifyUrl + "&orderAmount=" + orderAmount + "&orderDesc=" + orderDesc + "&orderTime=" + orderTime + "&orderTitle=" + orderTitle + "&packageName=" + packageName + "&version=" + version + "&" + md5Secret
		console.log("httpPost---md5Sign---", md5Sign)
		let signature =  Md5.md5Sign(md5Sign);  //MD5.hex_md5(md5Sign); 
		console.log("httpPost---signature---", signature)

		signature = signature.toLowerCase();

		let postData = "cpOrderNumber=" + cpOrderNumber + "&notifyUrl=" + notifyUrl + "&orderAmount=" + orderAmount + "&orderDesc=" + orderDesc + "&orderTime=" + orderTime+ "&orderTitle=" + orderTitle + "&packageName=" + packageName + "&version=" + version + "&signMethod=" + signMethod + "&signature=" + signature 

		console.log("httpPost---qgUrl---", qgUrl)
		console.log("httpPost---postData---", postData)
		console.log("httpPost---netTimeout---", netTimeout)
		qgUrl = qgUrl + "?" + postData
		SDKTools.httpPost(qgUrl,"", netTimeout, function() {

			console.log("openPay---- timeout")

			let resultObj = {};
			resultObj["cmd"] = "/c/payResult";
			let resultDataObj = {};
			resultDataObj["code"] = "0";
			resultDataObj["msg"] = "订单预支付失败" 
			resultDataObj["payData"] = dataObj;
			resultObj["data"] = resultDataObj;

			let resultObjJson = JSON.stringify(resultObj);　　　
			ULSdkManager.manageSdkResponse(resultObjJson);
		}, function(res) {

			console.log("openPay---- success", res)
			qg.pay({
				orderInfo: res,
				success: function(ret) {
			       	console.log("openPay---- success----qg.pay----", ret)
			       	let resultObj = {};
					resultObj["cmd"] = "/c/payResult";
					let resultDataObj = {};
					resultDataObj["code"] = "1";
					resultDataObj["msg"] = "支付成功";
					resultDataObj["payData"] = dataObj;
					resultObj["data"] = resultDataObj;

					let resultObjJson = JSON.stringify(resultObj);　　　
					ULSdkManager.manageSdkResponse(resultObjJson);
			    },
				fail: function (msg, code) {
			       console.log("openPay---- fail----qg.pay----", msg, code)
			       	let resultObj = {};
					resultObj["cmd"] = "/c/payResult";
					let resultDataObj = {};
					resultDataObj["code"] = "0";
					resultDataObj["msg"] = "支付失败 code:" + code + " msg :" +msg;
					resultDataObj["payData"] = dataObj;
					resultObj["data"] = resultDataObj;

					let resultObjJson = JSON.stringify(resultObj);　　　
					ULSdkManager.manageSdkResponse(resultObjJson);
			    },
				cancel: function(){
			       console.log("openPay---- cancel----qg.pay----")
			       let resultObj = {};
					resultObj["cmd"] = "/c/payResult";
					let resultDataObj = {};
					resultDataObj["code"] = "0";
					resultDataObj["msg"] = "取消支付" 
					resultDataObj["payData"] = dataObj;
					resultObj["data"] = resultDataObj;

					let resultObjJson = JSON.stringify(resultObj);　　　
					ULSdkManager.manageSdkResponse(resultObjJson);
			    }
			})
		},"")

	}

	//随机字符串
	randomString(len) {

		len = len || 32;
		let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
		let maxPos = $chars.length;
		let pwd = '';
	　　for (let i = 0; i < len; i++) {
	　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	　　}
	　　return pwd;
	}

	//生成订单号
	getMark(){
		let t = new Date().getTime()
		return t + this.randomString(7)
	}

	formatDate(now) { 
		let year = now.getFullYear(); 
		let month = (now.getMonth()+1);
		month = month < 10 ? ('0' + month) : month;
		let date = now.getDate(); 
		date = date < 10 ? ('0' + date) : date;
		let hour = now.getHours() ; 
		hour = hour < 10 ? ('0' + hour) : hour;
		let minute = now.getMinutes(); 
		minute = minute < 10 ? ('0' + minute) : minute;
		let second = now.getSeconds(); 
		second = second < 10 ? ('0' + second) : second;
		return year + month + date + hour + minute + second; 
	} 

	openAdv(dataObj) {

		console.log("ULSDK_TEST.......openAdv...-------------mUserId-----", mUserId)
		switch (dataObj.type) {

			case "banner":

				let bannerId = this.getChannelConfigByKey("bannerId")
				let bannerTimer =  parseInt(copJsonObj["banner_timer"])  // this.getChannelConfigByKey("bannerTimer")

				VivoAdv.openBannerAdv(bannerId, bannerTimer, dataObj)
				break;
			case "video":
				let videoId = this.getChannelConfigByKey("videoId")
				VivoAdv.openVideoAdv(videoId, dataObj)
				break;
			case "interstitial":

				let intersId = this.getChannelConfigByKey("interstitialId")
				let interstitialTimer =  parseInt(copJsonObj["interstitial_timer"]) // this.getChannelConfigByKey("interstitialTimer")

				if (interstitialTimer < 500) {
					interstitialTimer = 10000
				}
				console.log("ULSDK_TEST.......openAdv...-------------interstitialTimer-----", interstitialTimer)

				VivoAdv.openInterstitialAd(intersId, interstitialTimer, dataObj)
				break;
			case "native":

				// VivoAdv.openNativeAdv(posId, mediaId)
				break;
			case "url" :

				let advUrl = copJsonObj["s_sdk_adv_show_url_list"]
				VivoAdv.openUrlAdv(advUrl, dataObj)
				break;
		}

	}

	closeAdv(dataObj) {

		switch (dataObj.type) {

			case "banner":

				VivoAdv.closeBannerAdv()
				break;
			case "video":


				break;
			case "interstitial":


				break;
			case "native":


				break;
		}

	}

	getChannelConfigByKey(key) {
		let channelMessObj = ULSdkManager.getConfigByKey("vivo")

		return channelMessObj[key]

	}
	saveRankData(dataObj) {

	}

	getRankData(dataObj) {

	}

}

//初始化当前模块对象
module.exports = new ModulesVivo();