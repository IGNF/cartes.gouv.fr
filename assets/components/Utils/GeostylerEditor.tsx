import { fr } from "@codegouvfr/react-dsfr";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { CodeEditor, GeoStylerContext, GeoStylerContextInterface, Style, locale } from "geostyler";
import SldStyleParser from "geostyler-sld-parser";
import { Style as GsStyle } from "geostyler-style";
import { FC } from "react";
import { tss } from "tss-react";

// import DsfrAntdConfig from "../Provider/DsfrAntdConfig";

export const sld100Parser = new SldStyleParser({
    builderOptions: {
        format: true,
    },
    sldVersion: "1.0.0",
});
sld100Parser.title = "SLD 1.0.0";

const ctx: GeoStylerContextInterface = {
    composition: {
        Renderer: {
            rendererType: "OpenLayers",
        },
    },
    locale: locale.fr_FR,
};

type GeostylerEditorProps = {
    onChange?: (style: GsStyle) => void;
    value: GsStyle;
};

const GeostylerEditor: FC<GeostylerEditorProps> = (props) => {
    const { onChange, value } = props;
    const { classes } = useStyles();

    return (
        <GeoStylerContext.Provider value={ctx}>
            <Tabs
                label="Editeur de style"
                tabs={[
                    {
                        label: "Tableau",
                        content: (
                            <div className={fr.cx("fr-grid-row", "fr-my-2w")}>
                                <div className={fr.cx("fr-col")}>
                                    <Style style={value} onStyleChange={onChange} />
                                </div>
                            </div>
                        ),
                    },
                    {
                        label: "Editeur de code",
                        content: (
                            <div className={fr.cx("fr-grid-row", "fr-my-2w")}>
                                <div className={fr.cx("fr-col")}>
                                    <div className={classes.editor}>
                                        <CodeEditor
                                            style={value}
                                            onStyleChange={onChange}
                                            defaultParser={sld100Parser}
                                            showCopyButton={true}
                                            showSaveButton={true}
                                            parsers={[sld100Parser]}
                                        />
                                    </div>
                                </div>
                            </div>
                        ),
                    },
                ]}
            />
        </GeoStylerContext.Provider>
    );
};

export default GeostylerEditor;

const useStyles = tss.create(() => ({
    editor: {
        height: "400px",
    },
}));
