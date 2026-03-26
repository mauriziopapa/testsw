class ValuePrecGroup {
  label = null;
  val = null;
  val_prec = null;
  target = null;

  // We define a static Builder class
  static Builder = class {
    // the builder class will have the same attributes as
    // the parent
    label = null;
    val = null;
    val_prec = null;
    target = null;

    // there are methods to set each of the attributes
    setLabel(label) {
      this.label = label;
      // each method returns the builder object itself
      // this allows for chaining of methods
      return this;
    }

    setVal(valore) {
      this.val = valore;
      return this;
    }

    setValPrec(valore) {
      this.val_prec = valore;
      return this;
    }

    setTarget(target) {
      this.target = target;
      return this;
    }

    // when we're done setting arguments, we can call the build method
    // to give us the `ValueGroup` instance
    build() {
      const valuePrecGroup = new ValuePrecGroup(this.label, this.val, this.val_prec, this.target);
      return valuePrecGroup;
    }
  };

  constructor(label, valore, valore_prec, target) {
    this.label = label;
    this.val = valore;
    this.val_prec = valore_prec;
    this.target = target;
  }
}

module.exports = ValuePrecGroup;
