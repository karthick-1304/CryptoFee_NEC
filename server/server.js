  const express =require("express")
  const mongoose = require("mongoose")
  const cors = require("cors")
  const StudModel = require("./models/student")
  const multer = require("multer");
  const path = require("path");
  const xlsx = require("xlsx");
  const nodemailer = require('nodemailer');

  require('dotenv').config({ path: './.env' });

  const app=express()
  app.use(express.json())
  app.use(cors())

  mongoose.connect(process.env.MONGO_CNCT_STR);

  app.post("/home", (req, res) => {
      const { Reg_No, password } = req.body;
      const batchyearlogin = `20${Reg_No.substring(0, 2)}_Batch`;

      mongoose.connection.db.collection(batchyearlogin).findOne(
          { "students.RegNo": Reg_No }, 
          { projection: { "students.$": 1 } }
      )
      .then((result) => {
          if (result && result.students.length > 0) {
              const student = result.students[0]; 
              if (student.DOB === password) {  
                  res.status(200).json(student); // Return student details on success
              } else {
                  res.status(200).json({ message: "The password is incorrect" });
              }
          } else {
              res.status(200).json({ message: "Reg No not found" });
          }
      })
      .catch((err) => {
          res.status(500).json("Server error");
      });
  });

  app.post("/admin/login", async (req, res) => {
    const { adminId, password } = req.body;
  
    try {
      const collection = mongoose.connection.db.collection("admins");

      const admin = await collection.findOne({ adminId: adminId });
      if (!admin) {
        return res.json({ success: false, message: "Admin Not Found" });
      }
      if (admin.password !== password) {
        return res.json({ success: false, message: "Incorrect Password" });
      }
      res.json({ success: true, message: "Admin login successful!" });
    } 
    catch (error) {
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });
    

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});
const upload = multer({ storage: storage });

  
  app.post("/upload", upload.single("file"), async (req, res) => {
    const { batchYear } = req.body;
    const file = req.file;

    const expectedColumns = [
      "Batchyear",
      "Degree",
      "Branch",
      "Regno",
      "Name",
      "DOB",
      "Semester",
      "Place",
      "Accommodation",
      "Enrollment",
      "Photo",
      "YEAR_1_TuitionFee",
      "SEM_1_ExamFee",
      "SEM_1_BusFee",
      "SEM_1_HostelFee",
      "SEM_1_MessFee",
      "SEM_2_ExamFee",
      "SEM_2_BusFee",
      "SEM_2_HostelFee",
      "SEM_2_MessFee",
      "YEAR_2_TuitionFee",
      "SEM_3_ExamFee",
      "SEM_3_BusFee",
      "SEM_3_HostelFee",
      "SEM_3_MessFee",
      "SEM_4_ExamFee",
      "SEM_4_BusFee",
      "SEM_4_HostelFee",
      "SEM_4_MessFee",
      "YEAR_3_TuitionFee",
      "SEM_5_ExamFee",
      "SEM_5_BusFee",
      "SEM_5_HostelFee",
      "SEM_5_MessFee",
      "SEM_6_ExamFee",
      "SEM_6_BusFee",
      "SEM_6_HostelFee",
      "SEM_6_MessFee",
      "YEAR_4_TuitionFee",
      "SEM_7_ExamFee",
      "SEM_7_BusFee",
      "SEM_7_HostelFee",
      "SEM_7_MessFee",
      "SEM_8_ExamFee",
      "SEM_8_BusFee",
      "SEM_8_HostelFee",
      "SEM_8_MessFee",
    ];

    if (!batchYear || !file) {
      return res.status(400).json({ message: "Batch year and file are required." });
    }

    try {
      // Parse XLSX file
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const columns = Object.keys(rows[0]);

      const mismatchedColumns = expectedColumns.map((col, index) => {
        if (col !== columns[index]) {
          return `Expected: '${col}', Found: '${columns[index] || "undefined"}' at index ${index}`;
        }
      }).filter(Boolean);
      
      if (mismatchedColumns.length > 0) {
        throw new Error(`Invalid column format. Mismatched columns:\n${mismatchedColumns.join("\n")}`);
      }
      
      // Transform data
      const departmentData = {};
      rows.forEach((row) => {
        if (
          !row.Batchyear ||
          !row.Degree ||
          !row.Branch ||
          !row.Regno ||
          !row.Name ||
          !row.DOB ||
          !row.Semester ||
          !row.Place ||
          !row.Accommodation ||
          !row.Enrollment ||
          !row.Photo||
          !row.YEAR_1_TuitionFee||
          !row.SEM_1_ExamFee ||
          !((row.SEM_1_BusFee&& !(row.SEM_1_HostelFee)&& !(row.SEM_1_MessFee))||(!(row.SEM_1_BusFee)&&row.SEM_1_HostelFee&&row.SEM_1_MessFee ))||
          !row.SEM_2_ExamFee||
          !((row.SEM_2_BusFee&& !(row.SEM_2_HostelFee)&& !(row.SEM_2_MessFee))||(!(row.SEM_2_BusFee)&&row.SEM_2_HostelFee&&row.SEM_2_MessFee ))||
          !row.YEAR_2_TuitionFee ||
          !row.SEM_3_ExamFee ||
          !((row.SEM_3_BusFee&& !(row.SEM_3_HostelFee)&& !(row.SEM_3_MessFee))||(!(row.SEM_3_BusFee)&&row.SEM_3_HostelFee&&row.SEM_3_MessFee ))||
          !row.SEM_4_ExamFee ||
          !((row.SEM_4_BusFee&& !(row.SEM_4_HostelFee)&& !(row.SEM_4_MessFee))||(!(row.SEM_4_BusFee)&&row.SEM_4_HostelFee&&row.SEM_4_MessFee ))||
          !row.YEAR_3_TuitionFee ||
          !row.SEM_5_ExamFee ||
          !((row.SEM_5_BusFee&& !(row.SEM_5_HostelFee)&& !(row.SEM_5_MessFee))||(!(row.SEM_5_BusFee)&&row.SEM_5_HostelFee&&row.SEM_5_MessFee ))||
          !row.SEM_6_ExamFee ||
          !((row.SEM_6_BusFee&& !(row.SEM_6_HostelFee)&& !(row.SEM_6_MessFee))||(!(row.SEM_6_BusFee)&&row.SEM_6_HostelFee&&row.SEM_6_MessFee ))||
          !row.YEAR_4_TuitionFee ||
          !row.SEM_7_ExamFee ||
          !((row.SEM_7_BusFee&& !(row.SEM_7_HostelFee)&& !(row.SEM_7_MessFee))||(!(row.SEM_7_BusFee)&&row.SEM_7_HostelFee&&row.SEM_7_MessFee ))||
          !row.SEM_8_ExamFee ||
          !((row.SEM_8_BusFee&& !(row.SEM_8_HostelFee)&& !(row.SEM_8_MessFee))||(!(row.SEM_8_BusFee)&&row.SEM_8_HostelFee&&row.SEM_8_MessFee ))
        ) {
          throw new Error("Missing required fields in the Excel file.");
        }

        const department = row.Branch;
        if (!departmentData[department]) {
          departmentData[department] = {
            department,
            students: [],
          };
        }

        departmentData[department].students.push({
          Name: row.Name,
          Degree: row.Degree,
          Branch: row.Branch,
          Semester: String(row.Semester),
          DOB: String(row.DOB),
          Batchyear: row.Batchyear,
          RegNo: String(row.Regno),
          place: row.Place,
          Accommodation: row.Accommodation,
          Enrollment: row.Enrollment,
          Photo:row.Photo,
          Fees: {
            YEAR_1_TuitionFee: parseFloat(row.YEAR_1_TuitionFee),
            SEM_1_ExamFee: parseFloat(row.SEM_1_ExamFee),
            SEM_1_BusFee: parseFloat(row.SEM_1_BusFee),
            SEM_1_HostelFee: parseFloat(row.SEM_1_HostelFee),
            SEM_1_MessFee: parseFloat(row.SEM_1_MessFee),

            SEM_2_ExamFee: parseFloat(row.SEM_2_ExamFee),
            SEM_2_BusFee: parseFloat(row.SEM_2_BusFee),
            SEM_2_HostelFee: parseFloat(row.SEM_2_HostelFee),
            SEM_2_MessFee: parseFloat(row.SEM_2_MessFee),

            YEAR_2_TuitionFee: parseFloat(row.YEAR_2_TuitionFee),
            SEM_3_ExamFee: parseFloat(row.SEM_3_ExamFee),
            SEM_3_BusFee: parseFloat(row.SEM_3_BusFee),
            SEM_3_HostelFee: parseFloat(row.SEM_3_HostelFee),
            SEM_3_MessFee: parseFloat(row.SEM_3_MessFee),

            SEM_4_ExamFee: parseFloat(row.SEM_4_ExamFee),
            SEM_4_BusFee: parseFloat(row.SEM_4_BusFee),
            SEM_4_HostelFee: parseFloat(row.SEM_4_HostelFee),
            SEM_4_MessFee: parseFloat(row.SEM_4_MessFee),

            YEAR_3_TuitionFee: parseFloat(row.YEAR_3_TuitionFee),
            SEM_5_ExamFee: parseFloat(row.SEM_5_ExamFee),
            SEM_5_BusFee: parseFloat(row.SEM_5_BusFee),
            SEM_5_HostelFee: parseFloat(row.SEM_5_HostelFee),
            SEM_5_MessFee: parseFloat(row.SEM_5_MessFee),

            SEM_6_ExamFee: parseFloat(row.SEM_6_ExamFee),
            SEM_6_BusFee: parseFloat(row.SEM_6_BusFee),
            SEM_6_HostelFee: parseFloat(row.SEM_6_HostelFee),
            SEM_6_MessFee: parseFloat(row.SEM_6_MessFee),

            YEAR_4_TuitionFee: parseFloat(row.YEAR_4_TuitionFee),
            SEM_7_ExamFee: parseFloat(row.SEM_7_ExamFee),
            SEM_7_BusFee: parseFloat(row.SEM_7_BusFee),
            SEM_7_HostelFee: parseFloat(row.SEM_7_HostelFee),
            SEM_7_MessFee: parseFloat(row.SEM_7_MessFee),

            SEM_8_ExamFee: parseFloat(row.SEM_8_ExamFee),
            SEM_8_BusFee: parseFloat(row.SEM_8_BusFee),
            SEM_8_HostelFee: parseFloat(row.SEM_8_HostelFee),
            SEM_8_MessFee: parseFloat(row.SEM_8_MessFee),

          },
          isPaid_Fees: {
            isPaid_YEAR_1_TuitionFee: null,
            isPaid_SEM_1_ExamFee: null,
            isPaid_SEM_1_BusFee: null,
            isPaid_SEM_1_HostelFee: null,
            isPaid_SEM_1_MessFee: null,

            isPaid_SEM_2_ExamFee: null,
            isPaid_SEM_2_BusFee: null,
            isPaid_SEM_2_HostelFee: null,
            isPaid_SEM_2_MessFee: null,

            isPaid_YEAR_2_TuitionFee: null,
            isPaid_SEM_3_ExamFee: null,
            isPaid_SEM_3_BusFee: null,
            isPaid_SEM_3_HostelFee: null,
            isPaid_SEM_3_MessFee: null,

            isPaid_SEM_4_ExamFee: null,
            isPaid_SEM_4_BusFee: null,
            isPaid_SEM_4_HostelFee: null,
            isPaid_SEM_4_MessFee: null,

            isPaid_YEAR_3_TuitionFee: null,
            isPaid_SEM_5_ExamFee: null,
            isPaid_SEM_5_BusFee: null,
            isPaid_SEM_5_HostelFee: null,
            isPaid_SEM_5_MessFee: null,

            isPaid_SEM_6_ExamFee: null,
            isPaid_SEM_6_BusFee: null,
            isPaid_SEM_6_HostelFee: null,
            isPaid_SEM_6_MessFee: null,

            isPaid_YEAR_4_TuitionFee: null,
            isPaid_SEM_7_ExamFee: null,
            isPaid_SEM_7_BusFee: null,
            isPaid_SEM_7_HostelFee: null,
            isPaid_SEM_7_MessFee: null,

            isPaid_SEM_8_ExamFee: null,
            isPaid_SEM_8_BusFee: null,
            isPaid_SEM_8_HostelFee: null,
            isPaid_SEM_8_MessFee: null,

          },
        });
      });
      
      // Save transformed data to MongoDB
      const collectionName = `${batchYear}_Batch`;
      const batchCollection = mongoose.connection.collection(collectionName);

      const departmentDocuments = Object.values(departmentData);
      await batchCollection.insertMany(departmentDocuments);

      res.status(200).json({ message: "File uploaded and data inserted successfully!" });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ message: "Error processing file: " + error.message });
    }
  });
  app.post("/release-fee", async (req, res) => {
    console.log('hiiii')
    const { batchYear, feeType, dueDates, fineAmounts } = req.body; // Matches the client payload structure
    console.log('from server batchYear:', batchYear);
    console.log('from server feeType:', feeType);
    console.log('from server req.body:', req.body);
    if (!batchYear || !feeType || !dueDates || !fineAmounts) {
      return res.status(400).json({ message: "Batch year or fee type or due dates or fine amounts are missing." });
    }

    try {
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionExists = collections.some((col) => col.name === `${batchYear}_Batch`);
        if (!collectionExists) {
            return res.status(404).json({ message: `Batch year collection "${batchYear}" does not exist.` });
        }
        const batchCollection = mongoose.connection.collection(`${batchYear}_Batch`);
        const fineCollection = mongoose.connection.collection("Fine_Amounts");
        // Check if feeType exists in any student's "isPaid_Fees"
        // Clean feeType for internal checks
        const studentExists = await batchCollection.findOne({
            "students.isPaid_Fees": { $exists: true }
        });
        if (!studentExists || !studentExists.students.some(student => student.isPaid_Fees.hasOwnProperty(feeType))) {
            return res.status(400).json({ message: `Fee type "${feeType}" does not exist in the students' isPaid_Fees.` });
        }

        // Ensure due dates are in strictly increasing order
        for (let i = 0; i < dueDates.length - 1; i++) {
            if (new Date(dueDates[i]) >= new Date(dueDates[i + 1])) {
                return res.status(400).json({ message: "Due dates must be in strictly increasing order." });
            }
        }

        // Ensure fine amounts are not zero
        for (let i = 0; i < fineAmounts.length; i++) {
            if (fineAmounts[i] <= 0) {
                return res.status(400).json({ message: `Fine amount for due date ${dueDates[i]} cannot be zero or negative.` });
            }
        }
      // Update the documents
      await batchCollection.updateMany(
        {
          [`students.isPaid_Fees.${feeType}`]: null, // Match where feeType is null
        },
        {
          $set: {
            [`students.$[student].isPaid_Fees.${feeType}`]: false, // Set feeType to false
          },
        },
        {
          arrayFilters: [
            { [`student.isPaid_Fees.${feeType}`]: null }, // Match array elements where feeType is null
          ],
        }
      );
      const cleanFeetype=feeType.replace("isPaid_","");
      let fineDoc = await fineCollection.findOne({ [`${batchYear}_Batch`]: { $exists: true } });
      if (!fineDoc) {
        fineDoc = {
          [`${batchYear}_Batch`]: {} // Initialize an empty object for the batch year
        };
      }
  
      // Check if the feeType exists for the batch year, if not, initialize it
      if (!fineDoc[`${batchYear}_Batch`][cleanFeetype]) {
        fineDoc[`${batchYear}_Batch`][cleanFeetype] = [[], []]; // Initialize with empty arrays for dueDates and fineAmounts
      }
  
      // Add the dueDates and fineAmounts to the feeType arrays
      fineDoc[`${batchYear}_Batch`][cleanFeetype][0] = dueDates;
      fineDoc[`${batchYear}_Batch`][cleanFeetype][1] = fineAmounts;
  
      // Update the Fine_Amounts collection with the updated document
      await fineCollection.updateOne(
        { [`${batchYear}_Batch`]: { $exists: true } }, // Check if batch year exists
        {
          $set: fineDoc // Set the updated document
        },
        { upsert: true } // Create the document if it doesn't exist
      );

      res.status(200).json({ message: "Fee released successfully!" });
    } catch (error) {
      console.error("Error releasing fee:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app.post('/releasee-Fee', async (req, res) => {
    try {
        const { batchYear, fee, dueDates, fineAmounts } = req.body; // Destructure the request body
        const batchCollection = `${batchYear}_Batch`;
  
        // Fetch all students from the batch collection
        const students = await mongoose.connection.collection(batchCollection).aggregate([
          { $unwind: "$students" },
          { $project: { _id: 0, reg_no: "$students.RegNo",Name:"$students.Name" } }
        ]).toArray();
        
        
        if (!students || students.length === 0) {
            return res.status(404).send({ message: "No students found for the batch year" });
        }
  
        // Create transporter for nodemailer
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '2212076@nec.edu.in',
                pass: 'karthi@3737' // Use the App Password generated
            }
        });
  
        // Iterate over students and send emails
        for (const student of students) {
            const email = `2212076@nec.edu.in`; //${student.reg_no}@nec.edu.in
            const regNo = student.reg_no;
            const name = student.Name;
            console.log(regNo,name)
            console.log('email:',email)
            // Format the email content dynamically
            const emailSubject = `Fee Release Notification for Batch ${batchYear}`;
  
            // Format due dates and fine amounts into a structured table
            const feeDetailsFormatted = `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${fee}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">
                        <table style="border-collapse: collapse; width: 100%; text-align: left;">
                            ${dueDates.map((dueDate, index) => `
                                <tr>
                                    <td style="padding: 4px; border: 1px solid #ddd;">Due Date: ${dueDate}</td>
                                    <td style="padding: 4px; border: 1px solid #ddd;">Fine: ${fineAmounts[index]}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </td>
                </tr>
            `;
  
            // Updated email body
            const emailBody = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <p style="color: #333;">Dear Student,</p>
                    <p style="color: #333;">We are pleased to inform you that the fee for your batch (${batchYear}) has been released. Below are the details:</p>
                    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                        <thead style="background-color: #f2f2f2;">
                            <tr>
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Fee Type</th>
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${feeDetailsFormatted}
                        </tbody>
                    </table>
                    <p style="color: #333;">Please ensure to pay the fees before the due dates to avoid fines.</p>
                    <p style="color: #333;">Thank you,<br><strong>Admin Team</strong></p>
                </div>
            `;
  
            // Send the email
            await transporter.sendMail({
                from: '"Admin Team" <2212076@nec.edu.in>', // Replace with your email
                to: email,
                subject: emailSubject,
                html: emailBody
            });
  
  
            console.log(`Email sent to ${email}`);
        }
  
        res.status(200).send({ message: 'Emails sent successfully to all students' });
    } catch (error) {
        console.error("Error sending emails:", error);
        res.status(500).send({ message: 'Error sending emails', error });
    }
  });
  


  app.post("/fetch-students-for-fee", async (req, res) => {
    const { batchYear, department, feeType } = req.body;

    try {
      console.log('batchYear:',batchYear,'department:',department,'feeType:',feeType)
        const collectionName = `${batchYear}_Batch`;
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionExists = collections.some((col) => col.name === collectionName);
      console.log('collectionExists:',collectionExists)
        if (!collectionExists) {
            return res.status(404).json({ message: `Batch year collection "${collectionName}" does not exist.` });
        }

        const batchCollection = mongoose.connection.collection(collectionName);

        const sampleStudent = await batchCollection.findOne({
          department: department,
          "students.isPaid_Fees": { $exists: true }
        });

        if (!sampleStudent || !sampleStudent.students.some(student => student.isPaid_Fees.hasOwnProperty(feeType))) {
            return res.status(400).json({ message: `Fee type "${feeType}" does not exist in the students' isPaid_Fees.` });
        }

        const students = await batchCollection.aggregate([
    { $match: { department: department } },
    { $unwind: "$students" },
    {
        $project: {
            Name: "$students.Name",
            RegNo: "$students.RegNo",
            isPaid_Fee: `$students.isPaid_Fees.${feeType}`,
            feeAmount: {
                $arrayElemAt: [
                    {
                        $map: {
                            input: { $objectToArray: "$students.Fees" },
                            as: "fee",
                            in: {
                                k: "$$fee.k",
                                v: "$$fee.v"
                            }
                        }
                    },
                    {
                        $indexOfArray: [
                            {
                                $map: {
                                    input: { $objectToArray: "$students.Fees" },
                                    as: "fee",
                                    in: { $toString: "$$fee.k" }
                                }
                            },
                            feeType.replace("isPaid_", "")
                        ]
                    }
                ]
            }
        }
    },
    {
        $match: {
            "feeAmount.v": { $gt: 0 }
        }
    }
]).toArray();

      

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for the given department or fee type." });
        }

        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students for fee:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
});


    
    // Endpoint to fetch a student's fee details
    app.post("/fetchstudentfeedetails", async (req, res) => {
      const { batchYear, department, studentRegNo } = req.body;
  
      try {
          const collectionName = `${batchYear}_Batch`;
          const collections = await mongoose.connection.db.listCollections().toArray();
          const collectionExists = collections.some((coll) => coll.name === collectionName);
  
          if (!collectionExists) {
              return res.status(404).json({ message: `Batch year ${batchYear} does not exist.` });
          }
  
          const batchCollection = mongoose.connection.collection(collectionName);
  
          const student = await batchCollection.aggregate([
              { $match: { department } },
              { $unwind: "$students" },
              { $match: { "students.RegNo": studentRegNo } },
              { $project: { "students.Name": 1, "students.RegNo": 1, "students.isPaid_Fees": 1 ,"students.Fees":1} },
          ]).toArray();
  
          if (student.length === 0) {
              return res.status(404).json({ message: `Student with RegNo ${studentRegNo} not found in department ${department} of batch ${batchYear}.` });
          }
  
          res.status(200).json(student[0].students);
      } catch (error) {
          console.error("Error in fetching student details:", error.message);
          res.status(500).json({ message: "Internal Server Error: " + error.message });
      }
  });
  

    app.get("/pay", (req, res) => {
      const { RegNo, Batchyear } = req.query;
      console.log('RegNo:',RegNo,'Batchyear:',Batchyear)
      if (!RegNo ) {
        return res.status(400).json("Please provide a valid RegNo");
      }
      if(!Batchyear){
        return res.status(400).json("Please provide a valid BatchYear");
      }

      const batchYearLogin = `${Batchyear}_Batch`;
  
     // Fetch the student's fee data
      mongoose.connection.db.collection(batchYearLogin).findOne(
        { "students.RegNo": RegNo },
        { projection: { "students.$": 1 } } 
      )
      .then((result) => {
        if (result && result.students.length > 0) {
          const student = result.students[0];
          const filteredFees = {};
  
          // Filter unpaid fees
          for (const [key, value] of Object.entries(student.isPaid_Fees || {})) {
            if (value == false) {
              const feeKey = key.replace("isPaid_", ""); // Remove "isPaid_" prefix
              filteredFees[feeKey] = student.Fees[feeKey];
            }
          }
  
          // Now, fetch the due dates and fine amounts from the FineAmounts collection
          mongoose.connection.db.collection('Fine_Amounts').findOne(
            { [batchYearLogin]: { $exists: true } }, 
            { projection: { [batchYearLogin]: 1 } }
          ).then((fineResult) => {

            if (fineResult && fineResult[batchYearLogin]) {
              const fineData = fineResult[batchYearLogin]; 
              const fineAmounts = {};
  
              // Iterate over the fees and get the corresponding fine data
              for (const feeType of Object.keys(filteredFees)) {
                const feeFineData = fineData[feeType]; 
                if (feeFineData) {
                  fineAmounts[feeType] = {
                    dueDates: feeFineData[0],
                    fineAmounts: feeFineData[1],
                  };
                }
              }
              res.status(200).json({ Fees: filteredFees, FineAmounts: fineAmounts });
            }
            else {
              res.status(404).json({ message: "Fine data not found for the batch year" });
            }
          })
          .catch((err) => {
            res.status(500).json("Server error while fetching fine amounts");
          });
        }
        else {
          res.status(404).json({ message: "Reg No not found" });
        }
      })
      .catch((err) => {
        res.status(500).json("Server error while fetching student data");
      });
  });
  

  // POST endpoint to update fees payment status
  app.post('/fees', async (req, res) => {
    try {
        const {
            RegNo1,
            Name1,
            Degree1,
            Branch1,
            Semester1,
            Batchyear1,
            DOB1,
            Photo1,
            feesData1,
            selectedFees1,
            fineAmounts1,
            fineAmountManager1,
            fineTotals1,
            totalAmount1,
            transactionId1,
            timestamp1,
        } = req.body;
        const selectedFeesArray = Array.isArray(selectedFees1)
    ? selectedFees1
    : selectedFees1.split(",");

        const feeSummary = selectedFeesArray.map((fee, index) => {
          const feeFineDetails = fineAmounts1[fee];
          const dueDates = feeFineDetails.dueDates;
          const fineAmounts = feeFineDetails.fineAmounts;
  
          const dueDetails = dueDates.map((dueDate, idx) => ({
              dueDate,
              fineAmount: fineAmounts[idx],
              isApplicable: fineAmountManager1[fee]?.[idx] > 0,
              daysLate: idx === 2 ? fineAmountManager1[fee][idx] : null // Only include days late for the third due date
          }));
  
          return {
              feeName: fee,
              originalFeeAmount: feesData1[fee], // Original fee amount from fineData
              fineFeePaid: fineTotals1[fee] || 0, // Fine fee paid (if any)
              totalFeePaid: (feesData1[fee]+fineTotals1[fee] || 0),
              dueDetails // Array of due date details
          };
      });

        // Prepare the fee payment details
        const feeDetails = {
            RegNo: RegNo1,
            Name: Name1,
            Degree: Degree1,
            Branch: Branch1,
            Semester: Semester1,
            Batchyear: Batchyear1,
            DOB: DOB1,
            photo: Photo1,
            selectedFees: feeSummary,
            totalAmount: totalAmount1,
            transactionId: transactionId1,
            timestamp: timestamp1,
        };

        // Save directly to the 'fees' collection
        const feesCollection = mongoose.connection.db.collection('fees');
        await feesCollection.insertOne(feeDetails);

        // Update the student's fees ispaid status
        const batchyearlogin = `20${RegNo1.substring(0, 2)}_Batch`;
        const result = await mongoose.connection.db.collection(batchyearlogin).findOne(
            { "students.RegNo": RegNo1 },
            { projection: { "students.$": 1 } }
        );

        if (!result || !result.students || result.students.length === 0) {
            return res.status(404).send({ message: "Reg No not found" });
        }

        const student = result.students[0]; 
        const updateFields = {};

        // Update isPaid_Fees based on selected fees
        selectedFeesArray.forEach((feeKey) => {
            if (student.isPaid_Fees?.hasOwnProperty(`isPaid_${feeKey}`)) {
                updateFields[`students.$.isPaid_Fees.isPaid_${feeKey}`] = true;
            }
        });

        if (Object.keys(updateFields).length > 0) {
            await mongoose.connection.db.collection(batchyearlogin).updateOne(
                { "students.RegNo": RegNo1 },
                { $set: updateFields }
            );
            res.status(200).send({ message: 'Fees updated successfully' });
        } else {
            res.status(400).send({ message: 'No valid fields to update' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: 'Error updating fees', error });
    }
});



  app.listen(process.env.PORT,()=>{
      console.log("server is running")
  })
