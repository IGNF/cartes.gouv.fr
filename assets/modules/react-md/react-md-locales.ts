const ReactMDShortcuts = {
    bold: "ctrl + b",
    italic: "ctrl + i",
    strikethrough: "ctrl + shift + x",
    hr: "ctrl + h",
    link: "ctrl + l",
    quote: "ctrl + q",
    code: "ctrl + j",
    codeBlock: "ctrl + shift + j",
    comment: "ctrl + /",
    image: "ctrl + k",
    unorderedListCommand: "ctrl + shift + u",
    orderedListCommand: "ctrl + shift + o",
    checkedListCommand: "ctrl + shift + c",
};

const ReactMDLocales = {
    fr: {
        bold: {
            title: "Ajouter du texte en gras",
        },
        italic: {
            title: "Ajouter du texte en italique",
        },
        strikethrough: {
            title: "Ajouter du texte barré",
        },
        hr: {
            title: "Ajouter une barre horizontale",
        },
        title: {
            title: "Insérer un titre",
        },
        link: {
            title: "Ajouter un lien",
        },
        quote: {
            title: "Insérer une quote",
        },
        code: {
            title: "Insérer du code",
        },
        codeBlock: {
            title: "Insérer un bloc de code",
        },
        comment: {
            title: "Insérer un commentaire",
        },
        image: {
            title: "Ajouter une image",
        },
        unorderedListCommand: {
            title: "Ajouter une liste non ordonnée",
        },
        orderedListCommand: {
            title: "Ajouter une liste ordonnée",
        },
        checkedListCommand: {
            title: "Ajouter une liste de choix",
        },
    },
};

export { ReactMDShortcuts, ReactMDLocales };
