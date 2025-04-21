import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../../feature/auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  isExpanded = true;
  mobileMenuOpen = false;
  isDiscMenuOpen = false; // État du sous-menu Test Mini disc
  userRole: string | null = null;


  @Output() sidebarToggled = new EventEmitter<boolean>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Réduire la sidebar automatiquement sur les écrans plus petits
    if (window.innerWidth < 1024) {
      this.isExpanded = false;
    } 
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.sidebarToggled.emit(this.isExpanded);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    console.log('Mobile menu open:', this.mobileMenuOpen);
  }

  isDesktop(): boolean {
    return window.innerWidth >= 1024; // Correspond à lg: en Tailwind
  }

   // Vérifie si l'élément doit être visible pour le rôle actuel
   shouldShowItem(allowedRoles: string) {
    const userRole = this.authService.getUserRole();
    if(userRole === allowedRoles){
      return true
    }
    return false 
  }

  toggleDiscMenu() {
    this.isDiscMenuOpen = !this.isDiscMenuOpen;
  }
}


