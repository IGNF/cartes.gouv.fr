import { describe, expect, it } from "vitest";

import { DatasheetDocumentTypeEnum } from "@/@types/app";
import { buildDocumentFormData, buildDocumentFormSchema, type DocumentFormMode, type DocumentFormValues } from "./documentFormSchema";

// la clé sert de message : les tests vérifient quel message est posé, pas sa traduction
const t = ((key: string) => key) as Parameters<typeof buildDocumentFormSchema>[0];

const addFile: DocumentFormMode = { type: DatasheetDocumentTypeEnum.File, editing: false };
const editFile: DocumentFormMode = { type: DatasheetDocumentTypeEnum.File, editing: true };
const addLink: DocumentFormMode = { type: DatasheetDocumentTypeEnum.Link, editing: false };

const fileList = (name: string, size = 10): FileList => {
    const file = new File(["x"], name);
    Object.defineProperty(file, "size", { value: size });
    return { 0: file, length: 1, item: () => file } as unknown as FileList;
};

// champs absents du formulaire : valeurs par défaut de useForm
const form = (values: Partial<DocumentFormValues>): DocumentFormValues => ({ name: "", url: "", file: undefined, ...values });

const issueMessages = (values: Partial<DocumentFormValues>, mode: DocumentFormMode) => {
    const result = buildDocumentFormSchema(t, mode).safeParse(form(values));
    const messages: Record<string, string> = {};
    for (const issue of result.error?.issues ?? []) {
        messages[issue.path.join(".")] ??= issue.message;
    }
    return messages;
};

describe("buildDocumentFormSchema", () => {
    it("exige un nom non vide", () => {
        expect(issueMessages({ name: "  ", url: "https://example.test/" }, addLink)).toEqual({ name: "validation.name.required" });
    });

    it("n’accepte que les liens http et https", () => {
        expect(issueMessages({ name: "Site", url: "javascript:alert(1)" }, addLink)).toEqual({ url: "validation.url.invalid" });
        expect(issueMessages({ name: "Site", url: "" }, addLink)).toEqual({ url: "validation.url.required" });
        expect(issueMessages({ name: "Site", url: "https://example.test/" }, addLink)).toEqual({});
    });

    it("exige un fichier à l’ajout seulement", () => {
        expect(issueMessages({ name: "Rapport" }, addFile)).toEqual({ file: "validation.file.required" });
        expect(issueMessages({ name: "Rapport" }, editFile)).toEqual({});
    });

    it("refuse une extension ou une taille hors limites", () => {
        expect(issueMessages({ name: "Rapport", file: fileList("page.html") }, addFile)).toEqual({ file: "validation.file.extension" });
        expect(issueMessages({ name: "Rapport", file: fileList("rapport.PDF", 6 * 1024 * 1024) }, addFile)).toEqual({ file: "validation.file.size" });
        expect(issueMessages({ name: "Rapport", file: fileList("projet.qgz") }, addFile)).toEqual({});
    });
});

describe("buildDocumentFormData", () => {
    it("envoie le type à l’ajout et pas à la modification", () => {
        expect(buildDocumentFormData(form({ name: "Site", url: "https://example.test/" }), addLink).get("type")).toBe("link");
        expect(buildDocumentFormData(form({ name: "Rapport" }), editFile).has("type")).toBe(false);
    });

    it("n’envoie le fichier que s’il est choisi", () => {
        expect(buildDocumentFormData(form({ name: "Rapport" }), editFile).has("file")).toBe(false);
        expect(buildDocumentFormData(form({ name: "Rapport", file: fileList("rapport.pdf") }), addFile).get("file")).toBeInstanceOf(File);
    });
});
