import { Client, Account, Databases } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject('682c40ae000db6f1788d');           // Your project ID

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases }; 