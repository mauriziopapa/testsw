class Value {
  label = null;
  data = null;

  // We define a static Builder class
  static Builder = class {
    // the builder class will have the same attributes as
    // the parent
    label = null;
    data = null;

    // there are methods to set each of the attributes
    setLabel(label) {
      this.label = label;
      // each method returns the builder object itself
      // this allows for chaining of methods
      return this;
    }

    setData(data) {
      this.data = data;
      return this;
    }

    // when we're done setting arguments, we can call the build method
    // to give us the `Value` instance
    build() {
      const value = new Value(this.label, this.data);
      return value;
    }
  };

  constructor(label, data) {
    this.label = label;
    this.data = data;
  }
}

module.exports = Value;
