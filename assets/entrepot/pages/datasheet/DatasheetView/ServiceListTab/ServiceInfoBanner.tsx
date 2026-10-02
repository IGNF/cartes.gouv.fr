import Notice from "@codegouvfr/react-dsfr/Notice";
import { useStyles } from "tss-react";

type ServiceInfoBannerProps = {
    title: string;
    linkHref?: string;
};

export default function ServiceInfoBanner({ title, linkHref }: ServiceInfoBannerProps) {
    const { css } = useStyles();

    return (
        <Notice
            className={css({ borderRadius: 4 })}
            severity="info"
            title={title}
            link={
                linkHref !== undefined
                    ? {
                          text: "En savoir plus",
                          linkProps: { href: linkHref },
                      }
                    : undefined
            }
        />
    );
}
