import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { FC, memo } from "react";

import "../../sass/components/spinner.scss";

type LoadingIconProps = {
    className?: string;
    largeIcon?: boolean;
};
const LoadingIcon: FC<LoadingIconProps> = ({ className = "", largeIcon = false }) => {
    return <span className={cx(fr.cx("fr-icon-refresh-line", largeIcon && "fr-icon--lg"), "frx-icon-spin", className)} />;
};

export default memo(LoadingIcon);
