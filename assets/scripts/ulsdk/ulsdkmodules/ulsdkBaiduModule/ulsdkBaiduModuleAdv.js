import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as SDKTools from '../../sdktools/sdktools.js';

let videoAd = null
let videoData = null
let isPlaying = false

let bannerAd = null
let bannerData = null 
let bannerTimerFlag = true
let lastBannerTimer = null
class  BaiduAdv{

	initAdv(videoId, appSid) {
		
		console.log("ULSDK_TEST......initAdv......initAdv..")
		videoAd = swan.createRewardedVideoAd({ 
				adUnitId: videoId,
				appSid: appSid 
			})
		this.videoCallBack()
	}

	openBannerAdv(bannerId, appSid, dataObj, bannerTimer){

		if (!bannerTimerFlag && bannerAd) {

			bannerAd.show()
			console.log("ULSDK_TEST......openBannerAdv......复用banner..") 
			return
		}
	
		if (bannerAd) {

			bannerAd.destroy()
			bannerAd = null
			console.log("ULSDK_TEST......openBannerAdv......destroy..")
		}



		let device = swan.getSystemInfoSync()
		let h = device.screenHeight
		bannerAd = swan.createBannerAd({
					adUnitId: bannerId,
					appSid: appSid,
					style: {
					    left: 0.1,
					    top: 10,
					    width: device.screenWidth
					}
				})
		bannerAd.style.top = h - bannerAd.style.height ;
		bannerData = dataObj


		

		bannerAd.onError(err => {

		
			let resultData = new Object()
			resultData["code"] = 0
			resultData["msg"] = "banner广告加载失败"
			resultData.advData = bannerData

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)
			bannerTimerFlag = true

			console.log("ULSDK_TEST......banner广告加载失败!", err)

		})

		bannerAd.show()
		console.log("ULSDK_TEST......openBannerAdv......show..")
		bannerTimerFlag = false
	
        //去掉定时器的方法  
        clearTimeout(lastBannerTimer); 
        let timeCallBack = function(){
          //alert("interstitialFlag 状态改变")
          bannerTimerFlag = true

          console.log('ULSDK_TEST......bannerTimerFlag 状态改变');
        }
        lastBannerTimer = SDKTools.setTimer(bannerTimer, timeCallBack) 

	}

	closeBannerAdv(){
		if (bannerAd) {

			bannerAd.hide()
		}
	}

	openVideoAdv(videoId, appSid, dataObj){



		if (!videoAd) {
			videoAd = swan.createRewardedVideoAd({ 
				adUnitId: videoId,
				appSid: appSid 
			})
			this.videoCallBack()
		}

		if (isPlaying) {
			console.log("广告正在播放中")
			return
		}
		videoData = dataObj
		isPlaying = true


		videoAd.load().then(() => {

			videoAd.show().then(() => {
				console.log("广告展示成功....1")
			})

		}).catch(err => {

			videoAd.load().then(
				() => videoAd.show().then(() => {
					console.log("广告展示成功....2")
				})
			).catch(err => {
				console.log("videoLoad.....err....",err)
				let resultData = new Object()
				resultData.code = 0
				resultData.msg = "广告播放失败"+ err.errMsg
				resultData.advData = videoData

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)
				isPlaying = false
				console.log("广告播放失败")
			})
		})
	}	

	videoCallBack(){

		videoAd.onClose(res => {

			isPlaying = false
		    if (res.isEnded) {
		        console.log('激励视频完整播放后关闭')
		   
				let resultData = new Object()
				resultData.code = 1
				resultData.msg = "正常播放结束，可以下发游戏奖励"
				resultData.advData = videoData

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)
		    } else {
		        console.log('激励视频中途被关闭')
		        // 播放中途退出，不下发游戏奖励
				
				let resultData = new Object()
				resultData.code = 0
				resultData.msg = "播放中途退出，不下发游戏奖励"
				resultData.advData = videoData

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)
				console.log("播放中途退出，不下发游戏奖励")
		    }
		})
	}

}
module.exports = new BaiduAdv()