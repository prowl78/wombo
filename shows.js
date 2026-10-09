// Sign-up forms on the show pages. Posts to the same FormSubmit inbox, with the
// same `form` names, as the original canvas pages did.
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/brian.game@me.com';

document.querySelectorAll('form[data-form]').forEach((form) => {
  const box = form.parentElement;
  const done = box.querySelector('.done');
  const err = box.querySelector('.err');
  const btn = form.querySelector('button');
  const label = btn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    err.textContent = '';
    try {
      const payload = { form: form.dataset.form, ...Object.fromEntries(new FormData(form)) };
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        form.hidden = true;
        done.hidden = false;
      } else {
        err.textContent = "Hmm, that didn't send. Give it another go.";
      }
    } catch {
      err.textContent = 'Network hiccup. Try again in a sec.';
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
});
