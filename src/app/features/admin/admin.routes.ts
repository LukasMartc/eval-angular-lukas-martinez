import { Routes } from '@angular/router';
import { MovieAdminListComponent } from './movie-admin-list/movie-admin-list.component';
import { MovieFormComponent } from './movie-form/movie-form.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: MovieAdminListComponent },
  { path: 'new', component: MovieFormComponent },
  { path: 'edit/:id', component: MovieFormComponent },
];
