export async function concurrentMap(items, concurrency, asyncMapper) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const p = asyncMapper(item).then(result => {
      if (result !== null) results.push(result);
    });
    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(e => e === p), 1);
    }
  }

  await Promise.allSettled(executing);
  return results;
}