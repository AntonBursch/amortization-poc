export class ModelBase {
  from(obj: object = {}, types: object = {}) {
    for (const k in obj) {
      if (typeof obj[k] === 'object' && types.hasOwnProperty(k)) {
        if (obj[k] instanceof Array) {
          this[k] = [];
          const l = obj[k].length;
          for (let i = 0; i < l; i++) {
            this[k].push(new types[k]().from(obj[k][i]));
          }
        } else {
          this[k] = new types[k]().from(obj[k]);
        }
      } else {
        this[k] = obj[k];
      }
    }
    return this;
  }
}
