export function format(str, ...args) {
  if (args.length > 0) {
    if (args.length === 1 && typeof args[0] === 'object') {
      str = str.replace(/\{[a-zA-Z0-9]+\}/g, v => {
        let key = v.replace(/^{/, '').replace(/}$/, '');
        if (args[0][key] != undefined) {
          return `{${args[0][key]}`;
        }
        return v;
      });
    } else {
      str = str.replace(/\{[0-9]+\}/g, v => {
        let index = v.replace(/^{/, '').replace(/}$/, '');
        if (args[index] != undefined) {
          return `${args[index]}`;
        }
        return v;
      });
    }
  }
  return str;
}
