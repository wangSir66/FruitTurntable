
import { _decorator, Component, find, game, instantiate, Node, Prefab, resources, Toggle } from 'cc';
import { Audiomanager } from './SoundManager';
import { GameEventCtrl } from './GameEventCtrl';
import { GEventKey } from './GameEvtKey';
import { MsgBox } from './MsgBox';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = MenuCtrl
 * DateTime = Thu Sep 03 2026 12:00:04 GMT+0800 (中国标准时间)
 * Author = w915489907
 * FileBasename = MenuCtrl.ts
 * FileBasenameNoExtension = MenuCtrl
 * URL = db://assets/Main/Script/MenuCtrl.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('MenuCtrl')
export class MenuCtrl extends Component {
    @property({ type: Toggle })
    private soundTogg: Toggle = null;
    @property({ type: Toggle })
    private musicTogg: Toggle = null;

    protected onLoad(): void {
        this.node.getChildByName('bg').on(Node.EventType.TOUCH_END, this.closeView, this)
    }

    start() {
        this.scheduleOnce(() => {
            this.soundTogg.isChecked = Audiomanager.Instence.EnableEffect;
            this.musicTogg.isChecked = Audiomanager.Instence.EnableMusic;
        }, 0.6)
    }

    private closeView() {
        this.node.active = false;
    }


    private onSoundTogg(evt: Toggle) {
        this.soundTogg.node.children[0].active = !evt.isChecked;
        Audiomanager.Instence.EnableEffect = evt.isChecked;
    }


    private onMusicTogg(evt: Toggle) {
        this.musicTogg.node.children[0].active = !evt.isChecked;
        Audiomanager.Instence.EnableMusic = evt.isChecked;
    }


    private onHtplyHandler() {
        this.closeView();
        GameEventCtrl.Instance.EmitEventHandler(GEventKey.CommonKey.OpenHowtoplay)
    }

    private clickTime = 0;
    private onExitGame() {
        const dt = Date.now();
        if (this.clickTime > dt) return;
        this.clickTime = dt + 1000;
        resources.load('MsgBox', Prefab, (err, pre) => {
            if (err) return;
            const nd = instantiate(pre), ctrl = nd.getComponent(MsgBox);
            find('Canvas').addChild(nd);
            ctrl.show({
                // 显示内容
                content: 'Quit the game ?',
                // 显示取消按钮 默认隐藏
                showCancel: true,
                // 取消callback
                cancelCallBack: () => { },
                // 确认callback
                confirmCallBack: () => {
                    GameEventCtrl.Instance.EmitEventHandler(GEventKey.CommonKey.ResGameStart);
                    this.closeView();
                },
            })
        })
    }

    private onRestartGame() {
        const dt = Date.now();
        if (this.clickTime > dt) return;
        this.clickTime = dt + 1000;
        resources.load('MsgBox', Prefab, (err, pre) => {
            if (err) return;
            const nd = instantiate(pre), ctrl = nd.getComponent(MsgBox);
            find('Canvas').addChild(nd);
            ctrl.show({
                // 显示内容
                content: 'Are you sure want to restart?',
                // 显示取消按钮 默认隐藏
                showCancel: true,
                // 取消callback
                cancelCallBack: () => { },
                // 确认callback
                confirmCallBack: () => {
                    GameEventCtrl.Instance.EmitEventHandler(GEventKey.CommonKey.RestartGame)
                    this.closeView();
                },
            })
        })
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
