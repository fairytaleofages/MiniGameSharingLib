import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as sdktools from '../../sdktools/sdktools.js';

let bannerIsCreat = false
let bannerTimerFlag = true
let lastBannerTimer = null

let bannerContainerId = "oppoBannerId"
let interstitialContainerId = "oppoInterstitialId"

let interstitialFlag = true
let lastInterstiTimer = null

class OppoAdv {

	initAdv() {
		let bannerDiv = document.createElement('div');
		bannerDiv.id = bannerContainerId;

		bannerDiv.style.width = '100%';
		bannerDiv.style.position = 'fixed'
		bannerDiv.style.bottom = '0px';
		bannerDiv.style.zIndex = 999;
		// bannerDiv.style.backgroundColor  = "red";
	
		document.body.appendChild(bannerDiv);
	}

	//banner
	openBannerAdv(posId, mediaId, bannerTimer, dataObj) {

		if (bannerIsCreat) {

			console.log("ULSDK_TEST......当前存在显示当前!")

			let adv = document.getElementById(bannerContainerId);
			adv.style.display = '';
			adv.style.visibility="visible";
			let resultData = new Object()
			resultData["code"] = 1
			resultData["msg"] = "banner广告显示成功"
			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)

			return				
		}
		console.log("ULSDK_TEST....创建div")

		let bannerAd = opUnion.createBannerAd({
			containerId: bannerContainerId,
			posId: posId,
			mediaId: mediaId
		});
		
		bannerAd.onLoad(function(err) {
			
			// bannerTimerFlag = false
			bannerIsCreat = true

			let resultData = new Object()
			resultData["code"] = 1
			resultData["msg"] = "banner广告显示成功"
			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)
		
			// //去掉定时器的方法  
			// clearTimeout(lastBannerTimer); 
			// let timeCallBack = function(){
				
			// 	bannerTimerFlag = true
			// 	// alert("bannerTimerFlag 状态改变",bannerTimerFlag)

			// 	console.log("ULSDK_TEST......bannerTimerFlag 状态改变!")
			// }
			// lastBannerTimer = sdktools.setTimer(bannerTimer, timeCallBack) 
			console.log("ULSDK_TEST......banner广告加载成功!")
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

			// let adv = document.getElementById(bannerContainerId);
			// adv.style.display = '';
			console.log("ULSDK_TEST......banner广告加载失败!", err)
		})
	}

	closeBannerAdv() {

		let adv = document.getElementById(bannerContainerId);
		adv.style.display = 'none';
		adv.style.visibility="hidden";

	}
	//插屏  不能控制关闭
	openInterstitialAd(posId, mediaId, interstitialTimer, dataObj) {
			
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

		let	interstitialAd = opUnion.createInterstitialAd({
				posId: posId,
				mediaId: mediaId
		})	
		
		interstitialAd.load().then(function() {

			 interstitialAd.show().then(function () {
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


				//去掉定时器的方法  
  				clearTimeout(lastInterstiTimer); 
				let timeCallBack = function(){
					//alert("interstitialFlag 状态改变")
					interstitialFlag = true

					console.log('ULSDK_TEST......interstitialFlag 状态改变');
				}
				lastInterstiTimer = sdktools.setTimer(interstitialTimer, timeCallBack) 
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
			console.log(err);
		})

		interstitialAd.onClose(function() {
			console.log('ULSDK_TEST......插屏⼴广告关闭');

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

		})

	}

	//  视频
	openVideoAdv(posId, mediaId, dataObj) {

		// alert(posId,"+++++",mediaId)
		let videoAd = opUnion.createVideoAd({
			posId: posId,
			mediaId: mediaId
		})

		videoAd.load().then(function () {
		    videoAd.show().then(function() {

				console.log('ULSDK_TEST....激励视频广告显示')

			})
		})

		
		videoAd.onError(function(err) {

			let resultData = new Object()

			resultData["code"] = 0
			resultData["msg"] = "暂时没有适合的广告可以展示，请稍后重试" 

			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)

			// alert("ULSDK_TEST...."+JSON.stringify(err))

			console.log(JSON.stringify(err));
		})

		videoAd.onClose(function(res) {

			let resultData = new Object()
			videoAd.offLoad()
			videoAd.offError()

			if (res && res.isEnded) {
				// 正常播放结束，可以下发奖励

				resultData["code"] = 1
				resultData["msg"] = "达到看广告时长要求，可以下发奖励"

			} else {
				// 播放中途退出，不下发奖励

				resultData["code"] = 0
				resultData["msg"] = "播放中途退出，不下发奖励"

			}

			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)

		})

	}
	/*

		原生

	*/
	openNativeAdv(posId, mediaId) {
		var nativeAd = opUnion.createNativeAd({
			posId: posId,
			mediaId: mediaId

		})

		nativeAd.load().then(function(res) {
			console.log('原生广告数据： ', res)
			nativeAd.doExpose({
				index: 0, // 曝光的为广告列表的第N个
				containerId: 'xxxx'
			})

		})

		nativeAd.onError(function(err) {
			console.log(err);
		})


		native.doClick({
			index: 1,
			containerId: 'xxxx',
			mouse: { // 点击时按下横纵坐标，弹起横纵坐标
				downX: 'xx',
				downY: 'xx',
				upX: 'xx',
				upY: 'xx'
			}
		})
	}


}

//初始化当前模块对象
module.exports = new OppoAdv();