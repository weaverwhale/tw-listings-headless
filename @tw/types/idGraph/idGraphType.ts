export type idSource = {
  source: string;
  receivedAt: string;
};

export type idValue = {
  value: string;
  sources: idSource[];
};

export type idGraphType = {
  _id?: string;
  shop: string;
  tripleIds?: idValue[];
  thids?: idValue[];
  emails?: idValue[];
  phones?: idValue[];
  customerIds?: idValue[];
  klaviyoIds?: idValue[];
  postscriptIds?: idValue[];
  attentiveIds?: idValue[];
  gid?: string;
  createdAt?: string;
};

export type IdGraphEmails = {
  _id?: string;
  value?: string;
  sources?: idSource[];
};
export type IdGraphEmail = {
  shop: string;
  email?: string;
};

export type ResolvedIdValue = {
  key: string;
  id: string;
};
