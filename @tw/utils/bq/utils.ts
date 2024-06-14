export function getReferencedTables(query: any) {
  const referencedTables = query?.referencedTables || [];
  const referencedTableNames = referencedTables.map((t) => t.tableId);
  const uniqueTables = [...new Set(referencedTableNames)];
  return uniqueTables.sort();
}

export function calculateQueryTimes(statistics: any) {
  const ghostTime =
    statistics?.endTime - statistics?.startTime - statistics?.finalExecutionDurationMs;
  const totalTime = statistics?.endTime - statistics?.creationTime;
  const queueTime = statistics?.startTime - statistics?.creationTime;
  const finalExecutionTime = statistics?.finalExecutionDurationMs;
  return { ghostTime, totalTime, queueTime, finalExecutionTime };
}

export function calculateShuffleOutputBytes(query: any) {
  return query?.queryPlan?.reduce((acc, plan) => acc + Number(plan.shuffleOutputBytes), 0);
}

export function calculateBiEngineMode(query: any) {
  return query?.biEngineStatistics?.biEngineMode || 'disabled';
}

export function calculateAppComponent(referer: string): string {
  if (referer === undefined) {
    return 'unknown';
  }
  if (referer == '/chat') {
    return 'chat';
  }
  if (referer.startsWith('/dashboards')) {
    return 'dashboards';
  }
  if (referer == '/sql-editor') {
    return 'sql-editor';
  }
  return '2.0';
}

export function calculateEstimatedMaxSlots(query: any) {
  return (
    query?.timeline?.reduce((max, obj) => {
      return Number(obj?.activeUnits) > max ? Number(obj?.activeUnits) : max;
    }, Number(query?.timeline[0]?.activeUnits || 0)) || 0
  );
}
