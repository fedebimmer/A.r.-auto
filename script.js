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
  const pickupWrapper = document.getElementById('pickupWrapper');
  const pickupAccordion = document.getElementById('pickupAccordion');
  const accordionContent = pickupAccordion.nextElementSibling;
  const pickupDate = document.getElementById('pickupDate');
  const pickupTime = document.getElementById('pickupTime');
  const dateError = document.getElementById('dateError');
  const timeError = document.getElementById('timeError');

  // Local Storage keys
  const STORAGE_KEY = 'userFormData';
  const THEME_KEY = 'theme';
  const HISTORY_KEY = 'requestHistory';

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

  // Save data to LocalStorage
  function saveToLocalStorage() {
    const formData = {
      name: document.getElementById('name').value,
      company: document.getElementById('company').value || '', 
      vehicle: document.getElementById('vehicle').value,
      description: document.getElementById('description').value,
      userType: form.querySelector('input[name="userType"]:checked').value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }

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
        companyWrapper.style.display = data.userType === 'azienda' ? 'block' : 'none';
      }
      
      if (data.name) {
        welcomeMessage.textContent = `Bentornato, ${data.name}!`;
      }

      // Update checkboxes based on description content
      if (data.description) {
        const selectedProducts = new Set(data.description.split('\n').filter(p => p.trim()));
        document.querySelectorAll('.submenu-item input[type="checkbox"]').forEach(checkbox => {
          checkbox.checked = selectedProducts.has(checkbox.value);
        });
      }
    }
  }

  // Clear saved data
  function clearSavedData() {
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    welcomeMessage.textContent = '';
    companyWrapper.style.display = 'none';
    submitBtn.style.backgroundColor = '#007aff';
  }

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  pickupDate.min = today;

  // Accordion toggle
  pickupAccordion.addEventListener('click', () => {
    pickupAccordion.classList.toggle('active');
    const isActive = pickupAccordion.classList.contains('active');
    accordionContent.classList.toggle('active', isActive);
  });

  // Show/hide pickup section based on user type and request type
  function updatePickupVisibility() {
    const isPrivate = form.querySelector('input[name="userType"]:checked').value === 'privato';
    const isOrder = form.querySelector('input[name="requestType"]:checked').value === 'Ordine';
    
    pickupWrapper.style.display = (isPrivate && isOrder) ? 'block' : 'none';
    
    // Reset fields when hidden
    if (!isPrivate || !isOrder) {
      pickupDate.value = '';
      pickupTime.value = '';
      dateError.style.display = 'none';
      timeError.style.display = 'none';
      pickupAccordion.classList.remove('active');
      accordionContent.classList.remove('active');
    }
  }

  // Add event listeners for changes
  form.querySelectorAll('input[name="userType"], input[name="requestType"]')
    .forEach(input => input.addEventListener('change', updatePickupVisibility));

  // Validate date and time
  pickupDate.addEventListener('change', () => {
    const selectedDate = new Date(pickupDate.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      dateError.textContent = 'La data non può essere nel passato';
      dateError.style.display = 'block';
      pickupDate.value = '';
    } else {
      dateError.style.display = 'none';
    }
  });

  pickupTime.addEventListener('change', () => {
    const time = pickupTime.value;
    const [hours, minutes] = time.split(':').map(Number);
    const timeValue = hours * 60 + minutes;

    if (timeValue < 9 * 60 || timeValue > 18 * 60) {
      timeError.textContent = 'L\'orario deve essere tra le 09:00 e le 18:00';
      timeError.style.display = 'block';
      pickupTime.value = '';
    } else {
      timeError.style.display = 'none';
    }
  });

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

  // Notification System
  function showNotification(message, duration = 3000) {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
      <span class="material-icons">info</span>
      ${message}
    `;
    
    notifications.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  // Request History Management
  function saveRequestToHistory(formData) {
    const history = getRequestHistory();
    const timestamp = new Date().toLocaleString();
    
    const request = {
      id: formData.requestId,
      timestamp,
      name: formData.name,
      userType: formData.userType,
      requestType: formData.requestType,
      vehicle: formData.vehicle,
      priority: formData.priority,
      description: formData.description
    };
    
    history.unshift(request);
    // Keep only last 10 requests
    if (history.length > 10) history.pop();
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    updateHistoryDisplay();
    showNotification('Richiesta salvata con successo');
  }

  function getRequestHistory() {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  }

  function updateHistoryDisplay() {
    const historyContainer = document.getElementById('requestHistory');
    const history = getRequestHistory();
    
    if (history.length === 0) {
      historyContainer.innerHTML = '<p class="no-requests">Nessuna richiesta salvata.</p>';
      return;
    }
    
    historyContainer.innerHTML = history.map(request => `
      <div class="request-item">
        <h3>Richiesta ${request.id}</h3>
        <p><strong>Data:</strong> ${request.timestamp}</p>
        <p><strong>Cliente:</strong> ${request.name} (${request.userType})</p>
        <p><strong>Tipo:</strong> ${request.requestType}</p>
        <p><strong>Veicolo:</strong> ${request.vehicle}</p>
        <p><strong>Urgenza:</strong> ${request.priority}</p>
        <p><strong>Descrizione:</strong> ${request.description}</p>
      </div>
    `).join('');
  }

  function updateShippingOptions() {
    const shippingSection = document.getElementById('shippingSection');
    const userType = document.querySelector('input[name="userType"]:checked').value;
    const requestType = document.querySelector('input[name="requestType"]:checked').value;
    const asapCheckbox = document.getElementById('asapCheckbox');
    const dateTimeFields = document.getElementById('dateTimeFields');
    const shippingDate = document.getElementById('shippingDate');
    const shippingTime = document.getElementById('shippingTime');
    const pickupInStoreOption = document.getElementById('pickupInStoreOption');
    const shippingOption = document.getElementById('shippingOption');
    const shippingAccordion = document.getElementById('shippingAccordion');
    const shippingAccordionContent = shippingAccordion.nextElementSibling;

    // Reset accordion state
    function resetAccordion() {
      shippingAccordion.classList.remove('active');
      shippingAccordionContent.classList.remove('active');
      shippingAccordionContent.style.maxHeight = '0';
      shippingAccordion.style.backgroundColor = '';
      shippingAccordion.style.color = '';
    }
    resetAccordion();

    // Function to update date and time fields visibility
    function updateDateTimeFieldsVisibility() {
      const shippingRadio = document.querySelector('input[name="shipping"]:checked');
      
      if (shippingRadio.value === 'spedizione') {
        // Disable and hide date and time fields when shipping is selected
        dateTimeFields.style.display = 'none';
        asapCheckbox.checked = false;
        asapCheckbox.disabled = true;
        shippingDate.value = '';
        shippingTime.value = '';
        shippingDate.disabled = true;
        shippingTime.disabled = true;
      } else {
        // Enable and show date and time fields for pickup
        dateTimeFields.style.display = 'flex';
        asapCheckbox.disabled = false;
        shippingDate.disabled = false;
        shippingTime.disabled = false;
      }
    }

    // Shipping Accordion Functionality
    function setupShippingAccordion() {
      shippingAccordion.removeEventListener('click', accordionHandler);
      shippingAccordion.addEventListener('click', accordionHandler);
    }

    function accordionHandler() {
      // Toggle active classes
      shippingAccordion.classList.toggle('active');
      shippingAccordionContent.classList.toggle('active');

      // Dynamically adjust max-height when opening
      if (shippingAccordionContent.classList.contains('active')) {
        // Set max-height to accommodate all content
        shippingAccordionContent.style.maxHeight = `${shippingAccordionContent.scrollHeight + 100}px`;
        shippingAccordion.style.backgroundColor = 'var(--primary-color)';
        shippingAccordion.style.color = 'white';
      } else {
        // Reset max-height and styling when closing
        shippingAccordionContent.style.maxHeight = '0';
        shippingAccordion.style.backgroundColor = '';
        shippingAccordion.style.color = '';
      }
    }

    // ASAP checkbox functionality
    function setupASAPCheckbox() {
      asapCheckbox.removeEventListener('change', asapCheckboxHandler);
      asapCheckbox.addEventListener('change', asapCheckboxHandler);
    }

    function asapCheckboxHandler() {
      dateTimeFields.style.display = asapCheckbox.checked ? 'none' : 'flex';
      
      // Clear date and time if ASAP is checked
      if (asapCheckbox.checked) {
        shippingDate.value = '';
        shippingTime.value = '';
      }
    }

    // Main logic for shipping options
    if (requestType === 'Ordine') {
      shippingSection.style.display = 'block';

      if (userType === 'privato') {
        // Private user settings
        shippingOption.style.display = 'none';
        pickupInStoreOption.style.display = 'block';
        document.querySelector('input[name="shipping"][value="ritiro"]').checked = true;
        
        // Remove pickup accordion
        document.getElementById('pickupWrapper').style.display = 'none';
        
        // Show date and time fields for private users
        dateTimeFields.style.display = 'flex';
        asapCheckbox.disabled = false;
        shippingDate.disabled = false;
        shippingTime.disabled = false;

      } else if (userType === 'azienda') {
        // Business user settings
        shippingOption.style.display = 'block';
        pickupInStoreOption.style.display = 'block';

        // Add event listeners for shipping radio buttons
        document.querySelectorAll('input[name="shipping"]').forEach(radio => {
          radio.removeEventListener('change', updateDateTimeFieldsVisibility);
          radio.addEventListener('change', updateDateTimeFieldsVisibility);
        });

        // Initial call to set correct state
        updateDateTimeFieldsVisibility();
      }

      // Setup shipping accordion and ASAP checkbox
      setupShippingAccordion();
      setupASAPCheckbox();

    } else {
      // Hide shipping section for quotes
      shippingSection.style.display = 'none';
    }
  }

  // Call updateShippingOptions on page load and when relevant inputs change
  updateShippingOptions();
  form.querySelectorAll('input[name="userType"], input[name="requestType"]')
    .forEach(input => input.addEventListener('change', updateShippingOptions));

  // Modify the form submission logic
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

    // Validate required fields
    if (!name || !vehicle || !description) {
      alert('Per favore, compila tutti i campi obbligatori');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-icons">send</span> Invia';
      return;
    }

    // Validate company field for business users
    if (userType === 'azienda' && !company) {
      alert('Per favore, inserisci la Ragione Sociale dell\'Officina');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-icons">send</span> Invia';
      return;
    }

    // Prepare shipping/pickup details text for both private and business users
    let shippingText = '';
    if (requestType === 'Ordine') {
      const shippingOption = document.querySelector('input[name="shipping"]:checked')?.value;
      const asapCheckbox = document.getElementById('asapCheckbox');
      const shippingDate = document.getElementById('shippingDate');
      const shippingTime = document.getElementById('shippingTime');

      // Validate shipping details
      if (!shippingOption || (!asapCheckbox.checked && (!shippingDate || !shippingTime))) {
        alert('Per favore, seleziona modalità e tempo di consegna/ritiro');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="material-icons">send</span> Invia';
        return;
      }

      shippingText = `
      - Modalità: ${shippingOption === 'ritiro' ? 'Ritiro in sede' : 'Spedizione'}
      ${asapCheckbox.checked ? '- Consegna/Ritiro: Appena possibile' : `- Data: ${shippingDate.value}\n- Ora: ${shippingTime.value}`}`;
    }

    // Existing WhatsApp message generation code...
    const encodedMessage = encodeURIComponent(`
      Buongiorno, ecco una nuova richiesta da A.R. Auto snc:
      - ID richiesta: ${requestId}
      - Tipo di cliente: ${userType}
      - Nome: ${name}
      ${userType === 'azienda' ? `- Officina: ${company}` : ''}
      - Veicolo: ${vehicle}
      - Tipo richiesta: ${requestType}
      - Livello Urgenza: ${priority === 'alta' ? 'Alta Urgenza' : priority === 'media' ? 'Media Urgenza' : 'Bassa Urgenza'}
      - Dettagli: ${description}
      ${shippingText}
    `);

    const whatsappURL = `https://api.whatsapp.com/send?phone=393939393799&text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');

    requestIdSpan.textContent = requestId;
    successMessage.style.display = 'block';

    const formData = {
      requestId,
      name,
      userType,
      requestType,
      vehicle,
      priority,
      description,
      company: userType === 'azienda' ? company : ''
    };

    saveRequestToHistory(formData);

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

  // Product Categories Data Structure
  const productCategories = {
    'Tagliando': [
      'Filtro Aria',
      'Filtro Olio',
      'Filtro Abitacolo',
      'Filtro Gasolio',
      'Filtro Benzina',
      'Candele',
      'Olio Motore'
    ],
    'Sospensioni': [
      'Ammortizzatore Ant SX',
      'Ammortizzatore Ant DX',
      'Ammortizzatore Post SX',
      'Ammortizzatore Post DX',
      'Supporti Superiori Ammortizzatori Ant',
      'Supporti Superiori Ammortizzatori Post',
      'Tiranti Barra Stabilizzatrice Anteriori',
      'Tiranti Barra Stabilizzatrice Posteriori',
      'Braccio Oscillante Anteriore SX',
      'Braccio Oscillante Anteriore DX'
    ],
    'Freni': [
      'Pastiglie Anteriori',
      'Pastiglie Posteriori',
      'Dischi Freno Anteriori',
      'Dischi Freno Posteriori',
      'Ganasce Posteriori',
      'Cilindretti Ganasce',
      'Kit Premontato Ganasce'
    ],
    'Elettrico': [
      'Batteria',
      'Alternatore',
      'Motorino Avviamento'
    ]
  };

  // Clear existing category buttons creation
  const categoryContainer = document.getElementById('presetCategories');
  categoryContainer.innerHTML = '';

  // Create category buttons with submenus
  Object.keys(productCategories).forEach(category => {
    const categoryWrapper = document.createElement('div');
    categoryWrapper.className = 'category-wrapper';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'category-btn';
    button.innerHTML = `
      <span class="material-icons">category</span>
      ${category}
    `;

    const submenu = document.createElement('div');
    submenu.className = 'submenu';

    // Create checkboxes for each product
    productCategories[category].forEach(product => {
      const item = document.createElement('div');
      item.className = 'submenu-item';
      item.innerHTML = `
        <label>
          <input type="checkbox" value="${product}">
          ${product}
        </label>
      `;

      // Add checkbox event listener
      const checkbox = item.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => {
        const descriptionField = document.getElementById('description');
        const currentText = descriptionField.value;
        const selectedProducts = new Set(currentText.split('\n').filter(p => p.trim()));

        if (checkbox.checked) {
          selectedProducts.add(product);
        } else {
          selectedProducts.delete(product);
        }

        descriptionField.value = Array.from(selectedProducts).join('\n');
        showNotification(`${checkbox.checked ? 'Aggiunto' : 'Rimosso'}: ${product}`);
      });

      submenu.appendChild(item);
    });

    categoryWrapper.appendChild(button);
    categoryWrapper.appendChild(submenu);
    categoryContainer.appendChild(categoryWrapper);
  });

  // Update the category button click handler
  document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      
      // Close all other submenus
      document.querySelectorAll('.submenu.active').forEach(menu => {
        if (menu !== button.nextElementSibling) menu.classList.remove('active');
      });
      document.querySelectorAll('.category-btn.active').forEach(btn => {
        if (btn !== button) btn.classList.remove('active');
      });

      const submenu = button.nextElementSibling;
      const categoryName = button.textContent.trim();
      
      // Add header to submenu if it doesn't exist
      if (!submenu.querySelector('.submenu-header')) {
        const header = document.createElement('div');
        header.className = 'submenu-header';
        header.innerHTML = `
          <span class="submenu-title">
            <span class="material-icons">${getCategoryIcon(categoryName)}</span>
            ${categoryName}
          </span>
          <button type="button" class="close-submenu">
            <span class="material-icons">close</span>
          </button>
        `;
        submenu.insertBefore(header, submenu.firstChild);
        
        // Add close button functionality
        header.querySelector('.close-submenu').addEventListener('click', (e) => {
          e.stopPropagation();
          submenu.classList.remove('active');
          button.classList.remove('active');
        });
      }

      // Toggle current submenu
      submenu.classList.toggle('active');
      button.classList.toggle('active');
    });
  });

  // Helper function to get the appropriate icon for each category
  function getCategoryIcon(category) {
    const icons = {
      'Tagliando': 'build',
      'Sospensioni': 'architecture',
      'Freni': 'verified',
      'Elettrico': 'electric_bolt',
      'default': 'category'
    };
    return icons[category] || icons.default;
  }

  // Add Presets Button functionality
  const presetsBtn = document.getElementById('presetsBtn');
  const presetsContent = document.getElementById('presetsContent');

  presetsBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    presetsBtn.classList.toggle('active');
    presetsContent.classList.toggle('active');
  });

  // Close presets when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.presets-wrapper')) {
      presetsBtn.classList.remove('active');
      presetsContent.classList.remove('active');
    }
  });

  // Close submenu when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.submenu') && !event.target.closest('.category-btn')) {
      document.querySelectorAll('.submenu.active').forEach(menu => {
        menu.classList.remove('active');
      });
      document.querySelectorAll('.category-btn.active').forEach(btn => {
        btn.classList.remove('active');
      });
    }
  });

  // Update date and time field visibility based on ASAP checkbox
  const asapCheckbox = document.getElementById('asapCheckbox');
  const dateTimeFields = document.getElementById('dateTimeFields');
  
  asapCheckbox.addEventListener('change', () => {
    dateTimeFields.style.display = asapCheckbox.checked ? 'none' : 'flex';
    
    // Clear date and time if ASAP is checked
    if (asapCheckbox.checked) {
      document.getElementById('shippingDate').value = '';
      document.getElementById('shippingTime').value = '';
    }
  });

  // Initialize
  loadTheme();
  loadSavedData();
  updateHistoryDisplay();
});