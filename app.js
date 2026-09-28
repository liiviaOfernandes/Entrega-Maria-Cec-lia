(() => {
  const config = window.JL_CONFIG;
  const client = config.clients[0];
  const photoBase = "assets/photos/";

  const $ = (id) => document.getElementById(id);
  const loginView = $("loginView");
  const galleryView = $("galleryView");
  const loginForm = $("loginForm");
  const loginError = $("loginError");
  const photoGrid = $("photoGrid");
  const loadMoreBtn = $("loadMoreBtn");
  const backToTopBtn = $("backToTopBtn");
  const lightbox = $("lightbox");
  const lightboxImage = $("lightboxImage");
  const lightboxCounter = $("lightboxCounter");
  const downloadPhoto = $("downloadPhoto");

  let visibleCount = config.gallery.photosPerPage || 20;
  let currentIndex = 0;

  function setup() {
    $("loginCover").style.backgroundImage = `url("${client.loginCover}")`;
    $("albumHero").style.backgroundImage = `url("${client.cover}")`;
    $("eventType").textContent = client.type.toUpperCase();
    $("albumTitle").textContent = client.title;
    $("albumDate").textContent = client.date;
    $("albumMessage").textContent = client.message;
    $("photoCount").textContent = `${client.photos.length} fotografias`;

    if (sessionStorage.getItem("jl_gallery_auth") === client.id) openGallery(false);
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value.trim();

    if (email === client.email.toLowerCase() && password === client.password) {
      loginError.textContent = "";
      sessionStorage.setItem("jl_gallery_auth", client.id);
      openGallery(true);
    } else {
      loginError.textContent = "E-mail ou senha incorretos. Confira os dados e tente novamente.";
    }
  });

  $("togglePassword").addEventListener("click", () => {
    const input = $("password");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    $("togglePassword").textContent = show ? "Ocultar" : "Ver";
  });

  $("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("jl_gallery_auth");
    galleryView.classList.add("hidden");
    loginView.classList.remove("hidden");
    loginForm.reset();
    window.scrollTo(0, 0);
  });

  function openGallery(scrollTop = true) {
    loginView.classList.add("hidden");
    galleryView.classList.remove("hidden");
    renderPhotos();
    if (scrollTop) window.scrollTo(0, 0);
  }

  function renderPhotos() {
    photoGrid.innerHTML = "";
    client.photos.slice(0, visibleCount).forEach((name, index) => {
      const card = document.createElement("figure");
      card.className = "photo-card";
      card.dataset.index = index;

      const img = document.createElement("img");
      img.src = photoBase + encodeURIComponent(name).replace(/%2F/g, "/");
      img.alt = `${client.title} — foto ${index + 1}`;
      img.loading = index < 6 ? "eager" : "lazy";
      img.decoding = "async";

      card.appendChild(img);
      card.addEventListener("click", () => openLightbox(index));
      photoGrid.appendChild(card);
    });

    loadMoreBtn.classList.toggle("hidden", visibleCount >= client.photos.length);
    backToTopBtn.classList.toggle("hidden", !config.gallery.showBackToTop);
  }

  loadMoreBtn.addEventListener("click", () => {
    visibleCount = Math.min(visibleCount + (config.gallery.photosPerPage || 20), client.photos.length);
    renderPhotos();
  });

  backToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  function photoUrl(index) {
    return photoBase + encodeURIComponent(client.photos[index]).replace(/%2F/g, "/");
  }

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function updateLightbox() {
    const name = client.photos[currentIndex];
    const url = photoUrl(currentIndex);
    lightboxImage.src = url;
    lightboxImage.alt = `${client.title} — ${name}`;
    lightboxCounter.textContent = `${currentIndex + 1} / ${client.photos.length}`;
    downloadPhoto.href = url;
    downloadPhoto.setAttribute("download", name);
  }

  function closeLightbox() {
    lightbox.classList.add("hidden");
    document.body.style.overflow = "";
  }

  function next(step) {
    currentIndex = (currentIndex + step + client.photos.length) % client.photos.length;
    updateLightbox();
  }

  $("closeLightbox").addEventListener("click", closeLightbox);
  $("prevPhoto").addEventListener("click", () => next(-1));
  $("nextPhoto").addEventListener("click", () => next(1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") next(-1);
    if (e.key === "ArrowRight") next(1);
  });

  setup();
})();
