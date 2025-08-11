export interface ApiPage<T> {
  data: T[];
  meta: {
    page: number;
    total: number;
    lastPage: number;
  };
}
