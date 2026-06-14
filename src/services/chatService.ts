import type { ChatMessage } from '../constants/chat';

const MOCK_RESPONSES = [
  'Thanks for sharing. Based on general guidance, keep tracking your readings and follow your care plan.',
  'That is worth monitoring. Please stay hydrated and recheck after some rest.',
  'For personalized advice, consult your doctor. I can help you track trends in the meantime.',
  'A balanced meal and light activity after eating may help stabilize glucose levels.',
  'If symptoms persist or worsen, seek medical attention promptly.',
  'Your logs look helpful. Consistency with medication and meals makes a big difference.',
  'Try noting what you ate and your activity level around that reading for better context.',
  'Stress can affect readings. A few minutes of calm breathing may help before rechecking.',
  'Great question. Keep your readings in the app so your care team can review patterns.',
  'Remember to take medications as prescribed and avoid skipping meals.',
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const pickRandomResponse = () =>
  MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

export const sendChatMessage = async (_message: string): Promise<ChatMessage> => {
  await delay(500 + Math.random() * 700);

  return {
    id: `${Date.now()}-bot`,
    text: pickRandomResponse(),
    sender: 'bot',
  };
};
