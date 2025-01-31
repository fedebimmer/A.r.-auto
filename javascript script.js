function initShippingModal() {
  const shippingAccordion = document.getElementById('shippingAccordion');
  const shippingModal = document.getElementById('shippingModal');
  const closeShippingModal = document.getElementById('closeShippingModal');
  const confirmShippingModal = document.getElementById('confirmShippingModal');

  // Shipping option inputs
  const pickupRadio = document.querySelector('input[name="shipping"][value="ritiro"]');
  const shippingRadio = document.querySelector('input[name="shipping"][value="spedizione"]');
  const asapCheckbox = document.getElementById('asapCheckbox');
  const dateTimeFields = document.getElementById('dateTimeFields');
  const shippingDate = document.getElementById('shippingDate');
  const shippingTime = document.getElementById('shippingTime');

  // Copy existing shipping options to modal
  const modalPickupOption = document.querySelector('.shipping-modal .shipping-option[id="pickupInStoreOption"]');
  const modalShippingOption = document.querySelector('.shipping-modal .shipping-option[id="shippingOption"]');
  const modalAsapCheckbox = document.querySelector('.shipping-modal #asapCheckbox');
  const modalDateTimeFields = document.querySelector('.shipping-modal #dateTimeFields');

  // Open modal
  function openShippingModal() {
    // Sync current state to modal
    modalPickupOption.querySelector('input').checked = pickupRadio.checked;
    modalShippingOption.querySelector('input').checked = shippingRadio.checked;
    modalAsapCheckbox.checked = asapCheckbox.checked;
    
    // Update date/time fields visibility
    if (shippingRadio.checked) {
      modalDateTimeFields.style.display = 'none';
      modalAsapCheckbox.checked = false;
      modalAsapCheckbox.disabled = true;
    } else {
      modalDateTimeFields.style.display = asapCheckbox.checked ? 'none' : 'flex';
      modalAsapCheckbox.disabled = false;
    }

    shippingModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  function closeModal() {
    shippingModal.classList.remove('open');
    document.body.style.overflow = 'auto';
  }

  // Confirm modal selections
  function confirmModal() {
    // Update main form with modal selections
    const modalPickupRadio = modalPickupOption.querySelector('input');
    const modalShippingRadio = modalShippingOption.querySelector('input');

    if (modalPickupRadio.checked) {
      pickupRadio.checked = true;
      shippingRadio.checked = false;
    } else {
      shippingRadio.checked = true;
      pickupRadio.checked = false;
    }

    // Sync ASAP and date/time fields
    asapCheckbox.checked = modalAsapCheckbox.checked;
    
    // Update date/time field visibility
    if (modalShippingRadio.checked) {
      dateTimeFields.style.display = 'none';
      asapCheckbox.disabled = true;
      shippingDate.value = '';
      shippingTime.value = '';
    } else {
      dateTimeFields.style.display = asapCheckbox.checked ? 'none' : 'flex';
      asapCheckbox.disabled = false;
    }

    // Dispatch change event to trigger other related updates
    pickupRadio.dispatchEvent(new Event('change'));
    shippingRadio.dispatchEvent(new Event('change'));

    closeModal();
  }

  // Event Listeners
  shippingAccordion.addEventListener('click', openShippingModal);
  closeShippingModal.addEventListener('click', closeModal);
  confirmShippingModal.addEventListener('click', confirmModal);

  // Close modal on Esc key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && shippingModal.classList.contains('open')) {
      closeModal();
    }
  });

  // Close modal when clicking outside
  shippingModal.addEventListener('click', (event) => {
    if (event.target === shippingModal) {
      closeModal();
    }
  });

  // Update modal radio buttons behavior
  const modalRadios = document.querySelectorAll('.shipping-modal input[name="shipping"]');
  modalRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'spedizione') {
        modalDateTimeFields.style.display = 'none';
        modalAsapCheckbox.checked = false;
        modalAsapCheckbox.disabled = true;
      } else {
        modalDateTimeFields.style.display = modalAsapCheckbox.checked ? 'none' : 'flex';
        modalAsapCheckbox.disabled = false;
      }
    });
  });

  // ASAP checkbox in modal
  modalAsapCheckbox.addEventListener('change', () => {
    modalDateTimeFields.style.display = modalAsapCheckbox.checked ? 'none' : 'flex';
    
    // Clear date and time if ASAP is checked
    if (modalAsapCheckbox.checked) {
      document.querySelector('.shipping-modal #shippingDate').value = '';
      document.querySelector('.shipping-modal #shippingTime').value = '';
    }
  });
}

// Call the initialization function when the DOM is loaded
document.addEventListener('DOMContentLoaded', initShippingModal);