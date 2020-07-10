
describe("smoke test", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("check header test", () => {
    cy.get("#gatsby-focus-wrapper > div:nth-child(1) > div > h1").contains("Gatsby Default Starter")
  })

  it("check section text", () => {
    cy.get("#gatsby-focus-wrapper > div:nth-child(2) > h1").contains("List of movies")
  })
})