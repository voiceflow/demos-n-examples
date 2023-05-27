const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')

const router = require('./src/router')

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(router)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  })
})

module.exports = app
