import * as
ULSdkManager
from '../../ulsdkmanager/ulsdkmanager.js';
import * as sdktools from '../../sdktools/sdktools.js';
import * as ULCop from '../../net/ULCop.js';


let M4399minGameAdv = require('./ulsdkM4399minGameAdv.js');
let mUserId = ""
let isGetUserId = false
let sdkCopConfig = null
let isClosePay = 1
class ModulesM4399minGame{
	
	initModule(){

		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")

		isClosePay = this.getChannelConfigByKey("isClosePay")

		this.initSdkCopConfig()
		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)

		let jsUrl = "http://h.api.4399.com/h5mini-2.0/h5api-interface.php"

		let initAdvJs = function(){
			console.log("ULSDK_TEST....initAdvJs......广告SDK加载完成")
	
			setTimeout(function() {
				M4399minGameAdv.initAdv()
			}, 1000)
		}
		sdktools.loadJs(jsUrl,initAdvJs)	
	}


	initSdkCopConfig(){
		sdkCopConfig = new Object()
		sdkCopConfig["sdk_is_open_videorecord"] = "0" 
	}

	getChannelConfigByKey(key){
		let channelMessObj = ULSdkManager.getConfigByKey("m4399mingame")

		return channelMessObj[key]

	}
	

	setVersion(){
		let setVersionDelay = ULSdkManager.getConfigByKey("setVersionDelay")

		if (ULCop.IsGetCopData && M4399minGameAdv.isGetAdvCount) {
		
			console.log("ULSDK_TEST.........setVersion...数据初始化完成==========console=======isGetUserId====",isGetUserId, ULCop.IsGetCopData)
			this.doSetVerSion()
		} else {
			
			console.log("ULSDK_TEST........setVersion...数据未初始化完成--------console-----延时------------", setVersionDelay,isGetUserId, ULCop.IsGetCopData)
			let obj = this
			setTimeout(function() {

				obj.doSetVerSion()

			}, setVersionDelay)
		}

	}

	doSetVerSion(){

		console.log("ULSDK_TEST.......doSetVerSion...-------------延时-----", isGetUserId, ULCop.IsGetCopData)

		// alert("doSetVerSion...mUserId.."+mUserId)
		let resultObj = {};
		let isOpenShare =  this.getChannelConfigByKey("isOpenShare")
		let isUseSdkRank = this.getChannelConfigByKey("isUseSdkRank")
		let dataObj = {
			userId: mUserId,
			isClosePay: isClosePay,
			isOpenShare:isOpenShare,
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

	getUserId(){
		return mUserId
	}

	userLogin(dataObj){

		let loginResult = new Object()
		loginResult.cmd = "/c/userLoginResult"

		let resultdataObj = new Object()
		resultdataObj.code = 1
		resultdataObj.userData = dataObj.userData
			
		loginResult.data = resultdataObj
		ULSdkManager.manageSdkResponse(JSON.stringify(loginResult));

	}

	userIsLogin(dataObj){

		let isLoginResult = new Object()
		isLoginResult.cmd = "/c/userIsLoginResult"

		let resultdataObj = new Object()
		resultdataObj.loginStatus = true
			
		isLoginResult.data = resultdataObj
		ULSdkManager.manageSdkResponse(JSON.stringify(isLoginResult));
		
	}

	openShare(dataObj){
		/**
		 * 调用分享
		 */
		window.h5api.share();
		let shareResult = new Object()
		shareResult.cmd = "/c/shareResult"

		let resultdataObj = new Object()
		resultdataObj.code = 1
		resultdataObj.msg = "分享成功！"
		
		resultdataObj.userData = dataObj.userData
			
		shareResult.data = resultdataObj
		ULSdkManager.manageSdkResponse(JSON.stringify(shareResult));
	}

	openPay(dataObj){

	}

	openAdv(dataObj){
	
		
		console.log("ULSDK_TEST.......openAdv...-------------mUserId-----", mUserId)
		switch(dataObj.type){

			case "banner" :
				
				
				// M4399minGameAdv.openBannerAdv(dataObj)
				break;
			case "video" :
				
				M4399minGameAdv.openVideoAdv(dataObj)
				break;
			case "interstitial" :

				// M4399minGameAdv.openInterstitialAd(dataObj)
				break;
			case "native" :

				// M4399minGameAdv.openNativeAdv(posId, mediaId)
				break;
		}
		
	}

	closeAdv(dataObj){
	
		switch(dataObj.type){

			case "banner" :

				M4399minGameAdv.closeBannerAdv()
				break;
			case "video" :

				
				break;
			case "interstitial" :

				
				break;
			case "native" :

				
				break;
		}

	}

	saveRankData(dataObj){

	}

	getRankData(dataObj){
		
	}

}

//初始化当前模块对象
module.exports = new ModulesM4399minGame();