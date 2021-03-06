function test(name) {
  this.name = name;
  this.say = function () {
    console.log(this.name);
  };
}

let T = new test('jjj');
T.say();

class hook {
  constructor(before, after) {
    this.before = before;
    this.after = after;
    this._backup = test;
    this.init();
  }

  init = () => {
    const _this = this;
    test = function () {
      this._test = new _this._backup();
      _this.overwrite(this);
    };
  };

  overwrite = (backup) => {
    for (let k in backup._test) {
      if (typeof backup._test[k] === 'function') {
        this.overwriteMethod(k, backup);
      } else {
        this.overwriteAttributes(k, backup);
      }
    }
  };

  overwriteMethod = (key, backup) => {
    let before = this.before;
    let after = this.after;
    backup[key] = function () {
      if (before[key]) {
        before[key]();
      }

      const result = backup._test[key]();
      if (after[key]) {
        after[key]();
      }

      return result;
    };
  };
  overwriteAttributes = (key, backup) => {};
}

new hook(
  {
    say() {
      console.log('before say');
      console.log(this);
      console.log(this.name);
      console.log('before say done');
    },
  },
  {
    say() {
      console.log('after say');
    },
  }
);

let U = new test('U');
U.say();
