const express=require('express');
const fs=require('fs');
const router=express.Router();
const {to}=require('await-to-js');
const db=require('../database/ormIndex');


// all courses details
router.get('/', async(req, res)=>{
    let [err, course]=await to (db.courseModel.findAll());
    if(err)
    {
        return res.json({data:null, error:err});
    }
    return res.json({data:{course}, error:null})
});


//Specific course detail
router.get('/:id', async(req, res)=>{
    let courseId=req.params.id;
    let [err, course]=await to (db.courseModel.findAll({
        where:{
        id:courseId
    }}));
    if(err)
    {
        return res.json({data:null, error:err.message});
    }
    if(course.length==0)
    {
        return res.json({data:null, error:"No course exist with the given id"});
    }
    course[0]['dataValues']['enrolledStudents'] = await to(db.enrollmentModel.findAll({
        where: {
            courseid: courseId
        }
    }));

    return res.json({data:{course},error:null})
    
});


//Adding a course
router.post('/', async(req,res)=>{

    let name = req.body.name;
    let description = req.body.description;
    let availableSlots = req.body.availableSlots;
    if (!name  || !description || !availableSlots )
    {
        return res.json({data:null, error:"Invalid Entry"});
    }

    let ownerid=req.id;
    if(typeof name == "string" && typeof description=="string" && typeof availableSlots=="number" && availableSlots>0)
    {
        name=name.toUpperCase();
        let [err, data]=await to(db.courseModel.findOrCreate({
            where:{
                name:name
            },
            defaults:{
                name:name,
                description:description,
                availableslots:availableSlots,
                owner:ownerid
            }
        }))
        if(err)
        {
            return res.json({data:null, error:err.message})
        }
        // console.log(data);
        if(!data[1])
        {
            return res.json({ data: null, error: "Course already exists"});
        }
        return res.json({data:"success", error:null});
    }
    else{
        return res.json({data:null, error:"Invalid Entry"});
    }
    
});





//Enroll a student to a course if stots are available
router.post('/:id/enroll', async(req, res)=>{
    let studentId=req.body.studentId;
    let courseId=parseInt(req.params.id);
    if(typeof studentId!='number')
    {
        return res.json({data:null, error:"Invalid Entry"});
    }
    
    let [err, sFound]=await to(db.studentModel.findAll({
        where:{
        id:studentId
    }}));
    // console.log(sFound);
    if(err)
    {
        return res.json({data:null, error:err.message})
    }
    else{
        if(sFound.length==0)
        {
            return res.json({data:null, error:"No student exist with the given Id"})
        }
    }
    let cFound;
    [err, cFound]=await to(db.courseModel.findAll({where:{
        id:courseId
    }}));
    if(err)
    {
        return res.json({data:null, error:err.message});
    }
    else{
        if(cFound.length==0)
        {
            return res.json({data:null, error:"No course exist with the given Id"})
        }
    }
    let available=cFound[0].dataValues.availableslots;
    if(cFound[0].dataValues.availableslots<=0)
    {
        return res.json({data:null,error:"No slots are available"});
    }
    console.log(cFound[0].dataValues.availableslots);
    if(cFound[0].dataValues.availableslots>=1)
    {
        
        if(cFound[0].dataValues.owner==req.id || studentId==req.id)
        {
            
            [err, data] = await to(db.enrollmentModel.findOrCreate({
                where:{ 
                    studentid:req.body.studentId,
                    courseid:req.params.id 
                }
              }));
            if(err)
            {
                return res.json({data:null,error:err.message});
            }
            if(!data[1])
            {
                return res.json({ data: null, error: "Student is already enrolled in the course"});
            }
            available=available-1;   
            [err, data]=await to(db.courseModel.update({availableslots:available},
                {where:{
                    id:courseId
                }}));
            if(err)
            {
                return res.json({data:null, error:err.message});
            }
            
            return res.json({data:"success", error:null});
        }
    
        return res.json({data:null, error:"You can not enroll other or You are not owner"});
    }
    
});







//Remove a student from course 
router.put('/:id/deregister', async(req, res)=>{
    let studentId=req.body.studentId;
    let courseId=req.params.id;
    //check entry is valid or not
    if(typeof studentId!='number')
    {
        return res.json({data:null, error:"Invalid Entry"});
    }
    
    //check whether student exist or not
    let [err, sFound]=await to(db.studentModel.findAll({where:{
        id:studentId
    }}));
    if(err)
    {
        return res.json({data:null, error:err.message})
    }
    else{
        if(sFound.length==0)
        {
            return res.json({data:null, error:"No student exist with the given Id"})
        }
    }

    //check whether course exist or not 
    let cFound;
    [err, cFound]=await to(db.courseModel.findAll({where:{
        id:courseId
    }}));
    if(err)
    {
        return res.json({data:null, error:err.message});
    }
    else{
        if(cFound.length==0)
        {
            return res.json({data:null, error:"No course exist with the given Id"})
        }
    }

    //if the user is owner or the student himself then deregister the student
    if(cFound[0].dataValues.owner==req.id || studentId==req.id)
    {
        //delete the entry from the database
        let deleted;
        [err, deleted] = await to(db.enrollmentModel.destroy({
            where: {
            studentid:studentId,
            courseid:courseId
            }
        }));
        // console.log(deleted);
        if(deleted==0)
        {
            return res.json({data: null, error: "User was not enrolled in the course !"});
        }
        // console.log(cFound[0].dataValues.availableslots);

        //update the availableslot
        let available=cFound[0].dataValues.availableslots+1;   
        [err, data]=await to(db.courseModel.update({availableslots:available},
        {where:{
                id:courseId
            }}));
        if(err)
        {
            return res.json({data:null, error:err.message});
        }
            
        return res.json({data:"success", error:null});
    }
    
    return res.json({data:null, error:"You can not deregister other or You are not owner"});
    
     
});


//delete a course
router.delete('/:id', async(req, res)=>{
    let courseId=req.params.id;
    let userId=req.id;
    let[err, data]= await to(db.courseModel.findAll({
        where:{
            id:courseId
        }}));
    if(err)
    {
        return res.json({data:null, error:err.message});
    }
    if(data.length==0)
    {
        return res.json({data:null, error:'No course exist with the given id'});
    }
    //console.log(data);
    if(data[0].dataValues.owner==req.id)
    {
        [err, data]=await to (db.courseModel.destroy({
            where:{
                id:courseId
            }}));
        if(err)
        {
            return res.json({data:null, error:err.message});
        }
        [err, data]=await to(db.enrollmentModel.destroy({
            where:{
                courseid:courseId
            }
        }));
        if(err)
        {
            return res.json({data:null, error:err.message});
        }

        return res.json({data:'success',error:null});
    }
    return res.json({data:null, error:"Only owner can delete the course"});
})

module.exports=router;