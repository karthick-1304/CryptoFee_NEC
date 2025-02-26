const mongoose = require('mongoose')
const AdminSchema =  new mongoose.Schema({
    adminId:String,
    password:String

})

const AdminModel = mongoose.model("adminClg",AdminSchema)
module.exports=AdminModel