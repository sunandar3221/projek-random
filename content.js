// Konfigurasi kata target dan kata pengganti
const REPLACEMENTS = [
  { target: /Microsoft/gi, replacement: "Microslop" },
  { target: /Linux/gi, replacement: "Loonixtards" },
  { target: /Windows/gi, replacement: "Winbloats" },
  { target: /Copilot/gi, replacement: "Copislop" },
];

const HIDE_CLASS = "sneaky-replace-hide";

// Fungsi inti untuk mengganti teks pada Text Node
function replaceTextNode(node) {
  if (node.nodeType !== Node.TEXT_NODE) return false;

  let originalText = node.nodeValue;
  let newText = originalText;
  let isReplaced = false;

  for (const { target, replacement } of REPLACEMENTS) {
    if (target.test(newText)) {
      newText = newText.replace(target, replacement);
      isReplaced = true;
    }
  }

  if (isReplaced) {
    node.nodeValue = newText;
    return true;
  }
  return false;
}

// Fungsi rekursif menggunakan TreeWalker
function walkTextNodes(root) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );

  let node;
  while ((node = walker.nextNode())) {
    replaceTextNode(node);
  }
}

// Fungsi untuk melepas class sembunyi (dengan efek halus)
function unhideElement(el) {
  if (el && el.classList.contains(HIDE_CLASS)) {
    // Gunakan requestAnimationFrame agar browser sempat merender opacity: 0 sebelum transisi dimulai
    requestAnimationFrame(() => {
      el.classList.remove(HIDE_CLASS);
    });
  }
}

// Fungsi untuk memproses elemen baru yang masuk (dari MutationObserver atau inisialisasi)
function processElement(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return;

  // Abaikan tag script dan style agar tidak merusak fungsionalitas website
  const tagName = el.tagName.toLowerCase();
  if (tagName === "script" || tagName === "style" || tagName === "link") return;

  // 1. Sembunyikan elemen secara instan via CSS
  el.classList.add(HIDE_CLASS);

  // 2. Eksekusi penggantian teks
  walkTextNodes(el);

  // 3. Munculkan kembali secara halus setelah selesai
  unhideElement(el);
}

// === INISIALISASI AWAL ===
// Langsung eksekusi begitu document.documentElement ada (document_start)
const root = document.documentElement;
if (root) {
  // Sembunyikan seluruh halaman dulu untuk mencegah flash awal
  root.classList.add(HIDE_CLASS);
}

// === MUTATION OBSERVER ===
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeType === Node.ELEMENT_NODE) {
          processElement(addedNode);
        } else if (addedNode.nodeType === Node.TEXT_NODE) {
          // Jika yang masuk adalah Text Node langsung, sembunyikan parent-nya
          const parent = addedNode.parentElement;
          if (parent && !parent.classList.contains(HIDE_CLASS)) {
            parent.classList.add(HIDE_CLASS);
            replaceTextNode(addedNode);
            unhideElement(parent);
          } else {
            replaceTextNode(addedNode);
          }
        }
      }
    }
  }
});

// Mulai mengobservasi pada document.documentElement
if (root) {
  observer.observe(root, {
    childList: true,
    subtree: true,
  });
}

// Saat DOM sudah siap, pastikan seluruh body sudah diproses dan root di-unhide
document.addEventListener("DOMContentLoaded", () => {
  if (document.body) {
    walkTextNodes(document.body);
  }
  // Hilangkan sembunyian pada root HTML
  unhideElement(root);
});
