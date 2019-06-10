import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as SdkTools from '../../sdktools/sdktools.js';
import * as HttpReq from '../../net/httprequest.js';

let bannerIsCreat = false
let bannerTimerFlag = true
let lastBannerTimer = null
// 连续失败次数
let bannerFailedCount = 0 
let interstitialFailedCount = 0 

let bannerContainerId = "vivoBannerId"

let interstitialContainerId = "vivoInterstitialId"
let interstitialFlag = true
let lastInterstitialStatus = "close"
let lastInterstiTimer = null

let AdvFlag = true

let bannerAd = null
// let bannerIsClose = true

let mUserId = ""
class VivoAdv {

	initAdv(userId) {
		mUserId = userId
		if (qg.getSystemInfoSync().platformVersionCode < 1031) {
			// 不支持广告
			AdvFlag = false
		} else {
			// 支持广告
			AdvFlag = true
		}

	}

	//banner
	openBannerAdv(posId, bannerTimer, dataObj) {

		if (!AdvFlag || bannerFailedCount > 10) {
			console.log("ULSDK_TEST......当前存版本不支持广告")
			let resultData = new Object()
			resultData["code"] = 0
			resultData["msg"] = "没有广告可拉取"
			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)


			let postData = new Array()
			postData.push("ad","banner","lowversion")
			HttpReq.postMegaData(postData, mUserId)
			return
		}

		if (bannerAd) {

			console.log("ULSDK_TEST....复用openBannerAdv........")
			bannerAd.show()
			return
		}
		console.log("ULSDK_TEST....创建openBannerAdv......111.destroy...")

		let postData = new Array()
		postData.push("ad","banner","request")
		HttpReq.postMegaData(postData, mUserId)


		bannerAd = qg.createBannerAd({

			posId: posId,
			style: {}
		});

		// bannerTimerFlag = false

		// //去掉定时器的方法  
		// clearTimeout(lastBannerTimer);
		// let timeCallBack = function() {

		// 	bannerTimerFlag = true
		// 	// alert("bannerTimerFlag 状态改变", bannerTimerFlag)

		// 	console.log("ULSDK_TEST......bannerTimerFlag 状态改变!")
		// }
		// lastBannerTimer = SdkTools.setTimer(bannerTimer, timeCallBack)

		console.log("ULSDK_TEST....创建openBannerAdv......2222....",JSON.stringify(bannerAd) )
		bannerAd.onLoad(function(err) {

			let resultData = new Object()
			resultData["code"] = 1
			resultData["msg"] = "banner广告显示成功"
			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)

			console.log("ULSDK_TEST......banner广告加载成功!")
			bannerAd.show()
			bannerFailedCount = 0

			let postData = new Array()
			postData.push("ad","banner","success")
			HttpReq.postMegaData(postData, mUserId)
		})

		bannerAd.onError(function(err) {

			let resultData = new Object()
			resultData["code"] = 0
			resultData["msg"] = "banner广告加载失败"
			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)

			console.log("ULSDK_TEST......banner广告加载失败!", err)
			let postData = new Array()
			HttpReq.postMegaData(postData, mUserId)
			bannerAd.destroy()
			bannerFailedCount = bannerFailedCount + 1
		})

		bannerAd.onClose(function() {

			console.log("ULSDK_TEST......用户关闭banner!")
			bannerAd = null 
		})
	}

	closeBannerAdv() {
	
		
		if (bannerAd) {
			bannerAd.hide()
		}
	}
	//插屏  不能控制关闭
	openInterstitialAd(posIdStr, interstitialTimer, dataObj) {

		if (!AdvFlag || interstitialFailedCount > 10) {
			console.log("ULSDK_TEST......当前存版本不支持广告")
			let resultData = new Object()
			resultData["code"] = 0
			resultData["msg"] = "当前存版本不支持广告"
			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)

			let postData = new Array()
			postData.push("ad","interstitial","lowversion")
			HttpReq.postMegaData(postData, mUserId)
			return
		}


		if (!interstitialFlag) {

			//	alert("当前未拉取到广告,请稍后重试！",interstitialTimer)
			let resultData = new Object()
			resultData["code"] = 0
			resultData["msg"] = "当前没有适合的广告，请稍后重试"
			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)
			return
		}

		// if (lastInterstitialStatus == "open") {

		// 	console.log('ULSDK_TEST--上一个请求未处理完')
		// 	return
		// }


		let postData = new Array()
		postData.push("ad","interstitial","request")
		HttpReq.postMegaData(postData, mUserId)

		lastInterstitialStatus = "open"
		console.log('ULSDK_TEST--创建openInterstitialAd....1111.....', posIdStr)
		let interstitialAd = qg.createInterstitialAd({
			posId: posIdStr
		});


		interstitialAd.onLoad(function() {

			interstitialAd.show().then(function() {
				console.log('ULSDK_TEST....插屏广告显示')

				interstitialFlag = false

				let resultData = new Object()
				resultData["code"] = 1
				resultData["msg"] = "插屏⼴告加载成功"
				resultData.advData = dataObj

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)


				let postData = new Array()
				postData.push("ad","interstitial","success")
				HttpReq.postMegaData(postData, mUserId)

				interstitialFailedCount = 0 
				//去掉定时器的方法  
				clearTimeout(lastInterstiTimer); 
				let timeCallBack = function(){
					//alert("interstitialFlag 状态改变")
					interstitialFlag = true

					console.log('ULSDK_TEST......interstitialFlag 状态改变');
				}
				lastInterstiTimer = SdkTools.setTimer(interstitialTimer, timeCallBack) 

			})
		})

		interstitialAd.onError(function(err) {
			let resultData = new Object()
			resultData["code"] = 0
			resultData["msg"] = "当前并没有适合的广告可以展示，请稍后重试"
			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)

			lastInterstitialStatus = "close"


			let postData = new Array()
			// postData.push("ad","interstitial","failed")
			HttpReq.postMegaData(postData, mUserId)
			console.log("ULSDK_TEST--interstitialAd广告加载失败!", JSON.stringify(err))
			interstitialFailedCount = interstitialFailedCount + 1
		})

		interstitialAd.onClose(function() {
			console.log('ULSDK_TEST--插屏⼴广告关闭');

			let resultData = new Object()
			resultData["code"] = 1
			resultData["type"] = "interstitial"
			resultData["msg"] = "插屏⼴告关闭成功"
			resultData.userData = dataObj.userData

			let resultObj = new Object();
			resultObj.cmd = "/c/closeAdvResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)

			lastInterstitialStatus = "close"

		})

	}

	//  视频
	openVideoAdv(posId, dataObj) {

		// alert(posId,"+++++",mediaId)
		// let videoAd = opUnion.createVideoAd({
		// 	posId: posId,
		// 	mediaId: mediaId
		// })

		// videoAd.load().then(function () {
		//     videoAd.show().then(function() {

		// 		console.log('ULSDK_TEST....激励视频广告显示')

		// 	})
		// })


		// videoAd.onError(function(err) {

		// 	let resultData = new Object()

		// 	resultData["code"] = 0
		// 	resultData["msg"] = "暂时没有适合的广告可以展示，请稍后重试" 

		// 	resultData.advData = dataObj

		// 	let resultObj = new Object();
		// 	resultObj.cmd = "/c/advShowResult"
		// 	resultObj.data = resultData

		// 	let resultJson = JSON.stringify(resultObj);
		// 	ULSdkManager.manageSdkResponse(resultJson)

		// 	// alert("ULSDK_TEST...."+JSON.stringify(err))

		// 	console.log(JSON.stringify(err));
		// })

		// videoAd.onClose(function(res) {

		// 	let resultData = new Object()
		// 	videoAd.offLoad()
		// 	videoAd.offError()

		// 	if (res && res.isEnded) {
		// 		// 正常播放结束，可以下发奖励

		// 		resultData["code"] = 1
		// 		resultData["msg"] = "达到看广告时长要求，可以下发奖励"

		// 	} else {
		// 		// 播放中途退出，不下发奖励

		// 		resultData["code"] = 0
		// 		resultData["msg"] = "播放中途退出，不下发奖励"

		// 	}

		// 	resultData.advData = dataObj

		// 	let resultObj = new Object();
		// 	resultObj.cmd = "/c/advShowResult"
		// 	resultObj.data = resultData

		// 	let resultJson = JSON.stringify(resultObj);
		// 	ULSdkManager.manageSdkResponse(resultJson)

		// })

	}
	/*

		原生

	*/
	openNativeAdv(posId, mediaId) {

	}

	/*

	*/

	openUrlAdv(url, dataObj){

	//	console.log("openUrlAdv...-------...")

		// window.open()
		window.location.href="https://gamesres.ultralisk.cn/notice/23huodong/"

		// let urlDiv = document.createElement('iframe');
		// // urlDiv.id = bannerContainerId;

		// urlDiv.style.width = '100%';
		// urlDiv.style.height = '100%';
		// bannerDiv.style.position = 'fixed'
		// // bannerDiv.style.bottom = '0px';
		// urlDiv.style.zIndex = 9999;
		// urlDiv.style.src = 'https://www.baidu.com';
		// // bannerDiv.style.backgroundColor  = "red";
	
		// document.body.appendChild(urlDiv);

		// window.open("https://gamesres.ultralisk.cn/notice/23huodong/")

		// var iframe = document.createElement('iframe'); 
		// iframe.src="https://gamesres.ultralisk.cn/notice/23huodong/";  
		// iframe.style.position = 'fixed'
		// iframe.style.width = '100%';
		// iframe.style.height = '100%';
		// iframe.style.zIndex = 9999;
		// document.body.appendChild(iframe);
	}


}

//初始化当前模块对象
module.exports = new VivoAdv();