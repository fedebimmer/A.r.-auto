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
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');

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

  // File Upload Management
  const maxFiles = 3;
  const maxFileSize = 100 * 1024 * 1024; // 100MB in bytes
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  let uploadedFiles = [];

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function createFilePreview(file) {
    const reader = new FileReader();
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = file.name;
    
    const fileSize = document.createElement('div');
    fileSize.className = 'file-size';
    fileSize.textContent = formatFileSize(file.size);
    
    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileSize);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file';
    removeBtn.innerHTML = '<span class="material-icons">close</span>';
    removeBtn.onclick = () => {
      uploadedFiles = uploadedFiles.filter(f => f !== file);
      fileItem.remove();
      updateFileInputState();
    };

    if (file.type.startsWith('image/')) {
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'file-preview';
        fileItem.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      const icon = document.createElement('span');
      icon.className = 'material-icons';
      icon.textContent = 'description';
      fileItem.appendChild(icon);
    }

    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeBtn);
    return fileItem;
  }

  function showError(message) {
    const error = document.createElement('div');
    error.className = 'file-error';
    error.textContent = message;
    fileList.appendChild(error);
    setTimeout(() => error.remove(), 3000);
  }

  function updateFileInputState() {
    const fileInputButton = document.querySelector('.file-input-button');
    if (uploadedFiles.length >= maxFiles) {
      fileInputButton.style.opacity = '0.5';
      fileInputButton.style.pointerEvents = 'none';
    } else {
      fileInputButton.style.opacity = '1';
      fileInputButton.style.pointerEvents = 'auto';
    }
  }

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (uploadedFiles.length >= maxFiles) {
        showError(`Massimo ${maxFiles} file consentiti`);
        return;
      }
      
      if (file.size > maxFileSize) {
        showError(`Il file ${file.name} supera il limite di 100MB`);
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        showError(`Formato file non supportato: ${file.name}`);
        return;
      }
      
      uploadedFiles.push(file);
      fileList.appendChild(createFilePreview(file));
    });
    
    updateFileInputState();
    fileInput.value = ''; // Reset input for future selections
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
      - Livello Urgenza: ${priority === 'alta' ? 'Alta Urgenza' : priority === 'media' ? 'Media Urgenza' : 'Bassa Urgenza'}
      - Dettagli: ${description}
    `);

    // Add files to WhatsApp message if any are uploaded
    if (uploadedFiles.length > 0) {
      const fileNames = uploadedFiles.map(f => f.name).join(', ');
      encodedMessage += `\nFile allegati: ${fileNames}`;
    }
    
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