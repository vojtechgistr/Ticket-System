import {tokenStorageKey} from "./config.ts";
import axios, {AxiosResponse} from "axios";

export type loginRequest = {
    email: string,
    password: string,
};

export type registerRequest = {
    displayName: string,
    email: string,
    password: string,
    confirmPassword: string,
};

export class AuthenticationService {
    public static login(credentials: loginRequest, abortController?: AbortController): Promise<AxiosResponse> {
        const response = axios.post("user/login", credentials, {
            signal: abortController?.signal,
        });
        
        response.then(res => {
            if (res.status == 200) {
                AuthenticationService.setToken(res.data.content);
            }
        });

        return response;
    }

    public static register(credentials: registerRequest, abortController?: AbortController): Promise<AxiosResponse> {
        const response = axios.post("user/register", credentials, {
            signal: abortController?.signal,
        });
        
        response.then(res => {
            if (res.status == 200) {
                AuthenticationService.setToken(res.data.content);
            }
        });
        
        return response;
    }

    public static logout(): void {
        if (AuthenticationService.isLoggedIn()) {
            AuthenticationService.deleteToken();
        }
    }

    public static getCurrentUser(abortController?: AbortController) {
        return axios.get("user/current", {
            signal: abortController?.signal,
        });
    }
    
    public static isLoggedIn(): boolean {
        const token: string | null = AuthenticationService.getToken();
        return token != null && token.length > 0;
    }
    
    public static setToken(data: string): void {
        localStorage.setItem(tokenStorageKey, data);
    }
    
    private static deleteToken(): void {
        localStorage.removeItem(tokenStorageKey);
    }
    
    public static getToken(): string | null {
        return localStorage.getItem(tokenStorageKey);
    }
}