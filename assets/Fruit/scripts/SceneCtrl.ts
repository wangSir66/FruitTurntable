
import { _decorator, Component, Node, UITransform, Vec3, __private, Prefab, resources, Label, instantiate, Vec2, math, AudioSource, AudioClip, setDisplayStats, Animation, tween } from 'cc';
import { Fruit } from './Fruit';
import { GameEventCtrl } from '../../Main/Script/GameEventCtrl';
import { GEventKey } from '../../Main/Script/GameEvtKey';
import { Audiomanager } from '../../Main/Script/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('SceneCtrl')
export class SceneCtrl extends Component {

    @property({ type: Node })
    private loading: Node = null;
    @property({ type: Node })
    private circleBg: Node = null;
    @property({ type: Node })
    private centerBg: Node = null;
    @property({ type: Node })
    private Bg: Node = null;
    @property({ type: Node })
    private gameEndNode: Node = null;
    @property({ type: Label })
    private scoreNode: Label = null;
    @property({ type: Node })
    private startNode: Node = null;
    @property({ type: Node })
    private htplNode: Node = null;
    @property({ type: Node })
    private muntNode: Node = null;
    @property({ type: Node })
    private topNode: Node = null;

    private centerPoint: Vec3;
    private circleR: number;
    private score: number;
    private fruitsCtrl: Fruit[];
    private readonly offSet: number = 10;
    private isCreateLeft: boolean;

    private fruitPrefab: Prefab[];
    private currFruit: Fruit;
    private fruitNum: number;
    private moveEndCall: Function;
    private moveEndNum: number;
    private audioSource: AudioSource;
    private audioClip: AudioClip[];
    private boomPrefab: Prefab[];
    private isShowing: boolean;


    onLoad() {
        GameEventCtrl.Instance.onEventHandler(GEventKey.CommonKey.GameStart, this.onGameStart, this);
        GameEventCtrl.Instance.onEventHandler(GEventKey.CommonKey.OpenHowtoplay, this.onHTPLOpen, this);
        GameEventCtrl.Instance.onEventHandler(GEventKey.CommonKey.RestartGame, this.reStartGame, this);
        setDisplayStats(false);
        this.audioSource = this.node.getComponent(AudioSource);
        this.startNode.active = this.htplNode.active = this.gameEndNode.active = this.muntNode.active = false;
        this.loadPetPrefab();
    }

    protected onDestroy(): void {
        GameEventCtrl.Instance.offEventHandler(GEventKey.CommonKey.GameStart, this.onGameStart, this);
        GameEventCtrl.Instance.offEventHandler(GEventKey.CommonKey.OpenHowtoplay, this.onHTPLOpen, this);
        GameEventCtrl.Instance.offEventHandler(GEventKey.CommonKey.RestartGame, this.reStartGame, this);
    }

    private onHTPLOpen() {
        this.htplNode.active = true;
    }

    private onCaidanOpen() {
        this.muntNode.active = true;
    }

    private async onGameStart() {
        this.topNode.active = true;
        this.startNode.active = true;
        if (!this.fruitPrefab) await this.loadPetPrefab();
        tween(this.startNode).delay(1).call(() => {
            this.clearFruits();
            this.startNode.active = false;
            this.gameStart();
        }).start();
    }

    private set Score(v: number) {
        this.score += v;
        this.scoreNode.string = `Score: ${this.score}`;
    }

    private playAudio(str: string) {
        if (!this.audioSource || !this.audioClip || !Audiomanager.Instence.EnableEffect) return;
        for (let _i = 0; _i < this.audioClip.length; _i++) {
            const clip: AudioClip = this.audioClip[_i];
            if (clip.name == str) {
                this.audioSource.clip = clip;
                this.audioSource.play();
                break;
            }
        }
    }

    start() {
        this.centerPoint = this.centerBg.position;
        this.circleR = this.circleBg.getComponent(UITransform).width / 2 - this.offSet;
        this.node.on('TouchNode', this.sceneTouch.bind(this));
        this.node.on('circleMoveEnd', () => {
            this.moveEndNum--;
            if (this.moveEndNum <= 0 && this.moveEndCall) {
                this.moveEndCall();
            }
        });
        this.Bg.on(Node.EventType.TOUCH_START, this.sceneTouch, this);
    }

    private gameEnd() {
        //1.检测是否结束
        const first: Fruit = this.fruitsCtrl[0],
            last: Fruit = this.fruitsCtrl[this.fruitsCtrl.length - 1],
            isFull: number = 2 * Math.PI - (first.centerARC + first.ArcLength) + (last.centerARC - last.ArcLength);
        if (isFull <= 0) {
            this.topNode.active = this.muntNode.active = false;
            this.isShowing = true;
            let num = 0;
            const fun = async () => {
                num++;
                if (num == 2) {
                    //2.左到右依次爆炸+分数
                    for (let _i = 0; _i < this.fruitsCtrl.length; _i++) {
                        const ele = this.fruitsCtrl[_i];
                        this.createBoom(ele.centerARC, Number(ele.nodeName.split('_')[1]), null);
                        await ele.selfBoom();
                    }

                    //3.显示结束界面
                    const sc = this.gameEndNode.getChildByName('score').getComponent(Label),
                        tip = this.gameEndNode.getChildByName('tip').getComponent(Label);
                    sc.string = `${this.score}`;
                    tip.string = `You beat ${this.score > 999 ? 90 : (this.score > 600 ? 80 : (this.score > 400 ? 70 : (this.score > 300 ? 60 : 20))) + Number((10 * Math.random()).toFixed(1))}% of players worldwide!`
                    this.gameEndNode.active = true;
                }
            }
            if (isFull <= 0) {
                //1.首尾闪烁
                first.endColor(fun);
                last.endColor(fun);
            } else {
                num = 2;
                fun();
            }
        }
    }

    private createBoom(centerArc: number, indx: number, call: Function) {
        let pre: Prefab, score: Prefab;
        for (let _i = 0; _i < this.boomPrefab.length; _i++) {
            const p = this.boomPrefab[_i];
            if (p.data._name === `boom${indx}`) pre = p;
            else if (p.data._name === `addscore`) score = p;
        }
        if (pre) {
            this.playAudio('synthesis');
            const boom: Node = instantiate(pre),
                ani: Animation = boom.getComponent(Animation),
                s: Node = instantiate(score),
                b_p: Vec3 = math.v3(this.circleR * Math.sin(centerArc), this.circleR * Math.cos(centerArc), 0);
            s.getComponentInChildren(Label).string = `${indx}`;
            this.Score = indx;
            this.node.addChild(boom);
            this.node.addChild(s);
            boom.angle = 180 - centerArc / Math.PI * 180;
            boom.setPosition(b_p);
            s.setPosition(b_p);
            tween(s).to(0.6, { position: math.v3(b_p.x, b_p.y + 200, 0) }, {
                easing: 'sineIn',
                onComplete: () => {
                    this.node.removeChild(s);
                }
            }).start();
            ani.on(Animation.EventType.FINISHED, () => {
                tween(boom).to(0.2, { position: math.v3(b_p.x, b_p.y - 200, 0) }, {
                    easing: 'elasticOut',
                    onComplete: () => {
                        this.node.removeChild(boom);
                        this.node.removeChild(s);
                        call && call();
                    }
                }).start();
            });
            return true;
        }
        return false;
    }

    //点击屏幕
    private sceneTouch(str: any, fruitPos: Vec2) {
        if (this.isShowing) return;
        this.isShowing = true;
        const createFruit = () => {
            //随机生成1-3级 但不能与此边邻近相同
            const indx: number = this.isCreateLeft ? 0 : this.fruitsCtrl.length - 1, extNum: number = Number(this.fruitsCtrl[indx].nodeName.split('_')[1]);
            let type: number = 0;
            do {
                type = Math.ceil(Math.random() * 3);
            } while (type === extNum);
            this.createFruit(type, this.isCreateLeft, undefined, 2);
            this.isCreateLeft = !this.isCreateLeft;
            this.isShowing = false;
            this.gameEnd();//游戏结束
        }

        if (!this.currFruit) {
            const [indx, fruit] = this.getFruitByName(str);
            if (fruit) {
                this.playAudio('clickFruit');
                //1.移动
                fruit.startMove();
                //2.排序
                this.sortFruit(indx, true, () => {
                    //3.删除
                    this.currFruit = this.fruitsCtrl.splice(indx, 1)[0];
                    //4.检测合成
                    this.checkPointSyn(indx, () => {
                        createFruit();
                    });
                }) || (this.isShowing = false);
            } else {
                this.isShowing = false;
            }
        } else {
            this.playAudio('clickFruit');
            const local: Vec2 = typeof str == 'string' ? fruitPos : str.touch.getUILocation(),
                pos: Vec3 = this.node.getComponent(UITransform).convertToNodeSpaceAR(math.v3(local.x, local.y, 0)),
                arc: number = Math.PI / 2 * (pos.x >= 0 ? 1 : 3) - Math.atan(pos.y / pos.x);
            this.currFruit.startMove(math.v3(this.circleR * Math.sin(arc), this.circleR * Math.cos(arc), 0), 180 - arc / Math.PI * 180, () => {
                this.currFruit.centerARC = arc;
                const indx: number = this.getIndexByArc(arc);
                if (indx >= 0) {
                    this.fruitsCtrl.splice(indx, 0, this.currFruit);
                    this.currFruit = null;
                    let sortIndx: number = indx;
                    if (indx === 0) sortIndx = 1;
                    else if (indx === (this.fruitsCtrl.length - 1)) sortIndx = this.fruitsCtrl.length - 2;
                    this.sortFruit(sortIndx, false, () => {
                        this.checkPointSyn(indx, () => {
                            createFruit();
                        });
                    }) || (this.isShowing = false);
                } else this.isShowing = false;
            });
        }
    }

    private getIndexByArc(arc: number) {
        for (let _i = 0; _i < this.fruitsCtrl.length; _i++) {
            const ele = this.fruitsCtrl[_i];
            if (ele.centerARC <= arc) return _i;
        }
        return this.fruitsCtrl.length;
    }

    //检测合成
    private checkPointSyn(checkIdx: number, call: Function) {
        const first: Fruit = this.fruitsCtrl[checkIdx - 1],
            center: Fruit = this.fruitsCtrl[checkIdx],
            next: Fruit = this.fruitsCtrl[checkIdx + 1];
        let synArr: Fruit[] = [];
        if (!!center) {
            if (!first && !!next) {
                if (Number(center.nodeName.split('_')[1]) == Number(next.nodeName.split('_')[1])) synArr.push(center, next);
            } else if (!!first && !!next) {
                if (Number(center.nodeName.split('_')[1]) == Number(next.nodeName.split('_')[1])) synArr.push(center, next);
                if (Number(center.nodeName.split('_')[1]) == Number(first.nodeName.split('_')[1])) synArr.unshift(first, center);
                if (synArr.length === 4) synArr.splice(1, 1);
            } else if (!!first && !next) {
                if (Number(center.nodeName.split('_')[1]) == Number(first.nodeName.split('_')[1])) synArr.push(first, center);
            }
        }
        if (synArr.length) {
            const centerArc: number = (synArr[0].centerARC + synArr[synArr.length - 1].centerARC) / 2,
                offArc: number = synArr[0].centerARC - centerArc,
                indx: number = Number(center.nodeName.split('_')[1]) + 1;
            if (indx > this.fruitPrefab.length) {
                call();
                return;
            }
            //1.删除
            let times: number[] = [], speed: number = 0.2, num: number = 0, fun = (syn, _i, end) => {
                syn.centerARC = end;
                clearInterval(times[_i]);
                num++;
                if (num === this.fruitsCtrl.length) {
                    synArr.map(s => {
                        this.node.removeChild(s.node);
                        this.delFruitByName(s.nodeName);
                        s.destroy();
                    })
                    //2.合成新的
                    const insertIndx: number = this.createFruit(indx, false, centerArc, 1);
                    //3.排序
                    this.sortFruit(insertIndx);
                    //爆炸
                    this.createBoom(centerArc, indx - 1, () => {
                        //4.重新检测变动位置
                        this.checkPointSyn(insertIndx, call);
                    })
                }
            };
            this.playAudio('hit');
            for (let _i = 0; _i < this.fruitsCtrl.length; _i++) {
                const syn: Fruit = this.fruitsCtrl[_i],
                    endArc: number = syn.centerARC + offArc * (syn.centerARC == centerArc ? 0 : (syn.centerARC > centerArc ? -1 : 1));
                times.push(setInterval(() => {
                    if (syn.centerARC > endArc) {
                        syn.centerARC -= speed;
                        if (syn.centerARC <= endArc) fun(syn, _i, endArc);
                    } else if (syn.centerARC < endArc) {
                        syn.centerARC += speed;
                        if (syn.centerARC >= endArc) fun(syn, _i, endArc);
                    } else fun(syn, _i, endArc);
                }, 30));
            }
        } else {
            //合成已知最大
            const b_i = this.fruitPrefab.length;
            let flg = false;
            for (let _i = 0; _i < this.fruitsCtrl.length; _i++) {
                const b: Fruit = this.fruitsCtrl[_i];
                if (Number(b.nodeName.split('_')[1]) === b_i) {
                    flg = true;
                    this.node.removeChild(b.node);
                    //爆炸
                    this.createBoom(b.centerARC, b_i, () => {
                        this.sortFruit(_i, true, () => {
                            this.fruitsCtrl.splice(_i, 1);
                            _i--;
                            //4.重新检测变动位置
                            this.checkPointSyn(_i, call);
                            b.destroy();
                        });
                    })
                }
            }
            flg || call();
        }
    }
    private delFruitByName(str: string) {
        for (let _i = 0; _i < this.fruitsCtrl.length; _i++) {
            const ele: Fruit = this.fruitsCtrl[_i];
            if (ele.nodeName === str) {
                this.fruitsCtrl.splice(_i, 1);
                break;
            }
        }
    }
    //相对某点排序
    private sortFruit(currIndx: number, del: boolean = false, call?: Function) {
        const curr: Fruit = this.fruitsCtrl[currIndx];
        if (!curr) return false;
        this.moveEndNum = this.fruitsCtrl.length - 1;
        this.moveEndCall = call;
        let diffArc: number[];
        if (!del) {
            const first = this.fruitsCtrl[currIndx - 1] || { centerARC: 0, ArcLength: 0 },
                next = this.fruitsCtrl[currIndx + 1] || { centerARC: 0, ArcLength: 0 };
            diffArc = [curr.ArcLength + first.ArcLength - (first.centerARC - curr.centerARC), curr.centerARC - next.centerARC - curr.ArcLength - next.ArcLength];
        }
        for (let _i = 0; _i < this.fruitsCtrl.length; _i++) {
            const ele: Fruit = this.fruitsCtrl[_i];
            if (curr.centerARC === ele.centerARC) continue;
            let isLeft: boolean = currIndx > _i;
            let arc: number;
            if (del) arc = ele.centerARC + curr.ArcLength * (isLeft ? -1 : 1);
            else arc = ele.centerARC + diffArc[isLeft ? 0 : 1];
            arc != undefined && (ele.MoveArc = arc);
        }
        return true;
    }

    private getFruitByName(str: string): [number, Fruit] {
        let indx = -1, fruit: Fruit;
        for (let _i = 0; _i < this.fruitsCtrl.length; _i++) {
            const ele: Fruit = this.fruitsCtrl[_i];
            if (ele.nodeName === str) {
                indx = _i;
                fruit = ele;
                break;
            }
        }
        return [indx, fruit];
    }

    private gameStart() {
        this.topNode.active = true;
        this.score = 0;
        this.Score = 0;
        this.fruitNum = 0;
        this.gameEndNode.active = false;
        this.isCreateLeft = true;
        this.isShowing = false;
        this.fruitsCtrl = [];
        if (!this.fruitPrefab) {
            console.error('没有加载水果资源---');
            return;
        }
        const config: { idnex: number, isLeft: boolean }[] = [
            { idnex: 1, isLeft: false },
            { idnex: 2, isLeft: false },
            { idnex: 3, isLeft: false },
            { idnex: 2, isLeft: false },
            { idnex: 4, isLeft: false },
            { idnex: 2, isLeft: false },
            { idnex: 2, isLeft: true },
            { idnex: 3, isLeft: true },
            { idnex: 1, isLeft: true },
            { idnex: 4, isLeft: true },
            { idnex: 2, isLeft: true }
        ]
        //生成水果
        for (let _i = 0; _i < config.length; _i++) {
            const ele: { idnex: number, isLeft: boolean } = config[_i];
            this.createFruit(ele.idnex, ele.isLeft);
        }
    }
    private reStartGame() {
        this.clearFruits();
        this.gameStart();
    }
    /**
     * 
     * @param sp 图形
     * @param isFirst 是否头部插入
     */
    private createFruit(index: number, isLeft: boolean, arc: number = undefined, ani: number = 0) {
        const pre: Prefab = this.fruitPrefab[index - 1];
        if (!pre) {
            console.error('没有当前预制体', index);
            return;
        }
        const fruit: Node = instantiate(pre),
            ctrl: Fruit = fruit.getComponent(Fruit),
            next: Fruit = (isLeft ? this.fruitsCtrl[0] : this.fruitsCtrl[this.fruitsCtrl.length - 1]);
        this.node.addChild(fruit);
        ctrl.initData(this.circleR, this.centerPoint, this.fruitNum);
        ctrl.centerARC = arc === undefined ? (next ? next.centerARC + (next.ArcLength + ctrl.ArcLength) * (isLeft ? 1 : -1) : Math.PI) : arc;
        this.fruitNum++;
        ctrl.playAni = ani;
        if (arc != undefined) {
            const _i: number = this.getIndexByArc(arc);
            this.fruitsCtrl.splice(_i, 0, ctrl);
            return _i;
        }
        else if (isLeft) this.fruitsCtrl.unshift(ctrl);
        else this.fruitsCtrl.push(ctrl);
    }

    private loadPetPrefab() {
        this.loading.active = false;
        return new Promise((r, c) => {
            let num: number = 0, end = (err?: any, str?: string) => {
                if (err) {
                    this.loading.getComponentInChildren(Label).string = `load ${str} fail！`;
                    console.error(`加载${str}失败----`, err);
                    return;
                }
                this.loading.getComponentInChildren(Label).string = ``;
                if (num == 3) {
                    this.loading.active = false;
                    r(1);
                }
            };
            resources.loadDir('prefab', Prefab, (err, pre) => {
                if (err) {
                    end(err, 'Fruit prefabricated body');
                    return;
                }
                this.fruitPrefab = pre.sort((a, b) => {
                    return Number(a.data._name.split('_')[1]) - Number(b.data._name.split('_')[1])
                });
                num++;
                end(null, 'Fruit prefabricated body');
            });
            resources.loadDir('audio', AudioClip, (err, pre) => {
                if (err) {
                    end(err, 'sound effects');
                    return;
                }
                this.audioClip = pre;
                num++;
                end(null, 'sound effects');
            });
            resources.loadDir('boom', Prefab, (err, pre) => {
                if (err) {
                    end(err, 'explosion effects');
                    return;
                }
                this.boomPrefab = pre;
                num++;
                end(null, 'explosion effects');
            })
        })
    }

    private onGetOutBtn() {
        this.gameEndNode.active = false;
        GameEventCtrl.Instance.EmitEventHandler(GEventKey.CommonKey.ResGameStart)
    }

    private clearFruits() {
        if (this.currFruit) {
            this.currFruit.node.removeFromParent();
            this.currFruit.destroy();
            this.currFruit = null;
        }
        if (this.fruitsCtrl)
            for (let _i = 0; _i < this.fruitsCtrl.length; _i++) {
                const item = this.fruitsCtrl.splice(_i, 1)[0];
                item?.node?.removeFromParent();
                item?.destroy();
                _i--;
            }
    }
}