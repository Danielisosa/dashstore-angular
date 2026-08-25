import { Routes } from  '@angular/router';
import { AdminDashboardLayout } from './layouts/admin-dashboard-layout/admin-dashboard-layout';
import { ProductAdminPage } from './pages/product-admin-page/product-admin-page';
import { ProductsAdminPage } from './pages/products-admin-page/products-admin-page';
import { IsAdminGuard } from '@auth/guards/is-admin-guard';
import { Profile } from '../users/componentes/profile/profile';
import { UsersList } from '../users/componentes/UsersList/UsersList';


export const adminDashboardRoutes: Routes= [
  {
    path: '',
    component: AdminDashboardLayout,
    canMatch: [IsAdminGuard],
    children:[
      {
        path:'products',
        component: ProductsAdminPage
      },
      {
        path: 'products/:id',
        component: ProductAdminPage
      },
      {
        path: 'profile',
        component: Profile
      },
      {
        path: 'users',
        component: UsersList
      },
      {
        path: '**',
        redirectTo: 'products'
      },
    ],
  },
];

export default adminDashboardRoutes;
