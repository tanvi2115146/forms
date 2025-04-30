const Visitor = require('../models/visitor.model');


const createVisitor = async (req, res) => {
const { formId } = req.body;
try {
  const visitor = await Visitor.create({
    formId,
    isLeadForm: false, 
    questionStats: [],
    leadForm: []
  });
  res.status(201).json(visitor);
} catch (err) {
  res.status(500).json({ error: err.message });
}
};


const updateQuestionStats = async (req, res) => {
const { questionStats } = req.body;
const { visitorId } = req.params;

try {
  const visitor = await Visitor.findById(visitorId);
  if (!visitor) return res.status(404).json({ error: "Visitor not found" });

  questionStats.forEach((incoming) => {
    const existing = visitor.questionStats.find(q => q.question === incoming.question);
    if (existing) {
      existing.answer = incoming.answer;
      existing.answerText = incoming.answerText;
    } else {
      visitor.questionStats.push(incoming);
    }
  });

  await visitor.save();
  res.json(visitor);
} catch (err) {
  res.status(500).json({ error: err.message });
}
};


const submitLead = async (req, res) => {
const { data } = req.body;
const { visitorId } = req.params;

try {
  const visitor = await Visitor.findByIdAndUpdate(visitorId, {
    $push: { leadForm: { data } },
    isLeadForm: true
  }, { new: true });

  res.json(visitor);
} catch (err) {
  res.status(500).json({ error: err.message });
}
};





module.exports = {createVisitor,submitLead,updateQuestionStats};
