export type ChatSender = 'user' | 'bot';

export type ChatMessage = {
  id: string;
  text: string;
  sender: ChatSender;
};

export const chatTexts = {
  pageTitle: 'Chat',
  inputPlaceholder: 'Type your message...',
  initialMessages: [
    {
      id: '1',
      text: 'My BP is 150/95. Is it high?',
      sender: 'user',
    },
    {
      id: '2',
      text: 'Yes, it is slightly high. Please monitor regularly and consult your doctor if it stays elevated.',
      sender: 'bot',
    },
    {
      id: '3',
      text: 'What should I do if BP is high now?',
      sender: 'user',
    },
    {
      id: '4',
      text: 'Sit calmly, avoid stress, drink water, and recheck after 10-15 minutes.',
      sender: 'bot',
    },
  ] satisfies ChatMessage[],
};
