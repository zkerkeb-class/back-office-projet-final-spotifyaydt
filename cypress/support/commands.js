import '@testing-library/cypress/add-commands'

// Commande personnalisée pour le drag and drop
Cypress.Commands.add('drag', { prevSubject: 'element' }, (subject, targetEl) => {
  cy.wrap(subject)
    .trigger('mousedown', { which: 1 })
    .trigger('mousemove', { clientX: 100, clientY: 100 })
  cy.get(targetEl)
    .trigger('mousemove')
    .trigger('mouseup', { force: true })
})

// Commande personnalisée pour l'upload de fichier
Cypress.Commands.add('uploadFile', { prevSubject: 'element' }, (subject, fileContent, fileName, mimeType) => {
  const blob = Cypress.Blob.base64StringToBlob(fileContent.split(',')[1], mimeType)
  const file = new File([blob], fileName, { type: mimeType })
  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(file)

  return cy.wrap(subject).then($input => {
    $input[0].files = dataTransfer.files
    return cy.wrap($input).trigger('change', { force: true })
  })
}) 