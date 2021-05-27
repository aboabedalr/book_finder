const express = require("express");
const bodyParser = require("body-parser");
const https = require('follow-redirects').https;

require('dotenv').config();

const app = express();
//var book = {};
var books = [];
var favBooks = [];
const API_KEY = process.env.GOOGLE_API_KEY;
const url = "https://www.googleapis.com/books/v1/volumes?q="
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static('public'))

// get routes 
app.get("/", (req, res) => {
  //res.sendFile(__dirname+"/index.html");
  res.render('home');
  
});
app.get('/favourite',(req,res)=>{
  console.log(favBooks)
  res.render('favourite', {favBooks:favBooks})

})
app.get('/:searchTerm',(req,res)=>{
  const searchTerm = req.params.searchTerm;
  
  //console.log(books)
  res.render('search', {books:books});
})
app.get('/book/:bookId', (req,res)=>{
  const bookId = req.params.bookId.trim();
  //console.log(bookId);
 const book = books.find(book => (
   book.id === bookId
 ))
  //console.log(bookIndex);
  res.render("book",{book:book});

})



// post routes

app.post('/',(req,res)=>{
  books.splice(0,books.length)
  const serachQuery = req.body.query;
  https.get((url+serachQuery), response => {
    response.setEncoding('utf8');
    

    let data = '';

    
    response.on('data', chunk => {
    data += chunk;
      
    });
      //api call 
    response.on('end', ()=>{
      try{
           
        const parsedData = JSON.parse(data);
        for(let i = 0; i < parsedData.items.length;i++){
          let img = parsedData.items[i].volumeInfo.imageLinks == undefined ? '/study.png' : parsedData.items[i].volumeInfo.imageLinks.thumbnail
          
         var book = {
            id:parsedData.items[i].id,
            title:parsedData.items[i].volumeInfo.title,
            auther:parsedData.items[i].volumeInfo.authors,
            thumbNail:  img, 
            description: parsedData.items[i].volumeInfo.description
          }
         
          books.push(book);
          //console.log(books)
        }
        res.redirect('/'+serachQuery)
        
      }catch (e){
        console.log('Error happened here!')
        console.error(e.message);
      }
  })
}).on('error', err => {
  console.error(err);
});
  
  
})

app.post('/book/add',(req,res)=>{
  let book_id = req.body.fav.trim();
  var book = books.find(e => {
    
      return e.id == book_id
  })
  favBooks.push(book)
  res.redirect('/'+book_id)
})

app.post('/remove',(req,res)=>{
  let book_id = req.body.rem.trim()

  favBooks = favBooks.filter(e =>{
    return e.id !== book_id
  })
res.redirect('/favourite')
})



app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
