document.addEventListener('DOMContentLoaded', () => {
  const themeSwitch = document.querySelector('#themeSwitch')
  const themeToggleBtn = document.querySelector('#themeToggleBtn')
  const themeIcon = document.querySelector('#themeIcon')
  // 1. Kiểm tra trạng thái Theme từ LocalStorage
  const savedTheme = localStorage.getItem('theme')
  if(savedTheme === 'dark') {
    document.body.classList.add('dark-mode')
    if(themeSwitch) themeSwitch.checked = true
    if(themeIcon) {
      themeIcon.classList.remove('fa-moon')
      themeIcon.classList.add('fa-sun')
    }
  }
  
  // 2. Xử lý khi bật / tắt Switch Dark Mode
  if(themeSwitch) {
    themeSwitch.addEventListener('change', (e) => {
      const isDark = e.target.checked

      if(isDark) {
        document.body.classList.add('dark-mode')
        localStorage.setItem('theme', 'dark')

        if (themeIcon) {
          themeIcon.classList.remove('fa-moon')
          themeIcon.classList.add('fa-sun')
        }
      } else {
        document.body.classList.remove('dark-mode')
        localStorage.setItem('theme', 'light')

        if (themeIcon) {
          themeIcon.classList.remove('fa-sun')
          themeIcon.classList.add('fa-moon')
        }
      }
    })
  }

  // 3. Giữ cho Dropdown không bị ẩn khi bấm vào khu vực Switch Theme
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation()
    })
  }

})