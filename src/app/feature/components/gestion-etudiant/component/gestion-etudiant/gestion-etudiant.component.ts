import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EtudiantService } from '../../service/etudiant.service';
import { AlertService } from '../../../../../core/services/Alert/alert.service';
import { Etudiant, User, Formation } from '../../interface/etudiant';
import { ResponseData } from '../../../../../core/interfaces/response-data';
import { NgxPaginationModule } from 'ngx-pagination';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-gestion-etudiant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, FormsModule],
  templateUrl: './gestion-etudiant.component.html',
  styleUrls: ['./gestion-etudiant.component.css']
})
export class GestionEtudiantComponent implements OnInit {
  private etudiantService = inject(EtudiantService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);

  // Signaux pour la réactivité
  etudiants = signal<Etudiant[]>([]);
  formations = signal<Formation[]>([]);
  loading = signal(false);
  modalOpen = signal(false);
  isEditMode = signal(false);
  currentPage = signal(1);
  itemsPerPage = 5;
  EtudiantId!: number;

  // Signaux pour la recherche et le filtrage
  searchQuery = signal('');
  selectedFormation = signal<string>('');
  filteredEtudiants = computed(() => {
    let result = this.etudiants();
    
    // Filtre par recherche
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(etudiant => 
        etudiant.user.nom.toLowerCase().includes(query) || 
        etudiant.user.prenom.toLowerCase().includes(query) ||
        etudiant.user.email.toLowerCase().includes(query) ||
        etudiant.ine.toLowerCase().includes(query)
      );
    }
    
    // Filtre par formation
    if (this.selectedFormation()) {
      result = result.filter(etudiant => 
        etudiant.formation.id.toString() === this.selectedFormation()
      );
    }
    
    return result;
  });

  // Formulaire réactif
  etudiantForm: FormGroup;

  constructor() {
    this.etudiantForm = this.fb.group({
      userId: [0],
      ine: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      formationId: ['', Validators.required],
      promo: [''],
      anneeDebut: [0],
      anneeSortie: [0],
      diplome: [false],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['Etudiant123'] // Valeur par défaut pour simplifier
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.loadFormations();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const data = await this.etudiantService.getData<ResponseData<Etudiant>>('etudiants').toPromise();
      if (data?.data) {
        this.etudiants.set(data.data);
      }
    } catch (error) {
      this.showErrorAlert('Erreur lors du chargement des étudiants');
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadFormations() {
    try {
      const data = await this.etudiantService.getData<ResponseData<Formation>>('formations').toPromise();
      if (data?.data) {
        this.formations.set(data.data);
      }
    } catch (error) {
      this.showErrorAlert('Erreur lors du chargement des formations');
      console.error(error);
    }
  }

  openAddModal() {
    this.isEditMode.set(false);
    this.resetForm();
    this.modalOpen.set(true);
  }

  openEditModal(etudiant: any) {
    console.log(etudiant);
    this.EtudiantId = etudiant.id
    
    this.isEditMode.set(true);
    
    const dateNaissance = new Date(
      etudiant.dateNaissance[0],
      etudiant.dateNaissance[1] - 1,
      etudiant.dateNaissance[2]
    ).toISOString().split('T')[0];

    this.etudiantForm.patchValue({
      userId: etudiant.user.id,
      ine: etudiant.ine,
      dateNaissance: dateNaissance,
      formationId: etudiant.formation.id.toString(),
      promo: etudiant.promo || '',
      anneeDebut: etudiant.anneeDebut || 0,
      anneeSortie: etudiant.anneeSortie || 0,
      diplome: etudiant.diplome || false,
      nom: etudiant.user.nom,
      prenom: etudiant.user.prenom,
      email: etudiant.user.email
    });
    
    this.modalOpen.set(true);
  }

  resetForm() {
    this.etudiantForm.reset({
      userId: 0,
      ine: '',
      dateNaissance: '',
      formationId: '',
      promo: '',
      anneeDebut: 0,
      anneeSortie: 0,
      diplome: false,
      nom: '',
      prenom: '',
      email: '',
      motDePasse: 'Etudiant123'
    });
  }



  submitForm() {
    if (this.etudiantForm.invalid) {
      this.markFormGroupTouched(this.etudiantForm);
      this.showErrorAlert('Veuillez remplir tous les champs obligatoires');
      return;
    }
  
    this.loading.set(true);
    const formValue = this.etudiantForm.value;

    console.log(formValue);
    
    if (this.isEditMode()) {
      // Logique de mise à jour
      const userPayload = {
        nom: formValue.nom,
        prenom: formValue.prenom,
        email: formValue.email,
        motDePasse: formValue.motDePasse,
      };
      
      this.etudiantService.putData(`users/${formValue.userId}`, userPayload).pipe(
        switchMap((updateUser:any) => {
            const etudiantPayload = {
              ine: formValue.ine,
              dateNaissance: formValue.dateNaissance,
              formationId: formValue.formationId,
              promo: formValue.promo,
              anneeDebut: formValue.anneeDebut,
              anneeSortie: formValue.anneeSortie,
              diplome: formValue.diplome,
              userId: updateUser.data.id
            };
            return this.etudiantService.putData(`etudiants/${this.EtudiantId}`, etudiantPayload);
        })
      ).subscribe({
          next: () => {
            this.showSuccessAlert('Étudiant mis à jour avec succès');
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
      // Logique de création
      const userPayload = {
        nom: formValue.nom,
        prenom: formValue.prenom,
        email: formValue.email,
        motDePasse: formValue.motDePasse,
        role: 'ETUDIANT'
      };
  
      this.etudiantService.postData('users', userPayload).pipe(
        switchMap((newUser: any) => {
          const etudiantPayload = {
            ine: formValue.ine,
            dateNaissance: formValue.dateNaissance,
            formationId: formValue.formationId,
            promo: formValue.promo,
            anneeDebut: formValue.anneeDebut,
            anneeSortie: formValue.anneeSortie,
            diplome: formValue.diplome,
            userId: newUser.data.id
          };
          return this.etudiantService.postData('etudiants', etudiantPayload);
        })
      ).subscribe({
        next: () => {
          this.showSuccessAlert('Étudiant ajouté avec succès');
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

  async confirmDelete(etudiant: Etudiant) {
    const result = await this.alertService.showConfirmation(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${etudiant.user.prenom} ${etudiant.user.nom} ?`
    );
    
    if (result.isConfirmed) {
      this.deleteEtudiant(etudiant.id);
    }
  }

  async deleteEtudiant(id: number) {
    this.loading.set(true);
    try {
      await this.etudiantService.deleteData(`etudiants`, id).toPromise();
      this.showSuccessAlert('Étudiant supprimé avec succès');
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