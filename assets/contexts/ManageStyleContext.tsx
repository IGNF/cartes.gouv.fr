import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from "react";

import { StyleForm } from "@/entrepot/pages/service/view/Style/StyleAddModifyForm";
import { MapInitial } from "@/components/Utils/RMap";

export interface IManageStyleContext {
    initialValues?: MapInitial;
    setInitialValues: Dispatch<SetStateAction<MapInitial | undefined>>;

    styleToAddOrEdit?: StyleForm;
    setStyleToAddOrEdit: Dispatch<SetStateAction<StyleForm | undefined>>;

    styleToRemove?: string;
    setStyleToRemove: Dispatch<SetStateAction<string | undefined>>;
}

export const ManageStyleContext = createContext<IManageStyleContext | null>(null);

export function useManageStyle() {
    const context = useContext(ManageStyleContext);
    if (!context) {
        throw new Error("useManageStyle must be used within a ManageStyleProvider");
    }
    return context as Required<IManageStyleContext>;
}

interface IManageStyleProviderProps {}

export function ManageStyleProvider(props: PropsWithChildren<IManageStyleProviderProps>) {
    const { children } = props;

    const [initialValues, setInitialValues] = useState<MapInitial>();
    const [styleToAddOrEdit, setStyleToAddOrEdit] = useState<StyleForm>();
    const [styleToRemove, setStyleToRemove] = useState<string>();

    const context = useMemo(
        () => ({
            initialValues,
            setInitialValues,
            styleToAddOrEdit,
            setStyleToAddOrEdit,
            styleToRemove,
            setStyleToRemove,
        }),
        [initialValues, styleToAddOrEdit, styleToRemove]
    );

    return <ManageStyleContext.Provider value={context}>{children}</ManageStyleContext.Provider>;
}
