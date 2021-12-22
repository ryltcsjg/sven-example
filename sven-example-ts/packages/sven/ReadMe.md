# 基于MobxLabel的界面数据绑定插件
## 主要功能
1.  插件基于mobx实现了页面的数据绑定。绑定后每当数值更新时，页面数据即可自动更新，告别烦人的this.label***.string = ****;
2. localStorage自动存取，支持不同用户id各自的本地数据缓存，可随时切换，并自动更新。
3. 多语言支持
4. 全局事件监听器，装饰器注册，组件销毁时，自动注销监听。

### 初始化
```javascript
/**
* 一些初始化动作
* @param store: MobxLabel中target为null时，引用的全局store
* @param i18n: {lan: 语言,path:json文件相对于assets的路径}，参数仅在编辑器模式下生效
* */
sven.init({
  i18n: { lan: 'zh', path: 'resources/i18n/zh.json' },
  store,
});

/**
* cocoscreator version1.9.3
* 游戏模式设置多语言内容，在第一个场景的onLoad处设置
*/
cc.loader.loadRes('i18n/zh', (err, result) => {
  !err && sven.i18n.setLanguage('zh', result);
});
```

### 介绍：
#### 1. MobxLabel组件  
- i18n: string  
    - 默认使用该栏位的值填入label中
    - 约定以@i18n. 开头的字符串，则从多语言json内容中查找key值对应的文本。 
        - zh.json内容如下，则@i18n.login.success 填入到label中值为 "成功"
    ```json
  {"login": {"success": "成功"}}
    ```
  
  - 约定本栏位值中格式为{number}的字符串，会被foramat中返回的值替换，
    - i18n栏位值为 "加载中：{0}/{1}"
    - format返回[40,100]
    - 文本最终结果为:"加载中：40/100"
    
  - 本栏位为空字符串，最终结果为 format.join("")
- format: 数组
    - target: cc.Node 绑定的node节点，如果为空，则默认使用传入的全局store
    - key: string 绑定的值，注：值需为observable或者computed，否则不会自动更新
        - 1 target为空时，从全局store中获取
           - 如：test.username ,则绑定的值为store.test.username
        - 2 target有值时，从绑定的node中的component获取
           - 如：main.account，则绑定的值为 target.getComponent('main').account
    - defaultValue: string 当获取到的值为null或者object时，则使用本栏位的结果填入。本栏位同样支持 @i18n.*  格式输入

#### 2. sven.autorun,sven.reaction
- mobx.autorun和mobx.reaction 两个方法的语法糖，在onLoad时挂载，onDestroy后自动销毁  
- autorun：onLoad后立即被触发一次，然后每次它的依赖关系改变时会再次被触发。
- reaction：autorun 的变种，对于如何追踪 observable 赋予了更细粒度的控制。在数据表达式首次返回一个新值后运行，在执行 效果 函数时访问的任何 observable 都不会被追踪
- 详细信息参考 [autorun](https://cn.mobx.js.org/refguide/autorun.html) [reaction](https://cn.mobx.js.org/refguide/reaction.html)

```
declare module sven {
  /**
   * @sven.atuorun
   * renderFunc(r:IReactionPublic){
   *   do sth...
   * }
   * */
  export const autorun: MethodDecorator;
  /**
   * @sven.reaction(ref=>T,option?:IReactionOptions)
   * reactionFunc(t:T,r:IReactionPublic){
   *   do sth...
   * }
   * */
  export const reaction: (
    expression: (ref: any, r: import('./mobx/mobx').IReactionPublic) => any,
    option?: import('./mobx/mobx').IReactionOptions
  ) => MethodDecorator;
}
```

#### 3. storage
   - 本地缓存自动存取，共有如下4个方法
```
declare module sven {
  /**
   * 本地缓存
   * @param key:缓存的key名，key名称变更后，不再去获取旧版本中的本地缓存，可用来做版本控制
   * */
   }
  export const Store: (key: string) => ClassDecorator;
  /**
   * 配合@sven.Store及@mobx.observable使用
   * 标记该参数，初始化时如果storage中有值，获取并赋值。
   * 监听参数，当参数改变时，写入到storage中存储
   *
   * @param options
   * key:默认值为属性名称，可以变更key名称，key名称变更后，不再去获取旧版本中的本地缓存，可用来做版本控制
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
  storageByUid: (options?: { key?: string }) => PropertyDecorator;
}
```
   - 使用方法如下
```javascript
const { observable} = mobx;
const { Store, storage, storageByUid, markUid } = sven;
@Store('TestStore')
export default class TestStore {
  @storage() @observable observableValue = 0;
  @markUid() @observable uid = null;
  @storageByUid() @observable storageByUidValue = 0;
}
```

#### 4. emitter
```
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

declare module sven {
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
```