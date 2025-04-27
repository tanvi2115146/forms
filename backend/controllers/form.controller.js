const Form = require('../models/form.models');
const { v4: uuidv4 } = require('uuid');


const createForm = async (req, res) => {
  try {
    const { userId } = req.body;
    const formId = uuidv4(); 

    const newForm = new Form({
      userId,
      formId,
      fields: []  
    });

    await newForm.save();

    res.status(201).json({ message: 'Form created', formId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating form' });
  }
};




const saveForm = async (req, res) => {
  const { formId, fields } = req.body;

  try {
    const form = await Form.findOneAndUpdate(
      { formId },
      { fields },
      { new: true }
    );

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json({ message: 'Form saved successfully', form });
  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).json({ message: 'Failed to save form' });
  }
};





const getFormsByUserId = async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.params.userId });
    if (!forms || forms.length === 0) {
      return res.json({ message: 'No forms found' });
    }
    res.json(forms); 
  } catch (err) {
    res.status(500).json({ message: 'error', error: err });
  }
};





const getFormByFormId = async (req, res) => {
  try {
    const formId = req.params.formId;
    const form = await Form.findOne({ formId: req.params.formId });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching form', error: err });
  }
};



module.exports={createForm,saveForm,getFormsByUserId,getFormByFormId}