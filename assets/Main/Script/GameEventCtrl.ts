import { js } from "cc";

export class GameEventCtrl {
    /** 单例 */
    private static _instance: GameEventCtrl = null;
    public static get Instance() {
        if (this._instance === null) {
            this._instance = new GameEventCtrl();
        }
        return this._instance;
    }
    /** 注册的事件数组 */
    private eventHandlers: { [key: string]: any } = null;
    constructor() {
        this.eventHandlers = js.createMap();
    }
    /** ----------------------- 事件句柄 ----------------------------- */
    /**出发消息 */
    public EmitEventHandler(key: string, ...msg: any[]) {
        let arr = this.eventHandlers[key];
        if (!arr || !arr.length) {
            console.log(`Received an unknown command:${key}`);
            return;
        }
        for (const e of arr) {
            if (e.target) e.callback.call(e.target, ...msg);
            else e.callback(...msg);
          }
    }
    /**监听消息 */
    public onEventHandler(key: string, callback: Function, target?: Object) {
        if (!this.eventHandlers[key]) {
            this.eventHandlers[key] = [];
        }
        this.eventHandlers[key].push(new EventHandler(callback, target));
    }
    /**移除监听 */
    public offEventHandler(key: string, callback: Function, target?: Object) {
        let arr = this.eventHandlers[key];
        if (!arr) {
            console.log(`There is no such command ${key} ，Please pay attention`);
            return;
        }
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] && arr[i].callback === callback && arr[i].target === target) {
                arr.splice(i, 1);
                break;
            }
        }
        if (arr.length === 0) {
            this.clearEventHandler(key);
        }
    }
    /**清理监听 */
    private clearEventHandler(key: string) {
        if (!this.eventHandlers[key]) {
            return;
        }
        this.eventHandlers[key] = null;
        delete this.eventHandlers[key];
    }
}

/** 事件 */
class EventHandler {
    callback: Function;
    target: Object;

    constructor(callback: Function, target: Object) {
        this.callback = callback;
        this.target = target;
    }
}