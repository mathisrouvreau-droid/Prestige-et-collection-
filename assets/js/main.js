/* Prestige & Collection — interactions légères, sans dépendance. */
(function () {
  "use strict";

  /* Menu mobile */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav-principal");
  if (toggle && nav) {
    var mq = window.matchMedia("(max-width: 900px)");
    var syncNav = function () {
      if (mq.matches) {
        nav.hidden = toggle.getAttribute("aria-expanded") !== "true";
      } else {
        nav.hidden = false;
      }
    };
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      syncNav();
    });
    mq.addEventListener ? mq.addEventListener("change", syncNav) : mq.addListener(syncNav);
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && mq.matches) {
        toggle.setAttribute("aria-expanded", "false");
        syncNav();
      }
    });
    syncNav();
  }

  /* Entête : ombre au défilement */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Apparitions douces au défilement */
  var reveals = document.querySelectorAll(".reveal");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reveals.length && "IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Année courante */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Formulaire de contact : compose un e-mail prérempli (site statique, sans serveur) */
  var form = document.getElementById("form-contact");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (name) {
        var f = form.elements[name];
        return f && f.value ? f.value.trim() : "";
      };
      var sujet = "Demande de réservation — " + (v("formule") || "renseignements");
      var corps =
        "Bonjour,\n\n" +
        "Formule souhaitée : " + (v("formule") || "—") + "\n" +
        "Date envisagée : " + (v("date") || "—") + "\n" +
        "Nombre de personnes : " + (v("personnes") || "—") + "\n\n" +
        (v("message") || "") + "\n\n" +
        (v("nom") || "") + "\n" +
        (v("tel") ? "Tél. : " + v("tel") : "");
      window.location.href =
        "mailto:info@prestigeetcollection.com?subject=" +
        encodeURIComponent(sujet) + "&body=" + encodeURIComponent(corps);
    });
  }
})();
