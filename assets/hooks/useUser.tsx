import { useContext } from "react";
import { UserContext, type UserContextType } from "../contexts/UserContext";

const useUser = (): UserContextType => {
    const userContext = useContext(UserContext);
    if (!userContext) {
        throw new Error("useUserContext must be used within the UserContextProvider. UserContextProvider must wrap all the components that use useUserContext");
    }
    return userContext;
};
export default useUser;
