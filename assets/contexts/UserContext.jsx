import PropTypes from "prop-types";
import React, { createContext, useState } from "react";

export const UserContext = createContext({
    user: null,
    setUser: () => {},
});

const UserContextProvider = ({ children }) => {
    const userFromTwig = document.getElementById("user").dataset?.user ?? null;
    const [user, setUser] = useState(userFromTwig == null ? null : JSON.parse(userFromTwig));

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

UserContextProvider.propTypes = {
    children: PropTypes.node,
};

export { UserContextProvider };
