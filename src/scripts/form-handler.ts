import { siteConfig } from '../config/site';

export function initFormHandlers() {
  const forms = document.querySelectorAll<HTMLFormElement>('.crm-enquiry-form');

  // Fill hidden source_url fields with current URL and UTMs
  document.querySelectorAll<HTMLInputElement>('.source-url-field').forEach((input) => {
    input.value = window.location.href;
  });

  forms.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const statusElement = form.querySelector<HTMLElement>('.form-status');

      if (!submitButton || !statusElement) return;

      // Anti-spam honeypot verification
      const honeypot = form.querySelector<HTMLInputElement>('input[name="website_honeypot"]')?.value;
      if (honeypot && honeypot.trim() !== '') {
        console.warn('Spam submission detected by honeypot.');
        statusElement.textContent = 'Enquiry submitted successfully!';
        statusElement.style.color = '#22c55e';
        form.reset();
        return;
      }

      const formData = new FormData(form);
      const name = (formData.get('name') as string)?.trim();
      const phone = (formData.get('phone') as string)?.trim();
      const formType = (formData.get('form_type') as string) || 'prelaunch_enquiry';
      const leadIntent = (formData.get('lead_intent') as string) || 'Pre-Launch Enquiry';

      // 10-digit phone validation
      const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : '';
      if (!cleanPhone || cleanPhone.length !== 10) {
        statusElement.textContent = 'Please enter a valid 10-digit mobile number.';
        statusElement.style.color = '#ef4444';
        return;
      }

      // Collect URL search params (UTM tracking)
      const urlParams = new URLSearchParams(window.location.search);
      const payload = {
        timestamp: new Date().toISOString(),
        name,
        phone: cleanPhone,
        formType,
        leadIntent,
        pageUrl: window.location.href,
        utm_source: urlParams.get('utm_source') || 'direct',
        utm_medium: urlParams.get('utm_medium') || 'organic',
        utm_campaign: urlParams.get('utm_campaign') || 'none',
      };

      const originalBtnText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg> Submitting...
      `;
      statusElement.textContent = '';

      try {
        if (siteConfig.googleScriptUrl && siteConfig.googleScriptUrl.startsWith('http')) {
          await fetch(siteConfig.googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
        } else {
          // Local storage for testing
          const storedLeads = JSON.parse(localStorage.getItem('hero_homes_leads') || '[]');
          storedLeads.push(payload);
          localStorage.setItem('hero_homes_leads', JSON.stringify(storedLeads));
          console.info('Lead saved to localStorage (Configure siteConfig.googleScriptUrl for Google Sheets):', payload);
        }

        statusElement.textContent = '✓ Thank you! Your pre-launch enquiry has been registered. Our representative will contact you shortly.';
        statusElement.style.color = '#22c55e';
        form.reset();

      } catch (err: any) {
        console.error('Submission error:', err);
        statusElement.textContent = 'Enquiry registered! Our team will contact you shortly.';
        statusElement.style.color = '#22c55e';
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalBtnText;
      }
    });
  });
}
