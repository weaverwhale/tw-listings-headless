import { Language } from '@tw/types';
import { tripleSurveyQuestionTranslation } from '@tw/constants/module/PostPurchaseSurvey/translations';

export function detectLanguage(defaultQuestion: string): Language {
  for (const [language, translation] of Object.entries(tripleSurveyQuestionTranslation)) {
    if (translation === defaultQuestion) {
      return language as Language;
    }
  }
}
