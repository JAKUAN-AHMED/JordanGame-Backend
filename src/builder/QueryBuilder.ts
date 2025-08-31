import { FilterQuery, Model, Document, PopulateOptions } from "mongoose";

export type TSearchOption = "exact" | "partial" | "enum" | "search" | undefined;

export interface RangeFilterParams {
  field: string;
  minQueryKey: string;
  maxQueryKey: string;
  dataType: "string" | "number" | "date";
}

class QueryBuilder<T extends Document> {
  private model: Model<T>;
  private query: Record<string, any>;
  private mongoFilter: FilterQuery<T> = {};
  private mongooseQuery: any;

  constructor(query: Record<string, any>, model: Model<T>) {
    this.query = query;
    this.model = model;
    this.mongooseQuery = this.model.find(this.mongoFilter);
  }

  // 🔎 Search
  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm as string;
    if (searchTerm) {
      this.mongoFilter.$or = searchableFields.map(
        (field) =>
          ({
            [field]: { $regex: searchTerm, $options: "i" },
          } as FilterQuery<T>)
      );
    }
    this.mongooseQuery = this.model.find(this.mongoFilter);
    return this;
  }

  // 🎯 Exact filter
  filter(fields: string[] = []) {
    const filters: Record<string, any> = {};
    fields.forEach((field) => {
      if (this.query[field]) {
        filters[field] = this.query[field];
      }
    });
    this.mongoFilter = { ...this.mongoFilter, ...filters };
    this.mongooseQuery = this.model.find(this.mongoFilter);
    return this;
  }

  // 📊 Range filter
  filterByRange(ranges: RangeFilterParams[]) {
    ranges.forEach(({ field, minQueryKey, maxQueryKey, dataType }) => {
      const minValue = this.query[minQueryKey];
      const maxValue = this.query[maxQueryKey];
      if (!minValue && !maxValue) return;

      let condition: any = {};
      if (minValue) {
        condition.$gte =
          dataType === "number"
            ? Number(minValue)
            : dataType === "date"
            ? new Date(minValue)
            : minValue;
      }
      if (maxValue) {
        condition.$lte =
          dataType === "number"
            ? Number(maxValue)
            : dataType === "date"
            ? new Date(maxValue)
            : maxValue;
      }
      this.mongoFilter = { ...this.mongoFilter, [field]: condition };
    });
    this.mongooseQuery = this.model.find(this.mongoFilter);
    return this;
  }

  // ↕ Sorting
  sort() {
    const sortParam = (this.query.sort as string) || "-createdAt";
    const sort: Record<string, 1 | -1> = {};
    sortParam.split(",").forEach((field) => {
      if (field.startsWith("-")) sort[field.slice(1)] = -1;
      else sort[field] = 1;
    });
    this.mongooseQuery = this.mongooseQuery.sort(sort);
    return this;
  }

  // 📄 Pagination
  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }

  // ✅ Field selection
  fields() {
    if (this.query.fields) {
      const fields = this.query.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    }
    return this;
  }

  // 🔗 Populate (include)
  include(populateFields: PopulateOptions[] = []) {
    populateFields.forEach((field) => {
      this.mongooseQuery = this.mongooseQuery.populate(field);
    });
    return this;
  }

  // 🚀 Execute
  async execute() {
    return this.mongooseQuery.exec();
  }

  // 📊 Count meta
  async countTotal() {
    const total = await this.model.countDocuments(this.mongoFilter);
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    return {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    };
  }
}

export default QueryBuilder;
