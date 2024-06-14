import { formatDurationNanoseconds, Timer } from './clock';

describe('formatDurationNanoseconds', () => {
  describe('short format', () => {
    it('formats a duration in nanoseconds', () => {
      expect(formatDurationNanoseconds(1)).toEqual('0.000001ms');
      expect(formatDurationNanoseconds(1000)).toEqual('0.001ms');
      expect(formatDurationNanoseconds(1000000)).toEqual('1ms');
      expect(formatDurationNanoseconds(1000000000)).toEqual('1s');
      expect(formatDurationNanoseconds(1000000000000)).toEqual('16m 40s');
      expect(formatDurationNanoseconds(1000000000000000)).toEqual('11d 13h 46m 40s');
    });
    it('rounds to the nearest millisecond', () => {
      expect(formatDurationNanoseconds(1, { roundTo: 'millisecond' })).toEqual('0ms');
      expect(formatDurationNanoseconds(1999999, { roundTo: 'millisecond' })).toEqual('2ms');
      expect(formatDurationNanoseconds(1500000, { roundTo: 'millisecond' })).toEqual('2ms');
      expect(formatDurationNanoseconds(1499999, { roundTo: 'millisecond' })).toEqual('1ms');
    });
    it('rounds to the nearest second', () => {
      expect(formatDurationNanoseconds(1, { roundTo: 'second' })).toEqual('0s');
      expect(formatDurationNanoseconds(1999999999, { roundTo: 'second' })).toEqual('2s');
      expect(formatDurationNanoseconds(1500000000, { roundTo: 'second' })).toEqual('2s');
      expect(formatDurationNanoseconds(1499999999, { roundTo: 'second' })).toEqual('1s');
    });
  });
  describe('long format', () => {
    it('formats a duration in nanoseconds', () => {
      expect(formatDurationNanoseconds(1000000000, { long: true })).toEqual('1 second');
      expect(formatDurationNanoseconds(1000000000000, { long: true })).toEqual(
        '16 minutes, 40 seconds'
      );
      expect(formatDurationNanoseconds(1000000000000000, { long: true })).toEqual(
        '11 days, 13 hours, 46 minutes, 40 seconds'
      );
    });
  });
});

describe('Timer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  describe('basic usage', () => {
    it('measures a duration', () => {
      const timer = new Timer().start();
      jest.advanceTimersByTime(1000);
      timer.end();
      expect(timer.ms).toEqual(1000);
      expect(timer.nanoseconds).toEqual(1000000000);
      expect(timer.duration()).toEqual('1s');
    });

    it('tells how much time has elapsed', () => {
      const timer = new Timer().start();
      jest.advanceTimersByTime(1000);
      expect(timer.elapsed().ms).toEqual(1000);
      jest.advanceTimersByTime(1000);
      expect(timer.elapsed().nanoseconds).toEqual(2000000000);
    });

    it('can be stopped', () => {
      const timer = new Timer().start();
      jest.advanceTimersByTime(1000);
      timer.end();
      jest.advanceTimersByTime(1000);
      expect(timer.elapsed().ms).toEqual(1000);
    });

    it('can be restarted', () => {
      const timer = new Timer().start();
      const originalStartTime = timer.start_time;
      jest.advanceTimersByTime(1000);
      timer.end();
      jest.advanceTimersByTime(1000);
      timer.start();
      expect(timer.start_time).not.toEqual(originalStartTime);
      jest.advanceTimersByTime(1000);
      timer.end();
      expect(timer.ms).toEqual(2000);
    });

    it('multiple calls to end() are ok', () => {
      const timer = new Timer().start();
      jest.advanceTimersByTime(1000);
      timer.end();
      jest.advanceTimersByTime(1000);
      timer.end();
      expect(timer.elapsed().ms).toEqual(1000);
    });

    it('multiple calls to start() errors', () => {
      const timer = new Timer().start();
      expect(() => timer.start()).toThrowError('Timer is already running');
    });

    it('knows if it is running', () => {
      const timer = new Timer().start();
      expect(timer.running).toEqual(true);
      timer.end();
      expect(timer.running).toEqual(false);
    });

    it('can be reset', () => {
      const timer = new Timer().start();
      jest.advanceTimersByTime(1000);
      timer.reset();
      expect(timer.running).toEqual(false);
      expect(timer.ms).toEqual(0);
      expect(timer.nanoseconds).toEqual(0);
    });
  });

  describe('mark', () => {
    it('marks several points in time', () => {
      const timer = new Timer().start();
      jest.advanceTimersByTime(1000);
      timer.mark('first');
      jest.advanceTimersByTime(999);
      timer.mark('second');
      jest.advanceTimersByTime(998);
      timer.mark('third');
      timer.end();
      expect(timer.marksData()).toEqual({
        first: { ms: 1000, nanoseconds: 1000000000 },
        second: { ms: 999, nanoseconds: 999000000 },
        third: { ms: 998, nanoseconds: 998000000 },
      });
    });

    it('gets log string', () => {
      const timer = new Timer().start();
      jest.advanceTimersByTime(1000);
      timer.mark('first');
      jest.advanceTimersByTime(999);
      timer.mark('second');
      jest.advanceTimersByTime(998);
      timer.mark('third');
      timer.end();
      expect(timer.log()).toEqual('first= 1s 0ms; second= 999ms; third= 998ms; Total= 2s 997ms');
    });
  });
});
