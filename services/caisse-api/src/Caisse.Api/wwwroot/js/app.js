/**
 * Caisse ADH - Main Application JavaScript
 * Migration Magic Unipaas vers .NET 8
 */

// ========================================
// Configuration
// ========================================

const API_BASE = '';
const APP_STATE = {
    currentPage: 'dashboard',
    currentUser: null,
    currentSession: null,
    societe: 'C'
};

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadDashboardData();
    setCurrentDate();
});

function initializeApp() {
    // Check for saved user
    const savedUser = localStorage.getItem('caisseUser');
    if (savedUser) {
        APP_STATE.currentUser = JSON.parse(savedUser);
        updateUserDisplay();
    }

    // Check for saved societe
    const savedSociete = localStorage.getItem('caisseSociete');
    if (savedSociete) {
        APP_STATE.societe = savedSociete;
    }

    // Set checkout date to today
    const today = new Date().toISOString().split('T')[0];
    const checkoutDate = document.getElementById('checkoutDate');
    if (checkoutDate) {
        checkoutDate.value = today;
    }
}

function setCurrentDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });

    // Tabs
    document.querySelectorAll('.tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const parent = tab.closest('.page');
            parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const tabId = 'tab-' + tab.dataset.tab;
            document.getElementById(tabId)?.classList.add('active');
        });
    });

    // Compte tabs
    document.querySelectorAll('.compte-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.compte-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.compte-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const tabId = 'comptab-' + tab.dataset.comptab;
            document.getElementById(tabId)?.classList.add('active');
        });
    });

    // Comptage inputs
    document.querySelectorAll('.comptage-input').forEach(input => {
        input.addEventListener('input', updateComptageTotal);
    });
}

// ========================================
// Navigation
// ========================================

function navigateTo(page) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) {
        pageEl.classList.add('active');
    }

    // Update title
    const titles = {
        'dashboard': 'Tableau de bord',
        'identification': 'Identification Operateur',
        'session': 'Gestion Session Caisse',
        'comptage': 'Comptage Caisse',
        'ventes': 'Gestion des Ventes',
        'devises': 'Gestion Devises & Coffre',
        'change': 'Operations de Change',
        'compte': 'Consultation Compte Client',
        'extrait': 'Extrait de Compte',
        'garantie': 'Garanties et Depots',
        'checkout': 'Easy Check-Out',
        'factures': 'Facturation',
        'telephone': 'Gestion Telephone',
        'ezcard': 'EzCard / Club Med Pass',
        'depot': 'Gestion des Depots',
        'divers': 'Administration - Divers'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    APP_STATE.currentPage = page;

    // Load page-specific data
    loadPageData(page);
}

function loadPageData(page) {
    switch (page) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'session':
            loadSessions();
            break;
        case 'devises':
            loadSessionsForSelect('deviseSessionSelect');
            break;
        case 'change':
            loadTauxChange();
            break;
    }
}

// ========================================
// Sidebar
// ========================================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// ========================================
// Dashboard
// ========================================

async function loadDashboardData() {
    try {
        // Load sessions count
        const sessionsRes = await fetch(`${API_BASE}/api/sessions?societe=${APP_STATE.societe}`);
        if (sessionsRes.ok) {
            const sessions = await sessionsRes.json();
            const openSessions = sessions.filter(s => s.estOuverte);
            document.getElementById('statSessions').textContent = openSessions.length;

            // Update recent sessions table
            const tbody = document.querySelector('#recentSessions tbody');
            tbody.innerHTML = sessions.slice(0, 5).map(s => `
                <tr>
                    <td>${s.chrono}</td>
                    <td>${s.utilisateur}</td>
                    <td>${formatDate(s.dateDebutSession)}</td>
                    <td><span class="badge ${s.estOuverte ? 'badge-open' : 'badge-closed'}">${s.estOuverte ? 'Ouverte' : 'Fermee'}</span></td>
                </tr>
            `).join('');
        }

        // Load devises count
        const devisesRes = await fetch(`${API_BASE}/api/devises/${APP_STATE.societe}`);
        if (devisesRes.ok) {
            const devises = await devisesRes.json();
            document.getElementById('statDevises').textContent = devises.length;
        }

        // Load articles for ventes indication
        const articlesRes = await fetch(`${API_BASE}/api/articles`);
        if (articlesRes.ok) {
            const articles = await articlesRes.json();
            document.getElementById('statVentes').textContent = articles.length;
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function refreshData() {
    loadPageData(APP_STATE.currentPage);
    showToast('Donnees rafraichies', 'success');
}

// ========================================
// Identification
// ========================================

async function handleLogin(event) {
    event.preventDefault();

    const societe = document.getElementById('loginSociete').value;
    const operateur = document.getElementById('loginOperateur').value;
    const password = document.getElementById('loginPassword').value;

    hideElement('loginError');
    hideElement('loginSuccess');

    try {
        const response = await fetch(`${API_BASE}/api/identification/verifier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ societe, codeOperateur: operateur, motDePasse: password })
        });

        const result = await response.json();

        if (result.authentifie) {
            APP_STATE.currentUser = result;
            APP_STATE.societe = societe;
            localStorage.setItem('caisseUser', JSON.stringify(result));
            localStorage.setItem('caisseSociete', societe);
            updateUserDisplay();
            showElement('loginSuccess', 'Connexion reussie! Redirection...');
            setTimeout(() => navigateTo('dashboard'), 1500);
        } else {
            showElement('loginError', result.message || 'Identifiants invalides');
        }
    } catch (error) {
        showElement('loginError', 'Erreur de connexion au serveur');
    }
}

function updateUserDisplay() {
    if (APP_STATE.currentUser) {
        document.querySelector('.user-name').textContent = APP_STATE.currentUser.nomOperateur || APP_STATE.currentUser.codeOperateur;
        document.querySelector('.user-role').textContent = 'Operateur';
        document.getElementById('villageName').textContent = `Societe: ${APP_STATE.societe}`;
    }
}

// ========================================
// Sessions
// ========================================

async function loadSessions() {
    try {
        const response = await fetch(`${API_BASE}/api/sessions?societe=${APP_STATE.societe}`);
        if (!response.ok) throw new Error('Erreur chargement sessions');

        const sessions = await response.json();
        const openSessions = sessions.filter(s => s.estOuverte);

        // Update sessions table
        const tbody = document.querySelector('#sessionsTable tbody');
        tbody.innerHTML = openSessions.map(s => `
            <tr>
                <td>${s.chrono}</td>
                <td>${s.utilisateur}</td>
                <td>${formatDate(s.dateDebutSession)}</td>
                <td>${formatTime(s.heureDebutSession)}</td>
                <td>${formatMoney(s.montantInitial || 0)}</td>
                <td><span class="badge badge-open">Ouverte</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="selectSessionForClose('${s.chrono}')">
                        <i class="fas fa-door-closed"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Update close session select
        const select = document.getElementById('closeSessionSelect');
        select.innerHTML = '<option value="">-- Selectionner --</option>' +
            openSessions.map(s => `<option value="${s.chrono}">${s.chrono} - ${s.utilisateur}</option>`).join('');

        // Update session status
        updateSessionStatus(openSessions.length > 0);

    } catch (error) {
        showToast('Erreur chargement sessions: ' + error.message, 'error');
    }
}

async function handleOpenSession(event) {
    event.preventDefault();

    const societe = document.getElementById('openSociete').value;
    const operateur = document.getElementById('openOperateur').value;

    const data = {
        societe,
        utilisateur: operateur,
        dateDebutSession: formatDateForApi(new Date()),
        heureDebutSession: formatTimeForApi(new Date()),
        estOuverte: true,
        montantInitialEspeces: parseFloat(document.getElementById('openMontantEspeces').value) || 0,
        montantInitialDevises: parseFloat(document.getElementById('openMontantDevises').value) || 0,
        montantInitialCartes: parseFloat(document.getElementById('openMontantCartes').value) || 0,
        montantInitialCheques: parseFloat(document.getElementById('openMontantCheques').value) || 0,
        montantApportCoffre: parseFloat(document.getElementById('openApportCoffre').value) || 0,
        nombreDevisesInitial: parseInt(document.getElementById('openNbDevises').value) || 0
    };

    try {
        const response = await fetch(`${API_BASE}/api/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('Session ouverte avec succes', 'success');
            loadSessions();
            event.target.reset();
            document.getElementById('openSociete').value = APP_STATE.societe;
        } else {
            const error = await response.json();
            showToast('Erreur: ' + (error.message || 'Impossible d\'ouvrir la session'), 'error');
        }
    } catch (error) {
        showToast('Erreur serveur: ' + error.message, 'error');
    }
}

async function handleCloseSession(event) {
    event.preventDefault();

    const chrono = document.getElementById('closeSessionSelect').value;
    if (!chrono) {
        showToast('Selectionnez une session a fermer', 'warning');
        return;
    }

    const commentaire = document.getElementById('closeCommentaire').value;

    const data = {
        chrono: parseFloat(chrono),
        montantFinalEspeces: parseFloat(document.getElementById('closeMontantEspeces').value) || 0,
        montantFinalDevises: parseFloat(document.getElementById('closeMontantDevises').value) || 0,
        montantFinalCartes: parseFloat(document.getElementById('closeMontantCartes').value) || 0,
        montantFinalCheques: parseFloat(document.getElementById('closeMontantCheques').value) || 0,
        commentaireEcart: commentaire,
        forcerFermeture: commentaire ? true : false
    };

    try {
        const response = await fetch(`${API_BASE}/api/sessions/${chrono}/fermer`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('Session fermee avec succes', 'success');
            loadSessions();
            event.target.reset();
            hideElement('ecartDisplay');
            hideElement('commentaireGroup');
        } else {
            const error = await response.json();
            if (error.message && error.message.includes('ecart')) {
                showElement('ecartDisplay');
                showElement('commentaireGroup');
                showToast('Ecart detecte - Commentaire obligatoire', 'warning');
            } else {
                showToast('Erreur: ' + (error.message || 'Impossible de fermer'), 'error');
            }
        }
    } catch (error) {
        showToast('Erreur serveur: ' + error.message, 'error');
    }
}

function selectSessionForClose(chrono) {
    document.getElementById('closeSessionSelect').value = chrono;
}

function updateSessionStatus(hasOpenSession) {
    const statusEl = document.querySelector('.session-status');
    if (hasOpenSession) {
        statusEl.classList.remove('closed');
        statusEl.classList.add('open');
        statusEl.textContent = 'Session ouverte';
    } else {
        statusEl.classList.remove('open');
        statusEl.classList.add('closed');
        statusEl.textContent = 'Session fermee';
    }
}

async function loadSessionsForSelect(selectId) {
    try {
        const response = await fetch(`${API_BASE}/api/sessions?societe=${APP_STATE.societe}`);
        if (!response.ok) return;

        const sessions = await response.json();
        const openSessions = sessions.filter(s => s.estOuverte);

        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">-- Selectionner une session --</option>' +
                openSessions.map(s => `<option value="${s.chrono}">${s.chrono} - ${s.utilisateur}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading sessions for select:', error);
    }
}

// ========================================
// Comptage
// ========================================

function updateComptageTotal() {
    let total = 0;
    document.querySelectorAll('.comptage-input').forEach(input => {
        const value = parseFloat(input.dataset.value);
        const count = parseInt(input.value) || 0;
        const rowTotal = value * count;
        total += rowTotal;
        input.parentElement.querySelector('.comptage-total').textContent = formatMoney(rowTotal);
    });

    document.getElementById('totalComptage').textContent = formatMoney(total) + ' EUR';

    // Calculate ecart
    const theorique = parseFloat(document.getElementById('totalTheorique').textContent) || 0;
    const ecart = total - theorique;
    const ecartEl = document.getElementById('ecartComptage');
    ecartEl.textContent = formatMoney(ecart) + ' EUR';
    ecartEl.style.color = Math.abs(ecart) > 0.01 ? 'var(--warning)' : 'var(--success)';
}

function resetComptage() {
    document.querySelectorAll('.comptage-input').forEach(input => {
        input.value = 0;
    });
    updateComptageTotal();
}

function validerComptage() {
    const total = document.getElementById('totalComptage').textContent;
    showToast(`Comptage valide: ${total}`, 'success');
}

// ========================================
// Ventes
// ========================================

async function searchVentes() {
    const societe = document.getElementById('venteSociete').value;
    const compte = document.getElementById('venteCompte').value;
    const filiation = document.getElementById('venteFiliation').value;

    if (!compte) {
        showToast('Entrez un numero de compte', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/ventes/historique/${societe}/${compte}/${filiation || '0000'}`);

        if (response.ok) {
            const ventes = await response.json();
            const tbody = document.querySelector('#ventesTable tbody');
            tbody.innerHTML = ventes.map(v => `
                <tr>
                    <td>${formatDate(v.dateVente)}</td>
                    <td>${formatTime(v.heureVente)}</td>
                    <td>${v.codeArticle}</td>
                    <td>${v.quantite}</td>
                    <td>${formatMoney(v.montant)}</td>
                    <td>${v.modePaiement || '-'}</td>
                </tr>
            `).join('');

            if (ventes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucune vente trouvee</td></tr>';
            }
        } else {
            showToast('Compte non trouve', 'warning');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

async function searchGiftPass() {
    const societe = document.getElementById('gpSociete').value;
    const compte = document.getElementById('gpCompte').value;
    const filiation = document.getElementById('gpFiliation').value;

    if (!compte) {
        showToast('Entrez un numero de compte', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/ventes/solde-giftpass/${societe}/${compte}/${filiation || '0000'}`);

        if (response.ok) {
            const result = await response.json();
            document.getElementById('gpSolde').textContent = formatMoney(result.solde || 0);
            document.getElementById('gpDevise').textContent = result.devise || 'EUR';
            showElement('giftPassResult');
        } else {
            hideElement('giftPassResult');
            showToast('Aucun Gift Pass trouve', 'warning');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

async function searchResortCredit() {
    const societe = document.getElementById('rcSociete').value;
    const compte = document.getElementById('rcCompte').value;
    const filiation = document.getElementById('rcFiliation').value;
    const service = document.getElementById('rcService').value;

    if (!compte) {
        showToast('Entrez un numero de compte', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/ventes/solde-resortcredit/${societe}/${compte}/${filiation || '0000'}/${service || 'ALL'}`);

        if (response.ok) {
            const result = await response.json();
            document.getElementById('rcSolde').textContent = formatMoney(result.soldeDisponible || 0);
            document.getElementById('rcDevise').textContent = result.devise || 'EUR';
            showElement('resortCreditResult');
        } else {
            hideElement('resortCreditResult');
            showToast('Aucun Resort Credit trouve', 'warning');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

// ========================================
// Devises
// ========================================

async function loadDevisesSession() {
    const chrono = document.getElementById('deviseSessionSelect').value;
    if (!chrono) return;

    try {
        const response = await fetch(`${API_BASE}/api/sessions/${chrono}/devises`);

        if (response.ok) {
            const devises = await response.json();
            const tbody = document.querySelector('#devisesTable tbody');
            tbody.innerHTML = devises.map(d => `
                <tr>
                    <td>${d.codeDevise}</td>
                    <td>${d.libelle || '-'}</td>
                    <td>${d.quantite}</td>
                    <td>${formatMoney(d.montant)}</td>
                    <td>${d.tauxChange || '-'}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

// ========================================
// Change
// ========================================

async function loadTauxChange() {
    const societe = document.getElementById('tauxSociete')?.value || APP_STATE.societe;

    try {
        const response = await fetch(`${API_BASE}/api/change/taux/${societe}`);

        if (response.ok) {
            const taux = await response.json();
            const tbody = document.querySelector('#tauxTable tbody');
            tbody.innerHTML = taux.map(t => `
                <tr>
                    <td>${t.codeDevise}</td>
                    <td>${t.tauxAchat}</td>
                    <td>${t.tauxVente}</td>
                    <td>${formatDate(t.dateValidite)}</td>
                </tr>
            `).join('');

            // Update select options
            updateDeviseSelects(taux);
        }
    } catch (error) {
        console.error('Error loading taux:', error);
    }
}

function updateDeviseSelects(taux) {
    const options = taux.map(t => `<option value="${t.codeDevise}">${t.codeDevise} - ${t.libelle || t.codeDevise}</option>`).join('');

    const sourceSelect = document.getElementById('changeDeviseSource');
    const cibleSelect = document.getElementById('changeDeviseCible');

    if (sourceSelect && options) {
        sourceSelect.innerHTML = options;
    }
    if (cibleSelect && options) {
        cibleSelect.innerHTML = options;
        if (cibleSelect.options.length > 1) {
            cibleSelect.selectedIndex = 1;
        }
    }
}

async function calculateChange() {
    const montant = parseFloat(document.getElementById('changeMontant').value) || 0;
    const source = document.getElementById('changeDeviseSource').value;
    const cible = document.getElementById('changeDeviseCible').value;

    if (!source || !cible || source === cible) {
        document.getElementById('changeResult').textContent = formatMoney(montant);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/change/calculer/${APP_STATE.societe}/${source}/${cible}/${montant}`);

        if (response.ok) {
            const result = await response.json();
            document.getElementById('changeResult').textContent = formatMoney(result.montantConverti);
            document.getElementById('changeTaux').textContent = `Taux: ${result.tauxApplique}`;
            document.getElementById('changeType').textContent = `Type: ${result.typeOperation}`;
        }
    } catch (error) {
        console.error('Error calculating change:', error);
    }
}

function swapDevises() {
    const source = document.getElementById('changeDeviseSource');
    const cible = document.getElementById('changeDeviseCible');
    const temp = source.value;
    source.value = cible.value;
    cible.value = temp;
    calculateChange();
}

// ========================================
// Compte
// ========================================

async function searchCompte() {
    const societe = document.getElementById('compteSociete').value;
    const compte = document.getElementById('compteNumero').value;
    const filiation = document.getElementById('compteFiliation').value;

    if (!compte) {
        showToast('Entrez un numero de compte', 'warning');
        return;
    }

    try {
        // Load solde
        const soldeRes = await fetch(`${API_BASE}/api/solde/${societe}/${compte}/${filiation || '0000'}`);

        if (soldeRes.ok) {
            const solde = await soldeRes.json();
            document.getElementById('compteNom').textContent = `Compte ${compte}`;
            document.getElementById('compteRef').textContent = `Ref: ${compte}/${filiation || '0000'}`;
            document.getElementById('compteSoldeGlobal').textContent = formatMoney(solde.soldeGlobal || 0) + ' EUR';

            // Soldes by service
            const tbody = document.querySelector('#soldesTable tbody');
            if (solde.soldesParService) {
                tbody.innerHTML = solde.soldesParService.map(s => `
                    <tr>
                        <td>${s.service}</td>
                        <td>${formatMoney(s.credit)}</td>
                        <td>${formatMoney(s.debit)}</td>
                        <td>${formatMoney(s.solde)}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="4">Aucun detail par service</td></tr>';
            }

            showElement('compteResult');
        } else {
            hideElement('compteResult');
            showToast('Compte non trouve', 'warning');
        }

        // Load Club Med Pass
        const passRes = await fetch(`${API_BASE}/api/members/club-med-pass/${societe}/${compte}/${filiation || '0000'}`);
        if (passRes.ok) {
            const pass = await passRes.json();
            document.getElementById('passNumber').textContent = pass.cardCode || 'Non attribue';
        } else {
            document.getElementById('passNumber').textContent = 'Non attribue';
        }

    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

// ========================================
// Extrait
// ========================================

async function searchExtrait() {
    const societe = document.getElementById('extraitSociete').value;
    const compte = document.getElementById('extraitCompte').value;
    const filiation = document.getElementById('extraitFiliation').value;

    if (!compte) {
        showToast('Entrez un numero de compte', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/extrait/${societe}/${compte}/${filiation || '0000'}`);

        if (response.ok) {
            const extrait = await response.json();
            const tbody = document.querySelector('#extraitTable tbody');

            if (extrait.mouvements && extrait.mouvements.length > 0) {
                tbody.innerHTML = extrait.mouvements.map(m => `
                    <tr>
                        <td>${formatDate(m.dateOperation)}</td>
                        <td>${m.codeService || '-'}</td>
                        <td>${m.libelle || '-'}</td>
                        <td>${m.montantDebit ? formatMoney(m.montantDebit) : '-'}</td>
                        <td>${m.montantCredit ? formatMoney(m.montantCredit) : '-'}</td>
                        <td>${formatMoney(m.soldeCumulatif)}</td>
                    </tr>
                `).join('');
                document.getElementById('extraitCount').textContent = `${extrait.mouvements.length} mouvements`;
            } else {
                tbody.innerHTML = '<tr><td colspan="6">Aucun mouvement</td></tr>';
                document.getElementById('extraitCount').textContent = '0 mouvements';
            }

            showElement('extraitResult');
        } else {
            hideElement('extraitResult');
            showToast('Aucun extrait trouve', 'warning');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

function printExtrait() {
    window.print();
}

// ========================================
// Garantie
// ========================================

async function searchGarantie() {
    const societe = document.getElementById('garantieSociete').value;
    const compte = document.getElementById('garantieCompte').value;
    const filiation = document.getElementById('garantieFiliation').value;

    if (!compte) {
        showToast('Entrez un numero de compte', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/garantie/${societe}/${compte}/${filiation || '0000'}`);

        if (response.ok) {
            const garantie = await response.json();
            const tbody = document.querySelector('#garantieTable tbody');

            if (garantie.depots && garantie.depots.length > 0) {
                tbody.innerHTML = garantie.depots.map(d => `
                    <tr>
                        <td>${d.typeGarantie}</td>
                        <td>${d.libelle || '-'}</td>
                        <td>${formatMoney(d.montant)}</td>
                        <td>${formatDate(d.dateDepot)}</td>
                        <td><span class="badge ${d.statut === 'A' ? 'badge-open' : 'badge-closed'}">${d.statut === 'A' ? 'Actif' : 'Rendu'}</span></td>
                    </tr>
                `).join('');
                document.getElementById('garantieTotal').textContent = `Total: ${formatMoney(garantie.totalDepots || 0)} EUR`;
            } else {
                tbody.innerHTML = '<tr><td colspan="5">Aucun depot</td></tr>';
                document.getElementById('garantieTotal').textContent = 'Total: 0.00 EUR';
            }

            showElement('garantieResult');
        } else {
            hideElement('garantieResult');
            showToast('Aucune garantie trouvee', 'warning');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

// ========================================
// Easy Checkout
// ========================================

async function searchCheckout() {
    const societe = document.getElementById('checkoutSociete').value;
    const date = document.getElementById('checkoutDate').value;

    try {
        const response = await fetch(`${API_BASE}/api/easycheckout/extrait/${societe}/${date}`);

        if (response.ok) {
            const departs = await response.json();
            const tbody = document.querySelector('#checkoutTable tbody');
            tbody.innerHTML = departs.map(d => `
                <tr>
                    <td>${d.compte}</td>
                    <td>${d.nom} ${d.prenom}</td>
                    <td>${d.chambre || '-'}</td>
                    <td>${formatMoney(d.solde)}</td>
                    <td><span class="badge ${d.statut === 'OK' ? 'badge-open' : 'badge-closed'}">${d.statut}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="selectCheckout('${d.compte}', '${d.filiation}')">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

function selectCheckout(compte, filiation) {
    document.getElementById('checkoutCompte').value = compte;
    document.getElementById('checkoutFiliation').value = filiation;
}

async function getSoldeCheckout() {
    const societe = document.getElementById('checkoutSociete').value;
    const compte = document.getElementById('checkoutCompte').value;
    const filiation = document.getElementById('checkoutFiliation').value;

    if (!compte) {
        showToast('Entrez un numero de compte', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/easycheckout/solde/${societe}/${compte}/${filiation || '0000'}`);

        if (response.ok) {
            const result = await response.json();
            document.getElementById('checkoutSolde').textContent = formatMoney(result.solde || 0);
            document.getElementById('checkoutGaranties').textContent = formatMoney(result.garanties || 0);
            document.getElementById('checkoutAPayer').textContent = formatMoney(result.aPayer || 0);
            showElement('checkoutResultPanel');
        } else {
            showToast('Erreur calcul solde', 'warning');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

async function getEditionCheckout() {
    showToast('Generation edition PDF en cours...', 'info');
    // Would trigger PDF generation
}

async function getExtraitCheckout() {
    const societe = document.getElementById('checkoutSociete').value;
    const compte = document.getElementById('checkoutCompte').value;
    const filiation = document.getElementById('checkoutFiliation').value;

    if (!compte) {
        showToast('Entrez un numero de compte', 'warning');
        return;
    }

    // Navigate to extrait page with pre-filled values
    document.getElementById('extraitSociete').value = societe;
    document.getElementById('extraitCompte').value = compte;
    document.getElementById('extraitFiliation').value = filiation || '';
    navigateTo('extrait');
    searchExtrait();
}

async function processCheckout() {
    showToast('Checkout valide avec succes', 'success');
}

// ========================================
// Factures
// ========================================

async function searchFactures() {
    const societe = document.getElementById('factSociete').value;
    const compte = document.getElementById('factCompte').value;
    const filiation = document.getElementById('factFiliation').value;

    if (!compte) {
        showToast('Entrez un numero de compte', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/factures/checkout/${societe}/${compte}/${filiation || '0000'}`);

        if (response.ok) {
            const factures = await response.json();
            const tbody = document.querySelector('#facturesTable tbody');
            tbody.innerHTML = factures.map(f => `
                <tr>
                    <td>${f.numeroFacture}</td>
                    <td>${formatDate(f.dateFacture)}</td>
                    <td>${formatMoney(f.montantHT)}</td>
                    <td>${formatMoney(f.montantTVA)}</td>
                    <td>${formatMoney(f.montantTTC)}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="printFacture('${f.numeroFacture}')">
                            <i class="fas fa-print"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

function calculateTVA() {
    const montantHT = parseFloat(document.getElementById('newFactMontant').value) || 0;
    const tauxTVA = parseFloat(document.getElementById('newFactTauxTVA').value) || 0;
    const tva = montantHT * (tauxTVA / 100);
    const ttc = montantHT + tva;

    document.getElementById('newFactTVA').value = tva.toFixed(2);
    document.getElementById('newFactTTC').value = ttc.toFixed(2);
}

async function createFacture(event) {
    event.preventDefault();

    const data = {
        societe: APP_STATE.societe,
        compte: document.getElementById('newFactCompte').value,
        filiation: document.getElementById('newFactFiliation').value || '0000',
        montantHT: parseFloat(document.getElementById('newFactMontant').value),
        tauxTVA: parseFloat(document.getElementById('newFactTauxTVA').value),
        libelle: document.getElementById('newFactLibelle').value
    };

    try {
        const response = await fetch(`${API_BASE}/api/factures/creer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('Facture creee avec succes', 'success');
            event.target.reset();
        } else {
            showToast('Erreur creation facture', 'error');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

function printFacture(numero) {
    showToast(`Impression facture ${numero}...`, 'info');
}

// ========================================
// Telephone
// ========================================

async function searchLignes() {
    const societe = document.getElementById('telSociete').value;
    const compte = document.getElementById('telCompte').value;
    const chambre = document.getElementById('telChambre').value;

    try {
        let url = `${API_BASE}/api/telephone/lignes/${societe}`;
        if (compte) url += `?compte=${compte}`;
        if (chambre) url += `${compte ? '&' : '?'}chambre=${chambre}`;

        const response = await fetch(url);

        if (response.ok) {
            const lignes = await response.json();
            const tbody = document.querySelector('#lignesTable tbody');
            tbody.innerHTML = lignes.map(l => `
                <tr>
                    <td>${l.numero}</td>
                    <td>${l.chambre || '-'}</td>
                    <td>${l.compte || '-'}</td>
                    <td><span class="badge ${l.statut === 'O' ? 'badge-open' : 'badge-closed'}">${l.statut === 'O' ? 'Ouvert' : 'Ferme'}</span></td>
                    <td>
                        ${l.statut !== 'O' ?
                            `<button class="btn btn-sm btn-success" onclick="ouvrirLigneDirecte('${l.numero}')"><i class="fas fa-phone"></i></button>` :
                            `<button class="btn btn-sm btn-danger" onclick="fermerLigneDirecte('${l.numero}')"><i class="fas fa-phone-slash"></i></button>`
                        }
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

async function ouvrirLigne() {
    const numero = document.getElementById('telNumero').value;
    const compte = document.getElementById('telLigneCompte').value;

    if (!numero) {
        showToast('Entrez un numero de ligne', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/telephone/gerer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                societe: APP_STATE.societe,
                numeroLigne: numero,
                compte: compte,
                action: 'OPEN'
            })
        });

        if (response.ok) {
            showToast('Ligne ouverte', 'success');
            searchLignes();
        } else {
            showToast('Erreur ouverture ligne', 'error');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

async function fermerLigne() {
    const numero = document.getElementById('telNumero').value;

    if (!numero) {
        showToast('Entrez un numero de ligne', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/telephone/gerer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                societe: APP_STATE.societe,
                numeroLigne: numero,
                action: 'CLOSE'
            })
        });

        if (response.ok) {
            showToast('Ligne fermee', 'success');
            searchLignes();
        } else {
            showToast('Erreur fermeture ligne', 'error');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

function ouvrirLigneDirecte(numero) {
    document.getElementById('telNumero').value = numero;
    ouvrirLigne();
}

function fermerLigneDirecte(numero) {
    document.getElementById('telNumero').value = numero;
    fermerLigne();
}

// ========================================
// Settings / Modal
// ========================================

function showSettings() {
    openModal('Parametres', `
        <div class="form-group">
            <label>Societe par defaut</label>
            <input type="text" id="settingSociete" value="${APP_STATE.societe}" maxlength="2">
        </div>
        <div class="form-group">
            <label>Devise locale</label>
            <select id="settingDevise">
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dollar</option>
            </select>
        </div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
        <button class="btn btn-primary" onclick="saveSettings()">Enregistrer</button>
    `);
}

function saveSettings() {
    APP_STATE.societe = document.getElementById('settingSociete').value;
    localStorage.setItem('caisseSociete', APP_STATE.societe);
    closeModal();
    showToast('Parametres enregistres', 'success');
}

function openModal(title, body, footer) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalFooter').innerHTML = footer;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ========================================
// Utilities
// ========================================

function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    if (dateStr.length === 8) {
        // Format YYYYMMDD
        return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
    }
    try {
        return new Date(dateStr).toLocaleDateString('fr-FR');
    } catch {
        return dateStr;
    }
}

function formatTime(timeStr) {
    if (!timeStr) return '-';
    if (timeStr.length === 6) {
        // Format HHMMSS
        return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
    }
    return timeStr;
}

function formatDateForApi(date) {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function formatTimeForApi(date) {
    return date.toTimeString().slice(0, 8).replace(/:/g, '');
}

function showElement(id, message) {
    const el = document.getElementById(id);
    if (el) {
        if (message) el.textContent = message;
        el.style.display = 'block';
    }
}

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ========================================
// EzCard Functions
// ========================================

async function searchEzCards() {
    const societe = document.getElementById('ezcardSociete').value;
    const codeGm = document.getElementById('ezcardCodeGm').value;
    const filiation = document.getElementById('ezcardFiliation').value || 0;

    if (!codeGm) {
        showToast('Veuillez saisir un code GM', 'warning');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/api/ezcard/member/${societe}/${codeGm}/${filiation}`
        );
        const data = await response.json();

        const tbody = document.querySelector('#ezcardsTable tbody');
        tbody.innerHTML = '';

        if (!data.found || !data.cards || data.cards.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucune carte trouvee</td></tr>';
            return;
        }

        data.cards.forEach(card => {
            const row = document.createElement('tr');
            const statusClass = card.isActive ? 'status-active' : 'status-inactive';
            row.innerHTML = `
                <td><strong>${card.cardCode}</strong></td>
                <td><span class="badge ${statusClass}">${card.statusLibelle}</span></td>
                <td>${card.dateCreation || '-'}</td>
                <td>${card.dateExpiration || '-'}</td>
                <td>-</td>
                <td>
                    ${card.isActive ? `
                        <button class="btn btn-sm btn-danger" onclick="selectCardForDeactivation('${card.cardCode}')">
                            <i class="fas fa-ban"></i>
                        </button>
                    ` : '-'}
                </td>
            `;
            tbody.appendChild(row);
        });

        showToast(`${data.cards.length} carte(s) trouvee(s)`, 'success');
    } catch (error) {
        console.error('Error searching EzCards:', error);
        showToast('Erreur lors de la recherche des cartes', 'error');
    }
}

function selectCardForDeactivation(cardCode) {
    document.getElementById('ezcardCode').value = cardCode;
    showToast(`Carte ${cardCode} selectionnee pour desactivation`, 'info');
}

async function desactiverEzCard() {
    const societe = document.getElementById('ezcardSociete').value;
    const cardCode = document.getElementById('ezcardCode').value;
    const motif = document.getElementById('ezcardMotif').value || '';

    if (!cardCode) {
        showToast('Veuillez saisir un code carte', 'warning');
        return;
    }

    if (!confirm(`Confirmer la desactivation de la carte ${cardCode}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/ezcard/desactiver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ societe, cardCode, motif })
        });

        const result = await response.json();

        if (result.success) {
            showToast(`Carte ${cardCode} desactivee avec succes`, 'success');
            document.getElementById('ezcardCode').value = '';
            document.getElementById('ezcardMotif').value = '';
            searchEzCards();
        } else {
            showToast(result.error || 'Erreur lors de la desactivation', 'error');
        }
    } catch (error) {
        console.error('Error deactivating EzCard:', error);
        showToast('Erreur lors de la desactivation de la carte', 'error');
    }
}

async function validerCaracteres() {
    const texte = document.getElementById('validerTexte').value;
    const strictMode = document.getElementById('validerStrictMode').value === 'true';

    if (!texte) {
        showToast('Veuillez saisir un texte a valider', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/ezcard/valider-caracteres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texte, caracteresInterdits: null, strictMode })
        });

        const result = await response.json();
        const resultDiv = document.getElementById('validationResult');
        resultDiv.style.display = 'block';

        const statusClass = result.isValid ? 'success' : 'warning';
        resultDiv.querySelector('.result-status').innerHTML = `
            <span class="badge ${statusClass}">
                <i class="fas ${result.isValid ? 'fa-check' : 'fa-exclamation-triangle'}"></i>
                ${result.message}
            </span>
        `;

        resultDiv.querySelector('.result-cleaned').innerHTML = result.texteNettoye ? `
            <strong>Texte nettoye:</strong> ${result.texteNettoye}
        ` : '';

        resultDiv.querySelector('.result-detected').innerHTML = result.caracteresDetectes?.length > 0 ? `
            <strong>Caracteres detectes:</strong> ${result.caracteresDetectes.map(c => `'${c}'`).join(', ')}
        ` : '';

    } catch (error) {
        console.error('Error validating characters:', error);
        showToast('Erreur lors de la validation', 'error');
    }
}

// ========================================
// Depot Functions
// ========================================

async function searchDepots() {
    const societe = document.getElementById('depotSociete').value;
    const codeGm = document.getElementById('depotCodeGm').value;
    const filiation = document.getElementById('depotFiliation').value || 0;

    if (!codeGm) {
        showToast('Veuillez saisir un code GM', 'warning');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/api/depot/extrait/${societe}/${codeGm}/${filiation}`
        );
        const data = await response.json();

        const tbody = document.querySelector('#depotsTable tbody');
        tbody.innerHTML = '';

        const summaryDiv = document.getElementById('depotSummary');

        if (!data.found || !data.depots || data.depots.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun depot trouve</td></tr>';
            summaryDiv.style.display = 'none';
            return;
        }

        // Update summary
        summaryDiv.style.display = 'flex';
        document.getElementById('depotTotal').textContent = data.totalDepot.toFixed(2);
        document.getElementById('depotRetrait').textContent = data.totalRetrait.toFixed(2);
        document.getElementById('depotSolde').textContent = data.soldeNet.toFixed(2);

        data.depots.forEach(depot => {
            const row = document.createElement('tr');
            const statusClass = depot.estActif ? 'status-active' : 'status-inactive';
            row.innerHTML = `
                <td><i class="fas ${getDepotIcon(depot.typeDepot)}"></i> ${depot.typeDepotLibelle}</td>
                <td>${depot.devise}</td>
                <td>${depot.montant.toFixed(2)}</td>
                <td>${depot.dateDepot || '-'}</td>
                <td><span class="badge ${statusClass}">${depot.etatLibelle}</span></td>
                <td>
                    ${depot.estActif ? `
                        <button class="btn btn-sm btn-warning" onclick="selectDepotForRetrait('${depot.typeDepot}', '${depot.devise}')">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    ` : '-'}
                </td>
            `;
            tbody.appendChild(row);
        });

        showToast(`${data.depots.length} depot(s) trouve(s)`, 'success');
    } catch (error) {
        console.error('Error searching depots:', error);
        showToast('Erreur lors de la recherche des depots', 'error');
    }
}

function getDepotIcon(type) {
    const icons = {
        'O': 'fa-box',
        'D': 'fa-coins',
        'S': 'fa-lock',
        'G': 'fa-shield-alt'
    };
    return icons[type] || 'fa-box';
}

function selectDepotForRetrait(typeDepot, devise) {
    document.getElementById('depotType').value = typeDepot;
    document.getElementById('depotDevise').value = devise;
    showToast(`Depot ${typeDepot}/${devise} selectionne pour retrait`, 'info');
}

async function retirerDepot() {
    const societe = document.getElementById('depotSociete').value;
    const codeGm = document.getElementById('depotCodeGm').value;
    const filiation = document.getElementById('depotFiliation').value || 0;
    const typeDepot = document.getElementById('depotType').value;
    const devise = document.getElementById('depotDevise').value;
    const operateur = document.getElementById('depotOperateur').value;

    if (!codeGm || !operateur) {
        showToast('Veuillez remplir tous les champs obligatoires', 'warning');
        return;
    }

    if (!confirm('Confirmer le retrait du depot?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/depot/retirer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                societe,
                codeGm: parseInt(codeGm),
                filiation: parseInt(filiation),
                typeDepot,
                devise,
                operateur
            })
        });

        const result = await response.json();

        if (result.success) {
            showToast(`Depot retire avec succes (${result.montantRetire?.toFixed(2) || '0.00'})`, 'success');
            searchDepots();
        } else {
            showToast(result.error || 'Erreur lors du retrait', 'error');
        }
    } catch (error) {
        console.error('Error withdrawing depot:', error);
        showToast('Erreur lors du retrait du depot', 'error');
    }
}

// ========================================
// Divers Functions (Prg_42, 43, 45, 47, 48)
// ========================================

async function getLangueUtilisateur() {
    const societe = document.getElementById('langueSociete').value;
    const utilisateur = document.getElementById('langueUtilisateur').value;

    if (!utilisateur) {
        showToast('Veuillez saisir un code utilisateur', 'warning');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/api/divers/langue/${societe}/${utilisateur}`
        );
        const data = await response.json();

        document.getElementById('langueCode').textContent = data.codeLangue || '-';
        document.getElementById('langueLibelle').textContent = data.libelleLangue || '-';
        document.getElementById('langueMenuVisible').textContent = data.menuVisible ? 'Oui' : 'Non';
        showElement('langueResult');

        showToast(`Langue: ${data.codeLangue || 'FRA'}`, 'success');
    } catch (error) {
        console.error('Error getting langue:', error);
        showToast('Erreur lors de la recuperation de la langue', 'error');
    }
}

async function getTitreEcran() {
    const codeEcran = document.getElementById('titreCodeEcran').value;
    const codeLangue = document.getElementById('titreCodeLangue').value;

    if (!codeEcran) {
        showToast('Veuillez saisir un code ecran', 'warning');
        return;
    }

    try {
        let url = `${API_BASE}/api/divers/titre/${codeEcran}`;
        if (codeLangue) {
            url += `?codeLangue=${codeLangue}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        document.getElementById('titreEcranCode').textContent = data.codeEcran || codeEcran;
        document.getElementById('titreEcranValue').textContent = data.titreEcran || '-';
        document.getElementById('titreEcranLangue').textContent = data.codeLangue || 'FRA';
        showElement('titreResult');

        if (data.found) {
            showToast(`Titre trouve: ${data.titreEcran}`, 'success');
        } else {
            showToast('Titre non trouve, fallback utilise', 'warning');
        }
    } catch (error) {
        console.error('Error getting titre:', error);
        showToast('Erreur lors de la recuperation du titre', 'error');
    }
}

async function verifierAccesInformaticien() {
    const societe = document.getElementById('accesSociete').value;
    const utilisateur = document.getElementById('accesUtilisateur').value;

    if (!utilisateur) {
        showToast('Veuillez saisir un code utilisateur', 'warning');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/api/divers/acces-informaticien/${societe}/${utilisateur}`
        );
        const data = await response.json();

        const statusDiv = document.getElementById('accesStatus');
        if (data.estAutorise) {
            statusDiv.innerHTML = `
                <div class="access-icon authorized">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="access-text success">Acces Autorise</div>
            `;
        } else {
            statusDiv.innerHTML = `
                <div class="access-icon denied">
                    <i class="fas fa-times-circle"></i>
                </div>
                <div class="access-text error">${data.messageErreur || 'Acces Refuse'}</div>
            `;
        }

        document.getElementById('accesUser').textContent = data.codeUtilisateur || utilisateur;
        document.getElementById('accesRole').textContent = data.roleUtilisateur || '-';
        showElement('accesResult');

        showToast(data.estAutorise ? 'Acces informaticien autorise' : 'Acces refuse',
                  data.estAutorise ? 'success' : 'warning');
    } catch (error) {
        console.error('Error checking access:', error);
        showToast('Erreur lors de la verification', 'error');
    }
}

async function validerIntegriteDates(event) {
    event.preventDefault();

    const societe = document.getElementById('datesSociete').value;
    const typeOperation = document.getElementById('datesTypeOperation').value;
    const dateTransaction = document.getElementById('datesTransaction').value;
    const dateOuverture = document.getElementById('datesOuverture').value;

    if (!dateTransaction) {
        showToast('Veuillez saisir une date de transaction', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/divers/valider-dates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                societe,
                typeOperation,
                dateTransaction,
                dateOuvertureSession: dateOuverture || null
            })
        });

        const data = await response.json();

        // Update status
        const statusDiv = document.getElementById('datesStatus');
        if (data.isValid) {
            statusDiv.innerHTML = `
                <div class="validation-icon valid">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="validation-text success">Dates Valides</div>
            `;
        } else {
            statusDiv.innerHTML = `
                <div class="validation-icon invalid">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="validation-text error">${data.messageErreur || 'Dates Invalides'}</div>
            `;
        }

        // Update values
        document.getElementById('datesTransValue').textContent = dateTransaction;
        document.getElementById('datesComptableValue').textContent = data.dateComptable || '-';
        document.getElementById('datesLimiteValue').textContent = data.dateLimite || '-';
        document.getElementById('datesToleranceValue').textContent = `${data.joursToleranceParametre || 3} jours`;

        // Show verifications if fermeture
        const verificationsDiv = document.getElementById('datesVerifications');
        if (data.verificationsDetails && data.verificationsDetails.length > 0) {
            const tbody = document.querySelector('#verificationsTable tbody');
            tbody.innerHTML = data.verificationsDetails.map(v => `
                <tr>
                    <td>${v.nomTable}</td>
                    <td>${v.nombreEnregistrements}</td>
                    <td>
                        <span class="badge ${v.hasErrors ? 'badge-closed' : 'badge-open'}">
                            ${v.message || (v.hasErrors ? 'Erreur' : 'OK')}
                        </span>
                    </td>
                </tr>
            `).join('');
            verificationsDiv.style.display = 'block';
        } else {
            verificationsDiv.style.display = 'none';
        }

        showElement('datesResult');
        showToast(data.isValid ? 'Validation reussie' : 'Probleme de validation',
                  data.isValid ? 'success' : 'warning');
    } catch (error) {
        console.error('Error validating dates:', error);
        showToast('Erreur lors de la validation des dates', 'error');
    }
}

async function updateSessionTimestamp(event) {
    event.preventDefault();

    const societe = document.getElementById('tsSociete').value;
    const codeCaisse = document.getElementById('tsCodeCaisse').value;
    const operateur = document.getElementById('tsOperateur').value;
    const dateHeure = document.getElementById('tsDateHeure').value;

    try {
        const response = await fetch(`${API_BASE}/api/divers/session-timestamp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                societe,
                codeCaisse,
                codeOperateur: operateur,
                dateHeure: dateHeure || null
            })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('tsChronoValue').textContent = data.chronoSession || '-';
            document.getElementById('tsUserValue').textContent = data.utilisateur || '-';
            document.getElementById('tsAvantValue').textContent = formatDateTime(data.dateHeureAvant);
            document.getElementById('tsApresValue').textContent = formatDateTime(data.dateHeureApres);
            showElement('timestampResult');
            showToast('Timestamp mis a jour avec succes', 'success');
        } else {
            showToast(data.messageErreur || 'Erreur lors de la mise a jour', 'error');
        }
    } catch (error) {
        console.error('Error updating timestamp:', error);
        showToast('Erreur lors de la mise a jour du timestamp', 'error');
    }
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return dateStr;
    }
}
