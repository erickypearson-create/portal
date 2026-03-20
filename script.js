const modalities = ['Connections', 'Interactive', 'Connect and Learn'];
const rooms = [
  { id: 'sala-01', name: 'Sala 01', unit: 'Unidade Centro', capacity: 12 },
  { id: 'sala-02', name: 'Sala 02', unit: 'Unidade Centro', capacity: 10 },
  { id: 'lab-english', name: 'English Lab', unit: 'Unidade Norte', capacity: 8 },
  { id: 'room-kids', name: 'Kids Room', unit: 'Unidade Sul', capacity: 14 },
];
const weekdays = [
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sáb' },
  { id: 'dom', label: 'Dom' },
];
const students = [
  { id: 1, name: 'Ana Paula Rocha', level: 'Teen 2' },
  { id: 2, name: 'Bruno Martins', level: 'Adults 4' },
  { id: 3, name: 'Carla Menezes', level: 'Kids 6' },
  { id: 4, name: 'Diego Cardoso', level: 'Business' },
  { id: 5, name: 'Fernanda Lima', level: 'Teen 3' },
  { id: 6, name: 'Gabriel Costa', level: 'Adults 1' },
  { id: 7, name: 'Helena Dias', level: 'Kids 4' },
  { id: 8, name: 'Igor Nascimento', level: 'Business' },
  { id: 9, name: 'Julia Prado', level: 'Connect and Learn' },
  { id: 10, name: 'Lucas Almeida', level: 'Interactive' },
];
let classes = [
  {
    id: crypto.randomUUID(),
    name: 'Business Empire - Segunda e Quarta',
    modality: 'Connections',
    roomId: 'sala-01',
    weekdays: ['seg', 'qua'],
    startTime: '18:30',
    endTime: '19:30',
    studentIds: [2, 4, 8],
    status: 'Ativa',
  },
  {
    id: crypto.randomUUID(),
    name: 'Interactive Teens',
    modality: 'Interactive',
    roomId: 'lab-english',
    weekdays: ['ter', 'qui'],
    startTime: '16:00',
    endTime: '17:00',
    studentIds: [1, 5, 10],
    status: 'Planejamento',
  },
  {
    id: crypto.randomUUID(),
    name: 'Connect and Learn - Sexta',
    modality: 'Connect and Learn',
    roomId: 'room-kids',
    weekdays: ['sex'],
    startTime: '10:00',
    endTime: '11:30',
    studentIds: [3, 6, 7, 9],
    status: 'Ativa',
  },
];
let selectedPage = 'home';
let editingClassId = null;
let draftStudentIds = [];

const navItems = [
  { id: 'home', label: 'Início', icon: '⌂' },
  { id: 'biblioteca', label: 'Biblioteca', icon: '▣' },
  { id: 'grupos', label: 'Grupos', icon: '👥' },
  { id: 'turmas', label: 'Turmas', icon: '🧑‍🏫' },
  { id: 'calendario', label: 'Calendário', icon: '🗓' },
  { id: 'painel', label: 'Painel', icon: '◫' },
  { id: 'idioma', label: 'Idioma', icon: '🌐' },
];

const navMenu = document.getElementById('navMenu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const classModal = document.getElementById('classModal');
const classForm = document.getElementById('classForm');
const classesList = document.getElementById('classesList');
const emptyState = document.getElementById('emptyState');
const classesSummary = document.getElementById('classesSummary');
const classSearch = document.getElementById('classSearch');
const modalityFilter = document.getElementById('modalityFilter');
const classModality = document.getElementById('classModality');
const classRoom = document.getElementById('classRoom');
const roomHelper = document.getElementById('roomHelper');
const classConflict = document.getElementById('classConflict');
const studentSearch = document.getElementById('studentSearch');
const studentOptions = document.getElementById('studentOptions');
const selectedStudents = document.getElementById('selectedStudents');
const weekdayGrid = document.getElementById('weekdayGrid');
const saveClassButton = document.getElementById('saveClassButton');

function initialize() {
  renderNav();
  renderWeekdays();
  renderSelectOptions();
  renderClasses();
  bindEvents();
  if (window.innerWidth < 1180) {
    openSidebar();
  }
  renderModalityOptions();
  renderClasses();
  bindEvents();
}

function bindEvents() {
  document.getElementById('openSidebar').addEventListener('click', openSidebar);
  document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.getElementById('createClassButton').addEventListener('click', () => openModal());
  document.getElementById('emptyCreateButton').addEventListener('click', () => openModal());
  document.getElementById('topbarTurmasButton').addEventListener('click', () => selectPage('turmas'));
  document.getElementById('heroTurmasButton').addEventListener('click', () => selectPage('turmas'));
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', closeModal);
  classForm.addEventListener('submit', handleSaveClass);
  classSearch.addEventListener('input', renderClasses);
  modalityFilter.addEventListener('change', renderClasses);
  studentSearch.addEventListener('input', renderStudentOptions);
  classRoom.addEventListener('change', updateRoomFeedback);
  document.getElementById('startTime').addEventListener('input', updateRoomFeedback);
  document.getElementById('endTime').addEventListener('input', updateRoomFeedback);
  weekdayGrid.addEventListener('change', updateRoomFeedback);
}

function renderNav() {
  navMenu.innerHTML = '';
  navItems.forEach((item) => {
    const button = document.createElement('button');
    button.className = `nav-item ${selectedPage === item.id ? 'is-active' : ''}`;
    button.innerHTML = `<span class="nav-item__icon">${item.icon}</span><span>${item.label}</span>`;
    button.addEventListener('click', () => {
      if (item.id === 'turmas' || item.id === 'home') {
        selectPage(item.id);
      }
      closeSidebar();
    });
    navMenu.appendChild(button);
  });
}

function selectPage(pageId) {
  selectedPage = pageId;
  document.querySelectorAll('.page').forEach((page) => {
    page.classList.toggle('page--active', page.dataset.page === pageId);
  });
  renderNav();
}

function renderSelectOptions() {
  modalityFilter.innerHTML = '<option value="all">Todas</option>';
  classModality.innerHTML = '';
  classRoom.innerHTML = '';

  modalities.forEach((modality) => {
    const filterOption = document.createElement('option');
    filterOption.value = modality;
    filterOption.textContent = modality;
    modalityFilter.appendChild(filterOption);

    const formOption = document.createElement('option');
    formOption.value = modality;
    formOption.textContent = modality;
    classModality.appendChild(formOption);
    const option = document.createElement('option');
    option.value = modality;
    option.textContent = modality;
    modalityFilter.appendChild(option.cloneNode(true));
    classModality.appendChild(option);
  });

  rooms.forEach((room) => {
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = `${room.name} • ${room.unit}`;
    classRoom.appendChild(option);
function renderModalityOptions() {
  modalityFilter.innerHTML = '<option value="all">Todas</option>';
  classModality.innerHTML = '';
  [modalityFilter, classModality].forEach((select) => {
    modalities.forEach((modality) => {
      const option = document.createElement('option');
      option.value = modality;
      option.textContent = modality;
      select.appendChild(option);
    });
  });
}

function renderWeekdays(selected = []) {
  weekdayGrid.innerHTML = '';
  weekdays.forEach((day) => {
    const label = document.createElement('label');
    label.className = `weekday-option ${selected.includes(day.id) ? 'is-selected' : ''}`;
    label.innerHTML = `<input type="checkbox" value="${day.id}" ${selected.includes(day.id) ? 'checked' : ''} />${day.label}`;
    label.addEventListener('click', () => {
      const input = label.querySelector('input');
      setTimeout(() => {
        label.classList.toggle('is-selected', input.checked);
        updateRoomFeedback();
      }, 0);
      setTimeout(() => label.classList.toggle('is-selected', input.checked), 0);
    });
    weekdayGrid.appendChild(label);
  });
}

function getFilteredClasses() {
  const searchTerm = classSearch.value.trim().toLowerCase();
  const modality = modalityFilter.value;
  return classes.filter((item) => {
    const room = findRoom(item.roomId);
    const matchesSearch = !searchTerm
      || item.name.toLowerCase().includes(searchTerm)
      || item.modality.toLowerCase().includes(searchTerm)
      || room.name.toLowerCase().includes(searchTerm)
      || room.unit.toLowerCase().includes(searchTerm);
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm) || item.modality.toLowerCase().includes(searchTerm);
    const matchesModality = modality === 'all' || item.modality === modality;
    return matchesSearch && matchesModality;
  });
}

function renderClasses() {
  const filtered = getFilteredClasses();
  renderSummary(filtered);
  classesList.innerHTML = '';
  emptyState.classList.toggle('hidden', filtered.length > 0);
  classesList.classList.toggle('hidden', filtered.length === 0);

  filtered.forEach((item) => {
    const room = findRoom(item.roomId);
    const article = document.createElement('article');
    article.className = 'card class-card';
    article.innerHTML = `
      <div class="class-card__header">
        <div>
          <h3>${item.name}</h3>
          <span class="tag">${item.modality}</span>
        </div>
        <button class="edit-link" data-edit-id="${item.id}">Editar</button>
      </div>
      <div class="class-card__meta">
        <div class="class-card__meta-item">🏫 <span>${room.name} • ${room.unit}</span></div>
        <div class="class-card__meta-item">🗓 <span>${formatWeekdays(item.weekdays)}</span></div>
        <div class="class-card__meta-item">🕒 <span>${item.startTime} - ${item.endTime}</span></div>
        <div class="class-card__meta-item">👥 <span>${item.studentIds.length} aluno(s)</span></div>
        <div class="class-card__meta-item">● <span>Status: ${item.status}</span></div>
      </div>
      <div class="class-card__footer">
        <div>
          <div class="class-card__students">${item.studentIds.slice(0, 3).map((studentId) => `<span class="chip">${findStudent(studentId).name.split(' ')[0]}</span>`).join('')}${item.studentIds.length > 3 ? `<span class="chip">+${item.studentIds.length - 3}</span>` : ''}</div>
          <div class="class-card__capacity">Capacidade da sala: ${room.capacity} lugares</div>
        </div>
        <div class="class-card__students">${item.studentIds.slice(0, 3).map((studentId) => `<span class="chip">${findStudent(studentId).name.split(' ')[0]}</span>`).join('')}${item.studentIds.length > 3 ? `<span class="chip">+${item.studentIds.length - 3}</span>` : ''}</div>
        <button class="secondary-button" data-edit-id="${item.id}">Editar turma</button>
      </div>
    `;
    classesList.appendChild(article);
  });

  classesList.querySelectorAll('[data-edit-id]').forEach((button) => {
    button.addEventListener('click', () => openModal(button.dataset.editId));
  });
}

function renderSummary(filtered) {
  const totalStudents = new Set(filtered.flatMap((item) => item.studentIds)).size;
  const activeCount = filtered.filter((item) => item.status === 'Ativa').length;
  const roomCount = new Set(filtered.map((item) => item.roomId)).size;
  classesSummary.innerHTML = `
    <article class="card stat-card"><div class="stat-card__label">Turmas visíveis</div><div class="stat-card__value">${filtered.length}</div></article>
    <article class="card stat-card"><div class="stat-card__label">Alunos envolvidos</div><div class="stat-card__value">${totalStudents}</div></article>
    <article class="card stat-card"><div class="stat-card__label">Salas em uso</div><div class="stat-card__value">${roomCount}</div></article>
  const totalDays = new Set(filtered.flatMap((item) => item.weekdays)).size;
  classesSummary.innerHTML = `
    <article class="card stat-card"><div class="stat-card__label">Turmas visíveis</div><div class="stat-card__value">${filtered.length}</div></article>
    <article class="card stat-card"><div class="stat-card__label">Alunos envolvidos</div><div class="stat-card__value">${totalStudents}</div></article>
    <article class="card stat-card"><div class="stat-card__label">Turmas ativas</div><div class="stat-card__value">${activeCount}</div></article>
  `;
}

function openModal(classId = null) {
  editingClassId = classId;
  const editingClass = classes.find((item) => item.id === classId);
  document.getElementById('modalTitle').textContent = editingClass ? 'Editar Turma' : 'Criar Turma';
  document.getElementById('modalSubtitle').textContent = editingClass
    ? 'Atualize as informações da turma, ajuste a sala e reorganize os integrantes.'
    : 'Preencha as informações da turma, selecione a sala e adicione os alunos.';
  document.getElementById('modalSubtitle').textContent = editingClass ? 'Atualize as informações da turma e ajuste os integrantes.' : 'Preencha as informações da turma e selecione os alunos.';
  saveClassButton.textContent = editingClass ? 'Salvar Alterações' : 'Salvar Turma';

  draftStudentIds = editingClass ? [...editingClass.studentIds] : [];
  document.getElementById('className').value = editingClass?.name ?? '';
  document.getElementById('startTime').value = editingClass?.startTime ?? '';
  document.getElementById('endTime').value = editingClass?.endTime ?? '';
  classModality.value = editingClass?.modality ?? modalities[0];
  classRoom.value = editingClass?.roomId ?? rooms[0].id;
  renderWeekdays(editingClass?.weekdays ?? []);
  studentSearch.value = '';
  renderSelectedStudents();
  renderStudentOptions();
  resetConflictMessage();
  updateRoomFeedback();
  classModal.classList.remove('hidden');
  classModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  classModal.classList.add('hidden');
  classModal.setAttribute('aria-hidden', 'true');
  classForm.reset();
  editingClassId = null;
  draftStudentIds = [];
  renderWeekdays();
  classRoom.value = rooms[0].id;
  roomHelper.textContent = 'Selecione a sala para evitar conflito com outros professores.';
  resetConflictMessage();
}

function handleSaveClass(event) {
  event.preventDefault();
  const selectedWeekdays = getSelectedWeekdays();
  const selectedWeekdays = Array.from(weekdayGrid.querySelectorAll('input:checked')).map((input) => input.value);
  const payload = {
    id: editingClassId || crypto.randomUUID(),
    name: document.getElementById('className').value.trim(),
    modality: classModality.value,
    roomId: classRoom.value,
    weekdays: selectedWeekdays,
    startTime: document.getElementById('startTime').value,
    endTime: document.getElementById('endTime').value,
    studentIds: [...draftStudentIds],
    status: draftStudentIds.length ? 'Ativa' : 'Planejamento',
  };

  if (!payload.name || !payload.roomId || !payload.weekdays.length || !payload.startTime || !payload.endTime) {
    return;
  }

  const capacityIssue = findCapacityIssue(payload);
  if (capacityIssue) {
    classConflict.textContent = capacityIssue;
    classConflict.classList.remove('hidden', 'conflict-message--success');
    classConflict.classList.add('conflict-message--error');
    return;
  }

  const conflict = findClassConflict(payload);
  if (conflict) {
    showConflictMessage(conflict);
  if (!payload.name || !payload.weekdays.length || !payload.startTime || !payload.endTime) {
    return;
  }

  if (editingClassId) {
    classes = classes.map((item) => item.id === editingClassId ? payload : item);
  } else {
    classes = [payload, ...classes];
  }

  renderClasses();
  closeModal();
  selectPage('turmas');
}

function renderStudentOptions() {
  const term = studentSearch.value.trim().toLowerCase();
  const options = students.filter((student) => !draftStudentIds.includes(student.id) && (!term || student.name.toLowerCase().includes(term)));
  studentOptions.innerHTML = '';

  if (!options.length) {
    studentOptions.innerHTML = '<div class="student-option"><div class="student-option__info"><strong>Nenhum aluno encontrado</strong><span>Tente outro termo de busca.</span></div></div>';
    return;
  }

  options.forEach((student) => {
    const option = document.createElement('div');
    option.className = 'student-option';
    option.innerHTML = `<div class="student-option__info"><strong>${student.name}</strong><span>${student.level}</span></div><button type="button" class="secondary-button">Adicionar</button>`;
    option.querySelector('button').addEventListener('click', () => {
      draftStudentIds.push(student.id);
      renderSelectedStudents();
      renderStudentOptions();
      updateRoomFeedback();
    });
    studentOptions.appendChild(option);
  });
}

function renderSelectedStudents() {
  selectedStudents.innerHTML = '';
  draftStudentIds.forEach((studentId) => {
    const student = findStudent(studentId);
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `${student.name}<button type="button" aria-label="Remover aluno">✕</button>`;
    chip.querySelector('button').addEventListener('click', () => {
      draftStudentIds = draftStudentIds.filter((id) => id !== studentId);
      renderSelectedStudents();
      renderStudentOptions();
      updateRoomFeedback();
    });
    selectedStudents.appendChild(chip);
  });
}

function getSelectedWeekdays() {
  return Array.from(weekdayGrid.querySelectorAll('input:checked')).map((input) => input.value);
}

function findClassConflict(payload) {
  return classes.find((item) => {
    if (item.id === editingClassId || item.roomId !== payload.roomId) {
      return false;
    }

    const sharesDay = item.weekdays.some((day) => payload.weekdays.includes(day));
    return sharesDay && timesOverlap(item.startTime, item.endTime, payload.startTime, payload.endTime);
  }) || null;
}

function findCapacityIssue(payload) {
  const room = findRoom(payload.roomId);
  if (payload.studentIds.length > room.capacity) {
    return `A sala ${room.name} suporta ${room.capacity} aluno(s), mas a turma está com ${payload.studentIds.length}.`;
  }
  return null;
}

function updateRoomFeedback() {
  const selectedWeekdays = getSelectedWeekdays();
  const payload = {
    roomId: classRoom.value,
    weekdays: selectedWeekdays,
    startTime: document.getElementById('startTime').value,
    endTime: document.getElementById('endTime').value,
    studentIds: [...draftStudentIds],
  };
  const room = findRoom(payload.roomId);

  roomHelper.textContent = `${room.name} • ${room.unit} · capacidade para ${room.capacity} aluno(s).`;

  if (!payload.roomId || !payload.weekdays.length || !payload.startTime || !payload.endTime) {
    resetConflictMessage();
    return;
  }

  const capacityIssue = findCapacityIssue(payload);
  if (capacityIssue) {
    classConflict.textContent = capacityIssue;
    classConflict.classList.remove('hidden', 'conflict-message--success');
    classConflict.classList.add('conflict-message--error');
    return;
  }

  const conflict = findClassConflict(payload);
  if (conflict) {
    showConflictMessage(conflict);
  } else {
    classConflict.textContent = `${room.name} disponível para os dias e horários selecionados.`;
    classConflict.classList.remove('hidden', 'conflict-message--error');
    classConflict.classList.add('conflict-message--success');
  }
}

function showConflictMessage(conflictClass) {
  const room = findRoom(conflictClass.roomId);
  classConflict.textContent = `Conflito de sala: ${room.name} já está reservada para "${conflictClass.name}" em ${formatWeekdays(conflictClass.weekdays)} (${conflictClass.startTime} - ${conflictClass.endTime}).`;
  classConflict.classList.remove('hidden', 'conflict-message--success');
  classConflict.classList.add('conflict-message--error');
}

function resetConflictMessage() {
  classConflict.textContent = '';
  classConflict.classList.add('hidden');
  classConflict.classList.remove('conflict-message--success', 'conflict-message--error');
}

function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function formatWeekdays(ids) {
  return ids.map((id) => weekdays.find((day) => day.id === id)?.label).join(' • ');
}

function findStudent(studentId) {
  return students.find((student) => student.id === studentId);
}

function findRoom(roomId) {
  return rooms.find((room) => room.id === roomId) || rooms[0];
}

function openSidebar() {
  sidebar.classList.add('sidebar--open');
  overlay.classList.add('overlay--visible');
}

function closeSidebar() {
  sidebar.classList.remove('sidebar--open');
  overlay.classList.remove('overlay--visible');
}

initialize();
