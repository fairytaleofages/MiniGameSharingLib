import * as
ULSdkManager
from '../../ulsdkmanager/ulsdkmanager.js';
import * as SDKTools from '../../sdktools/sdktools.js';
import * as ULCop from '../../net/ULCop.js';


let XiaoMiAdv = require('./ulsdkXiaoMiAdv.js');
let mUserId = ""
let sdkCopConfig = null
let isClosePay = 1
class ModulesXiaoMi {
	initModule() {
		let sdkJs = "https://static.g.mi.com/game/h5sdk/h5-dj-sdk-v.1.0.min.js" 
		let initSdkJs = function() {
			console.log("ULSDK_TEST.....加载小米SDK的js成功！")
					setTimeout(function(){
											let config = {zIndex:9999,pin:0}
											window.hy_dj_sdk.ready(config,function(){

											   //sdk已经加载完成，可执行游戏的初始化逻辑
											   console.log("ULSDK_TEST-----hy_dj_sdk----成功！-")

											})
					},300)
			console.log("hy_dj_sdk-------------",hy_dj_sdk.getBaseData()) 
		}
		SDKTools.loadJs(sdkJs, initSdkJs)

		let adSdkJs = "https://static.g.mi.com/game/h5sdk/h5-ad-sdk-v.1.0.min.js"
		let initAdSdkJs = function() {
			console.log("ULSDK_TEST.....加载小米广告SDK的js成功！")		
		}

		SDKTools.loadJs(adSdkJs, initAdSdkJs)

		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")

		isClosePay = this.getChannelConfigByKey("isClosePay")

		// mUserId = gameId + "_xiaomi_" 
		
		this.initSdkCopConfig()
		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)

		XiaoMiAdv.initAdv()

	}

	initSdkCopConfig(){
		sdkCopConfig = new Object()
		sdkCopConfig["sdk_is_open_videorecord"] = "0" 
	}

	setVersion() {
		let setVersionDelay = ULSdkManager.getConfigByKey("setVersionDelay")

		if (ULCop.IsGetCopData) {

			console.log("ULSDK_TEST.........setVersion...数据初始化完成==========console===========", ULCop.IsGetCopData)
			this.doSetVersion()
		} else {

			console.log("ULSDK_TEST........setVersion...数据未初始化完成--------console-----延时------------", setVersionDelay, ULCop.IsGetCopData)
			let obj = this
			setTimeout(function() {

				obj.doSetVersion()

			}, setVersionDelay)
		}
	}

	doSetVersion() {

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
		console.log("ULSDK_TEST....setVersion:", resultObj);

		let channelInfoResult = {};
		channelInfoResult["cmd"] = "/c/channelInfoResult";
		let channelInfoDataObj = {};

		let defaultCopConfig = ULSdkManager.getConfigByKey("commonCopConfig")
		let channelCopConfig = this.getChannelConfigByKey("copDefaultConfig") // channelMessObj["copDefaultConfig"];

		channelInfoDataObj["copInfo"] = ULCop.getCopData(defaultCopConfig, channelCopConfig, sdkCopConfig);
		channelInfoResult["data"] = channelInfoDataObj;

		let channelInfoJson = JSON.stringify(channelInfoResult); //将JSON对象转化为JSON字符

		ULSdkManager.manageSdkResponse(channelInfoJson);

	}

	getUserId() {
		return mUserId
	}

	userLogin(dataObj){

	}

	userIsLogin(dataObj){
		
	}

	getChannelConfigByKey(key) {
		let channelMessObj = ULSdkManager.getConfigByKey("xiaomi")

		return channelMessObj[key]

	}
	openShare(dataObj) {

	}

	openPay(dataObj) {

	}

	openAdv(dataObj) {


		console.log("ULSDK_TEST.......openAdv...-------------mUserId-----", mUserId, dataObj)
		switch (dataObj.type) {

			case "banner":


				break;
			case "video":

				XiaoMiAdv.openVideoAdv(dataObj)
				break;
			case "interstitial":

				// XiaoMiAdv.openInterstitialAd(dataObj)
				break;
			case "native":

				// OppoAdv.openNativeAdv(posId, mediaId)
				break;
		}

	}

	closeAdv(dataObj) {

		switch (dataObj.type) {

			case "banner":

				// OppoAdv.closeBannerAdv()
				break;
			case "video":


				break;
			case "interstitial":


				break;
			case "native":


				break;
		}

	}

	saveRankData(dataObj) {

	}

	getRankData(dataObj) {

	}


}


//初始化当前模块对象
module.exports = new ModulesXiaoMi();