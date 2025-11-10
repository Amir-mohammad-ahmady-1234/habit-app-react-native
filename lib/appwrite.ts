import { Account, Client } from "react-native-appwrite";

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME!)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!);

export const account = new Account(client);
