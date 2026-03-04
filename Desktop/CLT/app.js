/**
 * Registre des Volontaires - CLTCRH
 * Application JavaScript pour gérer les volontaires
 * Comité Local de Tabarre - Croix-Rouge Haïtienne
 */

// Configuration
const STORAGE_KEY = 'cltcrh_volunteers';
const FORMATIONS_KEY = 'cltcrh_formations';

// Variables globales
let volunteers = [];
let formations = [];
let currentEditId = null;
let currentPhotoData = null;

// ==========================================
// INITIALISATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    loadVolunteers();
    loadFormations();
    setupEventListeners();
    renderVolunteers();
    renderFormationsList();
    updateFormationSelect();
    updateLastUpdate();
});

// ==========================================
// ÉVÉNEMENTS
// ==========================================

function setupEventListeners() {
    // Bouton ajouter volontaire
    document.getElementById('btn-add').addEventListener('click', openModal);
    
    // Bouton gérer formations
    document.getElementById('btn-formations').addEventListener('click', openFormationsModal);
    
    // Fermer modals
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('btn-cancel').addEventListener('click', closeModal);
    document.querySelector('.close-formations').addEventListener('click', closeFormationsModal);
    document.querySelector('.close-stats').addEventListener('click', closeStatsModal);
    document.querySelector('.close-print').addEventListener('click', closePrintModal);
    
    // Soumettre formulaire volontaire
    document.getElementById('volunteer-form').addEventListener('submit', handleFormSubmit);
    
    // Soumettre formulaire formation
    document.getElementById('formation-form').addEventListener('submit', handleFormationSubmit);
    
    // Recherche textuelle
    document.getElementById('search-input').addEventListener('input', handleSearch);
    
    // Recherche par formation
    document.getElementById('search-formation').addEventListener('change', handleFormationFilter);
    
    // Exporter CSV
    document.getElementById('btn-export').addEventListener('click', exportToCSV);
    
    // Statistiques
    document.getElementById('btn-stats').addEventListener('click', showStats);
    
    // Fermer modal en cliquant à l'extérieur
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
            closeFormationsModal();
            closeStatsModal();
            closePrintModal();
        }
    });
}

// ==========================================
// GESTION DES FORMATIONS
// ==========================================

function loadFormations() {
    const stored = localStorage.getItem(FORMATIONS_KEY);
    if (stored) {
        formations = JSON.parse(stored);
    } else {
        formations = [];
    }
}

function saveFormations() {
    localStorage.setItem(FORMATIONS_KEY, JSON.stringify(formations));
}

function addFormation(data) {
    const formation = {
        id: generateId(),
        nom: data.nom,
        date: data.date || '',
        duree: data.duree || '',
        description: data.description || ''
    };
    formations.push(formation);
    saveFormations();
    renderFormationsList();
    updateFormationSelect();
    showNotification('Formation ajoutée avec succès!', 'success');
}

function deleteFormation(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation?')) {
        formations = formations.filter(f => f.id !== id);
        saveFormations();
        renderFormationsList();
        updateFormationSelect();
        
        // Retirer la formation des volontaires qui l'ont suivie
        volunteers.forEach(v => {
            if (v.formations) {
                v.formations = v.formations.filter(f => f.formationId !== id);
            }
        });
        saveVolunteers();
        renderVolunteers();
        
        showNotification('Formation supprimée!', 'success');
    }
}

function renderFormationsList() {
    const container = document.getElementById('formations-list');
    
    if (formations.length === 0) {
        container.innerHTML = `
            <div class="formation-empty">
                <i class="fas fa-graduation-cap"></i>
                <p>Aucune formation enregistrée</p>
                <p>Ajoutez une formation ci-dessus</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = formations.map(f => `
        <div class="formation-item">
            <div class="formation-info">
                <div class="formation-name">${escapeHtml(f.nom)}</div>
                <div class="formation-details">
                    ${f.date ? 'Date: ' + formatDate(f.date) : ''} 
                    ${f.duree ? ' | Durée: ' + escapeHtml(f.duree) : ''}
                    ${f.description ? ' | ' + escapeHtml(f.description) : ''}
                </div>
            <div class="formation-actions">
                <button class="btn btn-danger" onclick="deleteFormation('${f.id}')" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
    `).join('');
}

function updateFormationSelect() {
    // Mise à jour de la liste des formations dans le formulaire volontaire
    const formSelect = document.getElementById('formations');
    formSelect.innerHTML = '<option value="">Sélectionner les formations</option>';
    
    formations.forEach(f => {
        const option = document.createElement('option');
        option.value = f.id;
        option.textContent = f.nom;
        formSelect.appendChild(option);
    });
    
    // Mise à jour du filtre de recherche
    const filterSelect = document.getElementById('search-formation');
    const currentValue = filterSelect.value;
    filterSelect.innerHTML = '<option value="">Toutes les formations</option>';
    
    formations.forEach(f => {
        const option = document.createElement('option');
        option.value = f.id;
        option.textContent = f.nom;
        filterSelect.appendChild(option);
    });
    
    filterSelect.value = currentValue;
}

function handleFormationSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nom: document.getElementById('formation-nom').value.trim(),
        date: document.getElementById('formation-date').value,
        duree: document.getElementById('formation-duree').value.trim(),
        description: document.getElementById('formation-description').value.trim()
    };
    
    addFormation(formData);
    
    // Réinitialiser le formulaire
    document.getElementById('formation-form').reset();
}

function openFormationsModal() {
    document.getElementById('modal-formations').style.display = 'block';
}

function closeFormationsModal() {
    document.getElementById('modal-formations').style.display = 'none';
}

// ==========================================
// FONCTIONS CRUD VOLONTAIRES
// ==========================================

function loadVolunteers() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        volunteers = JSON.parse(stored);
    } else {
        volunteers = [];
    }
}

function saveVolunteers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(volunteers));
    updateLastUpdate();
}

function addVolunteer(data) {
    const volunteer = {
        id: generateId(),
        ...data,
        formations: data.formations || [],
        date_inscription: new Date().toISOString()
    };
    volunteers.push(volunteer);
    saveVolunteers();
    renderVolunteers();
    showNotification('Volontaire ajouté avec succès!', 'success');
}

function updateVolunteer(id, data) {
    const index = volunteers.findIndex(v => v.id === id);
    if (index !== -1) {
        volunteers[index] = { ...volunteers[index], ...data };
        saveVolunteers();
        renderVolunteers();
        showNotification('Volontaire mis à jour avec succès!', 'success');
    }
}

function deleteVolunteer(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce volontaire?')) {
        volunteers = volunteers.filter(v => v.id !== id);
        saveVolunteers();
        renderVolunteers();
        showNotification('Volontaire supprimé avec succès!', 'success');
    }
}

function editVolunteer(id) {
    const volunteer = volunteers.find(v => v.id === id);
    if (volunteer) {
        currentEditId = id;
        document.getElementById('modal-title').textContent = 'Modifier Volontaire';
        
        // Remplir le formulaire
        document.getElementById('volunteer-id').value = volunteer.id;
        document.getElementById('nom').value = volunteer.nom;
        document.getElementById('prenom').value = volunteer.prenom;
        document.getElementById('sexe').value = volunteer.sexe;
        document.getElementById('date_naissance').value = volunteer.date_naissance;
        document.getElementById('telephone').value = volunteer.telephone;
        document.getElementById('email').value = volunteer.email || '';
        document.getElementById('adresse').value = volunteer.adresse;
        document.getElementById('zone').value = volunteer.zone;
        document.getElementById('competences').value = volunteer.competences || '';
        document.getElementById('disponibilite').value = volunteer.disponibilite;
        document.getElementById('statut').value = volunteer.statut;
        document.getElementById('groupe_sanguin').value = volunteer.groupe_sanguin || '';
        
        // Charger la photo
        currentPhotoData = volunteer.photo || null;
        if (currentPhotoData) {
            document.getElementById('photo-preview').src = currentPhotoData;
            document.getElementById('photo-preview-container').style.display = 'block';
        } else {
            document.getElementById('photo-preview-container').style.display = 'none';
        }
        
        // Charger les formations suivies
        const formationsSelect = document.getElementById('formations');
        const selectedFormations = volunteer.formations || [];
        
        // Réinitialiser toutes les options
        Array.from(formationsSelect.options).forEach(opt => {
            opt.selected = false;
        });
        
        // Sélectionner les formations du volontaire
        selectedFormations.forEach(f => {
            const option = formationsSelect.querySelector(`option[value="${f.formationId}"]`);
            if (option) option.selected = true;
        });
        
        // Générer les champs d'année après un court délai pour laisser le temps au DOM de se mettre à jour
        setTimeout(() => {
            // Remplir les années pour chaque formation sélectionnée
            selectedFormations.forEach(f => {
                const yearInput = document.getElementById(`annee-${f.formationId}`);
                if (yearInput && f.annee) {
                    yearInput.value = f.annee;
                }
            });
        }, 100);
        
        openModal();
    }
}

// ==========================================
// FORMULAIRE
// ==========================================

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Récupérer les formations sélectionnées avec l'année
    const formationsSelect = document.getElementById('formations');
    const selectedFormations = [];
    
    Array.from(formationsSelect.selectedOptions).forEach(option => {
        if (option.value) {
            // Récupérer l'année saisie pour cette formation
            const yearInput = document.getElementById(`annee-${option.value}`);
            const annee = yearInput ? yearInput.value.trim() : '';
            
            selectedFormations.push({
                formationId: option.value,
                annee: annee
            });
        }
    });
    
    const formData = {
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        sexe: document.getElementById('sexe').value,
        date_naissance: document.getElementById('date_naissance').value,
        telephone: document.getElementById('telephone').value.trim(),
        email: document.getElementById('email').value.trim(),
        adresse: document.getElementById('adresse').value.trim(),
        zone: document.getElementById('zone').value,
        competences: document.getElementById('competences').value.trim(),
        disponibilite: document.getElementById('disponibilite').value,
        statut: document.getElementById('statut').value,
        groupe_sanguin: document.getElementById('groupe_sanguin').value,
        photo: currentPhotoData,
        formations: selectedFormations
    };
    
    if (currentEditId) {
        updateVolunteer(currentEditId, formData);
    } else {
        addVolunteer(formData);
    }
    
    closeModal();
    resetForm();
}

function openModal() {
    document.getElementById('modal-form').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal-form').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetForm();
}

function resetForm() {
    document.getElementById('volunteer-form').reset();
    document.getElementById('volunteer-id').value = '';
    document.getElementById('modal-title').textContent = 'Nouveau Volontaire';
    currentEditId = null;
    currentPhotoData = null;
    
    // Réinitialiser les champs d'année des formations
    document.getElementById('formation-years-container').innerHTML = '';
    
    // Réinitialiser l'aperçu de la photo
    document.getElementById('photo-preview-container').style.display = 'none';
    document.getElementById('photo-preview').src = '';
}

// Fonction pour générer les champs d'année pour chaque formation sélectionnée
function updateYearInputs() {
    const select = document.getElementById('formations');
    const container = document.getElementById('formation-years-container');
    const selectedOptions = Array.from(select.selectedOptions).filter(opt => opt.value);
    
    // Sauvegarder les valeurs actuelles des années
    const currentYears = {};
    const existingInputs = container.querySelectorAll('.formation-year-input');
    existingInputs.forEach(input => {
        currentYears[input.dataset.formationId] = input.value;
    });
    
    container.innerHTML = '';
    
    if (selectedOptions.length === 0) {
        return;
    }
    
    const heading = document.createElement('div');
    heading.className = 'form-group';
    heading.style.marginBottom = '15px';
    heading.innerHTML = '<label>Année de chaque formation</label>';
    container.appendChild(heading);
    
    selectedOptions.forEach(option => {
        const formationId = option.value;
        const formationName = option.textContent;
        
        const yearInput = document.createElement('div');
        yearInput.className = 'form-group';
        yearInput.innerHTML = `
            <label for="annee-${formationId}">${escapeHtml(formationName)}</label>
            <input type="number" id="annee-${formationId}" 
                   class="formation-year-input" 
                   data-formation-id="${formationId}"
                   min="2000" max="2100" 
                   placeholder="Année (ex: 2024)"
                   value="${currentYears[formationId] || ''}"
                   style="padding: 10px; border: 2px solid var(--gray-light); border-radius: 8px;">
        `;
        container.appendChild(yearInput);
    });
}

// ==========================================
// AFFICHAGE
// ==========================================

function getFormationDisplayNames(formationsData) {
    if (!formationsData || formationsData.length === 0) {
        return '-';
    }
    
    return formationsData.map(f => {
        const formation = formations.find(fo => fo.id === f.formationId);
        if (formation) {
            const annee = f.annee ? ` (${f.annee})` : '';
            return formation.nom + annee;
        }
        return '';
    }).filter(n => n).join(', ') || '-';
}

function renderVolunteers(filteredVolunteers = null) {
    const displayList = filteredVolunteers || volunteers;
    const tbody = document.getElementById('volunteers-tbody');
    const emptyState = document.getElementById('empty-state');
    const totalSpan = document.getElementById('total-volunteers');
    
    // Mettre à jour le total
    totalSpan.textContent = `Total: ${displayList.length} volontaire(s)`;
    
    if (displayList.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = displayList.map((volunteer, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                ${volunteer.photo 
                    ? `<img src="${volunteer.photo}" alt="Photo" class="table-photo">` 
                    : `<div class="table-photo-placeholder"><i class="fas fa-user"></i></div>`}
            </td>
            <td><strong>${escapeHtml(volunteer.nom)}</strong></td>
            <td>${escapeHtml(volunteer.prenom)}</td>
            <td>${escapeHtml(volunteer.telephone)}</td>
            <td>${escapeHtml(volunteer.zone)}</td>
            <td>${escapeHtml(getFormationDisplayNames(volunteer.formations))}</td>
            <td>${escapeHtml(volunteer.disponibilite)}</td>
            <td>
                <span class="${volunteer.statut === 'Actif' ? 'status-active' : 'status-inactive'}">
                    ${volunteer.statut}
                </span>
            </td>
            <td class="actions">
                <button class="btn btn-primary" onclick="printDossierView('${volunteer.id}')" title="Imprimer dossier" style="padding: 8px 10px; font-size: 12px;">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-edit" onclick="editVolunteer('${volunteer.id}')" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteVolunteer('${volunteer.id}')" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==========================================
// RECHERCHE
// ==========================================

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const formationFilter = document.getElementById('search-formation').value;
    
    filterVolunteers(searchTerm, formationFilter);
}

function handleFormationFilter(e) {
    const formationId = e.target.value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    filterVolunteers(searchTerm, formationId);
}

function filterVolunteers(searchTerm = '', formationId = '') {
    let filtered = volunteers;
    
    // Filtrer par terme de recherche
    if (searchTerm) {
        filtered = filtered.filter(v => {
            return (
                v.nom.toLowerCase().includes(searchTerm) ||
                v.prenom.toLowerCase().includes(searchTerm) ||
                v.telephone.includes(searchTerm) ||
                v.email?.toLowerCase().includes(searchTerm) ||
                v.zone.toLowerCase().includes(searchTerm) ||
                v.competences?.toLowerCase().includes(searchTerm)
            );
        });
    }
    
    // Filtrer par formation
    if (formationId) {
        filtered = filtered.filter(v => {
            return v.formations && v.formations.some(f => f.formationId === formationId);
        });
    }
    
    renderVolunteers(filtered);
}

// ==========================================
// EXPORT CSV
// ==========================================

function exportToCSV() {
    if (volunteers.length === 0) {
        showNotification('Aucun volontaire à exporter!', 'warning');
        return;
    }
    
    const headers = [
        'Nom', 'Prénom', 'Sexe', 'Date de naissance', 'Téléphone', 
        'Email', 'Adresse', 'Zone', 'Compétences', 'Formations', 'Disponibilité', 
        'Statut', "Date d'inscription"
    ];
    
    const csvContent = [
        headers.join(';'),
        ...volunteers.map(v => [
            v.nom,
            v.prenom,
            v.sexe,
            v.date_naissance,
            v.telephone,
            v.email || '',
            v.adresse,
            v.zone,
            v.competences || '',
            getFormationDisplayNames(v.formations),
            v.disponibilite,
            v.statut,
            new Date(v.date_inscription).toLocaleDateString('fr-FR')
        ].map(field => `"${field.replace(/"/g, '""')}"`).join(';'))
    ].join('\n');
    
    // Ajouter BOM pour Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `volontaires_cltcrh_${getDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Export CSV réussi!', 'success');
}

// ==========================================
// STATISTIQUES
// ==========================================

function showStats() {
    if (volunteers.length === 0) {
        showNotification('Aucun volontaire enregistré!', 'warning');
        return;
    }
    
    // Statistiques par formation
    const formationCounts = {};
    volunteers.forEach(v => {
        if (v.formations) {
            v.formations.forEach(f => {
                const formation = formations.find(fo => fo.id === f.formationId);
                if (formation) {
                    formationCounts[formation.nom] = (formationCounts[formation.nom] || 0) + 1;
                }
            });
        }
    });
    
    const topFormations = Object.entries(formationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const stats = {
        total: volunteers.length,
        actifs: volunteers.filter(v => v.statut === 'Actif').length,
        inactifs: volunteers.filter(v => v.statut === 'Inactif').length,
        hommes: volunteers.filter(v => v.sexe === 'M').length,
        femmes: volunteers.filter(v => v.sexe === 'F').length,
        zones: [...new Set(volunteers.map(v => v.zone))].length,
        totalFormations: formations.length,
        volontairesFormation: volunteers.filter(v => v.formations && v.formations.length > 0).length
    };
    
    // Compter par zone
    const zoneCounts = {};
    volunteers.forEach(v => {
        zoneCounts[v.zone] = (zoneCounts[v.zone] || 0) + 1;
    });
    
    // Trier par ordre décroissant
    const topZones = Object.entries(zoneCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    let statsHtml = `
        <div class="stat-item">
            <span class="stat-label">Total Volontaires</span>
            <span class="stat-value">${stats.total}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Actifs</span>
            <span class="stat-value">${stats.actifs}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Inactifs</span>
            <span class="stat-value">${stats.inactifs}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Hommes</span>
            <span class="stat-value">${stats.hommes}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Femmes</span>
            <span class="stat-value">${stats.femmes}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Zones représentées</span>
            <span class="stat-value">${stats.zones}</span>
        </div>
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #ccc;">
        <h4 style="margin-bottom: 10px; color: #333;">Formations</h4>
        <div class="stat-item">
            <span class="stat-label">Total Formations</span>
            <span class="stat-value">${stats.totalFormations}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Volontaires formés</span>
            <span class="stat-value">${stats.volontairesFormation}</span>
        </div>
    `;
    
    if (topFormations.length > 0) {
        statsHtml += `
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #ccc;">
            <h4 style="margin-bottom: 10px; color: #333;">Top 5 Formations</h4>
            ${topFormations.map(([formation, count]) => `
                <div class="stat-item">
                    <span class="stat-label">${escapeHtml(formation)}</span>
                    <span class="stat-value">${count}</span>
                </div>
            `).join('')}
        `;
    }
    
    statsHtml += `
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #ccc;">
        <h4 style="margin-bottom: 10px; color: #333;">Top 5 Zones</h4>
        ${topZones.map(([zone, count]) => `
            <div class="stat-item">
                <span class="stat-label">${zone}</span>
                <span class="stat-value">${count}</span>
            </div>
        `).join('')}
    `;
    
    document.getElementById('stats-content').innerHTML = statsHtml;
    document.getElementById('modal-stats').style.display = 'block';
}

function closeStatsModal() {
    document.getElementById('modal-stats').style.display = 'none';
}

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

function generateId() {
    return 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}

function updateLastUpdate() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('last-update').textContent = `Dernière mise à jour: ${formattedDate}`;
}

function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${type === 'success' ? '#28A745' : type === 'warning' ? '#FFC107' : '#17A2B8'};
        color: ${type === 'warning' ? '#000' : '#fff'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

/* ========================================
   GESTION DE LA PHOTO
   ======================================== */

// Fonction pour prévisualiser la photo
function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentPhotoData = e.target.result;
            document.getElementById('photo-preview').src = currentPhotoData;
            document.getElementById('photo-preview-container').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Fonction pour supprimer la photo
function removePhoto() {
    currentPhotoData = null;
    document.getElementById('photo').value = '';
    document.getElementById('photo-preview').src = '';
    document.getElementById('photo-preview-container').style.display = 'none';
}

/* ========================================
   IMPRESSION DU DOSSIER
   ======================================== */

let currentPrintVolunteerId = null;

// Fonction pour afficher le dossier imprimable
function printDossierView(id) {
    const volunteer = volunteers.find(v => v.id === id);
    if (!volunteer) return;
    
    currentPrintVolunteerId = id;
    
    // Calculer l'âge
    let age = '';
    if (volunteer.date_naissance) {
        const today = new Date();
        const birthDate = new Date(volunteer.date_naissance);
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
    }
    
    // Générer le contenu du dossier
    const photoHtml = volunteer.photo 
        ? `<img src="${volunteer.photo}" alt="Photo" class="dossier-photo">`
        : `<div class="dossier-photo-placeholder"><i class="fas fa-user"></i></div>`;
    
    const formationsList = getFormationDisplayNames(volunteer.formations);
    
    const content = `
        <div class="dossier-container">
            <div class="dossier-header">
                <div class="dossier-logo">
                    <span class="cross">✚</span>
                </div>
                <div class="dossier-title">
                    <h1>Comité Local de Tabarre</h1>
                    <h2>Croix-Rouge Haïtienne</h2>
                    <h3>Dossier du Volontaire</h3>
                </div>
            </div>
            
            <div class="dossier-section">
                <div class="dossier-photo-section">
                    ${photoHtml}
                </div>
                <div class="dossier-info">
                    <div class="info-row">
                        <span class="label">Nom:</span>
                        <span class="value">${escapeHtml(volunteer.nom)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Prénom:</span>
                        <span class="value">${escapeHtml(volunteer.prenom)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Sexe:</span>
                        <span class="value">${volunteer.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Date de naissance:</span>
                        <span class="value">${formatDate(volunteer.date_naissance)} ${age ? `(${age} ans)` : ''}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Téléphone:</span>
                        <span class="value">${escapeHtml(volunteer.telephone)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Email:</span>
                        <span class="value">${volunteer.email ? escapeHtml(volunteer.email) : '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Adresse:</span>
                        <span class="value">${escapeHtml(volunteer.adresse)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Zone:</span>
                        <span class="value">${escapeHtml(volunteer.zone)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Groupe sanguin:</span>
                        <span class="value">${volunteer.groupe_sanguin ? escapeHtml(volunteer.groupe_sanguin) : '-'}</span>
                    </div>
                </div>
            </div>
            
            <div class="dossier-section">
                <h4>Informations complémentaires</h4>
                <div class="info-row">
                    <span class="label">Compétences:</span>
                    <span class="value">${volunteer.competences ? escapeHtml(volunteer.competences) : '-'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Disponibilité:</span>
                    <span class="value">${escapeHtml(volunteer.disponibilite)}</span>
                </div>
                <div class="info-row">
                    <span class="label">Statut:</span>
                    <span class="value">${escapeHtml(volunteer.statut)}</span>
                </div>
                <div class="info-row">
                    <span class="label">Date d'inscription:</span>
                    <span class="value">${formatDate(volunteer.date_inscription)}</span>
                </div>
            </div>
            
            <div class="dossier-section">
                <h4>Formations suivies</h4>
                <div class="formations-list">${formationsList}</div>
            </div>
            
            <div class="dossier-footer">
                <p>Document généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p>Comité Local de Tabarre - Croix-Rouge Haïtienne</p>
            </div>
        </div>
    `;
    
    document.getElementById('print-content').innerHTML = content;
    document.getElementById('modal-print').style.display = 'block';
}

// Fonction pour fermer le modal d'impression
function closePrintModal() {
    document.getElementById('modal-print').style.display = 'none';
    currentPrintVolunteerId = null;
}

// Fonction pour imprimer le dossier
function printDossier() {
    const printContent = document.getElementById('print-content').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    
    printWindow.document.write('<!DOCTYPE html>');
    printWindow.document.write('<html lang="fr">');
    printWindow.document.write('<head>');
    printWindow.document.write('<meta charset="UTF-8">');
    printWindow.document.write('<title>Dossier Volontaire - CLTCRH</title>');
    printWindow.document.write(`
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
            .dossier-container { max-width: 700px; margin: 0 auto; }
            .dossier-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #CC0000; }
            .dossier-logo { width: 60px; height: 60px; background: #CC0000; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; }
            .dossier-logo .cross { color: white; font-size: 30px; font-weight: bold; }
            .dossier-title h1 { font-size: 24px; color: #333; text-transform: uppercase; }
            .dossier-title h2 { font-size: 16px; color: #666; }
            .dossier-title h3 { font-size: 18px; color: #CC0000; margin-top: 10px; }
            .dossier-section { margin-bottom: 25px; }
            .dossier-section h4 { font-size: 14px; color: #CC0000; text-transform: uppercase; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #ddd; }
            .dossier-photo-section { text-align: center; margin-bottom: 20px; }
            .dossier-photo { width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 3px solid #CC0000; }
            .dossier-photo-placeholder { width: 150px; height: 150px; background: #f5f5f5; border-radius: 8px; border: 3px solid #ddd; display: inline-flex; align-items: center; justify-content: center; font-size: 60px; color: #ccc; }
            .dossier-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
            .info-row .label { font-weight: 600; color: #666; min-width: 140px; }
            .info-row .value { color: #333; }
            .formations-list { padding: 10px; background: #f9f9f9; border-radius: 5px; }
            .dossier-footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            @media print { body { padding: 0; } }
        </style>
    `);
    printWindow.document.write('</head>');
    printWindow.document.write('<body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body>');
    printWindow.document.write('</html>');
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}
