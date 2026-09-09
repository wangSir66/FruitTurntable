
import { _decorator, Component, Node, UITransform, Vec3, Tween, math, Vec2, EventTouch, tween, Animation } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('Fruit')
export class Fruit extends Component {
    private selfR: number;
    private commonR: number;
    private arcLength: number;
    private centerArc: number;
    private centerPoint: Vec3;
    private currTween: any;
    private moveArc: number = 0;

    private readonly arcSpeed: number = 0.05;

    update(dt: number) {
        if (this.moveArc != 0) {
            const fun = () => {
                this.centerARC = this.moveArc;
                this.moveArc = 0;
                this.node.parent.emit('circleMoveEnd');
            }
            if (this.centerARC > this.moveArc) {
                this.centerARC -= this.arcSpeed;
                if (this.centerARC <= this.moveArc) fun();
            }
            else if (this.centerARC < this.moveArc) {
                this.centerARC += this.arcSpeed;
                if (this.centerARC >= this.moveArc) fun();
            } else fun();

        }
    }

    public selfBoom() {
        return new Promise((r, c) => {
            tween(this.node).to(0.1, { scale: math.v3(0, 0, 0) }, {
                onComplete: () => {
                    r(this.node.name);
                    this.node.removeFromParent();
                    this.node.destroy();
                }
            }).start();
        })
    }

    public endColor(call: Function) {
        const ani: Animation = this.node.getComponent(Animation);
        ani.on(Animation.EventType.FINISHED, () => {
            call && call();
        });
        ani.play('fruitEnd')
    }

    onLoad() {
        const n: Node = this.node;
        this.selfR = n.getComponent(UITransform).width / 2;
        this.node.on(Node.EventType.TOUCH_START, this.touchNode, this);
    }

    private touchNode(evt: EventTouch) {
        const local: Vec2 = evt.touch.getUILocation();
        this.node.parent.emit('TouchNode', this.node.name, local);
    }

    public startMove(pos?: Vec3, angle?: number, call?: Function) {
        if (this.currTween) this.stopMove();
        this.currTween = new Tween();
        this.currTween.target(this.node).to(0.2, { position: pos ? pos : this.centerPoint, angle: angle != undefined ? angle : 0 }, {
            easing: 'smooth',
            onComplete: () => {
                this.centerArc = 0;
                call && call();
            }
        }).start();
    }

    private stopMove() {
        if (!this.currTween) return;
        this.currTween.stop();
        this.currTween.removeSelf();
        this.currTween = null;
    }

    public set MoveArc(v: number) {
        this.moveArc = v;
    }

    public initData(R: number, centerPoint: Vec3, num: number) {
        this.commonR = R;
        //半弧度
        this.arcLength = 2 * Math.asin(this.selfR / (2 * R));
        this.centerPoint = centerPoint;
        this.node.name += `_${num}`;
        this.moveArc = 0;
    }

    public set centerARC(len: number) {
        this.centerArc = len;
        this.nodeAngle = 180 - len / Math.PI * 180;
        this.node.setPosition(math.v3(this.commonR * Math.sin(len), this.commonR * Math.cos(len), 0));
    }

    public set nodeAngle(v: number) {
        this.node.angle = v;
    }

    public get nodeAngle() {
        return this.node.angle;
    }

    public get centerARC(): number {
        return this.centerArc;
    }

    public get ArcLength(): number {
        return this.arcLength;
    }

    public get Pos(): Vec3 {
        return this.node.position;
    }

    public get nodeName() {
        return this.node.name;
    }

    public set playAni(v: number) {
        switch (v) {
            case 1:
                tween(this.node).to(0.1, { scale: math.v3(0.6, 1.8, 1) }, {
                    easing: 'quadInOut'
                }).to(0.06, { scale: math.v3(1, 1, 1) }, {
                    easing: 'quadInOut'
                }).start();
                break;

            case 2:
                this.node.setScale(math.v3(0, 0, 0));
                tween(this.node).to(0.2, { scale: math.v3(1, 1, 1) }).start();
                break;
        }
    }
}
