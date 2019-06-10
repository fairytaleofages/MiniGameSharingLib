
export function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return decodeURI(r[2]);
	}
	return null;
}


export function setTimer(stopTime, callBack) {

	
	let timer = setTimeout(callBack, stopTime);

	//alert("添加定时器！",timer)
	
    return timer
	
}

export function loadJs(url, callback) {

	let script = document.createElement('script');
	script.type = "text/javascript";

	// 添加加载完成的事件监听
	script.addEventListener('load', (e) => {
		console.log('加载完成')
		// alert("加载完成"+url)
		callback()

	})

	script.src = url;
	script.defer = "defer";
	let head = document.getElementsByTagName('head')[0];
	head.appendChild(script);
}

	//随机字符串
export function	randomString(len) {

		len = len || 32;
		let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
		let maxPos = $chars.length;
		let pwd = '';
	　　for (let i = 0; i < len; i++) {
	　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	　　}
	　　return pwd;
	}

	//生成订单号
export function	getMark(){
		let t = new Date().getTime()
		return t + randomString(7)
}


export function httpPost(url, postData, netTimeout, timeoutCallback, callback, contentType) {

	let ajax = ''
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari 
		ajax = new XMLHttpRequest();
	} else { // code for IE6, IE5 
		ajax = new ActiveXObject("Microsoft.XMLHTTP");
	}
	//步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
	ajax.open('post', url, true);
	contentType = contentType || 'application/x-www-form-urlencoded;charset=utf-8'
	ajax.setRequestHeader('Content-Type', contentType);
	//步骤三:发送请求
	ajax.send(postData);
	let timeout = false;
	let netTimer = setTimeout(function() {
		timeout = true;
		ajax.abort();
	}, netTimeout);
	//步骤四:注册事件 onreadystatechange 状态改变就会调用
	ajax.onreadystatechange = function() {
		if (timeout) {

			console.log("httpPost--------------超时！");
			timeoutCallback()　
			clearTimeout(netTimer);
			return
		};

		if (ajax.readyState == 4 && ajax.status == 200) {
			//步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
			　　
			let resultData = ajax.responseText
			console.log("httpPost---------ok-----", resultData);
			callback(resultData)
			clearTimeout(netTimer);
		}
	}
}

export function httpGet(url, netTimeout, timeoutCallback, callback) {
	
	let ajax = ''
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari 
		ajax = new XMLHttpRequest();
	} else { // code for IE6, IE5 
		ajax = new ActiveXObject("Microsoft.XMLHTTP");
	}
	//步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
	ajax.open('get', url);
	//步骤三:发送请求
	ajax.send();

	let timeout = false;
	let netTimer = setTimeout(function() {
		timeout = true;
		ajax.abort();
	}, netTimeout);
	//步骤四:注册事件 onreadystatechange 状态改变就会调用
	ajax.onreadystatechange = function() {
		if (timeout) {
			console.log("httpGet---------timeout-----");
			timeoutCallback();　
			clearTimeout(netTimer);
			return
		}

		if (ajax.readyState == 4 && ajax.status == 200) {
			//步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
			　　
			let resultData = ajax.responseText;
			console.log("httpGet---------ok-----", resultData);
			callback(resultData)
			clearTimeout(netTimer);
		}
	}

}