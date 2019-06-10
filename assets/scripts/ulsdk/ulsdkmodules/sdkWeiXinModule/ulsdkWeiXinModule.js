import * as
ULSdkManager
from '../../ulsdkmanager/ulsdkmanager.js';
import * as SDKTools from '../../sdktools/sdktools.js';
import * as ULCop from '../../net/ULCop.js';
// import * as HttpRequest from '../../net/httprequest.js';

// import {WeiXinAdv}  from './ulsdkWeiXinAdv.js';
var WeiXinAdv = require('./ulsdkWeiXinAdv.js');

var payResultInfoArray = new Array();
var isSetVersionGone = false; //setVersion方法是否已经调用标识符（用于解决由于网络原因导致的setVersion调用时还未获取到未处理支付订单信息的情况）

// console.log('....weix...+++++++++++.', ULSdkManager, ULCop, SDKTools, HttpRequest)
var mUserId = ""
var openId = ""
// var userIP = ""

var isGetOpenId = false
var isClosePay = 1 // 默认打开支付

let SDKVersion = ""
let sdkCopConfig = null
class ModulesWeiXin {

	initModule() {

		console.log("InitModule.....weixin")
		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")

		this.initSdkCopConfig()

		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)

		let video_adunit = this.getChannelConfigByKey("video_adunit")
		WeiXinAdv.initAdv(video_adunit)

		let netTimeout = ULSdkManager.getConfigByKey("netTimeout")
		let channelMessObj = ULSdkManager.getConfigByKey("weixin")

		isClosePay = this.getChannelConfigByKey("isClosePay")

		let obj = this

		//当用户从公众号进入游戏时 游戏发奖
		wx.onShow((res)=>{
			console.log("wx.onShow-----------",res)

			if (res.scene == 1035) {

				obj.extraBonusResult(0)						
			}
		})

		//分享菜单
		wx.showShareMenu()
		let content = this.getChannelConfigByKey("shareTitle")
		let imagePath = this.getChannelConfigByKey("shareImgUrl")
		wx.onShareAppMessage(function() {
			return {
				title: content,
				imageUrl: imagePath
			}
		})

		
		console.log("我是主线程--------------------======================")
		wx.getSystemInfo({
			success: function(res) {
				console.log(res);
				let str = res.system[0] + res.system[1] + res.system[2];

				SDKVersion = res.SDKVersion
				if (str == "And") {
					isClosePay = 0
				}
				if (str == "iOS") {

					isClosePay = 1
				}
			},
			fail: function() {

			}
		});

		wx.login({
			success: function(res) {

				// wx.getUserInfo()

				var appId = channelMessObj["appid"]; //微信公众号平台申请的appid
				var userLoginUrl = channelMessObj["loginUrl"];

				var js_code = res.code; //调用登录接口获得的用户的登录凭证code
				userLoginUrl = userLoginUrl + "?gameId=" + gameId + "&js_code=" + js_code

				var ajax = ''
				if (window.XMLHttpRequest) {
					// code for IE7+, Firefox, Chrome, Opera, Safari 
					ajax = new XMLHttpRequest();
				} else { // code for IE6, IE5 
					ajax = new ActiveXObject("Microsoft.XMLHTTP");
				}

				var timeout = false;
				var timer = setTimeout(function() {
					timeout = true;
					ajax.abort();
				}, netTimeout);
				//步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
				ajax.open('get', userLoginUrl);
				//步骤三:发送请求
				ajax.send();
				//步骤四:注册事件 onreadystatechange 状态改变就会调用
				ajax.onreadystatechange = function() {
					if (ajax.readyState == 4 && ajax.status == 200) {
						//步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
						　　
						var result = ajax.responseText

						console.log("result..>>>>>>>>..", result)　　
						let resultObj = JSON.parse(result);
						if (resultObj.code == '1') {　
							openId = resultObj.mess
							// userIP = resultObj.ip
							mUserId = gameId + "_weixin_" + openId
							isGetOpenId = true

							//向开放数据 发送当前用户 的id
							let openDataResultObj = {};
							let dataObj = {
								openId: openId,
							};
							openDataResultObj["cmd"] = "/c/userMessage";
							openDataResultObj["data"] = dataObj;
							let resultJson = JSON.stringify(openDataResultObj); //将JSON对象转化为JSON字	

							try {
								obj.openDataManage(resultJson)
							} catch (e) {
								console.log("当前项目未配置开放域..子项目..")　
							}


						}
						console.log("result....", mUserId)　　
					}
				}
			}
		});

	}

	initSdkCopConfig(){
		sdkCopConfig = new Object()
		sdkCopConfig["sdk_is_open_videorecord"] = "0" 
	}

	setVersion() {

		let setVersionDelay = ULSdkManager.getConfigByKey("setVersionDelay")

		if (isGetOpenId && ULCop.IsGetCopData) {
			console.log("setVersion...数据初始化完成=====================", isGetOpenId, ULCop.IsGetCopData)
			this.doSetVerSion()
		} else {
			console.log("setVersion...数据未初始化完成-------------延时------------", setVersionDelay, isGetOpenId, ULCop.IsGetCopData)
			let obj = this
			setTimeout(function() {

				obj.doSetVerSion()

			}, setVersionDelay)
		}
	}

	doSetVerSion() {

		console.log("doSetVerSion...doSetVerSion-------------延时-----", isGetOpenId, ULCop.IsGetCopData)
		let resultObj = {};

		let isOpenShare = this.getChannelConfigByKey("isOpenShare")
		let isUseSdkRank = this.getChannelConfigByKey("isUseSdkRank")
		let jumpGames =  this.getChannelConfigByKey("jumpGames")

		let dataObj = {
			userId: mUserId,
			isClosePay: isClosePay,
			isOpenShare: isOpenShare,
			isUseSdkRank: isUseSdkRank,
			jumpGamesCount:jumpGames.length
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
		let channelMessObj = ULSdkManager.getConfigByKey("weixin")
		let channelCopConfig = this.getChannelConfigByKey("copDefaultConfig") // channelMessObj["copDefaultConfig"];

		// SDKTools.Sleep(2000)
		channelInfoDataObj["copInfo"] = ULCop.getCopData(defaultCopConfig, channelCopConfig, sdkCopConfig);
		channelInfoResult["data"] = channelInfoDataObj;

		let channelInfoJson = JSON.stringify(channelInfoResult); //将JSON对象转化为JSON字符

		ULSdkManager.manageSdkResponse(channelInfoJson);

		let initVal = wx.getLaunchOptionsSync()
		console.log("initVal-----------",initVal)
		if (initVal.scene == 1035) {

			this.extraBonusResult(1)						
		}

	}

	extraBonusResult(isInitGame){

		let resultObj = {};
		resultObj["cmd"] = "/c/extraBonus";
		let resultDataObj = {};
		resultDataObj["code"] = "1";
		resultDataObj["msg"] = "玩家从微信公众号进入游戏";
		resultDataObj["isInitGame"] = isInitGame
		resultObj["data"] = resultDataObj;

		let resultObjJson = JSON.stringify(resultObj);　　　
		ULSdkManager.manageSdkResponse(resultObjJson);

	}

	getUserId() {

		return mUserId
	}

	userLogin(dataObj) {

	}

	userIsLogin(dataObj) {

	}
	openShare(dataObj) {

		console.log("Modulesweixin  use openShare is OK!....1...");
		let content = dataObj.content
		if (!content) {
			content = this.getChannelConfigByKey("shareTitle")
		}
		let imagePath = dataObj.imagePath
		if (!imagePath) {
			imagePath = this.getChannelConfigByKey("shareImgUrl")
		}

		wx.shareAppMessage({
			title: content,
			imageUrl: imagePath
		})
		console.log("Modulesweixin  use openShare is OK!.....2....");

		let shareResult = new Object()
		shareResult.cmd = "/c/shareResult"

		let resultdataObj = new Object()
		resultdataObj.code = 1
		resultdataObj.msg = "分享成功！"

		resultdataObj.userData = dataObj.userData

		shareResult.data = resultdataObj
		ULSdkManager.manageSdkResponse(JSON.stringify(shareResult));

	}
	openPay(dataObj) {

		var payId = dataObj["payInfo"]["payId"];
		let payDataObj = ULSdkManager.getConfigByKey("pay_code")

		// let channelMessObj = ULSdkManager.getConfigByKey("weixin")

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

		wx.requestMidasPayment({
			mode: 'game',
			offerId: offerId,
			env: env,
			currencyType: "CNY",
			platform: "android",
			buyQuantity: 10 * money,
			zoneId: "1",
			success() {
				// 支付成功

				let resultObj = {};
				resultObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "1";
				resultDataObj["msg"] = "支付回调成功";
				resultDataObj["payData"] = dataObj;
				resultObj["data"] = resultDataObj;

				let resultObjJson = JSON.stringify(resultObj);　　　
				ULSdkManager.manageSdkResponse(resultObjJson);

				console.log("支付成功......")
			},
			fail: function(res) {
				console.log("购买失败")
				console.log(res)

				let resultObj = {};
				resultObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "0";
				resultDataObj["msg"] = res.errMsg;
				resultDataObj["payData"] = dataObj;
				resultObj["data"] = resultDataObj;

				let resultObjJson = JSON.stringify(resultObj);　　　
				ULSdkManager.manageSdkResponse(resultObjJson);

			},
			complete: function(res) {
				console.log("购买完成");
				console.log(res);

			}
		})
	}

	getChannelConfigByKey(key) {

		let channelMessObj = ULSdkManager.getConfigByKey("weixin")

		return channelMessObj[key]

	}

	loginRoleInfo() {

		console.log("loginRoleInfo 4399 登录！")
	}
	loginOut() {
		//退出登录，清除当前用户信息，并展示登录窗口		

		console.log("Modules4399  use loginOut is OK!");
		var resultData = '{"cmd":"/c/loginOut","data":"true"}';
		ULSdkManager.manageSdkResponse(resultData);
	}

	openAdv(dataObj) {

		console.log("...openAdv...", dataObj)
		//sdk版本必须大于2.0.4 才能展示广告
		if (SDKVersion < "2.0.4") {

			console.log("sdk 的版本小于 2.0.4 不能展示广告")
			return
		}

		let type = dataObj["type"]

		switch (type) {

			case "banner":

				let banner_adunit = this.getChannelConfigByKey("banner_adunit")

				let bannerTimer = this.getChannelConfigByKey("bannerTimer")
				WeiXinAdv.openBannerAdv(banner_adunit, bannerTimer, dataObj)
				break;
			case "video":
				let video_adunit = this.getChannelConfigByKey("video_adunit")
				WeiXinAdv.openVideoAdv(video_adunit, dataObj)
				break;
		}
	}

	closeAdv(dataObj) {
		let type = dataObj["type"]

		switch (type) {

			case "banner":

				WeiXinAdv.closeBannerAdv()
				break;
			case "video":

				// WeiXinAdv.closeVideoAdv()
				break;
		}

	}
	// 开放域 数据处理
	openDataManage(data) {
		wx.getOpenDataContext().postMessage({
			"message": data
		});
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
		let data = new Object()
		data.cmd = "/c/saveRankData"
		data.data = dataObj

		this.openDataManage(JSON.stringify(data))
	}

	getRankData(dataObj) {

		let data = new Object()
		data.cmd = "/c/getRankData"
		data.data = dataObj

		this.openDataManage(JSON.stringify(data))
	}


	// 游戏跳转
	/*
		{
			"cmd":"/c/jumpOtherGame",
			"data":{
				"gameIndex": ,  //下标  由于不同渠道gameId不同
				"userData":"透传字符串"

			}
	
		}
	*/ 
	jumpOtherGame(dataObj){

		let index = dataObj.gameIndex 
		let jumpGames =  this.getChannelConfigByKey("jumpGames")

		let gameId =jumpGames[index]

		console.log("index...",index,"....gameId....",gameId)
		let jumpObj = new Object()
		jumpObj.appId = gameId
		jumpObj.success = function(){

			console.log("ULSDK_TEST-----游戏跳转成功!")
			let resultObj = {};
			resultObj["cmd"] = "/c/jumpGameResult";
			let resultDataObj = {};
			resultDataObj["code"] = "1";
			resultDataObj["msg"] = "跳转其他游戏成功";
			resultDataObj["userData"] = dataObj.userData || "";
			resultObj["data"] = resultDataObj;

			let resultObjJson = JSON.stringify(resultObj);　　　
			ULSdkManager.manageSdkResponse(resultObjJson); 

		}
		jumpObj.fail = function(){

			console.log("ULSDK_TEST-----游戏跳转失败!")
			let resultObj = {};
			resultObj["cmd"] = "/c/jumpGameResult";
			let resultDataObj = {};
			resultDataObj["code"] = "0";
			resultDataObj["msg"] = "跳转其他游戏失败";
			resultDataObj["userData"] = dataObj.userData || "";
			resultObj["data"] = resultDataObj;

			let resultObjJson = JSON.stringify(resultObj);　　　
			ULSdkManager.manageSdkResponse(resultObjJson); 
			
		}
		wx.navigateToMiniProgram(jumpObj)
	}


}

//初始化当前模块对象
module.exports = new ModulesWeiXin();