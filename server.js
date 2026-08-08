
    
var fileupload=require("express-fileupload");
var express = require("express");
var mysql = require("mysql2");
require("dotenv").config();
var app = express();
app.listen(process.env.PORT || 2005, function () {
    console.log("Server Started");
});

//---------------------------------------------------------------------------------------------
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite"
});


const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
async function ai_fetchdata_aadhar(imgurl)
{
    const myprompt = "Read the text on picture and tell all the information in aadhar card and give output STRICTLY in JSON format {aadhar_number:'',name:'',gender:'',dob:''} and also extract the date in the format which is accepted by sql table for date.Dont give output as string."


    const imageResp = await fetch(imgurl)
        .then(response => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg"
            }
        },
        myprompt
    ]);

    console.log(result.response.text());

    const cleaned = result.response.text()
        .replace(/```json|```/g, "")
        .trim();

    const jsonData = JSON.parse(cleaned);

    return jsonData;
}
async function ai_fetchdata_aadharrear(imgurl)
{
    const myprompt = 
"Read the text on picture and tell all the information in aadhar card and give output STRICTLY in JSON format {aadhar_number:'',name:'',gender:'',dob:''} and also extract the date in the format which is accepted by sql table for date.Dont give output as string."


    const imageResp = await fetch(imgurl)
        .then(response => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg"
            }
        },
        myprompt
    ]);

    console.log(result.response.text());

    const cleaned = result.response.text()
        .replace(/```json|```/g, "")
        .trim();

    const jsonData = JSON.parse(cleaned);

    return jsonData;
}
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));   // POST data read karan layi
app.use(fileupload()); // File Upload karan layi
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
mysqlCon.connect(function (err) {
    if (err == null)
        console.log("Connected Successfully");
    else
        console.log(err.message);
});

app.get("/", function (req, resp) {
    var path = __dirname + "/public/index.html";
    resp.sendFile(path);
});

// Signup Process
app.post("/signup-process", function (req, resp) {
    let email = req.body.txtEmail;
    let pwd = req.body.txtPwd;
    let utype = req.body.utype;
    let dos = new Date().toISOString().slice(0, 10);
    let active = 1;

    mysqlCon.query(
        "insert into userspro values(?,?,?,?,?)",
        [email, pwd, utype, dos, active],
        function (err, result) {
            if (err == null)
                resp.send("Signup Successful!");
            else
                resp.send(err.message);
        }
    );
});

// Check Email Exists (AJAX - on blur)
app.get("/check-email-ajax", function (req, resp) {
    let email = req.query.emailKuch;
    mysqlCon.query("select * from userspro where emailid=?", [email], function (err, resultJSONAry) {
        if (err == null) {
            if (resultJSONAry.length == 1)
                resp.send("Already Occupied");
            else
                resp.send("Available");
        }
        else
            resp.send(err.message);
    });
});
// Login Process
app.post("/do-login", function (req, resp) {

    let email = req.body.txtEmail2;
    let pwd = req.body.txtPwd2;

    mysqlCon.query(
        "SELECT * FROM userspro WHERE emailid=? AND pwd=?",
        [email, pwd],
        function (err, result) {
            console.log("Active Value:", result[0].active);

            if (Number(result[0].active) === 0) {
                resp.send("Your Account is Blocked");
            } else {
                resp.send("Login Successful");
            }


        }
    );

});
//---------------------------------------------------------------------------------------------------------------------------------------
// ===================== AVAIL MEDICINE =====================// ===================== AVAIL MEDICINE =====================
app.post("/avail-medicine", function (req, resp) {

    let email = req.body.txtEmail;
    let medname = req.body.txtMed;
    let expdate = req.body.txtExp;
    let company = req.body.txtCompany;
    let packing = req.body.txtPacking;
    let qty = req.body.txtQty;
    let info = req.body.txtInfo;

    let picurl = "";

    if(req.files && req.files.medPic)
    {
        picurl = "uploads/" + req.files.medPic.name;

        req.files.medPic.mv(
            __dirname + "/public/uploads/" + req.files.medPic.name
        );
    }
 // Donor profile ton city, state, pincode fetch karo
    mysqlCon.query(
        "SELECT city, state, pincode FROM dprofiles WHERE emailid=?",
        [email],
        function(err, data)
        {
            if(err)
            {
                resp.send(err.message);
                return;
            }

            if(data.length==0)
            {
                resp.send("Donor Profile Not Found");
                return;
            }

            let city = data[0].city;
            let state = data[0].state;
            let pincode = data[0].pincode;

            mysqlCon.query(
                "INSERT INTO medicines(emailid,medname,expdate,company,packing,qty,info,picurl,city,state,pincode) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                [email, medname, expdate, company, packing, qty, info, picurl, city, state, pincode],
                function(err, result)
                {
                    if(err)
                        resp.send(err.message);
                    else
                        resp.send("Medicine Added Successfully");
                }
            );
        }
    );

});

  app.post("/save-profile", function (req, resp) {

    let email = req.body.txtEmail;
    let name = req.body.txtName;
    let mobile = req.body.txtMobile;
    let address = req.body.txtAddress;
    let city = req.body.txtCity;

    let acardpath = "";
    let picpath = "";

    if (req.files) {

        if (req.files.aadhaar) {
            acardpath = "uploads/" + req.files.aadhaar.name;
            req.files.aadhaar.mv(__dirname + "/public/uploads/" + req.files.aadhaar.name);
        }

        if (req.files.profile) {
            picpath = "uploads/" + req.files.profile.name;
            req.files.profile.mv(__dirname + "/public/uploads/" + req.files.profile.name);
        }
    }

    mysqlCon.query(
        "INSERT INTO dprofiles(emailid,name,mobile,address,city,acardpath,picpath) VALUES(?,?,?,?,?,?,?)",
        [email, name, mobile, address, city, acardpath, picpath],
        function (err) {

            if (err)
                resp.send(err.message);
            else
                resp.send("Profile Saved Successfully");
        }
    );

});
// ================= GET PROFILE =================

app.get("/get-profile", function (req, resp) {

    let email = req.query.email;

    mysqlCon.query(
        "select * from dprofiles where emailid=?",
        [email],
        function (err, result) {

            if (err)
                resp.send(err.message);

            else if (result.length == 0)
                resp.send("Not Found");

            else
                resp.json(result[0]);

        }
    );

});


// ================= UPDATE PROFILE =================

app.post("/update-profile", function (req, resp) {

    let email = req.body.txtEmail;
    let name = req.body.txtName;
    let mobile = req.body.txtMobile;
    let address = req.body.txtAddress;
    let city = req.body.txtCity;

    let acardpath = req.body.hdnAadhar || "";
    let picpath = req.body.hdnProfile || "";

    if (req.files) {

        if (req.files.aadhaar) {
            acardpath = "uploads/" + req.files.aadhaar.name;
            req.files.aadhaar.mv(__dirname + "/public/uploads/" + req.files.aadhaar.name);
        }

        if (req.files.profile) {
            picpath = "uploads/" + req.files.profile.name;
            req.files.profile.mv(__dirname + "/public/uploads/" + req.files.profile.name);
        }

    }

    mysqlCon.query(
        "update dprofiles set name=?,mobile=?,address=?,city=?,acardpath=?,picpath=? where emailid=?",
        [name, mobile, address, city, acardpath, picpath, email],
        function (err, result) {

            if (err)
                resp.send(err.message);
            else
                resp.send("Profile Updated Successfully");

        }
    );

});
//--------------------------------------------------------avail equipments

app.post("/avail-equip", function(req, resp){

    let email = req.body.email;
    let equipment = req.body.equipment;
    let condition = req.body.condition;
    let type = req.body.type;
    let amount = req.body.amount;
    let info = req.body.info;

    let pic1url = "";
    let pic2url = "";

    if(req.files)
    {
        if(req.files.pic1)
        {
            pic1url = "uploads/" + req.files.pic1.name;
            req.files.pic1.mv(__dirname + "/public/" + pic1url);
        }

        if(req.files.pic2)
        {
            pic2url = "uploads/" + req.files.pic2.name;
            req.files.pic2.mv(__dirname + "/public/" + pic2url);
        }
    }

    mysqlCon.query(
        "INSERT INTO equipments(emailid,equipment,condition,type,amount,pic1url,pic2url,info) VALUES(?,?,?,?,?,?,?,?)",
        [email, equipment, condition, type, amount, pic1url, pic2url, info],
        function(err)
        {
            if(err)
                resp.send(err.message);
            else
                resp.send("Equipment Added Successfully");
        }
    );

});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//---------------------------------------------------------angular js code------------------------------
app.get("/fetch-all-users", function(req, resp){

    mysqlCon.query("SELECT * FROM userspro", function(err, result){

        if(err)
            resp.send(err);

        else
            resp.send(result);

    });

});
//block user
app.get("/block-user", function(req, resp){

    let email = req.query.email;

    mysqlCon.query(
        "UPDATE userspro SET active=0 WHERE emailid=?",
        [email],
        function(err){

            if(err)
                resp.send(err);

            else
                resp.send("User Blocked Successfully");

        });

});

// ================ DELETE USER =================
app.get("/delete-user", function(req, resp){

    let email = req.query.email;

    mysqlCon.query(
        "DELETE FROM userspro WHERE emailid=?",
        [email],
        function(err){

            if(err)
                resp.send(err);

            else
                resp.send("User Deleted Successfully");

        });

});

//using anjular js this is for fetch all donars
app.get("/fetch-all-donors", function (req, resp) {

    mysqlCon.query("SELECT * FROM dprofiles", function (err, result) {

        if (err)
            resp.send(err);

        else
            resp.send(result);

    });

});
//-------------
// ================= MEDICINE MANAGER =================

// Fetch medicines by email

app.get("/fetch-medicines", function(req, resp)
{
    let email = req.query.email;

    mysqlCon.query(
        "select rid,medname,expdate,packing,qty from medicines where emailid=?",
        [email],
        function(err,result)
        {
            if(err)
                resp.send(err);
            else
                resp.send(result);
        }
    );
});

// Delete medicine by RID

app.get("/delete-medicine", function(req, resp)
{
    let rid=req.query.rid;

    mysqlCon.query(
        "delete from medicines where rid=?",
        [rid],
        function(err,result)
        {
            if(err)
                resp.send(err);

            else
            {
                if(result.affectedRows==1)
                    resp.send("Medicine Deleted Successfully");
                else
                    resp.send("Invalid RID");
            }
        }
    );
});


// ================= SETTINGS =================

// Update Password

app.post("/update-password", function(req,resp)
{
    let email=req.body.email;
    let oldpwd=req.body.oldpwd;
    let newpwd=req.body.newpwd;

    mysqlCon.query(
        "select * from userspro where emailid=? and pwd=?",
        [email,oldpwd],
        function(err,result)
        {
            if(err)
            {
                resp.send(err.message);
            }
            else if(result.length==0)
            {
                resp.send("Existing Password Incorrect");
            }
            else
            {
                mysqlCon.query(
                    "update userspro set pwd=? where emailid=?",
                    [newpwd,email],
                    function(err2,result2)
                    {
                        if(err2)
                            resp.send(err2.message);
                        else
                            resp.send("Password Updated Successfully");
                    }
                );
            }
        }
    );
});

// ================= FETCH EQUIPMENTS =================

app.get("/fetch-equipments", function(req, resp)
{
    let email = req.query.email;

    mysqlCon.query(
        "select * from equipments where emailid=?",
        [email],
        function(err,result)
        {
            if(err)
                resp.send(err);
            else
                resp.send(result);
        }
    );
});

// ================= DELETE EQUIPMENT =================

app.get("/delete-equipment", function(req, resp)
{
    let rid = req.query.rid;

    mysqlCon.query(
        "delete from equipments where rid=?",
        [rid],
        function(err,result)
        {
            if(err)
                resp.send(err.message);

            else if(result.affectedRows==1)
                resp.send("Equipment Deleted Successfully");

            else
                resp.send("Invalid RID");
        }
    );
});
// equipmwnt finder 
app.get("/search-equipment", function(req,res){

    let city = req.query.city;
    let type = req.query.type;

    let sql = `
    SELECT equipments.*, dprofiles.mobile
    FROM equipments
    INNER JOIN dprofiles
    ON equipments.emailid = dprofiles.emailid
    WHERE dprofiles.city=? AND equipments.type=?`;

    mysqlCon.query(sql,[city,type],function(err,result){

        if(err)
            res.send(err.message);
        else
            res.json(result);

    });

});

//---------------all medicines.html page fetch 
// ================= FETCH ALL MEDICINES =================
app.get("/fetch-med",function(req,resp){
    let city=req.query.city;
     mysqlCon.query("select distinct medicines.medname from medicines m inner join dprofiles d on m.emailid=d.emailid where d.city=?",[city],function(err,resultJSONAry) {
        if(err==null)
              {
                console.log(resultJSONAry)
                resp.send(            )
                
              }
        else
                resp.send(err.message);
    })
})

// ================= DELETE MEDICINE =================

app.get("/delete-medicine-admin", function (req, resp) {

    let rid = req.query.rid;

    mysqlCon.query(
        "DELETE FROM medicines WHERE rid=?",
        [rid],
        function (err, result) {

            if (err)
                resp.send(err.message);

            else if (result.affectedRows == 1)
                resp.send("Medicine Deleted Successfully");

            else
                resp.send("Invalid Record");

        });

});
// ================= SEARCH MEDICINE =================

app.get("/search-medicine", function (req, resp) {

    let med = "%" + req.query.med + "%";

    mysqlCon.query(
        "SELECT * FROM medicines WHERE medname LIKE ?",
        [med],
        function (err, result) {

            if (err)
                resp.send(err.message);

            else
                resp.send(result);

        });

});
// ================= TOTAL MEDICINES =================

app.get("/total-medicines", function (req, resp) {

    mysqlCon.query(
        "SELECT COUNT(*) AS total FROM medicines",
        function (err, result) {

            if (err)
                resp.send(err.message);

            else
                resp.send(result);

        });

});
//-------------------------------------------------------------get cities 
app.get("/get-cities", function(req,res){

    mysqlCon.query(
        "SELECT DISTINCT city FROM dprofiles",
        function(err,result){
            if(err)
                res.send(err);
            else
                res.json(result);
        }
    );

});
//------========================================================for medicines
app.get("/get-medicines", function(req,res){

    let city=req.query.city;

    mysqlCon.query(
        `SELECT DISTINCT medname
         FROM medicines
         INNER JOIN dprofiles
         ON medicines.emailid=dprofiles.emailid
         WHERE city=?`,
        [city],
        function(err,result){

            if(err)
                res.send(err);
            else
                res.json(result);

        });

});
//================================we can find medicines

 app.get("/find-medicines", function(req,res){

    let city = req.query.city;
    let med = req.query.med;

    mysqlCon.query(

`SELECT
medicines.*,
dprofiles.emailid,
dprofiles.name,
dprofiles.mobile,
dprofiles.address,
dprofiles.city,
dprofiles.picpath
FROM medicines
INNER JOIN dprofiles
ON medicines.emailid=dprofiles.emailid
WHERE dprofiles.city=? AND medicines.medname=?`,

    [city,med],

    function(err,result){

        if(err)
            res.send(err.message);
        else
            res.json(result);

    });

});
// 20 july 
// ================= NGO REGISTRATION =================

app.post("/ngo-register", function(req, resp){

    let emailid = req.body.emailid;
    let ngo = req.body.ngo;
    let regoffice = req.body.regoffice;
    let city = req.body.city;
    let website = req.body.website;
    let contactno = req.body.contactno;
    let since = req.body.since;
    let chairperson = req.body.chairperson;
    let ngoworks = req.body.ngoworks;
    let regnumber = req.body.regnumber;

    let picurl = "";

    if(req.files && req.files.pic)
    {
        picurl = "uploads/" + req.files.pic.name;

        req.files.pic.mv(
            __dirname + "/public/uploads/" + req.files.pic.name
        );
    }

    mysqlCon.query(
        "INSERT INTO ngos(emailid,ngo,regoffice,city,website,contactno,since,chairperson,ngoworks,regnumber,picurl) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        [emailid, ngo, regoffice, city, website, contactno, since, chairperson, ngoworks, regnumber, picurl],
        function(err)
        {
            if(err)
                resp.send(err.message);
            else
                resp.send("NGO Registered Successfully");
        }
    );

});
//second part
// get cities
app.get("/get-ngo-cities", function(req,res){

    mysqlCon.query(
        "SELECT DISTINCT city FROM ngos",
        function(err,result){

            if(err)
                res.send(err.message);
            else
                res.json(result);

        });

});
//find ngos
app.get("/find-ngos", function(req,res){

    let city=req.query.city;

    mysqlCon.query(
        "SELECT * FROM ngos WHERE city=?",
        [city],
        function(err,result){

            if(err)
                res.send(err.message);
            else
                res.json(result);

        });

});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\needy

app.post("/ai-read-pic",async function(req,resp){

let frontUrl="";
let rearUrl="";

let frontData={};
let rearData={};

try{

if(req.files && req.files.apicf){

let file=req.files.apicf;


let path = __dirname + "/public/uploads/" + file.name;
await file.mv(path);
let upload=await cloudinary.uploader.upload(path);

frontUrl=upload.secure_url;

frontData=await ai_fetchdata_aadhar(frontUrl);

}

if(req.files && req.files.apicr){

let file=req.files.apicr;

let path = __dirname + "/public/uploads/" + file.name;

await file.mv(path);

let upload=await cloudinary.uploader.upload(path);

rearUrl=upload.secure_url;

rearData=await ai_fetchdata_aadharrear(rearUrl);

}

let email=req.body.txtEmail;
let mobile=req.body.mobile;

mysqlCon.query(

"insert into needys values(?,?,?,?,?,?,?,?,?)",

[
email,
mobile,

frontUrl,
rearUrl,

frontData.name,
frontData.aadhar_number,
rearData.address,
frontData.gender,
frontData.dob
],

function(err){

if(err)
resp.send(err.message);

else
resp.send("Needy Registered Successfully");

});

}
catch(err){

resp.send(err.message);

}

});
//===================== NGO DASHBOARD =====================

// NGO Dashboard
app.get("/dash-ngo.html", function(req, res) {
    res.sendFile(__dirname + "/public/dash-ngo.html");
});

// NGO Registration Page
app.get("/ngo-registration.html", function(req, res) {
    res.sendFile(__dirname + "/public/ngo-registration.html");
});

// Medicine Finder Page
app.get("/ngo-finder.html", function(req, res) {
    res.sendFile(__dirname + "/public/ngo-finder.html");
});

// Equipment Finder Page
app.get("/equip-finder.html", function(req, res) {
    res.sendFile(__dirname + "/public/equip-finder.html");
});


//===================== SAVE NGO PROFILE =====================

app.post("/save-ngo-profile", function(req, res) {

    let data = [

        req.body.emailid,
        req.body.orgname,
        req.body.regno,
        req.body.ownername,
        req.body.mobile,
        req.body.address,
        req.body.city,
        req.body.website,
        req.body.info

    ];

    mysqlCon.query(

        "insert into ngo(emailid,orgname,regno,ownername,mobile,address,city,website,info) values(?,?,?,?,?,?,?,?,?)",

        data,

        function(err, result){

            if(err)
                res.send(err);
            else
                res.send("NGO Profile Saved Successfully");

        });

});


//===================== GET NGO PROFILE =====================

app.get("/get-ngo-profile", function(req, res){

    let email = req.query.email;

    mysqlCon.query(

        "select * from ngos where emailid=?",

        [email],

        function(err, result){

            if(err)
                res.send(err);
            else
                res.json(result);

        });

});


//===================== UPDATE NGO PROFILE =====================

app.post("/update-ngo-profile", function(req, res){

    let data = [

        req.body.orgname,
        req.body.regno,
        req.body.ownername,
        req.body.mobile,
        req.body.address,
        req.body.city,
        req.body.website,
        req.body.info,
        req.body.emailid

    ];

    mysqlCon.query(

        "update ngo set orgname=?, regno=?, ownername=?, mobile=?, address=?, city=?, website=?, info=? where emailid=?",

        data,

        function(err, result){

            if(err)
                res.send(err);
            else
                res.send("NGO Profile Updated Successfully");

        });

});
