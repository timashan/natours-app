module.exports = class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryString = JSON.parse(
      JSON.stringify(this.queryStr).replace(/(lt|gt|lte|gte)/, '$$$&')
    );
    this.query.find(queryString);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.replace(',', ' ');
      this.query.sort(sortBy);
    } else {
      this.query.sort('price');
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.replace(',', ' ');
      this.query.select(fields);
    }
    this.query.select('-__v');
    return this;
  }

  paginate() {
    const limit = this.queryStr.limit || 100;
    const page = this.queryStr.page || 1;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    return this;
  }
};
