import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as sdktools from '../../sdktools/sdktools.js';

let bannerAd = null
let videoAd = null
let isPlaying = false
let currentDataObj = null 

let bannerTimerFlag = true
let lastBannerTimer = null

class WeiXinAdv {

	initAdv(video_adunit) {
		videoAd = wx.createRewardedVideoAd({
			adUnitId: video_adunit
		})
		//初始化回调函数
		this.videoClose()
		console.log("初始化广告！")
	}

	openBannerAdv(banner_adunit,bannerTimer,dataObj) {

		if (!bannerTimerFlag && bannerAd) {

		      bannerAd.show();
		      console.log("ULSDK_TEST......openBannerAdv......复用banner..") 
		      return
		 }

		if (bannerAd != null) {

			bannerAd.destroy()
			bannerAd = null
		}		
		let phone = wx.getSystemInfoSync();
        console.log(phone);
        let w = phone.screenWidth * 0.8 ;
        let l = phone.screenWidth * 0.1 ;
		let h = phone.screenHeight;
		console.log("...bannerAdv.........", bannerAd, w, h)

		bannerAd = wx.createBannerAd({
			adUnitId: banner_adunit,
			style: {
				left: l,
				top: 0,
				width: w
			}
		})

		bannerAd.onResize(res => {
		
			console.log(bannerAd.style.realWidth, bannerAd.style.realHeight)
			// bannerAd.style.left = w - bannerAd.style.realWidth+0.1;
            bannerAd.style.top = h - bannerAd.style.realHeight+0.1;

		})

		bannerAd.onError(err => {

		
			let resultData = new Object()
			resultData["code"] = 0
			resultData["msg"] = "banner广告加载失败"
			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)
			bannerTimerFlag = true

			// let adv = document.getElementById(bannerContainerId);
			// adv.style.display = '';
			console.log("ULSDK_TEST......banner广告加载失败!", err)

		})
		bannerAd.show()

		bannerTimerFlag = false
        //去掉定时器的方法  
        clearTimeout(lastBannerTimer); 
        let timeCallBack = function(){
          //alert("interstitialFlag 状态改变")
          bannerTimerFlag = true

          console.log('ULSDK_TEST......bannerTimerFlag 状态改变');
        }
        lastBannerTimer = sdktools.setTimer(bannerTimer, timeCallBack) 
	}
	closeBannerAdv() {

		// bannerAd.destroy()
		if (bannerAd) {

			bannerAd.hide()
		}
	}

	openVideoAdv(video_adunit, dataObj) {

		if (videoAd == null) {
			videoAd = wx.createRewardedVideoAd({
				adUnitId: video_adunit
			})
			//初始化回调函数
			this.videoClose()
		}
		if (isPlaying) {
			
			console.log("广告正在播放中")
			return
		}
		currentDataObj = dataObj
		this.videoLoad(dataObj)

		videoAd.onError(err => {
		  console.log(err)
		})
	}

	videoLoad(dataObj) {

		isPlaying = true
		videoAd.load().then(
			() => videoAd.show().then(() => {
				console.log("广告展示成功....1")
			})
		).catch(
			err => videoAd.load().then(
				() => videoAd.show().then(() => {
					console.log("广告展示成功....2")
				})
			).catch(err => {
				console.log("videoLoad.....err....",err)
				let resultData = new Object()
				resultData.code = 0
				resultData.msg = "广告播放失败"+ err.errMsg
				resultData.advData = dataObj

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)
				isPlaying = false
				console.log("广告播放失败")
			})
		)
	}

	videoClose() {

		videoAd.onClose(res => {
			// 用户点击了【关闭广告】按钮
			// 小于 2.1.0 的基础库版本，res 是一个 undefined
			if (res && res.isEnded || res === undefined) {
				// 正常播放结束，可以下发游戏奖励
				console.log("正常播放结束，可以下发游戏奖励")

				isPlaying = false
				let resultData = new Object()
				resultData.code = 1
				resultData.msg = "正常播放结束，可以下发游戏奖励"
				resultData.advData = currentDataObj

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)
			} else {
				// 播放中途退出，不下发游戏奖励
				isPlaying = false
				let resultData = new Object()
				resultData.code = 0
				resultData.msg = "播放中途退出，不下发游戏奖励"
				resultData.advData = currentDataObj

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

module.exports = new WeiXinAdv()