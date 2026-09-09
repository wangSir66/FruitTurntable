
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = HowToPlay
 * DateTime = Thu Sep 03 2026 13:11:45 GMT+0800 (中国标准时间)
 * Author = w915489907
 * FileBasename = HowToPlay.ts
 * FileBasenameNoExtension = HowToPlay
 * URL = db://assets/Main/Script/HowToPlay.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('HowToPlay')
export class HowToPlay extends Component {
    private onClodeView(){
        this.node.active = false;
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
