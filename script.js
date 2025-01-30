document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const form = document.getElementById('requestForm');
  const submitBtn = document.getElementById('submitBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const successMessage = document.getElementById('successMessage');
  const requestIdSpan = document.getElementById('requestId');
  const companyWrapper = document.getElementById('companyWrapper');
  const userTypeRadios = form.querySelectorAll('input[name="userType"]');
  const prioritySelect = document.getElementById('priority');
  const welcomeMessage = document.getElementById('welcomeMessage');

  // Load data from localStorage
  function loadSavedData() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      const data = JSON.parse(savedData);
      
      // Fill form fields
      document.getElementById('name').value = data.name || '';
      document.getElementById('company').value = data.company || '';
      document.getElementById('vehicle').value = data.vehicle || '';
      document.getElementById('description').value = data.description || '';
      
      // Set user type
      const userTypeRadio = form.querySelector(`input[name="userType"][value="${data.userType}"]`);
      if (userTypeRadio) {
        userTypeRadio.checked = true;
        if (data.userType === 'privato') {
          companyWrapper.style.display = 'none';
        }
      }

      // Show welcome message
      if (data.name) {
        welcomeMessage.textContent = `Bentornato, ${data.name}!`;
        welcomeMessage.style.display = 'block';
      }
    }
  }

  // Save data to localStorage
  function saveFormData() {
    const formData = {
      name: document.getElementById('name').value.trim(),
      company: document.getElementById('company').value.trim(),
      vehicle: document.getElementById('vehicle').value.trim(),
      description: document.getElementById('description').value.trim(),
      userType: form.querySelector('input[name="userType"]:checked').value
    };
    localStorage.setItem('formData', JSON.stringify(formData));
  }

  // Clear saved data
  clearDataBtn.addEventListener('click', () => {
    if (confirm('Sei sicuro di voler cancellare tutti i dati salvati?')) {
      localStorage.removeItem('formData');
      sessionStorage.removeItem('formState');
      form.reset();
      welcomeMessage.style.display = 'none';
      companyWrapper.style.display = 'block';
      submitBtn.style.backgroundColor = '#007aff';
      submitBtn.classList.remove('order');
    }
  });

  // User type change handler
  userTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'privato') {
        companyWrapper.style.display = 'none';
        document.getElementById('company').value = '';
      } else {
        companyWrapper.style.display = 'block';
      }
      saveFormData();
    });
  });

  // Form submit handler
  form.addEventListener('submit', function(event) {
    event.preventDefault();

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

    // Save form state and data
    sessionStorage.setItem('formState', JSON.stringify({
      name, company, vehicle, requestType, description, requestId, userType, priority
    }));
    saveFormData();

    submitBtn.classList.add('send-animation');
  });

  // Form change handlers
  form.addEventListener('change', function(event) {
    if (event.target.name === 'requestType') {
      submitBtn.classList.toggle('order', event.target.value === 'Ordine');
    }
    if (event.target.name === 'priority') {
      const color = event.target.value === 'alta' ? 'red' : event.target.value === 'bassa' ? 'green' : 'orange';
      submitBtn.style.backgroundColor = color;
    }
    if (['name', 'company', 'vehicle', 'description'].includes(event.target.id)) {
      saveFormData();
    }
  });

  // Load saved session state
  const storedFormState = JSON.parse(sessionStorage.getItem('formState'));
  if (storedFormState) {
    document.getElementById('name').value = storedFormState.name;
    document.getElementById('company').value = storedFormState.company || '';
    document.getElementById('vehicle').value = storedFormState.vehicle;
    document.getElementById('description').value = storedFormState.description;
    form.querySelector(`input[name="requestType"][value="${storedFormState.requestType}"]`).checked = true;
    form.querySelector(`input[name="userType"][value="${storedFormState.userType}"]`).checked = true;
    prioritySelect.value = storedFormState.priority;
    if (!storedFormState.company) {
      document.querySelector('input[name="userType"][value="privato"]').checked = true;
      companyWrapper.style.display = 'none';
    }
  } else {
    // Load data from localStorage if no session state exists
    loadSavedData();
  }
});