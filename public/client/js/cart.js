document.addEventListener('DOMContentLoaded', () => {
  // Hàm Định Dạng Số Tiền Viêt Nam
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
  }

  const updateSummaryPrices = (totalPrice, totalQuantity) => {
    const subtotalEl = document.querySelector('#cartSubtotal')
    const totalEl = document.querySelector('#cartTotal')
    const badgeEl = document.querySelector('.badge')
    const badgeContent = document.querySelector('.badge-content')

    if(subtotalEl) subtotalEl.textContent = formatCurrency(totalPrice)
    if(totalEl) totalEl.textContent = formatCurrency(totalPrice)
    if(badgeEl && totalQuantity !== undefined) {
      badgeEl.textContent = `${totalQuantity}`
    }
    if(badgeContent && totalQuantity !== undefined) {
      badgeContent.textContent = `${totalQuantity} Tour In The Cart`
    }
  }


  // Hàm gửi API cập nhật số lượng
  const sendUpdateQuantityAPI = async (itemId, quantity, inputEl) => {
    try {
      const response = await fetch('/cart/update-quantity', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId, quantity })
      })

      const data = await response.json()
      if(data.code === 200) {
        inputEl.value = quantity

        // 1. Update Money Item Cart
        const itemTotalEl = document.querySelector(`.item-total-price[data-id="${itemId}"]`)
        if(itemTotalEl) {
          itemTotalEl.textContent = formatCurrency(data.itemTotalPrice)
        }
        // 2. Update Tổng Tiền Toàn Cart
        updateSummaryPrices(data.totalPrice, data.totalQuantity)
        showToast('Quantity updated successfully!')
      } else {

      }
    } catch(e) {
      console.log(e)
    }
  }

  // Event Button Increase Decrease Quantity
  const btnQuantities = document.querySelectorAll('.btn-update-quantity')
  if(btnQuantities) {
    btnQuantities.forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action')
        const itemId = btn.getAttribute('data-id')
        const inputEl = document.querySelector(`input.input-quantity[data-id="${itemId}"]`)
        if(!inputEl) return
        let currentVal = parseInt(inputEl.value, 10)
        const maxVal = parseInt(inputEl.getAttribute('max'), 10)

        if(action === 'increase') {
          if(currentVal < maxVal) {
            currentVal++
            sendUpdateQuantityAPI(itemId, currentVal, inputEl)
          }
          else {
            showAlert2('Fully booked', `Maximum remaining spots for the tour: ${maxVal}!`, 'warning')
          }
        } else if(action === 'decrease') {
          if(currentVal > 1) {
            currentVal--
            sendUpdateQuantityAPI(itemId, currentVal, inputEl)
          }
        }
      })
    })
  }

  // Event Tự Nhập Số Lượng Vào Input
  const inputQuantity = document.querySelectorAll('.input-quantity')
  if(inputQuantity) {
    inputQuantity.forEach((item) => {
      item.addEventListener('change', () => {
        const itemId = item.getAttribute('data-id')
        let value = parseInt(item.value, 10)
        const maxValue = parseInt(item.getAttribute('max'), 10)
        if(isNaN(value) || value < 1) value = 1
        if(value > maxValue) {
          value = maxValue
          showAlert2('Fully booked', `Maximum remaining spots for the tour: ${maxValue}!`, 'warning')
        }
        sendUpdateQuantityAPI(itemId, value, item)
      })
    })
  }

  // Event Deleted CartItem
  const btnDeleteItems = document.querySelectorAll('.btn-delete-item')
  if(btnDeleteItems) {
    btnDeleteItems.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const itemId = btn.getAttribute('data-id')
        const isConfirmed = await showConfirm('Remove from cart?', 'Are you sure you want to remove this tour from your cart?')
        if (!isConfirmed) return

        try {
          const respone = await fetch(`/cart/delete/${itemId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const data = await respone.json()
          if(data.code === 200) {
            // Xóa dòng tr tương ứng
            const rowEl = document.querySelector(`tr[data-item-id="${itemId}"]`)
            if(rowEl) rowEl.remove()

            if(data.cartEmpty) location.reload()
            
            updateSummaryPrices(data.totalPrice, data.totalQuantity)
          } else {
            showAlert2('Error', data.message || 'Failed to delete the product!')
          }
        } catch(error) {
          console.log(error)
        }
      })
    })
  }

  // Event Apply Voucher
  const inputVoucher = document.querySelector('#inputVoucher')
  const btnApplyVoucher = document.querySelector('#btnApplyVoucher')
  const cartSubtotalEl = document.querySelector('#cartSubtotal')
  const cartDiscountEl = document.querySelector('#cartDiscount')
  const cartTotalEl = document.querySelector('#cartTotal')

  if(btnApplyVoucher && inputVoucher) {
    btnApplyVoucher.addEventListener('click', async () => {
      // 1. Xử Lý Hủy Voucher (Nếu Nút Ở Trạng Thái Cancel)
      if(btnApplyVoucher.classList.contains('btn-applied')) {
        inputVoucher.value = ''
        inputVoucher.readOnly = false
        btnApplyVoucher.textContent = 'Apply'
        btnApplyVoucher.className = 'btn btn-outline-primary'

        // Khôi Phục Lại Tổng Tiền
        const restoreTotal = parseInt(cartSubtotalEl.getAttribute('data-value'))
        cartDiscountEl.textContent = '0đ'
        cartTotalEl.textContent = formatCurrency(restoreTotal)
        // Fetch API Xóa Cookies
        await fetch('/cart/remove-voucher', { method: 'POST' })
        return
      }

      // 2. Xử Lý Áp Dụng Voucher
      const voucherCode = inputVoucher.value.trim()
      if(!voucherCode) {
        showToast('Please enter the discount code!', 'warning')
        return
      }
      // Gửi API Lên Server
      try {
        btnApplyVoucher.disabled = true

        const response = await fetch('/cart/apply-voucher', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ voucherCode })
        })

        const data = await response.json()
        btnApplyVoucher.disabled = false

        if(data.code === 200) {
          showToast(data.message || 'Voucher applied successfully!')

          // Update Money
          cartDiscountEl.textContent = `-${formatCurrency(data.discountAmount)}`
          cartTotalEl.textContent = formatCurrency(data.totalPrice)

          inputVoucher.readOnly = true
          btnApplyVoucher.textContent = 'Cancel'
          btnApplyVoucher.className = 'btn btn-outline-danger btn-applied'
        } else {
          showAlert2('Error', data.message)
        }
      } catch {
        btnApplyVoucher.disabled = false
        showAlert2('Error Server', 'An error occurred; please try again!')
      }
    })
  }
})

