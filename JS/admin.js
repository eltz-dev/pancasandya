// PANCASANDYA — admin inbox: menampilkan & menghapus pesan NGL secara realtime
import { db } from "./firebase-config.js";
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('[data-inbox-list]');
  const emptyState = document.querySelector('[data-inbox-empty]');
  const countLabel = document.querySelector('[data-inbox-count]');
  const deleteAllBtn = document.querySelector('[data-delete-all]');
  if(!list) return;

  const nglRef = ref(db, 'ngl_messages');

  function formatTime(ts){
    if(!ts) return 'Baru saja';
    const d = new Date(ts);
    return d.toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  onValue(nglRef, (snapshot) => {
    const data = snapshot.val();
    list.innerHTML = '';

    if(!data){
      emptyState.style.display = 'block';
      countLabel.innerHTML = '<b>0</b> pesan';
      return;
    }

    const items = Object.entries(data).map(([id, val]) => ({ id, ...val }));
    // Tumpukan terbaru di paling atas
    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    emptyState.style.display = 'none';
    countLabel.innerHTML = `<b>${items.length}</b> pesan`;

    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'inbox-item';
      li.innerHTML = `
        <div class="row1">
          <span class="to">Kepada: ${escapeHtml(item.kepada || '-')}</span>
          <span class="from">dari ${escapeHtml(item.nama || 'Anonim')}</span>
        </div>
        <p class="msg">${escapeHtml(item.pesan || '')}</p>
        <div class="time">${formatTime(item.createdAt)}</div>
      `;
      list.appendChild(li);
    });
  });

  if(deleteAllBtn){
    deleteAllBtn.addEventListener('click', () => {
      window.showPopup({
        type: 'warning',
        title: 'Hapus semua pesan?',
        message: 'Apakah kamu yakin ingin menghapus seluruh pesan NGL? Pesan akan terhapus selamanya.',
        confirmText: 'Ya, hapus semua',
        cancelText: 'Batal',
        onConfirm: () => {
          remove(nglRef).then(() => {
            window.showPopup({
              type: 'success',
              title: 'Terhapus',
              message: 'Seluruh pesan NGL berhasil dihapus dari database.',
              confirmText: 'Oke'
            });
          }).catch((err) => {
            console.error(err);
            window.showPopup({
              type: 'warning',
              title: 'Gagal menghapus',
              message: 'Terjadi kendala saat menghapus pesan. Silakan coba lagi.',
              confirmText: 'Oke'
            });
          });
        }
      });
    });
  }
});
