// Final build: lazy thumbnails, infinite scroll (sentinel), modal player with Next/Prev
(() => {
  const API = '/api/videos'; // proxy on Vercel that forwards to Doodstream
  const grid = document.getElementById('grid');
  const loader = document.getElementById('loader');
  const sentinelEl = document.getElementById('sentinel');

  // Modal
  const modal = document.getElementById('modal');
  const player = document.getElementById('player');
  const closeBtn = document.getElementById('closeBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const modalTitle = document.getElementById('modalTitle');

  let page = 1;
  let loading = false;
  let totalPages = Infinity;
  const videos = [];

  function fmtTime(s){ s = Number(s)||0; const m=Math.floor(s/60); const sec=s%60; return `${m}:${String(sec).padStart(2,'0')}`; }

  function makeSkeleton(){
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<div class="thumb skeleton" style="height:130px"></div>
      <div class="card-body" style="padding:10px">
        <div style="flex:1">
          <div class="skeleton" style="height:14px;width:70%;border-radius:6px;margin-bottom:8px"></div>
          <div class="skeleton" style="height:12px;width:40%;border-radius:6px"></div>
        </div>
        <div style="width:60px"></div>
      </div>`;
    return el;
  }
  function showSkeletons(n=4){ for(let i=0;i<n;i++) grid.appendChild(makeSkeleton()); }
  function clearSkeletons(){ grid.querySelectorAll('.skeleton').forEach(s=>{ const p=s.closest('.card'); if(p) p.remove(); }); }

  function makeCard(v, idx){
    const card = document.createElement('article');
    card.className = 'card';
    const thumb = v.splash_img || v.single_img || '';
    const title = v.title || 'Untitled';
    const dur = v.length ? fmtTime(v.length) : '';
    card.setAttribute('data-idx', idx);
    card.innerHTML = `
      <img class="thumb lazy" data-src="${thumb}" alt="${escapeHtml(title)}">
      <div class="card-body">
        <h3 class="title">${escapeHtml(title)}</h3>
        <div class="meta">${dur}</div>
      </div>`;
    card.addEventListener('click', ()=> openModal(idx));
    return card;
  }

  function escapeHtml(s){ return String(s || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }

  const lazyObserver = new IntersectionObserver((entries, obs) => {
    for(const e of entries){
      if(e.isIntersecting){
        const img = e.target;
        const src = img.dataset.src;
        if(src){ img.src = src; img.removeAttribute('data-src'); img.onload = ()=> img.classList.remove('skeleton'); img.onerror = ()=> { img.src=''; } }
        obs.unobserve(img);
      }
    }
  }, {rootMargin:'200px 0px'});

  async function loadPage(){
    if(loading) return;
    if(page > totalPages){ loader.textContent = 'Semua video dimuat.'; return; }
    loading = true;
    loader.style.display = 'block';
    showSkeletons(6);
    try {
      const r = await fetch(`${API}?page=${page}`);
      if(!r.ok) throw new Error('Server error ' + r.status);
      const j = await r.json();
      const files = j?.result?.files || j?.files || [];
      if(j?.result?.total_pages) totalPages = Number(j.result.total_pages);
      else if(j?.total_pages) totalPages = Number(j.total_pages);

      clearSkeletons();
      const start = videos.length;
      files.forEach((f,i) => {
        videos.push(f);
        const c = makeCard(f, start + i);
        grid.appendChild(c);
      });

      grid.querySelectorAll('img.lazy').forEach(img => {
        if(img.dataset.src) lazyObserver.observe(img);
      });

      if(files.length > 0) page++;
      else { totalPages = page - 1; loader.textContent = 'Tidak ada lagi video.'; }
    } catch (err) {
      console.error('Load error', err);
      loader.textContent = 'Gagal memuat. Refresh halaman.';
    } finally {
      loading = false;
      if(page <= totalPages) loader.style.display = 'none';
    }
  }

  const sentinel = document.getElementById('sentinel');
  const sentinelObserver = new IntersectionObserver((entries) => {
    for(const e of entries) if(e.isIntersecting) loadPage();
  }, {rootMargin:'600px 0px'});
  sentinelObserver.observe(sentinel);

  // Modal logic
  let current = -1;
  function openModal(idx){
    if(idx < 0 || idx >= videos.length) return;
    current = idx;
    const v = videos[idx];
    modalTitle.textContent = v.title || '—';
    const url = v.file_code ? `https://doodstream.com/e/${v.file_code}` : (v.download_url || '');
    player.src = url;
    modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
    updateNav();
    prefetch(current+1); prefetch(current-1);
  }
  function closeModal(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); player.src=''; current=-1; updateNav(); }
  function next(){ if(current < videos.length -1) openModal(current+1); else if(page <= totalPages && !loading) loadPage().then(()=>{ if(current < videos.length -1) openModal(current+1); }); }
  function prev(){ if(current > 0) openModal(current-1); }
  function updateNav(){ prevBtn.disabled = !(current > 0); nextBtn.disabled = !(current < videos.length -1 || page <= totalPages); }
  function prefetch(i){ if(i>=0 && i<videos.length){ const v = videos[i]; const url = v.file_code ? `https://doodstream.com/e/${v.file_code}` : v.download_url; if(url) fetch(url, {mode:'no-cors'}).catch(()=>{}); } }

  // DOM refs after they exist
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const closeBtnRef = document.getElementById('closeBtn');

  closeBtnRef.addEventListener('click', closeModal);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  window.addEventListener('keydown', (e) => {
    if(modal.classList.contains('show')){
      if(e.key === 'Escape') closeModal();
      if(e.key === 'ArrowRight') next();
      if(e.key === 'ArrowLeft') prev();
    }
  });
  modal.addEventListener('click', (ev) => { if(ev.target === modal) closeModal(); });

  // Start
  loadPage();

  // debug helper
  window.__VIDEO_FEED = { videos, loadPage, state: ()=>({page,loading,totalPages,loaded:videos.length}) };
})();