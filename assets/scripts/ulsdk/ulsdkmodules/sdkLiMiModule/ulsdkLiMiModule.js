import * as
ULSdkManager
from '../../ulsdkmanager/ulsdkmanager.js';
import * as ULCop from '../../net/ULCop.js';


var LiMiAdv = require('./ulsdkLiMiAdv.js');
let mUserId = ""
let sdkCopConfig = null
let isClosePay =  1
class ModulesLiMi {

	initModule() {
		let gameId = ULSdkManager.getConfigByKey("gameId")
		let copUrl = ULSdkManager.getConfigByKey("copUrl")
		let gameVersion = ULSdkManager.getConfigByKey("gameVersion")
		let copChannelId = this.getChannelConfigByKey("cop_channelId")
		
		isClosePay = this.getChannelConfigByKey("isClosePay")

		this.initSdkCopConfig()

		mUserId = gameId + "_limi_" + GameStatusInfo.openId

		ULCop.initCopInfo(copUrl, copChannelId, gameId, gameVersion)

		LiMiAdv.initAdv()

	}

	initSdkCopConfig(){
		sdkCopConfig = new Object()
		sdkCopConfig["sdk_is_open_videorecord"] = "0" 
	}

	setVersion() {

		let setVersionDelay = ULSdkManager.getConfigByKey("setVersionDelay")

		if (ULCop.IsGetCopData) {

			console.log("ULSDK_TEST.........setVersion...数据初始化完成==========console===========", ULCop.IsGetCopData)
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

		console.log("ULSDK_TEST.........doSetVerSion...doSetVerSion--------console-----延时-----", ULCop.IsGetCopData)

		let resultObj = {};

		
		let isUseSdkRank = this.getChannelConfigByKey("isUseSdkRank")
		let isOpenShare =  this.getChannelConfigByKey("isOpenShare")

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
		console.log("ULSDK_TEST....setVersion:", resultObj);

		let channelInfoResult = {};
		channelInfoResult["cmd"] = "/c/channelInfoResult";
		let channelInfoDataObj = {};

		let defaultCopConfig = ULSdkManager.getConfigByKey("commonCopConfig")
		let channelCopConfig = this.getChannelConfigByKey("copDefaultConfig") // channelMessObj["copDefaultConfig"];

		channelInfoDataObj["copInfo"] = ULCop.getCopData(defaultCopConfig, channelCopConfig, sdkCopConfig);
		channelInfoResult["data"] = channelInfoDataObj;

		let channelInfoJson = JSON.stringify(channelInfoResult); //将JSON对象转化为JSON字符

		ULSdkManager.manageSdkResponse(channelInfoJson);

	}

	getUserId() {

		return mUserId
	}

	userLogin(dataObj){

	}

	userIsLogin(dataObj){
		
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

		let shareResult = new Object()
		shareResult.cmd = "/c/shareResult"

		let resultdataObj = new Object()
		BK.Share.share({
			qqImgUrl: imagePath,
			socialPicPath: 'GameRes://inviteIcon.png', // 分享到空间、微信、朋友圈的图片本地路径，可选，默认为游戏二维码，只对 高于7.6.3版本的手Q 有效
			title: '',
			summary: content,
			extendInfo: '',
			isToFriend: true, // 是否发送给好友，可选，只对 H5游戏 或 低于7.6.3版本的手Q 有效
			success: (succObj) => {
				BK.Console.log('Waaaah! share success', succObj.code, JSON.stringify(succObj.data));

				resultdataObj.code = 1
				resultdataObj.msg = "分享成功！"
				resultdataObj.userData = dataObj.userData
				shareResult.data = resultdataObj
				ULSdkManager.manageSdkResponse(JSON.stringify(shareResult));
				//分享成功
				console.log("ULSDK_TEST.........分享成功........console.....errCode..");
			},
			fail: (failObj) => {
				BK.Console.log('Waaaah! share fail', failObj.code, JSON.stringify(failObj.msg));
				//分享失败
				resultdataObj.code = 0
				resultdataObj.msg = "分享失败！"
				resultdataObj.userData = dataObj.userData
				shareResult.data = resultdataObj
				ULSdkManager.manageSdkResponse(JSON.stringify(shareResult));
				console.log("ULSDK_TEST.........分享失败.........console...errCode...");
			},
			complete: () => {
				BK.Console.log('Waaaah! share complete');
			}
		});
	}

	openPay(dataObj) {

		let gameOrientation = ULSdkManager.getConfigByKey("gameOrientation"); //1（默认，竖屏）2.横屏（home键在左边）3.横屏 （home键在右边）

		let payId = dataObj["payInfo"]["payId"];
		let payDataObj = ULSdkManager.getConfigByKey("pay_code")

		try {
			var itemId = payDataObj[payId]["limi_payId"]
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

		let itemList = [{
			"itemId": itemId, //道具id，非负整数
			"itemNum": 1 //道具数目，非负整数    
		}]

		/**
		 * gameOrientation  //1（默认，竖屏）2.横屏（home键在左边）3.横屏 （home键在右边）
		 * transparent 是否透明
		 * itemList 道具列表
		 * callback 形如 function(errCode,data)
		 */
		BK.QQ.qPayPurchase(gameOrientation, true, itemList, function(errCode, data) {

			console.log("ULSDK_TEST....console..openPay...", gameOrientation, 1, "qPayPurchase errCode:" + errCode + " data:" + JSON.stringify(data))

			// errCode == 0代表成功.其他错误码请查阅本节最下

			if (errCode == 0) {
				let resultObj = {};
				resultObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "1";
				resultDataObj["msg"] = "支付回调成功";
				resultDataObj["payData"] = dataObj;
				resultObj["data"] = resultDataObj;

				let resultObjJson = JSON.stringify(resultObj);　　　
				ULSdkManager.manageSdkResponse(resultObjJson);

			} else {
				//errCode != 0代表购买失败
				let resultObj = {};
				resultObj["cmd"] = "/c/payResult";
				let resultDataObj = {};
				resultDataObj["code"] = "0";
				resultDataObj["msg"] = "失败错误码-" + errCode;
				resultDataObj["payData"] = dataObj;
				resultObj["data"] = resultDataObj;

				let resultObjJson = JSON.stringify(resultObj);　　　
				ULSdkManager.manageSdkResponse(resultObjJson);
			}
		});
	}

	openAdv(dataObj) {

		console.log("ULSDK_TEST...........openAdv......dataObj....", dataObj)
		let type = dataObj["type"]

		switch (type) {

			case "banner":
				let bannerViewId = this.getChannelConfigByKey("bannerViewId")

				let bannerTimer = this.getChannelConfigByKey("bannerTimer")
				LiMiAdv.openBannerAdv(bannerViewId, bannerTimer)
				break;
			case "video":

				LiMiAdv.openVideoAdv(dataObj)
				break;
		}
	}

	closeAdv(dataObj) {
		let type = dataObj["type"]

		switch (type) {

			case "banner":

				LiMiAdv.closeBannerAdv()
				break;
			case "video":

				// LiMiAdv.closeVideoAdv()
				break;
		}

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

		console.log("ULSDK_TEST.....saveRankData>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>==========111111111111====")

		let userData = new Array()
		let singleRd = new Object()
		singleRd.openId = GameStatusInfo.openId
		singleRd.startMs = dataObj.startTime
		singleRd.endMs = dataObj.endTime

		let rankNameList = this.getChannelConfigByKey("rankNameList")
		let rankAttr = rankNameList[dataObj.rankName]

		let scoreInfoObj = new Object()

		//当 rankAttr 不是默认的排行榜数据时   score 默认数据必传
		if (rankAttr != "score") {

			if (rankNameList["scoreOrder"] == 2) {

				scoreInfoObj["score"] = 99999999999
			} else {
				scoreInfoObj["score"] = 0

			}

		}
		scoreInfoObj[rankAttr] = dataObj.score


		// singleRd.scoreInfo = {
		// 	score: dataObj.score
		// }
		singleRd.scoreInfo = scoreInfoObj
		userData.push(singleRd)


		let singleUpScore = new Object()
		singleUpScore.type = dataObj.rankName
		singleUpScore.order = dataObj.order

		let atrrObj = new Object()
		//当 rankAttr 不是默认的排行榜数据时  
		if (rankAttr != "score") {
			atrrObj["score"] = {
				type: rankNameList["score"],
				order: rankNameList["scoreOrder"]
			}
		}
		atrrObj[rankAttr] = singleUpScore

		let saveRd = new Object()
		saveRd["userData"] = userData
		saveRd["attr"] = atrrObj

		console.log("ULSDK_TEST.....saveRankData>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>========22222222222======")
		console.log(JSON.stringify(saveRd))
		// gameMode: 游戏模式，如果没有模式区分，直接填 1
		// 必须配置好周期规则后，才能使用数据上报和排行榜功能
		BK.QQ.uploadScoreWithoutRoom(1, saveRd, function(errCode, cmd, data) {

			BK.Script.log("ULSDK_TEST.......saveRankData..errCode..", errCode, 'cmd......', cmd, "data..", data);

			let resultObj = new Object()
			resultObj["cmd"] = "/c/saveRankResult"

			let resultdataObj = new Object()

			// 返回错误码信息
			if (errCode !== 0) {
				console.log("ULSDK_TEST.....saveRankData>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>========上传分数失败======")
				BK.Script.log("ULSDK_TEST......saveRankData...", 1, 1, '上传分数失败!错误码：' + errCode);

				resultdataObj["code"] = "0"
				resultdataObj["msg"] = "上传排行榜数据失败!"
				resultObj["data"] = resultdataObj

				let resultObjJson = JSON.stringify(resultObj);　　　
				ULSdkManager.manageSdkResponse(resultObjJson);

				return
			}
			console.log("ULSDK_TEST.....saveRankData>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>===========上传排行榜数据成功===")
			resultdataObj["code"] = "1"
			resultdataObj["msg"] = "上传排行榜数据成功!"
			resultObj["data"] = resultdataObj

			let resultObjJson = JSON.stringify(resultObj);　　　
			ULSdkManager.manageSdkResponse(resultObjJson);

		});


	}

	getRankData(dataObj) {

		/*
			dataObj
			{
				"dataNum" : 15,      获取的排行榜数据 条数
				"rankName":"幸运大奖赛", 
				"order" : 1,         排序方式  1: 从大到小(单局)，2: 从小到大(单局)
				"rankType":0         拉取的排行榜的类型  0: 好友排行榜(普通排行榜也是0)，1: 群排行榜，2: 讨论组排行榜，3: C2C二人转 
				
			}	
		*/

		/*
		
			
		*/

		// 当前不支持一次同时拉取多个排行榜，需要拉取多次，而且必须等上一个拉取回来后才能拉取另外一个排行榜
		// 先拉 score 排行榜
		//使用哪一种上报数据做排行，可传入score，a1，a2等
		let order = dataObj.order; //排序的方法：[ 1: 从大到小(单局)，2: 从小到大(单局)，3: 由大到小(累积)]
		let rankType = dataObj.rankType; //要查询的排行榜类型，0: 好友排行榜，1: 群排行榜，2: 讨论组排行榜，3: C2C二人转 (手Q 7.6.0以上支持)

		let dataNum = dataObj.dataNum //获取排行榜数据的数量

		let rankNameList = this.getChannelConfigByKey("rankNameList")
		let rankAttr = rankNameList[dataObj.rankName]
		// 必须配置好周期规则后，才能使用数据上报和排行榜功能
		BK.QQ.getRankListWithoutRoom(rankAttr, order, rankType, function(errCode, cmd, data) {

			// BK.Script.log("ULSDK_TEST.........", 1, 1, "getRankListWithoutRoom callback  cmd" + cmd + " errCode:" + errCode + "  data:" + JSON.stringify(data));

			console.log("ULSDK_TEST.....................getRankListWithoutRoom.....++++++++++++++++++++...")
			console.log(JSON.stringify(data))
			let resultObj = new Object()
			resultObj["cmd"] = "/c/getRankResult"
			let rankList = new Object()
			let resultdataObj = new Object()

			// 返回错误码信息
			if (errCode !== 0) {
				BK.Script.log(1, 1, '获取排行榜数据失败!错误码：' + errCode);

				resultdataObj["code"] = "-1"
				resultdataObj["msg"] = {}

				resultObj["data"] = resultdataObj

				let resultObjJson = JSON.stringify(resultObj);　　　
				ULSdkManager.manageSdkResponse(resultObjJson);
				return;
			}
			// 解析数据
			if (data) {
				let len = data.data.ranking_list.length

				if (dataNum > len) { //判断想要的数据与获得的数据条数哪个多

					dataNum = len
				}

				for (var i = 0; i < dataNum; ++i) {

					let rd = data.data.ranking_list[i];
					//var rd = {
					//    url: '',            // 头像的 url
					//    nick: '',           // 昵称
					//    a1: 1,              // 分数
					//    selfFlag: false,    // 是否是自己
					//};

					let singleRd = new Object()

					singleRd.headUrl = rd.url
					singleRd.nickName = rd.nick
					singleRd.userId = ""

					singleRd.score = rd[rankAttr]
					if (rd.selfFlag) {
						singleRd.selfFlag = true
					}


					rankList[i + 1] = JSON.stringify(singleRd)

				}

				resultdataObj["code"] = "1"
				resultdataObj["msg"] = rankList
				// resultdataObj["rankList"] = rankList
				resultObj["data"] = resultdataObj

				let resultObjJson = JSON.stringify(resultObj);　
				console.log("ULSDK_TEST.....................获取排行榜数据成功.....++++++++++++++++++++...")　
				console.log(rankAttr)　
				ULSdkManager.manageSdkResponse(resultObjJson);
				return
			}

			resultdataObj["code"] = 1
			resultdataObj["msg"] = {}

			resultObj["data"] = resultdataObj

			let resultObjJson = JSON.stringify(resultObj);　　　
			ULSdkManager.manageSdkResponse(resultObjJson);

		});
	}


	jumpOtherGame(dataObj){

		let index =  dataObj.gameIndex
		let jumpGames =  this.getChannelConfigByKey("jumpGames")

		let gameId = jumpGames[index]
		BK.QQ.skipGame(gameId,null);

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
}
//初始化当前模块对象
module.exports = new ModulesLiMi();