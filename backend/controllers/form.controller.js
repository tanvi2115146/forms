

const form = require('../models/form.models');


const formsave=async(req,res)=>{
    try{
        const newForm = new form({
            fields: req.body.fields
        });
        await newForm.save();
        res.json({message :'form saved'});

    }catch(err){
        res.json({message:'error'});
    }
}

module.exports = {formsave};