import { fr } from "@codegouvfr/react-dsfr";
import { FC, memo } from "react";

import "../../sass/components/spinner.scss";

type LoadingIconProps = {
    className?: string;
    largeIcon?: boolean;
};
const LoadingIcon: FC<LoadingIconProps> = ({ className = "", largeIcon = false }) => {
    return <span className={fr.cx("fr-icon-refresh-line", largeIcon && "fr-icon--lg") + " frx-icon-spin " + className} />;
};

export default memo(LoadingIcon);
