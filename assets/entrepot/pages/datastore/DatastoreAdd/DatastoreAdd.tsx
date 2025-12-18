import { fr } from "@codegouvfr/react-dsfr";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { tss } from "tss-react";

import DatastoreMain from "@/components/Layout/DatastoreMain";
import { routes, useRoute } from "@/router/router";
import CreateNewDatastore from "./CreateNewDatastore";
import JoinExistingDatastore from "./JoinExistingDatastore";
import { useTranslation } from "@/i18n";

type DatastoreAddType = "create" | "existing";

export default function DatastoreAdd() {
    const { t } = useTranslation("DatastoreAdd");
    const { classes } = useStyles();

    const route = useRoute();
    const datastoreAddType = (route.params?.["type"] as DatastoreAddType | undefined) ?? "create";

    return (
        <DatastoreMain title={t("title")}>
            <div className={cx(classes.content)}>
                <div className={cx(classes.head)}>
                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col")}>
                            <h1 className={cx(fr.cx("fr-my-4v"), classes?.title)}>{t("title")}</h1>
                        </div>
                    </div>

                    <div className={fr.cx("fr-grid-row")}>
                        <div className={cx(fr.cx("fr-col-12", "fr-py-6v", "fr-py-md-10v"), classes.segmentedControl)}>
                            <SegmentedControl
                                hideLegend={true}
                                segments={[
                                    {
                                        label: t("datastore_add_type", { type: "create" }),
                                        nativeInputProps: {
                                            checked: datastoreAddType === "create",
                                            onChange: () => routes.datastore_add({ type: "create" }).push(),
                                        },
                                    },
                                    {
                                        label: t("datastore_add_type", { type: "existing" }),
                                        nativeInputProps: {
                                            checked: datastoreAddType === "existing",
                                            onChange: () => routes.datastore_add({ type: "existing" }).push(),
                                        },
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {datastoreAddType === "create" ? (
                    <div className={cx(classes.createNew)}>
                        <CreateNewDatastore classes={classes} />
                    </div>
                ) : datastoreAddType === "existing" ? (
                    <div className={cx(classes.joinExisting)}>
                        <JoinExistingDatastore />
                    </div>
                ) : null}
            </div>
        </DatastoreMain>
    );
}

const useStyles = tss.withName({ DatastoreAdd }).create({
    content: {
        // backgroundColor: fr.colors.decisions.background.default.grey.default,
        borderRadius: "0.75rem",
        padding: "2rem 0",

        // display: "flex",
        // flexDirection: "column",
        // alignItems: "center",

        [fr.breakpoints.up("lg")]: {
            padding: "4rem 0",
        },
    },
    head: {
        [fr.breakpoints.up("lg")]: {
            padding: "0 1.5rem",
        },

        [fr.breakpoints.up("xl")]: {
            padding: "0 7.5rem",
        },
    },
    createNew: {
        [fr.breakpoints.up("lg")]: {
            padding: "0 1.5rem",
        },

        [fr.breakpoints.up("xl")]: {
            padding: "0 7.5rem",
        },
    },
    joinExisting: {
        [fr.breakpoints.up("lg")]: {
            padding: "0 1.5rem",
        },
    },
    title: {
        textAlign: "center",
    },
    segmentedControl: {
        textAlign: "center",
        width: "100%",

        "& .fr-segmented": {
            width: "100%",

            "& .fr-segmented__elements": {
                width: "100%",

                "& .fr-segmented__element": {
                    flex: 1,

                    "& label": {
                        justifyContent: "center",
                    },
                },
            },
        },
    },
    // eslint-disable-next-line tss-unused-classes/unused-classes
    form: {
        display: "flex",
        flexDirection: "column",
    },
});
