import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  singUp: (email: string, password: string) => Promise<string | null>;
  singIn: (email: string, password: string) => Promise<string | null>;
  isUserLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch {
      setUser(null);
    } finally {
      setIsUserLoading(false);
    }
  };

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
    <AuthContext.Provider value={{ singUp, singIn, user, isUserLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must use in the authProvider");
  }

  return context;
};
