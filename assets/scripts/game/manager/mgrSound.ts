import Manager from "../../ulframework/manager/Manager";
import mgrRecord from "./mgrRecord";
import mgrCfg from "./mgrCfg";
import Tools from "../../ulframework/utils/Tools";
import mgrDirector from "./mgrDirector";
import mgrSdk from "./mgrSdk";

const { ccclass } = cc._decorator;

const SOUND_TYPE_MUSIC = 1;
const SOUND_TYPE_EFFECT = 2;

@ccclass
export default class mgrSound extends Manager {
    ///// 成员变量 /////
    /**
     * 正在播放的sound的soundId
     */
    private static playingMusicSoundId: number = null;

    /**
     * 音乐音量 [0, 1]
     */
    private static musicVolume: number = 1;
    /**
     * 音效音量 [0, 1]
     */
    private static effectVolume: number = 1;

    // 所有音频资源缓存
    private static allAudioClips: { [audioId: number]: cc.AudioClip } = {};






    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad()

        this.loadRecord();

        cc.game.on(cc.game['EVENT_HIDE'], function () {
            cc.log("cc.game.EVENT_HIDE");
            mgrSound.pauseSound();
        })
        cc.game.on(cc.game['EVENT_SHOW'], function () {
            cc.log("cc.game.EVENT_SHOW");
            mgrSound.resumeSound();
        })
    }

    protected static loadRecord(): void {
        super.loadRecord();

        let record = mgrRecord.getData("sound") || {};

        this.musicVolume = record.musicVolume != null ? record.musicVolume : 1;
        this.effectVolume = record.effectVolume != null ? record.effectVolume : 1;

        // 尝试恢复音量
        this.setMusicVomue(this.musicVolume, true);
        this.setEffectVolume(this.effectVolume, true);
    }

    protected static saveRecord(): void {
        super.saveRecord();

        let record = {
            musicVolume: this.musicVolume,
            effectVolume: this.effectVolume,
        };

        mgrRecord.setData("sound", record);
    }







    ///// 播放流程 /////
    /**
     * 播放一个声音
     * @param soundId sound_db中的id
     */
    public static play(soundId: number) {
        // cc.log("play", soundId);

        let clip = this.allAudioClips[soundId];

        let soundData = mgrCfg.get("sound_db", soundId);
        if (!soundData) return;

        let type = soundData.type;
        // music
        if (type == SOUND_TYPE_MUSIC) {
            if (soundId == this.playingMusicSoundId) return;

            this.playingMusicSoundId = soundId;

            if (!!clip) {
                let audioResource = mgrDirector.getSharingMusicAudioResource()
                audioResource.clip = clip;
                audioResource.volume = this.musicVolume;
                audioResource.play();
            }
            else {
                let url = this.getUrl(soundId);
                if (!url) { return; }
                mgrDirector.loadRes(url, cc.AudioClip, (error, resClip) => {
                    this.allAudioClips[soundId] = resClip;
                    // soundId 可能与 this.playingMusicSoundId 不一致
                    if (soundId == this.playingMusicSoundId) {
                        let audioResource = mgrDirector.getSharingMusicAudioResource()
                        audioResource.clip = resClip;
                        audioResource.volume = this.musicVolume;
    
                        audioResource.play();
                    }
                })
            }

        }
        // effect
        else {
            if (!!clip) {
                let audioResource = mgrDirector.getSharingEffectAudioResource()
                audioResource.clip = clip;
                audioResource.volume = this.effectVolume;
                audioResource.play();
            }
            else {
                let url = this.getUrl(soundId);
                if (!url) { return; }
                mgrDirector.loadRes(url, cc.AudioClip, (error, resClip) => {
                    this.allAudioClips[soundId] = resClip;
                    let audioResource = mgrDirector.getSharingEffectAudioResource()
                    audioResource.clip = resClip;
                    audioResource.volume = this.effectVolume;

                    audioResource.play();
                })
            }

        }
    }

    // 获取 soundId url 
    private static getUrl(soundId): string {
        let soundData = mgrCfg.get_from_sound_db(soundId);
        if (!soundData) { return ""; }

        // 把.mp3去掉，目前都是写了的
        let temp = soundData.fileName.split(".");
        if (temp.length != 2) {
            return soundData.fileName;
        }
        return temp[0];
    }

    /** 停止所有声音 */
    public static stopAll(): void {
        cc.audioEngine.stopAll();

        this.playingMusicSoundId = null;
        mgrDirector.getSharingMusicAudioResource().stop()
        mgrDirector.getSharingEffectAudioResource().stop()
    }

    public static stopBgm() {
        mgrDirector.getSharingMusicAudioResource().stop()
    }

    public static pauseSound() {
        mgrDirector.getSharingMusicAudioResource().pause()
        mgrDirector.getSharingEffectAudioResource().pause()
        console.info("暂停声音")
        // if (!this.lastMusicVol) {
        //     this.lastMusicVol = this.getMusicVolmue();
        // }
        // if (!this.lastSoundVol) {
        //     this.lastSoundVol = this.getEffectVolume();
        // }
        // this.setMusicVomue(0, true);
        // this.setEffectVolume(0, true);
    }

    public static resumeSound() {
        console.info("恢复声音");
        // if (this.lastMusicVol) {
        //     this.setMusicVomue(this.lastMusicVol, true);
        //     this.lastMusicVol = null;
        // }
        // if (this.lastSoundVol) {
        //     this.setEffectVolume(this.lastSoundVol, true);
        //     this.lastSoundVol = null;
        // }

        mgrDirector.getSharingMusicAudioResource().resume()
        mgrDirector.getSharingEffectAudioResource().resume()
    }







    ///// 选项 /////
    /**
     * 获取当前music音量
     * @return [0, 1]
     */
    public static getMusicVolmue(): number {
        return this.musicVolume;
    }

    /**
     * 设置music音量
     * @param musicVolume [0, 1]
     * @param bIgnoreSave true：不保存
     */
    public static setMusicVomue(musicVolume: number, bIgnoreSave?: boolean) {
        // cc.log("setMusicVomue", musicVolume);
        // cc.log("  playingMusicAudioId", this.playingMusicAudioId);
        // cc.log("  playingMusicSoundId", this.playingMusicSoundId);
        this.musicVolume = musicVolume;

        mgrDirector.getSharingMusicAudioResource().volume = this.musicVolume >= 0 ? this.musicVolume : 0

        if (!bIgnoreSave) {
            this.saveRecord();
        }
    }

    /**
     * 获取当前effect音量
     * @return [0, 1]
     */
    public static getEffectVolume(): number {
        return this.effectVolume;
    }

    /**
     * 设置effect音量
     * @param effectVolume [0, 1]
     * @param bIgnoreSave true: 不保存
     */
    public static setEffectVolume(effectVolume: number, bIgnoreSave?: boolean): void {
        this.effectVolume = effectVolume;

        // cc.log("setEffectVolume", effectVolume);

        mgrDirector.getSharingEffectAudioResource().volume = this.effectVolume >= 0 ? this.effectVolume : 0

        if (!bIgnoreSave) {
            this.saveRecord();
        }
    }










}