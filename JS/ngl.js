// PANCASANDYA — NGL: kirim pesan anonim ke Firebase Realtime Database
import { db } from "./firebase-config.js";
import { ref, push, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-ngl-form]');
  if(!form) return;

  const nameInput = form.querySelector('[name="nama"]');
  const toInput = form.querySelector('[name="kepada"]');
  const msgInput = form.querySelector('[name="pesan"]');
  const submitBtn = form.querySelector('[data-submit-btn]');

  // Pemberitahuan saat halaman dibuka
  window.showPopup({
    type: 'info',
    title: 'Sebelum kamu kirim',
    message: 'Pesan yang masuk berpeluang disampaikan lewat Reels Instagram kami. Jangan lupa follow <b>@pancasandya.x5</b> ya!',
    confirmText: 'Siap, mengerti'
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const kepada = toInput.value.trim();
    const pesan = msgInput.value.trim();

    if(!kepada || !pesan){
      window.showPopup({
        type: 'warning',
        title: 'Belum lengkap',
        message: 'Kolom "Kepada" dan "Pesan" wajib diisi sebelum mengirim.',
        confirmText: 'Oke'
      });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    const nglRef = ref(db, 'ngl_messages');
    const newMsgRef = push(nglRef);

    set(newMsgRef, {
      nama: nameInput.value.trim() || 'Anonim',
      kepada,
      pesan,
      createdAt: serverTimestamp()
    }).then(() => {
      form.reset();
      window.showPopup({
        type: 'success',
        title: 'Berhasil Terkirim!',
        message: 'Pesanmu sudah sampai ke Pancasandya. Terima kasih sudah berbagi cerita.',
        confirmText: 'Kirim lagi'
      });
    }).catch((err) => {
      console.error(err);
      window.showPopup({
        type: 'warning',
        title: 'Gagal terkirim',
        message: 'Terjadi kendala saat mengirim pesan. Coba periksa koneksi internetmu dan kirim ulang.',
        confirmText: 'Oke'
      });
    }).finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Kirim';
    });
  });
});
