import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as  SDKTools from '../../sdktools/sdktools.js';


let preloadedInterstitial = null 
let preloadedBanner = null 
let preloadedRewardedVideo = null

let bannerLoad = false
let bannerStatus = "open"

class KaiXinAdv{


    initAdv(bannerId, interstitialId, videoId){
        this.reloadInterstitialAd(interstitialId)
        this.reloadRewardVideo(videoId)
    }

	openBanner(dataObj, bannerId){

        console.log("openBanner:====" + bannerId);
        bannerStatus = "open"
        bannerLoad = false
        
        dataObj = dataObj || {}
        dataObj.gravity = dataObj.gravity || {}
        let h = kaixin.systemInfo.getHeight()
        let w = kaixin.systemInfo.getWidth() 


        let left = dataObj.gravity.left || 0

        let height = 0
        if (h > 1800) {
            height = dataObj.gravity.height ||  h * 0.2 
        }else{
            height = dataObj.gravity.height ||  h * 0.18 
        }

        let top = dataObj.gravity.top || (h - height)
        let width = dataObj.gravity.width || w ;
    

        console.log("openBanner:====gravity h "+ h );
        console.log("openBanner:====gravity w "+ w );
        console.log("openBanner:====gravity height "+ height );
        console.log("openBanner:====gravity width "+ width );
        console.log("openBanner:====gravity left "+ left);
        console.log("openBanner:====gravity top "+ top );


        let obj = this 
		kaixin.getBannerAdAsync(bannerId,{
				"left":left,
				"top":top,
				"width":width,
				"height":height
		}).then(function(banner){
            preloadedBanner = banner;
            return preloadedBanner.loadAsync();
        }).then(function(){

            bannerLoad = true
            obj.refreshBannerStatus()
            obj.advResult(1, "banner加载成功", dataObj) 
           
        }).catch(function(err){
            console.log("bannerAd err:"+err);
            obj.advResult(0, "banner加载失败", dataObj) 
        })
	}

	closeBanner(bannerId, dataObj){

        console.log("closeBanner:====" + bannerId);
        bannerStatus = "close"
        this.refreshBannerStatus()
          
	}

    refreshBannerStatus(){

        if (!bannerLoad) {

            return
        }

        if (bannerStatus == "open") {
            if (preloadedBanner) {
                preloadedBanner.showAsync();
            }
            
        }else{
            try{
                if (preloadedBanner) {

                    preloadedBanner.hideBannerAsync();
                }   
            }catch(e){
                
                console.log("hideBannerAsync err:" + e);
            }
        }
    }


	openVideoAdv(dataObj, videoId){

        console.log("openVideoAdv:====" + videoId);

        if( this.isVideoAdLoaded()) {
            let obj = this
            preloadedRewardedVideo.showAsync()
                .then(function() {
                    // Perform post-ad success operation
                    console.log('preloadedRewardedVideo ad finished successfully');
                    obj.reloadRewardVideo(videoId);
                    obj.advResult(1, "视频播放成功", dataObj) 
                }).catch(function(e) {
                    console.log(e.msg);
                     obj.reloadRewardVideo(videoId);
                     obj.advResult(0, "视频播放失败", dataObj) 
                });
        } else {
             this.reloadRewardVideo(videoId);
             this.advResult(0, "视频播放失败", dataObj) 
        }

	}

	openInterstitialAd(dataObj, interstitialId){
        console.log("openInterstitialAd:====" + interstitialId);
        if ( this.isInterstitialAdLoaded()) {
            let obj = this
            preloadedInterstitial.showAsync().then(function() {
                console.log("show success!");
                obj.reloadInterstitialAd(interstitialId)
                obj.advResult(1, "插屏播放成功", dataObj) 
            }).catch(function(e) {
               console.log("show error:" + e);
               obj.reloadInterstitialAd(interstitialId)
               obj.advResult(0, "插屏播放失败", dataObj) 
            });
        }else{
             this.reloadInterstitialAd(interstitialId)
             this.advResult(0, "插屏播放失败", dataObj) 
        }
	}


    /*
    * 预加载广告，type  1:激励视频， 2：插屏广告, 3:banner
    */
    reloadRewardVideo(videoId) {

        console.log("reloadRewardVideo:" + videoId);
        kaixin.getRewardedVideoAsync(
            videoId
        ).then(function(rewarded) {
            // Load the Ad asynchronously
            preloadedRewardedVideo = rewarded;
            return preloadedRewardedVideo.loadAsync();
        }).then(function() {
            console.log('视频广告加载成功');
            console.log('Rewarded video preloaded');
        }).catch(function(err) {
  
            console.log('视频广告加载失败');
            console.log("err:" + JSON.stringify(err));         
        });
    }

    reloadInterstitialAd(interstitialId) {
        console.log("reloadInterstitialAd:" + interstitialId);
        kaixin.getInterstitialAdAsync(
            interstitialId
        ).then(function(interstitial) {
            // Load the Ad asynchronously
            preloadedInterstitial = interstitial;
            return preloadedInterstitial.loadAsync();
        }).then(function() {
            console.log('插屏广告加载成功');
            console.log('Interstitial preloaded')
        }).catch(function(err) {

            console.log('插屏广告加载失败');
            console.log('Interstitial failed to preload');
          
        });
    }

    /*
    * 查询视频广告是否加载完成
    */
    isVideoAdLoaded() {
        if (!preloadedRewardedVideo) {
            return false
        }
        return preloadedRewardedVideo.isLoaded();
    }

    isInterstitialAdLoaded() {
         if (!preloadedInterstitial) {
            return false
        }
        return preloadedInterstitial.isLoaded();
    }

    advResult(code, msg, dataObj) {
        let resultData = new Object()
        resultData["code"] = code
        resultData["msg"] = msg
        resultData.advData = dataObj

        let resultObj = new Object();
        resultObj.cmd = "/c/advShowResult"
        resultObj.data = resultData

        let resultJson = JSON.stringify(resultObj);
        ULSdkManager.manageSdkResponse(resultJson)
    }

}

//初始化当前模块对象
module.exports = new KaiXinAdv();