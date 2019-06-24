import Manager from "../../ulframework/manager/Manager";
import { NetworkManager } from "../../ulframework/network/NetworkManager";
import { NetworkAdapterHttpUlServer } from "../../ulframework/network/NetworkAdapterHttpUlServer";
import { NetworkAdapterHttp } from "../../ulframework/network/NetworkAdapterHttp";
import Timer from "../../ulframework/utils/Timer";
import { NetworkTask } from "../../ulframework/network/NetworkTask";
import mgrDirector from "./mgrDirector";
import DialogBase from "../../ulframework/view/DialogBase";
import vPromptDialog from "../view/dialog/vPromptDialog";
// import vNetworkWaitingDialog from "../view/dialog/vNetworkWaitingDialog";
import mgrTip from "./mgrTip";
// import vNetworkFaildDialog from "../view/dialog/vNetworkFaildDialog";
import Const from "../Const";
import Tools from "../../ulframework/utils/Tools";

const { ccclass } = cc._decorator;

@ccclass
export default class mgrNetwork extends Manager {
    ///// 成员变量 /////
    private static networkManager: NetworkManager;










    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        let adapter = new NetworkAdapterHttpUlServer();
        adapter.setHost(Const.SERVER_HOST);
        adapter.setUrlFormat(Const.SERVER_URL_FORMAT);
        adapter.setUlServerArg("ultralisk", "pc", Const.SERVER_APP_ID.toString(), "ultralisk");
        adapter.setTimeout(5);

        this.networkManager = new NetworkManager(adapter);

        Timer.callLoop(1 / 60, this.onTimerSpan.bind(this), true);
    }

    protected static loadRecord(): void {
        super.loadRecord();
    }

    protected static saveRecord(): void {
        super.saveRecord();
    }

    private static onTimerSpan(timer: Timer): void {
        let dt = timer.span;
        this.networkManager.update(dt);
    }









    ///// 网络逻辑相关 /////
    public static send(cmd: string, data: any, bBackgroundEnabled?: boolean) {
        if (data == null) data = {};

        let requestData: any = {};
        requestData.cmd = cmd;

        if (data != null) {
            Tools.forEachMap(data, (k,v)=>{
                requestData[k] = v;
            });
        }

        this.networkManager.addTask(
            requestData,
            this.onResponse.bind(this),
            this.onFaild.bind(this),
            this.onRequest.bind(this),
            bBackgroundEnabled
        );
    }

    private static onRequest(task: NetworkTask): void {
        // 开启等待框
        if (!task.isBackgroundEnabled()) {
            this.showWaiting();
        }
    }

    private static onResponse(task: NetworkTask): void {
        // 最后一个消息收到响应，关闭等待框
        if (this.networkManager.getTasks().length <= 1) {
            this.hideWaiting();
        }

        // 发消息
        this.sendMsg("MSG_NETWORK_RESPONSE", {
            requestData: task.getRequestData(),
            responseData: task.getResponseData(),
        })
    }

    private static onFaild(task: NetworkTask): void {
        if (task.isBackgroundEnabled()) {
            // 后台任务失败后停止所有任务
            this.stopAllTasks();
        } else {
            this.showFaild();
        }

        // 发消息
        this.sendMsg("MSG_NETWORK_FAILD", {
            requestData: task.getRequestData(),
            faildMsg: task.getFaildMsg(),
        })
    }

    public static stopAllTasks(): void {
        let msgDatas = [];
        let tasks = this.networkManager.getTasks();
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            msgDatas.push({ requestData: task.getRequestData() });
        }

        this.networkManager.stopAllTasks();

        this.hideWaiting();
        this.hideFaild();

        for (let i = 0; i < msgDatas.length; i++) {
            const msgData = msgDatas[i];
            this.sendMsg("MSG_NETWORK_STOP_TASK", msgData);
        }
    }

    public static retryCurrentTask() {
        this.networkManager.retryCurrentTask();

        if (this.networkManager.getTasks().length > 0) {
            this.showWaiting();
        }
    }










    ///// UI提示相关 /////
    public static showWaiting() {
        // cc.log("mgrNetwork.showWaiting");

        this.hideWaiting();
        this.hideFaild();

        // let dialog = new vNetworkWaitingDialog();
        // dialog.openDialog();
    }

    public static hideWaiting(): void {
        this.sendMsg("MSG_NETWORK_CLOSE_WAITING");
    }

    public static showFaild(): void {
        this.hideWaiting();
        this.hideFaild();

        // let dialog = new vNetworkFaildDialog();
        // dialog.openDialog(true);
    }

    public static hideFaild(): void {
        this.sendMsg("MSG_NETWORK_CLOSE_FAILD");
    }









    ///// 网络监测 /////
    /**
     * 尝试检测网络是否通畅
     * @param fOnReceive 成功回调
     * @param fOnFaild 失败回调
     */
    public static tryCheckNetwork(fOnReceive: () => void, fOnFaild: () => void): void {
        if (cc.sys.isBrowser) {
            // 浏览器直接成功
            // mgrTip.showMsgTip("TODO 浏览器默认视为联网")
            fOnReceive();
            return;
        }

        /**
         * TODO
         * 检测网络是否通畅
         * 在prj.game23中，是通过下载补丁文件中的fake_version来进行检测的
         * 目前在h5模式下无法直接下载fake_version（需要跨域跳转）
         */

        let host = "h005up.ultralisk.cn";
        let url = ul.format("http://%s/cc_patch/fake_version.txt", host);

        let timer: Timer;
        let adapter = new NetworkAdapterHttp();
        adapter.setReceiveCallback((responseData) => {
            cc.log("ReceiveCallback")
            if (timer) timer.stop();
            if (fOnReceive) fOnReceive();
        });
        adapter.setFaildCallback((faildMsg) => {
            cc.log("FaildCallback")
            if (timer) timer.stop();
            if (fOnFaild) fOnFaild();
        });

        adapter.send({ url: url });

        timer = new Timer(0.1, 50, (timer) => {
            cc.log("mgrNetwork.tryCheckNetwork onTimerLoop", timer.count);

            if (timer.count >= 50) {
                // 失败
                if (fOnFaild) fOnFaild();
            }
        });
        timer.start();
    }










}