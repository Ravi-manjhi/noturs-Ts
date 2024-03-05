export class APIFeatures {
  query: any;
  queryStr: any;
  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryStr = queryString;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludeFields = ["page", "sort", "limit", "field"];
    excludeFields.forEach((el) => delete queryObj[el]);

    const queryStr = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      )
    );
    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    const sort = this.queryStr.sort
      ? (this.queryStr.sort as string)
      : "createdAt";

    const sortBy = sort.split(",").join(" ");
    this.query = this.query.sort(sortBy);
    return this;
  }

  fields() {
    const field = this.queryStr.field
      ? (this.queryStr.field as string)
      : "-__v";
    const selectFields = field.split(",").join(" ");
    this.query.select(selectFields);

    return this;
  }

  pagination() {
    const page = this.queryStr.page
      ? parseInt(this.queryStr.page as string)
      : 1;
    const limit = this.queryStr.limit
      ? parseInt(this.queryStr.limit as string)
      : 100;
    const skip = limit * (page - 1);
    this.query.limit(limit).skip(skip);

    return this;
  }
}
