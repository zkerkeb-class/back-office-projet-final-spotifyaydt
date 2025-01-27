import { testAlbumImage } from '../fixtures/images';

describe('Albums Management', () => {
  beforeEach(() => {
    cy.fixture('data/albums.json').as('albumsData')
    cy.visit('/albums')
  })

  it('should display the albums list page', () => {
    cy.get('h2').should('contain', 'Gestion des Albums')
    cy.get('.album-list__table').should('exist')
  })

  it('should navigate to new album form', () => {
    cy.contains('button', 'Nouvel Album').click()
    cy.url().should('include', '/albums/new')
    cy.get('h2').should('contain', 'Nouvel Album')
  })

  it('should create a new album', () => {
    cy.get('@albumsData').then((data) => {
      cy.visit('/albums/new')
      
      // Remplir le formulaire avec les données de test
      const { testAlbum } = data
      cy.get('input[name="title"]').type(testAlbum.title)
      cy.get('input[name="artist"]').type(testAlbum.artist)
      cy.get('input[name="releaseDate"]').type(testAlbum.releaseDate)
      cy.get('select[name="genre"]').select(testAlbum.genre)
      
      // Upload cover
      cy.get('input[type="file"]').uploadFile(
        testAlbumImage,
        'test-album.jpg',
        'image/jpeg'
      )
      
      // Ajouter des pistes
      testAlbum.tracks.forEach(track => {
        cy.contains('button', 'Ajouter une piste').click()
        cy.get('.track-item').last().within(() => {
          cy.get('input').first().type(track.title)
          cy.get('input').last().type(track.duration)
        })
      })
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      // Verify redirect and new album presence
      cy.url().should('include', '/albums')
      cy.contains(testAlbum.title).should('exist')
    })
  })

  it('should handle track reordering', () => {
    cy.visit('/albums/edit/1')
    
    // Add multiple tracks
    cy.contains('button', 'Ajouter une piste').click()
    cy.get('.track-item').first().find('input').first().type('Track 1')
    cy.contains('button', 'Ajouter une piste').click()
    cy.get('.track-item').last().find('input').first().type('Track 2')
    
    // Verify track order after drag and drop
    cy.get('.track-item').first().drag('.track-item').last()
    cy.get('.track-item').first().should('contain', 'Track 2')
  })
}) 