export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login.page.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('../views/app.view.vue'),
    children: [
      { 
        path: '', 
        redirect: '/groups' 
      },
      { 
        path: 'users', 
        name: 'Users', 
        component: () => import('../pages/user.page.vue'),
        meta: { roles: ['administrator', 'admin'] }
      },
      { 
        path: 'groups', 
        name: 'Groups', 
        component: () => import('../pages/group.page.vue') 
      },
      { 
        path: 'groups/:groupId/variables', 
        name: 'Variables', 
        component: () => import('../pages/variable.page.vue') 
      },
      // Global Variable Library
      { 
        path: 'variables', 
        name: 'GlobalVariables', 
        component: () => import('../pages/variable.page.vue') 
      },
      { 
        path: 'groups/:groupId/templates', 
        name: 'Templates', 
        component: () => import('../pages/template.page.vue') 
      },
      { 
        path: 'groups/:groupId/templates/:templateId', 
        name: 'TemplateEditor', 
        component: () => import('../pages/template-editor.page.vue') 
      },
      { 
        path: 'groups/:groupId/templates/:templateId/simulate', 
        name: 'Simulation', 
        component: () => import('../pages/simulation.page.vue'),
        props: true
      },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];
