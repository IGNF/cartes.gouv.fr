import { fr } from "@codegouvfr/react-dsfr";
import { memo, useId } from "react";
import { symToStr } from "tsafe/symToStr";

import { languagesDisplayNames, languages, type Language } from "../../i18n/i18n";

type Props = {
    lang: Language;
    setLang: (lang: Language) => void;
};

const LanguageSelector = memo((props: Props) => {
    const { lang, setLang } = props;

    const langSelectId = useId();

    return (
        <nav
            role="navigation"
            className={fr.cx("fr-translate", "fr-nav")}
            style={{
                display: "inline-flex",
            }}
        >
            <div className="fr-nav__item">
                <button
                    className="fr-translate__btn fr-btn fr-btn--tertiary"
                    aria-controls={langSelectId}
                    aria-expanded="false"
                    title="Sélectionner une langue"
                >
                    {lang.toUpperCase()}
                    <span className="fr-hidden-lg">&nbsp;-&nbsp;{languagesDisplayNames[lang.toLowerCase()]}</span>
                </button>
                <div className={fr.cx("fr-collapse", "fr-translate__menu", "fr-menu")} id={langSelectId}>
                    <ul className={fr.cx("fr-menu__list")}>
                        {languages.map((lang_i) => (
                            <li key={lang_i}>
                                <a
                                    className={fr.cx("fr-translate__language", "fr-nav__link")}
                                    href="#"
                                    hrefLang={lang_i}
                                    lang={lang_i}
                                    aria-current={lang_i === lang ? "true" : undefined}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setLang(lang_i);
                                    }}
                                >
                                    {lang_i}&nbsp;-&nbsp;{languagesDisplayNames[lang_i]}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
});

LanguageSelector.displayName = symToStr({ LanguageSelector });

export default LanguageSelector;
