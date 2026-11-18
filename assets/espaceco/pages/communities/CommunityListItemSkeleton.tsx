import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import MuiSkeleton from "@mui/material/Skeleton";
import { FC } from "react";
import { tss } from "tss-react";

// même grille que CommunityList : une carte horizontale small par ligne
const CommunityListItemSkeleton: FC<{ count: number }> = ({ count }) => {
    const { classes } = useStyles();

    return (
        <MuiDsfrThemeProvider>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                {[...Array(count).keys()].map((n) => (
                    <div key={n} className={fr.cx("fr-col-12")}>
                        <div className={classes.card}>
                            <MuiSkeleton variant="rectangular" className={classes.image} />
                            <div className={classes.body}>
                                <MuiSkeleton variant="text" width="40%" height={32} />
                                <MuiSkeleton variant="text" />
                                <MuiSkeleton variant="text" width="80%" />
                                <MuiSkeleton variant="rectangular" width={160} height={32} className={fr.cx("fr-mt-2v")} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </MuiDsfrThemeProvider>
    );
};

export default CommunityListItemSkeleton;

const useStyles = tss.create(() => ({
    card: {
        display: "flex",
        border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    },
    image: {
        flex: "0 0 33%",
        height: "auto",
        minHeight: "8rem",
    },
    body: {
        flex: 1,
        padding: fr.spacing("4v"),
    },
}));
