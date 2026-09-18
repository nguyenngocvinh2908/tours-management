document.addEventListener('DOMContentLoaded', () => {
  // 1. Xử Lý Form Đăng Kí
  const formRegister = document.querySelector('#form-register')
  if(formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault()

      const fullName = formRegister.querySelector('[name="fullName"]').value
      const email = formRegister.querySelector('[name="email"]').value
      const phone = formRegister.querySelector('[name="phone"]').value
      const password = formRegister.querySelector('[name="password"]').value

      try {
        const response = await fetch('/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fullName, email, phone, password })
        })

        const data = await response.json()
        if(data.code === 200) {
          showToast(data.message)
          setTimeout(() => {
            window.location.href = data.redirectUrl || '/user/login'
          }, 1500)
        } else if(data.code === 400) {
          showToast(data.message, 'info')
        } else {
          showAlert2('Error', data.message)
        }
      } catch {
        showAlert2('System Error', 'Unable to connect to the server; please try again later!')
      }
    })
  }

  // 2. Xử Lý Form Đăng Nhập
  const formLogin = document.querySelector('#form-login')
  if(formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault()

      const email = formLogin.querySelector('[name="email"]').value
      const password = formLogin.querySelector('[name="password"]').value

      try {
        const response = await fetch('/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()
        console.log(data)
        if(data.code === 200) {
          showToast(data.message)
          setTimeout(() => {
            window.location.href = data.redirectUrl || '/user/login'
          }, 1500)
        } else if(data.code === 400) {
          showToast(data.message, 'info')
        } else {
          showAlert2('Error', data.message)
        }
      } catch {
        showAlert2('System Error', 'Unable to connect to the server; please try again later!')
      }
    })
  }

})