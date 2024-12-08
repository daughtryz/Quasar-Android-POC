const routes = [
  {
    path: '/',
    component: () => import('pages/ProductsPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
