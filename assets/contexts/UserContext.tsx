import { Dispatch, FC, PropsWithChildren, createContext, useState } from "react";

import { CommunityMemberDto } from "../types/entrepot";

/** déclaration du type `User`, à tenir à jour avec le User de symfony */
export type UserType = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    communitiesMember: CommunityMemberDto[];
    accountCreationDate: string;
    lastApiCallDate: string;
};

/** déclaration du type de la valeur du contexte `UserContext` */
export type UserContextType = {
    user?: UserType;

    /** le setter d'un useState */
    setUser: Dispatch<UserType>;
};

/**
 * initialisation du contexte `UserContext`
 *
 * voir le hook useUser pour l'utilisation de ce contexte
 */
export const UserContext = createContext<UserContextType>({
    user: undefined,
    setUser: () => {},
});

/** le Provider du contexte `UserContext` */
export const UserContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const userFromTwig = (document.getElementById("user") as HTMLDivElement)?.dataset?.user ?? null;
    const [user, setUser] = useState<UserType>(userFromTwig === null ? null : JSON.parse(userFromTwig));

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
