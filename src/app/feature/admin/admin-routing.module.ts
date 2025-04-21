import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'etudiant',
        loadChildren: () => import('../components/gestion-etudiant/gestion-etudiant.module').then(m => m.GestionEtudiantModule)
      },
      {
        path: 'formations',
        loadChildren: () => import('../components/formations/formations.module').then(m => m.FormationsModule)
      },
      {
        path: 'formateurs',
        loadChildren: () => import('../components/formateur/formateur.module').then(m => m.FormateurModule)
      },

    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
