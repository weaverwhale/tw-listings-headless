import { ServicesIds } from '../services';

export type QuestionType = 'select' | 'multiSelect' | 'freeText';

export type Response = Record<
  string,
  {
    id: string;
    label: string;
    answers: number;
    serviceId?: ServicesIds;
    color?: string;
    percentOfResponses?: number;
    aov: number; // average order value?
    revenue: number;
    currency: string;
  }
>;

export type Survey = {
  id: string;
  questions: number;
  answers: number;
  views: number;
};

export type Question = {
  id: string;
  surveyId: string;
  shopId: string;
  questionType: QuestionType;
  createdAt: string;
  updatedAt: string;
  views: number;
  responses: number;
  responsesData: Response;
};

export type QuestionConfig = {
  question: {
    id: number;
    text: string;
    type: 'single_option';
    created_at: string;
  };
  options: Array<{
    id: number;
    label: string;
    value: string;
    status: 'active' | 'deleted';
    created_at: string;
  }>;
};

export type Answer = {
  id: string;
  shopId: string;
  orderId: string;
  answerDate: string;
  questionType: QuestionType;
  questionId: string;
  answer: string;
};

export type View = {
  id: string;
  shopId: string;
  orderId: string;
  viewDate: string;
  questionType: QuestionType;
  questionId: string;
};
