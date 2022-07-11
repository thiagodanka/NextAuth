import axios, { AxiosError } from 'axios'
import { GetServerSidePropsContext } from 'next';
import Router from 'next/router';
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { signOut } from '../context/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';


type Context = undefined | GetServerSidePropsContext;

let isRefreshing = false;

let failedRequestsQueue: { onSuccess: (token: string) => void; onFailure: (err: AxiosError<unknown, any>) => void; }[] = [];

export function setupAPIClient(ctx: Context = undefined) {
    let cookies = parseCookies(ctx);

    const api = axios.create({
        baseURL: 'http://localhost:3333',
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${cookies['nextauth.token']}`

    api.interceptors.response.use(response => {
        return response
    }, (error) => {
        if (error.response.status === 401) {
            if (error.response?.data?.code === 'token.expired') {

                cookies = parseCookies(ctx);

                const { 'nextauth.refreshToken': refreshToken } = cookies;

                const originalConfig = error.config

                if (!isRefreshing) {
                    isRefreshing = true;

                    api.post('/refresh', {
                        refreshToken,
                    }).then(response => {
                        const { token } = response.data;

                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30,
                            path: '/'
                        })
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30,
                            path: '/'
                        })
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                        failedRequestsQueue.forEach(request => request.onSuccess(token))
                        failedRequestsQueue = [];
                    }).catch(error => {
                        failedRequestsQueue.forEach(request => request.onFailure(error))
                        failedRequestsQueue = [];

                        if (process.browser) {
                            signOut()
                        } else {
                            return Promise.reject(new AuthTokenError())
                        }

                    }).finally(() => {
                        isRefreshing = false;
                    });
                }

                return new Promise((resolve, rejects) => {
                    failedRequestsQueue.push({
                        onSuccess: (token: string) => {
                            originalConfig.headers!['Authorization'] = `Bearer ${token}`;

                            resolve(api(originalConfig))
                        },
                        onFailure: (err: AxiosError) => {
                            rejects(err)
                        }
                    })
                })
            } else {
                signOut();
            }
        }
        return Promise.reject(error);
    })
    return api;
}