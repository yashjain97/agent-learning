// ===== Data Layer =====
const STORAGE_KEY = 'kanban-tickets';

const STATUS_LABELS = {
  'backlog': 'Backlog',
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done'
};

function loadTickets() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTickets(tickets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ===== State =====
let tickets = loadTickets();

// ===== DOM References =====
const board = document.getElementById('board');
const modalOverlay = document.getElementById('modal-overlay');
const ticketForm = document.getElementById('ticket-form');
const titleInput = document.getElementById('ticket-title');
const descInput = document.getElementById('ticket-desc');
const addBtn = document.getElementById('add-ticket-btn');
const cancelBtn = document.getElementById('cancel-btn');

// ===== Rendering =====
function render() {
  // Clear all ticket lists
  document.querySelectorAll('.ticket-list').forEach(list => {
    list.innerHTML = '';
  });

  // Group tickets by status and populate columns
  for (const ticket of tickets) {
    const list = document.querySelector(`.ticket-list[data-status="${ticket.status}"]`);
    if (!list) continue;

    const card = document.createElement('div');
    card.className = 'ticket';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', ticket.id);
    card.setAttribute('data-status', ticket.status);

    const titleEl = document.createElement('div');
    titleEl.className = 'ticket-title';
    titleEl.textContent = ticket.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'ticket-delete';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Delete ticket';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTicket(ticket.id);
    });

    card.appendChild(titleEl);
    card.appendChild(deleteBtn);

    if (ticket.description) {
      const descEl = document.createElement('div');
      descEl.className = 'ticket-desc';
      descEl.textContent = ticket.description;
      card.appendChild(descEl);
    }

    const badge = document.createElement('span');
    badge.className = 'ticket-status-badge';
    badge.textContent = STATUS_LABELS[ticket.status] || ticket.status;
    card.appendChild(badge);

    // Drag events on card
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    list.appendChild(card);
  }

  // Update ticket counts
  for (const status of Object.keys(STATUS_LABELS)) {
    const count = tickets.filter(t => t.status === status).length;
    const countEl = document.querySelector(`.ticket-count[data-count="${status}"]`);
    if (countEl) countEl.textContent = count;
  }
}

// ===== Ticket CRUD =====
function addTicket(title, description) {
  const ticket = {
    id: generateId(),
    title: title.trim(),
    description: description.trim(),
    status: 'backlog'
  };
  tickets.push(ticket);
  saveTickets(tickets);
  render();
}

function deleteTicket(id) {
  tickets = tickets.filter(t => t.id !== id);
  saveTickets(tickets);
  render();
}

function moveTicket(id, newStatus) {
  const ticket = tickets.find(t => t.id === id);
  if (ticket && ticket.status !== newStatus) {
    ticket.status = newStatus;
    saveTickets(tickets);
    render();
  }
}

// ===== Drag & Drop =====
let draggedId = null;

function handleDragStart(e) {
  draggedId = e.target.closest('.ticket').dataset.id;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedId);
  // Delay adding class so the drag image captures the full card
  requestAnimationFrame(() => {
    e.target.closest('.ticket').classList.add('dragging');
  });
}

function handleDragEnd(e) {
  e.target.closest('.ticket')?.classList.remove('dragging');
  draggedId = null;
  // Remove all drag-over highlights
  document.querySelectorAll('.column.drag-over').forEach(col => {
    col.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const column = e.target.closest('.column');
  if (column && !column.classList.contains('drag-over')) {
    // Remove highlight from other columns
    document.querySelectorAll('.column.drag-over').forEach(col => {
      col.classList.remove('drag-over');
    });
    column.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  const column = e.target.closest('.column');
  if (column && !column.contains(e.relatedTarget)) {
    column.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  const column = e.target.closest('.column');
  if (!column) return;

  column.classList.remove('drag-over');

  const ticketId = e.dataTransfer.getData('text/plain');
  const newStatus = column.dataset.status;

  if (ticketId && newStatus) {
    moveTicket(ticketId, newStatus);
  }
}

// Attach drag events to all columns
document.querySelectorAll('.column').forEach(column => {
  column.addEventListener('dragover', handleDragOver);
  column.addEventListener('dragleave', handleDragLeave);
  column.addEventListener('drop', handleDrop);
});

// ===== Modal =====
function openModal() {
  modalOverlay.classList.remove('hidden');
  titleInput.value = '';
  descInput.value = '';
  titleInput.focus();
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

addBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
    closeModal();
  }
});

ticketForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value;
  const desc = descInput.value;
  if (title.trim()) {
    addTicket(title, desc);
    closeModal();
  }
});

// ===== Init =====
render();
