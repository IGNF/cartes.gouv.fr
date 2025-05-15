import { AttributeDTO, ThemeDTO } from "../../../../../@types/espaceco";
import { normalizeTheme } from "./ThemeUtils";

export default class ThemesHelper {
    static addTheme(themes: ThemeDTO[], theme: ThemeDTO): ThemeDTO[] {
        return [...themes, ...[theme]];
    }

    static updateTheme(name: string, newTheme: Partial<ThemeDTO>, themes: ThemeDTO[]): ThemeDTO[] {
        const tm = [...themes];
        return tm.map((t) => (name === t.theme ? normalizeTheme({ ...t, ...newTheme }) : t));
    }

    static removeTheme(name: string, themes: ThemeDTO[]): ThemeDTO[] {
        return themes.filter((a) => a.theme !== name);
    }

    static addAttribute(theme: string, attribute: AttributeDTO, themes: ThemeDTO[]): ThemeDTO[] {
        return Array.from(themes, (t) => {
            if (t.theme === theme) {
                const attr = [...t.attributes];
                attr.push(attribute);
                return { ...t, attributes: attr };
            }
            return t;
        });
    }

    static updateAttribute(theme: string, attribute: string, newAttribute: AttributeDTO, themes: ThemeDTO[]): ThemeDTO[] {
        return Array.from(themes, (t) => {
            if (t.theme === theme) {
                const newAttributes = Array.from(t.attributes, (a) => {
                    if (a.name === attribute) {
                        return newAttribute;
                    }
                    return a;
                });
                t.attributes = newAttributes;
            }
            return t;
        });
    }

    static removeAttribute(theme: string, attribute: string, themes: ThemeDTO[]): ThemeDTO[] {
        return Array.from(themes, (t) => {
            if (t.theme === theme) {
                const attr = t.attributes.filter((a) => a.name !== attribute);
                return { ...t, attributes: attr };
            }
            return t;
        });
    }
}
