export interface Etudiant {
    user: User
    id: number
    promo: string
    anneeDebut: number
    anneeSortie: number
    diplome: boolean
    ine: string
    dateNaissance: number[]
    formation: Formation
}
  
  export interface User {
    id: number
    nom: string
    prenom: string
    email: string
    role:string
  }
  
  export interface Formation {
    id: number
    libelle: string
    description: string
    niveau: string
    dateDebut: number[]
    dateFin: number[]
  }
  