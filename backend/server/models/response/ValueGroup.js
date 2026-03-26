class ValueGroup {
  label = null;
  valori = null;
  target = null;

  // We define a static Builder class
  static Builder = class {
    // the builder class will have the same attributes as
    // the parent
    label = null;
    valori = null;
    target = null;

    // there are methods to set each of the attributes
    setLabel(label) {
      this.label = label;
      // each method returns the builder object itself
      // this allows for chaining of methods
      return this;
    }

    setValori(valori) {
      this.valori = valori;
      return this;
    }

    setTarget(target) {
      this.target = target;
      return this;
    }

    // when we're done setting arguments, we can call the build method
    // to give us the `ValueGroup` instance
    build() {
      const valueGroup = new ValueGroup(this.label, this.valori, this.target);
      return valueGroup;
    }
  };

  constructor(label, valori, target) {
    this.label = label;
    this.valori = valori;
    this.target = target;
  }
}

module.exports = ValueGroup;
