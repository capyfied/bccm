// https://docs.cypress.io/api/table-of-contents

describe('Explorer', () => {
  it('loads imported crafts correctly', () => {
    cy.visit('/');
    cy.contains('BC Crafts Manager');
    cy.window().its('navigator.clipboard').then(clip => {
      // Import net as single craft
      clip.writeText('N4IgkgLgpgtiBcIByUIgDQgAoCcD2ADlDhAJ4IgDKUAxgK45QYgAyeNA1hc0gIYxNEAQQAEAZ1oMoIgHapmAEShiaOAJYEIavDO6YAwngA2eHBQDEQgOzXr6SzcfNcagG69oCCDjpRMAFVIiBBk6IyNMAHlXYnUAEygXUzUyELCjAF8gA');
      cy.contains('Load from clipboard').focus().click();
      cy.contains('A secure net');
      cy.get('.crafts-table tr').should('have.length', 1).then(() =>
        clip.writeText('NobwRAkgLgpgtmAXGAwgCwIYEsB2BnMAGjAAUAnAewAcYyoBPJMAZRgGMBXMmIsAGQpsA1k14A5DHB7IAggAI87LjDltMuXgBEYeNmSxUoWCjlHEUFADYUyTAMQB2BwE4HKAKy9yWAG4ZYSFBkHDDEACr0NGZgAPI+tPoAJjDeNlgMSDgclpYAvgC6QA')
      );
      // Import chain as craft array
      cy.contains('Load from clipboard').focus().click();
      cy.contains('A secure chain');
      cy.get('.crafts-table tr').should('have.length', 2);
      // Check that the data is shown correctly in the side panel
      cy.contains('A secure net').click();
      cy.get('#sidepanel input').eq(2).should('have.value', '#A7A7A7,#A7A7A7');
    });
  });
});
