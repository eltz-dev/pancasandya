// PANCASANDYA — NGL: kirim pesan anonim + cek status aktif/nonaktif fitur
import { db } from "./firebase-config.js";
import { ref, push, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { subscribeNglStatus, formatUntil } from "./ngl-status.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-ngl-form]');
  if(!form) return;

  const nameInput = form.querySelector('[name="nama"]');
  const toInput = form.querySelector('[name="kepada"]');
  const msgInput = form.querySelector('[name="pesan"]');
  const submitBtn = form.querySelector('[data-submit-btn]');
  const lockedBanner = document.querySelector('[data-locked-banner]');
  const lockedText = document.querySelector('[data-locked-text]');

  let hasShownWelcome = false;
  let wasActive = true;
  let firstStatusCheck = true;

  function lockForm(){
    form.classList.add('is-locked');
    [nameInput, toInput, msgInput, submitBtn].forEach(el => el && (el.disabled = true));
    if(lockedBanner) lockedBanner.style.display = 'flex';
  }

  function unlockForm(){
    form.classList.remove('is-locked');
    [nameInput, toInput, msgInput, submitBtn].forEach(el => el && (el.disabled = false));
    if(lockedBanner) lockedBanner.style.display = 'none';
  }

  subscribeNglStatus((status) => {
    if(!status.effectiveActive){
      lockForm();
      if(lockedText){
        lockedText.textContent = status.until
          ? `Fitur ini akan aktif kembali sekitar ${formatUntil(status.until)}.`
          : 'Fitur ini akan aktif kembali begitu developer atau admin mengaktifkannya.';
      }
      // Munculkan pop-up hanya saat transisi dari aktif -> nonaktif (atau saat pertama kali buka halaman & memang nonaktif)
      if(wasActive || firstStatusCheck){
        window.showPopup({
          type: 'warning',
          title: 'Dimatikan Sementara',
          message: 'Fitur NGL sedang dinonaktifkan sementara oleh developer/admin. Kamu belum bisa mengirim pesan sampai fitur ini diaktifkan kembali.',
          confirmText: 'Oke, mengerti'
        });
      }
      wasActive = false;
    } else {
      unlockForm();
      if(!wasActive && !firstStatusCheck){
        window.showPopup({
          type: 'success',
          title: 'NGL Aktif Kembali',
          message: 'Fitur kirim pesan anonim sudah bisa dipakai lagi. Yuk titip pesan!',
          confirmText: 'Oke'
        });
      } else if(firstStatusCheck && !hasShownWelcome){
        hasShownWelcome = true;
        window.showPopup({
          type: 'info',
          title: 'Sebelum kamu kirim',
          message: 'Pesan yang masuk berpeluang disampaikan lewat Reels Instagram kami. Jangan lupa follow <b>@pancasandya.x5</b> ya!',
          confirmText: 'Siap, mengerti'
        });
      }
      wasActive = true;
    }
    firstStatusCheck = false;
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
