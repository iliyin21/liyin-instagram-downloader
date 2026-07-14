const igModule = require("instagram-url-direct");

// Package `instagram-url-direct` mengekspor fungsinya dengan cara berbeda
// tergantung versi (module.exports = fn langsung, atau { instagramGetUrl: fn },
// atau lewat interop default saat ESM di-require dari CJS). Baris ini
// mencoba ketiga kemungkinan supaya tidak error "is not a function".
const instagramGetUrl =
  typeof igModule === "function"
    ? igModule
    : igModule.instagramGetUrl || igModule.default;

if (typeof instagramGetUrl !== "function") {
  throw new Error(
    "Tidak bisa menemukan fungsi instagramGetUrl dari package instagram-url-direct. " +
      "Cek versi package yang ter-install (package.json / node_modules)."
  );
}

/**
 * Mengambil detail media dari sebuah link Instagram publik (post, reel, atau tv)
 * dan menormalkan hasilnya ke bentuk yang konsisten untuk frontend.
 *
 * @param {string} url - Link Instagram yang sudah divalidasi
 * @returns {Promise<{username: string, caption: string, items: Array}>}
 */
async function fetchInstagramMedia(url) {
  let result;

  try {
    result = await instagramGetUrl(url);
  } catch (err) {
    // Log error asli ke console server (muncul di Railway > Deployments > View Logs)
    // supaya kita tahu penyebab sebenarnya: post privat, IP server diblokir
    // Instagram, atau struktur halaman Instagram berubah.
    console.error("[instagramGetUrl] gagal untuk url:", url);
    console.error("[instagramGetUrl] detail error:", err);

    throw new Error(
      "Gagal mengambil media. Pastikan link publik dan masih aktif."
    );
  }

  if (!result || !result.url_list || result.url_list.length === 0) {
    throw new Error("Media tidak ditemukan pada link tersebut.");
  }

  const mediaDetails = result.media_details || [];

  const items = (mediaDetails.length ? mediaDetails : result.url_list).map(
    (item, index) => {
      if (typeof item === "string") {
        return {
          url: item,
          type: guessTypeFromUrl(item),
          thumbnail: null,
          index,
        };
      }
      return {
        url: item.url,
        type: item.type === "video" ? "video" : "image",
        thumbnail: item.thumbnail || null,
        dimensions: item.dimensions || null,
        index,
      };
    }
  );

  return {
    username: result.post_info?.owner_username || "unknown",
    caption: result.post_info?.caption || "",
    isCarousel: items.length > 1,
    items,
  };
}

function guessTypeFromUrl(url) {
  return /\.mp4($|\?)/i.test(url) ? "video" : "image";
}

module.exports = { fetchInstagramMedia };