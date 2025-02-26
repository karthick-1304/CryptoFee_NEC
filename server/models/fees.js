const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  RegNo: { type: String, required: true },
  selectedFees: { type: [String], required: true },
  totalAmount: { type: String, required: true },
  transactionId: { type: String, required: true },
  timestamp: { type: String}
});

const Fee = mongoose.model("fees", feeSchema);

module.exports = Fee;
