export class Emitter {
  constructor() {
    this.mapListener = {};
    this.idx = 1;
  }
  on(event, fun, obj = null, priority = 2) {
    this.idx++;
    this.mapListener[event] = this.mapListener[event] || [];
    this.mapListener[event][this.idx] = { id: this.idx, fun, obj, priority };
    return this.idx;
  }
  once(event, fun, obj = null, priority = 2) {
    this.idx++;
    this.mapListener[event] = this.mapListener[event] || [];
    this.mapListener[event][this.idx] = { id: this.idx, fun, obj, priority, once: true };
    return this.idx;
  }

  off(id) {
    for (let event in this.mapListener) {
      if (this.mapListener[event][id]) {
        delete this.mapListener[event][id];
        if (Object.keys(this.mapListener[event]).length <= 0) {
          delete this.mapListener[event];
        }
        break;
      }
    }
  }

  hasListener(event) {
    return this.mapListener[event] && Object.keys(this.mapListener[event]).length > 0;
  }

  emit(event, msg) {
    if (this.mapListener[event]) {
      let list = Object.values(this.mapListener[event]);
      list.sort((a, b) => b.priority - a.priority);
      list.forEach(({ id, fun, obj, once }) => {
        obj ? fun.call(obj, msg) : fun(msg);
        once && delete this.mapListener[event][id];
      });
    }
  }
}

export const emitter = new Emitter();
