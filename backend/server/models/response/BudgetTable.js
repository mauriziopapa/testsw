class BudgetTable {
  id = null;
  anno = null;
  descrizione = null;
  budget = null;
  readonly = false;

  // We define a static Builder class
  static Builder = class {
    // the builder class will have the same attributes as
    // the parent
    id = null;
    anno = null;
    descrizione = null;
    budget = null;
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

    setDescrizione(data) {
      this.descrizione = data;
      // each method returns the builder object itself
      // this allows for chaining of methods
      return this;
    }

    setBudget(data) {
      this.budget = data;
      return this;
    }

    setReadonly(data) {
      this.readonly = data;
      return this;
    }

    // when we're done setting arguments, we can call the build method
    // to give us the `BudgetTable` instance
    build() {
      const budgetTable = new BudgetTable(this.id, this.anno, this.descrizione, this.budget, this.readonly);
      return budgetTable;
    }
  };

  constructor(id, anno, descrizione, budget, readonly) {
    this.id = id;
    this.anno = anno;
    this.descrizione = descrizione;
    this.budget = budget;
    this.readonly = readonly;
  }
}

module.exports = BudgetTable;
