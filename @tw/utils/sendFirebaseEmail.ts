import { firestore } from 'firebase-admin';
import { isStaging } from '@tw/constants';

export type Attachment = {
  filname: string;
  content: string;
  path?: string;
  href?: string;
  httpHeaders?: any;
  contentType?: string;
  contentDisposition: string;
  cid?: string;
  encoding?: string;
  headers?: any;
};

export type SendFirebaseEmailData = {
  to: string | string[];
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  toUids?: string[]; // recipient Uids
  ccUids?: string[];
  bccUids?: string[];
  message: {
    subject: string;
    html?: string;
    text?: string;
    amp?: string;
    messageId?: string;
    attachments?: Attachment[];
  };
  headers?: any;
};

export async function sendFirebaseEmail(data: SendFirebaseEmailData, extraData: any = {}) {
  data.from = data.from || `TripleWhale${isStaging ? ' Staging' : ''} <noreply@triplewhale.com>`;
  return await firestore()
    .collection('email')
    .add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
      ...extraData,
    });
}
