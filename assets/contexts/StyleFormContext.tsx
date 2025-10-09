import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useEffect, useState } from "react";

import { OfferingTypeEnum, Service, StyleFormatEnum } from "@/@types/app";

export interface StyleFormContext {
    editMode: boolean;

    service?: Service;
    isTms?: boolean;

    isMapbox?: boolean;
    setIsMapbox?: Dispatch<SetStateAction<boolean>>;

    /** la table dont le style est en cours d'édition */
    currentTable?: string;
    setCurrentTable: Dispatch<SetStateAction<string | undefined>>;

    styleFormats: Record<string, StyleFormatEnum>;
    setFormat: (layer: string, format: StyleFormatEnum) => void;
}

export const StyleFormContext = createContext<StyleFormContext | null>(null);

export function useStyleForm() {
    const context = useContext(StyleFormContext);
    if (!context) {
        throw new Error("useStyleForm must be used within a StyleFormProvider");
    }
    return context as Required<StyleFormContext>;
}

interface StyleFormProviderProps {
    editMode: boolean;

    service?: Service;
    serviceType?: OfferingTypeEnum;
    defaultTable?: string;

    isMapbox: boolean;
    setIsMapbox?: Dispatch<SetStateAction<boolean>>;

    styleFormats: Record<string, StyleFormatEnum>;
    setStyleFormats: Dispatch<SetStateAction<Record<string, StyleFormatEnum>>>;
}

export function StyleFormProvider(props: PropsWithChildren<StyleFormProviderProps>) {
    const {
        children,

        editMode,
        defaultTable,
        service,
        serviceType,
        isMapbox,
        setIsMapbox,
        styleFormats,
        setStyleFormats,
    } = props;

    const [currentTable, setCurrentTable] = useState(defaultTable);

    useEffect(() => {
        if (defaultTable) {
            setCurrentTable(defaultTable);
        }
    }, [defaultTable]);

    const isTms = serviceType === OfferingTypeEnum.WMTSTMS;

    const setFormat = (layer: string, format: StyleFormatEnum) => {
        setStyleFormats((prev) => ({ ...prev, [layer]: format }));
    };

    return (
        <StyleFormContext.Provider
            value={{
                editMode,
                service,
                isTms,
                isMapbox,
                setIsMapbox,

                currentTable,
                setCurrentTable,

                styleFormats,
                setFormat,
            }}
        >
            {children}
        </StyleFormContext.Provider>
    );
}
