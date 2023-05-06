import express from "express";
import bcrypt from "bcrypt";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, setDoc, getDoc, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnuzPiog24esXZcpqKaKcxROoSGaWGj4Q",
  authDomain: "home-decor-express-website.firebaseapp.com",
  projectId: "home-decor-express-website",
  storageBucket: "home-decor-express-website.appspot.com",
  messagingSenderId: "888824209888",
  appId: "1:888824209888:web:cce6cf5bec958bb29f0b85"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore();

// init server
const app = express();

// middlewares
app.use(express.static("public"));
app.use(express.json()) // enables form sharing

// aws
import aws from "aws-sdk";
import "dotenv/config"; 

// aws setup
const region = "ap-south-1";
const bucketName = "ecom-website-4";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

aws.config.update({
    region,
    accessKeyId,
    secretAccessKey
})

// init s3
const s3 = new aws.S3();

// generate image url
async function generateURL(){
    let date = new Date();

    const imageName = `${date.getTime()}.jpeg`;

    const params = {
        Bucket: bucketName,
        Key: imageName,
        Expires: 300, // 300 ms
        ContentType: "image/jpeg"
    }

    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    return uploadURL;
}

app.get('/s3url', (req, res) => {
    generateURL().then(url => res.json(url));
})

// routes
// home route
app.get('/', (req, res) => {
    res.sendFile("index.html",{ root : "public"})
})

// signup
app.get('/signup', (req, res) => {
    res.sendFile("signup.html", {root : "public"})
})
   
app.post('/signup', (req, res) =>{
    const { name, email, password, number, tac} = req.body;

    // form validations
    if(name.length < 3){
        res.json({ 'alert' :'name must be 3 letters long'});
    } else if(!email.length){
        res.json({ 'alert' :'enter your email'});
    } else if(password.length < 8){
        res.json({ 'alert' :'password must be 8 letters long'});
    } else if(!Number(number) || number.length < 10){
        res.json({ 'alert' :'Invalid number, Please enter valid one'});
    } else if(!tac){
        res.json({ 'alert' :'You must agree to our terms and condition'});
    } else{
        // store the data in db
        const users = collection(db, "Users");
        
        getDoc(doc(Users, email)).then(User => {
            if(User.exists()){
                return res.json({ 'alert' : 'email already exists' })
            } else{
                // encrypt the passward
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        req.body.password = hash;
                        req.body.seller = false;

                        // set the doc
                        setDoc(doc(Users, email), req.body).then(data => {
                            res.json({
                                name:req.body.name,
                                email:req.body.email,
                                seller: req.body.seller,
                            })
                        })
                    })
                })
            }
        })
    }
})

app.get('/login', (req, res) => {
    res.sendFile("login.html", {root : "public" })
})

app.post('/login', (req, res) => {
    let { email, password } = req.body;

    if(!email.length || !password.length){
        res.json( {'alert' : 'fill all the inputs'})
    }

    const Users = collection(db, "Users");

    getDoc(doc(Users, email))
    .then(User => {
        if(!User.exists()){
            return res.json({'alert': 'email does not exists'})
        } else{
            bcrypt.compare(password, User.data().password, (err, result) => {
                if(result) {
                    let data = User.data();
                    return res.json({
                        name: data.name,
                        email: data.email,
                        seller: data.seller
                    })
                } else {
                    return res.json({ 'alert' : 'password is incorrect'})
                }
            })
        }
    })
})

// seller route
app.get('/seller', (req, res) => {
    res.sendFile('seller.html', { root : "public" })
})

app.post('/seller', (req, res) => {
    let { name, address, about, number, email } = req.body;

    if(!name.length || !address.length || !about.length || number.length < 10 || !number(number)){
        return res.json({ 'alert' : 'Some information(s) is/are incorrect'}); 
    } else{
        // update the seller status
        const sellers = collection(db, "sellers");
        setDoc(doc(sellers, email), req.body)
        .then(data => {
            const users = collection(db, "users");
            updateDoc(doc(users, email),{
                seller: true
            })
            .then(data => {
                res.json({'seller' : true})
            })
        })
    }
})

// dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile('dashboard.html', { root: "public" });
})

// add product
app.get('/add-product', (req, res) => {
    res.sendFile('add-product.html', { root: "public" })
})

app.post('/add-product', (req, res) => {
    let { name, shortDes, detail, price, image, tags, email, draft } = req.body;

    if(!name.length){
        res.json({ 'alert' : 'should enter product name'});
    } else if(!shortDes.length){
        res.json({ 'alert' : 'short des must be 80 letters long'});
    } else if(!price.length || !Number(price)){
        res.json({ 'alert' : 'enter valid price'});
    } else if(!detail.length){
        res.json({ 'alert' : 'must enter the detail'});
    } else if(!tags.length){
        res.json({ 'alert' : 'enter tags'});
    }

    // add-product

    let docName = `${name.toLowerCase()}-${Math.floor(Math.random() * 50000)}`

    let products = collection(db, "products");
    setDoc(doc(products, docName), req.body)
    .then(data => {
        res.json({'product': name})
    })
    .catch(err => {
        res.json({'alert': 'some error occured.'})
    })
})

// 404 route
app.get('/404', (req, res) => {
    res.sendFile("404.html", {root : "public" })
})

app.use((req, res) => {
    res.redirect('/404')
})

app.listen(3000, () =>{
    console.log('listening on port 3000');
})