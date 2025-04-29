const Visitor = require('../models/visitor.model');


const createVisitor= async (req, res) => {
  try {
    const visitor = new Visitor();
    await visitor.save();
    res.status(201).json(visitor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const submitLead= async (req, res) => {
  const { visitorId } = req.params;
  const { leadForm } = req.body;

  try {
    const visitor = await Visitor.findByIdAndUpdate(visitorId, {
      leadForm,
      isLead: true
    }, { new: true });

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {createVisitor,submitLead};
