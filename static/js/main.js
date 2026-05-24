// Show/hide the "please don't upload here" note when "yes" is chosen.
(function () {
  const note = document.querySelector('.referral-note');
  const radios = document.querySelectorAll('input[name="referral"]');
  if (!note || radios.length === 0) return;
  radios.forEach((r) => {
    r.addEventListener('change', () => {
      note.hidden = r.value !== 'yes' || !r.checked;
    });
  });
})();

// Progressive enhancement for the form: submit via fetch so the user stays
// on the page and we can show a success message.
(function () {
  const form = document.querySelector('.inquiry-form');
  if (!form) return;
  const status = form.querySelector('.form-status');

  form.addEventListener('submit', async (e) => {
    if (!form.checkValidity()) {
      // Let the browser show native validation messages.
      return;
    }
    // If the form action still has the placeholder, do not actually submit.
    if (form.action.includes('YOUR_FORM_ID')) {
      e.preventDefault();
      status.textContent = "Form isn't wired up yet — see README for setup.";
      status.className = 'form-status error';
      return;
    }
    e.preventDefault();
    status.textContent = 'Sending…';
    status.className = 'form-status';

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.reset();
        status.textContent =
          "Thanks — we got your request. We'll call you within one business day to confirm.";
        status.className = 'form-status success';
      } else {
        const body = await res.json().catch(() => ({}));
        status.textContent =
          body.error ||
          "Something went wrong sending your request. Please call us at the number above.";
        status.className = 'form-status error';
      }
    } catch (err) {
      status.textContent =
        "We couldn't send your request. Please call us at the number above.";
      status.className = 'form-status error';
    }
  });
})();
