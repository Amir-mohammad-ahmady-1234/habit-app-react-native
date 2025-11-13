import { createContext, useContext } from "react";
import { ID } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  //   user: Models.User<Models.Preferences> | null;
  singUp: (email: string, password: string) => Promise<string | null>;
  singIn: (email: string, password: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const singUp = async (email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password);
      await singIn(email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return "An error occurd during singup";
    }
  };

  const singIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return "An error occurd during sing in";
    }
  };

  return (
    <AuthContext.Provider value={{ singUp, singIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const authContext = useContext(AuthContext);

  if (authContext === undefined) {
    throw new Error("authContext must be use in authProvider");
  }

  return authContext;
};
