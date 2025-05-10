import { createContext, useContext, useState, useEffect } from "react";
import checkAuth from "@/app/actions/checkAuth";

const AuthContext = createContext();


// think of it as a component that wraps other components
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const checkAuthentication = async() => {
            const { isAuthenticated, user } = await checkAuth();
            setIsAuthenticated(isAuthenticated)
            setCurrentUser(user)
        }

        checkAuthentication()
    }, [])

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated,
            currentUser,
            setCurrentUser
        }}>
            { children }
        </AuthContext.Provider>
    )
}

// we are using a custom hook that
// we can use in other components to access the authcontext
export  const useAuth = () => {
    const context = useContext(AuthContext)
    if(!context){
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context;
};