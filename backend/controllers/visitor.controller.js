const Visitor = require('../models/visitor.model');




const createVisitor = async (req, res) => {
  const { formId, formFields, isLeadForm } = req.body;
  
  try {
    const initialQuestionStats = formFields.map(field => ({
      questionId: field._id || new mongoose.Types.ObjectId().toString(),
      question: field.label || field.type,
      answer: false,
      answerText: '',
      fieldType: field.type
    }));

    
    const visitor = await Visitor.create({
      formId,
      isLeadForm: isLeadForm || false, 
      questionStats: initialQuestionStats,
      leadForm: []
    });
    
    res.status(201).json(visitor);
  } catch (err) {
    console.error('Error creating visitor:', err);
    res.status(500).json({ 
      error: 'Failed to create visitor',
      details: err.message 
    });
  }
};

const updateQuestionStats = async (req,res) => {
  const { questionStats } = req.body;
  const { visitorId } = req.params;

  try {
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) return res.status(404).json({ error: "Visitor not found" });

    questionStats.forEach((incoming) => {
     
      if (!incoming.questionId || !incoming.fieldType) {
        throw new Error(`Missing required fields: ${JSON.stringify(incoming)}`);
      }

      const existing = visitor.questionStats.id(incoming.questionId) || 
        visitor.questionStats.find(q => 
          q.questionId === incoming.questionId
        );
      
      if (existing) {
        existing.answer = incoming.answer;
        existing.answerText = incoming.answerText;
        existing.fieldType = incoming.fieldType;
      } else {
       
        const newQuestion = {
          questionId: incoming.questionId,
          question: incoming.question || '',
          answer: incoming.answer || false,
          answerText: incoming.answerText || '',
          fieldType: incoming.fieldType
        };
        visitor.questionStats.push(newQuestion);
      }
    });

    await visitor.save();
    res.json(visitor);
  } catch (err) {
    console.error('Error updating question stats:', err);
    res.status(500).json({ 
      error: "Failed to update question stats",
      details: err.message 
    });
  }
};





const submitLead = async (req, res) => {
  const { data } = req.body;
  const { visitorId } = req.params;

  try {
    const visitor = await Visitor.findByIdAndUpdate(
      visitorId,
      {
        $push: { leadForm: { data } },
        isLeadForm: true
      },
      { new: true }
    );

   
    await Visitor.updateOne(
      { _id: visitorId, "questionStats.fieldType": "lead" },
      {
        $set: {
          "questionStats.$.answer": true,
          "questionStats.$.answerText": JSON.stringify(data)
        }
      }
    );

    const updatedVisitor = await Visitor.findById(visitorId);
    res.json(updatedVisitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




module.exports = {createVisitor,submitLead,updateQuestionStats};
