export type attributionRegex = {
  lang: String;
  regex: RegExp;
  shop?: string;
};
const supportedRegex: attributionRegex[] = [
  {
    lang: 'english',
    regex: new RegExp('^(?![Ww]hen|.*long\\sago.*).*(hear(d?)|find out)\\sabout.*$'),
  },
  { lang: 'english2', regex: new RegExp('^.*led you to purchase.*$') },
  { lang: 'english3', regex: new RegExp('^.*platform brought you to.*$') },
  {
    lang: 'spanish',
    regex: new RegExp('^(?![Cc]uando|[Cc]uándo).*[escucha|enteraste].*\\sde\\snosotr.*$'),
  },
  { lang: 'french', regex: new RegExp('^(?![Qq]uand).*entend.*\\sparler\\sde\\snous.*$') },
  { lang: 'deutch', regex: new RegExp('^(?![Ww]ann).*von\\suns\\s.*h[o|ö]?r[en|t].*$') },
  { lang: 'deutch2', regex: new RegExp('^.*[Ww]ie\\s.*auf\\suns\\s.*aufmerksam.*$') },
  { lang: 'deutch3', regex: new RegExp('^.*[Ww]as.*heute.*[Kk]auf\\s.*angeregt.*$') },
  {
    lang: 'hebrew',
    regex: new RegExp(
      '^(?![\u05de][\u05ea][\u05d9]).*[\u05e9ֿֿ][\u05de][\u05e2][\u05ea].*[\u05e2][\u05dc].*$'
    ),
  },
  { lang: 'dutch', regex: new RegExp('^.*geleid.*een\\saankoop.*$') },
  { lang: 'dutch2', regex: new RegExp('^.*[Ww]aar.*van\\sons\\s.*gehoord.*$') },
];

const specificExcludedRegex: attributionRegex[] = [
  {
    lang: 'english',
    regex: new RegExp('^.*(accidental collabs|365 pack).*$'),
    shop: 'trueclassictees-com.myshopify.com',
  },
];

function getShopExcludedRegex(shop: string): RegExp[] {
  return specificExcludedRegex.filter((ser) => ser.shop === shop).map((ser) => ser.regex);
}

export function keyWordsFound(question: string, shop?: string): boolean {
  return (
    supportedRegex.some((sr) => sr.regex.test(question)) &&
    (!shop || !getShopExcludedRegex(shop).some((regex) => regex.test(question)))
  );
}
