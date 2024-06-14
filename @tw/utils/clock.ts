export function monotonic(
  opt: {
    nanoseconds?: boolean;
  } = {}
): number {
  const time = process.hrtime.bigint();
  return opt.nanoseconds ? Number(time) : Math.floor(Number(time) / 1000000); // convert to milliseconds
}

export class Timer {
  marks: { name: string; timestamp: number; duration: number }[] = [];
  start_time: bigint;
  end_time: bigint;
  ms: number;
  nanoseconds: number;
  running: boolean;
  constructor() {
    this.ms = 0;
    this.nanoseconds = 0;
  }
  start() {
    if (this.running) {
      throw new Error('Timer is already running');
    }
    this.start_time = process.hrtime.bigint();
    this.running = true;
    return this;
  }
  end() {
    if (!this.running) return this;
    this.end_time = process.hrtime.bigint();
    let elapsed = Number(this.end_time - this.start_time);
    this.nanoseconds += elapsed;
    this.ms += elapsed / 1000000;
    this.running = false;
    return this;
  }
  elapsed() {
    if (!this.running) return { ms: this.ms, nanoseconds: this.nanoseconds };
    const elapsed = Number(process.hrtime.bigint() - this.start_time);
    return {
      nanoseconds: elapsed,
      ms: elapsed / 1000000,
    };
  }
  mark(name: string) {
    if (!this.running) return this;
    const prevIdx = this.marks.length - 1;
    const elapsed = this.elapsed().nanoseconds;
    this.marks.push({
      name,
      timestamp: elapsed,
      duration: elapsed - (prevIdx >= 0 ? this.marks[prevIdx].timestamp : 0),
    });
    return this;
  }
  marksData(ns: boolean = false) {
    const roundTo = ns ? 'nanosecond' : 'millisecond';
    return this.marks.reduce((acc, { name, duration }) => {
      return { ...acc, [name]: { ms: duration / 1000000, nanoseconds: duration } };
    }, {});
  }
  log(ns: boolean = false) {
    if (this.running) this.end();
    const roundTo = ns ? 'nanosecond' : 'millisecond';
    return [
      ...this.marks.map(({ name, duration }) => {
        return `${name}= ${formatDurationNanoseconds(duration, { roundTo })}`;
      }),
      `Total= ${formatDurationNanoseconds(this.nanoseconds, { roundTo })}`,
    ].join('; ');
  }
  reset() {
    this.start_time = 0n;
    this.end_time = 0n;
    this.ms = 0;
    this.nanoseconds = 0;
    this.running = false;
    return this;
  }
  duration({ roundTo, long }: { roundTo?: (typeof granularities)[number]; long?: boolean } = {}) {
    return formatDurationNanoseconds(this.nanoseconds, { roundTo, long });
  }
}

const DAY_NS = 86400000000000;
const HR_NS = 3600000000000;
const MIN_NS = 60000000000;
const SEC_NS = 1000000000;
const MS_NS = 1000000;
const granularities = ['day', 'hour', 'minute', 'second', 'millisecond'];
const abbreviations = ['d', 'h', 'm', 's', 'ms'];
const amounts = [DAY_NS, HR_NS, MIN_NS, SEC_NS, MS_NS];
const longKey = (key: string, value: number) => ` ${key}${value === 1 ? '' : 's'}`;
const shortKey = (key: string) => `${abbreviations[granularities.indexOf(key)]}`;

export function formatDurationNanoseconds(
  ns: number,
  { roundTo, long }: { roundTo?: (typeof granularities)[number]; long?: boolean } = {}
) {
  const round = roundTo ? granularities.indexOf(roundTo) : -1;
  const time = granularities.reduce((acc, key, i) => {
    acc[key] = 0;
    return acc;
  }, {});
  granularities.reduce((left, key, i) => {
    if (round > -1 && i > round) return left;
    if (round === i) {
      time[key] = Math.round(left / amounts[i]);
      left = 0;
    } else if (round === -1 && i === granularities.length - 1) {
      time[key] = left / amounts[i];
      left = 0;
    } else {
      const units = Math.floor(left / amounts[i]);
      time[key] = units;
      left = left - units * amounts[i];
    }
    return left;
  }, ns);
  return Object.entries(time)
    .filter(([key, val], i) => (val !== 0 || i === round) && (round === -1 || i <= round))
    .map(([key, val]: [string, number], i) => `${val}${long ? longKey(key, val) : shortKey(key)}`)
    .join(long ? ', ' : ' ');
}
