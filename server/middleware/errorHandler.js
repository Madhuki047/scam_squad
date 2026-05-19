// Central error handler. Any error passed to next() in a route or
// controller ends up here, so failures return a consistent JSON response.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err)
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server.',
  })
}

export default errorHandler
