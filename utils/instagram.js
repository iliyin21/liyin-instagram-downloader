const { instagramGetUrl } = require("instagram-url-direct");

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
    // Paket instagram-url-direct melempar error string/objek bila
    // post privat, dihapus, atau struktur halaman Instagram berubah.
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
