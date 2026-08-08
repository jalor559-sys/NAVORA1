var express = require("express");
var mysql = require("mysql2");
require("dotenv").config();

var app = express();

app.listen(2005, function () {
    console.log("Server Started");
});

app.use(express.static("public"));

app.use(express.urlencoded({extended: true}));   // POST data read karan layi

let mysqlCon = mysql.createConnection({
    host: "mysql-6b316b-manvirsidhu855-a889.l.aivencloud.com",
    port:20316 ,
    user: "avnadmin",
    password:"AVNS_ukpXguCnXWjU1hzhEKK",
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: false
    }
});
mysqlCon.connect(function(err){
    if(err==null)
        console.log("Connected Successfully");
    else
        console.log(err.message);
});

app.get("/", function(req, resp){
    var path = __dirname + "/public/index.html";
    resp.sendFile(path);
});

// Signup Process
app.post("/signup-process", function(req, resp){
    let email = req.body.txtEmail;
    let pwd = req.body.txtPwd;
    let utype = req.body.utype;
    let dos = new Date().toISOString().slice(0,10);
    let active = 1;

    mysqlCon.query(
        "insert into userspro values(?,?,?,?,?)",
        [email, pwd, utype, dos, active],
        function(err, result){
            if(err == null)
                resp.send("Signup Successful!");
            else
                resp.send(err.message);
        }
    );
});

// Check Email Exists (AJAX - on blur)
app.get("/check-email-ajax", function(req, resp){
    let email = req.query.emailKuch;
    mysqlCon.query("select * from userspro where emailid=?", [email], function(err, resultJSONAry) {
        if(err == null){
            if(resultJSONAry.length == 1)
                resp.send("Already Occupied");
            else
                resp.send("Available");
        }
        else
            resp.send(err.message);
    });
});

// Login Process
app.post("/do-login", function(req, resp){
    let email = req.body.txtEmail2;
    let pwd = req.body.txtPwd2;

    mysqlCon.query(
        "select * from userspro where emailid=? and pwd=?",
        [email, pwd],
        function(err, result){
            if(err == null){
                if(result.length == 1)
                    resp.send("Login Successful!");
                else
                    resp.send("Invalid Email or Password");
            }
            else
                resp.send(err.message);
        }
    );
});