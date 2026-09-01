import { Request, Response } from 'express'
import Tour from '../../models/tour'
import sequelize from '../../config/database'
import { QueryTypes } from 'sequelize'
import { slugToTitle } from '../../helpers/slugToTitle'
import { getFirstImage } from '../../helpers/handleImageTour'

const LIMIT_ITEM = 6

// [ GET ] "/tours"
export const index = async (req: Request, res: Response) => {
  // Pavigation
  const page = parseInt(req.query.page as string) || 1
  const skip = (page - 1) * LIMIT_ITEM
  // Count total tours
  const totalTours = await Tour.count({
    where: {
      deleted: false,
      status: "active"
    }
  })

  const totalPages = Math.ceil(totalTours / LIMIT_ITEM)

  const tours = await Tour.findAll({
    where: {
      deleted: false,
      status: "active"
    },
    attributes: {
      include: [
        [
          sequelize.literal("ROUND(price * (1 - discount / 100), 0)"),
          "price_special"
        ]
      ]
    },
    raw: true,
    limit: LIMIT_ITEM,
    offset: skip,
  })

  // Chuẩn hóa dữ liệu image trước khi truyền sang Pug View
  tours.forEach((item: any) => {
    item.image = getFirstImage(item.images)
    item.price_special = parseInt(item.price_special)
  })


  res.render('client/pages/tours/index', {
    titlePage: 'Tours Page',
    currentPath:'/tours',
    tours: tours,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      baseUrl: '/tours'
    }
  })
}

// [ GET ] "/tours/:slugCategory"
export const toursOfCategory = async (req: Request, res: Response) => {
  const slugCategory = String(req.params.slugCategory)

  // Chống SQL Injection bằng replacements
  const tours = await sequelize.query(`
    SELECT 
      tours.*, 
      ROUND(tours.price * (1 - tours.discount/100), 0) AS price_special
    FROM tours
    JOIN tours_categories ON tours.id = tours_categories.tour_id
    JOIN categories ON categories.id = tours_categories.category_id
    WHERE
      categories.slug = :slugCategory
      AND categories.deleted = false
      AND categories.status = 'active'
      AND tours.deleted = false
      AND tours.status = 'active'
  `, {
    replacements: { slugCategory },
    type: QueryTypes.SELECT
  })

  // Chuẩn hóa dữ liệu image, price trước khi truyền sang Pug View
  tours.forEach((item: any) => {
    item.image = getFirstImage(item.images)
    item.price_special = parseInt(item.price_special)
  })

  // Lấy Title Category
  const titleCategory = slugToTitle(slugCategory)
  
  res.render('client/pages/tours/index', {
    titlePage: `The List ${titleCategory}`,
    tours: tours
  })
}
