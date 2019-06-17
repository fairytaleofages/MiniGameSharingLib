import * as
ULSdkManager
from '../../ulsdkmanager/ulsdkdemomanager.js';
import * as ULCop from '../../net/sdkdemoULCop.js';

let mUserId = ""
class ModulesSdkDemo {

	initModule(channel) {
		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")

		mUserId = gameId + "_" + channel + "_000" 

		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)

	}

	setVersion() {

		let setVersionDelay = ULSdkManager.getConfigByKey("setVersionDelay")

		if (ULCop.IsGetCopData) {
			
			console.log("ULSDK_TEST.........setVersion...数据初始化完成==========console===========", ULCop.IsGetCopData)
			this.doSetVerSion()
		} else {
			
			console.log("ULSDK_TEST........setVersion...数据未初始化完成--------console-----延时------------", setVersionDelay, ULCop.IsGetCopData)
			let obj = this
			// setTimeout(function() {

				obj.doSetVerSion()

			// }, setVersionDelay)
		}
	}

	doSetVerSion() {
		console.log("ULSDK_TEST.........doSetVerSion...doSetVerSion--------console-----延时-----", ULCop.IsGetCopData)
		let resultObj = {};
		let isClosePay = 0
		let isUseSdkRank = true //默认false 走自己的排行榜服务器
		let dataObj = {
			userId: mUserId,
			isClosePay: isClosePay,
			isUseSdkRank: isUseSdkRank
		};
		resultObj["cmd"] = "/c/getLoginUserMessage";
		resultObj["data"] = dataObj;
		let resultJson = JSON.stringify(resultObj); //将JSON对象转化为JSON字符
		ULSdkManager.manageSdkResponse(resultJson);

		let channelInfoResult = {};
		channelInfoResult["cmd"] = "/c/channelInfoResult";
		let channelInfoDataObj = {};

		let defaultCopConfig = ULSdkManager.getConfigByKey("commonCopConfig")
		let channelCopConfig = this.getChannelConfigByKey("copDefaultConfig") // channelMessObj["copDefaultConfig"];

		channelInfoDataObj["copInfo"] = ULCop.getCopData(defaultCopConfig, channelCopConfig);
		channelInfoResult["data"] = channelInfoDataObj;

		let channelInfoJson = JSON.stringify(channelInfoResult); //将JSON对象转化为JSON字符

		ULSdkManager.manageSdkResponse(channelInfoJson);

	}

	getUserId() {

		return mUserId
	}

	openShare(dataObj) {

		let content = dataObj.content
		let imagePath = dataObj.imagePath

		let shareResult = new Object()
		shareResult.cmd = "/c/shareResult"

		let resultdataObj = new Object()
		
		if (confirm("分享模拟 确定(成功) 取消(失败)")) {

			resultdataObj.code = 1
			resultdataObj.msg = "分享成功！"
			shareResult.data = resultdataObj
			ULSdkManager.manageSdkResponse(JSON.stringify(shareResult));
			//分享成功
			console.log("ULSDK_TEST.........分享成功........console.....errCode..");

		}else{
			 resultdataObj.code = 0
			resultdataObj.msg = "分享失败！"
			shareResult.data = resultdataObj
			ULSdkManager.manageSdkResponse(JSON.stringify(shareResult));
			//分享成功
			console.log("ULSDK_TEST.........分享失败........console.....errCode..");
		}		
	}

	openPay(dataObj) {

		let gameOrientation = ULSdkManager.getConfigByKey("gameOrientation"); //1（默认，竖屏）2.横屏（home键在左边）3.横屏 （home键在右边）

		let payId = dataObj["payInfo"]["payId"];
		let payDataObj = ULSdkManager.getConfigByKey("pay_code")

		try {
			var price = payDataObj[payId]["price"]
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

		if (confirm("支付模拟 确定(成功) 取消(失败)")) {


				let resultObj = {};
				resultObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "1";
				resultDataObj["msg"] = "支付回调成功";
				resultDataObj["payData"] = dataObj;
				resultObj["data"] = resultDataObj;

				let resultObjJson = JSON.stringify(resultObj);　　　
				ULSdkManager.manageSdkResponse(resultObjJson);

		}else{
				let resultObj = {};
				resultObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "0";
				resultDataObj["msg"] = "购买失败！";
				resultDataObj["payData"] = dataObj;
				resultObj["data"] = resultDataObj;

				let resultObjJson = JSON.stringify(resultObj);　　　
				ULSdkManager.manageSdkResponse(resultObjJson);
		}
			
		
	}

	openAdv(dataObj) {

		  let resultData = new Object()
	      resultData["code"] = 1
	      resultData["msg"] = "达到看广告时长要求，可以下发奖励"
	      resultData.advData = dataObj

	      let resultObj = new Object();
	      resultObj.cmd = "/c/advShowResult"
	      resultObj.data = resultData

	      let resultJson = JSON.stringify(resultObj);
	      ULSdkManager.manageSdkResponse(resultJson)

	      console.log("ULSDK_TEST.....................达到看广告时长要求，可以下发奖励.....++++++++++++++++++++...")
	}

	

	getChannelConfigByKey(key) {

		let channelMessObj = ULSdkManager.getConfigByKey("limi")

		return channelMessObj[key]

	}


	saveRankData(dataObj) {

		/*
				dataObj 
				{
					"startTime":"1535008130846",
					"endTime":"1535008130846",
					"rankName":"幸运大奖赛",
					"score":90,
					"order":1
				}

	*/
		let resultObj = new Object()
		resultObj["cmd"] = "/c/saveRankResult"
		let rankList = new Array()
		let resultdataObj = new Object()
		if (confirm("排行榜数据上传模拟 确定(成功) 取消(失败)")) {

			resultdataObj["code"] = "0"
			resultdataObj["msg"] = "上传排行榜数据失败!"
			resultObj["data"] = resultdataObj

			let resultObjJson = JSON.stringify(resultObj);　　　
			ULSdkManager.manageSdkResponse(resultObjJson);
			console.log("ULSDK_TEST.....................上传排行榜数据失败.....++++++++++++++++++++...")
		}else{

			resultdataObj["code"] = "1"
			resultdataObj["msg"] = "上传排行榜数据成功!"
			resultObj["data"] = resultdataObj

			let resultObjJson = JSON.stringify(resultObj);　　　
			ULSdkManager.manageSdkResponse(resultObjJson);	
			console.log("ULSDK_TEST.....................上传排行榜数据成功.....++++++++++++++++++++...")
		}
	
	}

	getRankData(dataObj) {


			let resultObj = new Object()
			resultObj["cmd"] = "/c/getRankResult"
			let rankList = new Array()
			let resultdataObj = new Object()


			if (confirm("排行榜数据获取模拟 确定(成功) 取消(失败)")) {

				resultdataObj["code"] = "-1"
				resultdataObj["msg"] = "获取排行榜数据失败!"
				resultdataObj["rankList"] = []

				resultObj["data"] = resultdataObj

				let resultObjJson = JSON.stringify(resultObj);　　　

				console.log("ULSDK_TEST.....................获取排行榜数据失败.....++++++++++++++++++++...")
				ULSdkManager.manageSdkResponse(resultObjJson);

			}else{
				resultdataObj["code"] = "1"
				resultdataObj["msg"] = "获取排行榜数据成功"
				resultdataObj["rankList"] = [{
												"headUrl": "用户头像地址1",
												"nickName": "用户昵称1",
												"score": 991, 
												"selfFlag": true 
											},
											{
												"headUrl": "用户头像地址2",
												"nickName": "用户昵称2",
												"score": 993, 
												"selfFlag": false 
											}
											]

				resultObj["data"] = resultdataObj

				let resultObjJson = JSON.stringify(resultObj);　
				console.log("ULSDK_TEST.....................获取排行榜数据成功.....++++++++++++++++++++...")　
				
				ULSdkManager.manageSdkResponse(resultObjJson);
			}
	}
}
//初始化当前模块对象
module.exports = new ModulesSdkDemo();