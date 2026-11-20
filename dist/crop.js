// Recorte de imagem: arraste para posicionar, use o controle (ou a roda do mouse) para aproximar.
// Devolve um Blob PNG com a área escolhida, ou null se a pessoa cancelar.
export function cropImage(file, { aspect = 1, output = 768, labels }) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.onload = () => open();
    img.src = url;

    function open() {
      const dialog = document.createElement('dialog');
      dialog.className = 'share-dialog crop-dialog';
      dialog.innerHTML = `<h2>${labels.title}</h2><p class="dialog-message">${labels.hint}</p>
        <div class="crop-frame" style="aspect-ratio:${aspect};width:min(100%, ${(55 * aspect).toFixed(2)}vh)"><img alt="" draggable="false"><div class="crop-grid" aria-hidden="true"></div></div>
        <label class="crop-zoom"><span>${labels.zoom}</span><input type="range" min="1" max="4" step="0.01" value="1"></label>
        <div class="dialog-actions"><button type="button" class="button outline" data-answer="no">${labels.cancel}</button><button type="button" class="button primary" data-answer="yes">${labels.confirm}</button></div>`;
      document.body.append(dialog);
      const frame = dialog.querySelector('.crop-frame'); const view = frame.querySelector('img'); const zoom = dialog.querySelector('input[type=range]');
      view.src = url;
      let fw = 0, fh = 0, base = 1, scale = 1, x = 0, y = 0, result = null;

      const clamp = () => {
        const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
        x = Math.min(0, Math.max(fw - w, x)); y = Math.min(0, Math.max(fh - h, y));
        view.style.width = `${w}px`; view.style.height = `${h}px`; view.style.transform = `translate(${x}px, ${y}px)`;
      };
      const setZoom = (factor, cx = fw / 2, cy = fh / 2) => {
        const next = base * Math.min(4, Math.max(1, factor));
        x = cx - (cx - x) * (next / scale); y = cy - (cy - y) * (next / scale);
        scale = next; zoom.value = String(next / base); clamp();
      };
      const layout = () => {
        const rect = frame.getBoundingClientRect(); const relX = fw ? (fw / 2 - x) / scale : null; const relY = fh ? (fh / 2 - y) / scale : null;
        fw = rect.width; fh = rect.height;
        const factor = base ? scale / base : 1;
        base = Math.max(fw / img.naturalWidth, fh / img.naturalHeight); scale = base * factor;
        if (relX === null) { x = (fw - img.naturalWidth * scale) / 2; y = (fh - img.naturalHeight * scale) / 2; }
        else { x = fw / 2 - relX * scale; y = fh / 2 - relY * scale; }
        clamp();
      };

      let drag = null;
      frame.addEventListener('pointerdown', (e) => { drag = { px: e.clientX, py: e.clientY, x, y }; frame.setPointerCapture(e.pointerId); frame.classList.add('dragging'); });
      frame.addEventListener('pointermove', (e) => { if (!drag) return; x = drag.x + e.clientX - drag.px; y = drag.y + e.clientY - drag.py; clamp(); });
      const stop = () => { drag = null; frame.classList.remove('dragging'); };
      frame.addEventListener('pointerup', stop); frame.addEventListener('pointercancel', stop);
      frame.addEventListener('wheel', (e) => { e.preventDefault(); const r = frame.getBoundingClientRect(); setZoom((scale / base) * (e.deltaY < 0 ? 1.08 : 1 / 1.08), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
      zoom.addEventListener('input', () => setZoom(Number(zoom.value)));
      dialog.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 30 : 10;
        if (e.target === zoom) return;
        if (e.key === 'ArrowLeft') x += step; else if (e.key === 'ArrowRight') x -= step; else if (e.key === 'ArrowUp') y += step; else if (e.key === 'ArrowDown') y -= step; else return;
        e.preventDefault(); clamp();
      });
      const resize = new ResizeObserver(layout); resize.observe(frame);

      dialog.addEventListener('click', (e) => {
        const button = e.target.closest('[data-answer]'); if (!button) return;
        if (button.dataset.answer === 'yes') {
          const sw = fw / scale, sh = fh / scale, sx = -x / scale, sy = -y / scale;
          const outW = Math.round(Math.min(output, sw)), outH = Math.round(outW / aspect);
          const canvas = document.createElement('canvas'); canvas.width = outW; canvas.height = outH;
          canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
          canvas.toBlob((blob) => { result = blob; dialog.close(); }, 'image/png');
        } else dialog.close();
      });
      dialog.addEventListener('close', () => { resize.disconnect(); URL.revokeObjectURL(url); dialog.remove(); resolve(result); });
      dialog.showModal();
    }
  });
}
