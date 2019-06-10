import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as  SDKTools from '../../sdktools/sdktools.js';
let videoAd = null
let videoIsPlaying = false
let currentVideoDataObj = null

let bannerAd = null
let bannerTimerFlag = true
let lastBannerTimer = null
let currentBannerDataObj = null 
let lastCreateTimer = null

let bannerStatus = "open"
let bannerLoad = false
class HeadLineAdv{

	initAdv(){

	}

	openBannerAdv(adUnitId, bannerTimer, dataObj){

		console.log("openBannerAdv-------", adUnitId)


		bannerStatus = "open"
        let self = this

        if (!bannerTimerFlag && bannerAd) {

		      this.bannerRefresh()
		      console.log("ULSDK_TEST......openBannerAdv......复用banner..") 
		      return
		 }

		bannerLoad = false

		if (bannerAd) {

			bannerAd.destroy()
		}	

		  //去掉定时器的方法  
        clearTimeout(lastCreateTimer); 
        let createAd = function(){
        		console.log("openBannerAdv----222---", adUnitId)
				// bannerAd = null
				// bannerTimerFlag = false
				
				currentBannerDataObj = dataObj ;

				self.bannerAdCallBack(adUnitId)

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
        lastCreateTimer = SDKTools.setTimer(800, createAd) 

	}
	bannerAdCallBack(adUnitId){
		let phone = tt.getSystemInfoSync();
        console.log(phone);
        let w = phone.windowWidth  ;
        let h = phone.windowHeight ;
        let l = phone.windowWidth * 0.1 ;
					
		console.log("openBannerAdv----333---", adUnitId,w)
		bannerAd = tt.createBannerAd({
						adUnitId:adUnitId,
						style:{
							left:l ,
							top:h - 9 * w / 16,
							width: 360 * 0.8
						}
					})
		

		bannerAd.style.left  = (w - bannerAd.style.width) / 2
		// bannerAd.style.height = 9 * w / 16;
		bannerAd.style.top = h - 9 * bannerAd.style.width / 16
		
		console.log("openBannerAdv----bannerAd---", bannerAd)
		bannerAd.onResize(size => {
		    console.log("onResize---------------",size.width, size.height);

		});
		bannerAd.onError(res => {

			console.log("bannerAd.onError------", res)

			let resultData = new Object()
			resultData.code = 0
			resultData.msg = "banner广告展示失败!"
			resultData.advData = currentBannerDataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)
			bannerTimerFlag = true

		})
		let self = this
		bannerAd.onLoad(res => {

			bannerLoad =  true
			self.bannerRefresh()

		})

	}

	closeBanner() {
        // alert("关闭banner")
        bannerStatus = "close" 
        if (bannerAd) {

        	this.bannerRefresh()
        }
              
    }
    bannerRefresh(){

    	if (!bannerLoad) {
    		//banner 未加载完 与未创建

    		console.log("bannerRefresh bannerLoad  未加载完!")
    		return
    	}

    	if (bannerStatus == "open") {

    		console.log("bannerRefresh open  banner!")

			bannerAd.show().then(() => {
	       		console.log('广告显示成功');

		       	let resultData = new Object()
				resultData.code = 1
				resultData.msg = "广告展示成功!"
				resultData.advData = currentBannerDataObj

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)

	    	}).catch(err => {
	        	console.log('广告组件出现问题', err);
	    	})
    	}else{

			console.log("bannerRefresh 关闭banner!")
    		bannerAd.hide()
    	}

    }
	
	openVideoAdv(adUnitId, dataObj){
		console.log("openVideoAdv-------", adUnitId)

		if (videoIsPlaying) {

			let resultData = new Object()
			resultData.code = 0
			resultData.msg = "广告正在播放中!"
			resultData.advData = dataObj

			let resultObj = new Object();
			resultObj.cmd = "/c/advShowResult"
			resultObj.data = resultData

			let resultJson = JSON.stringify(resultObj);
			ULSdkManager.manageSdkResponse(resultJson)
			return
		}

		if (!videoAd) {
			// 全局只有一个videoAd实例，重复创建没有用
			
			videoAd = tt.createRewardedVideoAd({
				adUnitId: adUnitId
			})
			videoIsPlaying = true

			this.videoAdCallBack()
		}

		videoIsPlaying = true
		currentVideoDataObj = dataObj
		// 可以手动加载一次
        videoAd.load().then(()=> {

            console.log('手动加载成功');
            videoAd.show().then(() => {
		        console.log('广告显示成功');
		    })
        });

        console.log("openVideoAdv-----666--", adUnitId)
	}

	videoAdCallBack(){
			videoAd.onLoad(res =>{
				console.log('videoAd----广告加载成功');
			})
	
			videoAd.onError(err =>{
				//给与奖励
				let resultData = new Object()
				resultData.code = 0
				resultData.msg = "播放广告失败!"
				resultData.advData = currentVideoDataObj

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)

				videoIsPlaying = false
			})
	
			videoAd.onClose(res =>{

				let resultData = new Object()
				if (res.isEnded) {
					//给与奖励		
					resultData.code = 1
					resultData.msg = "正常播放结束，可以下发游戏奖励"					
				}else{

					resultData.code = 0
					resultData.msg = "广告没有播放完"
				}

				resultData.advData = currentVideoDataObj

				let resultObj = new Object();
				resultObj.cmd = "/c/advShowResult"
				resultObj.data = resultData

				let resultJson = JSON.stringify(resultObj);
				ULSdkManager.manageSdkResponse(resultJson)
				videoIsPlaying = false
			})
	}
}


module.exports = new HeadLineAdv();

