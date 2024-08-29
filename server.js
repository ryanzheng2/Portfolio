// importing: using "type": "module"
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import favicon from "serve-favicon";
import path from "path";
import fetch from "node-fetch";


// configuring and initializing libraries
dotenv.config();
const app = express();


// constant variables
// const PORT = process.env.PORT_NUM;
const PORT = 440;
const __dirname = path.resolve();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
});

// middleware
app.use(express.static("public"));
app.use("/node_modules", express.static("node_modules"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log(req.ip + "-->"+ req.url);
    next();
});
app.use(favicon(path.join(__dirname, "public", "favicon", "favicon.ico")));

// endpoints
app.get("/portfolio", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "htmls", "portfolio.html"));
})

app.post("/portfolio/contact-me", async (req, res) => {
    let call = await
        fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAP_SECRET_KEY}&response=${req.body["g-recaptcha-response"]}`);
    let json = await call.json();
    if(json["success"]){
        var mailOptions = {
            from: req.body.email, //doesn't do anything
            to: process.env.EMAIL_USER,
            subject: req.body.name+":"+req.body.email,
            text: req.body.comment
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('[Server] Email sent: ' + info.response);
            }
          });
        res.json({message: "email sent successful"})
    }else{
        res.json({message: "email send failure"});
    }
})

// starting server
app.listen(PORT, ()=>{
    console.log(`[Server] listening on port ${PORT}`);
});

// closing server
process.on('SIGINT', async () => {
    console.log("[Server] closing");
    process.exit(0);
});

