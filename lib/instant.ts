import { init } from '@instantdb/react';

// Define the schema for type safety
type Schema = {
  tasks: {
    id: string;
    userId: string;
    title: string;
    isCompleted: boolean;
    sortOrder: number;
    createdAt: number;
    updatedAt: number;
  };
};

// Initialize InstantDB with your App ID
const APP_ID = 'cf0c6e0c-0e33-4fb1-9a36-5c7c59054b3a';

const db = init<Schema>({ appId: APP_ID });

export { db };
