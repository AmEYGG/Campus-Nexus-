import { Client, Account, Databases } from 'appwrite';

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // Provided endpoint
    .setProject('682cc0270011c6268663'); // Provided project ID

// Initialize Appwrite Services
export const account = new Account(client);
export const databases = new Databases(client);

export { client }; 