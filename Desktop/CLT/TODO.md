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
14. Groupe sanguin
15. Photo

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

---

# Plan d'extension: Gestion des Formations

## Objectif
Ajouter la gestion des formations et permettre de rechercher les volontaires par formation suivie.

## Nouvelles fonctionnalités implémentées
- [x] Gestion des formations (CRUD)
- [x] Lier volontaires aux formations
- [x] Recherche par formation
- [x] Année pour chaque formation suivie

---

# Plan d'extension: Groupe sanguin et Photo

## Objectif
Ajouter le groupe sanguin, l'upload de photo et l'impression du dossier

## Nouvelles fonctionnalités à implémenter

### 1. Groupe sanguin
- [x] Ajouter un champ "Groupe sanguin" dans le formulaire volontaire
- Options: A+, A-, B+, B-, AB+, AB-, O+, O-

### 2. Upload photo
- [x] Ajouter un input file pour uploader la photo depuis le navigateur
- Stocker la photo en base64 dans localStorage
- Afficher un aperçu de la photo dans le formulaire

### 3. Affichage photo
- [x] Afficher la photo dans le tableau des volontaires
- [x] Afficher la photo dans le dossier imprimable

### 4. Impression dossier
- [x] Créer un bouton "Imprimer dossier" dans les actions du tableau
- [x] Générer une vue imprimable avec toutes les infos du volontaire + photo

## Fichiers modifiés
1. `index.html`
2. `app.js`
3. `style.css`

## Étapes d'implémentation
- [x] 1. Ajouter le champ groupe sanguin dans le formulaire
- [x] 2. Ajouter l'input photo dans le formulaire
- [x] 3. Implémenter la logique d'upload et存储age photo
- [x] 4. Afficher la photo dans le tableau
- [x] 5. Ajouter le bouton Imprimer dossier
- [x] 6. Créer la fonction d'impression du dossier
- [x] 7. Ajouter les styles pour la vue imprimable
- [x] 8. Tester l'application

