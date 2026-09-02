import { Request, Response } from 'express'
import sequelize from '../../config/database'
import QueryTypes from 'sequelize/lib/query-types'
import { getFirstImage } from '../../helpers/handleImageTour'

const LIMIT_ITEM = 6

// [ GET ] /search/:type
export const index = async (req: Request, res: Response) => {
  const { type } = req.params
  const rawKeyword = req.query.keyword
  const keyword = typeof rawKeyword === 'string' ? rawKeyword.trim() : ''

  if(type === 'result') {
    if(!keyword) {
      return res.redirect('/tours')
    }
    const page = parseInt(req.query.page as string) || 1
    const skip = (page - 1) * LIMIT_ITEM

    // Count total records Search
    const countRecordsKeyword: any = await sequelize.query(
      `
        SELECT COUNT(*) as total 
        FROM tours 
        WHERE 
          title LIKE :keyword
          AND deleted = false
          AND status = 'active'

      `, {
        replacements: { keyword: `%${keyword}%` },
        type: QueryTypes.SELECT
    })

    const totalRecords = countRecordsKeyword[0].total as number || 0
    const totalPages = Math.ceil(totalRecords / LIMIT_ITEM)

    // Query Search Tours
    const searchTours: any = await sequelize.query(
      `
        SELECT tours.*, 
        ROUND(tours.price * (1 - tours.discount/100), 0) AS price_special
        FROM tours
        WHERE
          tours.title LIKE :keyword
          AND tours.deleted = false
          AND tours.status = 'active'
        LIMIT :limit OFFSET :offset
      `, {
        replacements: { keyword: `%${keyword}%`, limit: LIMIT_ITEM, offset: skip },
        type: QueryTypes.SELECT
      }
    )

    searchTours.forEach((item: any) => {
      item.image = getFirstImage(item.images)
      item.price_special = parseInt(item.price_special)
    })

    return res.render('client/pages/tours/index', {
      titlePage: `Search results for "${keyword}"`,
      currentPath: '/tours',
      keyword: keyword,
      tours: searchTours,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        baseUrl: `/search/result?keyword=${keyword}`,
        market: true
      }
    })
  }

  if(type === 'suggest') {
    if(!keyword) {
      return res.json({
        code: 200,
        tourRecords: []
      })
    }
    const toursSuggest = await sequelize.query(
      `
        SELECT 
          id, title, slug, images, price, discount,
          ROUND(price * (1 - discount/100), 0) AS price_special
        FROM tours
        WHERE
          title LIKE :keyword
          AND deleted = false
          AND status = 'active'
      `, 
      {
        replacements: { keyword: `%${keyword}%` },
        type: QueryTypes.SELECT
      }
    )

    toursSuggest.forEach((item: any) => {
      item.image = getFirstImage(item.images)
      item.price_special = parseInt(item.price_special)
    })

    return res.json({
      code: 200,
      message: "Successful",
      tourRecords: toursSuggest
    })

  }

}