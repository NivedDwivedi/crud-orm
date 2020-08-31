// const Sequalize=require("sequelize");
const { Sequelize } = require("sequelize");
const {to}=require('await-to-js');

// const client= new Sequelize('mysql://root@localhost:3306/crudorm');
const client = new Sequelize('crudorm', 'root', 'nived@99#', {
    host: 'localhost',
    dialect: 'mysql' 
  });


let userModel=client.define('users',{
    id:{
        type:Sequelize.INTEGER.UNSIGNED,
        autoIncrement:true,
        allowNUll:false,
        primaryKey:true
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false
    },
    password:{
        type: Sequelize.STRING,
        allowNUll:false
    }
 });

 let studentModel=client.define('students',{
    id:{
        type:Sequelize.INTEGER.UNSIGNED,
        autoIncrement:false,
        allowNUll:false,
        primaryKey:true
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false
    }
 });
  
 let courseModel=client.define('courses',{
    id:{
        type:Sequelize.INTEGER.UNSIGNED,
        autoIncrement:true,
        allowNUll:false,
        primaryKey:true
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false
    },
    description:{
        type:Sequelize.STRING,
        allowNull:false
    },
    availableslots:{
        type: Sequelize.INTEGER.UNSIGNED,
        allowNUll:false
    },
    owner:{
        type:Sequelize.INTEGER.UNSIGNED,
        allowNull:false
    }
 });

 let enrollmentModel=client.define('enrollments',{
    studentid:{
        type:Sequelize.INTEGER.UNSIGNED,
        allowNUll:false,
    },
    courseid:{
        type: Sequelize.INTEGER.UNSIGNED,
        allowNUll:false
    }
 });
 const connectDB = async ()=>{
    let [err, result] = await to ( client.sync( {alter:false} ) )
    if (err){
        console.log(`Error: ${err.message}`)
        return
    }
    console.log({data:`Successfully connected to MySQL server !`, error:null});
}



module.exports = {
    connectDB,
    userModel,
    studentModel,
    courseModel,
    enrollmentModel
}
