import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

// NOTE : première tentative avec un système où plusieurs messages pourraient être empilés, mais MUI recommande de n'avoir qu'un message à la fois. Je laisse ce bout de code là si jamais on veut quand-même avoir plusieurs messages.
// interface SnackbarStore {
//     messages: string[];
//     pushMessage: (newMessage: string) => void;
// }
// export const useSnackbarStore = create<SnackbarStore>()((set, get) => ({
//     messages: [],
//     pushMessage: (newMessage) => {
//         const newMessagesList = [...get().messages, newMessage];
//         if (newMessagesList.length > 3) {
//             newMessagesList.shift();
//         }

//         return set(() => ({
//             messages: newMessagesList,
//         }));
//     },
// }));

interface IMessage {
    id: string;
    title: string;
    description?: string;
    severity?: "info" | "success" | "warning" | "error";
}

interface SnackbarStore {
    message: IMessage | null;
    setMessage: (title: string, description?: string, severity?: "info" | "success" | "warning" | "error") => void;
    clearMessage: () => void;
}
export const useSnackbarStore = create<SnackbarStore>()((set) => ({
    message: null,
    setMessage: (title, description, severity) =>
        set(() => ({
            message: {
                id: uuidv4(),
                title,
                description,
                severity,
            },
        })),
    clearMessage: () => set(() => ({ message: null })),
}));
