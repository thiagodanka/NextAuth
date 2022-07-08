import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'


let cookies = parseCookies();

let isRefreshing = false;

let failedRequestsQueue: { onSuccess: (token: string) => void; onFailure: (err: AxiosError<unknown, any>) => void; }[] = [];

export const api = axios.create({
    baseURL: 'http://localhost:3333',
});

api.defaults.headers.common['Authorization'] = `Bearer ${cookies['nextauth.token']}`

api.interceptors.response.use(response => {
    return response
}, (error) => {
    if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {

            cookies = parseCookies();

            const { 'nextauth.token': refreshToken } = cookies;

            const originalConfig = error.config

            if (!isRefreshing) {
                isRefreshing = true;

                api.post('/refresh', {
                    refreshToken,
                }).then(response => {
                    const { token } = response.data.token;

                    setCookie(undefined, 'nextauth.token', token, {
                        maxAge: 60 * 60 * 24 * 30,
                        path: '/'
                    })
                    setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
                        maxAge: 60 * 60 * 24 * 30,
                        path: '/'
                    })
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    failedRequestsQueue.forEach(request => request.onSuccess(token))
                    failedRequestsQueue = [];
                }).catch(error => {
                    failedRequestsQueue.forEach(request => request.onSuccess(error))
                    failedRequestsQueue = [];
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

        }

    }
})