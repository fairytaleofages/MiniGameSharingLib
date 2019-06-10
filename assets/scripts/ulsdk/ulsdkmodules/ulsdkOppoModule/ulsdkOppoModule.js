import * as
ULSdkManager
from '../../ulsdkmanager/ulsdkmanager.js';
import * as sdktools from '../../sdktools/sdktools.js';
import * as ULCop from '../../net/ULCop.js';


var OppoAdv = require('./ulsdkOppoAdv.js');
let mUserId = ""
let isGetUserId = false
let sdkCopConfig = null
let isClosePay = 1 // 默认关闭支付
class ModulesOppo {

	initModule() {

		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")

		isClosePay = this.getChannelConfigByKey("isClosePay")
		this.initSdkCopConfig()
		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)

		let jsUrl = "http://cdofs.oppomobile.com/cdo-activity/static/201809/30/gamehall/sdk/opppo-sdk-1.4.0.js"
		let packageName = this.getChannelConfigByKey("packageName")

		OppoAdv.initAdv()

		let initUserId = function() {

			let t = 0
			let interval = setInterval(function() {
				// 模拟加载
				t += 5
				console.log('progress is:' + t)

				if (OPPO.getAppVersion() > 1200) {

					OPPO.setLoadingProgress(t)

				} else {
					// 请添加兼容老版本大厅的展示自定义挡板逻辑
					// let loadingView = document.getElementById("loadingView");
					//      loadingView.style.display = 'block';
					//      let loadingP = document.getElementById("loadingP");
					//      loadingP.innerHTML = "游戏加载中...." + t + "%"


				}

				if (t > 100) {
					clearInterval(interval)
					console.log('ULSDK_TEST........loading complete')
					OPPO.loadingComplete()
					// 请添加兼容老版本大厅的关闭自定义挡板逻辑代码

				}
			}, 500)

			OPPO.login({
				packageName: packageName, //需要修改成开发者在oppo开放平台填写的包名才能成功调用此方法
				callback: function(res) {
					console.log(res)

					mUserId = gameId + "_oppo_" + res.userId
					console.log("ULSDK_TEST.........initModule...OPPO.login...res..", res)
					isGetUserId = true
				}
			})
		}
		sdktools.loadJs(jsUrl, initUserId)

		let advJs = 'https://adsfs.oppomobile.com/mp/app/union/h5/index.js'
		let initAdvJs = function() {
			console.log("ULSDK_TEST....initAdvJs......广告SDK加载完成")
		}
		sdktools.loadJs(advJs, initAdvJs)
	}


	initSdkCopConfig(){
		sdkCopConfig = new Object()
		sdkCopConfig["sdk_is_open_videorecord"] = "0" 
	}
	setVersion() {
		let setVersionDelay = ULSdkManager.getConfigByKey("setVersionDelay")

		if (isGetUserId && ULCop.IsGetCopData) {

			console.log("ULSDK_TEST.........setVersion...数据初始化完成==========console=======isGetUserId====", isGetUserId, ULCop.IsGetCopData)
			this.doSetVerSion()
		} else {

			console.log("ULSDK_TEST........setVersion...数据未初始化完成--------console-----延时------------", setVersionDelay, isGetUserId, ULCop.IsGetCopData)
			let obj = this
			setTimeout(function() {

				obj.doSetVerSion()

			}, setVersionDelay)
		}

	}

	doSetVerSion() {

		console.log("ULSDK_TEST.......doSetVerSion...-------------延时-----", isGetUserId, ULCop.IsGetCopData)

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

	userLogin(dataObj) {

	}

	userIsLogin(dataObj) {

	}

	openShare(dataObj) {

	}

	openPay(dataObj) {

	}

	openAdv(dataObj) {

		let mediaId = this.getChannelConfigByKey("mediaId")
		console.log("ULSDK_TEST.......openAdv...-------------mUserId-----", mUserId)
		switch (dataObj.type) {

			case "banner":

				let bannerId = this.getChannelConfigByKey("bannerId")
				let bannerTimer = this.getChannelConfigByKey("bannerTimer")
				OppoAdv.openBannerAdv(bannerId, mediaId, bannerTimer, dataObj)
				break;
			case "video":
				let videoId = this.getChannelConfigByKey("videoId")
				OppoAdv.openVideoAdv(videoId, mediaId, dataObj)
				break;
			case "interstitial":

				let intersId = this.getChannelConfigByKey("interstitialId")
				let interstitialTimer = this.getChannelConfigByKey("interstitialTimer")

				OppoAdv.openInterstitialAd(intersId, mediaId, interstitialTimer, dataObj)
				break;
			case "native":

				// OppoAdv.openNativeAdv(posId, mediaId)
				break;
		}

	}

	closeAdv(dataObj) {

		switch (dataObj.type) {

			case "banner":

				OppoAdv.closeBannerAdv()
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
		let channelMessObj = ULSdkManager.getConfigByKey("oppo")

		return channelMessObj[key]

	}
	saveRankData(dataObj) {

	}

	getRankData(dataObj) {

	}

}

//初始化当前模块对象
module.exports = new ModulesOppo();