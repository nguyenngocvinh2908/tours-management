// 1. Toast Alert Success Error Corce Display
const showToast = (title, icon= 'success', timer= 1500) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: icon,
    title: title,
    showConfirmButton: false,
    timer: timer
  })
}

// 2. Alert Modal Error
const showAlert2 = (title, text, icon = "error") => {
  return Swal.fire({
    icon: icon,
    title: title,
    text: text,
    confirmButtonColor: '#0d6efd'
  })
}

// 3. Confirm Modal hỏi người dùng trước khi thực hiện hành động
const showConfirm = async (title, text, confirmText = 'Yes', cancelText = 'Cancel') => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  });

  return result.isConfirmed
}