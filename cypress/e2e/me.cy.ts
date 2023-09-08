describe("la page mon compte", () => {
    it("contient comme titre du site", () => {
        cy.fakeLogin();
        cy.visit("/mon-compte");
        cy.get(".fr-header__service > a").contains("cartes.gouv.fr");

        cy.fixture("/users/me").then((user) => {
            cy.get("#main > .fr-container ").children().eq(1).contains(`Prénom : ${user.firstName}`);
            cy.get("#main > .fr-container ").children().eq(2).contains(`Nom : ${user.lastName}`);
            cy.get("#main > .fr-container ").children().eq(3).contains(`Email : ${user.email}`);
            cy.get("#main > .fr-container ").children().eq(5).contains(`Identifiant technique : ${user.id}`);
        });
    });
});
