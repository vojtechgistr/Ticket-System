import {createContext} from "react";

export type UserContextType = {
    displayName?: string,
    tag?: string,
    email?: string,
    roles?: string[],
    createdAt?: {
        timestamp: number,
        date: Date,
    },
    avatarUrl?: string,
    bannerColor: string,
}

const UserContext = createContext<UserContextType | null>(null);

export default UserContext;