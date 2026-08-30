/* Ô Sublime — interactions légères, sans dépendance.
   1. Menu mobile   2. Ombre d'entête au défilement
   3. Apparitions   4. Formulaire de contact (mailto)   5. Année courante */

(function () {
  "use strict";

  /* L'adresse qui reçoit les demandes du formulaire de contact.
     Provient des annuaires professionnels — à confirmer (voir README). */
  var EMAIL_CONTACT = "info@o-sublime.com";

  /* 1 — Menu mobile ------------------------------------------------------ */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* 2 — Entête : ombre dès que la page défile ---------------------------- */
  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () {
      head.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* 3 — Apparitions au défilement ---------------------------------------- */
  var revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealed.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* 4 — Formulaire de contact : ouvre la messagerie du visiteur ----------- */
  var form = document.getElementById("form-contact");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = function (name) {
        var f = form.elements[name];
        return f && f.value ? f.value.trim() : "";
      };
      var sujet = "Demande via le site — " + (val("sujet") || "renseignement");
      var corps =
        "Bonjour,\n\n" + val("message") + "\n\n— " + val("nom") +
        (val("tel") ? "\nTéléphone : " + val("tel") : "");
      window.location.href =
        "mailto:" + EMAIL_CONTACT +
        "?subject=" + encodeURIComponent(sujet) +
        "&body=" + encodeURIComponent(corps);
      var note = document.getElementById("form-envoi-note");
      if (note) { note.hidden = false; }
    });
  }

  /* 5 — Année courante dans le pied de page ------------------------------- */
  var an = document.getElementById("annee");
  if (an) { an.textContent = String(new Date().getFullYear()); }
})();
