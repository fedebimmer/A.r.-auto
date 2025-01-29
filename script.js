document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('requestForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');
  const requestIdSpan = document.getElementById('requestId');
  const companyWrapper = document.getElementById('companyWrapper');
  const userTypeRadios = form.querySelectorAll('input[name="userType"]');
  const prioritySelect = document.getElementById('priority');

  userTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'privato') {
        companyWrapper.style.display = 'none';
        document.getElementById('company').value = '';
      } else {
        companyWrapper.style.display = 'block';
      }
    });
  });

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

    sessionStorage.setItem('formState', JSON.stringify({
      name, company, vehicle, requestType, description, requestId, userType, priority
    }));

    // Add animation class on submit
    submitBtn.classList.add('send-animation');
  });

  form.addEventListener('change', function(event) {
    if (event.target.name === 'requestType') {
      submitBtn.classList.toggle('order', event.target.value === 'Ordine');
    }
    if (event.target.id === 'priority') {
      switch (event.target.value) {
        case 'bassa':
          submitBtn.style.backgroundColor = 'green';
          break;
        case 'media':
          submitBtn.style.backgroundColor = 'yellow';
          break;
        case 'alta':
          submitBtn.style.backgroundColor = 'red';
          break;
      }
    }
  });

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
  }
});