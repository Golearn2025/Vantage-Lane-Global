type PageResult<T> = { data: T[] | null; error: { message: string } | null };

/** Supabase JS caps a single select at ~1000 rows; page until exhausted. */
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
  pageSize = 1000,
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  for (;;) {
    const to = from + pageSize - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) throw error;
    const chunk = data ?? [];
    all.push(...chunk);
    if (chunk.length < pageSize) break;
    from += pageSize;
  }
  return all;
}
