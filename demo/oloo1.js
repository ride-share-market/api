var Foo = {
  init: function (who) {
    this.me = who;
  },
  identify: function () {
    return "I am " + this.me;
  },
  bark: function () {
    console.log('woof');
  }
};

var Bar = Object.create(Foo);

Bar.speak = function () {
  console.log("Hello, " + this.identify());
}

var b1 = Object.create(Bar)

b1.init('b1');

b1.speak();

b1.bark()
