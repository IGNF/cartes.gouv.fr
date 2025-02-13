import { createContext, PropsWithChildren, useContext } from "react";

export interface IDragContext {
    dragIndex: number;
    register: (ref: HTMLElement) => void;
    startDrag: (event: MouseEvent, index: number) => void;
}

const dragContext = createContext<IDragContext | null>(null);

export function DragProvider({ children, value }: PropsWithChildren<{ value: IDragContext }>) {
    return <dragContext.Provider value={value}>{children}</dragContext.Provider>;
}

export function useDragContext() {
    const context = useContext(dragContext);
    if (!context) {
        throw new Error("useDragContext must be used within a DragProvider");
    }
    return context;
}
