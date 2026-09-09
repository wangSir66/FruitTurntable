
import { _decorator, Component, find, instantiate, Node, Prefab, resources, Toggle, UITransform, v3, WebView } from 'cc';
import { MsgBox } from './MsgBox';
import { PopUi } from './PopUi';
import { GameEventCtrl } from './GameEventCtrl';
import { GEventKey } from './GameEvtKey';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PrivacyPolicyCtrl
 * DateTime = Tue Sep 01 2026 09:41:06 GMT+0800 (中国标准时间)
 * Author = w915489907
 * FileBasename = PrivacyPolicyCtrl.ts
 * FileBasenameNoExtension = PrivacyPolicyCtrl
 * URL = db://assets/Main/Script/PrivacyPolicyCtrl.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('PrivacyPolicyCtrl')
export class PrivacyPolicyCtrl extends Component {
    @property({ type: Node })
    private log: Node = null;
    @property({ type: Node })
    private ppNode: Node = null;
    @property({ type: Toggle })
    private ppTogg: Toggle = null;
    @property({ type: WebView })
    private webW: WebView = null;
    @property({ type: UITransform })
    private bg: UITransform = null;
    @property({ type: Node })
    private xieyi: Node = null;

    protected onLoad(): void {
        this.webW.url = '';
        this.ppNode.active = false;
        const flg = localStorage.getItem(PopUi.localKey);
        this.ppTogg.isChecked = flg == '1';
        this.log.active = true; //flg != '1'
        GameEventCtrl.Instance.onEventHandler(GEventKey.CommonKey.ResGameStart, this.onRestartGame, this);
        this.xieyi.on(Node.EventType.TOUCH_END, this.openXieYi, this);
    }

    private openXieYi(){
        this.ppNode.active = true;
        this.webW.url = 'https://zcapps.com/privacy-policy/';
    }

    protected onDestroy(): void {
        GameEventCtrl.Instance.offEventHandler(GEventKey.CommonKey.ResGameStart, this.onRestartGame, this);
    }

    private onRestartGame(){
        // this.ppTogg.isChecked = false;
        // this.log.active = true;
        this.node.active = true;
    }

    protected start(): void {
        this.scheduleOnce(() => {
            const pUi = this.getComponent(UITransform), fH = this.bg.height, fW = this.bg.width;
            this.bg.height = pUi.height;
            this.bg.width = pUi.height / fH * fW;
        }, 0.2)
    }

    private onPPToggle() {
        const flg = !this.ppTogg.isChecked;
        localStorage.setItem(PopUi.localKey, flg ? '1' : '');
    }

    private onStartGame() {
        if (this.ppTogg.isChecked) {
            this.node.emit('childNodeCallBack');
        } else {
            resources.load('MsgBox', Prefab, (err, pre) => {
                if (err) return;
                const nd = instantiate(pre), ctrl = nd.getComponent(MsgBox);
                find('Canvas').addChild(nd);
                ctrl.show({
                    // 显示内容
                    content: 'Please check the User Agreement & Privacy Policy!',
                    // 显示取消按钮 默认隐藏
                    showCancel: false,
                    // 取消callback
                    cancelCallBack: ()=>{},
                    // 确认callback
                    confirmCallBack: ()=>{
                        this.ppTogg.isChecked = true;
                        this.onStartGame();
                    },
                })
            })
        }
    }

    private onPPCloseBtn() {
        this.ppNode.active = false;
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
