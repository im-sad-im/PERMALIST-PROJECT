import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import "dotenv/config";

const app = express();
const port = 3000;


//Connect to PostgreSQL database
const db = new pg.Client({
  user: process.env.DATABASE_USERNAME,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});
db.connect();

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

//Fn to retrieve all items
async function getItems() {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  items = result.rows;
  return items;
}

//Route to get home page
app.get("/", async (req, res) => {
  const getItem = await getItems();

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});


//Route to add item
app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1);", [item]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

//Route to edit item
app.post("/edit", async (req, res) => {
  const updatedItemTitle = req.body.updatedItemTitle;
  const updatedItemId = req.body.updatedItemId;
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [
      updatedItemTitle,
      updatedItemId,
    ]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

//Route to delete item
app.post("/delete", async (req, res) => {
  const itemId = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [itemId]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


//Start server on port 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
