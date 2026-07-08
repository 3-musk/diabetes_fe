// Care Plan API service
import { lifestyleAnswers } from "../constants/mockDb";

import { apiClient } from "../utils/apiClient";

export type CarePlanStatus = 'active' | 'pending' | null;

export type CarePlanTask = {
  id?: string;
  name?: string;
  type?: string;
  isCompleted?: boolean;
};

export type CarePlanSession = {
  session: string;
  tasks: CarePlanTask[];
};

export type CarePlan = {
  date: string;
  hasPlan: boolean;
  sessions: CarePlanSession[];
};

export type CarePlanQuestionOption = {
  key: string;
  value: string;
};

export type CarePlanQuestion = {
  id: string;
  question: string;
  options: CarePlanQuestionOption[];
  selectionMode: 'SINGLE' | 'MULTI';
};

export type ProfileCompletion = {
  isComplete: boolean;
  missingFields: string[]; // e.g. ['BMI', 'weight']
};

export type LifestyleQuestionsStatus = {
  answered: boolean;
  totalAnswered: number;
  totalQuestions: number;
};

// ─── API stubs (replace with real HTTP calls) ─────────────────────────────────

export let mockCarePlanGenerated = false;
export const markCarePlanGenerated = () => { mockCarePlanGenerated = true; };

export let mockProfileComplete = false;
export const markProfileComplete = () => { mockProfileComplete = true; };

/** Fetch the user's care plan. Returns null if none exists. */
export const getCarePlan = async (accessToken?: string): Promise<CarePlan | null> => {
  try {
    const headers = accessToken ? { authorization: `Bearer ${accessToken}` } : undefined;
    const response = await apiClient.get('/api/care-plan/daily', { headers });
    if (response.data && response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch care plan:", error);
  }
  return null;
};

export const getProfileCompletion = async (token: string): Promise<ProfileCompletion> => {
  await new Promise(r => setTimeout(r, 800));
  return {
    isComplete: mockProfileComplete,
    missingFields: mockProfileComplete ? [] : ['BMI'],
  };
};



export const submitLifestyleAnswers = async (token: string, answers: Record<string, string | string[]>) => {
  try {
    const response = await apiClient.post('/api/care-plan/lifestyle-answers', { answers }, {
      headers: { authorization: `Bearer ${token}` }
    });
    if (response.data && response.data.success) {
      return { success: true };
    }
  } catch (error) {
    console.error("Failed to submit lifestyle answers:", error);
  }
  return { success: false };
};

/** Check whether lifestyle questions have been answered */
export const getLifestyleQuestionsStatus = async (
  accessToken: string,
): Promise<LifestyleQuestionsStatus> => {
  await new Promise(r => setTimeout(r, 400));

  const totalQuestions = 5;
  const answeredCount = Object.keys(lifestyleAnswers).length;

  return {
    answered: answeredCount >= totalQuestions,
    totalAnswered: answeredCount,
    totalQuestions: totalQuestions,
  };
};

/** Fetch lifestyle questions from API */
export const getLifestyleQuestions = async (
  accessToken: string,
): Promise<CarePlanQuestion[]> => {
  try {
    const response = await apiClient.get('/api/care-plan/lifestyle', {
      headers: { authorization: `Bearer ${accessToken}` }
    });
    if (response.data && response.data.success && response.data.data.questionnaire) {
      return response.data.data.questionnaire.questions || [];
    }
  } catch (error) {
    console.error("Failed to fetch lifestyle questions:", error);
  }
  return [];
};
