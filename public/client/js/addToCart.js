document.addEventListener('DOMContentLoaded', () => {
  const formAddToCart = document.querySelector('#form-add-to-cart')
  if(formAddToCart) {
    formAddToCart.addEventListener('submit', async (e) => {
      e.preventDefault()

      const tourId = formAddToCart.querySelector('[name="tourId"]').value
      const quantity = formAddToCart.querySelector('input[name="quantity"]').value || 1

      try {

        const response = await fetch('/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tourId, quantity})
        })

        const data = await response.json()
        if(data.code === 200) {
          showToast(data.message)
        }
        const badgeEl = document.querySelector('.badge-mini')
        if(badgeEl) badgeEl.textContent = data.totalQuantity
        else showAlert2('Error', data.message)

      } catch(e) {
        console.log(e)
        showAlert2('Error Server', 'An error occurred; please try again!')
      }
    })
  }
})