const database = require('./database')

 //DATE AND TIME
 const oldDate = new Date();
 let date = oldDate.toISOString().split('T')[0];
 let time  = oldDate.toLocaleTimeString(); 

class homedb {
    constructor(){
        global.db = database;
    }
 
    // #  DATABASE MODELS FOR NutriCo MAIN WEBSITE
    // #
    // #
    // ------------------- REGISTER SECTION-------------------
    register(firstname,lastname,email,country,city,password,referral_code,affiliate_code,token,callback){
        let query = 'INSERT INTO users (firstname,lastname,email,country,city,password,referral_code,affiliate_code,token,date,time) VALUES (?,?,?,?,?,?,?,?,?,?,?);'
        db.query(query,[firstname,lastname,email,country,city,password,referral_code,affiliate_code,token,date,time], (error,response)=>{
            if(error){
                // throw error;
                return callback({
                    status:false,
                    message:'Tecnhical issue'
                })
            }
            else if (response.length == 0) {
                return callback({
                  status: false,
                  message: "Failed, Please try again.(Check email)",
                });
              } 
            else{
                return callback({
                    status:true,
                    message:"You've registered successfully."
                })
            }
        })
    }
    // ------------------- END REGISTER SECTION-------------------
    // #  
    // #
    // #
    // ------------------- LOGIN SECTION-------------------
    get_user(email, callback) {
        let query = "SELECT * FROM users WHERE email=? AND status='ACTIVE'";
        db.query(query,[email], (err, response) => {
            if (err) {
                // throw err;
                return callback({
                    status:false,
                    message:'Tecnhical issue'
                })
            }
            if (response.length == 0) {
                return callback({
                    status: false,
                    message: "Don't have an account!",
                });
            } else {
                return callback({
                    status: true,
                    message: "Login successful",
                    response: response[0],
                });
            }
        });
      }
    
    // ------------------- END LOGIN SECTION-------------------
    // #  
    // #
    // #
    // ------------------- CONTACT SECTION-------------------
    add_contact(name,email,message,callback){
        let query = 'INSERT INTO contacts (name,email,message,date,time) VALUES (?,?,?,?,?);'
        db.query(query,[name,email,message,date,time], (error,response)=>{
            if(error){
                // throw error;
                return callback({
                    status:false,
                    message:'Tecnhical issue'
                })
            }
            else if (response.length == 0) {
                return callback({
                  status: false,
                  message: "Failed, Please try again.",
                });
              } 
            else{
                return callback({
                    status:true,
                    message:"You've sent us a message successfully."
                })
            }
        })
    }
    // ------------------- END CONTACT SECTION-------------------
   
}

module.exports = homedb;