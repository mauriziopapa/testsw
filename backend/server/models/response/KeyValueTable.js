class KeyValueTable {
  id = null;
  anno = null;
  key = null;
  value = null;
  readonly = false;

  // We define a static Builder class
  static Builder = class {
    // the builder class will have the same attributes as
    // the parent
    id = null;
    anno = null;
    key = null;
    value = null;
    readonly = false;

    // there are methods to set each of the attributes
    setId(data) {
      this.id = data;
      // each method returns the builder object itself
      // this allows for chaining of methods
      return this;
    }

    setAnno(data) {
      this.anno = data;
      // each method returns the builder object itself
      // this allows for chaining of methods
      return this;
    }

    setKey(data) {
      this.key = data;
      // each method returns the builder object itself
      // this allows for chaining of methods
      return this;
    }

    setValue(data) {
      this.value = data;
      return this;
    }

    setReadonly(data) {
      this.readonly = data;
      return this;
    }

    // when we're done setting arguments, we can call the build method
    // to give us the `ValueTable` instance
    build() {
      const valueTable = new KeyValueTable(this.id, this.anno, this.key, this.value, this.readonly);
      return valueTable;
    }
  };

  constructor(id, anno, key, value, readonly) {
    this.id = id;
    this.anno = anno;
    this.key = key;
    this.value = value;
    this.readonly = readonly;
  }
}

module.exports = KeyValueTable;
