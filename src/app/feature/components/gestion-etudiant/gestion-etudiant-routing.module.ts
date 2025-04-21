import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionEtudiantComponent } from './component/gestion-etudiant/gestion-etudiant.component';

const routes: Routes = [
  {
    path:'',
    component:GestionEtudiantComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionEtudiantRoutingModule { }
