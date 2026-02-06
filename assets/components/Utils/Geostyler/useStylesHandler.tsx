import { type Style as GsStyle, ReadStyleResult, StyleParser, WriteStyleResult } from "geostyler-style";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { StyleFormatEnum } from "@/@types/app";

type UseStylesHandlerProps = {
    parser: StyleParser;
    format: StyleFormatEnum;
    initialStrStyle: string | undefined;
    setError: (error: string | undefined) => void;
};
type UseStylesHandlerReturn = {
    gsStyle: GsStyle | undefined;
    setGsStyle: Dispatch<SetStateAction<GsStyle | undefined>>;
    strStyle?: string | undefined;
    readStyleResult?: ReadStyleResult | undefined;
    setReadStyleResult: Dispatch<SetStateAction<ReadStyleResult | undefined>>;
    writeStyleResult?: WriteStyleResult | undefined;
    setWriteStyleResult: Dispatch<SetStateAction<WriteStyleResult | undefined>>;
};
export default function useStylesHandler(props: UseStylesHandlerProps): UseStylesHandlerReturn {
    const { parser, format, initialStrStyle, setError } = props;

    const [gsStyle, setGsStyle] = useState<GsStyle | undefined>(undefined);
    const [strStyle, setStrStyle] = useState<string | undefined>(undefined);

    const [readStyleResult, setReadStyleResult] = useState<ReadStyleResult | undefined>(undefined);
    const [writeStyleResult, setWriteStyleResult] = useState<WriteStyleResult | undefined>(undefined);

    const setErrorRef = useRef(setError);
    const lastInitStrRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        setErrorRef.current = setError;
    }, [setError]);

    useEffect(() => {
        const init = async () => {
            // éviter de parser à nouveau si la chaîne entrante n'a pas changé
            if (initialStrStyle === lastInitStrRef.current) return;

            // Si la valeur du parent est égale au style sérialisé actuel, ne rien faire
            if (initialStrStyle && strStyle && initialStrStyle === strStyle) {
                lastInitStrRef.current = initialStrStyle;
                return;
            }

            if (!initialStrStyle) {
                // effacer le style si aucune valeur n'est fournie pour la couche sélectionnée
                lastInitStrRef.current = undefined;
                setGsStyle(undefined);
                return;
            }
            try {
                const input = format === StyleFormatEnum.Mapbox ? JSON.parse(initialStrStyle) : initialStrStyle;
                const readResult = await parser.readStyle(input);
                setReadStyleResult(readResult);
                if (readResult.output) {
                    setGsStyle(readResult.output as GsStyle);
                }
                lastInitStrRef.current = initialStrStyle;
            } catch (e) {
                console.error("Erreur lors du chargement du style :", e);
                setErrorRef.current("Erreur lors du chargement du style : " + (e as Error).message);
            }
        };

        init();
    }, [initialStrStyle, strStyle, format, parser]);

    // mettre à jour strStyle quand gsStyle change
    useEffect(() => {
        if (gsStyle) {
            parser
                .writeStyle(gsStyle)
                .then((result) => {
                    if (result.errors && result.errors.length > 0) {
                        console.error(result.errors);
                        throw new Error(result.errors[0].message ?? "Erreur lors de l'écriture du style");
                    }
                    const content = typeof result.output === "object" ? JSON.stringify(result.output) : (result.output as string);
                    setStrStyle(content);
                })
                .catch((e) => {
                    console.error("Erreur lors de l'écriture du style :", e);
                    setErrorRef.current("Erreur lors de l'écriture du style : " + (e as Error).message);
                });
        } else {
            setStrStyle(undefined);
        }
    }, [gsStyle, parser]);

    return {
        gsStyle,
        setGsStyle,
        strStyle,
        readStyleResult,
        setReadStyleResult,
        writeStyleResult,
        setWriteStyleResult,
    };
}
