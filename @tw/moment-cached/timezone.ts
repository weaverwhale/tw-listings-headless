import moment from 'moment-timezone';
import { createCached } from './cache';

export default createCached(moment) as unknown as typeof moment;

export { Moment } from 'moment-timezone';
