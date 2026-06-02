import { createContext, PropsWithChildren, use } from "react";

export interface IDragContext {
    dragIndex: number;
    register: (ref: HTMLElement) => void;
    startDrag: (event: MouseEvent, index: number) => void;
}

const DragContext = createContext<IDragContext | null>(null);

export function DragProvider({ children, value }: PropsWithChildren<{ value: IDragContext }>) {
    return <DragContext value={value}>{children}</DragContext>;
}

export function useDragContext() {
    const context = use(DragContext);
    if (!context) {
        throw new Error("useDragContext must be used within a DragProvider");
    }
    return context;
}
