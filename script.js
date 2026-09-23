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
    id: createId(),
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
    id: createId(),
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
    id: createId(),
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
let selectedClassId = null;
let selectedStudentId = null;
const lessonRecords = {};

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `class-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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
const classesOverview = document.getElementById('classesOverview');
const classDetail = document.getElementById('classDetail');
const studentRecord = document.getElementById('studentRecord');

function initialize() {
  bindEvents();
  renderWeekdays();
  renderSelectOptions();
  syncPageWithHash();
  renderClasses();
  updateRoomFeedback();
  window.addEventListener('hashchange', syncPageWithHash);
}

function bindEvents() {
  document.getElementById('openSidebar').addEventListener('click', openSidebar);
  document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  document.getElementById('createClassButton').addEventListener('click', () => openModal());
  document.getElementById('emptyCreateButton').addEventListener('click', () => openModal());
  document.getElementById('topbarTurmasButton').addEventListener('click', () => {
    navigateToPage('turmas');
  });
  document.getElementById('heroTurmasButton').addEventListener('click', () => {
    navigateToPage('turmas');
  });

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

  navMenu.querySelectorAll('[data-nav-id]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const pageId = link.dataset.navId;
      if (pageId !== 'home' && pageId !== 'turmas') {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      navigateToPage(pageId);
      closeSidebar();
    });
  });
}

function syncPageWithHash() {
  const hashPage = window.location.hash.replace('#', '');
  const nextPage = hashPage === 'turmas' ? 'turmas' : 'home';
  selectPage(nextPage);
}

function selectPage(pageId) {
  selectedPage = pageId;
  document.querySelectorAll('.page').forEach((page) => {
    page.classList.toggle('page--active', page.dataset.page === pageId);
  });

  navMenu.querySelectorAll('[data-nav-id]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.navId === pageId);
  });
  if (pageId !== 'turmas') showClassesOverview();
}

function navigateToPage(pageId) {
  selectPage(pageId);
  const nextHash = `#${pageId}`;
  if (window.location.hash !== nextHash) {
    window.location.hash = pageId;
  }
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
  });

  rooms.forEach((room) => {
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = `${room.name} • ${room.unit}`;
    classRoom.appendChild(option);
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
    article.className = 'card class-card class-card--clickable';
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
          <div class="class-card__students">${item.studentIds
            .slice(0, 3)
            .map((studentId) => `<span class="chip">${findStudent(studentId).name.split(' ')[0]}</span>`)
            .join('')}${item.studentIds.length > 3 ? `<span class="chip">+${item.studentIds.length - 3}</span>` : ''}</div>
          <div class="class-card__capacity">Capacidade da sala: ${room.capacity} lugares</div>
        </div>
        <button class="primary-button class-card__open" data-open-id="${item.id}"><span>👥</span> Abrir turma e chamada <span aria-hidden="true">→</span></button>
        <button class="secondary-button" data-open-id="${item.id}">Ver alunos</button>
      </div>
    `;
    classesList.appendChild(article);
  });

  classesList.querySelectorAll('[data-edit-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      openModal(button.dataset.editId);
    });
  });
  classesList.querySelectorAll('.class-card').forEach((card) => {
    const classId = card.querySelector('[data-open-id]').dataset.openId;
    card.addEventListener('click', () => openClassDetail(classId));
  });
}

function showClassesOverview() {
  selectedClassId = null;
  selectedStudentId = null;
  classesOverview.classList.remove('hidden');
  classDetail.classList.add('hidden');
  studentRecord.classList.add('hidden');
}

function openClassDetail(classId) {
  const item = classes.find((entry) => entry.id === classId);
  if (!item) return;
  selectedClassId = classId;
  classesOverview.classList.add('hidden');
  studentRecord.classList.add('hidden');
  classDetail.classList.remove('hidden');
  classDetail.innerHTML = `
    <button class="breadcrumb-button" type="button" id="backToClasses">← Voltar para Turmas</button>
    <div class="card detail-hero">
      <div><span class="tag">${item.modality}</span><h1>${item.name}</h1><p>${formatWeekdays(item.weekdays)} · ${item.startTime} - ${item.endTime} · ${findRoom(item.roomId).name}</p></div>
      <strong>${item.studentIds.length} aluno(s)</strong>
    </div>
    <div><div class="section-header"><div><span class="flow-step">PASSO 2 DE 3</span><h2>Selecione um aluno</h2><p>Clique no nome do aluno para abrir a ficha de presença e notas.</p></div></div>
    <div><div class="section-header"><div><h2>ALUNOS DA TURMA</h2><p>Selecione um aluno para registrar presença e conceitos F.A.L.E.</p></div></div>
      <div class="student-list">${item.studentIds.length ? item.studentIds.map((id) => {
        const student = findStudent(id);
        return `<button class="student-row" type="button" data-student-id="${id}"><span><strong>${student.name}</strong><span>${student.level}</span></span><span class="student-row__action">Acessar aluno →</span></button>`;
      }).join('') : '<div class="card empty-state"><h3>Nenhum aluno nesta turma</h3><p>Edite a turma para adicionar integrantes.</p></div>'}</div>
    </div>`;
  document.getElementById('backToClasses').addEventListener('click', showClassesOverview);
  classDetail.querySelectorAll('[data-student-id]').forEach((button) => button.addEventListener('click', () => openStudentRecord(Number(button.dataset.studentId))));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openStudentRecord(studentId) {
  const item = classes.find((entry) => entry.id === selectedClassId);
  const student = findStudent(studentId);
  if (!item || !student) return;
  selectedStudentId = studentId;
  classDetail.classList.add('hidden');
  studentRecord.classList.remove('hidden');
  renderStudentRecord(item, student);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function recordKey(classId, studentId) { return `${classId}:${studentId}`; }

function renderStudentRecord(item, student) {
  const records = lessonRecords[recordKey(item.id, student.id)] || [];
  const today = new Date().toISOString().slice(0, 10);
  studentRecord.innerHTML = `
    <button class="breadcrumb-button" type="button" id="backToStudents">← Voltar para alunos</button>
    <div class="card detail-hero"><div><span class="tag">${student.level}</span><h1>${student.name}</h1><p>${item.name}</p></div></div>
    <div class="card record-card"><span class="flow-step">PASSO 3 DE 3</span><h2>Presença e notas da aula</h2><form id="lessonForm" class="lesson-form">
    <div class="card record-card"><h2>Registro da aula</h2><form id="lessonForm" class="lesson-form">
      <div class="lesson-info-grid"><div class="field-group"><label for="lessonDate">Data da aula</label><input class="lesson-date" id="lessonDate" type="date" value="${today}" required></div>
      <div class="field-group"><span class="field-label">Presença</span><div class="attendance-options"><label class="attendance-option"><input type="radio" name="attendance" value="Presente" checked><span>✓ Presente</span></label><label class="attendance-option"><input type="radio" name="attendance" value="Ausente"><span>✕ Ausente</span></label><label class="attendance-option"><input type="radio" name="attendance" value="Justificada"><span>! Justificada</span></label></div></div></div>
      <div><span class="field-label">Conceitos F.A.L.E. <small>(notas de 0 a 10)</small></span><div class="fale-grid">
        ${['F','A','L','E'].map((letter) => `<label class="fale-field"><strong>Conceito ${letter}</strong><small>Avaliação do desempenho na aula</small><input name="grade${letter}" type="number" min="0" max="10" step="0.1" required placeholder="0 a 10"></label>`).join('')}
      </div></div><label class="field-group"><span class="field-label">Observações da aula</span><textarea class="lesson-notes" name="notes" placeholder="Registre comentários sobre o desempenho do aluno..."></textarea></label>
      <div id="saveFeedback" class="save-feedback hidden" role="status"></div><div class="modal__actions"><button class="primary-button" type="submit">Salvar presença e notas</button></div>
    </form></div>
    <div class="card record-card"><h2>Histórico de aulas</h2><div class="history-list">${records.length ? records.map((record) => `<div class="history-row"><strong>${formatDate(record.date)}</strong><span>${record.attendance}</span><div class="history-row__grades">F: ${record.grades.F} · A: ${record.grades.A} · L: ${record.grades.L} · E: ${record.grades.E}</div></div>`).join('') : '<p class="helper-text">Nenhum registro realizado para este aluno.</p>'}</div></div>`;
  document.getElementById('backToStudents').addEventListener('click', () => openClassDetail(item.id));
  document.getElementById('lessonForm').addEventListener('submit', (event) => saveLessonRecord(event, item, student));
}

function saveLessonRecord(event, item, student) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const record = { date: document.getElementById('lessonDate').value, attendance: data.get('attendance'), grades: { F: data.get('gradeF'), A: data.get('gradeA'), L: data.get('gradeL'), E: data.get('gradeE') }, notes: data.get('notes').trim() };
  const key = recordKey(item.id, student.id);
  lessonRecords[key] = [...(lessonRecords[key] || []).filter((entry) => entry.date !== record.date), record].sort((a, b) => b.date.localeCompare(a.date));
  renderStudentRecord(item, student);
  const feedback = document.getElementById('saveFeedback');
  feedback.textContent = 'Presença e conceitos salvos com sucesso.';
  feedback.classList.remove('hidden');
}

function formatDate(date) { return date.split('-').reverse().join('/'); }

function renderSummary(filtered) {
  const totalStudents = new Set(filtered.flatMap((item) => item.studentIds)).size;
  const activeCount = filtered.filter((item) => item.status === 'Ativa').length;
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
  const payload = {
    id: editingClassId || createId(),
    name: document.getElementById('className').value.trim(),
    modality: classModality.value,
    roomId: classRoom.value,
    weekdays: getSelectedWeekdays(),
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
    return;
  }

  if (editingClassId) {
    classes = classes.map((item) => (item.id === editingClassId ? payload : item));
  } else {
    classes = [payload, ...classes];
  }

  renderClasses();
  closeModal();
  navigateToPage('turmas');
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
  const payload = {
    roomId: classRoom.value,
    weekdays: getSelectedWeekdays(),
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
