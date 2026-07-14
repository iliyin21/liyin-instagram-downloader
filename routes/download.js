const express = require("express");
const axios = require("axios");
const router = express.Router();

const { fetchInstagramMedia } = require("../utils/instagram");
const { isValidInstagramUrl, sanitizeUrl } = require("../utils/validator");

/**
 * POST /api/download
 * Body: { url: string }
 * Mengembalikan daftar media (foto/video/carousel) yang bisa diunduh.
 */
router.post("/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Link Instagram wajib diisi.",
      });
    }

    if (!isValidInstagramUrl(url)) {
      return res.status(400).json({
        success: false,
        message:
          "Link tidak valid. Gunakan link post, reel, atau IGTV dari Instagram.",
      });
    }

    const cleanUrl = sanitizeUrl(url);
    const data = await fetchInstagramMedia(cleanUrl);

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(422).json({
      success: false,
      message: err.message || "Terjadi kesalahan saat memproses link.",
    });
  }
});

/**
 * GET /api/fetch?url=<mediaUrl>&filename=<nama file>
 * Mem-proxy file media Instagram agar bisa diunduh langsung dari
 * browser dengan nama file yang rapi (menghindari CORS & link CDN yang expired saat dibuka tab baru).
 */
router.get("/fetch", async (req, res) => {
  const { url, filename } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: "Parameter url wajib diisi." });
  }

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 20000,
    });

    const safeName = (filename || "instagram-media").replace(
      /[^a-z0-9._-]/gi,
      "_"
    );
    const contentType = response.headers["content-type"] || "application/octet-stream";
    const ext = contentType.includes("video") ? "mp4" : "jpg";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}.${ext}"`
    );

    response.data.pipe(res);
  } catch (err) {
    res.status(502).json({
      success: false,
      message: "Gagal mengunduh file media dari server Instagram.",
    });
  }
});

module.exports = router;
