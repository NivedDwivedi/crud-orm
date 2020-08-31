const express=require("express");
const fs=require("fs");
const router=express.Router();
const bcrypt  = require('bcrypt');
const {to} = require('await-to-js');
const jwt = require('jsonwebtoken');
const db=require('../database/ormIndex');




//Encryption
//Encryption
const encrypt=async (password)=>{
    const saltRounds=10;
    const [err, encrypt] = await to(bcrypt.hash(password, saltRounds));
    if (err) {
        return res.send("Encryption failed!");
    }
    return encrypt;
};
let salt='ThisIsMySalt';


//token generation
const generateToken=(usersData) => {
    
    let token=jwt.sign(usersData, salt, {
        expiresIn: `60m`,
    });
    return token;
};


//Signup
router.post('/signup', async(req, res)=>{
    let id=req.body.id;
    let name=req.body.name;
    let emailId=req.body.email;
    let password=req.body.password;
    
    if(typeof name!="string" || typeof emailId!="string" || typeof id!="number" || id<=0)
    {
        return res.json({data:null, error:"Invalid Entry!"});
    }

    //encrypt password
    let encryptedPassword=await encrypt(password);

    let [err, uFound]=await to(db.userModel.findOrCreate({where:{
        email:emailId},
        defaults:{
            id:id,
            name:name,
            email:emailId,
            password:encryptedPassword
        }
    }));
    console.log(uFound.length);
    if(err)
    {
        return res.json({data:null, error:err.message})
    }
    else{
        if(uFound.length!=0)
        {
            return res.json({data:null,error:"Already have an Account Please login"})
        }
        else{
            return res.json({data:"success", error:null});
        }
    }

});

//Login
router.post('/login', async(req, res)=>{
    let emailId=req.body.email;
    let password=req.body.password;
    
    if(typeof password!="string" || typeof emailId!="string")
    {
        return res.json({data:null, error:"Invalid Entry!"});
    }
    
    let [err, data]=await to (db.userModel.findAll({where:{
        email:emailId
    }}));
    if(err)
    {
        return res.json({data:null, error:err.message});
    }
    else{
        if(data.length==0)
        {
            return res.json({data:null, error:"Email id is not registered"});
        }
        else{
            let userPassword=data[0]['dataValues'].password;
            let sdata={
                "id":data[0]['dataValues'].id,
                "email":emailId
            };
            let [errs, isValid] = await to(
                bcrypt.compare(password, userPassword )
            );
            if(isValid){
               return res.json({data: {token:generateToken(sdata)},error:null});
            } else{
                return res.json({data:null,error:'Wrong Password'})
            }
        }
    }   

});


module.exports = router;