import { fr } from "@codegouvfr/react-dsfr";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { CodeEditor, GeoStylerContext, GeoStylerContextInterface, Style, locale } from "geostyler";
import { Style as GsStyle, StyleParser } from "geostyler-style";
import { FC, memo, useState } from "react";
import { tss } from "tss-react";

import DsfrAntdConfig from "@/components/Provider/DsfrAntdConfig";
import { mbParser, qgisParser, sldParser } from "@/utils/geostyler";

import "geostyler/dist/index.css";

import "@/sass/components/geostyler.css";

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
            nameField: {
                visibility: false,
            },
            disableClassification: true,
            disableMultiEdit: true,
        },
    },
    locale: {
        ...locale.fr_FR,
        CodeEditor: {
            ...locale.fr_FR.CodeEditor,
            copyButtonLabel: "Copier",
            downloadButtonLabel: "Exporter",
        },
    },
};

type GeostylerEditorProps = {
    defaultParser?: StyleParser;
    onChange?: (style: GsStyle) => void;
    parsers?: StyleParser[];
    value: GsStyle;
};

type ViewMode = "table" | "code";

const GeostylerEditor: FC<GeostylerEditorProps> = (props) => {
    const { defaultParser = sldParser, onChange, parsers = [sldParser, qgisParser, mbParser], value } = props;
    const { classes } = useStyles();

    const [view, setView] = useState<ViewMode>("table");

    return (
        <GeoStylerContext.Provider value={ctx}>
            <DsfrAntdConfig>
                <SegmentedControl
                    legend={"Editeur de style"}
                    hideLegend={true}
                    segments={[
                        {
                            label: "Tableau",
                            iconId: "ri-table-line",
                            nativeInputProps: {
                                checked: view === "table",
                                onChange: () => setView("table"),
                            },
                        },
                        {
                            label: "Code",
                            iconId: "ri-code-line",
                            nativeInputProps: {
                                checked: view === "code",
                                onChange: () => setView("code"),
                            },
                        },
                    ]}
                />
                {view === "table" ? (
                    <div className={fr.cx("fr-grid-row", "fr-my-2w")}>
                        <div className={fr.cx("fr-col")}>
                            <Style style={value} onStyleChange={onChange} disableMultiEdit={true} />
                        </div>
                    </div>
                ) : view === "code" ? (
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
                ) : null}
            </DsfrAntdConfig>
        </GeoStylerContext.Provider>
    );
};

export default memo(GeostylerEditor);

const useStyles = tss.create(() => ({
    editor: {
        height: "600px",
    },
}));
