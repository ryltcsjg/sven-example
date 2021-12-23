declare var mobx: typeof import('./mobx/mobx');

type Emitter = {
  /**
   * priority:收到事件监听时的调度优先级，数值越大则优先级越高，默认值：2
   * @return number:返回事件的id，移除监听时需要用到它 sven.emitter.off(id);
   * */
  on: (event: string, cb: Function, obj?: any = null, priority?: number = 2) => number;
  once: (event: string, cb: Function, obj?: any = null, priority?: number = 2) => void;
  hasListener: (event: string) => object;
  off: (id: number) => void;
  emit: (event: string, msg?: any) => void;
};

interface I18n {
  setEditorLanguage(lan: string, path: string);
  refreshEditorLanguage();

  setLanguage(lan: string, json: object);
  getLanguage(): string;

  get(key: string, ...format: string[]): string;
  format(str: string, ...format: string[]): string;
}

declare module sven {
  /**
   * 一些初始化动作
   * @param store: MobxLabel中targe为null时，引用的全局store
   * @param i18n: {lan: 语言,path:json文件相对于assets的路径，CCC编辑器中预览用}
   * */
  export const init: (option: { store?: object; i18n?: { lan: string; path: string } }) => any;

  /**
   * 建议搭配 chrome插件:MobX Developer Tools 使用
   * https://chrome.google.com/webstore/detail/mobx-developer-tools/pfgnfdagidkfgccljigdamigbcnndkod
   * */

  /**
   * https://cn.mobx.js.org/refguide/autorun.html
   * @sven.atuorun
   * renderFunc(r:IReactionPublic){
   *   do sth...
   * }
   * */
  export const autorun: MethodDecorator;
  /**
   * https://cn.mobx.js.org/refguide/reaction.html
   * @sven.reaction(ref=>T,option?:IReactionOptions)
   * reactionFunc(t:T,r:IReactionPublic){
   *   do sth...
   * }
   * */
  export const reaction: (
    expression: (ref: any, r: import('./mobx/mobx').IReactionPublic) => any,
    option?: import('./mobx/mobx').IReactionOptions
  ) => MethodDecorator;

  /**
   * 节流函数
   * @param time 节流时间，每{time}ms内只会执行一次该函数
   * @param callWhenEnd 配合throttle使用，在节流时间结束后，如果过程中有call过函数，则再执行一次
   * */
  export const throttle: (time: number = 300, callWhenEnd: boolean = false) => MethodDecorator;

  /**
   * 全局事件监听器
   * */
  export const emitter: Emitter;
  /**
   * 在onLoad()之后监听事件
   * @param event 字符串或者数组，监听的事件名称
   * @param options {{autoOff, priority, pause }}
   * autoOff: onDestroy()后是否自动移除监听,默认值：true;
   * priority: 收到事件监听时的调度优先级，数值越大则优先级越高，默认值：1;
   * pause: 调用this.pauseListening()后，是否暂停接收监听，默认值：true;
   * */
  export const event: (
    event: string | string[],
    options?: { autoOff?: boolean; priority?: number; pause?: boolean }
  ) => MethodDecorator;
  /**
   * @param event 不传参数则表示监听所有点击
   * @param options:
   *  throttle:启用节流,默认值：300
   *  callWhenEnd: 配合throttle使用，在节流时间结束后，如果过程中有点击事件，则再执行一次，默认值：false（注意：因为是延迟调用，这时组件可能已经被销毁）
   * */
  export const onClick: (
    event?: string | string[],
    options?: { throttle?: number; callWhenEnd?: boolean }
  ) => MethodDecorator;

  /**
   * 本地缓存
   * @param key:缓存的key名，当版本变更后，不再去获取旧版本中的本地缓存
   * */
  export const Store: (key: string) => ClassDecorator;
  /**
   * 配合@sven.Store及@mobx.observable使用
   * 标记该参数，初始化时如果storage中有值，获取并赋值。
   * 监听参数，当参数改变时，写入到storage中存储
   *
   * @param options
   * key:默认值为属性名称，可以变更key名称，当版本升级后，不再去获取旧版本中的本地缓存
   * */
  export const storage: (options?: { key?: string }) => PropertyDecorator;
  /**
   * 全局应只使用到一次
   * */
  export const markUid: () => PropertyDecorator;
  /**
   * 使用同sven.storage
   * 绑定sven.markUid标记的值，uid变更且为空时，将所有的值设置为初始化的值
   * uid变更且不为空时,读取storage中绑定该uid的所有值并赋值
   * */
  export const storageByUid: (options?: { key?: string }) => PropertyDecorator;

  export const i18n: I18n;

  export const MobxLabel: cc.Component;
}

namespace cc {
  interface Component {
    /**
     * 暂停监听@sven.event()的事件，调用 resumeListening()后恢复
     * 注意：如果本组件中没有使用@sven.event()监听过事件，则不存在该函数
     * */
    pauseListening(): void;
    /**
     * 恢复监听事件 通过@sven.event()监听的事件
     * 注意：如果本组件中没有使用@sven.event()监听过事件，则不存在该函数
     * */
    resumeListening(): void;
  }
}
