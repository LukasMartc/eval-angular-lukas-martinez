import { Routes } from '@angular/router';
import { backstageGuard } from './core/guards/backstage.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'movies', pathMatch: 'full' },
      {
        path: 'movies',
        loadChildren: () => import('./features/movies/movies.routes').then((m) => m.MOVIES_ROUTES),
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'admin',
        canActivate: [backstageGuard],
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'lost-reel',
        loadComponent: () =>
          import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      { path: '**', redirectTo: 'lost-reel' },
    ],
  },
];
