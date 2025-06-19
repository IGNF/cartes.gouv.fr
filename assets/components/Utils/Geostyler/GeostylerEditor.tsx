import { fr } from "@codegouvfr/react-dsfr";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { CodeEditor, GeoStylerContext, GeoStylerContextInterface, Style, locale } from "geostyler";
import { Style as GsStyle, StyleParser } from "geostyler-style";
import { FC } from "react";
import { tss } from "tss-react";

import DsfrAntdConfig from "../../Provider/DsfrAntdConfig";
import { mbParser, qgisParser, sldParser } from "@/utils/geostyler";

const ctx: GeoStylerContextInterface = {
    composition: {
        Renderer: {
            rendererType: "OpenLayers",
        },
        Rule: {
            actionsField: {
                visibility: true,
            },
            duplicateField: {
                visibility: false,
            },
            amountField: {
                visibility: false,
            },
        },
        Style: {
            disableClassification: true,
            disableMultiEdit: true,
        },
    },
    locale: locale.fr_FR,
};

type GeostylerEditorProps = {
    defaultParser?: StyleParser;
    onChange?: (style: GsStyle) => void;
    parsers?: StyleParser[];
    value: GsStyle;
};

const GeostylerEditor: FC<GeostylerEditorProps> = (props) => {
    const { defaultParser = sldParser, onChange, parsers = [sldParser, qgisParser, mbParser], value } = props;
    const { classes } = useStyles();

    return (
        <GeoStylerContext.Provider value={ctx}>
            <DsfrAntdConfig>
                <Tabs
                    label="Editeur de style"
                    tabs={[
                        {
                            label: "Tableau",
                            content: (
                                <div className={fr.cx("fr-grid-row", "fr-my-2w")}>
                                    <div className={fr.cx("fr-col")}>
                                        <Style style={value} onStyleChange={onChange} disableMultiEdit={true} />
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
                                                defaultParser={defaultParser}
                                                showCopyButton={true}
                                                showSaveButton={true}
                                                parsers={parsers}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ),
                        },
                    ]}
                />
            </DsfrAntdConfig>
        </GeoStylerContext.Provider>
    );
};

export default GeostylerEditor;

const useStyles = tss.create(() => ({
    editor: {
        height: "400px",
    },
}));
