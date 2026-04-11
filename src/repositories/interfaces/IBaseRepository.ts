export interface IBaseRepository<T> {
  findAll(): Promise<T[] | undefined>;
  findOne(id: number): Promise<T | undefined>;
  create(obj: T): Promise<T | undefined>;
  update(id: number, obj:Partial<T>): Promise<T >;
  delete(id: number): Promise<T | undefined>;
}
