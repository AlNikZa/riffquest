import listRoutes from 'express-list-routes';

export const getAllRoutesListController = (req, res) => {
  const routes = listRoutes(req.app, { logger: false });
  res.status(200).json(routes);
};
