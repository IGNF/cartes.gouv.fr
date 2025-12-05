import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import MuiSkeleton from "@mui/material/Skeleton";
import { FC } from "react";

type SkeletonProps = {
    count: number;
    rectangleHeight?: number;
};
const Skeleton: FC<SkeletonProps> = ({ count, rectangleHeight = 50 }) => {
    return (
        <MuiDsfrThemeProvider>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-my-4v")}>
                {[...Array(count).keys()].map((n) => (
                    <div key={n} className={fr.cx("fr-col-12")}>
                        <MuiSkeleton key={n} variant="rectangular" height={rectangleHeight} />
                    </div>
                ))}
            </div>
        </MuiDsfrThemeProvider>
    );
};

export default Skeleton;
