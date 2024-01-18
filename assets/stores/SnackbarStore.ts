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

interface SnackbarStore {
    messageUuid?: string | null;
    message?: string | null;
    setMessage: (newMessage: string) => void;
    clearMessage: () => void;
}
export const useSnackbarStore = create<SnackbarStore>()((set) => ({
    message: null,
    messageUuid: null,
    setMessage: (newMessage) =>
        set(() => ({
            message: newMessage,
            messageUuid: uuidv4(),
        })),
    clearMessage: () =>
        set(() => ({
            message: null,
            messageUuid: null,
        })),
}));
