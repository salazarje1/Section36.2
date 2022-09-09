process.env.NODE_ENV = "test";

const request = require("supertest"); 
const app = require('../app');
const db = require("../db"); 


let book_example;

beforeEach(async () => {
  let result = await db.query(`
    Insert Into 
      books (isbn, amazon_url, author, language, pages, publisher, title, year)
      Values (
        '12345678910',
        'https://amazon.com/test',
        'Mark Johnson',
        'English', 
        200, 
        'Test Publishers',
        'Sun Light', 
        2020
      )
      Returning isbn
  `)

  book_example = result.rows[0].isbn; 
})

afterEach(async () => {
  await db.query('Delete From books'); 
})

afterAll(async () => {
  await db.end(); 
})

describe("Post /books",() => {
  test("Create new book", async () => {
    const res = await request(app).post(`/books`).send({
      isbn: '098765432110',
      amazon_url: 'https://amazon.com/test2',
      author: 'Test Testing', 
      language: 'English', 
      pages: 300,
      publisher: 'Tester Publisher', 
      title: "Moon Light",
      year: 2000
    })

    expect(res.statusCode).toBe(201);
    expect(res.body.book).toHaveProperty("isbn"); 
  })

  test("Doesnt work without title", async () => {
    const res = await request(app).post(`/books`).send({
      isbn: '0987654345',
      amazon_url: 'https://amazon.com/test3',
      author: 'Test Testing', 
      language: 'English', 
      pages: 300,
      title: "Dark Night",
      year: 2020
    })

    expect(res.statusCode).toBe(400); 
    expect(res.error).toHaveProperty("text"); 
  })
}) 

describe("PUT /books/:id", () => {
  test("Update a single book", async () => {
    const res = await request(app).put(`/books/${book_example}`).send({
      amazon_url: 'https://amazon.com/test',
      author: 'Mark Anything Johnson',
      language: 'English', 
      pages: 200, 
      publisher: 'Test Publishers',
      title: 'Sun Light 2nd Edition', 
      year: 2020
    })

    expect(res.statusCode).toBe(200); 
    expect(res.body.book).toHaveProperty("isbn")
    expect(res.body.book.title).toBe("Sun Light 2nd Edition")
  })

  test("Bad book info", async () => {
    const res = await request(app).put(`/books/${book_example}`).send({
      amazon_url: 'https://amazon.com/test',
      notGood: 'Run this code', 
      author: 'Mark Anything Johnson',
      pages: 200, 
      publisher: 'Test Publishers',
      title: 'Sun Light 2nd Edition', 
      year: 2020
    })
    console.log(res.error); 
    expect(res.statusCode).toBe(400); 
  })
})