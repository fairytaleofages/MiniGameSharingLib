import { NetworkAdapterBase } from "./NetworkAdapterBase";
import Timer from "../utils/Timer";

const { ccclass, property } = cc._decorator;

@ccclass
export class NetworkAdapterHttpUlServer extends NetworkAdapterBase {
    private signkey: string;
    private platform: string;
    private appid: string;
    private channel: string;
    private urlFormat: string;
    private host: string;
    private timeout: number = 5000;
    private timeoutTimer: Timer;

    private xhr: XMLHttpRequest;

    /**
     * 设置host
     * @param host 
     */
    public setHost(host: string): void {
        this.host = host;
    }

    /**
     * 设置url格式化串
     * @param urlFormat 
     */
    public setUrlFormat(urlFormat: string): void {
        this.urlFormat = urlFormat;
    }

    /**
     * 设置ul server的参数
     * @param signkey 例：ultralisk
     * @param platform 例：pc
     * @param appid 例：24
     * @param channel 例：ultralisk
     */
    public setUlServerArg(signkey: string, platform: string, appid: string, channel: string): void {
        this.signkey = signkey;
        this.platform = platform;
        this.appid = appid;
        this.channel = channel;
    }

    /**
     * 设置超时时间
     * @param timeoutSec 单位秒
     */
    public setTimeout(timeoutSec: number): void {
        this.timeout = timeoutSec;
    }

    /** 发送数据 */
    public send(requestData: any): void {
        let jsonStr = JSON.stringify(requestData);
        jsonStr = encodeURIComponent(jsonStr);

        /**
         * 数据格式
         * signkey=ultralisk&
         * platform=ios&
         * appid=1&
         * channel=xiaomi&
         * data=%JSON%
         */
        let postData = ul.format("signkey=%s&platform=%s&appid=%s&channel=%s&data=%s",
            this.signkey,
            this.platform,
            this.appid,
            this.channel,
            jsonStr
        )

        let url = ul.format(this.urlFormat, this.host);

        cc.log("send", url, postData);

        // 准备xhr
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = this.onReadyStateChange.bind(this);
        xhr.open("POST", url);
        xhr.timeout = this.timeout * 1000;
        this.xhr = xhr;

        // 开始
        this.startTimeoutTimer();
        xhr.send(postData);
    }

    private onReadyStateChange() {
        let xhr = this.xhr
        if (!xhr) return;
        // cc.log("NetworkAdapterHttpUlServer.onReadyStateChange", xhr.readyState, xhr.status);

        // this.stopTimeoutTimer();

        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                let str = xhr.response || "";

                let reqsponseData = { str: null }
                let jsonData;
                try {
                    jsonData = JSON.parse(str);
                } catch (error) {
                    // 忽略异常,后续有处理
                    // cc.warn("NetworkAdapterHttpUlServer.onReadyStateChange json error", error);
                }
                if (jsonData) {
                    reqsponseData = jsonData;
                } else {
                    reqsponseData.str = str;
                }

                this.triggerReceiveCallback(reqsponseData);

            } else {
                // 失败
                this.triggerFaildCallback(ul.format("http error: readyState=[%s], status=[%s]", xhr.readyState, xhr.status));
            }

            this.stopTimeoutTimer();
            this.disconnect();
        }
    }

    public disconnect(): void {
        if (!this.xhr) {return;}

        try {
            this.xhr.abort();
            this.xhr = null;
        } catch (error) {
            console.log("disconnect error");
            this.xhr = null;
        }
    }

    private startTimeoutTimer() {
        this.stopTimeoutTimer();

        // cc.log('startTimeout', this.timeout)

        let timer = new Timer(this.timeout, 1, ()=>{
            // cc.log("on timer span")
            this.stopTimeoutTimer();
            this.disconnect();
        });
        timer.start()

        this.timeoutTimer = timer;
    }

    private stopTimeoutTimer() {
        if (this.timeoutTimer) {
            this.timeoutTimer.stop();
            this.timeoutTimer = null;
        }
    }
}