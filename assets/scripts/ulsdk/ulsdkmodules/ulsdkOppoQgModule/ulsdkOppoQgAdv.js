import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as SDKTools from '../../sdktools/sdktools.js';
import * as HttpReq from '../../net/httprequest.js';

let bannerAd = null
let bannerData = null
let bannerTimerFlag = true
let lastBannerTimer = null

let videoAd = null
let videoData = null

let insertAd = null
let insertData = null

let initFlag = false

let mUserId = ''
class OppoQgAdv {

	initAdv(appId) {

		console.log("ULSDK_TEST....OppoQgAdv...initAdv.", appId)

		try {

			qg.initAdService({
				appId: appId,
				isDebug: true,
				success: (res) => {
					console.log('ULSDK_TEST.....OppoQgAdv........success')
					initFlag = true
				},
				fail: (res) => {
					console.log('ULSDK_TEST.....OppoQgAdv.......fail:' + res.code + res.msg)
				},
				complete: (res) => {
					console.log('ULSDK_TEST.....OppoQgAdv.......complete:')
				}
			})
		} catch (e) {
			console.log("ULSDK_TEST.....OppoQgAdv..初始化...err")
		}


	}

	openBannerAdv(posId, appId, dataObj, bannerTimer) {


		bannerData = dataObj

		if (!initFlag || !bannerTimerFlag) {

			console.log("ULSDK_TEST.....OppoQgAdv..重新初始化.")
			if (!initFlag) {

				this.initAdv(appId)
			}

			if (!bannerTimerFlag) {
				console.log("ULSDK_TEST.....openBannerAdv..bannerTimerFlag狀態還未改變.")
			}

			let resultData = new Object()

			resultData["code"] = 0
			resultData["msg"] = "暂时没有适合的广告可以展示，请稍后重试"

			resultData.advData = bannerData

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)
			return
		}


		console.log('ULSDK_TEST.....openBannerAdv.....', posId, appId)

		let postData = new Array()
		postData.push("ad","banner","request")
		HttpReq.postMegaData(postData, mUserId)

		if (!bannerAd) {

			console.log('ULSDK_TEST.....openBannerAdv...创建广告组件..', posId, appId)

			bannerAd = qg.createBannerAd({
				posId: posId
			})

			bannerAd.onShow(() => {
				console.log('ULSDK_TEST.....banner 广告显示')
			})
		}

		bannerAd.show()
		let postData2 = new Array()
		postData2.push("ad","banner","success")
		HttpReq.postMegaData(postData2, mUserId)

		bannerTimerFlag = false
		//去掉定时器的方法  
		clearTimeout(lastBannerTimer);
		let timeCallBack = function() {

			bannerTimerFlag = true
			console.log("ULSDK_TEST......bannerTimerFlag 状态改变!")
		}
		lastBannerTimer = SDKTools.setTimer(bannerTimer, timeCallBack)
	}

	closeBannerAdv(dataObj) {

		bannerAd.hide()
	}

	openVideoAdv(posId, appId, dataObj) {
		videoData = dataObj
		if (!initFlag) {
			console.log("ULSDK_TEST.....OppoQgAdv..重新初始化.")
			this.initAdv(appId)

			let resultData = new Object()

			resultData["code"] = 0
			resultData["msg"] = "暂时没有适合的广告可以展示，请稍后重试"

			resultData.advData = videoData

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)
			return
		}
		console.log('ULSDK_TEST.....openVideoAdv.....', posId, appId)
		let postData = new Array()
		postData.push("ad","video","request")
		HttpReq.postMegaData(postData, mUserId)

		if (!videoAd) {

			videoAd = qg.createRewardedVideoAd({
				posId: posId
			})

			videoAd.onLoad(() => {
				console.log("ULSDK_TEST.....激励视频加载成功！")
				videoAd.show()
			})

			videoAd.onVideoStart(() => {

				console.log("ULSDK_TEST.....激励视频开始播放")
			})

			videoAd.onRewarded(() => {

				console.log("ULSDK_TEST.....激励视频广告完成，发放奖励")

				let resultData = new Object()

				resultData["code"] = 1
				resultData["msg"] = "达到看广告时长要求，可以下发奖励"

				resultData.advData = videoData

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)

				let postData = new Array()
				postData.push("ad","video","success")
				HttpReq.postMegaData(postData, mUserId)
			})

			videoAd.onError((err) => {
				console.log("ULSDK_TEST.....视频广告出错....", err)

				let resultData = new Object()

				resultData["code"] = 0
				resultData["msg"] = "暂时没有适合的广告可以展示，请稍后重试"

				resultData.advData = videoData

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)
			})

		}

		videoAd.load()

	}

	openInterstitialAd(posId, appId, dataObj) {

		insertData = dataObj
		if (!initFlag) {
			console.log("ULSDK_TEST.....OppoQgAdv..重新初始化.")
			this.initAdv(appId)

			let resultData = new Object()

			resultData["code"] = 0
			resultData["msg"] = "暂时没有适合的广告可以展示，请稍后重试"

			resultData.advData = insertData

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)
			return
		}
		console.log('ULSDK_TEST.....openInterstitialAd.....', posId, appId)

		let postData = new Array()
		postData.push("ad","interstitial","request")
		HttpReq.postMegaData(postData, mUserId)

		if (!insertAd) {
			insertAd = qg.createInsertAd({
				posId: posId
			})

			insertAd.onLoad(() => {
				insertAd.show()

				let resultData = new Object()

				resultData["code"] = 1
				resultData["msg"] = "插屏广告展示成功"

				resultData.advData = insertData

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)

				let postData = new Array()
				postData.push("ad","interstitial","success")
				HttpReq.postMegaData(postData, mUserId)
			})

			insertAd.onError((err) => {

				console.log("ULSDK_TEST.....插屏广告出错....", err)
				let resultData = new Object()

				resultData["code"] = 0
				resultData["msg"] = "插屏广告展示失败"

				resultData.advData = insertData

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)
			})

		}

		insertAd.load()
	}

	openNativeAdv(posId, appId, dataObj) {

	}

}

module.exports = new OppoQgAdv();