import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Big from 'big.js';
import Web3 from 'web3'; // Import Web3 for blockchain interactions
import './pay.css';
import { jsPDF } from "jspdf"; 
import headerPDF from './headerPDF.jpeg';
import stamp from './stamp.jpeg'; 

const Pay = () => {
  const [feesData, setFeesData] = useState({}); // all false valued fees from db
  const [selectedFees, setSelectedFees] = useState([]); // selected fees from user
  const [selectedAmount, setSelectedAmount] = useState([]); // selected fees amount from user
  const [totalAmount, setTotalAmount] = useState(new Big(0));// total amount to be paid

  const [fineAmounts, setFineAmounts] = useState({});//all false valued fine amounts from db
  const [fineAmountManager, setFineAmountManager] = useState([]);//collects payable dues info about the fees
  const [fineTotals, setFineTotals] = useState({});//collects total fine amount for each fee

  const [showSummary, setShowSummary] = useState({});

  const { state } = useLocation();
  const { RegNo,Name,Degree,Branch,Semester,Batchyear,DOB,Photo } = state || {};
  
  const OWNER_ADDRESS=import.meta.env.VITE_OWNER_ADDRESS;
  const CONTRACT_ADDRESS=import.meta.env.VITE_CONTRACT_ADDRESS;

  const CONTRACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "student",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "FeePaid",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "payFee",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
  useEffect(() => {
    if (RegNo.length === 7 && Batchyear) {
      axios
        .get("http://localhost:3001/pay", { params: { RegNo, Batchyear } })
        .then((response) => {
          setFeesData(response.data.Fees);
          setFineAmounts(response.data.FineAmounts);
        })
        .catch((error) => {
          console.error('Error fetching fees data:', error.response ? error.response.data : error.message);
        });
    }
  }, [RegNo, Batchyear]);

  useEffect(() => {
    if (Object.keys(fineAmounts).length > 0) {
      const { FineAmountManager, FineTotals } = calculateFineAmountManager(fineAmounts);
      setFineAmountManager(FineAmountManager);
      setFineTotals(FineTotals);
    }
  }, [fineAmounts]);
  
  const calculateFineAmountManager = (fineAmounts) => {
    const FineAmountManager = {};
    const FineTotals = {};
  
    const currentDate = new Date();
  
    for (const [feeName, feeDetails] of Object.entries(fineAmounts)) {
      const { dueDates, fineAmounts: fines } = feeDetails;
  
      const dueDate1 = new Date(dueDates[0]);
      const dueDate2 = new Date(dueDates[1]);
      const dueDate3 = new Date(dueDates[2]);

      // Helper function to normalize the date (set time to 00:00:00)
      function normalizeDate(date) {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0); // Set time to midnight
        return normalizedDate;
      }

      const normalizedDueDate1 = normalizeDate(dueDate1);
      const normalizedDueDate2 = normalizeDate(dueDate2);
      const normalizedDueDate3 = normalizeDate(dueDate3);
      const normalizedCurrentDate = normalizeDate(currentDate);

      let fineArray = [0, 0, 0];

      if (normalizedCurrentDate >= normalizedDueDate3) {
        // On or after due3 date
        const daysLate = Math.floor((normalizedCurrentDate - normalizedDueDate3) / (1000 * 60 * 60 * 24));
        fineArray[2] = daysLate + 1; 
        fineArray[1] = 1;
        fineArray[0] = 1; 
      }
      else if (normalizedCurrentDate >= normalizedDueDate2) {
        // On or after due2 date but before due3 date
        fineArray[1] = 1;
        fineArray[0] = 1; 
      }
      else if (normalizedCurrentDate >= normalizedDueDate1) {
        // On or after due1 date but before due2 date
        fineArray[0] = 1; 
      }

      // Calculate the total fine for the fee
      const totalFine =
        parseFloat(fines[0] || 0) * fineArray[0] +
        parseFloat(fines[1] || 0) * fineArray[1] +
        parseFloat(fines[2] || 0) * fineArray[2];
  
      FineTotals[feeName] = totalFine;
      FineAmountManager[feeName] = fineArray;

    }
    return { FineAmountManager, FineTotals };
  };
  

  const handleCheckboxChange = (key, value) => {
    const amount = new Big(value); // Convert value to Big for precision
    if (selectedFees.includes(key)) {
      // Remove fee if already selected
      setSelectedFees((prev) => prev.filter((fee) => fee !== key));
      const indexToRemove = selectedAmount.findIndex((val) => val === value);
      if (indexToRemove !== -1) {
        // Remove the first occurrence of the value from selectedAmount
        setSelectedAmount((prev) => [
          ...prev.slice(0, indexToRemove),  // All elements before the found index
          ...prev.slice(indexToRemove + 1), // All elements after the found index
        ]);
      }
      setTotalAmount((prev) => prev.minus(amount));
      setTotalAmount((prev) => prev.minus(fineTotals[key]));
    } else {
      // Add fee if not already selected
      setSelectedFees((prev) => [...prev, key]);
      setSelectedAmount((prev) => [...prev, value]);
      setTotalAmount((prev) => prev.plus(amount));
      setTotalAmount((prev) => prev.plus(fineTotals[key]));
    }
  };

  const handlePay = async () => {
    try {      
      const web3 = new Web3(window.ethereum); // Initialize Web3
      await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request user accounts
      const accounts = await web3.eth.getAccounts(); // Get user's accounts
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);// Initialize the contract
      if (window.ethereum) {
        window.ethereum.enable(); // Request account access if needed
      }
      const receipt = await contract.methods
        .payFee()
        .send({
          from: accounts[0],
          value: web3.utils.toWei(totalAmount.toString(), 'ether'),
        });
  
      alert(`Transaction successful! Transaction ID: ${receipt.transactionHash}`);
      const RegNo1 = RegNo; 
      const Name1 = Name; 
      const Degree1 = Degree;
      const Branch1 = Branch;
      const Semester1 = Semester;
      const Batchyear1 = Batchyear;
      const DOB1 = DOB;
      const Photo1 = Photo;
      const fineAmounts1=fineAmounts;
      const fineAmountManager1=fineAmountManager;
      const fineTotals1=fineTotals;
      const feesData1 = feesData;
      const selectedFees1 = selectedFees?.toString(); 
      const totalAmount1 = totalAmount?.toString(); 
      const transactionId1 = receipt.transactionHash?.toString(); 
      const timestamp1 = new Date().toISOString();

      try {
        // Send the fee data to the backend using axios.post
        await axios.post("http://localhost:3001/fees", {
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
        });
      }
      catch (err) {
        console.error("Error saving fee data:", err);
      }

      setSelectedFees([]); 
      setSelectedAmount([]);
      setFineAmounts([]);
      setFineAmountManager({}); 
      setFineTotals([]);
      setTotalAmount(new Big(0)); 
      
      document.getElementById('receipt').innerHTML = `
        <h2>Receipt</h2>
        <p><strong>Reg No:</strong> ${RegNo}</p>
        <p><strong>Total Amount Paid:</strong> ${totalAmount1} ETH</p>
        <p><strong>Transaction ID:</strong> ${transactionId1}</p>
        <p><strong>Paid Fees:</strong> ${selectedFees1}</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      `;
      try{
        generatePDF(RegNo1, Name1, Degree1, Branch1, Semester1, Batchyear1, DOB1, Photo1, selectedFees1, totalAmount1, transactionId1, timestamp1,fineAmounts);
      }
      catch(err){
        console.error("Error generating PDF:", err);
      }
      
        axios
        .get("http://localhost:3001/pay", { params: { RegNo, Batchyear } })
        .then((response) => {
          setFeesData(response.data.Fees);
          setFineAmounts(response.data.FineAmounts); 
        })
        .catch((error) => {
          console.error('Error refreshing fees data:', error);
        });
    }
    catch (error) {
      alert(error);
    }
  };
  const convertToIST = (utcTimestamp) => {
    // Parse the UTC timestamp
    const utcDate = new Date(utcTimestamp);

    // Check if the input timestamp is valid
    if (isNaN(utcDate.getTime())) {
        throw new Error("Invalid UTC timestamp provided");
    }

    // Convert the date to IST timezone
    const options = { timeZone: 'Asia/Kolkata', hour12: false };
    const istTimeString = utcDate.toLocaleString('en-IN', options);

    return istTimeString+' India Standard Time';
};
  
const generatePDF = async (RegNo1, Name1, Degree1, Branch1, Semester1, Batchyear1, DOB1, Photo1, selectedFees1, totalAmount1, transactionId1, timestamp1, fineData) => {
  try {
    const doc = new jsPDF();
    let margin = 10; 
    let logoWidth = 170; 
    let logoHeight = 40;

    const pageWidth = doc.internal.pageSize.getWidth(); 
    const pageHeight = doc.internal.pageSize.getHeight(); 

    // Function to draw margins and header on every page
    const drawHeaderAndMargins = (yPosition) => {
      doc.setDrawColor(0); 
      doc.setLineWidth(0.5);
      const m=margin
      margin=10
      // Draw margin lines
      doc.line(margin, margin, pageWidth - margin, margin); // Top margin
      doc.line(margin, margin, margin, pageHeight - margin); // Left margin
      doc.line(pageWidth - margin, margin, pageWidth - margin, pageHeight - margin); // Right margin
      doc.line(margin, pageHeight - margin, pageWidth - margin, pageHeight - margin); // Bottom margin

      // Add header image (college logo)
      const stampWidth=40
      const stampHeight=40
      const footerStartY = pageHeight - 30 - 30;
      doc.addImage(headerBase64, 'JPEG', margin + 10, margin + 10, logoWidth, logoHeight);
      doc.addImage(stampBase64, 'JPEG', pageWidth - margin - stampWidth - 10, footerStartY - stampHeight + 40, stampWidth, stampHeight);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('Verified by NEC_Authority', pageWidth - margin - stampWidth - 10, footerStartY - stampHeight + 80);
      margin=m
      doc.setFont('helvetica', 'bold');
      return yPosition = logoHeight + 40;
    };

    // Convert header and stamp images to Base64
    const headerBase64 = await loadImageAsBase64(headerPDF);
    const stampBase64 = await loadImageAsBase64(stamp);
    // Add student photo if present
    if (Photo1) {
      try {
        const photoBase64 = await loadImageAsBase64(Photo1);
        const photoWidth = 40; // Increased photo width
        const photoHeight = 40; // Increased photo height
        doc.addImage(photoBase64, 'JPEG', pageWidth - margin - photoWidth - 40, margin + 85, photoWidth, photoHeight);
      } catch (error) {
        console.log("Error loading photo:", error);
      }
    }

    let yPosition = drawHeaderAndMargins(margin + 100);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total Amount: ${totalAmount1.toString()} ETH`, margin + 5, logoHeight + 30);
    doc.text('Transaction ID:', margin + 5, logoHeight + 35);

      // Transaction ID and Timestamp
    doc.setFont('helvetica', 'normal');
    doc.text(`${transactionId1}`, margin + 38, logoHeight + 35);
    doc.setFont('helvetica', 'bold');
    doc.text('Timestamp:', margin + 5, logoHeight + 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`${convertToIST(timestamp1)}`, margin + 38, logoHeight + 40);
    // Set font size for the text and improve text styling
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    margin += 20;

    // Add a title with a line separator
    doc.text('Receipt for Payment', margin, yPosition + 20);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition + 22, pageWidth - margin, yPosition + 22); // Title separator

    // Add student details section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPosition += 30;
    doc.text('Student Details:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 10;
    doc.text(`Reg No: ${RegNo1}`, margin+5, yPosition);
    yPosition += 10;
    doc.text(`Name: ${Name1}`, margin+5, yPosition);
    yPosition += 10;
    doc.text(`Degree: ${Degree1}`, margin+5, yPosition);
    yPosition += 10;
    doc.text(`Branch: ${Branch1}`, margin+5, yPosition);
    yPosition += 10;
    doc.text(`Semester: ${Semester1}`, margin+5, yPosition);
    yPosition += 10;
    doc.text(`Batch Year: ${Batchyear1}`, margin+5, yPosition);
    yPosition += 10;

    // Date of Birth Formatting
    const day = DOB1.substring(0, 2);
    const month = DOB1.substring(2, 4);
    const year = DOB1.substring(4, 8);
    doc.text(`Date of Birth: ${day}-${month}-${year}`, margin+5, yPosition);
    yPosition += 20;

    // Display selected fees and corresponding fine details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Selected Fees:', margin, yPosition);
    yPosition += 10;

    selectedFees.forEach((fee, index) => {
      if (yPosition + 20 > pageHeight - margin) { // Check if we need to add a new page
        doc.addPage();
        yPosition = drawHeaderAndMargins(margin + 40);
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const feeFineDetails = fineData[fee];
      const dueDates = feeFineDetails.dueDates;
      const fineAmounts = feeFineDetails.fineAmounts;
      
      // Loop through each fee and display due date, fine amounts, and applicability
      doc.text(`- ${fee}: ${selectedAmount[index]+fineTotals[fee]} ETH`, margin + 10, yPosition);
      yPosition += 10;
      doc.text(`Original Fee Amount:${selectedAmount[index]} ETH`, margin + 20, yPosition);
      yPosition += 10;
      doc.text("Fine Details: ", margin + 20, yPosition);
      yPosition += 10;
      // Display fine details for each due date
      dueDates.forEach((dueDate, index) => {
        if (yPosition + 20 > pageHeight - margin) { // Check if we need to add a new page
          doc.addPage();
          yPosition = drawHeaderAndMargins(margin + 40);
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const fineText = fineAmountManager[fee]?.[index] > 0 
            ? (index === 2 
                ? `Applicable (${fineAmountManager[fee][index]} ${
                    fineAmountManager[fee][index]  === 1 ? 'day' : 'days'
                  } late)` 
                : 'Applicable') 
            : 'Not Applicable';
        doc.text(`  - Due Date ${index + 1}: ${dueDate}   - Fine of Due${index + 1}: ${fineAmounts[index]}`, margin + 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`    ${fineText}`, margin + 20, yPosition);
        yPosition += 10;
      });
    });
    doc.save('receipt.pdf');
    document.getElementById('receipt-download').innerHTML = 'Receipt generated successfully!';
  } catch (error) {
    console.log(error);
    document.getElementById('receipt-download').innerHTML = 'Error generating receipt. Please check your storage.' + error;
  }
};



// Helper function to load images
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
const toggleSummaryVisibility = (feeName) => {
  setShowSummary((prev) => ({
    ...prev,
    [feeName]: !prev[feeName], // Toggle visibility for the clicked fee
  }));
};

  
  
  return (
    <div className="pay-container">
      <h1>Fees Payment</h1>
      {Object.keys(feesData).length > 0 && Object.values(feesData).some(value => value > 0) ? (
        <div>
          {Object.entries(feesData).map(([key, value]) =>
            value > 0 ? (
              <div key={key} className={`fee-item ${selectedFees.includes(key) ? 'selected' : ''}`}>
                <label>
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxChange(key, value)}
                    checked={selectedFees.includes(key)}
                  />
                  <strong>{key}:</strong> {((value + (fineTotals[key])).toFixed(6) || 0)} ETH
                </label>
                <br></br>
                <br></br>
                <div>
                  <strong>Status:</strong>{" "}
                  {fineAmountManager[key]?.some((status) => status > 0)
                    ? <button onClick={() => toggleSummaryVisibility(key)}>Applicable</button>
                    : <button onClick={() => toggleSummaryVisibility(key)}>Not Applicable</button>}
                </div>

                {showSummary[key] && (
                  <div className="fine-summary">
                    <p><strong>Original Fee:</strong> {value} ETH</p>
                    <p><strong>Fine Breakdown:</strong></p>
                    <ul>
                      {fineAmounts[key]?.dueDates.map((dueDate, index) => (
                        <li 
                        key={index}
                        className={fineAmountManager[key]?.[index] > 0 ? 'highlight' : ''}
                      >
                        <div className="fine-item-content">
                          <div className="fine-details">
                            <strong>Due Date {index + 1}:</strong> {dueDate} <br />
                            <strong>Fine Amount:</strong> {fineAmounts[key]?.fineAmounts[index] || 0} ETH <br />
                          </div>
                          <div 
                            className={`fine-status-label ${
                              fineAmountManager[key]?.[index] > 0 ? 'applicable' : 'not-applicable'
                            }`}
                          >
                            {fineAmountManager[key]?.[index] > 0 
                              ? (index === 2 
                                  ? `Applicable (${fineAmountManager[key][index] } ${
                                      fineAmountManager[key][index] === 1 ? 'day' : 'days'
                                    } late)` 
                                  : 'Applicable') 
                              : 'Not Applicable'}
                          </div>
                        </div>
                      </li>
                      
                      ))}
                    </ul>
                    <p><strong>Total Fine:</strong> {fineTotals[key] || 0} ETH</p>
                  </div>
                )}
              </div>
            ) : null
          )}
          <br></br>
          <br></br>
          <div className="summary">
            <p>
              <strong>Selected Fees:</strong>{' '}
              {selectedFees.length > 0 ? selectedFees.join(', ') : 'None'}
            </p>
            <br></br>
            <p>
              <strong>Total Amount to Pay:</strong> {totalAmount.toFixed(6)} ETH
            </p>
            <br></br>
            <br></br>
            <button
              onClick={handlePay}
              className="pay-button"
              disabled={selectedFees.length === 0} 
            >
              Pay Now
            </button>
          </div>
        </div>
      ) : (
        <p>No Dues</p>
      )}
      <div>
        <div id="receipt"></div>
        <div id="receipt-download"></div>
      </div>
    </div>
  );
};

export default Pay;
