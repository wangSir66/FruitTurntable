
import { _decorator, Component, find, game, Node, ResolutionPolicy, Size, view, Widget } from 'cc';
import { Audiomanager } from './SoundManager';
import { GameEventCtrl } from './GameEventCtrl';
import { GEventKey } from './GameEvtKey';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PopUi
 * DateTime = Tue Sep 01 2026 09:45:21 GMT+0800 (中国标准时间)
 * Author = w915489907
 * FileBasename = PopUi.ts
 * FileBasenameNoExtension = PopUi
 * URL = db://assets/Main/Script/PopUi.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('PopUi')
export class PopUi extends Component {
    @property({ type: Node })
    private privacyPoll: Node = null;

    public static readonly localKey = 'nimi_fruit_started';

    protected onLoad(): void {
        this.privacyPoll.on('childNodeCallBack', this.onChildCallBack, this);
        let fun = () => {
            const vis: Size = view.getVisibleSize(),
                wigt = find('/Canvas').getComponent(Widget);
            if (vis.height < vis.width) {
                view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
                wigt.isAlignHorizontalCenter = true;
            } else {
                view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
                wigt.isAlignHorizontalCenter = false;
            }
        }
        window.onresize = fun;
        fun();

        Audiomanager.Instence.EnableMusic = true;
    }
    protected start(): void {
        Audiomanager.Instence.OnInit();
    }
    private onChildCallBack() {
        GameEventCtrl.Instance.EmitEventHandler(GEventKey.CommonKey.GameStart)
        this.privacyPoll.active = false;
    }
    protected onDestroy(): void {
        Audiomanager.Instence.onDestroy();
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
