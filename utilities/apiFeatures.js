class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let queryObj = { ...this.queryString };
    const excludeFields = ['page', 'limit', 'fields', 'sort'];

    //FILTERING
    excludeFields.forEach((field) => delete queryObj[field]);
    const queryStr = JSON.stringify(queryObj);

    //ADVANCED FILTERING
    queryObj = JSON.parse(
      queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    );
    console.log(queryObj);
    this.query = this.query.find(queryObj);
    return this;
  }
  // {name: 'test', }
  // age[gt]=5
  // age:{
  //   $gt:5
  // }

  sort() {
    if (this.queryString.sort) {
      // const sortBy = req.query.sort.replace(/(,)/g, () => ' ');
      const sortBy = this.queryString.sort
        .split(',')
        .concat('-createdAt')
        .join(' ');
      console.log(this.queryString.sort);
      console.log('sortby', sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      console.log('select', fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skipDocs = (page - 1) * limit;
    this.query = this.query.skip(skipDocs).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
