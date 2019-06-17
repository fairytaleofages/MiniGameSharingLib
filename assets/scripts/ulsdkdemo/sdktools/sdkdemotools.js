import * as HttpRequest from '../net/sdkdemohttprequest.js';

export function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return decodeURI(r[2]);
	}
	return null;
}


var mUserId = "";
var timerAccount = 0;
var isTimerStart = false;
export var timer = null;

let TimerLoopTime = 5000
let TimerStopTime = 240000
export function setTimer(userId, loopTime, stopTime) {
	mUserId = userId
	timerAccount = 0;
	isTimerStart = true;

	TimerLoopTime = loopTime
	TimerStopTime = stopTime
	clearTimeout(timer);
	console.log("setTimer:---userId--:", userId);
	console.log("setTimer:---TimerLoopTime--:", TimerLoopTime);
	console.log("setTimer:---TimerStopTime--:", TimerStopTime);

	NewTimer();
}

function newTimer() {


	if (timerAccount * TimerLoopTime >= TimerStopTime) {
		console.log("-----Hey!别跑了，我要清除定时器！！！-------");
		clearTimeout(timer);
		timer = null;
		return;
	}
	if (isTimerStart) {
		timerAccount++;
		console.log("--------我被每" + (TimerLoopTime / 1000) + "S调用一次-----time：", new Date().getTime(), "-----第：", timerAccount, " 次");
		HttpRequest.channelLogin(mUserId, "1");
		timer = setTimeout("NewTimer()", TimerLoopTime);
	}
}
