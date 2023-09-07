describe("la page d'accueil", () => {
    it("contient comme titre du site", () => {
        cy.visit("/");
        cy.get(".fr-header__service > a").contains("cartes.gouv.fr");
    });

    it("contient lien vers le Géoportail", () => {
        cy.visit("/");
        cy.get(".fr-header__tools-links > ul.fr-btns-group")
            .children()
            .first()
            .children("a")
            .should("have.attr", "href", "https://geoportail.gouv.fr/carte")
            .contains("Accéder au Géoportail");
    });

    context("utilisateur non-connecté", () => {
        it("contient bouton `se connecter`", () => {
            cy.visit("/");
            cy.get(".fr-header__tools-links > ul.fr-btns-group").children().last().contains("Se connecter");
        });
    });

    context("utilisateur connecté", () => {
        it("contient bouton `mon compte` et `se déconnecter`", () => {
            cy.fakeLogin();
            cy.visit("/login");

            cy.get(".fr-header__tools-links > ul.fr-btns-group").children().eq(1).contains("Test User");
            cy.get(".fr-header__tools-links > ul.fr-btns-group").children().last().contains("Se déconnecter");
        });
    });
});
