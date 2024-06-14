import moment from 'moment-timezone';

export function getGeneratedHours(day: string, timezone: string) {
  const hoursArray: string[] = [];
  let currentTime = moment.tz(day, timezone).startOf('day');
  const isToday = moment.tz(day, timezone).isSame(moment().tz(timezone), 'day');
  const endTime = isToday ? moment().tz(timezone) : moment.tz(day, timezone).endOf('day');
  while (currentTime <= endTime) {
    hoursArray.push(moment.tz(currentTime, timezone).format('YYYY-MM-DDTHH'));
    currentTime = moment.tz(currentTime, timezone).add(1, 'hour');
  }
  return hoursArray;
}

export function getGeneratedDates(
  startDate: string,
  endDate: string,
  granularity: 'hour' | 'day' | 'week' | 'month',
  timezone: string
) {
  if (granularity === 'hour') return getGeneratedHours(startDate, timezone);
  const dateArray: string[] = [];
  let currentDate = moment.tz(startDate, timezone);
  const stopDate = moment.tz(endDate, timezone);
  const momentGranularity = granularity === 'week' ? 'isoWeek' : granularity;
  while (currentDate <= stopDate) {
    dateArray.push(
      moment.tz(currentDate, timezone).startOf(momentGranularity).format('YYYY-MM-DD')
    );
    currentDate = moment.tz(currentDate, timezone).add(1, granularity);
  }
  return dateArray;
}
