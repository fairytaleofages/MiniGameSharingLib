import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as sdktools from '../../sdktools/sdktools.js';

let isGetAdvCount = false

class M4399minGameAdv {

	initAdv() {

		this.getAdvShowCount()
	}

	getAdvShowCount() {
		window.h5api.canPlayAd(callback)

		/**
		 * 广告状态回调函数
		 *
		 */
		function callback(data) {

			isGetAdvCount = true
			console.log("是否可播放广告", data.canPlayAd, "剩余次数", data.remain)

			let resultData = new Object()
			resultData["video"] = data.remain
			resultData["banner"] = 1
			resultData["interstitial"] = 1
			resultData["native"] = 1

			let resultObj = new Object();
			resultObj.cmd = "/c/advValidCount"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)
		}

	}

	//banner
	openBannerAdv(dataObj) {


	}

	closeBannerAdv(dataObj) {



	}
	//插屏  不能控制关闭
	openInterstitialAd(dataObj) {


	}

	//  视频
	openVideoAdv(dataObj) {

		/**
		 * 广告状态回调函数
		 * @param {object} data 状态
		 */
		let thisObj = this
		let canPlayAdCallback = function(data) {
			console.log("ULSDK_TEST.....是否可播放广告", data.canPlayAd, "剩余次数", data.remain)
			if (data.canPlayAd) {

				let playAdCallback = function(obj) {
					console.log('ULSDK_TEST.....代码:' + obj.code + ',消息:' + obj.message)

					let resultData = new Object()

					if (obj.code === 10000) {
						console.log('ULSDK_TEST.....开始播放')
					} else if (obj.code === 10001) {
						console.log('ULSDK_TEST.....播放结束')
						resultData["code"] = 1
						resultData["msg"] = "播放结束,可以发放奖励"
					} else {
						console.log('ULSDK_TEST.....广告异常')
						resultData["code"] = 0
						resultData["msg"] = obj.message
					}

					resultData.advData = dataObj

					let resultObj = new Object();
					resultObj.cmd = "/c/advShowResult"
					resultObj.data = resultData

					let resultJson = JSON.stringify(resultObj);
					ULSdkManager.manageSdkResponse(resultJson)

					setTimeout(function() {
						thisObj.getAdvShowCount()
					}, 1000)		
				}
				window.h5api.playAd(playAdCallback)
			} else {
				let resultData = new Object()
				resultData["code"] = 0
				resultData["msg"] = "当前并没有适合的广告可以展示！"
				resultData.advData = dataObj

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)

				thisObj.getAdvShowCount()
			}
		}
		window.h5api.canPlayAd(canPlayAdCallback)

	}
	/*
		原生
	*/
	openNativeAdv(dataObj) {

	}
}

module.exports = new M4399minGameAdv()