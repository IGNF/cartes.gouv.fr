import { Dispatch, FC, PropsWithChildren, createContext, useState } from "react";

type UserType = object;

type UserContextType = {
    user: UserType | null | undefined;
    setUser: Dispatch<UserType>;
};

export const UserContext = createContext<null | UserContextType>(null);

export const UserContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const userFromTwig = (document.getElementById("user") as HTMLDivElement).dataset?.user ?? null;
    const [user, setUser] = useState<UserType>(userFromTwig === null ? null : JSON.parse(userFromTwig));

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
