
describe('US3 Simulation Flow', () => {
  beforeEach(() => {
    // Login
    cy.visit('/login');
    cy.get('input[type="email"]').type('attorney@test.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Mock APIs to avoid complex backend setup with files
    cy.intercept('GET', '/api/groups', {
       body: [{ id: 'g1', name: 'Test Group' }]
    }).as('getGroups');

    cy.intercept('GET', '/api/groups/g1/variables', {
       body: [{ id: 'var1', groupId: 'g1', key: 'client_name', label: 'Client Name', type: 'text' }]
    }).as('getVariables');

    cy.intercept('GET', '/api/groups/g1/templates', {
       body: [{ id: 't1', groupId: 'g1', name: 'NDA Template' }]
    }).as('getTemplates');

    cy.intercept('GET', '/api/groups/g1/templates/t1', {
       body: { id: 't1', groupId: 'g1', name: 'NDA Template' }
    }).as('getTemplate');

    cy.intercept('GET', '/api/groups/g1/templates/t1/versions', {
       body: [{ 
           id: 'v1', 
           versionNumber: 1, 
           changeNote: 'Init', 
           referencedVariableKeys: ['client_name'], 
           createdAt: new Date().toISOString() 
       }]
    }).as('getVersions');

    cy.intercept('POST', '/api/groups/g1/templates/t1/versions/v1/simulate', {
       statusCode: 201,
       body: { id: 'sim1', status: 'running' }
    }).as('simulationStart');

    cy.intercept('GET', '/api/groups/g1/simulations/sim1', {
       body: { id: 'sim1', status: 'succeeded', outputFormat: 'docx' }
    }).as('simulationStatus');
  });

  it('should run a simulation successfully', () => {
     cy.visit('/groups');
     cy.contains('Test Group').click();
     
     // Go to templates
     cy.contains('Manage Templates').click();
     cy.wait('@getTemplates');
     
     // Find Simulate button
     cy.get('button[title="Simulate"]').first().click();
     
     // Should be on simulation page
     cy.url().should('include', '/simulate');
     cy.contains('NDA Template');
     
     // Form loading
     cy.wait('@getVersions');
     cy.wait('@getVariables'); // fetched by page
     
     // Fill form
     cy.get('input[type="text"]').type('Acme Corp');
     
     // Run
     cy.contains('Run Simulation').click();
     cy.wait('@simulationStart');
     
     // Wait for polling result
     cy.contains('SUCCEEDED', { timeout: 10000 });
     
     // Check download button
     cy.contains('Download Result').should('be.visible');
  });
});
