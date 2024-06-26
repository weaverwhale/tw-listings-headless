type Language = 'en' | 'fr' | 'es' | 'de' | 'it' | 'da' | 'sv' | 'nn' | 'he' | 'nl' | 'pt';

export enum TranslationKey {
  ATTRIBUTION_QUESTION = 'attribution-question',
  OTHER = 'other',
  FRIEND = 'friend',
  TEXT = 'text',
  EMAIL = 'email',
  SUBMIT = 'submit-message',
  THANK_YOU_MESSAGE = 'thank-you-message',
  OTHER_PLACEHOLDER = 'other-placeholder',
}

export const tripleSurveyQuestionTranslation: Record<Language, string> = {
  en: 'Which of the following led you to purchase today?',
  fr: "Qu'est-ce qui vous a amené à acheter aujourd'hui?",
  es: '¿Qué te llevó a comprar hoy?',
  de: 'Was hat dich heute zum Kauf bewegt?',
  he: '?מה הביא אותך לקנות היום',
  sv: 'Vad fick dig att köpa idag?',
  nn: 'Hva fikk deg til å kjøpe i dag?',
  da: 'Hvad fik dig til at købe i dag?',
  it: 'Qual è stato il motivo che ti ha spinto a comprare oggi?',
  nl: 'Welk kanaal heeft ervoor gezorgd dat je vandaag een aankoop bij ons hebt gedaan?',
  pt: 'Qual das seguintes opções levou você a comprar hoje?',
};

export const tripleSurveyOptionsTranslation: Record<TranslationKey, Record<Language, string>> = {
  [TranslationKey.ATTRIBUTION_QUESTION]: tripleSurveyQuestionTranslation,
  [TranslationKey.FRIEND]: {
    en: 'Referred by a friend',
    fr: 'Recommandé par un ami',
    es: 'Recomendado por un amigo',
    de: 'Empfohlen von einem Freund',
    he: 'הופניתי על ידי חבר',
    it: 'Raccomandato da un amico',
    sv: 'Rekommenderad av en vän',
    nn: 'Anbefalt av ein venn',
    da: 'Anbefalet af en ven',
    nl: 'Doorverwezen door een vriend',
    pt: 'Indicado por um amigo',
  },
  [TranslationKey.TEXT]: {
    en: 'Text',
    fr: 'SMS',
    es: 'SMS',
    de: 'SMS',
    he: 'SMS',
    it: 'SMS',
    sv: 'SMS',
    nn: 'SMS',
    da: 'SMS',
    nl: 'SMS',
    pt: 'SMS',
  },
  [TranslationKey.OTHER]: {
    en: 'None of the above',
    fr: 'Autre',
    es: 'Ninguno de los anteriores',
    de: 'Keines der oben genannten',
    he: 'אחר',
    it: 'Nessuno dei precedenti',
    sv: 'Ingen av ovanstående',
    nn: 'Ingen av dei over',
    da: 'Ingen af ovenstående',
    nl: 'Geen van de bovengenoemde',
    pt: 'Nenhuma das opções acima',
  },
  [TranslationKey.THANK_YOU_MESSAGE]: {
    en: "Thank you. Your response has been recorded.",
    fr: "Merci. Votre réponse a été enregistrée.",
    es: "Gracias. Su respuesta ha sido registrada.",
    de: "Vielen Dank. Ihre Antwort wurde aufgezeichnet.",
    he: "תודה. תגובתך נשמרה.",
    it: "Grazie. La tua risposta è stata registrata.",
    sv: "Tack. Ditt svar har registrerats.",
    da: "Tak. Dit svar er blevet registreret.",
    nn: "Takk. Svar ditt er registrert.",
    pt: "Obrigado. Sua resposta foi registrada.",
    nl: "Bedankt. We hebben je antwoord ontvangen.",
  },
  [TranslationKey.SUBMIT]: {
    en: "Submit",
    fr: "Envoyer",
    es: "Enviar",
    de: "Einreichen",
    he: "שלח",
    it: "Invia",
    sv: "Skicka",
    da: "Indsend",
    nn: "Send",
    pt: "Enviar",
    nl: "Versturen",
  },
  [TranslationKey.OTHER_PLACEHOLDER]: {
    en: "Please provide us with more information...",
    fr: "Pouvez-vous nous fournir plus d'informations?",
    es: "Por favor, proporcione más información...",
    de: "Bitte geben Sie uns mehr Informationen...",
    he: "נשמח אם תשתף אותנו...",
    it: "Per favore, forniscici maggiori informazioni...",
    sv: "Fyll i mer information...",
    da: "Udfyld venligst med mere information...",
    nn: "Vennligst fyll ut mer informasjon...",
    pt: "Por favor, forneça-nos mais informações...",
    nl: "Graag meer informatie verstrekken...",
  },
  [TranslationKey.EMAIL]: {
    en: "Email",
    fr: "Email",
    es: "Email",
    de: "Email",
    he: "Email",
    it: "Email",
    sv: "Email",
    da: "Email",
    nn: "Email",
    pt: "Email",
    nl: "Email",
  }
};
