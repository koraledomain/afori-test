/// <reference types="cypress" />

describe('Authenticated API smoke test', () => {
  it('generates a token and fetches protected data', () => {
    cy.request<string>('POST', '/auth/generate-token').then((tokenResponse) => {
      const token = tokenResponse.body;
      expect(token, 'JWT token').to.be.a('string').and.not.be.empty;

      cy.request({
        method: 'GET',
        url: '/customers',
        headers: {
          'x-api-key': token,
        },
      }).then((customersResponse) => {
        expect(customersResponse.status).to.eq(200);
        expect(customersResponse.body).to.be.an('array');
      });
    });
  });
});
