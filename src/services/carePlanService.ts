// Care Plan API service
import { apiClient } from "../utils/apiClient";

export type CarePlanStatus = 'active' | 'pending' | null;

export type CarePlanTask = {
  id?: string;
  name?: string;
  type?: string;
  isCompleted?: boolean;
  category?: string;
  description?: string;
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



/** Fetch the user's care plan. Returns null if none exists. */
export const getCarePlan = async (accessToken?: string, date?: string): Promise<CarePlan | null> => {
  try {
    const headers = accessToken ? { authorization: `Bearer ${accessToken}` } : undefined;
    const dateParam = date || new Date().toISOString().split('T')[0];
    const response = await apiClient.get(`/api/care-plan/daily?date=${dateParam}`, { headers });
    if (response.data && response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch care plan:", error);
  }
  return null;
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



/** Fetch lifestyle questions from API */
export const getLifestyleQuestions = async (
  accessToken: string,
): Promise<{ questions: CarePlanQuestion[], existingAnswers: Record<string, string | string[]> }> => {
  try {
    const response = await apiClient.get('/api/care-plan/lifestyle', {
      headers: { authorization: `Bearer ${accessToken}` }
    });
    if (response.data && response.data.success && response.data.data) {
      const { questionnaire, lifestyleAnswers } = response.data.data;
      return {
        questions: questionnaire?.questions || [],
        existingAnswers: lifestyleAnswers?.answers || {}
      };
    }
  } catch (error) {
    console.error("Failed to fetch lifestyle questions:", error);
  }
  return { questions: [], existingAnswers: {} };
};
