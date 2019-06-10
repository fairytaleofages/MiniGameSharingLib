import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';

let videoData = null
let videoIsPlaying = false 
class XiaoMiAdv {

	initAdv() {

	}

	//banner
	openBannerAdv() {


	}

	closeBannerAdv() {



	}
	//插屏  不能控制关闭
	openInterstitialAd() {

	}

	//  视频
	openVideoAdv(dataObj) {

		videoData = dataObj
		
		console.log("openVideoAdv--hy_ad_sdk---")
		if (videoIsPlaying) {

			return
		}
		videoIsPlaying = true
		hy_ad_sdk.playVideoAd(function(code){

			console.log("openVideoAdv----code-",code)
			videoIsPlaying = false
		   // 这里是播放完广告的回调执行 
			if (code == 0) {
				let resultData = new Object()
				resultData["code"] = 1
				resultData["msg"] = "用户看完广告,可以发奖"
				resultData.advData = videoData

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)
			}else{
				let resultData = new Object()
				resultData["code"] = 0
				resultData["msg"] = "广告加载失败或用户关闭广告"
				resultData.advData = videoData

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)
			}
		})
	}
	/*
		原生

	*/
	openNativeAdv() {

	}
}

//初始化当前模块对象
module.exports = new XiaoMiAdv();