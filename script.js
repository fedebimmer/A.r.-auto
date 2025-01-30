document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  const form = document.getElementById('requestForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');
  const requestIdSpan = document.getElementById('requestId');
  const companyWrapper = document.getElementById('companyWrapper');
  const userTypeRadios = form.querySelectorAll('input[name="userType"]');
  const prioritySelect = document.getElementById('priority');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Local Storage keys
  const STORAGE_KEY = 'userFormData';
  const THEME_KEY = 'theme';

  // Theme Management
  function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      html.setAttribute('data-theme', savedTheme);
      themeToggle.checked = savedTheme === 'dark';
    }
  }

  themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  });

  // Hide company wrapper by default
  companyWrapper.style.display = 'none';

  // Load saved data from LocalStorage
  function loadSavedData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const data = JSON.parse(savedData);
      document.getElementById('name').value = data.name || '';
      document.getElementById('company').value = data.company || '';
      document.getElementById('vehicle').value = data.vehicle || '';
      document.getElementById('description').value = data.description || '';
      
      if (data.userType) {
        form.querySelector(`input[name="userType"][value="${data.userType}"]`).checked = true;
        // Show company wrapper only if 'azienda' is selected
        companyWrapper.style.display = data.userType === 'azienda' ? 'block' : 'none';
      }
      
      if (data.name) {
        welcomeMessage.textContent = `Bentornato, ${data.name}!`;
      }
    }
  }

  // Save data to LocalStorage
  function saveToLocalStorage() {
    const formData = {
      name: document.getElementById('name').value,
      company: document.getElementById('company').value,
      vehicle: document.getElementById('vehicle').value,
      description: document.getElementById('description').value,
      userType: form.querySelector('input[name="userType"]:checked').value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }

  // Clear saved data
  function clearSavedData() {
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    welcomeMessage.textContent = '';
    companyWrapper.style.display = 'none';
    submitBtn.style.backgroundColor = '#007aff';
  }

  // Event Listeners
  userTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'azienda') {
        companyWrapper.style.display = 'block';
      } else {
        companyWrapper.style.display = 'none';
        document.getElementById('company').value = '';
      }
      saveToLocalStorage();
    });
  });

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons rotating">sync</span> Invio in corso...';

    const name = document.getElementById('name').value.trim();
    const company = document.getElementById('company').value.trim();
    const vehicle = document.getElementById('vehicle').value.trim().toUpperCase();
    const description = document.getElementById('description').value.trim();
    const requestType = form.querySelector('input[name="requestType"]:checked').value;
    const userType = form.querySelector('input[name="userType"]:checked').value;
    const priority = prioritySelect.value;

    const requestId = `ID-${Math.floor(Math.random() * 100000)}`;

    const encodedMessage = encodeURIComponent(`
      Buongiorno, ecco una nuova richiesta da A.R. Auto snc:
      - ID richiesta: ${requestId}
      - Tipo di cliente: ${userType}
      - Nome: ${name}
      - Officina: ${company}
      - Veicolo: ${vehicle}
      - Tipo richiesta: ${requestType}
      - Priorità: ${priority}
      - Dettagli: ${description}
    `);

    const whatsappURL = `https://api.whatsapp.com/send?phone=393939393799&text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');

    requestIdSpan.textContent = requestId;
    successMessage.style.display = 'block';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-icons">send</span> Invia';
      submitBtn.classList.add('send-animation');
    }, 1000);

    saveToLocalStorage();
  });

  form.addEventListener('change', function(event) {
    if (event.target.name === 'requestType') {
      submitBtn.classList.toggle('order', event.target.value === 'Ordine');
    }
    if (event.target.name === 'priority') {
      const color = event.target.value === 'alta' ? 'red' : event.target.value === 'bassa' ? 'green' : 'orange';
      submitBtn.style.backgroundColor = color;
    }
  });

  // Input event listeners for real-time saving
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', saveToLocalStorage);
  });

  clearDataBtn.addEventListener('click', clearSavedData);

  // Initialize
  loadTheme();
  loadSavedData();
});