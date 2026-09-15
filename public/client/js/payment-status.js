document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#orderContainer')
  if(!container) return

  const orderCode = container.dataset.orderCode
  const expireAtStr = container.dataset.expireAt
  let paymentStatus = container.dataset.paymentStatus

  const timerElement = document.querySelector('#countdownTimer')
  const qrSection = document.querySelector('#qrSection')
  const statusTitle = document.querySelector('#statusTitle')

  if(paymentStatus === 'paid' || !expireAtStr) return

  const expireTime = new Date(expireAtStr).getTime()

  // Helper render trạng thái hết hạn
  const renderExpiredUI = () => {
    if (timerContainer) timerContainer.remove()
    if (qrSection) qrSection.remove()

    if (statusTitle) {
      const pendingState = document.querySelector('#pendingState')
      if (pendingState) {
        pendingState.innerHTML = `
          <div class="icon-wrapper bg-danger-subtle text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
            <i class="fa-solid fa-xmark fs-1"></i>
          </div>
          <h3 class="fw-bold text-dark">Order Expired</h3>
          <p class="text-muted">Payment window has closed. Please place a new booking.</p>
        `
      }
    }
  }

  // Helper render trạng thái thành công
  const renderSuccessUI = () => {
    const pendingState = document.querySelector('#pendingState')
    if (pendingState) {
      pendingState.innerHTML = `
        <div class="icon-wrapper bg-success-subtle text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
          <i class="fa-solid fa-check fs-1"></i>
        </div>
        <h3 class="fw-bold text-dark">Payment Successful!</h3>
        <p class="text-muted">Your booking <strong class="text-primary">#${orderCode}</strong> has been confirmed.</p>
      `
    }
  }

  // 1. Xử Lý Đồng Hồ Đếm Ngược
  const timerInterval = setInterval(() => {
    const now = new Date().getTime()
    const distance = expireTime - now

    if(distance <= 0) {
      clearInterval(timerInterval)
      if (timerElement) {
        timerElement.textContent = '00:00'
      }
      return
    }

    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    const formattedMin = minutes < 10 ? `0${minutes}` : minutes
    const formattedSec = seconds < 10 ? `0${seconds}` : seconds

    if (timerElement) {
      timerElement.textContent = `${formattedMin}:${formattedSec}`
    }
  }, 1000)

  // 2. Polling Kiểm Tra Trạng Thái Thanh Toán Tự Động Mỗi 2s
  const pollingInterval = setInterval(async () => {
    try {
      const response = await fetch(`/checkout/check-status/${orderCode}`)
      const data = await response.json()

      if(data.code === 200 && data.paymentStatus === 'paid') {
        clearInterval(timerInterval)
        clearInterval(pollingInterval)
        renderSuccessUI()
      } else if(data.isExpired) {
        clearInterval(timerInterval)
        clearInterval(pollingInterval)
        renderExpiredUI()
      }
    } catch {
    }
  }, 3000)
})
