import Voucher from "../models/voucher"
import { Response } from "express"

export const formatVoucherData = async (res: Response, items: any[], appliedVoucherCode: string, totalPrice: number) => {
  let discountAmount = 0
  let validVoucherCode = ''

  if(appliedVoucherCode && items.length > 0) {
    const voucher: any = await Voucher.findOne({
      where: {
        code: appliedVoucherCode,
        status: 1
      }
    })

    const nowDate = new Date()
    const isExpired = voucher.endDate && new Date(voucher.endDate) < nowDate // Xem Hết Hạn Chưa
    const isNotStarted = voucher.startDate && new Date(voucher.startDate) > nowDate // Xem Bắt Đầu Chưa

    if(voucher && voucher.stock > 0 && !isExpired && !isNotStarted && totalPrice >= (voucher.minOrderValue || 0)) {
      validVoucherCode = String(voucher.code)

      if(voucher.discountType === 'percent') {
        discountAmount = Math.round((totalPrice * voucher.discountValue) / 100)
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount
        }
      } else {
        discountAmount = voucher.discountValue
      }
    }
    // Truong Hop Mua Don Hang 0 dd
    if (discountAmount > totalPrice) {
      discountAmount = totalPrice
    }
  } else {
    res.clearCookie('voucher_code')
  }

  const finalTotal = totalPrice - discountAmount

  return {
    validVoucherCode: validVoucherCode,
    discountAmount: discountAmount,
    finalTotal: finalTotal > 0 ? finalTotal : 0
  }
}