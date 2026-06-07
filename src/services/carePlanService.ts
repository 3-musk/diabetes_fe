// Care Plan API service

export type CarePlanStatus = 'active' | 'pending' | null;

export type CarePlan = {
  id: string;
  status: CarePlanStatus;
  questions?: CarePlanQuestion[];
  currentQuestionIndex?: number;
};

export type CarePlanQuestion = {
  id: string;
  question: string;
  options: string[];
  type: 'single' | 'multiple';
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
export const getCarePlan = async (accessToken: string): Promise<CarePlan | null> => {
  await new Promise(r => setTimeout(r, 800));

  // TODO: GET /api/care-plan
  // return actual care plan data from API
  return null;
};

export const getProfileCompletion = async (token: string): Promise<ProfileCompletion> => {
  await new Promise(r => setTimeout(r, 800));
  return {
    isComplete: true, // we set to true for now so we can test the other flows, or false if testing popup
    missingFields: [],
  };
};


export const submitLifestyleAnswers = async (token: string, answers: Record<string, string[]>) => {
  await new Promise(r => setTimeout(r, 800));
  return { success: true };
};

/** Check whether lifestyle questions have been answered */
export const getLifestyleQuestionsStatus = async (
  accessToken: string,
): Promise<LifestyleQuestionsStatus> => {
  await new Promise(r => setTimeout(r, 400));

  // TODO: GET /api/lifestyle-questions/status
  return {
    answered: false,
    totalAnswered: 0,
    totalQuestions: 10,
  };
};

/** Sample lifestyle questions (replace with API data) */
export const getLifestyleQuestions = async (
  accessToken: string,
): Promise<CarePlanQuestion[]> => {
  await new Promise(r => setTimeout(r, 600));

  // TODO: GET /api/lifestyle-questions
  return [
    {
      id: 'q1',
      question: 'Which carbohydrate foods do you eat most often?',
      options: ['White rice', 'Brown Rice/ Whole grains', 'White roti (chapati)', 'Whole wheat bread', 'Potatoes'],
      type: 'single',
    },
    {
      id: 'q2',
      question: 'How often do you eat meals outside home (restaurants, takeaway)?',
      options: ['Rarely (less than once/week)', '1–2 times per week', '3–4 times per week', 'Almost daily'],
      type: 'single',
    },
    {
      id: 'q3',
      question: 'How often do you engage in moderate physical activity per week?',
      options: ['Never', '1–2 days', '3–4 days', '5 or more days'],
      type: 'single',
    },
    {
      id: 'q4',
      question: 'Do you smoke or use tobacco products?',
      options: ['No, never', 'Yes, currently', 'Previously but quit'],
      type: 'single',
    },
    {
      id: 'q5',
      question: 'How many hours of sleep do you get on average?',
      options: ['Less than 5 hours', '5–6 hours', '7–8 hours', 'More than 8 hours'],
      type: 'single',
    },
  ];
};
