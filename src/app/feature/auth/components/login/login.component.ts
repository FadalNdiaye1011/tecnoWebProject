import { Component, resource, ResourceStatus } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isLoading = false;;

  sendMailUser: FormGroup = new FormGroup({});
  showPassword: boolean = false; // Variable pour gérer la visibilité du mot de passe
  message: string = "";
  loginForm: FormGroup;
  isModalOpen = false;


  // resourceStatus = ResourceStatus

  // userResource = resource({
  //   loader: async () => {
  //     const response = await fetch('https://jsonplaceholder.typicode.com/users');
  //     return response.json() as Promise<any>;
  //   }
  // });

  constructor(private fb: FormBuilder,private authService:AuthService,private router: Router,) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.sendMailUser = this.fb.group({
      "email": ["", [Validators.required, Validators.email]]
    })
  }



  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
        this.authService.postData("auth/login", this.loginForm.value).pipe(
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: (response: any) => {
            
            if (response.status) {
              console.log(response);
              localStorage.setItem(environment.appName + "_token", response.data.token);
              localStorage.setItem(environment.appName + '_role', response.data.role);

            const userRole = this.authService.getUserRole();
            if(userRole){
              const defaultRoute = this.authService.getDefaultRouteForRole(userRole);
              this.router.navigateByUrl(defaultRoute);
            }
            }
          },
          error: (error: any) => {
            console.error('Login error:', error);
          }
        });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }



  togglePasswordVisibility() {
    this.showPassword = !this.showPassword; // Bascule la visibilité du mot de passe
  }

  openForgotPasswordModal() {
    this.isModalOpen = true;
  }

  closeForgotPasswordModal() {
    this.isModalOpen = false;
  }

  sendMail() {
   
    this.authService.postData<any,any>("user/password/email",this.sendMailUser.value).subscribe(
      {
        next: (response) => {
          this.sendMailUser.reset();
          this.closeForgotPasswordModal();
        },
        error: (err) => {
          // this.openAncloseModal();
          // this.sendMailLoader = false;
        },
        complete: () => {
          // this.openAncloseModal();
          // this.sendMailLoader = false
        }
      }
    )
  }
}





