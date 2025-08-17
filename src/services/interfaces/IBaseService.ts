export interface IBaseService<T> {
  findAll(): Promise<T[]>;
  findOne(id: number): Promise<T | undefined>;
  create(entity: T): Promise<T>;
  update(id: number, entity: Partial<T>): Promise<T>;
  delete(id: number): Promise<T | undefined>;
}
