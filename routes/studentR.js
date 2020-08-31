const express=require('express');
const fs=require('fs');
const router=express.Router();
const {to}=require('await-to-js');
const db=require('../database/ormIndex');
const Sequelize=require('sequelize');





//Get details of all the student
router.get('/', async(req, res)=>{
    let [err, student]=await to (db.studentModel.findAll());
    if(err)
    {
        return res.json({data:null, error:err});
    }
    return res.json({data:{student}, error:null})
});


//Get student details by id
router.get('/:id', async(req, res)=>{
    let studentId=req.params.id;
    let [err, data]=await to (db.studentModel.findAll({
        where:{
            id:studentId
        }}));
    if(err)
    {
        return res.json({data:null, error:err});
    }
    else if(data.length==0)
    {
        return res.json({data:null, error:"No student Exist with the given ID"});
    }
    data[0]['dataValues']['courses enrolled']=await to(db.enrollmentModel.findAll({
        where:{
            studentid:studentId,
        }
    }))
    return res.json({data, error:null});
});


//Add a student
router.post('/', async(req, res)=>{

    let name=req.body.name;
    
    if(typeof name!="string")
    {
        return res.json({data:null, error:"Invalid Entry!"});
    }
    let [err, data]=await to(db.studentModel.findOrCreate({where:{
        id:req.id},
        defaults:{
            name:req.body.name
        }
    }));
    if(err)
    {
        return res.json({data:null, error:err});
    }
    if(data.length!=0)
    {
        return res.json({data:null,error:"Already Added"})
    }
    return res.json({data:"Success", error:null});
});

module.exports=router;