const database = require('./database')


 //DATE AND TIME
 const oldDate = new Date();
 let date = oldDate.toISOString().split('T')[0];
 let time  = oldDate.toLocaleTimeString(); 

class studentdb {
    constructor(){
        global.db = database;
    }


    // #  DATABASE MODELS FOR NutriCo STUDENT DASHBOARD
    // #
    // # 
    // ------------------- NOTIFICATION SECTION-------------------
    get_notification(user_id, callback){
        let query = 'SELECT * FROM notifications WHERE user_id=? AND status="ACTIVE"'
        db.query(query, [user_id], (error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }else{
                let unread = response.filter((value)=> value.read_state === 'UNREAD')
                return callback({
                    status:true,
                    message:'Notification list requested', 
                    unread: unread.length,
                    response: response
                })

            }
        }) 
    }
   
    add_notification(user_id,message, callback){
        let query = 'INSERT INTO notifications (user_id,message,date,time) VALUES (?,?,?,?)'
        db.query(query,[user_id,message,date,time], (error,response)=>{
            if(error){
                // throw error;
                return callback({
                    status: false,
                    message: 'Technical issue'
                })
            }else if (response.length == 0) {
                return callback({
                  status: false,
                  message: "Failed, Please try again.",
                });
              } 
            else{
                return callback({
                    status:true,
                    message:"Notification sent successfully."
                })
            }
        })
    }
    update_not_read(user_id,not_id,callback){
        let query = 'UPDATE notifications SET read_state="READ" WHERE id=? AND user_id=?;'
        db.query(query, [not_id,user_id], (error, response)=>{
            if(error)  {
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }
            else if (response.changedRows == 0) {
                return callback({
                    status:false,
                    message: 'Notification no change'
                })
            }else{
              return callback({
                status:true,
                message: 'Notification read'
            })
            }
          })
    }
    remove_not(user_id,not_id,callback){
        let query = 'UPDATE notifications SET status="INACTIVE" WHERE id=? AND user_id=?;'
        db.query(query, [not_id,user_id], (error, response)=>{
            if(error)  {
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }
            else if (response.changedRows == 0) {
                return callback({
                    status:false,
                    message: 'Notification no change'
                })
            }else{
              return callback({
                status:true,
                message: 'Notification read'
            })
            }
          })
    }
    // ------------------- END NOTIFICATION SECTION-------------------
    // #  
    // #
    // #
    // ------------------- SUPPORT SECTION-------------------
    get_support(callback){
        let query = 'SELECT * FROM faq'
        db.query(query, (error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }else{ 
                return callback({
                    status:true,
                    message:'Support list requested', 
                    response: response
                })

            }
        }) 
    }
    // ------------------- END SUPPORT SECTION-------------------
    // #  
    // #
    // #
    // ------------------- SETTINGS SECTION-------------------
    update_image(user_id,image_path,callback){
        let query = 'UPDATE users SET image=? WHERE id=?;'
        db.query(query, [image_path,user_id], (error, response)=>{
            if(error)  {
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
          }
            else if (response.changedRows == 0) {
                return callback({
                  status: true,
                  message: "Already upload this image",
                });
              }
              else{
                  return callback({
                      status:true,
                      message: 'Profile updated successful'
                  })
              }
          })
    }
    update_name(user_id,firstname,lastname,callback){
        let query = 'UPDATE users SET firstname=?, lastname=? WHERE id=?;'
        db.query(query, [firstname,lastname,user_id], (error, response)=>{
            if(error)  {
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
          }
            else if (response.changedRows == 0) {
                return callback({
                  status: true,
                  message: "Already have this profile info",
                });
              }
              else{
                  return callback({
                      status:true,
                      message: 'Profile updated successful'
                  })
              }
          })
    }
    update_password(user_id,password,callback){
        let query = 'UPDATE users SET password=? WHERE id=?;'
        db.query(query, [password,user_id], (error, response)=>{
            if(error)  {
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
             }else{
                  return callback({
                      status:true,
                      message: 'Password updated successful'
                  })
              }
          })
    }
    get_oldPassowrd(user_id,callback){
        let query = 'SELECT password FROM users WHERE id=?'
        db.query(query,[user_id], (error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }else{ 
                return callback({
                    status:true,
                    message:'Support list requested', 
                    response: response
                })

            }
        }) 
    }
    delete_account(user_id,callback){
        let query = 'UPDATE users SET status="DELETED" WHERE id=?;'
        db.query(query, [user_id], (error, response)=>{
            if(error)  {
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }
            else if (response.changedRows == 0) {
                return callback({
                  status: true,
                  message: "Same status",
                });
              }
            else{
                return callback({
                    status:true,
                    message: 'Account deleted successful'
                })
            }
          })
    }
    // ------------------- END SETTINGS SECTION-------------------
    // #  
    // #
    // #
    // -------------------  DASHBOARD SECTION-------------------
    get_dashboard(user_id,callback){

        this.get_total_forms(user_id,(response)=>{
            let totalForms = response.response
            this.get_total_entries(user_id,(result)=>{
                let totalEntry = result.response
                this.get_forms_by_userid(user_id,(res)=>{
                    return callback({
                        status:true,
                        message:'Dashboard',
                        response:{
                            totalForms,
                            totalEntry,
                            forms:res.response||[]
                        }
                    })
                })
               
            })
        })
           
           
    }
   
    get_total_forms(user_id,callback){
        let query = 'SELECT COUNT(id) as total_forms FROM forms WHERE user_id=?;';
        db.query(query,[user_id], (error, response)=>{ 
            if(error){
                throw error;
                return callback({
                    status:false,
                    message:'technical error',
                    response:0
                })
            }
            else if(response.length == 0){
                return callback({
                    status:true,
                    response: 0
                        })
            }
            else{
               let total_forms = response[0]['total_forms']
               console.log(total_forms)
               return callback({
                status:true,
                message:'total_forms',
                response: total_forms
                    })
            }
        })
    }
    get_total_entries(user_id,callback){
        let query = 'SELECT COUNT(id) as total_entry FROM entry WHERE user_id=?;';
        db.query(query,[user_id], (error, response)=>{ 
            if(error){
                throw error;
                return callback({
                    status:false,
                    message:'technical error',
                    response:0
                })
            }
            else if(response.length == 0){
                return callback({
                    status:true,
                    response: 0
                        })
            }
            else{
                let total_entry = response[0]['total_entry']
               console.log(total_entry)
               return callback({
                status:true,
                message:'total_entry',
                response: total_entry
                    })
            }
            
            
        })
    }
    // ------------------- END DASHBOARD SECTION-------------------
    // #  
    // #
    // #







    // ------------------- FORMS SECTION-------------------
    add_form(user_id,title,description,callback){
        let query = 'INSERT INTO forms (user_id,title,description,date,time) VALUES (?,?,?,?,?)'
        db.query(query,[user_id,title,description,date,time],(error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical error'
                })
            }else if (response.length == 0) {
                return callback({
                  status: false,
                  message: "Failed, Please try again.",
                });
              } 
            else{
                return callback({
                    status:true,
                    message:"Form added successfully."
                })
            }
        })
     }

    update_form(form_id,title,description,callback){
        let query = 'UPDATE forms SET title=?, description=? WHERE id=? '
        db.query(query,[title,description,form_id],(error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical error'
                })
            }else if (response.affectedRows == 0) {
                return callback({
                  status: false,
                  message: "Failed, Please try again.",
                });
              } 
            else{
                return callback({
                    status:true,
                    message:"Form updated successfully."
                })
            }
        })
     }
    get_form_by_id(form_id,callback){
        let query = 'SELECT * FROM forms WHERE id=?'
        db.query(query, [form_id], (error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }else{ 
                return callback({
                    status:true,
                    message:'Form requested', 
                    response: response[0]
                })

            }
        }) 
    }
    get_forms_by_userid(user_id,callback){
        let query = 'SELECT * FROM forms WHERE user_id=?'
        db.query(query, [user_id], (error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }else{ 
                return callback({
                    status:true,
                    message:'Form requested', 
                    response: response
                })

            }
        }) 
    }
    // -------------------END FORMS SECTION-------------------
    // #  
    // #
    // #
    // ------------------- ENTRY SECTION-------------------
    add_entry(user_id,form_id,given_id,relationship,firstname,lastname,house_no,gender,callback){
        let query = 'INSERT INTO entry (user_id,form_id,given_id,relationship,firstname,lastname,house_no,gender,date,time) VALUES (?,?,?,?,?,?,?,?,?,?)'
        db.query(query,[user_id,form_id,given_id,relationship,firstname,lastname,house_no,gender,date,time],(error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical error'
                })
            }else if (response.length == 0) {
                return callback({
                  status: false,
                  message: "Failed, Please try again.",
                });
              } 
            else{
                return callback({
                    status:true,
                    message:"Form added successfully."
                })
            }
        })
     }
    update_entry(entry_id,given_id,relationship,firstname,lastname,house_no,gender,callback){
        let query = 'UPDATE entry SET given_id=?,relationship=?,firstname=?,lastname=?,house_no=?,gender=? WHERE id=? ;'
        db.query(query,[given_id,relationship,firstname,lastname,house_no,gender,entry_id],(error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical error'
                })
            }else if (response.length == 0) {
                return callback({
                  status: false,
                  message: "Failed, Please try again.",
                });
              } 
            else{
                return callback({
                    status:true,
                    message:"Form updated successfully."
                })
            }
        })
     }
    get_entry_by_formid(form_id,callback){
        let query = `SELECT * FROM entry WHERE form_id=? AND status='ACTIVE' ;`
        db.query(query, [form_id], (error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }else{ 
                console.log('response :>> ', response);
                return callback({
                    status:true,
                    message:'Form requested', 
                    response: response
                })

            }
        }) 
    }
    delete_entry(entry_id,callback){
        let query = 'UPDATE entry SET status="DELETED" WHERE id=?;'
        db.query(query, [entry_id], (error, response)=>{
            if(error)  {
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }
            else if (response.changedRows == 0) {
                return callback({
                  status: true,
                  message: "Same status",
                });
              }
            else{
                return callback({
                    status:true,
                    message: 'Entry deleted successful'
                })
            }
          })
    }
    // ------------------- END ENTRY SECTION-------------------
    // #  
    // #
    // #
    // -------------------  DATA SECTION-------------------
    get_data(entry_id,callback){
        let query = 'SELECT * FROM data WHERE entry_id=?'
        db.query(query, [entry_id], (error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }else{ 
                return callback({
                    status:true,
                    message:'Data requested', 
                    response: response
                })

            }
        }) 
    }
    add_data(entry_id,form_id,period,item,weight,given_time, callback){
        let query = 'INSERT INTO data (entry_id,form_id,period,item,weight,given_time,date,time) VALUES (?,?,?,?,?,?,?,?)'
        db.query(query,[entry_id,form_id,period,item,weight,given_time,date,time],(error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical error'
                })
            }else if (response.length == 0) {
                return callback({
                    status: false,
                    message: "Failed, Please try again.",
                });
                } 
            else{
                return callback({
                    status:true,
                    message:"Data added successfully."
                })
            }
        })
    }
    delete_data(data_id,callback){
        let query = 'UPDATE data SET status="DELETED" WHERE id=?;'
        db.query(query, [data_id], (error, response)=>{
            if(error)  {
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }
            else if (response.changedRows == 0) {
                return callback({
                  status: true,
                  message: "Same status",
                });
              }
            else{
                return callback({
                    status:true,
                    message: 'Data deleted successful'
                })
            }
          })
    }
    // ------------------- END DATA SECTION-------------------
    // #  
    // #
    // #
    // ------------------- ALL ENTRY-DATA PLUS ENTRIES INFO SECTION-------------------
    get_all_data(form_id,callback){
        let query = 'SELECT * FROM entry WHERE form_id=?'
        let final_data = [];
        db.query(query, [form_id], (error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message: 'Technical issue'
                })
            }else if (response.length == 0) {
                return callback({
                  status: false,
                  message: "Failed, Please try again.",
                  response:[]
                });
              } 
            else{ 
                let entry_info = response.map((value)=>{
                    // console.log('value :>> ', value);
                    return {
                        id:value.id,
                        given_id:value.given_id,
                        relationship:value.relationship,
                        firstname:value.firstname,
                        lastname:value.lastname,
                        house_no:value.house_no,
                        gender:value.gender
                    }
                } )
                entry_info.map((value,index)=>{
                    this.get_data(value.id,(result)=>{
                   let arrObj = result.response.map((single)=>{
                                    return {
                                        ...entry_info[index],
                                        item_id:single.id,
                                        period:single.period,
                                        item:single.item,
                                        weight:single.weight,
                                        given_time:single.given_time
                                    }
                                })
                    if(arrObj.length==1){
                        final_data.push(arrObj[0])
                    }else{
                        final_data.push(...arrObj)
                    }
                    if(index==entry_info.length-1){
                        console.log('last ', final_data)
                        callback({
                            status:true,
                            message:'woring',
                            response:final_data.sort((a,b)=> b.item_id-a.item.id)
                        })
                    }  
                                
                    })
                })
                

            }
        }) 
    }
   
    // ------------------- END DATA SECTION-------------------
    // #  
    // #
    // #

    // ------------------- CONVERT SECTION-------------------
    converter(entry_id,callback){
        let convertedData = [];
        this.get_data(entry_id, (response)=>{
            let entryData = response.response
            // console.log('entryData :>> ', entryData);
            let data = entryData.map((value,index)=>{
                // console.log('value :>> ', value);
                let item = value.item;
                this.get_nutrient(item,(result)=>{
                    let nutrients = result.response
                    let obj = {
                        period:value.period,
                        given_time:value.given_time,
                        item:value.item,
                        weight:value.weight,
                        protein:this.calculate(value.weight,nutrients.protein),
                        carbohydrate:this.calculate(value.weight,nutrients.carbohydrate),
                        minerals:this.calculate(value.weight,nutrients.minerals),
                        vitamins:this.calculate(value.weight,nutrients.vitamins)
                    }
                    convertedData.push(obj)
                    console.log('result :>> ',obj);
                    if(index == entryData.length-1){
                        console.log('final')
                        setTimeout(()=>{
                            console.log('TIMEOUT')
                            return callback({
                                status:true,
                                response:convertedData
                            })
                        },2000)
                        
                    }
                })
            })
            
        })
    }
    calculate(weight,constant){
        let new_weight = parseFloat(weight);
        let new_constant = parseFloat(constant);
        let multiply = new_weight * new_constant
        let answer = multiply/100
        // console.log('answer :>> ', answer);
        return answer.toFixed(2);
    }

    get_nutrient(item, callback){
        let query = 'SELECT * FROM nutrients WHERE item=?;'
        db.query(query,[item],(error,response)=>{
            if(error){
                throw error;
                return callback({
                    status:false,
                    message:'Technical error'
                })
            }else{
                return callback({
                    status:true,
                    message:'Nutrient requested',
                    response:response[0]
                })
            }
        })
    }
    // ------------------- END CONVERT SECTION-------------------
}

module.exports = studentdb;