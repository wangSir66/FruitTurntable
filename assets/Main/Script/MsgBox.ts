import { Component, Label, Node, _decorator, isValid, tween, v3 } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export class MsgBox extends Component {

    @property(Node)
    private btnClose: Node = null;
    @property(Node)
    private btnCancel: Node = null;
    @property(Label)
    private cancelLable: Label = null;
    @property(Label)
    private okLable: Label = null;
    @property(Label)
    private content: Label = null;
    @property(Label)
    private title: Label = null;

    private style: MsgBoxStyle = null;

    protected _content: Node;
    protected _call: Function;
    onLoad() {
        this._content = this.node.getChildByName('content');
        if (this._content) {
            tween(this._content)
                .to(0.2, { scale: v3(1.2, 1.2, 1.2) })
                .to(0.1, { scale: v3(1, 1, 1) })
                .start()
        }
    }

    onClickOk() {
        this.onClickClose();
        if (this.style && this.style.confirmCallBack) {
            this.style.confirmCallBack();
        }
    }

    onClickCancel() {
        this.onClickClose();
        if (this.style && this.style.cancelCallBack) {
            this.style.cancelCallBack();
        }
    }

    onClickClose(): void {
        if (this.style && this.style.closeCallBack) this.style.closeCallBack();
        if (!this.style.canClose) return;
        if (!isValid(this.node)) return;
        this.closeView(this._call);
    }

    show(style: MsgBoxStyle) {
        this.style = style;
        this.btnCancel.active = false;
        this.btnClose.active = true;
        this.title.string = '';

        if (!!style.title) this.title.string = style.title;
        if (style.content) this.content.string = style.content;
        if (style.showCancel !== undefined) this.btnCancel.active = style.showCancel;
        if (style.confirmText !== undefined) this.okLable.string = style.confirmText;
        if (style.cancelText !== undefined) this.cancelLable.string = style.cancelText;
        if (style.showClose !== undefined) this.btnClose.active = style.showClose;
        if (style.canClose == undefined) style.canClose = true;
        if (style.showConfirm == undefined) style.showConfirm = true;
        this.okLable.node.parent.active = style.showConfirm;
    }

    hide() {
        if (isValid(this.node)) {
            this.onClickClose();
        }
    }
    protected closeView(call: Function) {
        if (this._content) {
            tween(this._content)
                .to(0.2, { scale: v3(0, 0, 0) })
                .call(() => {
                    if (call) call();
                    this.node.destroy();
                })
                .start()
        }
    }
}

export interface MsgBoxStyle {
    // 显示内容
    content: string;
    // 提示标题 默认为 提示
    title?: string;
    // 显示取消按钮 默认隐藏
    showCancel?: boolean;

    // 确认按钮名字 默认为"确定"
    confirmText?: string;
    // 取消按钮名字 默认为"取消"
    cancelText?: string;
    // 取消callback
    cancelCallBack?: Function;
    // 确认callback
    confirmCallBack?: Function;
    // 关闭callback
    closeCallBack?: Function;
    //是否显示关闭按钮 默认显示
    showClose?: boolean
    //是否要关闭 默认显示
    canClose?: boolean
    showConfirm?: boolean
}