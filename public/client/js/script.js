// Search Suggest API
const inputSearch = document.querySelector('[input-search]')
if(inputSearch) {
  const boxSuggest = document.querySelector('[box-suggest]')
  const innerList = boxSuggest.querySelector('.inner-list')
  inputSearch.addEventListener('keyup', async (e) => {
    const keyword = e.target.value.trim()
    if(keyword.length > 0) {
      fetch(`/search/suggest?keyword=${keyword}`).then(res => res.json()).then(data => {
        if(data.code === 200 && data.tourRecords.length > 0) {
          const htmls = data.tourRecords.map((item) => {
            return `
              <a href="/tours/detail/${item.slug}" class="d-flex align-items-center gap-2 p-2 text-decoration-none border-bottom text-dark hover-bg-light">
                <img src="${item.image || 'https://picsum.photos/60/40'}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;" />
                <div class="overflow-hidden">
                  <div class="fw-bold small text-truncate" style="max-width: 200px;">${item.title}</div>
                  <div class="text-danger small fw-bold">${item.price_special.toLocaleString('vi-VN')}đ</div>
                </div>
              </a>
            `
          })
          innerList.innerHTML = htmls.join('')
        } else {
          innerList.innerHTML = `<div class="p-2 text-muted small text-center">Not Found</div>`
        }
        boxSuggest.classList.remove("d-none")
      })
    } else {
      boxSuggest.classList.add("d-none")
    }
  })

  // Ân box suggest khi click ra ngoài
  document.addEventListener("click", (e) => {
    if (!inputSearch.contains(e.target) && !boxSuggest.contains(e.target)) {
      boxSuggest.classList.add("d-none")
    }
  })
}