import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { ReactNode } from "react";

import classes from "./FeatureCard.module.css";

type FeatureCardProps = {
    illustration?: string;
    illustrationPosition?: "left" | "right";
    picto?: string;
    title: string;
    desc: ReactNode;
    footer?: ReactNode;
};
export default function FeatureCard({ illustration, illustrationPosition = "left", picto, title, desc, footer }: FeatureCardProps) {
    return (
        <div
            className={cx(classes.container, {
                [classes.illustrationRight]: illustrationPosition === "right",
                [classes.noIllustration]: !illustration,
            })}
        >
            {illustration && <img src={illustration} alt="" className={classes.illustration} />}

            <div className={classes.body}>
                {picto && <img src={picto} alt="" className={classes.picto} />}
                <div className={classes.content}>
                    <h3 className={classes.title}>{title}</h3>
                    <p className={classes.desc}>{desc}</p>
                </div>
                <div className={classes.footer}>{footer}</div>
            </div>
        </div>
    );
}
