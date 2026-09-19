type DbError = { message: string } | null;

/** Query builder for tables/views not yet in generated Database types. */
export type LooseBuilder<T = unknown> = {
  select: (columns?: string) => LooseBuilder<T>;
  insert: (values: Record<string, unknown> | Record<string, unknown>[]) => LooseBuilder<T>;
  update: (values: Record<string, unknown>) => LooseBuilder<T>;
  eq: (column: string, value: string) => LooseBuilder<T>;
  in: (column: string, values: readonly string[]) => LooseBuilder<T>;
  order: (
    column: string,
    options?: { ascending?: boolean },
  ) => LooseBuilder<T>;
  not: (column: string, operator: string, value: unknown) => LooseBuilder<T>;
  single: () => PromiseLike<{ data: T | null; error: DbError }>;
  maybeSingle: () => PromiseLike<{ data: T | null; error: DbError }>;
} & PromiseLike<{ data: T | null; error: DbError }>;

export type LooseClient = {
  from: <T = unknown>(relation: string) => LooseBuilder<T>;
};

/** Escape hatch for views/columns ahead of `database.ts` regeneration. */
export function looseDb(client: object): LooseClient {
  return client as unknown as LooseClient;
}
