const express = require('express')
const Sequelize = require('sequelize')
const bodyParser = require('body-parser')
const productsRouter = require('./products/router')

const app = express()

app.use(productsRouter)

var sequelize = new Sequelize('postgres://postgres:secret@localhost:5432/postgres')

const Product = sequelize.define('product', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  image: Sequelize.STRING
}, {
  tableName: 'products',
  timestamps: false
})

app.listen(4001, () => {
  console.log('Express API listening on port 4001')
})

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
  next()
})

app.use(bodyParser.json())

app.get('/products', (req, res) => {
  Product.findAll({
    attributes: ['id', 'name', 'price']
  })
    .then(result => {
      res.json(result)
    })
    .catch(err => {
      res.status(500)
      res.json({message: 'Something went wrong'})
    })
})

app.get('/products/:id', (req, res) => {
  Product.findById(req.params.id)
    .then(result => {
      if (result) {
        res.json(result)
      } else {
        res.status(404)
        res.json({ message: 'Not Found' })
      }
    })
    .catch(err => {
      res.status(500)
      res.json({ message: 'There was an error' })
    })
})

app.post('/products', (req, res) => {
  const product = req.body

  Product.create(product)
    .then(entity => {
      res.status(201)
      res.json(entity)
    })
    .catch(err => {
      res.status(422)
      res.json({ message: err.message })
    })
})

const updateOrPatch = (req, res) => {
  const productId = Number(req.params.id)
  const updates = req.body

  Product.findById(req.params.id)
    .then(entity => {
      return entity.update(updates)
    })
    .then(final => {
      res.json(final)
    })
    .catch(error => {
      res.status(500).send({
        message: `Something went wrong`,
        error
      })
    })
}

app.put('/products/:id', updateOrPatch)
app.patch('/products/:id', updateOrPatch)

app.delete('/products/:id', (req, res) => {
  Product.findById(req.params.id)
    .then(entity => {
      return entity.destroy()
    })
    .then(_ => {
      res.send({
        message: 'The product was deleted succesfully'
      })
    })
    .catch(error => {
      res.status(500).send({
        message: `Something went wrong`,
        error
      })
    })
})
