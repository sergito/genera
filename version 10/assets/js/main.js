/* =========================================
   GENERA RENOVABLES — main.js
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    initFormValidation();
    initSmoothScroll();
    initLightbox();
});

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function initLightbox() {
    const items = document.querySelectorAll('[data-lightbox]');
    if (!items.length) return;
    items.forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            const src = el.getAttribute('data-lightbox') || el.querySelector('img')?.src;
            if (!src) return;
            const overlay = document.createElement('div');
            overlay.className = 'lightbox-overlay';
            overlay.innerHTML = `<button class="lightbox-close" aria-label="Cerrar">&times;</button><img src="${src}" alt="">`;
            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('show'));
            const close = () => {
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 200);
            };
            overlay.addEventListener('click', ev => { if (ev.target === overlay || ev.target.classList.contains('lightbox-close')) close(); });
            document.addEventListener('keydown', function onKey(ev) { if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } });
        });
    });
}

/* ---------- TOAST ---------- */
function showToast(message, icon = 'check-circle-fill') {
    let toast = document.querySelector('.toast-mini');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-mini';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="bi bi-${icon}"></i><span>${message}</span>`;
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ---------- LEGACY (kept for landing only) ---------- */
function _legacyInitAddToCart() {
    document.querySelectorAll('.btn-add[data-id]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            const qty = parseInt(btn.dataset.qty || document.querySelector('#qty-input')?.value || 1, 10);
            btn.disabled = true;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
            try {
                const fd = new FormData();
                fd.append('id', id);
                fd.append('cantidad', qty);
                const res = await fetch('cart-action.php?action=add', { method: 'POST', body: fd });
                const data = await res.json();
                if (data.success) {
                    document.querySelectorAll('#cart-count').forEach(el => el.textContent = data.count);
                    showToast(`Producto agregado al carrito`);
                } else {
                    showToast(data.error || 'No se pudo agregar', 'exclamation-triangle-fill');
                }
            } catch (err) {
                showToast('Error de conexión', 'exclamation-triangle-fill');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        });
    });
}

/* ---------- QTY CONTROLS (en página de detalle) ---------- */
function initQtyControls() {
    document.querySelectorAll('.qty-control').forEach(box => {
        const input = box.querySelector('input');
        const minus = box.querySelector('.qty-minus');
        const plus = box.querySelector('.qty-plus');
        if (!input) return;
        minus?.addEventListener('click', () => {
            input.value = Math.max(1, parseInt(input.value, 10) - 1);
            input.dispatchEvent(new Event('change'));
        });
        plus?.addEventListener('click', () => {
            input.value = parseInt(input.value, 10) + 1;
            input.dispatchEvent(new Event('change'));
        });
    });
}

/* ---------- ELIMINAR ITEM DEL CARRITO ---------- */
function initRemoveCartItem() {
    document.querySelectorAll('.btn-remove-item[data-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('¿Quitar este producto del carrito?')) return;
            const id = btn.dataset.id;
            const fd = new FormData();
            fd.append('id', id);
            const res = await fetch('cart-action.php?action=remove', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                location.reload();
            }
        });
    });
}

/* ---------- ACTUALIZAR CANTIDAD EN CARRITO ---------- */
function initUpdateCartQty() {
    document.querySelectorAll('.cart-qty[data-id]').forEach(input => {
        input.addEventListener('change', async () => {
            const id = input.dataset.id;
            const qty = Math.max(1, parseInt(input.value, 10) || 1);
            input.value = qty;
            const fd = new FormData();
            fd.append('id', id);
            fd.append('cantidad', qty);
            const res = await fetch('cart-action.php?action=update', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                location.reload();
            }
        });
    });
}

/* ---------- FORM VALIDATION ---------- */
function initFormValidation() {
    document.querySelectorAll('form.needs-validation').forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}
