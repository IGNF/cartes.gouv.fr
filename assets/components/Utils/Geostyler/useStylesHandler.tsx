import { type Style as GsStyle, StyleParser } from "geostyler-style";
import { useCallback, useEffect, useRef, useState } from "react";

import { StyleFormatEnum } from "@/@types/app";

type UseStylesHandlerProps = {
    parser: StyleParser;
    format: StyleFormatEnum;
    initialStrStyle: string | undefined;
    setError: (error: string | undefined) => void;
};
type UseStylesHandlerReturn = {
    gsStyle: GsStyle | undefined;
    setGsStyle: (style: GsStyle | undefined) => void;
    strStyle?: string | undefined;
};
export default function useStylesHandler(props: UseStylesHandlerProps): UseStylesHandlerReturn {
    const { parser, format, initialStrStyle, setError } = props;

    const [gsStyle, setGsStyle] = useState<GsStyle | undefined>(undefined);
    const [writtenStrStyle, setWrittenStrStyle] = useState<string | undefined>(undefined);
    const strStyle = gsStyle ? writtenStrStyle : undefined;

    // sans style, oublier la dernière sérialisation pour ne pas la renvoyer au style suivant
    const updateGsStyle = useCallback((style: GsStyle | undefined) => {
        setGsStyle(style);
        if (!style) setWrittenStrStyle(undefined);
    }, []);

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
                updateGsStyle(undefined);
                return;
            }
            try {
                const input: unknown = format === StyleFormatEnum.Mapbox ? JSON.parse(initialStrStyle) : initialStrStyle;
                const readResult = await parser.readStyle(input);
                if (readResult.output) {
                    setGsStyle(readResult.output as GsStyle);
                }
                lastInitStrRef.current = initialStrStyle;
            } catch (e) {
                console.error("Erreur lors du chargement du style :", e);
                setErrorRef.current("Erreur lors du chargement du style : " + (e as Error).message);
            }
        };

        void init();
    }, [initialStrStyle, strStyle, format, parser, updateGsStyle]);

    // mettre à jour strStyle quand gsStyle change
    useEffect(() => {
        if (!gsStyle) return;

        let cancelled = false;
        parser
            .writeStyle(gsStyle)
            .then((result) => {
                if (result.errors && result.errors.length > 0) {
                    console.error(result.errors);
                    throw new Error(result.errors[0].message ?? "Erreur lors de l'écriture du style");
                }
                const content = typeof result.output === "object" ? JSON.stringify(result.output) : (result.output as string);
                if (!cancelled) setWrittenStrStyle(content);
            })
            .catch((e) => {
                console.error("Erreur lors de l'écriture du style :", e);
                setErrorRef.current("Erreur lors de l'écriture du style : " + (e as Error).message);
            });

        return () => {
            cancelled = true;
        };
    }, [gsStyle, parser]);

    return {
        gsStyle,
        setGsStyle: updateGsStyle,
        strStyle,
    };
}
