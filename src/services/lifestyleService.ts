import { lifestyleQuestionsList, lifestyleAnswers } from "../constants/mockDb";

export const getAllLifestyleQuestions = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { data: lifestyleQuestionsList };
};

export const getLifestyleAnswers = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: lifestyleAnswers };
};

export const saveLifestyleAnswer = async (id: string, answer: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  lifestyleAnswers[id] = answer;
  return { success: true };
};
