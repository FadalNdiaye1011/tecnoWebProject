import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormationsService } from '../../service/formations.service';
import { AlertService } from '../../../../../core/services/Alert/alert.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResponseData } from '../../../../../core/interfaces/response-data';
import { Formation } from '../../../gestion-etudiant/interface/etudiant';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-formations',
  imports: [CommonModule,ReactiveFormsModule,NgxPaginationModule,FormsModule],
  templateUrl: './formations.component.html',
  styleUrl: './formations.component.css'
})
export class FormationsComponent implements OnInit{

  private formationService = inject(FormationsService);
  private alertService = inject(AlertService);
  private authservice = inject(AuthService);
  private fb = inject(FormBuilder);

  formations = signal<Formation[]>([]);
  loading = signal(false);
  modalOpen = signal(false);
  isEditMode = signal(false);
  currentPage = signal(1);
  itemsPerPage = 5;
  formationId!: number;

  // Formulaire réactif
  formationForm: FormGroup;

    // Signaux pour la recherche et le filtrage
    searchQuery = signal('');
    selectedFormation = signal<string>('');
    filteredFormations = computed(() => {
      let result = this.formations();
      
      // Filtre par recherche
      if (this.searchQuery()) {
        const query = this.searchQuery().toLowerCase();
        result = result.filter(etudiant => 
          etudiant.libelle.toLowerCase().includes(query) || 
          etudiant.niveau.toLowerCase().includes(query) ||
          etudiant.description.toLowerCase().includes(query) 
        );
      }

      return result;
    });
  

  constructor() {
    this.formationForm = this.fb.group({
      libelle: ['',Validators.required],
      description: ['',Validators.required],
      dateDebut: [0],
      dateFin: [0],
      niveau: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }



  private showSuccessAlert(message: string) {
    this.alertService.showAlert({
      title: 'Succès',
      text: message,
      icon: 'success',
      timer: 3000
    });
  }

  private showErrorAlert(message: string) {
    this.alertService.showAlert({
      title: 'Erreur',
      text: message,
      icon: 'error'
    });
  }



    async loadData() {
      this.loading.set(true);
      try {
        const data = await this.formationService.getData<ResponseData<Formation>>('formations').toPromise();
        if (data?.data) {
          this.formations.set(data.data);
        }
      } catch (error) {
        this.showErrorAlert('Erreur lors du chargement des étudiants');
        console.error(error);
      } finally {
        this.loading.set(false);
      }
    }

    openAddModal() {
      this.isEditMode.set(false);
      this.resetForm();
      this.modalOpen.set(true);
    }

    openEditModal(formation:Formation) {
      console.log(formation);
      this.formationId = formation.id
      
      
      this.isEditMode.set(true);
      
      const dateDebut = new Date(
        formation.dateDebut[0],
        formation.dateDebut[1] - 1,
        formation.dateDebut[2]
      ).toISOString().split('T')[0];

      const dateFin = new Date(
        formation.dateFin[0],
        formation.dateFin[1] - 1,
        formation.dateFin[2]
      ).toISOString().split('T')[0];
  
      this.formationForm.patchValue({
        libelle: formation.libelle,
        dateDebut: dateDebut,
        dateFin: dateFin,
        niveau: formation.niveau || '',
        description: formation.description,
      });
      
      this.modalOpen.set(true);
    }

    resetForm() {
      this.formationForm.reset({
        userId: 0,
        libelle: '',
        description: '',
        dateDebut: 0,
        dateFin: 0,
        niveau: '',
      });
    }

    private markFormGroupTouched(formGroup: FormGroup) {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
  
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      });
    }

      submitForm() {
        if (this.formationForm.invalid) {
          this.markFormGroupTouched(this.formationForm);
          this.showErrorAlert('Veuillez remplir tous les champs obligatoires');
          return;
        }
      
        this.loading.set(true);
        const formValue = this.formationForm.value;
    
        
        if (this.isEditMode()) {

          this.formationService.putData(`formations/${this.formationId}`, formValue).subscribe({
              next: () => {
                this.showSuccessAlert('Formation mis à jour avec succès');
                this.modalOpen.set(false);
                this.loadData();
                this.resetForm() 
              },
              error: (error) => {
                this.showErrorAlert('Erreur lors de la mise à jour');
                console.error(error);
                this.loading.set(false);

              },
              complete: () => {
                this.loading.set(false);
              }
            });
        } else {
          this.formationService.postData('formations', formValue).subscribe({
            next: () => {
              this.showSuccessAlert('Formation ajouté avec succès');
              this.modalOpen.set(false);
              this.loadData();
              this.resetForm() 
            },
            error: (error) => {
              this.showErrorAlert('Erreur lors de l\'opération');
              console.error(error);
              this.loading.set(false);

            },
            complete: () => {
              this.loading.set(false);
            }
          });
        }
      }


       async confirmDelete(formation: Formation) {
          const result = await this.alertService.showConfirmation(
            'Confirmer la suppression',
            `Voulez-vous vraiment supprimer ${formation.libelle} ?`
          );
          
          if (result.isConfirmed) {
            this.deleteformation(formation.id);
          }
        }
      
        async deleteformation(id: number) {
          this.loading.set(true);
          try {
            await this.formationService.deleteData(`formations`, id).toPromise();
            this.showSuccessAlert('Formations supprimé avec succès');
            this.loadData();
          } catch (error) {
            this.showErrorAlert('Erreur lors de la suppression');
            console.error(error);
          } finally {
            this.loading.set(false);
          }
        }
      
        pageChanged(event: number) {
          this.currentPage.set(event);
        }

        updateSearchQuery(value: string) {
          this.searchQuery.set(value);
        }
        

        resetFilters() {
          this.searchQuery.set('');
          this.selectedFormation.set('');
        }


        shouldShowItem(allowedRoles: string) {
          const userRole = this.authservice.getUserRole();
          if(userRole === allowedRoles){
            return true
          }
          return false 
        }
      

}
