import SceneBase from "../view/SceneBase";
import Timer from "../utils/Timer";
import Const from "../../game/Const";
import mgrDirector from "../../game/manager/mgrDirector";
import LayerColor from "../../game/view/node/LayerColor";

const { ccclass, property } = cc._decorator;

@ccclass
export default class vUpdaterSceneBase extends SceneBase {
    protected patchInfo: any = null;
    protected localPid: number = null;
    protected patchs = null;
    protected patchIdx: number = null;


    private TIMEOUT = 5;

    private requestPatchInfoXhr: XMLHttpRequest = null;

    private timeoutTimer: Timer = null;
    private assetsManager;
    private assetsManagerTimer: Timer;
    private assetsManagerListener;

    private bNeedRestart = false;

    private bGameStarted = false;











    ////// 生命周期 /////
    onLoad() {
        super.onLoad();
    }

    onResourceLoaded() {
        super.onResourceLoaded();

        // 检查patch_info文件是否存在
        if (jsb.fileUtils.isFileExist("src/patch_info.json")) {
            cc.log("发现patch_info.json，准备更新");
            if (this.needPlayLogo()) {
                this.playLogo(() => {
                    this.prepareUpdate();
                });
            } else {
                this.prepareUpdate();
            }

        } else {
            cc.log("patch_info.json未找到，直接进入游戏");
            this.startGame();
        }
    }

    start() {
        super.start();
    }

    update(dt: number) {
        super.update(dt);
    }

    onDestroy() {
        super.onDestroy();
    }










    ////// UI逻辑 /////
    protected buildUi() {
    }

    /**
     * 发送ui消息
     * @param msg 
     * @param data 
     */
    protected sendUiMsg(msg: string, data?: any): void {
        this.onUiMsg(msg, data);
    }

    /**
     * ui消息接收器
     * @param msg 
     * @param data 
     */
    protected onUiMsg(msg: string, data?: any) {
    }









    ///// logo相关 /////
    private needPlayLogo(): boolean {
        /**
         * 耿骁霄：
         * 补丁更新后，需要调用cc.game.restart()重新启动游戏
         * 这个restart，是直接将vm重启，非常彻底
         * 没有【任何】变量能够得到保存
         * 
         * 这里会产生一个问题：
         * 第一次进入游戏：
         * 播放logo
         * 检查更新
         * 下载更新
         * 重启游戏
         * 
         * 第二次进入游戏：
         * 播不播放logo？这里非常尴尬，因为不知道是否为第二次启动
         * 
         * 目前的解决方案是，在cc.game.restart()之前，写入一个"B_SKIP_LOGO_ONCE"到存档中
         * restart后会读取这个存档，并将值修改为false
         * 
         * PS：这个方法在win32模拟器上会有问题，win32的存档不是实时的，在restart之后变量可能并未存档完毕
         *      同时，这个bug适用于win32模拟器上多次重复下载补丁的问题
         *      ios：已测试，没问题你
         *      android：尚未测试
         */
        let bSkipLogoOnce = cc.sys.localStorage.getItem("B_SKIP_LOGO_ONCE") == "true";
        if (bSkipLogoOnce) {
            cc.sys.localStorage.setItem("B_SKIP_LOGO_ONCE", "false");
            return false;
        }

        let logoTextures = this.getLogoTextures();
        if (!logoTextures) return false;

        return true;
    }

    /**
     * 读取patch_info中的CONF.LOGO_TEXTURES
     */
    private getLogoTextures(): string[] {
        // 读取patch_info，获取logo信息
        let jsonText = jsb.fileUtils.getStringFromFile("src/patch_info.json");
        let patchInfo;
        if (jsonText) {
            patchInfo = JSON.parse(jsonText);
        }

        if (!patchInfo) return null;

        let conf = patchInfo.CONF;
        if (!conf) return null;

        let logoTextures = conf.LOGO_TEXTURES;

        if (!Array.isArray(logoTextures)) return null;

        return logoTextures;
    }

    private playLogo(fOnCompleted: () => void): void {
        cc.log("-------------------------");
        cc.log("-----   playLogo    -----");
        cc.log("-------------------------");

        let logoTextures = this.getLogoTextures();

        // 检查logo是否可用
        for (let i = logoTextures.length - 1; i >=0; i--) {
            let logoTexture = logoTextures[i];

            if (!cc.loader["_getResUuid"](logoTexture)) {
                // 这张贴图不存在，移除
                cc.warn(ul.format("vUpdaterSceneBase.playLogo logoTexture not found! fileName=[%s]", logoTexture));
                logoTextures.splice(i, 1);
            }
        }

        // 如果没有可用的logo直接跳过
        if (logoTextures.length <= 0) {
            fOnCompleted();
            return;
        }

        this.nodeResource.active = false;

        // 黑色背景
        let layerColor = new LayerColor(cc.color(0, 0, 0, 255));
        layerColor.parent = this;
        layerColor.setContentSize(mgrDirector.size);

        // logo
        for (let i = 0; i < logoTextures.length; i++) {
            let logoTexture = logoTextures[i];

            let nodeSprite = mgrDirector.createSpriteNode(logoTexture)
            nodeSprite.parent = this;
            nodeSprite.opacity = 0;

            let actions = [];

            // 1. delay
            if (i > 0) {
                actions.push(cc.delayTime(i * (0.6 + 1.8 + 0.6)));
            }

            // 2. in wait out
            actions.push(cc.fadeIn(0.6));
            actions.push(cc.delayTime(1.8));
            actions.push(cc.fadeOut(0.6));

            // 3. complete
            if (i == logoTextures.length - 1) {
                actions.push(cc.callFunc(() => {
                    this.nodeResource.active = true;
                    layerColor.destroy();
                    fOnCompleted();
                }));
            }

            let action = cc.sequence(actions);
            nodeSprite.runAction(action);
        }
    }









    ///// 更新器逻辑 /////

    /** 开始游戏 */
    private startGame(bUpdateVersion?: boolean) {
        if (this.bGameStarted) {
            cc.warn("vUpdataerSceneBase.startGame already started!");
            return
        }
        this.bGameStarted = true;

        // 0. 更新版本号
        if (bUpdateVersion) {
            if (this.patchInfo) {
                let recordVersion = cc.sys.localStorage.getItem("GAME_VERSION");
                if (recordVersion) {
                    // 如果存档中有版本号，则不需要使用最新的版本号
                    Const.GAME_VERSION = recordVersion;
                } else {
                    let version = this.patchInfo.VERSION;
                    if (version) {
                        // 将最新的版本号保存到存档中
                        cc.sys.localStorage.setItem("GAME_VERSION", version);
                        Const.GAME_VERSION = version;
                    }
                }
            }
        }

        // 1. 卸载ui

        // 2. 卸载资源管理器
        this.releaseAssetsManager();

        // 3. 停止xhr
        this.releaseRequestPatchInfoXhr();

        // 4. 启动app
        if (this.bNeedRestart) {
            cc.log("-------------------------");
            cc.log("-----  restarting   -----");
            cc.log("-------------------------");

            cc.sys.localStorage.setItem("B_SKIP_LOGO_ONCE", "true");

            cc.audioEngine.stopAll();
            cc.game.restart();
            return;
        }

        cc.log("-------------------------");
        cc.log("-----   startGame   -----");
        cc.log("-------------------------");
        this.sendUiMsg("UPDATER_UI_MSG_ENTER_NEXT_SCENE");
    }

    /** 重置补丁 */
    private resetPatch(resetTip: string, bid: number, pid: number, channel: string): void {
        cc.log("-------------------------");
        cc.log("-----  resetPatch   -----");
        cc.log("-------------------------");
        cc.log("resetTip", resetTip);

        // 1. 清理已经下载的补丁目录
        let patchPath = this.getPatchPath();
        if (jsb.fileUtils.isDirectoryExist(patchPath)) {
            jsb.fileUtils.removeDirectory(patchPath);
        }

        // 2. 更新存档
        cc.sys.localStorage.setItem("PATCH_BID", bid.toString())
        cc.sys.localStorage.setItem("PATCH_PID", pid.toString())
        cc.sys.localStorage.setItem("PATCH_PACKAGE_PID", pid.toString())
        cc.sys.localStorage.setItem("PATCH_CHANNEL", channel)

        // 3. 保存searchPath
        let searchPaths = [patchPath];
        cc.sys.localStorage.setItem("UPDATER_SEARCH_PATHS", JSON.stringify(searchPaths));
    }

    /** 准备更新 */
    private prepareUpdate() {
        cc.log("-------------------------");
        cc.log("----- prepareUpdate -----");
        cc.log("-------------------------");

        let jsonText = jsb.fileUtils.getStringFromFile("src/patch_info.json");
        let patchInfo;
        if (jsonText) {
            patchInfo = JSON.parse(jsonText);
        }

        if (!patchInfo) {
            cc.warn("[warn] patch_info.json 加载失败，直接进入游戏。");
            this.startGame();
            return;
        }

        this.patchInfo = patchInfo;

        // 版本号
        let version = cc.sys.localStorage.getItem("GAME_VERSION");
        if (!version) {
            version = patchInfo.VERSION;
        }
        Const.GAME_VERSION = version;

        // 检测包版本和存档版本，判断是否需要重置补丁

        /** 安装包的bid */
        let packageBid: number = patchInfo.B_ID;
        /** 安装包的pid */
        let packagePid: number = patchInfo.P_ID;
        /** 安装包的cfg */
        let packageChannel: string = patchInfo.CHANNEL;

        // 检查本地存档的版本
        let recordBid = parseInt(cc.sys.localStorage.getItem("PATCH_BID"));
        let recordPid = parseInt(cc.sys.localStorage.getItem("PATCH_PID"));
        let recordPackagePid = parseInt(cc.sys.localStorage.getItem("PATCH_PACKAGE_PID"));
        let recordChannel: string = cc.sys.localStorage.getItem("PATCH_CHANNEL");

        // 如果bid和channel不匹配，则重置补丁
        // 如果package中的pid比存档的pid高，则重置补丁
        let resetTip: string = null;

        if (packageBid != recordBid) {
            resetTip = ul.format("bid not match! package = %s, record = %d", packageBid, recordBid);
        } else if (packageChannel != recordChannel) {
            resetTip = ul.format("channel not match! package = %s, record = %d", packageChannel, recordChannel);
        } else if (packagePid != recordPackagePid) {
            resetTip = ul.format("package pid not match! package = %s, record = %d", packagePid, recordPackagePid);
        } else if (packagePid > (isNaN(recordPid) ? 0 : recordPid)) {
            resetTip = ul.format("package pid is higher! package = %s, record = %s", packagePid, recordPid);
        }

        if (resetTip) {
            this.resetPatch(resetTip, packageBid, packagePid, packageChannel);
        }

        // 3. 提取当前本地的pid
        let localPid: number = null;
        recordPid = parseInt(cc.sys.localStorage.getItem("PATCH_PID"));
        if (recordPid) {
            // 使用存档中的pid
            localPid = recordPid;
            cc.log("use record pid", localPid);
        } else {
            // 使用patch_info中的pid
            localPid = patchInfo.P_ID || 0;
            cc.log("use patch_info pid", localPid);
        }
        this.localPid = localPid;

        // 4. 准备下载路径
        let patchPath = this.getPatchPath();
        if (!jsb.fileUtils.createDirectory(patchPath)) {
            // 补丁路径创建失败
            cc.log("patchPath create faild!", patchPath);
            this.startGame();
            return;
        }

        // 5. 创建ui
        this.buildUi();

        // 6. 检查更新
        this.checkNewVersion();
    }

    /** 检查更新 */
    private checkNewVersion() {
        this.sendUiMsg("UPDATER_UI_MSG_GET_VERSION");

        let patchInfo = this.patchInfo;
        let patchInfoUrl = ul.format("http://%s/%s/%s/%s/%s",
            patchInfo.HOST,
            patchInfo.PATCH_PATH,
            patchInfo.APP,
            patchInfo.CHANNEL,
            patchInfo.PATCH_INFO_FILENAME
        );
        // cc.log("patchInfoUrl", patchInfoUrl);

        // 开启http请求，下载最新的patch_info.json
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = () => {
            // cc.log("vUpdaterScene.checkNewVersion onReadyStateChange", xhr.readyState, xhr.status);
            if (xhr.readyState != 4) return;

            if (xhr.status >= 200 && xhr.status < 207) {
                this.stopTimeoutTimer();

                // 提取remote patch_info
                let remotePatchInfo;
                try {
                    remotePatchInfo = JSON.parse(xhr.response);
                } catch (error) {
                    cc.warn("vUpdaterScene.checkNewVersion remote patch_info parse except!", xhr.response);
                    this.startGame();
                }

                if (remotePatchInfo) {
                    this.releaseRequestPatchInfoXhr();
                    this.onPatchInfoDownloadSuccess(remotePatchInfo);

                } else {
                    cc.warn("vUpdaterScene.checkNewVersion remote patch_info parse faild!", xhr.response);
                    this.startGame();
                }
            } else {
                cc.warn("vUpdateScene.checkNewVersion network faild.");
                this.startGame();
            }
        };

        let responseType: any = 0;
        xhr.open("GET", patchInfoUrl);
        xhr.timeout = this.TIMEOUT * 1000;
        this.requestPatchInfoXhr = xhr;

        this.startTimeoutTimer();
        xhr.send();
    }

    /** patchInfo下载完成 */
    private onPatchInfoDownloadSuccess(remotePatchInfo: any) {
        cc.log("onPatchInfoDownloadSuccess", remotePatchInfo);
        ul.dump(remotePatchInfo);

        // 检查本地版本号是否高于服务器版本
        let remotePid = parseInt(remotePatchInfo.P_ID) || 0;
        let localPid = this.localPid;

        cc.log("pid:", localPid, remotePid);

        if (localPid > remotePid) {
            // 本地版本更高，直接进入游戏
            // 清空存档中的版本号，在startApp时会重新刷新
            cc.sys.localStorage.setItem("GAME_VERSION", "");

            cc.warn("local version is higher than remote version")
            cc.warn("stop update!")
            this.startGame();
        }

        // 提取需要下载的补丁
        let patchs = [];
        for (let i = 0; i < remotePatchInfo.PATCH_LIST.length; i++) {
            const v = remotePatchInfo.PATCH_LIST[i];

            if (v.pid > localPid) {
                // 版本号比本地pid高，需要更新
                cc.log("ADD PATCH ->", v.pid, v.version);
                patchs.push(v);
            }
        }

        // 保存patchInfo
        this.patchInfo = remotePatchInfo;

        if (patchs.length > 0) {
            this.patchs = patchs;
            this.patchIdx = 0;

            Timer.callLater(0.016, () => {
                this.downloadPatchByIndexed();
            })

        } else {
            // 不需要下载补丁
            this.startGame(true);
        }
    }

    /** 下载idx对应的补丁 */
    private downloadPatchByIndexed() {
        this.releaseAssetsManager();

        cc.log("downloadPatchByIndexed", this.patchIdx);

        let patchInfo = this.patchInfo;
        let patch = this.patchs[this.patchIdx];
        let packageUrl = ul.format("http://%s/%s/%s/%s/%s/",
            patchInfo.HOST_CDN || patchInfo.HOST,
            patchInfo.PATCH_PATH,
            patchInfo.APP,
            patchInfo.CHANNEL,
            patchInfo.B_ID,
        );
        // let versionUrl = ul.format("http://%s/%s/fake_version_creator.json",
        // 	patchInfo.HOST_CDN || patchInfo.HOST,
        // 	patchInfo.PATCH_PATH,
        // )

        cc.log("packageUrl", ul.format("%s%d.zip", packageUrl, patch.pid));

        let assets = {};
        assets[ul.format("%d.zip", patch.pid)] = { size: 0, md5: "", compressed: true };

        /**
         * 2018-4-26 耿骁霄：
         * assetsManager在check的时候，会首先判断localManifest和remoteManifes的版本号
         * 若localVersion >= remoteVersion，则会直接删除掉补丁存储目录
         * 会导致只保留最后一个补丁
         * 这里强制将localManifest的版本号比remoteManifest少1
         */
        let localManifestStr = JSON.stringify({
            packageUrl: packageUrl,
            version: (this.localPid - 1).toString(),
        });
        var localManifest = new jsb.Manifest(localManifestStr, this.getPatchPath());

        let remoteManifestStr = JSON.stringify({
            packageUrl: packageUrl,
            version: patch.pid.toString(),
            assets: assets,
        });
        var remoteManifest = new jsb.Manifest(remoteManifestStr, this.getPatchPath());


        let assetsManager = new jsb.AssetsManager("", this.getPatchPath());
        let assetsManagerListener = new jsb.EventListenerAssetsManager(assetsManager, this.onAssetsManagerEvent.bind(this));
        cc.eventManager.addListener(assetsManagerListener, 1);

        this.assetsManager = assetsManager;
        this.assetsManagerListener = assetsManagerListener;

        let timer = new Timer(0.016, -1, () => {
            // cc.log("onTimer", assetsManager.getState())
            if (cc.isValid(assetsManager)) {
                assetsManager.update();
            }
        });
        this.assetsManagerTimer = timer;


        assetsManager.loadLocalManifest(localManifest, this.getPatchPath());
        assetsManager.loadRemoteManifest(remoteManifest);
        assetsManager.setVersionCompareHandle((a, b) => {
            // cc.log("VersionCompareHandle", a, b)
            return parseFloat(a) - parseFloat(b);
        });
        assetsManager.setVerifyCallback((a, b) => {
            // cc.log("VerifyCallback", a, b)
            return true;
        });
        timer.startAndBindToNode(this);

        // ul.dump(assetsManager);
    }

    private onPatchDownloadSuccess() {
        let patch = this.patchs[this.patchIdx];

        // 保存pid
        this.localPid = patch.pid;
        cc.sys.localStorage.setItem("PATCH_PID", this.localPid.toString());
        cc.log("save PATCH_PID", this.localPid);

        // 保存version
        if (patch.version) {
            cc.sys.localStorage.setItem("GAME_VERSION", patch.version);
            cc.log("save GAME_VERSION", patch.version);
        }

        // 标记为需要重启
        // TODO 这里可以添加检测，是否需要重启，在make.py中检测是否有资源的改动
        this.bNeedRestart = true;

        cc.log("check patchIdx", this.patchIdx, this.patchs.length);

        // 判断补丁是否下载完毕
        if (this.patchIdx < this.patchs.length - 1) {
            this.patchIdx++;
            this.downloadPatchByIndexed();
        } else {
            this.sendUiMsg("UPDATER_UI_MSG_DOWNLOAD_SUCCESS")
            this.startGame(true);
        }
    }

    private onAssetsManagerEvent(e) {
        switch (e.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log("onAssetsManagerEvent.ERROR_NO_LOCAL_MANIFEST");
                this.startGame();
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                cc.log("onAssetsManagerEvent.ERROR_DOWNLOAD_MANIFEST");
                this.startGame();
                break;
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log("onAssetsManagerEvent.ERROR_PARSE_MANIFEST");
                this.startGame();
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                cc.log("onAssetsManagerEvent.NEW_VERSION_FOUND");
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log("onAssetsManagerEvent.ALREADY_UP_TO_DATE");
                this.sendUiMsg("UPDATER_UI_MSG_DOWNLOAD_PROGRESS", {
                    bytePercent: 1,
                    filePercent: 1,
                })
                this.onPatchDownloadSuccess();
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                cc.log("onAssetsManagerEvent.UPDATE_PROGRESSION");
                this.sendUiMsg("UPDATER_UI_MSG_DOWNLOAD_PROGRESS", {
                    bytePercent: e.getPercent() || 0,
                    filePercent: e.getPercentByFile() || 0,
                })
                break;
            case jsb.EventAssetsManager.ASSET_UPDATED:
                cc.log("onAssetsManagerEvent.ASSET_UPDATED");
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                cc.log("onAssetsManagerEvent.ERROR_UPDATING");
                this.startGame();
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                cc.log("onAssetsManagerEvent.UPDATE_FINISHED");
                this.sendUiMsg("UPDATER_UI_MSG_DOWNLOAD_PROGRESS", {
                    bytePercent: 1,
                    filePercent: 1,
                })
                this.onPatchDownloadSuccess();
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                cc.log("onAssetsManagerEvent.UPDATE_FAILED");
                this.startGame();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                cc.log("onAssetsManagerEvent.ERROR_DECOMPRESS");
                this.startGame();
                break;
            default:
                cc.log("onAssetsManagerEvent.unknown code", e.getEventCode());
                this.startGame();
                break;
        }
    }

    /** 获取补丁路径 */
    private getPatchPath(): string {
        let writablePath = jsb.fileUtils.getWritablePath();
        let patchPath;

        // 判断路径的末尾是否有分隔符，如果有分隔符则不再添加
        let lastChar = writablePath.substr(writablePath.length - 1, 1);
        if (lastChar == "/" || lastChar == "\\") {
            patchPath = writablePath + "patch/";
        } else {
            patchPath = writablePath + "/patch/";
        }
        return patchPath;
    }

    private onTimeout() {
        // 超时跳过更新
        this.startGame();
    }

    private startTimeoutTimer() {
        // cc.log("startTimeoutTimer");
        let timer = new Timer(this.TIMEOUT, 1, () => {
            // cc.log("onTimerLoop")
            this.stopTimeoutTimer();
            this.onTimeout();
        });
        this.timeoutTimer = timer;
        timer.startAndBindToNode(this);
    }

    private stopTimeoutTimer() {
        // cc.log("stopTimeoutTimer", this.timeoutTimer);
        if (this.timeoutTimer) {
            this.timeoutTimer.stop();
            this.timeoutTimer = null;
        }
    }
    private releaseRequestPatchInfoXhr() {
        if (this.requestPatchInfoXhr) {
            this.requestPatchInfoXhr.abort();
            this.requestPatchInfoXhr = null;
        }
    }

    private releaseAssetsManager() {
        // cc.log("releaseAssetsManager")
        if (this.assetsManagerTimer) {
            this.assetsManagerTimer.stop();
            this.assetsManagerTimer = null;
        }

        if (this.assetsManagerListener) {
            cc.eventManager.removeListener(this.assetsManagerListener);
            this.assetsManagerListener = null;
        }

        if (this.assetsManager) {
            this.assetsManager = null;
        }
    }










}