/**
 * pdp-variants.js — Fase 6A
 * Maneja la selección de variantes:
 *  - Actualiza selectedOptions al clicar swatch/pill
 *  - Busca la variante matching en el JSON del producto
 *  - Sincroniza precio, imagen principal, disponibilidad y URL
 */
(function () {
  'use strict';

  var container = document.querySelector('.pdp-variants');
  if (!container) return;

  /* ---- Datos del producto desde data attribute ---- */
  var variants = [];
  try {
    variants = JSON.parse(container.dataset.variants || '[]');
  } catch (e) {
    console.warn('[pdp-variants] No se pudo parsear variants JSON', e);
    return;
  }

  var optionCount = document.querySelectorAll('.pdp-option').length;

  /* Estado actual: array de valores seleccionados por índice de opción */
  var selectedOptions = [];
  document.querySelectorAll('.pdp-option').forEach(function (optEl) {
    var active = optEl.querySelector('.pdp-swatch.active, .pdp-pill.active');
    selectedOptions[parseInt(optEl.dataset.optionIndex, 10)] = active
      ? active.dataset.value
      : null;
  });

  /* ---- Helpers ---- */
  function formatMoney(cents) {
    return (cents / 100).toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR'
    });
  }

  function findVariant(opts) {
    return variants.find(function (v) {
      if (opts[0] !== undefined && v.option1 !== opts[0]) return false;
      if (opts[1] !== undefined && v.option2 !== opts[1]) return false;
      if (opts[2] !== undefined && v.option3 !== opts[2]) return false;
      return true;
    }) || null;
  }

  function updatePrice(variant) {
    var priceEl  = document.querySelector('.pdp-price');
    var curEl    = document.querySelector('.pdp-price__cur');
    var oldEl    = document.querySelector('.pdp-price__old');
    var saveEl   = document.querySelector('.pdp-price__save');
    if (!curEl) return;

    priceEl && priceEl.classList.add('pdp-price--updating');
    setTimeout(function () {
      priceEl && priceEl.classList.remove('pdp-price--updating');
    }, 300);

    curEl.textContent = formatMoney(variant.price);

    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      if (oldEl)  oldEl.textContent  = formatMoney(variant.compare_at_price);
      if (saveEl) {
        var pct = Math.round((variant.compare_at_price - variant.price) / variant.compare_at_price * 100);
        saveEl.textContent = '-' + pct + '%';
      }
      if (oldEl)  oldEl.style.display  = '';
      if (saveEl) saveEl.style.display = '';
    } else {
      if (oldEl)  oldEl.style.display  = 'none';
      if (saveEl) saveEl.style.display = 'none';
    }
  }

  function updateImage(variant) {
    if (!variant.featured_image) return;
    var mainImg = document.getElementById('pdp-main-img');
    if (mainImg && variant.featured_image.src) {
      mainImg.src = variant.featured_image.src
        .replace(/\.jpg/, '_900x900.jpg')
        .replace(/\.png/, '_900x900.png')
        .replace(/\.webp/, '_900x900.webp');
    }
  }

  function updateATC(variant) {
    var atcBtn    = document.getElementById('pdp-atc');
    var stickyBtn = document.getElementById('pdp-sticky-btn');
    var varInput  = document.getElementById('pdp-variant-id');

    var available = variant ? variant.available : false;
    var label     = available ? 'Añadir al carrito' : 'Agotado';

    [atcBtn, stickyBtn].forEach(function (btn) {
      if (!btn) return;
      btn.disabled    = !available;
      btn.textContent = label;
      if (variant) btn.dataset.variantId = variant.id;
    });

    if (varInput && variant) varInput.value = variant.id;
  }

  function updateURL(variant) {
    if (!variant || !history.replaceState) return;
    var url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    history.replaceState({}, '', url.toString());
  }

  function applyVariant(variant) {
    if (!variant) return;
    updatePrice(variant);
    updateImage(variant);
    updateATC(variant);
    updateURL(variant);
  }

  /* ---- Listener principal ---- */
  container.addEventListener('click', function (e) {
    var btn = e.target.closest('.pdp-swatch, .pdp-pill');
    if (!btn) return;
    if (btn.classList.contains('sold-out')) return;

    var optionIndex = parseInt(btn.dataset.optionIndex, 10);
    var value       = btn.dataset.value;

    /* Actualizar estado */
    selectedOptions[optionIndex] = value;

    /* Actualizar UI del grupo de opciones */
    var group = container.querySelector(
      '.pdp-option[data-option-index="' + optionIndex + '"] .pdp-option__values'
    );
    if (group) {
      group.querySelectorAll('.pdp-swatch, .pdp-pill').forEach(function (b) {
        var isActive = b.dataset.value === value;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    /* Actualizar label del valor seleccionado */
    var valLabel = document.getElementById('pdp-opt-val-' + optionIndex);
    if (valLabel) valLabel.textContent = value;

    /* Buscar y aplicar la variante */
    var matched = findVariant(selectedOptions);
    applyVariant(matched);
  });

})();
