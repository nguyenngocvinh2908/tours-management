export const getFirstImage = (images: string): string => {
  if (!images) return ''

  try {
    const imageList = JSON.parse(images)
    return imageList[0] || ''
  } catch (error) {
    return ''
  }
}