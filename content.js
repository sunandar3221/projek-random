// Konfigurasi kata target dan kata pengganti
const REPLACEMENTS = [
  { target: /Microsoft/gi, replacement: "Microslop" },
  { target: /Linux/gi, replacement: "Loonixtards" }
];

// Fungsi untuk memproses dan mengganti teks pada sebuah Text Node
function replaceTextNode(node) {
  if (node.nodeType !== Node.TEXT_NODE) return;

  let originalText = node.nodeValue;
  let newText = originalText;

  // Lakukan penggantian berdasarkan regex yang sudah didefinisikan
  for (const { target, replacement } of REPLACEMENTS) {
    newText = newText.replace(target, replacement);
  }

  // Hanya perbarui node jika ada perubahan teks (untuk efisiensi & mencegah render ulang yang tidak perlu)
  if (newText !== originalText) {
    node.nodeValue = newText;
  }
}

// Fungsi rekursif untuk menelusuri semua Node di dalam DOM
function walkTextNodes(root) {
  // Buat TreeWalker untuk efisiensi, atau bisa juga menggunakan childNodes secara rekursif
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    replaceTextNode(node);
  }
}

// Inisialisasi: Jalankan saat pertama kali halaman dimuat
walkTextNodes(document.body);

// Setup MutationObserver untuk menangani konten yang dimuat secara dinamis (AJAX, Infinite Scroll, dll)
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      // Iterasi semua node yang baru ditambahkan
      for (const addedNode of mutation.addedNodes) {
        // Pastikan node adalah Element (bukan text node mentah di atas) agar bisa ditelusuri
        if (addedNode.nodeType === Node.ELEMENT_NODE) {
          walkTextNodes(addedNode);
        } else if (addedNode.nodeType === Node.TEXT_NODE) {
          replaceTextNode(addedNode);
        }
      }
    }
  }
});

// Mulai mengobservasi perubahan pada document.body
observer.observe(document.body, {
  childList: true,
  subtree: true
});