import type { ReminderData } from '../components';

let mockReminders: ReminderData[] = [
  {
    id: '1',
    title: 'Morning Insulin',
    frequency: 'Daily',
    days: [],
    startDate: '',
    endDate: '',
    hour: '08',
    minute: '00',
    period: 'AM',
  },
  {
    id: '2',
    title: 'Evening Walk',
    frequency: 'Custom',
    days: ['Mon', 'Wed', 'Fri'],
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    hour: '06',
    minute: '30',
    period: 'PM',
  },
];

export const getReminders = async (): Promise<ReminderData[]> => {
  await new Promise(r => setTimeout(r, 600));
  return [...mockReminders];
};

export const saveReminder = async (data: ReminderData): Promise<ReminderData> => {
  await new Promise(r => setTimeout(r, 600));
  const newReminder = { ...data, id: data.id || Date.now().toString() };
  if (data.id) {
    mockReminders = mockReminders.map(r => r.id === data.id ? newReminder : r);
  } else {
    mockReminders.push(newReminder);
  }
  return newReminder;
};

export const deleteReminder = async (id: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 600));
  mockReminders = mockReminders.filter(r => r.id !== id);
};
