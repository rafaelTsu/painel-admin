// Ensure you have seeded the database with these users before running the tests.
// See: backend/README.md or run `npm run db:seed` (if implemented)

const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'password123',
};

const ATTORNEY_USER = {
  email: 'attorney@example.com',
  password: 'password123',
};

const EVALUATOR_USER = {
  email: 'evaluator@example.com',
  password: 'password123',
};

describe('US1: Secure Access, Users, and Groups', () => {
  beforeEach(() => {
    // Clear session storage/cookies to ensure fresh state
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Login Flow', () => {
    it('should show login page at /login', () => {
      cy.visit('/login');
      cy.contains('Sign in to your account').should('be.visible');
    });

    it('should fail with invalid credentials', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.contains('Invalid email or password').should('be.visible'); // Or whatever error message the UI shows
    });

    it('should login successfully as Admin', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(ADMIN_USER.email);
      cy.get('input[type="password"]').type(ADMIN_USER.password);
      cy.get('button[type="submit"]').click();

      // Should redirect to Dashboard/Groups
      cy.url().should('not.include', '/login');
      cy.contains('Admin Panel').should('be.visible');
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('Evaluator should be denied access and redirected to login', () => {
      // Simulate login via API to get token/cookie if needed, or just UI
      cy.visit('/login');
      cy.get('input[type="email"]').type(EVALUATOR_USER.email);
      cy.get('input[type="password"]').type(EVALUATOR_USER.password);
      cy.get('button[type="submit"]').click();

      // The validation logic in router checks role 'evaluator' and logs out + redirects to login
      // We expect to stay on login or be bounced back
      cy.url().should('include', '/login');
      // Ideally check for a message, but currently the router just redirects.
    });

    it('Admin should see Users menu and be able to list users', () => {
      cy.login(ADMIN_USER.email, ADMIN_USER.password); // Custom command usage or repeat steps
      cy.visit('/');
      
      // Sidebar should have Users
      cy.get('nav').contains('Users').should('be.visible');
      
      // Navigate to Users
      cy.get('nav').contains('Users').click();
      cy.url().should('include', '/users');
      cy.contains('h1', 'Users').should('be.visible');
      
      // Should see at least the admin user in the list
      cy.contains(ADMIN_USER.email).should('be.visible');
    });

    it('Attorney should NOT see Users menu', () => {
      cy.login(ATTORNEY_USER.email, ATTORNEY_USER.password);
      cy.visit('/');
      
      // Sidebar should NOT have Users
      cy.get('nav').contains('Users').should('not.exist');
      
      // Direct access to /users should redirect or show error (router guards)
      cy.visit('/users');
      cy.url().should('not.include', '/users'); 
      // Our router guard redirects to /groups if unauthorized
      cy.url().should('include', '/groups');
    });
  });

  describe('Group Management Scoping', () => {
    it('Admin should see Groups page and "Create Group" button', () => {
      cy.login(ADMIN_USER.email, ADMIN_USER.password);
      cy.visit('/groups');
      cy.contains('h1', 'Groups').should('be.visible');
      cy.contains('button', 'Create Group').should('be.visible');
    });

    it('Attorney should see Groups page but NO "Create Group" button', () => {
        cy.login(ATTORNEY_USER.email, ATTORNEY_USER.password);
        cy.visit('/groups');
        cy.contains('h1', 'Groups').should('be.visible');
        cy.contains('button', 'Create Group').should('not.exist');
    });
  });
});
