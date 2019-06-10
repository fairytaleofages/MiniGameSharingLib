import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as SDKTools from '../../sdktools/sdktools.js';
import * as ULCop from '../../net/ULCop.js';

let mUserId = ""
let isClosePay = 1
let recorder = null;
let recorderVideoPath = ''

let sdkCopConfig = null
let headLineAdv =  require('./ulsdkHeadLineModuleAdv.js');

class ModulesHeadLine {

	initModule() {

		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")

		isClosePay = this.getChannelConfigByKey("isClosePay")
		this.initSdkCopConfig()

		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)

		let phone = tt.getSystemInfoSync()

		console.log("phone------------------",phone)
		if (phone.platform != "android") {

			isClosePay = 1
		}


		recorder = tt.getGameRecorderManager();
		this.initRecorderCallback()

		tt.onShareAppMessage((res)=>{

				let shareResult = new Object()
				shareResult.cmd = "/c/shareResult"

				let resultdataObj = new Object()
				resultdataObj.code = 1
				resultdataObj.msg = "分享成功!"

				resultdataObj.userData =  ""
				shareResult.data = resultdataObj	

				console.log("onShareAppMessage.......",res)

				setTimeout(function() {

					ULSdkManager.manageSdkResponse(JSON.stringify(shareResult));

				}, 3000)

				let content  = this.getChannelConfigByKey("shareTitle")				
				let imagePath  = this.getChannelConfigByKey("shareImgUrl")

				return {
						
					    title: content,
					    imageUrl: imagePath,
					    query: ''
				  }
		})
	}

	initSdkCopConfig(){
		sdkCopConfig = new Object()
		sdkCopConfig["sdk_is_open_videorecord"] = "1" 
	}

	setVersion() {
		let setVersionDelay = ULSdkManager.getConfigByKey("setVersionDelay")

		if (ULCop.IsGetCopData) {

			console.log("ULSDK_TEST.........setVersion...数据初始化完成==========console=======isGetUserId====", ULCop.IsGetCopData)
			this.doSetVerSion()
		} else {

			console.log("ULSDK_TEST........setVersion...数据未初始化完成--------console-----延时------------", setVersionDelay, ULCop.IsGetCopData)
			let obj = this
			setTimeout(function() {

				obj.doSetVerSion()

			}, setVersionDelay)
		}

	}


	doSetVerSion() {

		console.log("ULSDK_TEST.......doSetVerSion...-------------延时-----", ULCop.IsGetCopData)

		let resultObj = {};

		let isOpenShare = this.getChannelConfigByKey("isOpenShare")
		let isUseSdkRank = this.getChannelConfigByKey("isUseSdkRank")
		let dataObj = {
			userId: mUserId,
			isClosePay: isClosePay,
			isOpenShare: isOpenShare,
			isUseSdkRank: isUseSdkRank,
			jumpGamesCount: 0
		};
		resultObj["cmd"] = "/c/getLoginUserMessage";
		resultObj["data"] = dataObj;
		let resultJson = JSON.stringify(resultObj); //将JSON对象转化为JSON字符
		ULSdkManager.manageSdkResponse(resultJson);
		console.log("setVersion:", resultObj);

		let channelInfoResult = {};
		channelInfoResult["cmd"] = "/c/channelInfoResult";
		let channelInfoDataObj = {};

		let defaultCopConfig = ULSdkManager.getConfigByKey("commonCopConfig")
		let channelMessObj = ULSdkManager.getConfigByKey("oppo")
		let channelCopConfig = this.getChannelConfigByKey("copDefaultConfig")

		channelInfoDataObj["copInfo"] = ULCop.getCopData(defaultCopConfig, channelCopConfig, sdkCopConfig);
		channelInfoResult["data"] = channelInfoDataObj;

		let channelInfoJson = JSON.stringify(channelInfoResult); //将JSON对象转化为JSON字符

		ULSdkManager.manageSdkResponse(channelInfoJson);
	}


	getUserId() {
		return mUserId
	}

	userLogin(dataObj) {

	}

	userIsLogin(dataObj) {

	}

	openShare(dataObj) {

		let content = dataObj.content
		if (!content) {
			content = this.getChannelConfigByKey("shareTitle")
		}
		let imagePath = dataObj.imagePath
		if (!imagePath) {
			imagePath = this.getChannelConfigByKey("shareImgUrl")
		}
		
		tt.shareAppMessage({
			title:content,
			imageUrl:imagePath,
			query:"",
			fail(e) {
				console.log(`openShare.......分享失败!`);
				let shareResult = new Object()
				shareResult.cmd = "/c/shareResult"

				let resultdataObj = new Object()
				resultdataObj.code = 0
				resultdataObj.msg = "分享失敗!"
				resultdataObj.userData = dataObj.userData

				shareResult.data = resultdataObj

				ULSdkManager.manageSdkResponse(JSON.stringify(shareResult))
			},
			success(){
				console.log("openShare......分享成功!")
				let shareResult = new Object()
				shareResult.cmd = "/c/shareResult"

				let resultdataObj = new Object()
				resultdataObj.code = 1
				resultdataObj.msg = "分享成功!"
				resultdataObj.userData = dataObj.userData

				shareResult.data = resultdataObj

				ULSdkManager.manageSdkResponse(JSON.stringify(shareResult))
			}
		})
	}

	openPay(dataObj) {

		let self = this 
		tt.checkSession({
		    success (res) {
		        console.log(`session未过期`);
		        self.doOpenPay(dataObj)
		    },
		    fail (res) {
		        console.log(`session已过期，需要重新登录`);
		        tt.login({
				    success (res) {
				        console.log(`login调用成功${res.code} ${res.anonymousCode}`);
				        self.doOpenPay(dataObj)
				    },
				    fail (res) {
				        console.log(`login调用失败`);
				    }
				});
		    }
		});	
	}

	doOpenPay(dataObj){
		let payId = dataObj["payInfo"]["payId"];
		let payDataObj = ULSdkManager.getConfigByKey("pay_code")

		try {
			var moneyStr = payDataObj[payId]["price"];
		} catch (e) {
			let resultErrObj = {};
			resultErrObj["cmd"] = "/c/payResult";
			let resultDataObj = {};
			resultDataObj["code"] = "0";
			resultDataObj["msg"] = "payId 不存在";
			resultDataObj["payData"] = dataObj;
			resultErrObj["data"] = resultDataObj;

			let resultErrObjJson = JSON.stringify(resultErrObj);　　　
			ULSdkManager.manageSdkResponse(resultErrObjJson);
			return
		}

		let offerId = this.getChannelConfigByKey("offerId") //channelMessObj["offerId"]
		let env = this.getChannelConfigByKey("env") // channelMessObj["env"]

		let money = parseInt(moneyStr)


		tt.requestGamePayment({
			mode:"game",
			env:0,
			currencyType:"CNY",
			platform:"android",
			buyQuantity:money * 10,
			zoneId:1,
			success(res){
				console.log("支付成功",res)
				let resultObj = {};
				resultObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "1";
				resultDataObj["msg"] = "支付成功" 
				resultDataObj["payData"] = dataObj;
				resultObj["data"] = resultDataObj;

				let resultObjJson = JSON.stringify(resultObj);　　　
				ULSdkManager.manageSdkResponse(resultObjJson);
			},
			fail(e){

				console.log("支付失败", e)
				let resultObj = {};
				resultObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "0";
				resultDataObj["msg"] = "支付失败" 
				resultDataObj["payData"] = dataObj;
				resultObj["data"] = resultDataObj;

				let resultObjJson = JSON.stringify(resultObj);　　　
				ULSdkManager.manageSdkResponse(resultObjJson);
			}
		})
	}

	openAdv(dataObj) {

		console.log("ULSDK_TEST.......openAdv...-------------mUserId-----", mUserId)
		switch (dataObj.type) {

			case "banner":
				
				let bannerId = this.getChannelConfigByKey("banner_adunit")			
				let bannerTimer =  this.getChannelConfigByKey("bannerTimer")
							
				headLineAdv.openBannerAdv(bannerId, bannerTimer, dataObj)
				break;
			case "video":
				
				let videoId = this.getChannelConfigByKey("video_adunit")				
				headLineAdv.openVideoAdv(videoId, dataObj)
				break;
			case "interstitial":


				break;
			case "native":


				break;
		}

	}

	closeAdv(dataObj) {

		switch (dataObj.type) {

			case "banner":
				headLineAdv.closeBanner()

				break;
			case "video":


				break;
			case "interstitial":


				break;
			case "native":


				break;
		}

	}

	getChannelConfigByKey(key) {
		let channelMessObj = ULSdkManager.getConfigByKey("headline")

		return channelMessObj[key]

	}
	saveRankData(dataObj) {

	}

	getRankData(dataObj) {

	}


	initRecorderCallback() {
		recorder.onStart((res) => {
			// 录屏开始
			console.log("录屏开始", res);
			// do somethine;
			let resultDataObj = new Object()
			resultDataObj.code = 1
			resultDataObj.msg = "开始小視頻录制成功!"

			let resultObj = new Object()
			resultObj.cmd = "/c/recorderVideoResult"
			resultObj.data = resultDataObj

			ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
		})
		recorder.onPause(() => {
			// 录屏已暂停;
			console.log("录屏已暂停")
			let resultDataObj = new Object()
			resultDataObj.code = 2
			resultDataObj.msg = "暂停小視頻录制成功!"

			let resultObj = new Object()
			resultObj.cmd = "/c/recorderVideoResult"
			resultObj.data = resultDataObj

			ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
		})

		recorder.onResume(() => {
			// 录屏已恢复;
			console.log("录屏已恢复")
			let resultDataObj = new Object()
			resultDataObj.code = 3
			resultDataObj.msg = "恢复小視頻录制成功!"

			let resultObj = new Object()
			resultObj.cmd = "/c/recorderVideoResult"
			resultObj.data = resultDataObj

			ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
		})

		recorder.onStop((res) => {
			// 录屏结束;
			console.log(res.videoPath);
			recorderVideoPath = res.videoPath

			let resultDataObj = new Object()
			resultDataObj.code = 4
			resultDataObj.msg = "停止小視頻录制成功!"

			let resultObj = new Object()
			resultObj.cmd = "/c/recorderVideoResult"
			resultObj.data = resultDataObj

			ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))

		})

		recorder.onError((errMsg) => {
			// 录屏已暂停;
			console.log("录屏已暂停..errMsg....", errMsg)
			let resultDataObj = new Object()
			resultDataObj.code = 0
			resultDataObj.msg = "录制视频出错!"

			let resultObj = new Object()
			resultObj.cmd = "/c/recorderVideoResult"
			resultObj.data = resultDataObj

			ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
		})
	}

	//小视频录制功能  recorder
	/*
		{
			"cmd":"/c/recorderGameVideo",
			"data":{
					"action":"start",
					"durationTime":120
			}
		}


		{
			"cmd":"/c/recorderVideoResult",
			"data":{
				"code":1,
				"action":"start"
				"msg":"分享小視頻成功!"
			}
		}
	*/
	recorderGameVideo(dataObj) {


		switch (dataObj.action) {
			case "start":
				console.log(`recorderGameVideo..start....`);
				let durationTime = parseInt(dataObj.durationTime)
				if (durationTime < 10 ) {

					durationTime = 10
				}

				if (durationTime > 120 ) {

					durationTime = 120
				}
				recorder.start({
					duration: durationTime
				})
				break;
			case "pause":
				console.log(`recorderGameVideo..pause....`);
				recorder.pause()
				break;
			case "resume":
				console.log(`recorderGameVideo..resume....`);
				recorder.resume()
				break;
			case "stop":
				console.log(`recorderGameVideo..stop....`);
				recorder.stop();
				break;
		}

	}

	/*

	{
		"cmd":"/c/shareGameVideo",
		"data":""
	}

	{
		"cmd":"/c/shareVideoResult",
		"data":{
			"code":1,
			"msg":"分享小視頻成功!"
		}
	}


	*/
	//小视频分享功能
	shareGameVideo(dataObj) {

		console.log(`shareGameVideo......`);
		tt.shareAppMessage({
			channel:"video",
			title:"",
			imageUrl:"",
			query:"",
			extra:{
				videoPath:`${recorderVideoPath}`
			},
			fail(e) {
				console.log(`shareGameVideo.......分享小視頻失敗!`);

				let resultDataObj = new Object()

				resultDataObj.code = 0
				resultDataObj.msg = "分享小視頻失敗!"

				let resultObj = new Object()
				resultObj.cmd = "/c/shareVideoResult"
				resultObj.data = resultDataObj

				ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
			},
			success(){
				console.log("shareGameVideo......分享小視頻成功.......")
				let resultDataObj = new Object()

				resultDataObj.code = 1
				resultDataObj.msg = "分享小視頻成功!"

				let resultObj = new Object()
				resultObj.cmd = "/c/shareVideoResult"
				resultObj.data = resultDataObj

				ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
			}
		})
	}

	shareVideoResult(code, msg){
		let resultDataObj = new Object()

		resultDataObj.code = code
		resultDataObj.msg = msg

		let resultObj = new Object()
		resultObj.cmd = "/c/shareVideoResult"
		resultObj.data = resultDataObj

		ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
	}


}

//初始化当前模块对象
module.exports = new ModulesHeadLine();