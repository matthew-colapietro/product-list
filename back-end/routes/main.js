const router = require('express').Router()
const faker = require('faker')
const { Product } = require('../models/product')
const { Review } = require('../models/product')

//***COMMENTING OUT FAKE DATA REQUEST TO PREVENT ACCIDENTAL REGENERATION OF FAKE DATA***
// router.get('/generate-fake-data', (req, res, next) => {
//   for (let i = 0; i < 90; i++) {
//     let product = new Product()

//     product.category = faker.commerce.department()
//     product.name = faker.commerce.productName()
//     product.price = faker.commerce.price()
//     product.image = 'https://www.oysterdiving.com/components/com_easyblog/themes/wireframe/images/placeholder-image.png'

//     product.save((err) => {
//       if (err) throw err
//     })
//   }
//   res.end()
// })

router.get('/products', (req, res, next) => {
  //variables for Product search parameter setup
  let sortBy = {}
  let categories = {}
  let query = {}

  //Applying to the categories variable the value in the request query
  //for use in Product.find() 
  if (req.query.category) {
    categories = {category: req.query.category}
  }

  //Applying to the query variable the value in the request query
  //for use in Product.find() 
  if (req.query.query) {
    query = {"name": { "$regex": req.query.query, "$options": "i"} }
  }
  
  //Applying to the sortBy variable the value in the request query
  //for use in Product.sort()
  if (req.query.sort) {
    
    if (req.query.sort === 'highest') {
      sortBy = {price: 'descending'}
    } else if (req.query.sort === 'lowest') {
      sortBy = {price: 'ascending'}
    }
    
  }

  const perPage = 9

  // return the first page by default
  const page = req.query.page || 1
  
  Product
    //chaining find to allow search/filter of categories and product names
    .find(categories)
    .find(query)
    .sort(sortBy)
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec((err, products) => {
      // Sending count of categories router call back with list of products
  Product.find(categories).find(query).count().exec((err, count) => {
        if (err) return next(err)

        res.send({products, count})
      })
    })
})

router.get('/products/:product', (req, res, next) => {
  //retrieving product id from request and assigning to variable
  let productId = req.params.product
  
  //send back error if no product is located
  if(!productId) {
    response.writeHead(404, "Unable to find product");
    return response.end();
  }
  
  Product.findById({ _id: productId }, (err, result) => {
    if (err) {
      return console.error(err);
    }
    console.log(result);
    //send back product by productId
    return res.send(result)
  });
  
});

router.get('/products/:product/reviews', (req, res, next) => {

  let productId = req.params.product
  
  //Search database for productId from parameter
  Product.findById({ _id: productId }, (err, result) => {
    if (err) {
      return console.error(err);
    }
    console.log(result);
    //send back review array from found productId
    return res.send(result.reviews)
  });
  
});

router.post('/products/', (req, res, next) => {
  //send back error if all product info is not completed
  if (!req.body.category || !req.body.name || !req.body.price || !req.body.image) {
    res.writeHead(404, "Not enough product information");
    return res.end();
  }
  
  let product = new Product()

  product.category = req.body.category
  product.name = req.body.name
  product.price = req.body.price
  product.image = req.body.image

  product.save((err) => {
    if (err) throw err
  })

  res.send(`Added New Product named: ${product.name}`)
});

router.post('/products/:product/reviews', (req, res, next) => {
  
  //Hold data for new review in variables
  let productId = req.params.product
  let reviewUserName = req.body.username
  let reviewText = req.body.text

  //send back error if all review fields are not entered
  if (!reviewUserName || !reviewText) {
    res.writeHead(404, "Not enough review information. Ensure Username and text is entered");
    return res.end();
  }

  //Create new review
  let review = new Review({
    userName: reviewUserName,
    text: reviewText,
  });

  Product.findById({ _id: productId }, (err, result) => {
    if (err) {
      return console.error(err);
    }
    console.log(result)
    result.reviews.push(review)
    //save review to specific productId
    result.save(() => {
      //Send back review that was added
      return res.send(review)
    })
  });
  
});

router.delete('/products/:product', (req, res, next) => {
  let productId = req.params.product

  Product.findByIdAndDelete({ _id: productId }, (err, result) =>{
    if (err) {
      return console.error(err)
    }
    console.log(result)
    //Returning the product that was deleted
    return res.send(result)
  });

});

//======NOT WORKING=======
router.delete('/reviews/:review', (req, res, next) => {
  let reviewId = req.params.review

  Review.findByIdAndDelete({ _id: reviewId }, (err, result) =>{
    if (err) {
      return console.error(err)
    }
    console.log(result)
    //Returning the review that was deleted
    return res.send(result)
  });

});


module.exports = router