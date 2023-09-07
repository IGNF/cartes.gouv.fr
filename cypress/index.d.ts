declare namespace Cypress {
    interface Chainable {
        fakeLogin(): Chainable;
        fakeLogout(): Chainable;
    }
}
