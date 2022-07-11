import Router from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react"
import { api } from "../services/apiClient";
import { parseCookies, setCookie, destroyCookie } from 'nookies'

export type User = {
    email: string;
    permissions: string[];
    roles: string[];

}

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    user: any;
    signIn(credentials: SignInCredentials): Promise<void>;
    isAuthenticated: boolean;

};

type AuthProviderProps = {
    children: ReactNode;
}

export function signOut() {
    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')

    Router.push('/')
}


export const AuthContext = createContext({} as AuthContextData)


export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>();
    const isAuthenticated = !!user;
    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies()

        if (token) {
            api.get('/me')
                .then(response => {
                    const { email, permissions, roles } = response?.data;

                    setUser({ email, permissions, roles })
                })
                .catch(() => {
                    signOut()
                })
        }
    }, [])

    async function signIn({ email, password }: SignInCredentials) {
        try {

            const response = await api.post('/sessions', {
                email,
                password
            })

            const { token, refreshToken, permissions, roles } = response.data

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            })
            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            })

            setUser({
                email,
                permissions,
                roles
            })

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard')
        } catch (error) {
            console.log(error);
        }

    }
    return (
        <AuthContext.Provider value={{ isAuthenticated, signIn, user }}>
            {children}
        </AuthContext.Provider>
    )
}