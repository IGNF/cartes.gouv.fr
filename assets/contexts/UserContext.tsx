import PropTypes from "prop-types";
import { Dispatch, createContext, useState } from "react";

type UserType = object;

type UserContextType = {
    user: UserType | null | undefined;
    setUser: Dispatch<UserType>;
};

export const UserContext = createContext<null | UserContextType>(null);

const UserContextProvider = ({ children }) => {
    const userFromTwig = (document.getElementById("user") as HTMLDivElement).dataset?.user ?? null;
    const [user, setUser] = useState(userFromTwig === null ? null : JSON.parse(userFromTwig));

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

UserContextProvider.propTypes = {
    children: PropTypes.node,
};

export { UserContextProvider };
