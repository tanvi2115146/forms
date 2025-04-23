const mongoose=require('mongoose');

const formSchema=new mongoose.Schema({
    fields:[{type:Object}],
});


module.exports=mongoose.model('Form',formSchema);