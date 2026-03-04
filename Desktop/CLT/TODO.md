# Plan de création du Registre des Volontaires CLTCRH

## Objectif
Créer une application web pour gérer le registre des volontaires du Comité Local de Tabarre de la Croix-Rouge Haïtienne (CLTCRH).

## Spécifications techniques
- **Format**: Application web (HTML, CSS, JavaScript)
- **Stockage**: localStorage (pour usage hors ligne)
- **Couleurs**: Rouge (#FF0000), Blanc (#FFFFFF), Noir (#000000)

## Données à collecter pour chaque volontaire
1. Nom
2. Prénom
3. Sexe
4. Date de naissance
5. Téléphone
6. Email
7. Adresse
8. Zone/Tabarre
9. Compétences
10. Disponibilité
11. Date d'inscription
12. Statut (Actif/Inactif)
13. Formations suivies

## Structure des fichiers à créer
1. `index.html` - Page principale avec formulaire et liste
2. `style.css` - Styles avec les couleurs CLTCRH
3. `app.js` - Logique JavaScript (CRUD, localStorage)
4. `README.md` - Instructions d'utilisation

## Étapes de développement
1. Créer la structure HTML avec formulaire d'ajout et tableau de liste
2. Implémenter le CSS avec le thème rouge/blanc/noir
3. Développer les fonctionnalités JavaScript:
   - Ajout de volontaires
   - Modification de volontaires
   - Suppression de volontaires
   - Recherche/filtre
   - Export CSV
   - Stockage localStorage

## Suivi
- [x] Créer TODO.md
- [x] Créer index.html
- [x] Créer style.css
- [x] Créer app.js
- [x] Tester l'application

---

# Plan d'extension: Gestion des Formations

## Objectif
Ajouter la gestion des formations et permettre de rechercher les volontaires par formation suivie.

## Nouvelles fonctionnalités à implémenter

### 1. Gestion des Formations
- Ajouter un nouveau bouton "Gérer les Formations" dans la section controls
- Créer un modal pour ajouter/modifier/supprimer des formations
- Chaque formation aura:
  - `id`: Identifiant unique
  - `nom`: Nom de la formation
  - `description`: Description de la formation
  - `date`: Date de la formation
  - `duree`: Durée de la formation

### 2. Lier les volontaires aux formations
- Modifier le formulaire volontaire pour permettre de sélectionner plusieurs formations
- Stocker les IDs des formations dans le profil du volontaire

### 3. Recherche par formation
- Ajouter une liste déroulante pour filtrer les volontaires par formation
- Afficher la liste des volontaires ayant suivi une formation sélectionnée

## Fichiers à modifier
1. `index.html` - Ajouter les nouveaux éléments UI (bouton, modal formations, dropdown recherche)
2. `app.js` - Ajouter la logique de gestion des formations et la recherche
3. `style.css` - Ajouter les styles nécessaires

## Étapes d'implémentation
- [x] 1. Ajouter le bouton "Gérer les Formations" dans controls-section
- [x] 2. Créer le modal de gestion des formations
- [x] 3. Implémenter les fonctions CRUD pour les formations dans app.js
- [x] 4. Modifier le formulaire volontaire pour inclure la sélection des formations
- [x] 5. Ajouter le filtre de recherche par formation
- [x] 6. Mettre à jour l'affichage du tableau pour montrer les formations
- [x] 7. Ajouter la fonctionnalité d'année pour chaque formation suivie
- [x] 8. Tester l'application

