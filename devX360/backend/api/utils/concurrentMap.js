export async function concurrentMap(items, concurrency, asyncMapper) {
  const results = [];
  const queue = [...items];
  const workers = Array(concurrency).fill().map(async () => {
    while (queue.length) {
      const item = queue.shift();
      try {
        const result = await asyncMapper(item);
        if (result !== null) results.push(result);
      } catch (error) {
        console.error(`Error processing item:`, error);
      }
    }
  });
  await Promise.all(workers);
  return results;
}