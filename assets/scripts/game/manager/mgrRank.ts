import Manager from "../../ulframework/manager/Manager";
import sRankPlayer from "../struct/sRankPlayer";
import mgrNetwork from "./mgrNetwork";
import mgrPlayer from "./mgrPlayer";
import Tools from "../../ulframework/utils/Tools";
import Base64 from "../../ulframework/utils/Base64";
import Const from "../Const";
import mgrRecord from "./mgrRecord";
import mgrCfg from "./mgrCfg";
import mgrTip from './mgrTip';

const { ccclass, property } = cc._decorator;

@ccclass
export default class mgrRank extends Manager {
    ///// 成员变量 /////
    /**排行榜人数 */
    private static serverPlayerCounts: { [rankId: number]: number } = {};
    /**玩家自己的信息 */
    private static selfPlayer: { [rankId: number]: sRankPlayer } = {};
    /**排行榜玩家列表 */
    private static rankPlayers: { [rankId: number]: {[rank:number]:sRankPlayer}} = {}

    private static maxScore:{[rankId:number]: number} = {}


    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad();

        this.loadRecord();

        this.registerListeners({
            MSG_NETWORK_RESPONSE: this.onMsgNetworkResponse,
            MSG_PVP_UPLOAD_SUCCESS: this.onMsgPvpUploadSuccess,
        })
    }

    protected static loadRecord(): void {
        super.loadRecord();

        let record = mgrRecord.getData("rank") || {};
        this.maxScore = record.maxScore || {}
    }

    protected static saveRecord(): void {
        super.saveRecord();

        let record = {
            maxScore: this.maxScore,
        }

        mgrRecord.setData("rank", record);
    }



    public static getPlayers(rankId: number): sRankPlayer[] {
       let _ret = []
       let players = this.rankPlayers[rankId]||{}
       let rank = 1
       while (players[rank]) {
           _ret.push(players[rank])
           rank++
       }
       return _ret
    }

    public static getMaxScore(rankId: number): number{
        return this.maxScore[rankId] || 0
    }

    public static setMaxScore(rankId: number, score: number){
        let oldScore = this.getMaxScore(rankId)
        if(score > oldScore){
            this.maxScore[rankId] = Math.floor(score)
        }
        this.saveRecord()
    }


    ///// 请求数据接口 /////
    /**
     * 获取服务器玩家数量
     * @param rankId 排行榜id
     */
    public static getServerPlayerCount(rankId: number): number {
        return this.serverPlayerCounts[rankId];
    }

    /**
     * 获取玩家自身的数据
     * @param rankId 排行榜id
     */
    public static getSelfPlayer(rankId: number): sRankPlayer {
        return this.selfPlayer[rankId];
    }

    public static requestNextBatchPlayers(rankId: number) {
        let begin = 1
        let add = 20
        let players = this.getPlayers(rankId)
        if (players.length > 0) {
            begin = players[players.length - 1].rank
        }

        this.requestRankList(rankId, begin, begin + add - 1);
    }

    /**
     * 请求必备的信息
     * @param rankId 排行榜id
     * @param bBackgroundEnabled 后台请求
     */
    public static requestSelfData(rankId: number, bBackgroundEnabled?: boolean, mustSend?: boolean): void {
        // 自己的信息
        if (this.getSelfPlayer(rankId) == null || mustSend) {
            let uid = mgrPlayer.getUid();
            let cmd = "/get/getPlayerInfoByUid";
            let data = {
                info: {
                    uidarry: [uid],
                    rankid: rankId.toString(),
                    sorttype: "REVRANGE",
                },
            };
            mgrNetwork.send(cmd, data, bBackgroundEnabled);
        }
    }


    /**
     * 通过排名id请求玩家的信息
     * @param rankId 排名id
     */
    public static requestPlayerDataByRankId(rankId: number): void {
        let cmd = "/get/getPlayerInoByRankid";
        let data = {
            info: {
                rankarry: [rankId.toString(),],
                rankid: rankId.toString(),
                sorttype: "REVRANGE",
            },
        };
        mgrNetwork.send(cmd, data);
    }

    /**
     * 请求排行列表数据
     * @param rankId 排行榜id
     * @param beginRank 起始id [begin, end]
     * @param endRank 结束id [begin, end]
     */
    public static requestRankList(rankId: number, beginRank: number, endRank: number): void {
        let ranks = [];
        for (let rank = beginRank; rank <= endRank; rank++) {
            ranks.push(rank.toString());
        }

        let cmd = "/get/getPlayerInoByRankid";
        let data = {
            info: {
                rankarry: ranks,
                rankid: rankId.toString(),
                sorttype: "REVRANGE",
            },
        };
        mgrNetwork.send(cmd, data);
    }

    /**
     * 请求上传排行数据
     * @param structAvatar 
     */
    public static requestUploadToRank(rankId: number, score: number): void {
        let name = mgrPlayer.getName();
        let uid = mgrPlayer.getUid();

        let playerData = this._packPlayerData(name, score.toString());

        let cmd = "/set/setPlayerInfoWithScoreArray";
        let data = {
            info: {
                uidarray: [uid],
                dataarray: [playerData],
                scorearray: [score.toString()],
                rankid: rankId.toString(),
            },
        };
        mgrNetwork.send(cmd, data);
    }

    public static preRequestRankList(rankId: number) {
        this.requestRankList(rankId, 1, 20)
    }









    ///// playerData相关 //////
    /**
     * 编译玩家数据
     * @param name 
     * @param data 
     */
    private static _packPlayerData(name: string, data: string): string {
        let base64Name = Base64.encodeForUrl(name);
        return base64Name + "|" + data;
    }

    /**
     * 解码玩家数据
     * @param playerData 
     */
    private static _unpackPlayerData(playerData: string): string[] {
        let index = playerData.indexOf("|");
        if (index == null) return ["unknown", ""];

        let base64Name = playerData.substring(0, index);
        let name = Base64.decodeForUrl(base64Name);

        let data = playerData.substring(index + 1, playerData.length);

        return [name, data];
    }









    ///// 事件 /////
    private static onMsgNetworkResponse(e): void {
        let data = e
        let requestData = data.requestData;
        let responseData = data.responseData;

        if (responseData.code == -1) {
            // 失败，不响应
            return;
        }

        let cmd: string = requestData.cmd;

        if (cmd == "/get/getUserNumInRank") {
            // 排行榜总人数
            Tools.forEachMap(responseData.msg, (rankIdStr: string, countStr: string) => {
                let rankId = parseInt(rankIdStr);
                let count = parseInt(countStr);

                if (isNaN(count)) count = 0;

                cc.log("count", rankId, count);

                if (rankId != null && count != null) {
                    this.serverPlayerCounts[rankId] = count;
                    cc.log("############MSG_PVP_PLAYER_COUNT_CHANGED###########")
                    this.sendMsg("MSG_PVP_PLAYER_COUNT_CHANGED", { rankId: rankId });
                } else {
                    cc.warn(ul.format("mgrRank.onMsgNetworkResponse /get/getUserNumInRank data is error! rankId=[%s], count=[%s]", rankId, count));
                }
            });

        } else if (cmd == "/get/getRankName") {
            //排行榜主题
            Tools.forEachMap(responseData.msg, (rankIdStr: string, subject: string) => {
                let rankId = parseInt(rankIdStr);
                this.sendMsg("MSG_PVP_SUBJECT_CHANGED", { rankId: rankId });
            });

        } else if (cmd == "/get/getPlayerInfoByUid") {
            // 目前可以假设，通过uid请求的数据就是请求自己的数据
            let rankId = parseInt(requestData.info.rankid);
            let uid = mgrPlayer.getUid();
            let jsonText = responseData.msg[uid];
            if (!jsonText) {
                cc.warn("[warn] mgrPvp.onMsgNetworkResponse /get/getPlayerInfoByUid player data not found! uid = ", uid);
            } else {
                let jsonData = JSON.parse(jsonText);

                if (!jsonData) {
                    cc.warn("[warn] mgrPvp.onMsgNetworkResponse /get/getPlayerInoByRankid player data not a validate json", jsonText)
                } else if (jsonData.data) {
                    // 解析数据
                    let playerData = jsonData.data;
                    let rank = parseInt(jsonData.rank);
                    let score = parseInt(jsonData.score);

                    let [name, data] = this._unpackPlayerData(playerData);

                    let player = new sRankPlayer(uid, rank, score, name, data);
                    this.selfPlayer[rankId] = player;

                    this.sendMsg("MSG_PVP_SELF_DATA_CHANGED", { rankId: rankId });
                }
            }


        } else if (cmd == "/get/getPlayerInoByRankid") {
            // 根据排名请求关卡
            // 这个数据会对应两个来源：
            // 1. 点赞（随机2个）
            // 2. 列表（固定N个）
            // 这里server只负责数据解析，不做保存
            let rankId = parseInt(requestData.info.rankid);
            let players: sRankPlayer[] = [];

            Tools.forEachMap(responseData.msg, (rankStr: string, jsonText: string) => {
                let rank = parseInt(rankStr);
                let jsonData = JSON.parse(jsonText);

                if (!jsonData) {
                    cc.warn("[warn] mgrPvp.onMsgNetworkResponse /get/getPlayerInoByRankid player data not a validate json", jsonText)
                } else if (jsonData.data) {
                    // 解析数据
                    let playerData = jsonData.data;
                    let uid = jsonData.uid;
                    let score = parseInt(jsonData.score);

                    let [name, data] = this._unpackPlayerData(playerData);

                    let player = new sRankPlayer(uid, rank, score, name, data);
                    players.push(player);

                    if (this.rankPlayers[rankId] == null) this.rankPlayers[rankId] = {}
                    this.rankPlayers[rankId][player.rank] = player
                }
            });

            // 排序
            players = Tools.sortArrayByField(players, "rank");
            this.sendMsg("MSG_PVP_RESPONSE_PLAYER_FROM_RANK", { players: players, rankId: rankId, requestData: requestData })
        } else if (cmd == "/set/setPlayerInfoWithScoreArray") {
            // 提交成绩
            // 清空自己的数据
            let rankId = parseInt(requestData.info.rankid);
            this.selfPlayer[rankId] = null;
            cc.log("MSG_PVP_UPLOAD_SUCCESS")
            this.sendMsg("MSG_PVP_UPLOAD_SUCCESS", { rankId: rankId, requestData: requestData });
        }
    }


    private static onMsgPvpUploadSuccess(e) {
        let data = e
        let rankId = data.rankId;
        let requestData = data.requestData;
        mgrTip.showMsgTip("上传成功")
        //重新请求自己的数据
        this.requestSelfData(rankId)
        this.rankPlayers[rankId] = {}
        this.preRequestRankList(rankId)
    }
}