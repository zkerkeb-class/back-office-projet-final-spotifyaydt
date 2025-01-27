import { testArtistImage } from '../fixtures/images';

describe('Artists Management', () => {
  beforeEach(() => {
    cy.fixture('data/artists.json').as('artistsData')
    cy.visit('/artists')
  })

  it('should display the artists list page', () => {
    cy.get('h2').should('contain', 'Gestion des Artistes')
    cy.get('.artist-list__table').should('exist')
  })

  it('should navigate to new artist form', () => {
    cy.contains('button', 'Nouvel Artiste').click()
    cy.url().should('include', '/artists/new')
    cy.get('h2').should('contain', 'Nouvel Artiste')
  })

  it('should create a new artist', () => {
    cy.get('@artistsData').then((data) => {
      cy.visit('/artists/new')
      
      // Remplir le formulaire avec les données de test
      const { testArtist } = data
      cy.get('input[name="name"]').type(testArtist.name)
      cy.get('textarea[name="biography"]').type(testArtist.biography)
      cy.get('.genre-checkbox input[type="checkbox"]').first().check()
      cy.get('input[name="socialLinks.spotify"]').type(testArtist.socialLinks.spotify)
      
      // Upload image
      cy.get('input[type="file"]').uploadFile(
        testArtistImage,
        'test-artist.jpg',
        'image/jpeg'
      )
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      // Verify redirect and new artist presence
      cy.url().should('include', '/artists')
      cy.contains(testArtist.name).should('exist')
    })
  })

  it('should search for artists', () => {
    cy.get('.search-bar input').type('test')
    cy.get('.artist-list__table').should('contain', 'Test Artist')
  })

  it('should edit an artist', () => {
    cy.get('.artist-list__table')
      .contains('tr', 'Test Artist')
      .find('.btn--icon')
      .first()
      .click()

    cy.get('input[name="name"]').clear().type('Updated Artist')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/artists')
    cy.contains('Updated Artist').should('exist')
  })

  it('should delete an artist', () => {
    cy.get('.artist-list__table')
      .contains('tr', 'Updated Artist')
      .find('.btn--danger')
      .click()

    cy.contains('Updated Artist').should('not.exist')
  })
}) 