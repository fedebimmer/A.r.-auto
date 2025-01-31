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
  const shippingContent = shippingAccordion.nextElementSibling;

  // Reset accordion state
  shippingAccordion.classList.remove('active');
  shippingContent.classList.remove('active');
  shippingContent.style.maxHeight = '0';
  shippingAccordion.style.backgroundColor = '';
  shippingAccordion.style.color = '';

  if (requestType === 'Ordine') {
    shippingSection.style.display = 'block';

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

    if (userType === 'privato') {
      // For private users, only show pickup in-store
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
      // For business users, show both shipping options
      shippingOption.style.display = 'block';
      pickupInStoreOption.style.display = 'block';

      // Add event listener to shipping radio buttons
      document.querySelectorAll('input[name="shipping"]').forEach(radio => {
        radio.addEventListener('change', updateDateTimeFieldsVisibility);
      });

      // Initial call to set correct state
      updateDateTimeFieldsVisibility();
    }

  } else {
    // Hide shipping section for quotes
    shippingSection.style.display = 'none';
  }

  // Shipping Accordion Functionality (Updated)
  const shippingAccordionBtn = document.getElementById('shippingAccordion');
  const shippingAccordionContent = shippingAccordionBtn.nextElementSibling;

  shippingAccordionBtn.addEventListener('click', () => {
    // Toggle active classes
    shippingAccordionBtn.classList.toggle('active');
    shippingAccordionContent.classList.toggle('active');

    // Dynamically adjust max-height when opening
    if (shippingAccordionContent.classList.contains('active')) {
      // Set max-height to accommodate all content
      shippingAccordionContent.style.maxHeight = `${shippingAccordionContent.scrollHeight + 100}px`;
      shippingAccordionBtn.style.backgroundColor = 'var(--primary-color)';
      shippingAccordionBtn.style.color = 'white';
    } else {
      // Reset max-height and styling when closing
      shippingAccordionContent.style.maxHeight = '0';
      shippingAccordionBtn.style.backgroundColor = '';
      shippingAccordionBtn.style.color = '';
    }
  });

  // ASAP checkbox functionality
  const asapCheckboxHandler = () => {
    dateTimeFields.style.display = asapCheckbox.checked ? 'none' : 'flex';
    
    // Clear date and time if ASAP is checked
    if (asapCheckbox.checked) {
      shippingDate.value = '';
      shippingTime.value = '';
    }
  };

  // Remove previous listeners to prevent multiple bindings
  asapCheckbox.removeEventListener('change', asapCheckboxHandler);
  asapCheckbox.addEventListener('change', asapCheckboxHandler);
}