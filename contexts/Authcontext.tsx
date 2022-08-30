import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { createContext, ReactNode, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import Router from 'next/router'
import { api } from '../services/apiClient';
import { channel } from 'diagnostics_channel';


const toastClosed = 1500; // Tempo em ms para fechar toast
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
    signIn: (credentials: SiggnInCredentials) => Promise<void>;
    signOut: () => void;
    user: User | undefined;
    isAuthenticated: boolean;
};

type AuthProviderProps = {
    children: ReactNode;
};

export const Authcontext = createContext({} as AuthcontextData)

let authChannel: BroadcastChannel

export function signOut() {

    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')

    toast.info('Logged out successfully', { autoClose: toastClosed })

    authChannel.postMessage('signOut')
    Router.push('/')

}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>();
    const isAuthenticated = !!user;

    useEffect(() => {
        authChannel = new BroadcastChannel('auth')

        authChannel.onmessage = (message) => {
            switch (message.data) {
                case "signOut":
                    Router.push('/');
                    break;
                case "signIn":
                    Router.push('/dashboard');
                    break;
                default:
                    break;
            }
        }
    }, [])

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

            toast.success('Successfully signed in', { autoClose: toastClosed })

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard')
            
            authChannel.postMessage('signIn')

        } catch (err: any) {

            toast.error(err.response.data.message, { autoClose: toastClosed })
        }
    }
    return (
        <Authcontext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
            {children}
        </Authcontext.Provider >
    )
}