// app.js - Registre CLTCRH COMPLET
// Compatible index.html + nouvelle activite.html multi-vols

// Global data
let volunteers = [];
let formations = [];
let activities = {};
let selectedVolunteers = [];
let participationRows = [];

// Utils
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key, defaultValue = []) {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

// INIT
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('volunteers-table')) {
        initIndexPage();
    } else if (document.getElementById('volunteer-select') || document.getElementById('volunteers-multi-select')) {
        initActivitePage();
    }
});

// ===================== INDEX PAGE (code original complet) =====================
function initIndexPage() {
    volunteers = loadData('volunteers');
    loadFormations();
    renderVolunteers();
    setupEventListeners();
    const btnActivite = document.getElementById('btn-activite');
    if (btnActivite) btnActivite.onclick = () => window.location.href = 'activite.html';
}

function loadFormations() {
    formations = loadData('formations');
    const formationsSelect = document.getElementById('formations');
    const searchFormationSelect = document.getElementById('search-formation');
    if (formationsSelect) {
        formationsSelect.innerHTML = '<option value="">Sélectionner les formations</option>';
        formations.forEach(f => {
            const option = document.createElement('option');
            option.value = f.id;
            option.textContent = f.nom;
            formationsSelect.appendChild(option);
        });
    }
    if (searchFormationSelect) {
        searchFormationSelect.innerHTML = '<option value="">Toutes les formations</option>';
        formations.forEach(f => {
            const option = document.createElement('option');
            option.value = f.id;
            option.textContent = f.nom;
            searchFormationSelect.appendChild(option);
        });
    }
}

function renderVolunteers() {
    const tbody = document.getElementById('volunteers-tbody');
    const emptyState = document.getElementById('empty-state');
    const totalEl = document.getElementById('total-volunteers');
    
    if (volunteers.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        totalEl.textContent = 'Total: 0 volontaire(s)';
        return;
    }
    
    emptyState.style.display = 'none';
    tbody.innerHTML = '';
    
    volunteers.forEach((vol, index) => {
        const row = document.createElement('tr');
        const formationsCount = vol.formations ? vol.formations.length : 0;
        const years = new Date().getFullYear() - parseInt(vol.annee_integration || 2024);
        const photoSrc = vol.photo ? vol.photo : '';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${photoSrc}" alt="${vol.nom}" class="vol-photo" onerror="this.style.display='none'" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
            <td>${vol.nom || ''}</td>
            <td>${vol.prenom || ''}</td>
            <td>${vol.telephone || ''}</td>
            <td>${vol.zone || ''}</td>
            <td class="nombre-annees">${years}</td>
            <td>${formationsCount}</td>
            <td>${vol.disponibilite || ''}</td>
            <td><span class="status-${vol.statut?.toLowerCase()}">${vol.statut || ''}</span></td>
            <td class="actions">
                <button class="btn btn-edit btn-sm" onclick="editVolunteer('${vol.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteVolunteer('${vol.id}')"><i class="fas fa-trash"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="printVolunteerDossier('${vol.id}')"><i class="fas fa-print"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    totalEl.textContent = `Total: ${volunteers.length} volontaire(s)`;
    const lastUpdateEl = document.getElementById('last-update');
    if (lastUpdateEl) lastUpdateEl.textContent = `Dernière mise à jour: ${new Date().toLocaleDateString('fr-FR')}`;
}

function setupEventListeners() {
    const btnAdd = document.getElementById('btn-add');
    const btnFormations = document.getElementById('btn-formations');
    const btnStats = document.getElementById('btn-stats');
    const btnExport = document.getElementById('btn-export');
    const btnExportPDF = document.getElementById('btn-export-pdf');
    
    if (btnAdd) btnAdd.onclick = () => openModal('modal-form', 'Nouveau Volontaire');
    if (btnFormations) btnFormations.onclick = () => openModal('modal-formations', 'Gérer les Formations');
    if (btnStats) btnStats.onclick = () => openModal('modal-stats', 'Statistiques');
    if (btnExport) btnExport.onclick = exportCSV;
    if (btnExportPDF) btnExportPDF.onclick = exportPDF;
    
    const searchInput = document.getElementById('search-input');
    const searchFormation = document.getElementById('search-formation');
    if (searchInput) searchInput.oninput = filterVolunteers;
    if (searchFormation) searchFormation.onchange = filterVolunteers;
    
    document.querySelectorAll('.close, .close-stats, .close-formations').forEach(closeBtn => {
        closeBtn.onclick = closeAllModals;
    });
    
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) closeAllModals();
    };
    
    const volunteerForm = document.getElementById('volunteer-form');
    if (volunteerForm) volunteerForm.onsubmit = handleVolunteerForm;
    
    const formationForm = document.getElementById('formation-form');
    if (formationForm) formationForm.onsubmit = handleFormationForm;
    
    const btnCancel = document.getElementById('btn-cancel');
    if (btnCancel) btnCancel.onclick = closeAllModals;
}

function openModal(modalId, title) {
    document.getElementById(modalId).style.display = 'block';
    const titleEl = document.getElementById('modal-title');
    if (title && titleEl) titleEl.textContent = title;
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    document.body.style.overflow = 'auto';
    const volunteerForm = document.getElementById('volunteer-form');
    if (volunteerForm) volunteerForm.reset();
    const volunteerId = document.getElementById('volunteer-id');
    if (volunteerId) volunteerId.value = '';
}

function filterVolunteers() {
    const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
    const formationId = document.getElementById('search-formation')?.value;
    
    const filtered = volunteers.filter(vol => {
        const matchesSearch = !searchTerm || 
            vol.nom?.toLowerCase().includes(searchTerm) || 
            vol.prenom?.toLowerCase().includes(searchTerm) ||
            vol.telephone?.includes(searchTerm);
        const matchesFormation = !formationId || vol.formations?.includes(formationId);
        return matchesSearch && matchesFormation;
    });
    
    const originalLength = volunteers.length;
    volunteers = filtered;
    renderVolunteers();
    volunteers = originalLength === volunteers.length ? volunteers : loadData('volunteers');
}

function handleVolunteerForm(e) {
    e.preventDefault();
    const formData = {
        id: document.getElementById('volunteer-id').value || Date.now().toString(),
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
        sexe: document.getElementById('sexe').value,
        date_naissance: document.getElementById('date_naissance').value,
        telephone: document.getElementById('telephone').value,
        groupe_sanguin: document.getElementById('groupe_sanguin').value,
        email: document.getElementById('email').value,
        photo: document.getElementById('photo-preview')?.src || '',
        adresse: document.getElementById('adresse').value,
        zone: document.getElementById('custom-localite')?.value || document.getElementById('zone').value,
        competences: document.getElementById('competences').value,
        annee_integration: document.getElementById('annee_integration').value,
        disponibilite: document.getElementById('disponibilite').value,
        statut: document.getElementById('statut').value,
        formations: Array.from(document.getElementById('formations')?.selectedOptions || []).map(opt => opt.value)
    };
    
    const index = volunteers.findIndex(v => v.id === formData.id);
    if (index > -1) {
        volunteers[index] = formData;
    } else {
        volunteers.unshift(formData);
    }
    
    saveData('volunteers', volunteers);
    renderVolunteers();
    closeAllModals();
    alert('Volontaire enregistré!');
}

function handleFormationForm(e) {
    e.preventDefault();
    const formData = {
        id: Date.now().toString(),
        nom: document.getElementById('formation-nom').value,
        date: document.getElementById('formation-date').value,
        duree: document.getElementById('formation-duree').value,
        description: document.getElementById('formation-description').value
    };
    
    formations.unshift(formData);
    saveData('formations', formations);
    loadFormations();
    e.target.reset();
    alert('Formation ajoutée!');
}

function exportCSV() {
const csv = ['#ID,Nom,Prénom,Téléphone,Localité,Année,Formations,Statut'];
    volunteers.forEach(vol => csv.push([vol.id, vol.nom, vol.prenom, vol.telephone, vol.zone, vol.annee_integration, (vol.formations?.length||0), vol.statut].join(',')));
    const blob = new Blob([csv.join('\n')], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volontaires_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
}

function exportPDF() {
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Registre CLTCRH', 20, 20);
    doc.setFontSize(12);
    let y = 40;
    volunteers.forEach((vol, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${i+1}. ${vol.prenom} ${vol.nom} - ${vol.telephone}`, 20, y);
        y += 10;
    });
    doc.save(`volontaires_${new Date().toISOString().slice(0,10)}.pdf`);
}

function editVolunteer(id) { alert('Éditer ' + id); }
function deleteVolunteer(id) { 
    if (confirm('Supprimer?')) {
        volunteers = volunteers.filter(v => v.id !== id);
        saveData('volunteers', volunteers);
        renderVolunteers();
    } 
}
function printVolunteerDossier(id) { alert('Imprimer ' + id); }

function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('photo-preview').src = e.target.result;
            document.getElementById('photo-preview-container').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function removePhoto() {
    document.getElementById('photo').value = '';
    document.getElementById('photo-preview-container').style.display = 'none';
}

// ===================== ACTIVITE PAGE =====================
function initActivitePage() {
    volunteers = loadData('volunteers', []);
    activities = loadData('activitiesByVolunteer', {});
    window.globalActivities = loadData('globalActivities', []);

    const volunteerSelect = document.getElementById('volunteer-select');
    const yearSelect = document.getElementById('year-select');
    const btnBack = document.getElementById('btn-back');
    const btnSave = document.getElementById('btn-save-activities');
    const btnExportPdf = document.getElementById('btn-export-activities-pdf');
    const btnAddReunion = document.getElementById('btn-add-reunion');
    const btnAddTerrain = document.getElementById('btn-add-terrain');
    const btnManage = document.getElementById('btn-manage-activities');

    if (!volunteerSelect || !yearSelect) return;

    yearSelect.value = new Date().getFullYear();
    volunteerSelect.innerHTML = '<option value="">Sélectionner un volontaire</option>';

    volunteers.forEach(vol => {
        const option = document.createElement('option');
        option.value = vol.id;
        option.textContent = `${vol.prenom || ''} ${vol.nom || ''}`.trim();
        volunteerSelect.appendChild(option);
    });

    volunteerSelect.onchange = loadVolunteerActivities;
    yearSelect.onchange = loadVolunteerActivities;

    if (btnBack) btnBack.onclick = () => window.location.href = 'index.html';
    if (btnSave) btnSave.onclick = saveVolunteerActivities;
    if (btnExportPdf) btnExportPdf.onclick = exportActivitiesPdf;
    if (btnAddReunion) btnAddReunion.onclick = () => addReunionRow();
    if (btnAddTerrain) btnAddTerrain.onclick = () => addTerrainRow();
    if (btnManage) btnManage.onclick = toggleManageActivities;

    updateAnnualTotals();
    renderGlobalParticipations();
    renderGlobalSummary();
}

function getSelectedVolunteerId() {
    return document.getElementById('volunteer-select')?.value || '';
}

function getSelectedYear() {
    return parseInt(document.getElementById('year-select')?.value, 10) || new Date().getFullYear();
}

function loadVolunteerActivities() {
    const volunteerId = getSelectedVolunteerId();
    const year = getSelectedYear();
    const reunionBody = document.getElementById('tbody-reunion');
    const terrainBody = document.getElementById('tbody-terrain');

    if (!reunionBody || !terrainBody) return;

    reunionBody.innerHTML = '';
    terrainBody.innerHTML = '';

    if (!volunteerId) {
        updateAnnualTotals();
        renderGlobalParticipations();
        renderGlobalSummary();
        return;
    }

    const currentData = activities[volunteerId] || { reunion: [], terrain: [] };
    const reunionRows = (currentData.reunion || []).filter(item => (item.date || '').startsWith(String(year)));
    const terrainRows = (currentData.terrain || []).filter(item => (item.date || '').startsWith(String(year)));

    reunionRows.forEach(item => addReunionRow(item));
    terrainRows.forEach(item => addTerrainRow(item));
    updateAnnualTotals();
    renderGlobalParticipations();
    renderGlobalSummary();
}

function addReunionRow(data = { date: '', present: false }) {
    const tbody = document.getElementById('tbody-reunion');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="date" class="input-reunion-date" value="${data.date || ''}"></td>
        <td><input type="checkbox" class="check-reunion-present" ${data.present ? 'checked' : ''}></td>
    `;
    tbody.appendChild(tr);

    tr.querySelector('.check-reunion-present').onchange = updateAnnualTotals;
    tr.querySelector('.input-reunion-date').onchange = updateAnnualTotals;
}

function addTerrainRow(data = { date: '', activity: '', present: false }) {
    const tbody = document.getElementById('tbody-terrain');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="date" class="input-terrain-date" value="${data.date || ''}"></td>
        <td><input type="text" class="input-terrain-name" placeholder="Nom de l'activité" value="${data.activity || ''}"></td>
        <td><input type="checkbox" class="check-terrain-present" ${data.present ? 'checked' : ''}></td>
    `;
    tbody.appendChild(tr);

    tr.querySelector('.check-terrain-present').onchange = updateAnnualTotals;
    tr.querySelector('.input-terrain-date').onchange = updateAnnualTotals;
}

function saveVolunteerActivities() {
    const volunteerId = getSelectedVolunteerId();
    const year = String(getSelectedYear());
    if (!volunteerId) return alert('Veuillez sélectionner un volontaire.');

    const existing = activities[volunteerId] || { reunion: [], terrain: [] };
    const keepReunion = (existing.reunion || []).filter(item => !(item.date || '').startsWith(year));
    const keepTerrain = (existing.terrain || []).filter(item => !(item.date || '').startsWith(year));

    const reunionRows = Array.from(document.querySelectorAll('#tbody-reunion tr')).map(row => ({
        date: row.querySelector('.input-reunion-date')?.value || '',
        present: row.querySelector('.check-reunion-present')?.checked || false
    })).filter(item => item.date);

    const terrainRows = Array.from(document.querySelectorAll('#tbody-terrain tr')).map(row => ({
        date: row.querySelector('.input-terrain-date')?.value || '',
        activity: row.querySelector('.input-terrain-name')?.value.trim() || '',
        present: row.querySelector('.check-terrain-present')?.checked || false
    })).filter(item => item.date);

    activities[volunteerId] = {
        reunion: [...keepReunion, ...reunionRows],
        terrain: [...keepTerrain, ...terrainRows]
    };

    saveData('activitiesByVolunteer', activities);
    alert('Activités enregistrées.');
    updateAnnualTotals();
    renderGlobalParticipations();
    renderGlobalSummary();
}

function updateAnnualTotals() {
    const totalReunion = Array.from(document.querySelectorAll('.check-reunion-present:checked')).length;
    const totalTerrain = Array.from(document.querySelectorAll('.check-terrain-present:checked')).length;
    const totalAnnuel = totalReunion + totalTerrain;

    const reunionEl = document.getElementById('total-reunion');
    const terrainEl = document.getElementById('total-terrain');
    const totalEl = document.getElementById('total-annuel');

    if (reunionEl) reunionEl.textContent = totalReunion;
    if (terrainEl) terrainEl.textContent = totalTerrain;
    if (totalEl) totalEl.textContent = totalAnnuel;
}

function renderGlobalSummary() {
    const tbody = document.getElementById('tbody-global-summary');
    if (!tbody) return;

    const year = String(getSelectedYear());
    tbody.innerHTML = '';
    const totalsByVolunteer = volunteers.map(vol => {
        const data = activities[vol.id] || { reunion: [], terrain: [] };
        const reunionCount = (data.reunion || []).filter(item =>
            (item.date || '').startsWith(year) && item.present
        ).length;
        const terrainCount = (data.terrain || []).filter(item =>
            (item.date || '').startsWith(year) && item.present
        ).length;
        const total = reunionCount + terrainCount;
        return { vol, reunionCount, terrainCount, total };
    });

    const maxTotal = totalsByVolunteer.length
        ? Math.max(...totalsByVolunteer.map(item => item.total))
        : 0;

    totalsByVolunteer.forEach(item => {
        const { vol, reunionCount, terrainCount, total } = item;
        const star = maxTotal > 0 && total === maxTotal ? ' ⭐' : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${((vol.prenom || '') + ' ' + (vol.nom || '')).trim()}${star}</td>
            <td>${reunionCount}</td>
            <td>${terrainCount}</td>
            <td><strong>${total}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderGlobalParticipations() {
    const tbody = document.getElementById('tbody-global-participations');
    if (!tbody) return;

    const year = String(getSelectedYear());
    tbody.innerHTML = '';

    const rows = [];
    volunteers.forEach(vol => {
        const data = activities[vol.id] || { reunion: [], terrain: [] };
        const fullName = `${vol.prenom || ''} ${vol.nom || ''}`.trim() || 'Volontaire';

        (data.reunion || []).forEach(item => {
            if ((item.date || '').startsWith(year) && item.present) {
                rows.push({
                    name: fullName,
                    type: 'Réunion de fidélisation',
                    date: item.date
                });
            }
        });

        (data.terrain || []).forEach(item => {
            if ((item.date || '').startsWith(year) && item.present) {
                rows.push({
                    name: fullName,
                    type: 'Activité de terrain',
                    date: item.date
                });
            }
        });
    });

    rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.name.localeCompare(b.name)));

    if (!rows.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="3">Aucune participation enregistrée pour cette année.</td>`;
        tbody.appendChild(tr);
        return;
    }

    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.name}</td>
            <td>${row.type}</td>
            <td>${row.date}</td>
        `;
        tbody.appendChild(tr);
    });
}

function exportActivitiesPdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('La librairie PDF est introuvable.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const year = String(getSelectedYear());

    doc.setFontSize(16);
    doc.text(`CLTCRH - Recapitulatif Activites ${year}`, 14, 18);
    doc.setFontSize(11);

    let y = 30;
    doc.text('Volontaire', 14, y);
    doc.text('Reunions', 100, y);
    doc.text('Terrain', 135, y);
    doc.text('Total', 170, y);
    y += 6;
    doc.line(14, y, 195, y);
    y += 6;

    const totalsByVolunteer = volunteers.map(vol => {
        const data = activities[vol.id] || { reunion: [], terrain: [] };
        const reunionCount = (data.reunion || []).filter(item =>
            (item.date || '').startsWith(year) && item.present
        ).length;
        const terrainCount = (data.terrain || []).filter(item =>
            (item.date || '').startsWith(year) && item.present
        ).length;
        const total = reunionCount + terrainCount;
        return { vol, reunionCount, terrainCount, total };
    });
    const maxTotal = totalsByVolunteer.length
        ? Math.max(...totalsByVolunteer.map(item => item.total))
        : 0;

    totalsByVolunteer.forEach(item => {
        const { vol, reunionCount, terrainCount, total } = item;
        const star = maxTotal > 0 && total === maxTotal ? ' *' : '';
        const fullName = `${vol.prenom || ''} ${vol.nom || ''}`.trim() + star;

        if (y > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text(fullName.slice(0, 45), 14, y);
        doc.text(String(reunionCount), 105, y);
        doc.text(String(terrainCount), 140, y);
        doc.text(String(total), 172, y);
        y += 7;
    });

    doc.save(`recap_activites_${year}.pdf`);
}

// ==================== GESTION DES ACTIVITÉS GLOBALES ====================

function toggleManageActivities() {
    const manageSection = document.getElementById('manage-activities-section');
    const activitySections = document.querySelector('.activity-sections:not(#manage-activities-section)');
    const btnManage = document.getElementById('btn-manage-activities');

    window.globalActivities = loadData('globalActivities', []);

    if (manageSection.style.display === 'none') {
        initMultiSelect();
        renderGlobalActivities();
        manageSection.style.display = 'block';
        activitySections.style.display = 'none';
        btnManage.innerHTML = '<i class="fas fa-arrow-left"></i> Retour aux Activités par Volontaire';
    } else {
        manageSection.style.display = 'none';
        activitySections.style.display = 'block';
        btnManage.innerHTML = '<i class="fas fa-calendar-check"></i> Gérer les Activités';
    }
}

function initMultiSelect() {
    const container = document.getElementById('volunteers-multi-select');
    if (!container) return;

    container.innerHTML = '';
    volunteers.forEach(vol => {
        const label = document.createElement('label');
        label.className = 'multi-select-item';
        label.innerHTML = `
            <input type="checkbox" value="${vol.id}" class="volunteer-checkbox">
            <span>${vol.prenom || ''} ${vol.nom || ''}</span>
        `;
        container.appendChild(label);
    });
}

function renderGlobalActivities() {
    const tbody = document.getElementById('tbody-activities');
    if (!tbody) return;

    tbody.innerHTML = '';
    globalActivities.forEach(activity => {
        const participants = activity.participants || [];
        const presentCount = participants.filter(p => p.present).length;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${activity.type === 'reunion' ? 'Réunion' : 'Terrain'}</td>
            <td>${activity.name || 'Réunion de fidélisation'}</td>
            <td>${activity.date || ''}</td>
            <td>${presentCount}/${participants.length}</td>
            <td class="actions">
                <button class="btn btn-edit btn-sm" onclick="editGlobalActivity('${activity.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteGlobalActivity('${activity.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function createGlobalActivity() {
    const type = document.getElementById('activity-type').value;
    const name = type === 'terrain' ? document.getElementById('activity-name').value : '';
    const date = document.getElementById('activity-date').value;
    const selectedCheckboxes = document.querySelectorAll('#volunteers-multi-select .volunteer-checkbox:checked');

    if (!date) return alert('Veuillez sélectionner une date.');
    if (selectedCheckboxes.length === 0) return alert('Veuillez sélectionner au moins un volontaire.');

    const participants = Array.from(selectedCheckboxes).map(cb => ({
        volunteerId: cb.value,
        present: false
    }));

    const activity = {
        id: Date.now().toString(),
        type,
        name,
        date,
        participants
    };

    globalActivities.push(activity);
    saveData('globalActivities', globalActivities);
    renderGlobalActivities();

    // Reset form
    document.getElementById('activity-date').value = '';
    document.getElementById('activity-name').value = '';
    document.querySelectorAll('#volunteers-multi-select .volunteer-checkbox').forEach(cb => cb.checked = false);

    alert('Activité créée avec succès!');
}

function editGlobalActivity(activityId) {
    const activity = globalActivities.find(a => a.id === activityId);
    if (!activity) return;

    // Ouvrir une modal ou une section d'édition
    // Pour simplifier, on peut utiliser une alerte ou créer une nouvelle section
    const participantsText = activity.participants.map(p => {
        const vol = volunteers.find(v => v.id === p.volunteerId);
        return `${vol ? `${vol.prenom} ${vol.nom}` : 'Inconnu'}: ${p.present ? 'Présent' : 'Absent'}`;
    }).join('\n');

    const newPresence = prompt(`Modifier les présences pour l'activité du ${activity.date}:\n${participantsText}\n\nEntrez les IDs des volontaires présents (séparés par des virgules):`, 
        activity.participants.filter(p => p.present).map(p => p.volunteerId).join(','));

    if (newPresence !== null) {
        const presentIds = newPresence.split(',').map(id => id.trim());
        activity.participants.forEach(p => {
            p.present = presentIds.includes(p.volunteerId);
        });
        saveData('globalActivities', globalActivities);
        renderGlobalActivities();
        alert('Présences mises à jour!');
    }
}

function deleteGlobalActivity(activityId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité?')) return;
    
    globalActivities = globalActivities.filter(a => a.id !== activityId);
    saveData('globalActivities', globalActivities);
    renderGlobalActivities();
}

// Event listeners pour les nouvelles fonctionnalités - Moved to initActivitePage
const activityTypeSelect = document.getElementById('activity-type');
if (activityTypeSelect) {
    activityTypeSelect.onchange = function() {
        const nameGroup = document.getElementById('activity-name-group');
        nameGroup.style.display = this.value === 'terrain' ? 'block' : 'none';
    };
}

const btnCreateActivity = document.getElementById('btn-create-activity');
if (btnCreateActivity) {
    btnCreateActivity.onclick = createGlobalActivity;
}


// Global functions pour onclick
window.editVolunteer = editVolunteer;
window.deleteVolunteer = deleteVolunteer;
window.printVolunteerDossier = printVolunteerDossier;
window.previewPhoto = previewPhoto;
window.removePhoto = removePhoto;
window.closeAllModals = closeAllModals;
window.editGlobalActivity = editGlobalActivity;
window.deleteGlobalActivity = deleteGlobalActivity;

console.log('app.js - Index + Activité OK');

