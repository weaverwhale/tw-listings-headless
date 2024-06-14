import moment from 'moment';
import { createCached } from './cache';

export default createCached(moment) as unknown as typeof moment;

export { Moment } from 'moment-timezone';
