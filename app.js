const express = require("express"); //importamos o express para um server simples
const stripe = require("stripe")("sk_test_J7Fo4C1r1tficV2FS4Wmblh900WDPZk7Ek");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const nodemailer = require("nodemailer");

const app = express();

// Handlebars Middleware
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set Static Folder
app.use(express.static(`${__dirname}/public`));

// Index Route
app.get("/", (req, res) => {
  res.render("index");
});

// Charge Route
app.post("/charge", (req, res) => {
  console.log(req.body);
  const amount = 1999;
  stripe.customers
    .create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken
    })
    .then(customer =>
      stripe.charges.create({
        amount,
        description: "Vestido de verão",
        currency: "eur",
        customer: customer.id
      })
    )
    .then(charge => res.render("success"));
});

// Email Submit Route

app.post("/send", (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.live.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "emailexemplo@exemplo.com", // generated ethereal user
      pass: "xxxxxx" // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Loja de Roupa" <emailremetente@exemplo.com>', // sender address
    to: "destino@email.com", // list of receivers
    subject: "Mensagem de um utilizador", // Subject line
    text: "Hello world?", // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.render("contact", { msg: "Email has been sent" });
  });
});

app.listen(3000, () => console.log("Server started on port 3000..."));
