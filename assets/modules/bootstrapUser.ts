import { CartesUser } from "@/@types/app";

export function readBootstrapUser(): CartesUser | null {
    const userElement = document.getElementById("user") as HTMLDivElement | null;
    const rawUser = userElement?.dataset?.user;

    try {
        if (!rawUser) return null;
        return JSON.parse(rawUser) as CartesUser;
    } catch {
        return null;
    }
}
