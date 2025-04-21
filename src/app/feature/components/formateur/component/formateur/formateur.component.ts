import { Component, computed, inject, signal } from '@angular/core';
import { FormateurService } from '../../service/formateur.service';
import { AlertService } from '../../../../../core/services/Alert/alert.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../gestion-etudiant/interface/etudiant';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResponseData } from '../../../../../core/interfaces/response-data';

@Component({
  selector: 'app-formateur',
  imports: [CommonModule,ReactiveFormsModule,NgxPaginationModule,FormsModule],
  templateUrl: './formateur.component.html',
  styleUrl: './formateur.component.css'
})
export class FormateurComponent {
  private formateurService = inject(FormateurService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);

  // Signaux pour la réactivité
  formateurs = signal<User[]>([]);
  loading = signal(false);
  modalOpen = signal(false);
  isEditMode = signal(false);
  currentPage = signal(1);
  itemsPerPage = 5;
  formateurId!: number;

  // Signaux pour la recherche et le filtrage
  searchQuery = signal('');
  selectedFormation = signal<string>('');
  filteredformateurs = computed(() => {
    let result = this.formateurs();
    
    // Filtre par recherche
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(formateur => 
        formateur.nom.toLowerCase().includes(query) || 
        formateur.prenom.toLowerCase().includes(query) ||
        formateur.email.toLowerCase().includes(query)
      );
    }
    
    
    return result;
  });

  // Formulaire réactif
  formateurForm: FormGroup;

  constructor() {
    this.formateurForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role:['FORMATEUR'],
      motDePasse: ['formateur123'] // Valeur par défaut pour simplifier
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const data = await this.formateurService.getData<ResponseData<User>>('users').toPromise();
      if (data?.data) {
        const formateursFiltres = data.data.filter(user => user.role === 'FORMATEUR');
        this.formateurs.set(formateursFiltres);
        
      }
    } catch (error) {
      this.showErrorAlert('Erreur lors du chargement des formateur');
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

  openEditModal(formateur: User) {
    this.formateurId = formateur.id;
    this.isEditMode.set(true);
    
    this.formateurForm.patchValue({
      nom: formateur.nom,    // Pas formateur.user.nom
      prenom: formateur.prenom, // Pas formateur.user.prenom
      email: formateur.email,   // Pas formateur.user.email
      role: formateur.role || 'FORMATEUR', // Conserver le rôle existant ou par défaut
      motDePasse: 'formateur123' // Ne pas afficher le mot de passe existant
    });
    
    this.modalOpen.set(true);
  }

  resetForm() {
    this.formateurForm.reset({
      nom: '',
      prenom: '',
      email: '',
      role: 'FORMATEUR', // Réinitialiser avec la valeur par défaut
      motDePasse: 'formateur123' // Réinitialiser avec la valeur par défaut
    });
  }



  submitForm() {
    console.log(this.formateurForm.value);
    
    if (this.formateurForm.invalid) {
      this.markFormGroupTouched(this.formateurForm);
      this.showErrorAlert('Veuillez remplir tous les champs obligatoires');
      return;
    }
  
    this.loading.set(true);
    
    if (this.isEditMode()) {
      this.formateurService.putData(`users/${this.formateurId}`, this.formateurForm.value).subscribe({
          next: () => {
            this.showSuccessAlert('Formateur mis à jour avec succès');
            this.modalOpen.set(false);
            this.loadData();
          },
          error: (error) => {
            this.showErrorAlert('Erreur lors de la mise à jour');
            console.error(error);
          },
          complete: () => {
            this.loading.set(false);
          }
        });
    } else {
      this.formateurService.postData('users', this.formateurForm.value).subscribe({
        next: () => {
          this.showSuccessAlert('Formateur ajouté avec succès');
          this.modalOpen.set(false);
          this.loadData();
        },
        error: (error) => {
          this.showErrorAlert('Erreur lors de l\'opération');
          console.error(error);
        },
        complete: () => {
          this.loading.set(false);
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  async confirmDelete(formateur: User) {
    const result = await this.alertService.showConfirmation(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${formateur.prenom} ${formateur.nom} ?`
    );
    
    if (result.isConfirmed) {
      this.deleteformateur(formateur.id);
    }
  }

  async deleteformateur(id: number) {
    this.loading.set(true);
    try {
      await this.formateurService.deleteData(`users`, id).toPromise();
      this.showSuccessAlert('Formateur supprimé avec succès');
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

  updateSearchQuery(value: string) {
    this.searchQuery.set(value);
  }
  
  updateSelectedFormation(value: string) {
    this.selectedFormation.set(value);
  }

  onFormationChange(value: string) {
    this.selectedFormation.set(value);
  }
  
  resetFilters() {
    this.searchQuery.set('');
    this.selectedFormation.set('');
  }
}
