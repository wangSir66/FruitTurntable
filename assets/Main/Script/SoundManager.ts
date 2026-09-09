import { AudioClip, AudioSource, Button, Node, director, game, resources } from "cc";
export const AudioUrl = {
    Click: 'audio/Btn_click',
    bgM: 'audio/gameBGM',
}

export class Audiomanager {
    private _audioSource: AudioSource;
    private _canSound: boolean;
    private static _self: Audiomanager;
    private _canMusic: boolean;

    constructor() {
        const prt = director.getScene(), adTxt = 'AudioMgrNode';
        let adMgr: any = prt.getChildByName(adTxt);
        if (!adMgr) {
            adMgr = new Node(adTxt);
            prt.addChild(adMgr);
            //标记为常驻节点
            game.addPersistRootNode(adMgr);
            adMgr.addComponent(AudioSource);
        }

        this._audioSource = adMgr.getComponent(AudioSource);
        let SoundManager = this;
        /**全局注册 按钮点击事件音效 */
        Button.prototype['touchBeganClone'] = Button.prototype["_onTouchEnded"]
        Button.prototype['_onTouchEnded'] = function (...event) {
            if (this.interactable && this.enabledInHierarchy) {
                SoundManager.playEffect(AudioUrl.Click);
            }
            this.touchBeganClone(...event);
        }
        this._canMusic = false;
        this._canSound = true;
        resources.preloadDir('Audio');
    }

    static get Instence() {
        if (!this._self) this._self = new Audiomanager();
        return this._self;
    }


    playMusic(url: string | AudioClip) {
        if (!this._canMusic) return;
        if (url instanceof AudioClip) {
            this._audioSource.clip = url;
            this._audioSource.volume = this._canSound ? 0.4 : 0;
            this._audioSource.loop = true;
            this._audioSource.play();
        } else
            resources.load(url, AudioClip, (err, clip) => {
                if (err) return;
                this._audioSource.clip = clip;
                this._audioSource.volume = this._canSound ? 0.4 : 0;
                this._audioSource.loop = true;
                this._audioSource.play();
                console.log(this._audioSource)
            })
    }

    playEffect(url: string | AudioClip) {
        if (!this._canSound) return;
        if (url instanceof AudioClip) {
            this._audioSource.playOneShot(url, this._canSound ? 0.8 : 0);
        } else
            resources.load(url, AudioClip, (err, clip) => {
                if (err) return;
                this._audioSource.playOneShot(clip, 0.8);
            })
    }

    get EnableEffect(): boolean {
        return this._canSound;
    }

    set EnableEffect(val: boolean) {
        this._canSound = val;
    }


    set EnableMusic(val: boolean) {
        this._canMusic = val;
        if (val) this.playMusic(AudioUrl.bgM);
        else this._audioSource.stop();
    }

    get EnableMusic() {
        return this._canMusic;
    }

    onDestroy() {
        //标记为常驻节点
        game.removePersistRootNode(this._audioSource.node);
    }
    OnInit() { }
}