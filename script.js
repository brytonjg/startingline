(function () {
  const SUPABASE_URL = "https://wboaffcwzkhkazsudjbi.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_sX8-mH50H9IpimkF_vAJvQ_LKQz8bs7";

  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  const revealItems = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  const form = document.getElementById("waitlist-form");
  const emailInput = document.getElementById("email");
  const submitButton = form.querySelector('button[type="submit"]');
  const note = document.getElementById("form-note");
  const defaultNote = note.textContent;

  function setNote(message, state) {
    note.textContent = message;
    note.classList.remove("is-error", "is-success");
    if (state) note.classList.add(state);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setSubmitting(isSubmitting) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Joining…" : "Join the waitlist";
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();

    if (!email) {
      setNote("Add your email to join the waitlist.", "is-error");
      emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      setNote("That email doesn’t look right. Try again.", "is-error");
      emailInput.focus();
      return;
    }

    setSubmitting(true);
    setNote("Saving your spot…");

    const { error } = await supabase.from("waitlist").insert({ email });

    setSubmitting(false);

    if (error) {
      // Unique violation means they're already on the list.
      if (error.code === "23505") {
        form.reset();
        setNote("You’re already on the list. We’ll email when spots open.", "is-success");
        return;
      }

      console.error("Waitlist signup failed:", error);
      setNote("Something went wrong. Please try again in a moment.", "is-error");
      return;
    }

    form.reset();
    setNote("You’re on the list. We’ll email when spots open.", "is-success");
  });

  emailInput.addEventListener("input", function () {
    if (note.classList.contains("is-error") || note.classList.contains("is-success")) {
      setNote(defaultNote);
    }
  });
})();
