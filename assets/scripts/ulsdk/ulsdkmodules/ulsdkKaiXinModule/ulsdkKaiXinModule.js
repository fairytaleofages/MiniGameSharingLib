import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as SDKTools from '../../sdktools/sdktools.js';
import * as ULCop from '../../net/ULCop.js';

let mUserId = ""
let isClosePay = 1
let sdkCopConfig = null
let kaiXinAdv =  require('./ulsdkKaiXinModuleAdv.js');
class ModulesKaiXin {

	initModule(){

		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")

		isClosePay = this.getChannelConfigByKey("isClosePay")

		this.initSdkCopConfig()
		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)

		let bannerId = this.getChannelConfigByKey("bannerId")
		let interstitialId = this.getChannelConfigByKey("interstitialId")
		let videoId = this.getChannelConfigByKey("videoId")

		let sdkJs = "https://cdn.feidou.com/yttx/kxsmallgame/h5sdk/2.0/kaixin.js" 
		let initSdkJs = function() {
			console.log("ULSDK_TEST.....加载开心SDK的js成功！")
		
		    kaixin.initializeAsync(false).then(function() {
		        //初始化完成后开始调用游戏资源加载
		        console.log("initializeAsync success!");
		        kaixin.setLoadingProgress(50);
		        kaixin.setLoadingProgress(100);
		        kaixin.startGameAsync().then(function() {
				      //游戏开始逻辑
				      console.log("startGameAsync-----------")
				      kaiXinAdv.initAdv(bannerId, interstitialId, videoId)

			    });
		      }).catch(function(err){
		        console.error("initializeAsync-------",err);
		      });

		}
		SDKTools.loadJs(sdkJs, initSdkJs)

	}

	initSdkCopConfig(){
		sdkCopConfig = new Object()
		sdkCopConfig["sdk_is_open_videorecord"] = "0" 
	}

	setVersion() {
		let setVersionDelay = ULSdkManager.getConfigByKey("setVersionDelay")

		if (ULCop.IsGetCopData) {

			// console.log("ULSDK_TEST.........setVersion...数据初始化完成==========console=======isGetUserId====", ULCop.IsGetCopData)
			this.doSetVerSion()
		} else {

			// console.log("ULSDK_TEST........setVersion...数据未初始化完成--------console-----延时------------", setVersionDelay, ULCop.IsGetCopData)
			let obj = this
			setTimeout(function() {

				obj.doSetVerSion()

			}, setVersionDelay)
		}

	}


	doSetVerSion() {

		// console.log("ULSDK_TEST.......doSetVerSion...-------------延时-----", ULCop.IsGetCopData)

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

	userLogin(dataObj) {

	}

	userIsLogin(dataObj) {

	}

	openShare(dataObj) {

		let shareResult = new Object()
		shareResult.cmd = "/c/shareResult"
		let resultdataObj = new Object()


		let content = dataObj.content
		if (!content) {
			content = this.getChannelConfigByKey("shareTitle")
		}
		kaixin.shareAsync({
          text: content
        }).then(function() {

			resultdataObj.code = 1
			resultdataObj.msg = "分享成功！"
			resultdataObj.userData = dataObj.userData
			shareResult.data = resultdataObj
			ULSdkManager.manageSdkResponse(JSON.stringify(shareResult));
            console.log("share done................");
        }).catch(function(e){

        	resultdataObj.code = 0
			resultdataObj.msg = "分享失败！"
			resultdataObj.userData = dataObj.userData
			shareResult.data = resultdataObj
			ULSdkManager.manageSdkResponse(JSON.stringify(shareResult));
            console.log("share fail:" + e);
        });

	}

	openPay(dataObj) {

	}

	openAdv(dataObj) {

		console.log("ULSDK_TEST.......openAdv...-------------mUserId-----", mUserId)
		switch (dataObj.type) {

			case "banner":

				let bannerId = this.getChannelConfigByKey("bannerId")
				kaiXinAdv.openBanner(dataObj, bannerId)				
				break;
			case "video":

				let videoId = this.getChannelConfigByKey("videoId")
				kaiXinAdv.openVideoAdv(dataObj, videoId)
				break;
			case "interstitial":

				let interstitialId = this.getChannelConfigByKey("interstitialId")
				kaiXinAdv.openInterstitialAd(dataObj, interstitialId)
				break;
			case "native":


				break;
		}

	}

	closeAdv(dataObj) {

		switch (dataObj.type) {

			case "banner":

				let bannerId = this.getChannelConfigByKey("bannerId")
				kaiXinAdv.closeBanner(bannerId, dataObj)
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
		let channelMessObj = ULSdkManager.getConfigByKey("kaixin")

		return channelMessObj[key]

	}
	saveRankData(dataObj) {

	}

	getRankData(dataObj) {

	}


}
module.exports = new ModulesKaiXin()