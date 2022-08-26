const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary");
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
app.use(cors());
let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
  }
  db = client.db("crudapp");
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false })); // post에서 보낸 데이터 req.body로 받을려면 있어야함
app.use(express.static(path.join(__dirname, "/public")));
app.use("/upload", express.static(path.join(__dirname, "/upload")));
app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  // destination: (req, file, done) => {
  //   done(null, path.join(__dirname, "/upload"));
  // },
  // filename: (req, file, done) => {
  //   done(null, file.originalname);
  // },
});

const fileUpload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("index", { title: "우당탕탕 우영우..." });
});
app.get("/insert", (req, res) => {
  res.render("insert", { title: "글쓰기" });
});
app.post("/register", fileUpload.single("image"), (req, res) => {
  console.log(req.file);
  cloudinary.uploader.upload(req.file.path, (result) => {
    const title = req.body.title;
    const bg = req.body.bg;
    const desc = req.body.desc;
    const link = req.body.link;
    const category = req.body.category;
    const image = result.url;
    db.collection("supermario").insertOne({
      title: title,
      bg: bg,
      desc: desc,
      link: link,
      category: category,
      image: image,
    });
    res.send("잘들어갔습니다.");
  });
});
app.get("/mario", (req, res) => {
  db.collection("supermario")
    .find({ category: "mario" })
    .toArray((err, result) => {
      res.json({ items: result });
    });
});
app.get("/monster", (req, res) => {
  db.collection("supermario")
    .find({ category: "monster" })
    .toArray((err, result) => {
      res.json({ items: result });
    });
});
app.get("/all", (req, res) => {
  db.collection("supermario")
    .find()
    .toArray((err, result) => {
      res.json({ items: result });
    });
});

app.listen(PORT, () => {
  console.log(`${PORT}에서 서버대기중`);
});
