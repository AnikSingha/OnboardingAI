import { createContext, useEffect, useState } from "react"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState(null)
    const [business, setBusiness] = useState(null)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(false)

    const login = async () => {
        setLoading(true)

        try {
            const response = await fetch("https://api.onboardingai.org/auth/decode-token", {
                method: "GET",
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json()
                const decoded = data.decoded
                
                if (decoded) {
                    setIsAuthenticated(true)
                    setUser(decoded.email)
                    setBusiness(decoded.business_name)
                    setRole(decoded.role)
                } else {
                    console.error("No decoded token found in response")
                    await logout()
                }
            } else {
                console.error("Failed to decode token")
                await logout()
            }
        } catch (error) {
            console.error("Error during token decoding:", error)
            await logout()
        }

        setLoading(false)
    }

    const logout = async () => {
        try {
            const response = await fetch('https://api.onboardingai.org/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
    
            if (!response.ok) {
                throw new Error('Failed to log out. Please try again.');
            }
    
            setIsAuthenticated(false);
            setUser(null);
            setBusiness(null);
            setRole(null);
            setLoading(false);
        } catch (error) {
            console.error('Logout error:', error);
            setLoading(false);
        }
    };
    

    useEffect(() => {
        login()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, business, role, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};