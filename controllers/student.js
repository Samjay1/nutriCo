const router = require('express').Router()
const multer = require('multer');
const fs = require('fs')
const bcrypt = require('bcrypt');
const homeDB = require('../models/homedb');
const studentDB = require('../models/studentdb')
const session = require('express-session');
router.use(session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized:false
}))
// INITIATE DATABASE
const HomeDB = new homeDB();
const StudentDB = new studentDB();



//Image upload - multer config
const upload = multer({
    dest: 'public/images/users/',
    limits: {
    fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)){
    cb(new Error('Please upload an image.'))
    }
    cb( undefined, true)
    }
    })
//------------------------------------------------

// -----------------REGISTER PAGE -----------------
router.get('/register', (req,res)=>{
    req.session.user = null;
    res.render('students/register',{message:false,info:''})
})
router.post('/register', (req,res)=>{
    let {firstname,lastname,email,country,city,password,cpassword,referral_code} = req.body;
    console.log(password,cpassword)
     //ENCRYPT PASSWORD
     let hashedPassword = bcrypt.hashSync(String(password), 10);
     //NEW TOKEN GENERATED
     let token = random.int(1000,10000);
     //NEW AFFILIATE CODE GENERATED
     let affiliate_code = 'KKQ'+random.int(1000,10000);
     if(password !==cpassword ){
        return res.render('students/register', {message:true,info:'Password must be the same'})
    }
    try {
       HomeDB.register(firstname,lastname,email,country,city,hashedPassword,referral_code,affiliate_code,token, (response)=>{
            if(response.status===true){
                res.render('students/login',{message:true,info:''})
            }else{
                res.render('students/register',{message:true,info:'Please try another email'})
            }
       })
    } catch (error) {
        res.render('students/register',{message:true,info:'Please try another time.'})
    }

})


// -----------------LOGIN PAGE -----------------
router.get('/login', (req,res)=>{
    req.session.user = null;
    res.render('students/login', {message:null,info:''})
})
router.post('/login', async (req, res)=>{
    let {email,password} = req.body;

    //CHECK FOR EMPTY PARAMETERS
    if(!email || !password){
        res.render('students/login', {message:false,info:'Password incorrect'})
    }
    HomeDB.get_user(email, (response)=>{
        if(response.status==true){
            bcrypt.compare(password, response.response.password).then((result)=>{
            if(result ==true){
                // SAVE USER DATE IN SESSION
                req.session.user = {
                    id:response.response.id,
                     token:response.response.token, 
                     affiliate_code:response.response.affiliate_code,
                     firstname:response.response.firstname,  
                     lastname:response.response.lastname, 
                     email:response.response.email,
                     image:response.response.image
                    }
                return res.redirect('/student/dashboard')
            }else{
                res.render('students/login', {message:false,info:'Password incorrect'})
                // res.status(404).send({
                //     status: false,
                //     message: 'password incorrect!', 
                // })
            }
            }).catch((err)=>{
                res.render('students/login', {message:false,info:'Please try again'})
            //    throw err;
            //     res.status(500).send({
            //     status: false, 
            //     message: 'password error!',
            //     other:response.message, 
            // })
            return;
            })
        }
        else{
            res.render('students/login', {message:false,info:'Please register!'})
            // res.render('Lo', {user:req.session.user || null, cart:[], message:response.message})
            
        } 
        });
     
});


// -----------------DASHBOARD PAGE -----------------
router.get('/', (req,res)=>{
    res.redirect('/student/login')
})

router.get('/dashboard',(req,res)=>{
    let cart = req.session.cart == undefined ? [] : req.session.cart;
    let storedUser = req.session.user

    if(req.session.user){
        let user_id = req.session.user.id;
        let image = req.session.user.image;
        StudentDB.get_dashboard(user_id,(response)=>{
            let data = response.response;
            
        res.render('students/dashboard' ,{data,storedUser,image})
        }) 
    }else{
        res.redirect('/student/login')
    }
})


// -----------------NOTIFICATIONS PAGE -----------------
router.get('/notification',(req,res)=>{
    let cart = req.session.cart == undefined ? [] : req.session.cart;
    if(req.session.user){
        let user_id = req.session.user.id
        StudentDB.get_notification(user_id,(response)=>{
        let counts = req.session.counts
        res.render('students/notification' ,
            {
                cart,
                notification: response.response, 
                counts
            })
        }) 
    }else{
        res.redirect('/student/dashboard')
    }
})

router.get('/read_not/:id',(req,res)=>{
    let not_id = req.params.id;
    let cart = req.session.cart == undefined ? [] : req.session.cart;
    if(req.session.user){
        let user_id = req.session.user.id
        StudentDB.update_not_read(user_id,not_id,(response)=>{
            if(response.status==true){
                let counter = (parseInt(req.session.counts.notification_count)-1)
                console.log(counter, 'counter')
                req.session.counts = {message_count:req.session.counts.message_count, notification_count:counter}
                console.log(response, "notification")
            }
        res.redirect('/student/notification')
        }) 
    }else{
        res.redirect('/student/dashboard')
    }
})


// -----------------SUPPORT PAGE -----------------
router.get('/support',(req,res)=>{
    let cart = req.session.cart == undefined ? [] : req.session.cart;
    if(req.session.user){
        StudentDB.get_support((response)=>{
        let counts = req.session.counts
        res.render('students/support' ,
            {
                cart,
                support: response.response, 
                counts
            })
        }) 
    }else{
        res.redirect('/student/dashboard')
    }
})



// -----------------SETTINGS PAGE -----------------
router.get('/settings',(req,res)=>{
    let cart = req.session.cart == undefined ? [] : req.session.cart;
    if(req.session.user){
        console.log(req.session.user)
        let email = req.session.user.email;
        HomeDB.get_user(email,(response)=>{
        let counts = req.session.counts
        res.render('students/settings' ,
            {
                cart,
                user: response.response, 
                counts,
                state:null, message:''
            })
        }) 
    }else{
        res.redirect('/student/dashboard')
    }
})

router.post('/upload_image', upload.single('upload'), (req, res)=>{
    let old_image = req.body.old_image || 'none';
    let image_path = req.file.path;
    console.log('uploads :>> ', image_path, 'old image', old_image);
    let user_id = req.session.user.id
    req.session.user.image = image_path;
    try {
        if(old_image !== 'none' ){
            console.log('old_image :>> ', old_image);
            fs.unlink(old_image, (err)=>{
                if (err) {
                    return res.status(500).json({
                        status: false, 
                        message: 'provide valid path to previous image'
                    });
                  } 
                  //just post image
                  StudentDB.update_image(user_id,image_path, (response)=>{
                        res.redirect('/student/settings')
                  }) 
                }) 
            }else{
                //just post image
                StudentDB.update_image(user_id,image_path, (response)=>{
                    res.redirect('/student/settings')
              })
            }
    } catch (error) {
        res.redirect('/student/dashboard')
    }
    
})

router.post('/update_names', (req,res)=>{
    let {firstname,lastname} = req.body;
    let user_id = req.session.user.id;
    StudentDB.update_name(user_id,firstname,lastname,(response)=>{
        if(response.status){
            req.session.user.firstname = firstname;
            req.session.user.lastname = lastname;
            res.redirect('/student/settings')
        }else{
            res.redirect('/student/dashboard')
        }
    })
})

router.post('/update_password', (req,res)=>{
    let {password,npassword,cpassword} = req.body;
 
    let needed_data = {
        user: req.session.user || null,
        cart:req.session.cart|| [],
        counts: req.session.counts
    }

    if(cpassword !== npassword){
        console.log('failed to change')
        return res.render('students/settings', {
            state:true,
             message:'Confirm password must be the same as new password',
             ...needed_data
            })
    }
    let user_id = req.session.user.id; 
    //ENCRYPT PASSWORD
    let hashedPassword = bcrypt.hashSync(String(npassword), 10);
    StudentDB.get_oldPassowrd(user_id,(response)=>{
        if(response.status){
            let oldpassword = response.response[0].password
            console.log('password',oldpassword)
            bcrypt.compare(password, oldpassword).then((result)=>{
                console.log(result,hashedPassword)
                if(result ==true){
                    StudentDB.update_password(user_id,hashedPassword, (response)=>{
                        if(response.status){
                            console.log('success to change' ,npassword,password)
                            console.log(response)
                            res.render('students/settings',{state:false, message:'Password updated successfully', ...needed_data})
                        }else{
                            return res.render('students/settings', {state:true, message:'Try another password', ...needed_data})
                        }
                    })
                }else{
                    return res.render('students/settings', {state:true, message:'Please try again', ...needed_data})
                }
                }).catch((err)=>{ 
                    console.log(err)
                    return res.render('students/settings', {state:true, message:'Please try again', ...needed_data})
                })
        }else{
            return res.render('students/settings', {state:true, message:'Please try again later', ...needed_data})
        }
    })
})

router.get('/delete/:id', (req,res)=>{
    let {id} = req.params;
    StudentDB.delete_account(id,(response)=>{
        if(response.status){
            req.session.user = null;
            console.log(response, req.session)
            res.render('delete_message', {user:req.session.user || null, cart:[], message:response.message})
            // res.redirect('/student/dashboard')
        }else{
            res.redirect('/student/dashboard')
        }
    })
})

// -----------------LOGOUT PAGE -----------------
router.get('/logout',(req,res)=>{
    req.session.user = null;
    res.redirect('/student/dashboard')
})


//======================================================================

// ADD FORMS
router.get('/add', (req,res)=>{
    if(req.session.user){
        res.render('students/addform')
    }else{
        res.redirect('/student/dashboard')
    }
})

router.post('/add_form', (req,res)=>{
    let {title,description} = req.body;
    if(req.session.user){
        let user_id = req.session.user.id;
        StudentDB.add_form(user_id,title,description,(response)=>{
            if(response.status){
                res.redirect('/student/forms')
            }
        })
    }else{
        res.redirect('/student/dashboard')
    }
   
})

// TODO: CREATE DESIGN
// EDIT FORMS
router.get('/editform/:form_id', (req,res)=>{
    let form_id = req.params.form_id;
    if(req.session.user){
        StudentDB.get_form_by_id(form_id,(response)=>{
            if(response.status){
                let form = response.response
                res.render('students/editform', {form})
            }
        })
    }else{
        res.redirect('/student/dashboard')
    }
  
})

router.post('/updateform', (req,res)=>{
    let {form_id,title,description} = req.body
    console.log({form_id,title,description} )
    StudentDB.update_form(form_id,title,description,(response)=>{
        if(response.status){
            res.redirect('/student/forms')
        }else{
            res.redirect('/student/forms')
        }
    })

})



// LIST FORMS
router.get('/forms/', (req,res)=>{
    if(req.session.user){
        let user_id = req.session.user.id;
        StudentDB.get_forms_by_userid(user_id,(response)=>{
            if(response.status){
                let forms = response.response;
                res.render('students/forms',{forms})
            }
        })
    }else{
        res.redirect('/student/dashboard')
    }
})



// ENTRIES BY FORMS
router.get('/entries/:form_id', (req,res)=>{
    let form_id = req.params.form_id;
    if(req.session.user){
        StudentDB.get_entry_by_formid(form_id,(response)=>{
            if(response.status){
                let entries = response.response;
                res.render('students/entries', {entries,form_id})
            }
        })
    }else{
        res.redirect('/student/dashboard')
    }
})

router.post('/add_entry/:form_id', (req,res)=>{
    let form_id = req.params.form_id;
    let {given_id,relationship,firstname,lastname,household,gender} = req.body;
    let user_id = req.session.user.id;
    StudentDB.add_entry(user_id,form_id,given_id,relationship,firstname,lastname,household,gender,(response)=>{
        if(response.status){
            res.redirect(`/student/entries/${form_id}`)
        }else{
            res.redirect('/student/dashboard')
        }
    })
    
})

router.get('/delete_entry/:entry_id', (req,res)=>{
    let entry_id = req.params.entry_id;
    StudentDB.delete_entry(entry_id,(response)=>{
        if(response.status){
            res.redirect('/student/forms')
        }else{
            res.redirect('/student/dashboard')
        }
    })
})


//  ENTRY-DATA BY ENTRIES
router.get('/entry_data/:entry_id', (req,res)=>{
    let entry_id = req.params.entry_id;
    if(req.session.user){
        StudentDB.get_data(entry_id,(response)=>{
            if(response.status){
                let data = response.response;
                res.render('students/entry_data', {data,entry_id})
            }
        })
    }else{
        res.redirect('/student/dashboard')
    }
})


router.get('/delete_data/:id', (req,res)=>{
    
    res.render('students/entry_data')
})


router.post('/add_data/:entry_id', (req,res)=>{
    let entry_id = req.params.entry_id;
    let {form_id,period,item,weight,given_time} = req.body;
    StudentDB.add_data(entry_id,form_id,period,item,weight,given_time,(response)=>{
        if(response.status){
            // console.log('response.response :>> ', response.response);

            res.redirect(`/student/entry_data/${entry_id}`)
        }
    })
    
})



// CONVERT DATA
router.get('/convert/:entry_id', (req,res)=>{
    let entry_id = req.params.entry_id;
    if(req.session.user){
        StudentDB.converter(entry_id,(response)=>{
            if(response.status){
                let data = response.response;
                console.log('data :>> ', data);
                res.render('students/convert', {data})
            }
        })
    }else{
        res.redirect('/student/dashboard')
    }
})

// ALL DATA - ENTRY-DATA PLUS ENTRIES INFO
router.get('/all_data/:form_id', (req,res)=>{
    let form_id = req.params.form_id;
    StudentDB.get_all_data(form_id,(response)=>{
        let data = response.response;
        if(response.status){
            console.log('data :>> ', data);
            res.render('students/alldata', {data})
        }else{ 
            res.render('students/alldata', {data})
        }
    })
})




router.get('/test', (req,res)=>{ 
    StudentDB.get_dashboard(1,(response)=>{
        res.send(response)
    })
    
})
module.exports = router;