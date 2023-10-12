import { TestContext } from "yup";

import functions from "../functions";

const test = (value: FileList, ctx: TestContext) => {
    // TODO VOIR AVEC ARNEST
    // if (value instanceof FileList && value.length === 0) {
    //     return ctx.createError({ message: "Veuillez fournir un fichier de métadonnées" });
    // }
    const file = value?.[0] ?? undefined;

    if (file instanceof File) {
        if (functions.path.getFileExtension(file.name)?.toLowerCase() !== "xml") {
            return ctx.createError({
                message: `L'extension du fichier de métadonnées ${file.name} n'est pas correcte. Seule l'extension xml est acceptée.`,
            });
        }

        /*
            TODO : valider le fichier de métadonnées
            Points d'attention :
            contrairement à ce qu'indiqué dans le swagger, le type doit être placé dans le body et non dans la requête
            un parsing XML doit être effectué pour extraire : 	
            le file_identifier : gmd:MD_Metadata / gmd:fileIdentifier / gco:CharacterString
            le level: md:MD_Metadata / gmd:hierarchyLevel / gmd:MD_ScopeCode : dataset ou serie

            Règles métiers :
            si type n'est pas spécifié, ISOAP est mis par défaut
            le fileIdentifier doit être trouvé dans le XML sinon erreur 400
            le fileIdentifier ne doit pas être identique à celui d'une métadonnée déjà existante sur la plateforme, sinon erreur 409
            le level trouvé dans le XML doit être dataset ou series, ou ne pas être trouvé, sinon erreur 400. Si level n'est pas trouvé, on met DATASET par défaut
            la liste des endpoint doit être vide après le POST (pas de publication)
            Uniquement une fois toutes les validations effectuées, le fichier est enregistré sur le S3. sur celui-ci, il est nommé selon son id, avec en préfixe de path "/metadata/"
         */
    } else {
        return ctx.createError({ message: "Le fichier de style de métadonnées est invalide" });
    }
    return true;
};

const metadata = { test };

export default metadata;
