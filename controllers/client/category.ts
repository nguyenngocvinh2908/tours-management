import { Request, Response } from 'express'
import Category from '../../models/category'

// [ GET ] "/category"
export const index = async (req: Request, res: Response) => {
  const categories = await Category.findAll({
    where: {
      deleted: false,
      status: 'active'
    },
    order: [['position', 'ASC']],
    raw: true
  })

  res.render('client/pages/categories/index', {
    titlePage: 'Tours Page',
    categories: categories,
    currentPath: '/categories' 
  })
}