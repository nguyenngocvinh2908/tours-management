import { Request, Response } from 'express'
import Tour from '../../models/tour'

// [ GET ] "/tours"
export const index = async (req: Request, res: Response) => {
  const tours = await Tour.findAll({ raw: true })

  res.render('client/pages/tours/index', {
    titlePage: 'Tours Page',
    tours: tours
  })
}