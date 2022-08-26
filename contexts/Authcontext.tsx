import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { createContext, ReactNode, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import Router from 'next/router'
import { api } from '../services/apiClient';



type User = {
    email: string;
    permissions: string[];
    roles: string[];
};

type SiggnInCredentials = {
    email: string;
    password: string;
};

type AuthcontextData = {
    signIn(credentials: SiggnInCredentials): Promise<void>;
    user: User | undefined;
    isAuthenticated: boolean;
};

type AuthProviderProps = {
    children: ReactNode;
};

export const Authcontext = createContext({} as AuthcontextData)

export function signOut() {

    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')

    Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>();

    const isAuthenticated = !!user;

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies()

        if (token) {
            api.get('/me')
                .then(response => {
                    const { email, permissions, roles } = response.data

                    setUser({ email, permissions, roles })
                })
                .catch(() => {

                    signOut();
                });
        }
    }, [])


    async function signIn({ email, password }: SiggnInCredentials) {

        try {
            const response = await api.post('sessions', {
                email,
                password
            })

            const { token, refreshToken, permissions, roles } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            });

            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            });


            setUser({
                email,
                permissions,
                roles
            })

            toast.success('Successfully signed in')

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard')
        } catch (err: any) {

            toast.error(err.response.data.message)
        }
    }
    return (
        <Authcontext.Provider value={{ signIn, isAuthenticated, user }}>
            {children}
        </Authcontext.Provider >
    )
}