document.addEventListener('DOMContentLoaded', () => {
  const formCheckout = document.querySelector('#formCheckout')
  const btnSubmitOrder = document.querySelector('#btnSubmitOrder')

  if(formCheckout) {
    formCheckout.addEventListener('submit', async (e) => {
      e.preventDefault()

      // 1. Thu Nhap Du Lieu Tu Form
      const formData = new FormData(formCheckout)
      const data = Object.fromEntries(formData.entries())
      console.log(data)

      // Validate cơ bản phía client
      if (!data.fullName?.trim() || !data.phone?.trim() || !data.email?.trim() || !data.address?.trim()) {
        showToast('Please fill in all the required information!', 'error')
        return
      }

      try {
        // 2. Disable nút bấm và hiển thị trạng thái Loading
        btnSubmitOrder.disabled = true
        const originalBtnContent = btnSubmitOrder.innerHTML

        btnSubmitOrder.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i>Processing order...`

        // 3. Gửi Lên Server
        const response = await fetch('/checkout/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        const result = await response.json()
      } catch {
        
      }
    })
  }
})