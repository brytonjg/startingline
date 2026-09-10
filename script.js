(function () {
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();

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

    const existing = JSON.parse(localStorage.getItem("startingLineWaitlist") || "[]");
    if (!existing.includes(email.toLowerCase())) {
      existing.push(email.toLowerCase());
      localStorage.setItem("startingLineWaitlist", JSON.stringify(existing));
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
