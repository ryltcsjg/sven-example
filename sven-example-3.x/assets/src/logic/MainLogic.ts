class MainLogic {
  start() {
    this.onLoad();
  }
  onLoad() {}
  @sven.event("@clickButton")
  onClickButton({ node, param, ref }) {
    console.log("mainLogic.clickButton===", { node, param, ref });
    // //do something...
    // //播放按钮声音
    // //
    // //close名称按钮关闭界面
    // //node.name == 'close' && ref && ref.node && ref.node.destroy()
  }
  @sven.event("@clickToggle")
  onClickToggle({ node, param, ref }) {
    // //do something...
  }
  destroy() {}
  onDestroy() {}
}
const mainLogic = new MainLogic();
mainLogic.start();
