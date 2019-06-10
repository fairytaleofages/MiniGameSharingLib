import * as ULSdkManager from '../../ulsdkmanager/ulsdkmanager.js';
import * as ULCop from '../../net/ULCop.js';
import * as ULRsaSign from '../../sdktools/ULRsaSign.js';
import * as SDKTools from '../../sdktools/sdktools.js';


let mUserId = ""

let recorder = null;
let recorderVideoPath = ''

let recommendationButton = null
let recommendationStatus = "open" 
let recommendationLoad = false

let isOpenRecommendation = false 
let isGetSystemInfo = false

let sdkCopConfig = null
let isClosePay = 0

let BaiduAdv = require('./ulsdkBaiduModuleAdv.js')
class ModulesBaidu{
	initModule(){

		// swan.setEnableDebug({
		//     enableDebug: true
		// })
		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")

		this.initSdkCopConfig()

		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)

		let videoId = this.getChannelConfigByKey("videoId")
		let appSid = this.getChannelConfigByKey("appSid")
		BaiduAdv.initAdv(videoId, appSid)
		let obj = this

		isClosePay = this.getChannelConfigByKey("isClosePay")

		let phone = swan.getSystemInfoSync();

		console.log("initModule----phone-", phone)
		
		let baiduSDKVersion = phone.SDKVersion

		let arr = baiduSDKVersion.split('.')
		let num1 = parseInt(arr[0])	
		let num2 = parseInt(arr[1])	
		let num3 = parseInt(arr[2])	
		// 版本小于1.5.2  交叉推荐
		if ( (num1 == 1 &&  num2 < 5 )  ||( num1 == 1 &&  num2  == 5 &&  num3  < 2 )) {
			isOpenRecommendation = false 
		}else{
			isOpenRecommendation = true
		}	
		//版本小于 1.4.1 录屏
		if ( (num1 == 1 &&  num2  < 4 ) || (num1 == 1 &&  num2  == 4 && num3  < 1) ) {

			sdkCopConfig["sdk_is_open_videorecord"] = "0" 
		}else{
			sdkCopConfig["sdk_is_open_videorecord"] = "1"
			recorder = swan.getVideoRecorderManager()
			obj.initRecorderCallback()
		}

		// // 小于 1.8.5 支付	
		// if ( (num1 == 1 &&  num2  < 8 ) || (num1 == 1 &&  num2  == 8 && num3  < 5) ) {

		// 	isClosePay = 1 //关闭支付
		// }
		
		if (!swan.requestPolymerPayment) {
			
			isClosePay = 1 //关闭支付
		}
		isGetSystemInfo = true       

		if (phone.platform != 'android') {
			isClosePay = 1 //关闭支付
		} 

	}

	initSdkCopConfig(){
		sdkCopConfig = new Object()
		sdkCopConfig["sdk_is_open_videorecord"] = "0" 
	}

	setVersion(){

		let setVersionDelay = ULSdkManager.getConfigByKey("setVersionDelay")

		if (ULCop.IsGetCopData && isGetSystemInfo) {
			console.log("setVersion...数据初始化完成=====================", ULCop.IsGetCopData)
			this.doSetVersion()
		} else {
			console.log("setVersion...数据未初始化完成-------------延时------------", setVersionDelay, ULCop.IsGetCopData)
			let obj = this
			setTimeout(function() {

				obj.doSetVersion()

			}, setVersionDelay)
		}

	}

	doSetVersion(){

		let resultObj = {};

		let isOpenShare = this.getChannelConfigByKey("isOpenShare")
		let isUseSdkRank = this.getChannelConfigByKey("isUseSdkRank")

		let dataObj = {
			userId: mUserId,
			isClosePay: isClosePay,
			isOpenShare: isOpenShare,
			isUseSdkRank: isUseSdkRank,
			jumpGamesCount:0
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
		
		let channelCopConfig = this.getChannelConfigByKey("copDefaultConfig") 

		channelInfoDataObj["copInfo"] = ULCop.getCopData(defaultCopConfig, channelCopConfig, sdkCopConfig);
		channelInfoResult["data"] = channelInfoDataObj;

		let channelInfoJson = JSON.stringify(channelInfoResult); //将JSON对象转化为JSON字符

		ULSdkManager.manageSdkResponse(channelInfoJson);

	}

	getUserId(){

		return mUserId
	}

	openShare(dataObj){

	}

	openPay(dataObj){

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

		// console.log("ULRsaSign-----------------",ULRsaSign)
		let rsa = new ULRsaSign.RSAKey();
		let privateKey = "-----BEGIN RSA PRIVATE KEY-----MIICXgIBAAKBgQC46Giy1S4Zuys/c3QO6VZVWAOo1tussbIpqI0M7edU9OC732leFej2DmG3O9XRh9NlYjoAq4hyt7DxiZ6MyN8IdStZn4b0/e/CZKQA5WaCI5h71hUTwCJTzHZHvO+woDWaE2mOSsBfjAdwTsHUr32eCPzju/1zatys02W7ai4v+wIDAQABAoGAGjbAmRHF3ln9kJpCitajqae3pRkIvZvXgTZnAL09fXrV3WyX2IHMrA1v5vUxo+nYm1foly26Q2EtUaDL/HOBwshbwEtR5TR0g+kZBpA+S4wt/ujZPlALmZiGuQjjqwWFo9OfeskXer7vA5UWYemDMvy7XQ2TWoLNOzI+LaVvEPECQQDpEgY7XmrKeq8qkUFPsDjcEa7SZ2eEEOps0NKmewGvAaiavm7+8yCdS/ZPS7ZD6590TanFWy3gJtugw/vPa2tpAkEAyxlj8u+EYKchPBYehuRjm4W5SlJNAGrABqrJjM50jQ4aRVr1LbS6R0S77kTaZLTV/w8eYk1LS9cTCaY+JB+HwwJBAIXrlmscmG4ZynbCGe4JCtLg0jwRsHhBJAI8hx2jxlbhtBieXbbeypm3YSM1FNi4FdpFGczN1HFcwowAsLsBNSkCQQC9YgywQKYI1m+ILvwCPr+fCt/PrNS+mcw7q0/Lq8xEp6zZlUpgd1DoGfC/6pZXJ8UQVFG5ymd27bOD4O+7EWevAkEAzYHfclV/kP3V1aCR0KoXBHA4WIHKa+JaVuFMIDZqd/SsfsoKDn+Stsajl/e8LAwt9XXctYWNvGsVfCSfZ5Y3tw==-----END RSA PRIVATE KEY-----"
			
		rsa.readPrivateKeyFromPEMString(privateKey);
		let hashAlg = "sha1";

		/*
			appKey=MMMu4R&dealId=1560693851&totalAmount=100&tpOrderId=3028123sfadsf21903626
		*/
		let dealId = this.getChannelConfigByKey("dealId")
		let appKey = this.getChannelConfigByKey("appKey")
		let dealTitle = payDataObj[payId]["proName"] || "未知商品";
		let totalAmount = moneyStr + "00"
		let tpOrderId = SDKTools.getMark()

		let signStr = "appKey=" + appKey + "&dealId=" + dealId + "&totalAmount=" + totalAmount + "&tpOrderId=" + tpOrderId
		let hSig = rsa.sign(signStr, hashAlg);
		let rsaSign = ULRsaSign.hex2b64(hSig)

		console.log("rsaSign-------", rsaSign)

		swan.requestPolymerPayment({
            orderInfo: {
                dealId: dealId, // "470193086"
                appKey: appKey, // "MMMabc"
                totalAmount: totalAmount, // "800"
                tpOrderId: tpOrderId, // "3028123sfadsf21903626"
                dealTitle: dealTitle, // "支付8元测试"
                rsaSign: rsaSign, // "A+MJYVd5SAgZ4ouhxNavvBxY5XVCNrWSi6knlGVY/dIn0z3zd9b37/BDFa6WT....."
                signFieldsRange: 1
            },
            bannedChannels: ['WeChat'],
            success: res => {
                console.log("requestPolymerPayment----支付成功-")

                let resultErrObj = {};
				resultErrObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "1";
				resultDataObj["msg"] = "支付成功";
				resultDataObj["payData"] = dataObj;
				resultErrObj["data"] = resultDataObj;

				let resultErrObjJson = JSON.stringify(resultErrObj);　　　
				ULSdkManager.manageSdkResponse(resultErrObjJson);
            },
            fail: res => {

                console.log("requestPolymerPayment----支付失败-",res)
                let resultErrObj = {};
				resultErrObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "0";
				resultDataObj["msg"] = "支付失败!";
				resultDataObj["payData"] = dataObj;
				resultErrObj["data"] = resultDataObj;

				let resultErrObjJson = JSON.stringify(resultErrObj);　　　
				ULSdkManager.manageSdkResponse(resultErrObjJson);
            }
        });
	}


	saveRankData(dataObj) {

	}

	getRankData(dataObj) {

	}

	getChannelConfigByKey(key){

		let channelMessObj = ULSdkManager.getConfigByKey("baidu")

		return channelMessObj[key]

	}

	openAdv(dataObj){
		console.log("ULSDK_TEST........openAdv....openAdv.....", dataObj)
		let type = dataObj.type
		let appSid = this.getChannelConfigByKey("appSid")
		switch(type){
			case "banner":

				let bannerId = this.getChannelConfigByKey("bannerId")
				let bannerTimer = this.getChannelConfigByKey("bannerTimer")
				
				BaiduAdv.openBannerAdv(bannerId, appSid, dataObj, bannerTimer)
				break;
			case "video":
				
				let videoId = this.getChannelConfigByKey("videoId")
				BaiduAdv.openVideoAdv(videoId, appSid, dataObj)
				break;
		}

	}
	closeAdv(dataObj){
		let type = dataObj.type

		switch(type){
			case "banner":
					BaiduAdv.closeBannerAdv(dataObj)
				break;
			case "video":

				break;
		}

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
				
				let isRecordVoice = false
				if (dataObj.hasOwnProperty("isRecordVoice")) {

					isRecordVoice = dataObj.isRecordVoice
				}
							
				recorder.start({
					duration: durationTime,
					microphoneEnabled: isRecordVoice
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
		swan.shareVideo({
			videoPath: recorderVideoPath,
			success() {
				console.log(`分享成功！`);

				let resultDataObj = new Object()

				resultDataObj.code = 1
				resultDataObj.msg = "分享小視頻成功!"

				let resultObj = new Object()
				resultObj.cmd = "/c/shareVideoResult"
				resultObj.data = resultDataObj

				ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
			},
			fail(res) {
				console.log(`分享失败！`,res);

				let resultDataObj = new Object()

				resultDataObj.code = 0
				resultDataObj.msg = "分享小視頻失敗!"

				let resultObj = new Object()
				resultObj.cmd = "/c/shareVideoResult"
				resultObj.data = resultDataObj

				ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
			}
		});
	}

	/*

		交叉推荐
		carousel 轮播
		list  聚合
 	*/

 	openRecommendation(dataObj){

 		console.log("manageSdk   =====openRecommendation")
 		if (!isOpenRecommendation) {	

 		 	let resultDataObj = new Object()
 			let resultObj = new Object()	

 			resultDataObj.code = 0
			resultDataObj.msg = "交叉推荐不支持!"
			resultObj.cmd = "/c/openRecommendationResult"

			resultObj.data = resultDataObj
			ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
 			return
 		}

 		recommendationStatus = "open"
 		recommendationLoad = false

 		let type = dataObj.type
 		let style = dataObj.style

 		if (!recommendationButton) {

 			console.log("创建 交叉推荐")
	 	 	recommendationButton = swan.createRecommendationButton({
				    type: type,
				    style: style
				});
 		}

 		// 监听错误信息
		recommendationButton.onError((e)=>{
			console.error(e);
		})

		// 监听按钮资源加载完成
		recommendationButton.onLoad(() => {

			recommendationLoad = true
			console.log("load 交叉推荐")
			this.refreshRecommendation()
		   
		})

		// 触发资源加载
		recommendationButton.load();

 	}

 	closeRecommendation(dataObj){

 		console.log("manageSdk   =====closeRecommendation")
 		if (!isOpenRecommendation) {	

 		 	let resultDataObj = new Object()
 			let resultObj = new Object()	

 			resultDataObj.code = 0
			resultDataObj.msg = "交叉推荐不支持!"
			resultObj.cmd = "/c/closeRecommendationResult"

			resultObj.data = resultDataObj
			ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
 			return
 		}

 		recommendationStatus = "close"
 		if (recommendationButton) {
 			this.refreshRecommendation()
	 	}

 	}

 	refreshRecommendation(){

 		if (!recommendationLoad) {

 			return
 		}

 		let resultDataObj = new Object()
 		let resultObj = new Object()
 		if (recommendationStatus == "open") {

 			 // 显示按钮
		    recommendationButton.show();

		    // 取消监听加载事件
		    recommendationButton.offLoad(()=>{

		    })

		    resultDataObj.code = 1
			resultDataObj.msg = "打开交叉推荐成功!"
			resultObj.cmd = "/c/openRecommendationResult"

 		}else{
 			console.log("销毁 交叉推荐")
	        // 隐藏按钮
	        recommendationButton.hide();
	        // 销毁按钮
	        recommendationButton.destroy();
	        recommendationButton = null

	        resultDataObj.code = 1
			resultDataObj.msg = "关闭交叉推荐成功!"
			resultObj.cmd = "/c/closeRecommendationResult"
 		}

		resultObj.data = resultDataObj

		ULSdkManager.manageSdkResponse(JSON.stringify(resultObj))
 	}



}

module.exports = new ModulesBaidu();