describe("tableau de bord professionnel", () => {
    it("tableau de bord professionnel", () => {
        cy.fakeLogin();
        cy.visit("/dashboard");

        cy.get(".fr-header__tools-links > ul.fr-btns-group").children().eq(1).contains("Test User");

        // 2 syntaxes équivalentes d'utiliser d'intercepter les requêtes et utiliser les données fixtures
        cy.fixture("users/me").then((me) => {
            cy.intercept("GET", "/api/user/me", me);
        });

        cy.intercept("GET", "/api/user/me/datastores", { fixture: "users/my_datastores" });
    });
});
