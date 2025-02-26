const mongoose = require('mongoose');

// Schema for Fees
const FeesSchema = new mongoose.Schema({
    BusFee: { type: Number, default: 0 },
    ExamFee: { type: Number, default: 0 },
    HostelFee: { type: Number, default: 0 },
    TuitionFee: { type: Number, default: 0 }
});

// Schema for isPaid_Fees
const IsPaidFeesSchema = new mongoose.Schema({
    isPaid_BusFee: { type: Boolean, default: null },
    isPaid_ExamFee: { type: Boolean, default: null },
    isPaid_HostelFee: { type: Boolean, default: null },
    isPaid_TuitionFee: { type: Boolean, default: null }
});

// Schema for individual students
const StudentSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Degree: { type: String, required: true },
    Branch: { type: String, required: true },
    Semester: { type: Number, required: true },
    DOB: { type: String, required: true },
    Batchyear: { type: Number, required: true },
    RegNo: { type: Number, required: true },
    place: { type: String, required: true },
    Accommodation: { type: String, required: true },
    Enrollment: { type: String, required: true },
    Fees: { type: FeesSchema, required: true },
    isPaid_Fees: { type: IsPaidFeesSchema, required: true }
});

// Schema for the 2022_Batch collection
const BatchSchema = new mongoose.Schema({
    department: { type: String, required: true },
    students: { type: [StudentSchema], required: true }
});

// Model for the 2022_Batch collection
const BatchModel = mongoose.model("2022_Batch", BatchSchema);

module.exports = BatchModel;
