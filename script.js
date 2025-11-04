let tasks = [];
let favorites = [];
let editingTaskId = null;
let deleteTaskId = null;
let currentPage = 'active';

// Load tasks and favorites
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (e) {
            console.error('Error loading tasks:', e);
            tasks = [];
        }
    }
}

function loadFavorites() {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        try {
            favorites = JSON.parse(savedFavorites);
        } catch (e) {
            console.error('Error loading favorites:', e);
            favorites = ['BCGAME', 'JBCOM', 'TSLOTS', 'TWIXER', 'COMSOC', 'OTHERS'];
        }
    } else {
        favorites = ['BCGAME', 'JBCOM', 'TSLOTS', 'TWIXER', 'COMSOC', 'OTHERS'];
    }
    renderFavorites();
}

function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
        console.error('Error saving tasks:', e);
    }
}

function saveFavorites() {
    try {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (e) {
        console.error('Error saving favorites:', e);
    }
}

function renderFavorites() {
    const container = document.getElementById('companySuggestions');
    const containerEdit = document.getElementById('companySuggestionsEdit');
    
    container.innerHTML = '';
    containerEdit.innerHTML = '';
    
    favorites.forEach(fav => {
        const tag = document.createElement('button');
        tag.type = 'button';
        tag.className = 'company-tag';
        tag.dataset.company = fav;
        tag.innerHTML = `
            ${fav}
            <span class="remove-favorite" data-company="${fav}">
                <i class="fas fa-times"></i>
            </span>
        `;
        
        tag.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-favorite')) {
                document.getElementById('taskCompany').value = fav;
            }
        });
        
        const removeBtn = tag.querySelector('.remove-favorite');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(fav);
        });
        
        container.appendChild(tag);
        
        // Clone for edit modal
        const tagEdit = tag.cloneNode(true);
        tagEdit.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-favorite')) {
                document.getElementById('editCompany').value = fav;
            }
        });
        const removeBtnEdit = tagEdit.querySelector('.remove-favorite');
        removeBtnEdit.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(fav);
        });
        containerEdit.appendChild(tagEdit);
    });
}

function removeFavorite(company) {
    favorites = favorites.filter(f => f !== company);
    saveFavorites();
    renderFavorites();
}

function checkDueTasks() {
    const today = new Date().toISOString().split('T')[0];
    const dueTasks = tasks.filter(task => task.date === today && task.status === 'active');
    
    if (dueTasks.length > 0) {
        document.getElementById('notification').classList.add('show');
    }
}

// Hamburger menu
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

hamburgerMenu.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
});

sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        item.classList.add('active');
        const page = item.dataset.page;
        currentPage = page;
        document.getElementById(page + 'Page').classList.add('active');

        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
});

// Color picker
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('taskColor').value = btn.dataset.color;
    });
});

document.querySelectorAll('.color-btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn-edit').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('editColor').value = btn.dataset.color;
    });
});

// File input handlers
document.getElementById('taskImage').addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name || '';
    const label = document.getElementById('fileInputLabel');
    if (fileName) {
        document.getElementById('fileName').textContent = `Selected: ${fileName}`;
        label.classList.add('uploaded');
    } else {
        document.getElementById('fileName').textContent = '';
        label.classList.remove('uploaded');
    }
});

document.getElementById('editImage').addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name || '';
    const label = document.getElementById('editFileInputLabel');
    if (fileName) {
        document.getElementById('editFileName').textContent = `Selected: ${fileName}`;
        label.classList.add('uploaded');
    } else {
        document.getElementById('editFileName').textContent = '';
        label.classList.remove('uploaded');
    }
});

// Add favorite modal
document.getElementById('addFavoriteBtn').addEventListener('click', () => {
    document.getElementById('favoriteModal').classList.add('show');
});

document.getElementById('addFavoriteBtnEdit').addEventListener('click', () => {
    document.getElementById('favoriteModal').classList.add('show');
});

document.getElementById('favoriteModalClose').addEventListener('click', () => {
    document.getElementById('favoriteModal').classList.remove('show');
});

document.getElementById('favoriteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const companyName = document.getElementById('favoriteCompanyName').value.toUpperCase();
    if (!favorites.includes(companyName)) {
        favorites.push(companyName);
        saveFavorites();
        renderFavorites();
    }
    document.getElementById('favoriteModal').classList.remove('show');
    document.getElementById('favoriteForm').reset();
});

// Add new task
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const task = {
        id: Date.now(),
        company: document.getElementById('taskCompany').value,
        color: document.getElementById('taskColor').value,
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        date: document.getElementById('taskDate').value,
        done: false,
        status: 'active',
        image: null
    };

    const imageFile = document.getElementById('taskImage').files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
            task.image = event.target.result;
            tasks.push(task);
            saveTasks();
            renderTasks();
            document.getElementById('taskForm').reset();
            document.getElementById('fileName').textContent = '';
            document.getElementById('fileInputLabel').classList.remove('uploaded');
            document.getElementById('taskColor').value = '#ef476f';
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.color-btn[data-color="#ef476f"]').classList.add('active');
            
            switchToPage('active');
        };
        reader.readAsDataURL(imageFile);
    } else {
        tasks.push(task);
        saveTasks();
        renderTasks();
        document.getElementById('taskForm').reset();
        document.getElementById('taskColor').value = '#ef476f';
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.color-btn[data-color="#ef476f"]').classList.add('active');
        
        switchToPage('active');
    }
});

function switchToPage(page) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    document.getElementById(page + 'Page').classList.add('active');
}

function renderTasks() {
    const activeTasks = document.getElementById('activeTasks');
    const doneTasks = document.getElementById('doneTasks');
    const deletedTasks = document.getElementById('deletedTasks');

    activeTasks.innerHTML = '';
    doneTasks.innerHTML = '';
    deletedTasks.innerHTML = '';

    const active = tasks.filter(t => t.status === 'active');
    const done = tasks.filter(t => t.status === 'done');
    const deleted = tasks.filter(t => t.status === 'deleted');

    if (active.length === 0) {
        activeTasks.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>No active tasks</p></div>';
    } else {
        active.forEach(task => activeTasks.appendChild(createTaskCard(task)));
    }

    if (done.length === 0) {
        doneTasks.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No completed tasks</p></div>';
    } else {
        done.forEach(task => doneTasks.appendChild(createTaskCard(task)));
    }

    if (deleted.length === 0) {
        deletedTasks.innerHTML = '<div class="empty-state"><i class="fas fa-trash"></i><p>No deleted tasks</p></div>';
    } else {
        deleted.forEach(task => deletedTasks.appendChild(createTaskCard(task)));
    }
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card' + (task.status === 'done' ? ' done-card' : '');
    
    let actionsHTML = '';
    if (task.status === 'deleted') {
        actionsHTML = `
            <div class="task-actions">
                <div></div>
                <div class="action-buttons">
                    <button class="icon-btn restore" data-id="${task.id}">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="icon-btn permanent-delete" data-id="${task.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    } else {
        actionsHTML = `
            <div class="task-actions">
                <div class="task-checkbox">
                    <input type="checkbox" ${task.done ? 'checked' : ''} data-id="${task.id}">
                    <span>Done</span>
                </div>
                <div class="action-buttons">
                    <button class="icon-btn edit" data-id="${task.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete" data-id="${task.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    const companyColor = task.color || '#ef476f';
    
    card.innerHTML = `
        <div class="task-company" style="background: ${companyColor};">${task.company}</div>
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description || 'No description'}</div>
        <div class="task-date">
            <i class="fas fa-calendar"></i>
            ${new Date(task.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
        ${task.image ? `<img src="${task.image}" alt="Task image" class="task-image">` : ''}
        ${actionsHTML}
    `;

    // Click card to view details (except when clicking buttons)
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.task-actions')) {
            openViewModal(task.id);
        }
    });

    // Event listeners
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox) {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        checkbox.addEventListener('change', (e) => {
            const taskId = parseInt(e.target.dataset.id);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.done = e.target.checked;
                task.status = e.target.checked ? 'done' : 'active';
                saveTasks();
                renderTasks();
            }
        });
    }

    const editBtn = card.querySelector('.edit');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(e.target.closest('.icon-btn').dataset.id);
            openEditModal(taskId);
        });
    }

    const deleteBtn = card.querySelector('.delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(e.target.closest('.icon-btn').dataset.id);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.status = 'deleted';
                saveTasks();
                renderTasks();
            }
        });
    }

    const restoreBtn = card.querySelector('.restore');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(e.target.closest('.icon-btn').dataset.id);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.status = task.done ? 'done' : 'active';
                saveTasks();
                renderTasks();
            }
        });
    }

    const permanentDeleteBtn = card.querySelector('.permanent-delete');
    if (permanentDeleteBtn) {
        permanentDeleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(e.target.closest('.icon-btn').dataset.id);
            deleteTaskId = taskId;
            document.getElementById('confirmModal').classList.add('show');
        });
    }

    return card;
}

// Confirmation modal handlers
document.getElementById('confirmCancel').addEventListener('click', () => {
    document.getElementById('confirmModal').classList.remove('show');
    deleteTaskId = null;
});

document.getElementById('confirmDelete').addEventListener('click', () => {
    if (deleteTaskId !== null) {
        tasks = tasks.filter(t => t.id !== deleteTaskId);
        saveTasks();
        renderTasks();
        document.getElementById('confirmModal').classList.remove('show');
        deleteTaskId = null;
    }
});

document.getElementById('confirmModal').addEventListener('click', (e) => {
    if (e.target.id === 'confirmModal') {
        document.getElementById('confirmModal').classList.remove('show');
        deleteTaskId = null;
    }
});

function openViewModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const companyColor = task.color || '#ef476f';
    
    const content = document.getElementById('viewModalContent');
    content.innerHTML = `
        <div class="view-detail-group">
            <label>Company</label>
            <div class="task-company" style="background: ${companyColor};">${task.company}</div>
        </div>
        <div class="view-detail-group">
            <label>Title</label>
            <p>${task.title}</p>
        </div>
        <div class="view-detail-group">
            <label>Description</label>
            <p>${task.description || 'No description'}</p>
        </div>
        <div class="view-detail-group">
            <label>Due Date</label>
            <p>${new Date(task.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        ${task.image ? `
            <div class="view-detail-group">
                <label>Image</label>
                <img src="${task.image}" alt="Task image">
            </div>
        ` : ''}
    `;
    
    document.getElementById('viewModal').classList.add('show');
}

document.getElementById('viewModalClose').addEventListener('click', () => {
    document.getElementById('viewModal').classList.remove('show');
});

document.getElementById('viewModal').addEventListener('click', (e) => {
    if (e.target.id === 'viewModal') {
        document.getElementById('viewModal').classList.remove('show');
    }
});

function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    editingTaskId = taskId;

    document.getElementById('editCompany').value = task.company;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDescription').value = task.description;
    document.getElementById('editDate').value = task.date;
    document.getElementById('editColor').value = task.color || '#ef476f';
    
    // Set active color button
    document.querySelectorAll('.color-btn-edit').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.color-btn-edit[data-color="${task.color || '#ef476f'}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    document.getElementById('editModal').classList.add('show');
}

document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('editModal').classList.remove('show');
    document.getElementById('editFileInputLabel').classList.remove('uploaded');
    editingTaskId = null;
});

document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.id === 'editModal') {
        document.getElementById('editModal').classList.remove('show');
        document.getElementById('editFileInputLabel').classList.remove('uploaded');
        editingTaskId = null;
    }
});

document.getElementById('favoriteModal').addEventListener('click', (e) => {
    if (e.target.id === 'favoriteModal') {
        document.getElementById('favoriteModal').classList.remove('show');
    }
});

document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    task.company = document.getElementById('editCompany').value;
    task.color = document.getElementById('editColor').value;
    task.title = document.getElementById('editTitle').value;
    task.description = document.getElementById('editDescription').value;
    task.date = document.getElementById('editDate').value;

    const imageFile = document.getElementById('editImage').files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
            task.image = event.target.result;
            saveTasks();
            renderTasks();
            document.getElementById('editModal').classList.remove('show');
            document.getElementById('editForm').reset();
            document.getElementById('editFileName').textContent = '';
            document.getElementById('editFileInputLabel').classList.remove('uploaded');
            editingTaskId = null;
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveTasks();
        renderTasks();
        document.getElementById('editModal').classList.remove('show');
        document.getElementById('editForm').reset();
        editingTaskId = null;
    }
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

// Initialize
loadTasks();
loadFavorites();
checkDueTasks();
renderTasks();