// ============================================
// VARIABLES GLOBALS I CONSTANTS
// ============================================

const LOCAL_STORAGE_KEY = 'contactes_llibre';
let contactes = [];
let contacteAEliminar = null;

// ============================================
// FUNCIONS PRINCIPALS - INDEX.HTML
// ============================================

/**
 * Carrega els contactes del localStorage o del JSON inicial
 */
function carregarContactes() {
    // Intentar carregar del localStorage
    const contactesGuardats = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (contactesGuardats) {
        contactes = JSON.parse(contactesGuardats);
    } else {
        // Carregar els contactes inicials del JSON (simulat)
        contactes = [
            { id: 1, nom: "Anna", email: "anna@example.com", telefon: "123456789", dataAddicio: "2025-01-10" },
            { id: 2, nom: "Pere", email: "pere@example.com", telefon: "987654321", dataAddicio: "2025-01-12" },
            { id: 3, nom: "Maria", email: "maria@example.com", telefon: "654987321", dataAddicio: "2025-01-15" },
            { id: 4, nom: "Joan", email: "joan@example.com", telefon: "321654987", dataAddicio: "2025-01-18" }
        ];
        guardarContactes();
    }
    
    return contactes;
}

/**
 * Guarda els contactes al localStorage
 */
function guardarContactes() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contactes));
}

/**
 * Mostra tots els contactes a la taula
 */
function mostrarContactes(contactesAMostrar = null) {
    const tbody = document.getElementById('contactsTableBody');
    const contactCount = document.getElementById('contactCount');
    const noContactsMessage = document.getElementById('noContactsMessage');
    
    if (!tbody) return; // No estem a la pàgina index.html
    
    // Netejar la taula
    tbody.innerHTML = '';
    
    const contactesPerMostrar = contactesAMostrar || contactes;
    
    // Actualitzar comptador
    contactCount.textContent = contactesPerMostrar.length;
    
    // Mostrar o amagar el missatge de "no hi ha contactes"
    if (contactesPerMostrar.length === 0) {
        noContactsMessage.style.display = 'block';
    } else {
        noContactsMessage.style.display = 'none';
        
        // Afegir cada contacte a la taula
        contactesPerMostrar.forEach(contacte => {
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>${contacte.id}</td>
                <td>${contacte.nom}</td>
                <td>
                    <a href="mailto:${contacte.email}" class="email-link">
                        ${contacte.email}
                    </a>
                </td>
                <td>${formatTelefon(contacte.telefon)}</td>
                <td class="actions-cell">
                    <a href="detall.html?id=${contacte.id}" class="btn-action btn-view" title="Veure detall">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a href="detall.html?id=${contacte.id}&edit=true" class="btn-action btn-edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button class="btn-action btn-delete" data-id="${contacte.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(fila);
        });
        
        // Afegir event listeners als botons d'eliminar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                mostrarModalEliminacio(id);
            });
        });
    }
}

/**
 * Formata un número de telèfon
 */
function formatTelefon(telefon) {
    if (!telefon) return '';
    // Afegir espais cada 3 dígits per millorar la llegibilitat
    return telefon.toString().replace(/(\d{3})(?=\d)/g, '$1 ');
}

/**
 * Cerca contactes segons el text de cerca
 */
function cercarContactes() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const textCerca = searchInput.value.toLowerCase().trim();
    
    if (textCerca === '') {
        mostrarContactes();
        return;
    }
    
    const contactesFiltrats = contactes.filter(contacte => 
        contacte.nom.toLowerCase().includes(textCerca) ||
        contacte.email.toLowerCase().includes(textCerca) ||
        contacte.telefon.includes(textCerca)
    );
    
    mostrarContactes(contactesFiltrats);
}

/**
 * Mostra el modal de confirmació d'eliminació
 */
function mostrarModalEliminacio(id) {
    contacteAEliminar = id;
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Amaga el modal d'eliminació
 */
function amagarModalEliminacio() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'none';
    }
    contacteAEliminar = null;
}

/**
 * Elimina un contacte per ID
 */
function eliminarContacte(id) {
    const index = contactes.findIndex(c => c.id === id);
    
    if (index !== -1) {
        contactes.splice(index, 1);
        guardarContactes();
        mostrarContactes();
        amagarModalEliminacio();
        
        // Mostrar notificació (si existeix la funció)
        if (typeof mostrarNotificacio === 'function') {
            mostrarNotificacio('Contacte eliminat correctament', 'success');
        }
    }
}

// ============================================
// FUNCIONS PRINCIPALS - DETALL.HTML
// ============================================

/**
 * Carrega i mostra la informació d'un contacte específic
 */
function carregarDetallContacte() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const editMode = urlParams.get('edit') === 'true';
    
    if (!id || isNaN(id)) {
        mostrarErrorContacte();
        return;
    }
    
    const contacte = contactes.find(c => c.id === id);
    
    if (!contacte) {
        mostrarErrorContacte();
        return;
    }
    
    // Actualitzar la interfície amb les dades del contacte
    document.getElementById('detailName').textContent = contacte.nom;
    document.getElementById('detailId').textContent = contacte.id;
    document.getElementById('detailEmail').textContent = contacte.email;
    document.getElementById('detailEmail').href = `mailto:${contacte.email}`;
    document.getElementById('detailPhone').textContent = formatTelefon(contacte.telefon);
    document.getElementById('detailPhone').href = `tel:${contacte.telefon}`;
    document.getElementById('detailDate').textContent = formatData(contacte.dataAddicio);
    
    // Amagar missatge de càrrega
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
    
    // Configurar botó d'editar
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        editBtn.href = `afegir.html?edit=${contacte.id}`;
    }
    
    // Configurar botó d'eliminar
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => mostrarModalEliminacio(id));
    }
    
    // Si estem en mode edició, redirigir a la pàgina d'afegir/editar
    if (editMode) {
        window.location.href = `afegir.html?edit=${id}`;
    }
}

/**
 * Formata una data per mostrar-la bé
 */
function formatData(dataString) {
    if (!dataString) return 'No especificada';
    
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return dataString;
    
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    
    return data.toLocaleDateString('ca-ES', options);
}

/**
 * Mostra el missatge d'error quan no es troba el contacte
 */
function mostrarErrorContacte() {
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const contactDetail = document.getElementById('contactDetail');
    
    if (loadingMessage) loadingMessage.style.display = 'none';
    if (contactDetail) contactDetail.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'block';
}

// ============================================
// FUNCIONS PRINCIPALS - AFEGIR.HTML
// ============================================

/**
 * Gestiona el formulari per afegir o editar contactes
 */
function configurarFormulari() {
    const form = document.getElementById('addContactForm');
    if (!form) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    let esEdicio = false;
    let contacteAEditar = null;
    
    // Si estem en mode edició, carregar les dades del contacte
    if (editId) {
        esEdicio = true;
        contacteAEditar = contactes.find(c => c.id === parseInt(editId));
        
        if (contacteAEditar) {
            // Actualitzar el títol de la pàgina
            document.querySelector('h1').innerHTML = '<i class="fas fa-user-edit"></i> Editar Contacte';
            
            // Omplir el formulari amb les dades existents
            document.getElementById('name').value = contacteAEditar.nom;
            document.getElementById('email').value = contacteAEditar.email;
            document.getElementById('phone').value = contacteAEditar.telefon;
            
            // Canviar el text del botó de guardar
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualitzar Contacte';
            }
        }
    }
    
    // Configurar el botó de cancel·lar
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (esEdicio && contacteAEditar) {
                window.location.href = `detall.html?id=${contacteAEditar.id}`;
            } else {
                window.location.href = 'index.html';
            }
        });
    }
    
    // Gestionar l'enviament del formulari
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validarFormulari()) {
            const nouContacte = {
                id: esEdicio ? contacteAEditar.id : generarNouId(),
                nom: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefon: document.getElementById('phone').value.trim(),
                dataAddicio: esEdicio ? contacteAEditar.dataAddicio : new Date().toISOString().split('T')[0]
            };
            
            if (esEdicio) {
                // Actualitzar contacte existent
                const index = contactes.findIndex(c => c.id === contacteAEditar.id);
                if (index !== -1) {
                    contactes[index] = nouContacte;
                }
            } else {
                // Afegir nou contacte
                contactes.push(nouContacte);
            }
            
            guardarContactes();
            mostrarMissatgeExit(esEdicio);
        }
    });
    
    // Configurar botó per afegir un altre contacte
    const addAnotherBtn = document.getElementById('addAnotherBtn');
    if (addAnotherBtn) {
        addAnotherBtn.addEventListener('click', () => {
            window.location.href = 'afegir.html';
        });
    }
}

/**
 * Genera un nou ID únic per a un contacte
 */
function generarNouId() {
    if (contactes.length === 0) return 1;
    
    const maxId = Math.max(...contactes.map(c => c.id));
    return maxId + 1;
}

/**
 * Valida el formulari de contacte
 */
function validarFormulari() {
    let valid = true;
    
    // Validar nom
    const nom = document.getElementById('name').value.trim();
    const nomError = document.getElementById('nameError');
    if (!nom) {
        nomError.textContent = 'El nom és obligatori';
        valid = false;
    } else if (nom.length < 2) {
        nomError.textContent = 'El nom ha de tenir almenys 2 caràcters';
        valid = false;
    } else {
        nomError.textContent = '';
    }
    
    // Validar email
    const email = document.getElementById('email').value.trim();
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        emailError.textContent = 'L\'email és obligatori';
        valid = false;
    } else if (!emailRegex.test(email)) {
        emailError.textContent = 'Introdueix un email vàlid';
        valid = false;
    } else {
        emailError.textContent = '';
    }
    
    // Validar telèfon
    const telefon = document.getElementById('phone').value.trim();
    const phoneError = document.getElementById('phoneError');
    const phoneRegex = /^[0-9\s\-+]+$/;
    
    if (!telefon) {
        phoneError.textContent = 'El telèfon és obligatori';
        valid = false;
    } else if (!phoneRegex.test(telefon.replace(/\s/g, ''))) {
        phoneError.textContent = 'Introdueix un telèfon vàlid';
        valid = false;
    } else if (telefon.replace(/\D/g, '').length < 9) {
        phoneError.textContent = 'El telèfon ha de tenir almenys 9 dígits';
        valid = false;
    } else {
        phoneError.textContent = '';
    }
    
    return valid;
}

/**
 * Mostra el missatge d'èxit després d'afegir/editar un contacte
 */
function mostrarMissatgeExit(esEdicio) {
    const formContainer = document.querySelector('.form-container');
    const successMessage = document.getElementById('successMessage');
    
    if (formContainer) formContainer.style.display = 'none';
    if (successMessage) {
        successMessage.style.display = 'block';
        
        // Actualitzar el missatge segons si és edició o addició
        const titol = successMessage.querySelector('h3');
        const missatge = successMessage.querySelector('p');
        
        if (esEdicio) {
            titol.textContent = 'Contacte actualitzat correctament!';
            missatge.textContent = 'El contacte s\'ha actualitzat a la llibreta.';
        }
    }
}

// ============================================
// FUNCIONS AUXILIARS I INICIALITZACIÓ
// ============================================

/**
 * Configura els event listeners comuns
 */
function configurarEventListeners() {
    // Cerca de contactes (index.html)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', cercarContactes);
    }
    
    // Botó per afegir contacte (index.html)
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.location.href = 'afegir.html';
        });
    }
    
    // Modal d'eliminació
    const deleteModal = document.getElementById('deleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    
    if (deleteModal && cancelDeleteBtn && confirmDeleteBtn) {
        // Tancar modal en fer clic fora
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                amagarModalEliminacio();
            }
        });
        
        // Botó de cancel·lar eliminació
        cancelDeleteBtn.addEventListener('click', amagarModalEliminacio);
        
        // Botó de confirmar eliminació
        confirmDeleteBtn.addEventListener('click', () => {
            if (contacteAEliminar) {
                eliminarContacte(contacteAEliminar);
            }
        });
    }
}

/**
 * Funció principal d'inicialització
 */
function init() {
    // Carregar contactes
    carregarContactes();
    
    // Configurar event listeners comuns
    configurarEventListeners();
    
    // Executar funcions específiques segons la pàgina
    const paginaActual = window.location.pathname.split('/').pop();
    
    if (paginaActual === 'index.html' || paginaActual === '' || paginaActual.endsWith('/')) {
        // Pàgina principal
        mostrarContactes();
    } else if (paginaActual === 'detall.html') {
        // Pàgina de detall
        carregarDetallContacte();
    } else if (paginaActual === 'afegir.html') {
        // Pàgina d'afegir/editar
        configurarFormulari();
    }
    
    // Configurar "enter" per a la cerca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                cercarContactes();
            }
        });
    }
}

// Esperar a que el DOM estigui carregat
document.addEventListener('DOMContentLoaded', init);