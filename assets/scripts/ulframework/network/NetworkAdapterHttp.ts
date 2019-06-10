import { NetworkAdapterBase } from "./NetworkAdapterBase";
import Timer from "../utils/Timer";

const { ccclass, property } = cc._decorator;

@ccclass
export class NetworkAdapterHttp extends NetworkAdapterBase {
    private timeout: number = 5000;
    private timeoutTimer: Timer;

    private xhr: XMLHttpRequest;

    /**
     * 设置超时时间
     * @param timeoutSec 单位秒
     */
    public setTimeout(timeoutSec: number): void {
        this.timeout = timeoutSec;
    }

    /**
     * 发送数据
     * @param requestData {url:"", postData:"", requestType:"GET"}
     */
    public send(requestData: any): void {
        let url = requestData.url;
        if (!url) {
            cc.warn("警告] NetworkAdapterHttp.send url not found!");
            return;
        }

        let requestType = requestData.requestType || "GET";
        let postData = requestData.postData || "";


        // 准备xhr
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = this.onReadyStateChange.bind(this);
        xhr.open(requestType, url);
        xhr.timeout = this.timeout;
        this.xhr = xhr;

        // 开始
        this.startTimeoutTimer();
        xhr.send(postData);
    }

    private onReadyStateChange() {
        let xhr = this.xhr
        if (!xhr) return;
        // cc.log("NetworkAdapterHttp.onReadyStateChange", xhr.readyState, xhr.status);

        // this.stopTimeoutTimer();

        if (xhr.readyState == 4) {
            if (xhr.status == 200) {                
                let response = xhr.response || "";
                let reqsponseData = { response: response };
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
            console.log("disconnect error1");
            this.xhr = null;
        }
    }

    private startTimeoutTimer() {
        this.stopTimeoutTimer();

        // cc.log('startTimeout', this.timeout)

        let timer = new Timer(this.timeout, 1, () => {
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