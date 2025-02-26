import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf"; 
import headerPDF from './headerPDF.jpeg';
import stamp from './stamp.jpeg'; 
import "./Admindashboard.css"
import { set } from "mongoose";
const AdminDashboard = () => {
  const [batchYear1, setBatchYear1] = useState("");
  const [file, setFile] = useState(null);

  
  const [batchYear3, setBatchYear3] = useState("");
  const [feeType, setFeeType] = useState("");
  const [dueDate1, setDueDate1] = useState("");  
  const [fineAmount1, setFineAmount1] = useState("");  
  const [dueDate2, setDueDate2] = useState(""); 
  const [fineAmount2, setFineAmount2] = useState(""); 
  const [dueDate3, setDueDate3] = useState("");  
  const [fineAmount3, setFineAmount3] = useState(""); 

  const [batchYear2, setBatchYear2] = useState("");
  const [department, setDepartment] = useState("");
  const [feeType2, setFeeType2] = useState("");

  const [batchYear4, setBatchYear4] = useState(""); 
  const [studentRegNo, setStudentRegNo] = useState("");
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchYear1) {
      alert("Please Enter Batch Year");
      return;
    }
    if (!file) {
      alert("Please Choose The File To Upload.");
      return;
    }

    const formData = new FormData();
    formData.append("batchYear", batchYear1);
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:3001/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setBatchYear1("")
      setFile("");
      alert(response.data.message);
    } catch (error) {
      alert("Error uploading file: " + error.response.data.message || error.message);
    }
  };

  const fetchStudentsForFee = async () => {
    if (!batchYear2 ) {
        alert("Please Enter The Batch Year");
        return;
    }
    if(!department){
      alert("Please Select Department");
      return;
    }
    if(!feeType2){
      alert("Please Enter Fee Type");
      return;
    }

    try {
      const payload = {
        batchYear: batchYear2,
        department,
        feeType: 'isPaid_' + feeType2, 
      };
  
      const response = await axios.post("http://localhost:3001/fetch-students-for-fee", payload);

        const students = response.data;
        if (!students || students.length === 0) {
          alert("No students found for the provided batch year, department, or fee type.");
          return;
      }

        const doc = new jsPDF();
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight()-3;

        const headerBase64 = await loadImageAsBase64(headerPDF);
        const stampBase64 = await loadImageAsBase64(stamp);

        const addPageDesign = () => {
            // Add header
            doc.addImage(headerBase64, 'JPEG', margin + 10, margin+5, 170, 40);

            // Draw border
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(margin, margin, pageWidth - margin, margin); // Top margin
            doc.line(margin, margin, margin, pageHeight - margin); // Left margin
            doc.line(pageWidth - margin, margin, pageWidth - margin, pageHeight - margin); // Right margin
            doc.line(margin, pageHeight - margin, pageWidth - margin, pageHeight - margin); // Bottom margin

            // Add footer (stamp and verification text)
            const footerStartY = pageHeight - margin - 30;
            const stampWidth = 40;
            const stampHeight = 40;
            doc.addImage(stampBase64, 'JPEG', pageWidth - margin - stampWidth - 10, footerStartY - stampHeight, stampWidth, stampHeight);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('Verified by NEC_Authority', pageWidth - margin - stampWidth - 10, footerStartY - stampHeight + 45);
            doc.setFontSize(12);
            
        };

        // Add header and border on the first page
        addPageDesign();

        // Starting position for content
        let yPosition = margin + 50;
        const lineHeight = 10;

        // Helper function to handle page breaks
        const checkPageEnd = () => {
            if (yPosition + lineHeight > pageHeight - margin - 40) {
                doc.addPage();
                addPageDesign();
                yPosition = margin + 50;
            }
        };

        // Add title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Students with Fee Status", margin + 10, yPosition);
        yPosition += lineHeight;

        // Add details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Batch Year: ${batchYear2}`, margin + 10, yPosition);
        yPosition += lineHeight;
        doc.text(`Department: ${department}`, margin + 10, yPosition);
        yPosition += lineHeight;
        doc.text(`Fee Type: ${feeType2.replace("isPaid_", "")}`, margin + 10, yPosition);
        yPosition += lineHeight;
        const currentDate = new Date();
        const timestamp = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString('en-IN')}`;
        doc.setFont('helvetica', 'normal');
        doc.text(timestamp, margin + 10, yPosition);
        yPosition += lineHeight * 2;

        // Paid Students Section
        doc.setFont('helvetica', 'bold');
        doc.text("Paid Students:", margin + 10, yPosition);
        yPosition += lineHeight;
        console.log(students);
        const paidStudents = students.filter((student) => student.isPaid_Fee === true);

        if (paidStudents.length > 0) {
            doc.setFont('helvetica', 'normal');
            paidStudents.forEach((student, index) => {
                checkPageEnd();
                doc.text(`${index + 1}. ${student.Name} - RegNo: ${student.RegNo}`, margin + 20, yPosition);
                yPosition += lineHeight;
            });
        } else {
            doc.setFont('helvetica', 'normal');
            doc.text("None", margin + 20, yPosition);
            yPosition += lineHeight;
        }

        yPosition += lineHeight;

        // Unpaid Students Section
        doc.setFont('helvetica', 'bold');
        doc.text("Unpaid Students:", margin + 10, yPosition);
        yPosition += lineHeight;

        const unpaidStudents = students.filter((student) => student.isPaid_Fee === false);

        if (unpaidStudents.length > 0) {
            doc.setFont('helvetica', 'normal');
            unpaidStudents.forEach((student, index) => {
                checkPageEnd();
                doc.text(`${index + 1}. ${student.Name} - RegNo: ${student.RegNo}`, margin + 20, yPosition);
                yPosition += lineHeight;
            });
        } else {
            doc.setFont('helvetica', 'normal');
            doc.text("None", margin + 20, yPosition);
        }

        // Save the PDF
        doc.save("students-fee-status.pdf");
        setFeeType2("");
        setBatchYear2("")
        setDepartment("");
    }
    catch (error) {
        console.error("Error fetching students:", error); 
        const errorMsg = error.response?.data?.message || "Unknown error occurred.";
        alert(`Error: ${errorMsg}`);
    }
};
const loadImageAsBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imagePath; // Ensure path is correct
      img.crossOrigin = 'Anonymous'; // Required for cross-origin images
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = (error) => reject(`Failed to load image at ${imagePath}`);
  });
};



const releaseFee = async () => {
  // Validate input fields
  if (!batchYear3 || !feeType || !dueDate1 || !dueDate2 || !dueDate3 || !fineAmount1 || !fineAmount2 || !fineAmount3) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    // First payload for 'release-fee'
    const payloadReleaseFee = {
      batchYear: batchYear3,
      feeType: 'isPaid_' + feeType,
      dueDates: [dueDate1, dueDate2, dueDate3],
      fineAmounts: [fineAmount1, fineAmount2, fineAmount3],
    };

    // Call the first endpoint
    const responseReleaseFee = await axios.post("http://localhost:3001/release-fee", payloadReleaseFee);

    if (responseReleaseFee.status === 200) {
      console.log("First call (release-fee) successful:", responseReleaseFee.data);

      // Second payload for 'releasee-Fee'
      const payloadReleaseeFee = {
        batchYear: batchYear3,
        fee: feeType,
        dueDates: [dueDate1, dueDate2, dueDate3],
        fineAmounts: [fineAmount1, fineAmount2, fineAmount3],
      };

      // Call the second endpoint
      const responseReleaseeFee = await axios.post("http://localhost:3001/releasee-Fee", payloadReleaseeFee);

      if (responseReleaseeFee.status === 200) {
        console.log("Second call (releasee-Fee) successful:", responseReleaseeFee.data);
        alert("Fee released successfully through both calls!");

        // Reset the form fields
        setBatchYear3("");
        setFeeType("");
        setDueDate1("");
        setDueDate2("");
        setDueDate3("");
        setFineAmount1("");
        setFineAmount2("");
        setFineAmount3("");
      } else {
        throw new Error(`Second call failed with status: ${responseReleaseeFee.status}`);
      }
    } else {
      throw new Error(`First call failed with status: ${responseReleaseFee.status}`);
    }
  } catch (error) {
    // Handle errors from either call
    console.error("Error during release fee process:", error);
    alert("Error releasing fee: " + (error.response?.data?.message || error.message));
  }
};





  const fetchStudentFeeDetails = async () => {
    if (!batchYear4 || !department || !studentRegNo) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await axios.post("http://localhost:3001/fetchstudentfeedetails", {
            batchYear: batchYear4,
            department,
            studentRegNo
        });
        const student = response.data;
        console.log("Student data received:", student);

        const doc = new jsPDF();
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight() - 3;

        const headerBase64 = await loadImageAsBase64(headerPDF);
        const stampBase64 = await loadImageAsBase64(stamp);

        // Helper function to add header, border, and footer
        const addPageDesign = () => {
            // Add header
            doc.addImage(headerBase64, 'JPEG', margin + 10, margin + 5, 170, 40);

            // Draw border
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(margin, margin, pageWidth - margin, margin); // Top margin
            doc.line(margin, margin, margin, pageHeight - margin); // Left margin
            doc.line(pageWidth - margin, margin, pageWidth - margin, pageHeight - margin); // Right margin
            doc.line(margin, pageHeight - margin, pageWidth - margin, pageHeight - margin); // Bottom margin

            // Add footer (stamp and verification text)
            const footerStartY = pageHeight - margin - 30;
            const stampWidth = 40;
            const stampHeight = 40;
            doc.addImage(stampBase64, 'JPEG', pageWidth - margin - stampWidth - 10, footerStartY - stampHeight, stampWidth, stampHeight);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('Verified by NEC_Authority', pageWidth - margin - stampWidth - 10, footerStartY - stampHeight + 45);

            // Add Timestamp
            const timestamp = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString('en-IN')}`;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(timestamp, pageWidth - margin - 100, footerStartY - stampHeight + 45);
        };

        // Helper function to check if we need a new page
        const checkPageEnd = () => {
            if (yPosition + lineHeight > pageHeight - margin - 40) {
                doc.addPage();
                addPageDesign();
                yPosition = margin + 50; // Reset position after new page
            }
        };

        // Add header and border on the first page
        addPageDesign();

        // Starting position for content
        let yPosition = margin + 50;
        const lineHeight = 10;

        // Add title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Name: ${student.Name} - RegNo: ${student.RegNo}`, margin + 10, yPosition);
        yPosition += lineHeight;
        doc.text(`BatchYear: ${batchYear4}   Department: ${department}`, margin + 10, yPosition);
        yPosition += lineHeight;

        const currentDate = new Date();
        const timestamp = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString('en-IN')}`;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(timestamp, margin + 10, yPosition);
        yPosition += lineHeight * 2;

        doc.setFont('helvetica', 'bold');
        doc.text("Fee Details:", margin + 10, yPosition);
        yPosition += lineHeight * 2;

        doc.setFont('helvetica', 'normal');
        Object.keys(student.isPaid_Fees).forEach((feeKey, index) => {
            checkPageEnd(); 
            let kk=feeKey.replace("isPaid_", "");
            console.log(student.Fees[kk])
            if(student.Fees[kk]>0) {// Check for page overflow before adding content
            const feeStatus = student.isPaid_Fees[feeKey] === null
                ? "Not Released"
                : student.isPaid_Fees[feeKey]
                ? "Paid"
                : "Unpaid";
            doc.text(`${feeKey.replace("isPaid_", "")}: ${feeStatus}`, margin + 20, yPosition);
            yPosition += lineHeight;
            }
        });

        // Save the PDF
        doc.save(`${student.Name}-fee-details.pdf`);
        setBatchYear4("");
        setStudentRegNo("");
        console.log(department);
        setDepartment("");
        console.log(department);
    } catch (error) {
        console.error("Error fetching student details:", error);
        alert("Error fetching student details: " + (error.response?.data?.message || error.message));
    }
};


  return (
    
    <div className='admin-dashboard'>
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <br></br>
      <h2>Add New Batch</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Batch Year:
          <input
            type="text"
            value={batchYear1}
            onChange={(e) => setBatchYear1(e.target.value)}
            placeholder="Enter Batch Year (e.g., 2023)"
            required
          />
        </label>
        <label>
          Upload File:
          <input
            style={{ marginLeft: "18px" }}  
            type="file" 
            accept=".xlsx" 
            onChange={handleFileChange} 
            required 
          />
        </label>
        <button type="submit">Upload</button>
      </form>

      <hr />
    <br/>
    <br/>
      <h2>Release Fee</h2>
      <label>
        Batch Year:
        <input
          type="text"
          value={batchYear3}
          onChange={(e) => setBatchYear3(e.target.value)}
          placeholder="Enter Batch Year"
          required
        />
      </label>
      <label>
        Fee Type:
      <input
          type="text"
          value={feeType} 
          onChange={(e) => setFeeType(e.target.value)}
          placeholder="Enter Fee Type"
          required
        />
      </label>
      <h2>Due Dates and Fine Amounts</h2>
      <label>
        Due Date 1:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="date"
          value={dueDate1}
          onChange={(e) => setDueDate1(e.target.value)}
          required
        />
      </label>
      <label>
        Fine Amount 1:&nbsp;
        <input
          type="number"
          value={fineAmount1}
          placeholder='Enter Amount in ETH'
          onChange={(e) => setFineAmount1(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Due Date 2:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="date"
          value={dueDate2}
          onChange={(e) => setDueDate2(e.target.value)}
          required
        />
      </label>
      <label>
        Fine Amount 2:&nbsp;
        <input
          type="number"
          value={fineAmount2}
          placeholder='Enter Amount in ETH'
          onChange={(e) => setFineAmount2(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Due Date 3:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="date"
          value={dueDate3}
          onChange={(e) => setDueDate3(e.target.value)}
          required
        />
      </label>
      <label>
        Fine Amount 3:&nbsp;
        <input
          type="number"
          value={fineAmount3}
          placeholder='Enter Amount in ETH'
          onChange={(e) => setFineAmount3(e.target.value)}
          required
        />
      </label>
      <br />
      <button onClick={releaseFee}>Release Fee</button>
      <hr />
      <br/>
      <br/>
      <h2>Fetch Students for Fee</h2>
      <label>
        Batch Year:
        <input
          type="text"
          value={batchYear2}
          onChange={(e) => setBatchYear2(e.target.value)}
          placeholder="Enter Batch Year"
          required
        />
      </label>
      <label>
        Department:
        <select onChange={(e) => setDepartment(e.target.value)}  value={department}required>
          <option value="" disabled>Select Department</option>
          <option value="COMPUTER SCIENCE">Computer Science</option>
          <option value="INFORMATION TECHNOLOGY">Information Technology</option>
          <option value="MECHANICAL">Mechanical</option>
          <option value="CIVIL">Civil</option>
          <option value="ELECTRICAL AND ELECTRONICS">Electrical And Electronics</option>
          <option value="ELECTRONICS AND COMMUNICATION">Electronics And Communication </option>
          <option value="ARTIFICIAL INTELLIGENCE AND DATA SCIENCE">Artificial Intelligence And Data Science</option>
        </select>
      </label>
      <label>
        Fee Type:
      <input
          type="text"
          value={feeType2} 
          onChange={(e) => setFeeType2(e.target.value)}
          placeholder="Enter Fee Type"
          required
        />
      </label>
      <button onClick={fetchStudentsForFee}>Fetch and Download PDF</button>
      <hr />
      <br/>
      <br/>

      <h2>Fetch Student Fee Details</h2>
      <label>
        Batch Year:
        <input
          type="text"
          value={batchYear4}
          onChange={(e) => setBatchYear4(e.target.value)}
          placeholder="Enter Batch Year"
          required
        />
      </label>
      <label>
        Department:
        <select onChange={(e) => setDepartment(e.target.value)}  value={department}required>
          <option value="" disabled>Select Department</option>
          <option value="COMPUTER SCIENCE">Computer Science</option>
          <option value="INFORMATION TECHNOLOGY">Information Technology</option>
          <option value="MECHANICAL">Mechanical</option>
          <option value="CIVIL">Civil</option>
          <option value="ELECTRICAL AND ELECTRONICS">Electrical And Electronics</option>
          <option value="ELECTRONICS AND COMMUNICATION">Electronics And Communication </option>
          <option value="ARTIFICIAL INTELLIGENCE AND DATA SCIENCE">Artificial Intelligence And Data Science</option>
        </select>
      </label>
      <label>
        Student RegNo:
        <input
          type="text"
          value={studentRegNo}
          onChange={(e) => setStudentRegNo(e.target.value)}
          placeholder="Enter Reg No"
          required
        />
      </label>
      <button onClick={fetchStudentFeeDetails}>Fetch and Download PDF</button>
      <br/>
      <br/>
      <br/>
      <br/>
      <footer>
          <p>&copy; 2022 NEC Kovilpatti. All rights reserved.</p>
      </footer>
      <hr />
    </div>
  );
};

export default AdminDashboard;
