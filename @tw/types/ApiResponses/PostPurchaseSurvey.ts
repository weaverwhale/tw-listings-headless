export type Language = 'en' | 'fr' | 'es' | 'de' | 'he' | 'nn' | 'da' | 'sv' | 'it' | 'nl' | 'pt';

export interface PostPurchaseSurveyQuestionConfig {
  question: {
    questionId?: number;
    text: string;
    type: 'single_option';
    createdAt?: string;
    order: number;
    status: 'default' | 'active' | 'disabled' | 'deleted';
  };
  options: {
    optionId?: number;
    label: string;
    value: string;
    status: 'active' | 'deleted' | 'hidden';
    order: number;
    updatedAt?: string;
  }[];
  segments: string[];
}

export interface PostPurchaseSurveyConfigResponse {
  language: Language;
  config: PostPurchaseSurveyQuestionConfig[];
}

export interface SurveyQuestion {
  surveyQuestionId: number;
  questionId: number;
  text: string;
  updatedAt: string;
  type: 'single_option';
  order: number;
  status: 'default' | 'active' | 'disabled' | 'deleted';
  segments: string[];
}

export interface SurveyQuestionsResponse {
  surveyId: number;
  updatedAt: string;
  questions: SurveyQuestion[];
}
