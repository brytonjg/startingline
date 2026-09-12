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
  const feedback = document.getElementById("form-feedback");
  const note = document.getElementById("form-note");
  const defaultNote = note.textContent;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const SUCCESS_TITLE = "You’re on the list!";
  const SUCCESS_BODY =
    "Your email is recorded. We’ll notify you as soon as StartingLine opens for families.";
  const DUPLICATE_TITLE = "You’re already on the list!";
  const DUPLICATE_BODY =
    "We’ve got your email. We’ll notify you when StartingLine is ready for your family.";

  function clearSuccessMarkup() {
    feedback.classList.remove("is-success", "is-error");
    const title = feedback.querySelector(".form-success-title");
    const body = feedback.querySelector(".form-success-body");
    if (title) title.remove();
    if (body) body.remove();
    note.hidden = false;
  }

  function setNote(message, state) {
    clearSuccessMarkup();
    note.textContent = message;
    if (state === "is-error") feedback.classList.add("is-error");
  }

  function showSuccess(title, body) {
    clearSuccessMarkup();
    note.hidden = true;

    const titleEl = document.createElement("p");
    titleEl.className = "form-success-title";
    titleEl.textContent = title;

    const bodyEl = document.createElement("p");
    bodyEl.className = "form-success-body";
    bodyEl.textContent = body;

    feedback.classList.add("is-success");
    feedback.appendChild(titleEl);
    feedback.appendChild(bodyEl);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setSubmitting(isSubmitting) {
    submitButton.disabled = isSubmitting;
    emailInput.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Joining…" : "Join the waitlist";
  }

  function fireConfetti() {
    if (prefersReducedMotion) return;

    const canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let animationId = 0;
    let finished = false;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    const colors = ["#1a56c4", "#1242a0", "#9ccc33", "#6f9a1c", "#ffffff", "#f4f7fb"];
    const originX = form.getBoundingClientRect().left + form.offsetWidth / 2;
    const originY = form.getBoundingClientRect().top + 18;
    const count = Math.min(140, Math.floor(width / 8));
    const pieces = [];

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.35;
      const speed = 7 + Math.random() * 11;
      pieces.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        w: 6 + Math.random() * 7,
        h: 8 + Math.random() * 10,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.35,
        color: colors[i % colors.length],
        gravity: 0.18 + Math.random() * 0.12,
        drag: 0.985,
        life: 1,
        decay: 0.008 + Math.random() * 0.006,
      });
    }

    const startedAt = performance.now();

    function frame(now) {
      const elapsed = now - startedAt;
      ctx.clearRect(0, 0, width, height);

      let alive = 0;
      pieces.forEach(function (p) {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        p.life -= p.decay;

        if (p.life <= 0 || p.y > height + 40) return;
        alive += 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (alive > 0 && elapsed < 3200) {
        animationId = requestAnimationFrame(frame);
        return;
      }

      finished = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.remove();
    }

    animationId = requestAnimationFrame(frame);

    window.setTimeout(function () {
      if (finished) return;
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.remove();
    }, 3600);
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
        showSuccess(DUPLICATE_TITLE, DUPLICATE_BODY);
        fireConfetti();
        return;
      }

      console.error("Waitlist signup failed:", error);
      setNote("Something went wrong. Please try again in a moment.", "is-error");
      return;
    }

    form.reset();
    showSuccess(SUCCESS_TITLE, SUCCESS_BODY);
    fireConfetti();
  });

  emailInput.addEventListener("input", function () {
    if (feedback.classList.contains("is-error") || feedback.classList.contains("is-success")) {
      clearSuccessMarkup();
      note.textContent = defaultNote;
    }
  });
})();
