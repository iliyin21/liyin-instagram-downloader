(() => {
  const form = document.getElementById("download-form");
  const urlInput = document.getElementById("ig-url");
  const pasteBtn = document.getElementById("paste-btn");
  const submitBtn = document.getElementById("submit-btn");
  const submitLabel = submitBtn.querySelector(".gold-btn__label");
  const submitSpinner = submitBtn.querySelector(".gold-btn__spinner");
  const errorEl = document.getElementById("form-error");
  const shimmer = document.getElementById("shimmer-line");

  const resultSection = document.getElementById("result-section");
  const gallery = document.getElementById("gallery");
  const resultUsername = document.getElementById("result-username");
  const resultCount = document.getElementById("result-count");
  const cardTemplate = document.getElementById("media-card-template");

  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        urlInput.value = text.trim();
        urlInput.focus();
      }
    } catch {
      urlInput.focus();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const url = urlInput.value.trim();
    if (!url) return;

    setLoading(true);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.message || "Gagal memproses tautan.");
      }

      renderResult(payload.data);
    } catch (err) {
      showError(err.message);
      resultSection.hidden = true;
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitSpinner.hidden = !isLoading;
    submitLabel.textContent = isLoading ? "Memproses…" : "Ambil Media";
    shimmer.hidden = !isLoading;
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function hideError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }

  function renderResult(data) {
    gallery.innerHTML = "";
    resultUsername.textContent = `@${data.username || "unknown"}`;
    resultCount.textContent = `${data.items.length} media`;

    data.items.forEach((item, i) => {
      const node = cardTemplate.content.cloneNode(true);
      const mediaContainer = node.querySelector(".media-card__media");
      const badge = node.querySelector(".media-card__badge");
      const downloadLink = node.querySelector(".media-card__download");

      badge.textContent = item.type === "video" ? "Video" : "Foto";

      if (item.type === "video") {
        const video = document.createElement("video");
        video.src = item.url;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        mediaContainer.appendChild(video);
      } else {
        const img = document.createElement("img");
        img.src = item.thumbnail || item.url;
        img.alt = `Media Instagram ${i + 1}`;
        img.loading = "lazy";
        mediaContainer.appendChild(img);
      }

      const filename = `${data.username || "instagram"}_${i + 1}`;
      downloadLink.href = `/api/fetch?url=${encodeURIComponent(
        item.url
      )}&filename=${encodeURIComponent(filename)}`;

      gallery.appendChild(node);
    });

    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();
