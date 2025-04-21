import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/layout/components/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/Auth/auth.guard';
import { notRetainAuthGuard } from './core/guards/NoteRetainAuth/not-retain-auth.guard';
import { roleGuard } from './core/guards/role.guard';


export const routes: Routes = [
  // Routes pour les utilisateurs non authentifiés
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate : [notRetainAuthGuard],
    loadChildren: () => import('./feature/auth/auth.module').then(m => m.AuthModule)
  },

  // Routes pour les utilisateurs authentifiés (avec AdminLayout)
  {
    path: '',
    component: AdminLayoutComponent, // Layout avec sidebar et header
    canActivate: [authGuard,roleGuard], // Syntaxe alternative pour roleGuard
    data: { expectedRoles: ['ADMIN'] },
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./feature/admin/admin.module').then(m => m.AdminModule)
      },

    ]
  },

  {
    path: '',
    component: AdminLayoutComponent, // Layout avec sidebar et header
    canActivate: [authGuard,roleGuard], // Syntaxe alternative pour roleGuard
    data: { expectedRoles: ['FORMATEUR'] },      // Protection par AuthGuard
    children: [
      {
        path: 'formateur',
        loadChildren: () => import('./feature/formateur/formateur.module').then(m => m.FormateurModule)
      },

    ]
  },

  // {
  //   path: '',
  //   component: AdminLayoutComponent, // Layout avec sidebar et header
  //   canActivate: [authGuard,roleGuard], // Syntaxe alternative pour roleGuard
  //   data: { expectedRoles: ['superviseur'] },      // Protection par AuthGuard
  //   children: [
  //     {
  //       path: 'superviseur',
  //       loadChildren: () => import('./feature/superviseur/superviseur.module').then(m => m.SuperviseurModule)
  //     },

  //   ]
  // },

  // {
  //   path: '',
  //   component: AdminLayoutComponent, // Layout avec sidebar et header
  //   canActivate: [authGuard,roleGuard], // Syntaxe alternative pour roleGuard
  //   data: { expectedRoles: ['apprenant'] },     // Protection par AuthGuard
  //   children: [
  //     {
  //       path: 'apprenant',
  //       loadChildren: () => import('./feature/apprenant/apprenant.module').then(m => m.ApprenantModule)
  //     },

  //   ]
  // },

  // Redirection page non trouvée
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
