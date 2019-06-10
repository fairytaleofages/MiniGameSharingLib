import * as
ULSdkManager
from '../../ulsdkmanager/ulsdkmanager.js';
import * as sdktools from '../../sdktools/sdktools.js';
let isPlaying = false

let bannerCache = new Array()

// let bannerTimerFlag = true
// let lastBannerTimer = null

let isVideoPlayFinish = false

let bannerIsShow = false


let lastCloseBannerTimer = null

class LiMiAdv {

    initAdv() {
        console.log("...........initAdv..........")
    }

    openVideoAdv(dataObj) {

        if (isPlaying) {

            console.log("ULSDK_TEST......openVideoAdv......广告正在播放中...")
            return
        }
        console.log("ULSDK_TEST......openVideoAdv......打开视频......")

        try {
            var videoAd = BK.Advertisement.createVideoAd();

        } catch (e) {
            console.log("ULSDK_TEST......setVideoAdCallBack......videoAd....videoAd....error..")
            console.log(e)
        }

        console.log("ULSDK_TEST......setVideoAdCallBack......videoAd....videoAd......", videoAd)
        videoAd.onLoad(function() {
            console.log("ULSDK_TEST......setVideoAdCallBack......视频加载成功......")
            videoAd.show();
            //加载成功
            BK.Script.log(1, 1, "onLoad")
        });
        videoAd.onError(function(err) {
            //加载失败
            isPlaying = false
            videoAd.destory()
            BK.Script.log(1, 1, "onError code:", err);

            let resultData = new Object()
            resultData["code"] = 0
            resultData["msg"] = "视频加载失败"
            resultData.advData = dataObj

            let resultObj = new Object();
            resultObj.cmd = "/c/advShowResult"
            resultObj.data = resultData

            let resultJson = JSON.stringify(resultObj);
            ULSdkManager.manageSdkResponse(resultJson)


            console.log("ULSDK_TEST......setVideoAdCallBack......视频加载失败......", err)
        });
        videoAd.onPlayStart(function() {
            //开始播放
            isPlaying = true
            console.log("ULSDK_TEST......setVideoAdCallBack......开始播放视频......")
            BK.Script.log(1, 1, "onPlayStart")
        });

        videoAd.onPlayFinish(function() {

            console.log("ULSDK_TEST......setVideoAdCallBack......达到看广告时长要求，可以下发奖励.......")
            //达到看广告时长要求，可以下发奖励 
            isPlaying = false

            isVideoPlayFinish = true

            BK.Script.log(1, 1, "onPlayFinish")
        });
        //用户关闭广告
        videoAd.onClose(function() {
            isPlaying = false
            if (!videoAd) {
                videoAd.destory()
            }


            let resultData = new Object()
            if (isVideoPlayFinish) {

                resultData["code"] = 1
                resultData["msg"] = "达到看广告时长要求，可以下发奖励"
            } else {

                resultData["code"] = 0
                resultData["msg"] = "用户关闭广告"

            }

            isVideoPlayFinish = false

            resultData.advData = dataObj

            let resultObj = new Object();
            resultObj.cmd = "/c/advShowResult"
            resultObj.data = resultData

            let resultJson = JSON.stringify(resultObj);
            ULSdkManager.manageSdkResponse(resultJson)
            console.log("ULSDK_TEST......setVideoAdCallBack......用户关闭广告.......")
        })
    }



    openBannerAdv(bannerViewId, bannerTimer) {
        // 检查banner状态
        for (let i = 0; i < bannerCache.length; i++) {
            if (bannerCache[i].state == "open") {
                return;
            }
        }

        let self = this

        let adBannerHandle = BK.Advertisement.createBannerAd({
            viewId: bannerViewId,
        });

        let bannerObj = {
            state: "open",
            handler: adBannerHandle
        }

        bannerCache.push(bannerObj);

        adBannerHandle.onLoad(function() {
            //广告加载成功

            if (bannerObj.state == "close") {
                self.closeBannerAdvLater(bannerObj);
            } else {
                adBannerHandle.show();
                console.log("ULSDK_TEST......openBannerAdv......广告加载成功.....111..")
            }
        });


        adBannerHandle.onError(function(err) {
            //加载失败
            var msg = err.msg;
            var code = err.code;
            console.log("ULSDK_TEST......openBannerAdv....onError..加载失败.......", msg)
        });


        adBannerHandle.offError(function(err) {
            //加载失败
            var msg = err.msg;
            var code = err.code;
            console.log("ULSDK_TEST......openBannerAdv......offError....sss...", msg)
        })
    }


    clearBanner(obj) {
        for (let i = 0; i < bannerCache.length; i++) {
            if (bannerCache[i] == obj) {
                obj.handler.destory();
                clearTimeout(obj.timerId);
                bannerCache.splice(i, 1);
            }
        }
    }
    closeBannerAdvLater(bannerObj) {
        if (bannerObj.state == "close") return;
        bannerObj.state = "close";

        let self = this;
        let timerId;
        timerId = sdktools.setTimer(100, function() {
            self.clearBanner(bannerObj);
        })

        console.log("ULSDK_TEST......openBannerAdv......广告已关闭.....111..")
        bannerObj.timerId = timerId;
    }

    closeBannerAdv() {
        // alert("关闭banner")

        console.log("ULSDK_TEST......closeBannerAdv......bannerIsShow...bannerIsShow....", bannerIsShow)

        for (var i = 0; i < bannerCache.length; i++) {
            if (bannerCache[i].state == "open") {
                this.closeBannerAdvLater(bannerCache[i]);
            }
        }
    }

}

//初始化当前模块对象
module.exports = new LiMiAdv();