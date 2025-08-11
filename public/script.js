let page = 1;
const grid = document.getElementById('grid');
const loader = document.getElementById('loader');
const sentinel = document.getElementById('sentinel');

async function loadVideos() {
  loader.textContent = 'Memuat...';
  const res = await fetch(`/api/videos?page=${page}&per_page=10`);
  const data = await res.json();
  
  if (data?.result?.length) {
    data.result.forEach(v => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${v.single_img}" class="thumb" alt="${v.title}" />
        <div class="card-body">
          <div class="title">${v.title}</div>
          <div class="meta">${v.length}</div>
        </div>
      `;
      card.onclick = () => openModal(v.embed_url, v.title);
      grid.appendChild(card);
    });
    page++;
    loader.textContent = '';
  } else {
    loader.textContent = 'Tidak ada lagi video.';
  }
}

function openModal(url, title) {
  const modal = document.getElementById('modal');
  const player = document.getElementById('player');
  const modalTitle = document.getElementById('modalTitle');
  
  modal.classList.add('show');
  player.src = url;
  modalTitle.textContent = title;
}

document.getElementById('closeBtn').onclick = () => {
  document.getElementById('modal').classList.remove('show');
  document.getElementById('player').src = '';
};

const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    loadVideos();
  }
});
observer.observe(sentinel);