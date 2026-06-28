import { Task, DateReminder } from '../types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Call family and check in',
    description: 'You haven\'t called home in days. Go make them smile.',
    category: 'critical',
    priority: 'high',
    status: 'todo',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString().split('T')[0], // Today
    effort: '15 mins',
    auntieRoast: 'If you can scroll social media for 4 hours, you can call your family for 15 minutes! Stop ignoring the people who love you.'
  },
  {
    id: 'task-2',
    title: 'Finish studying for the coding interview',
    description: 'Review system design, algorithms, and databases.',
    category: 'sharma_ji',
    priority: 'high',
    status: 'todo',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0], // Tomorrow
    effort: '3 hours',
    auntieRoast: 'Your high-achieving cousin already launched a startup during their lunch break. Put down that bubble tea and start studying!'
  },
  {
    id: 'task-3',
    title: 'Clean the mountain of clothes on the chair',
    description: 'Put them in the wardrobe or the laundry basket.',
    category: 'hygiene',
    priority: 'medium',
    status: 'todo',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().split('T')[0], // Day after
    effort: '20 mins',
    auntieRoast: 'That chair is not a wardrobe, sweetheart! Soon that pile of clothes will stand up and start asking you for rent.'
  },
  {
    id: 'task-4',
    title: 'Water the plants and hydrate yourself',
    description: 'Drink a glass of water and look after your plants.',
    category: 'hygiene',
    priority: 'low',
    status: 'completed',
    dueDate: new Date().toISOString().split('T')[0], // Today
    effort: '10 mins',
    auntieRoast: 'Very nice! At least the plants are hydrated. See? You can be responsible when you want to be!'
  }
];

export const INITIAL_REMINDERS: DateReminder[] = [
  {
    id: 'rem-1',
    title: 'Mom\'s Birthday',
    date: 'June 29',
    type: 'birthday',
    auntieRoast: 'Mark it in bold red! If you forget this year, there will be no inheritance. No excuses.'
  },
  {
    id: 'rem-2',
    title: 'Cousin\'s Ivy League Graduation',
    date: 'July 05',
    type: 'important',
    auntieRoast: 'We must send congratulations. Look at them... graduating with honors while you are still deciding which Netflix show to watch next.'
  },
  {
    id: 'rem-3',
    title: 'Dentist Appointment',
    date: 'July 12',
    type: 'important',
    auntieRoast: 'Go get those teeth checked. All that sugar you consume to cope with your self-induced stress will catch up to you!'
  }
];

export const AUNTIE_AVATARS = {
  pleased: '👵🏽✨',
  scolding: '👵🏽🔥',
  cooking: '👵🏽☕'
};

export const AUNTIE_QUICK_ADVICES = [
  "Darling, scrolling is cheap, but focus is priceless. Drink a glass of water and get to work!",
  "Procrastinating today is like drinking salt water to satisfy thirst. Stop doing it!",
  "Your cousin finished their master's degree and taught yoga to shelter puppies today. What are you doing?",
  "A warm cup of hot tea will solve 90% of your fatigue. The other 10% is solved by closing TikTok.",
  "Good lord, if you ignore this list any longer, it will submit its resignation letter to me!",
  "Do not stress, child. Life is long, but deadlines are short. Work slowly, but work continuously."
];
