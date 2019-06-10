import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';

import * as SDKTools from '../../sdktools/sdktools.js';
import * as ULCop from '../../net/ULCop.js';
import * as HttpReq from '../../net/httprequest.js';

import * as ULRsaSign from '../../sdktools/ULRsaSign.js';

let OppoQgAdv = require('./ulsdkOppoQgAdv.js')

let sdkCopConfig = null
let mUserId = ""

let isClosePay = 1
class ModulesOppoQg {

	initModule() {

		console.log("ULSDK_TEST....initModule...ModulesOppoQg.",JSON.stringify(qg.getSystemInfoSync()) )
		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")

		isClosePay = this.getChannelConfigByKey("isClosePay")

		this.initSdkCopConfig()

		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)
		let appId = this.getChannelConfigByKey("appid")
		OppoQgAdv.initAdv(appId)

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

		console.log("ULSDK_TEST.......doSetVerSion...-------------延时-----", ULCop.IsGetCopData)

		// alert("doSetVerSion...mUserId.."+mUserId)
		let resultObj = {};

		let isOpenShare = this.getChannelConfigByKey("isOpenShare")
		let isUseSdkRank = this.getChannelConfigByKey("isUseSdkRank")
		let dataObj = {
			userId: mUserId,
			isClosePay: isClosePay,
			isOpenShare: isOpenShare,
			isUseSdkRank: isUseSdkRank,
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

		let defaultCopConfig = ULSdkManager.getConfigByKey("commonCopConfig")
		let channelMessObj = ULSdkManager.getConfigByKey("oppo")
		let channelCopConfig = this.getChannelConfigByKey("copDefaultConfig")

		channelInfoDataObj["copInfo"] = ULCop.getCopData(defaultCopConfig, channelCopConfig, sdkCopConfig);
		channelInfoResult["data"] = channelInfoDataObj;

		let channelInfoJson = JSON.stringify(channelInfoResult); //将JSON对象转化为JSON字符

		ULSdkManager.manageSdkResponse(channelInfoJson);


	}

	getUserId() {

		return mUserId
	}

	userLogin() {

	}

	userIsLogin() {

	}
	openPay(dataObj) {


		let payId = dataObj["payInfo"]["payId"];
		let payDataObj = ULSdkManager.getConfigByKey("pay_code")

		let payIdMsg = payDataObj[payId] || "";
		if (!payIdMsg) {
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

		let self = this
		qg.login({
		    success: function(res){
		        let data = res.data|| {}
		        let token = data.token || ""

		        console.log("ULSDK_TEST..openPay --- login -----data:", JSON.stringify(res.data));
		        self.preOrder(self, token, payIdMsg,dataObj)

		    },
		    fail: function(res){
		        // errCode、errMsg
		        console.log(JSON.stringify(res));
		        let resultErrObj = {};
				resultErrObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "0";
				resultDataObj["msg"] = "请重新登录后购买";
				resultDataObj["payData"] = dataObj;
				resultErrObj["data"] = resultDataObj;

				let resultErrObjJson = JSON.stringify(resultErrObj);　　　
				ULSdkManager.manageSdkResponse(resultErrObjJson);
			 }
		});

	}

	preOrder(self, token, payIdMsg, dataObj){

		console.log("ULSDK_TEST..preOrder---- -")

		let netTimeout = ULSdkManager.getConfigByKey("netTimeout")
		let preOrderUrl = self.getChannelConfigByKey("preOrderUrl") 
		let privateKey = self.getChannelConfigByKey("privateKey") 
		let appkey = self.getChannelConfigByKey("appkey") 


		let params =  new Object()

		params.appId = self.getChannelConfigByKey("appid") 
		params.openId = token
		params.timestamp = new Date().getTime() 
		params.productName = payIdMsg.proName
		params.productDesc = payIdMsg.proName
		params.count = 1
		params.price = parseInt(payIdMsg.price) * 100
		params.currency = "CNY"
		params.cpOrderId = SDKTools.getMark()
		params.appVersion = self.getChannelConfigByKey("appVersion") 
		params.engineVersion = qg.getSystemInfoSync().platformVersion 

		let rsa = new ULRsaSign.RSAKey();
		rsa.readPrivateKeyFromPEMString(privateKey);

		let hashAlg = "sha256";

		let signStr = "appId=" + params.appId + "&appVersion=" + params.appVersion + "&count=" + params.count + "&cpOrderId=" + params.cpOrderId + "&currency=" + params.currency + "&engineVersion=" + params.engineVersion + "&openId=" + params.openId + "&price=" + params.price + "&productDesc=" + params.productDesc + "&productName=" + params.productName + "&timestamp=" + params.timestamp  

		let hSig = rsa.sign(signStr, hashAlg);
		params.sign = ULRsaSign.hex2b64(hSig)

		console.log("ULSDK_TEST..preOrder---- appid-sign-",params.sign)

		SDKTools.httpPost(preOrderUrl, JSON.stringify(params), netTimeout, ()=> {

				let resultErrObj = {};
				resultErrObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "0";
				resultDataObj["msg"] = "支付失败";
				resultDataObj["payData"] = dataObj;
				resultErrObj["data"] = resultDataObj;

				let resultErrObjJson = JSON.stringify(resultErrObj);　　　
				ULSdkManager.manageSdkResponse(resultErrObjJson);
				console.log("ULSDK_TEST..preOrder---- timeout--")
		},(res)=>{

				console.log("ULSDK_TEST..preOrder---- success---- res---",res)
				let resMsg = JSON.parse(res);
				let code = resMsg.code
				if (code == "200") {
					console.log("ULSDK_TEST..preOrder---- success---- code---",code)
					let orderNo = resMsg.data.orderNo
			        self.doOpenPay(token, orderNo, params.timestamp, privateKey, appkey, params.appId ,dataObj)
				}else{
					let resultErrObj = {};
					resultErrObj["cmd"] = "/c/payResult";
					let resultDataObj = {};
					resultDataObj["code"] = "0";
					resultDataObj["msg"] = "支付失败";
					resultDataObj["payData"] = dataObj;
					resultErrObj["data"] = resultDataObj;

					let resultErrObjJson = JSON.stringify(resultErrObj);　　　
					ULSdkManager.manageSdkResponse(resultErrObjJson);
				}
		},"application/json")

	}

	doOpenPay(token, orderNo, timestamp, privateKey, appkey, appId, dataObj){

		console.log("ULSDK_TEST..doOpenPay-------")
		// let timestamp = new Date().getTime() 
		let signStr = "appKey=" + appkey + "&orderNo=" + orderNo + "&timestamp=" + timestamp  

		let rsa = new ULRsaSign.RSAKey();
	
		rsa.readPrivateKeyFromPEMString(privateKey);
		let hashAlg = "sha256";

		let hSig = rsa.sign(signStr, hashAlg);
		let paySign = ULRsaSign.hex2b64(hSig)

		qg.pay({
		    // 登录接口返回的token
		    appId:appId ,
		    token: token,
		    // 时间戳
		    timestamp: timestamp,
		    paySign: paySign,
		    // 订单号
		    orderNo: orderNo,
		    // 成功回调函数，结果以 OPPO 小游戏平台通知CP的回调地址为准
		    success: function(res){
		        console.log("ULSDK_TEST..doOpenPay-----success---", JSON.stringify(res.data));
	        	let resultErrObj = {};
				resultErrObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "1";
				resultDataObj["msg"] = "支付成功";
				resultDataObj["payData"] = dataObj;
				resultErrObj["data"] = resultDataObj;

				let resultErrObjJson = JSON.stringify(resultErrObj);　　　
				ULSdkManager.manageSdkResponse(resultErrObjJson);
		    },
		    fail: function(res){
		        // errCode、errMsg
		        console.log("ULSDK_TEST..doOpenPay-----fail---", JSON.stringify(res));
	        	let resultErrObj = {};
				resultErrObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "0";
				resultDataObj["msg"] = "支付失败";
				resultDataObj["payData"] = dataObj;
				resultErrObj["data"] = resultDataObj;

				let resultErrObjJson = JSON.stringify(resultErrObj);　　　
				ULSdkManager.manageSdkResponse(resultErrObjJson);
		    }
		});
	}

	opendShare(dataObj) {

	}

	openAdv(dataObj) {
		let type = dataObj.type

		let appId = this.getChannelConfigByKey("appid")
		switch (type) {
			case "banner":

				let bannerId = this.getChannelConfigByKey("bannerId")
				let bannerTimer = this.getChannelConfigByKey("bannerTimer")
				OppoQgAdv.openBannerAdv(bannerId, appId, dataObj, bannerTimer)

				break;
			case "video":

				let videoId = this.getChannelConfigByKey("videoId")
				OppoQgAdv.openVideoAdv(videoId, appId, dataObj)
				break;
			case "interstitial":

				let intersId = this.getChannelConfigByKey("interstitialId")
				OppoQgAdv.openInterstitialAd(intersId, appId, dataObj)
				break
			case "native":

				break
		}
	}

	closeAdv(dataObj) {

		let type = dataObj.type
		switch (type) {
			case "banner":

				OppoQgAdv.closeBannerAdv()
				break
			case "video":

				break
			case "interstitial":

				break
			case "native":

				break
		}
	}


	getChannelConfigByKey(key) {
		let channelMessObj = ULSdkManager.getConfigByKey("oppoqg")

		return channelMessObj[key]

	}

	saveRankData(dataObj) {

	}

	getRankData(dataObj) {

	}

}

module.exports = new ModulesOppoQg();