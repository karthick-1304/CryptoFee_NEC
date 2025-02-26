// const generatePDF = async (RegNo1, Name1, Degree1, Branch1, Semester1, Batchyear1, DOB1, Photo1, selectedFees1, totalAmount1, transactionId1, timestamp1, fineData) => {
//     try {
//         const doc = new jsPDF();

//         let margin = 10;
//         const pageWidth = doc.internal.pageSize.getWidth();
//         const pageHeight = doc.internal.pageSize.getHeight();

//         // Helper function to check page overflow and add a new page
//         const checkPageOverflow = (yPosition) => {
//             if (yPosition > pageHeight - margin) {
//                 doc.addPage();
//                 return margin;
//             }
//             return yPosition;
//         };

//         // Header Section
//         const headerBase64 = await loadImageAsBase64(headerPDF);
//         const stampBase64 = await loadImageAsBase64(stamp);
//         let yPosition = margin;

//         doc.addImage(headerBase64, 'JPEG', margin, margin, 170, 40);
//         yPosition += 50;

//         doc.setFont('helvetica', 'bold');
//         doc.text(`Receipt for Payment`, pageWidth / 2, yPosition, { align: 'center' });
//         yPosition += 20;

//         doc.setFontSize(12);
//         doc.setFont('helvetica', 'normal');
//         doc.text(`Reg No: ${RegNo1}`, margin, yPosition);
//         yPosition += 10;
//         doc.text(`Name: ${Name1}`, margin, yPosition);
//         yPosition += 10;

//         // Iterate over selected fees
//         yPosition += 20;
//         doc.setFont('helvetica', 'bold');
//         doc.text('Selected Fees and Fine Details:', margin, yPosition);
//         yPosition += 10;

//         selectedFees.forEach((fee, feeIndex) => {
//             yPosition = checkPageOverflow(yPosition);

//             const fineBreakdown = fineData[fee] || {}; // Retrieve fine details for the fee
//             const fineAmounts = fineBreakdown.fineAmounts || [];
//             const dueDates = fineBreakdown.dueDates || [];
//             const totalFine = fineBreakdown.totalFine || 0;

//             // Fee Details
//             doc.setFont('helvetica', 'normal');
//             doc.text(`- ${fee}: ${(fineBreakdown.originalAmount || 0) + totalFine} ETH`, margin, yPosition);
//             yPosition += 10;

//             // Fine Details Breakdown
//             doc.setFontSize(10);
//             doc.text('Fine Breakdown:', margin + 10, yPosition);
//             yPosition += 10;

//             dueDates.forEach((dueDate, index) => {
//                 yPosition = checkPageOverflow(yPosition);

//                 const fineAmount = fineAmounts[index] || 0;
//                 const status = fineAmount > 0 ? `Applicable` : `Not Applicable`;

//                 doc.text(
//                     `Due Date ${index + 1}: ${dueDate} | Fine Amount: ${fineAmount} ETH | Status: ${status}`,
//                     margin + 20,
//                     yPosition
//                 );
//                 yPosition += 10;
//             });

//             yPosition = checkPageOverflow(yPosition);
//             doc.setFont('helvetica', 'bold');
//             doc.text(`Total Fine for ${fee}: ${totalFine} ETH`, margin + 10, yPosition);
//             yPosition += 20;
//         });

//         // Add Footer
//         yPosition = checkPageOverflow(yPosition);
//         const stampWidth = 40;
//         const stampHeight = 40;
//         doc.addImage(stampBase64, 'JPEG', pageWidth - margin - stampWidth, yPosition, stampWidth, stampHeight);
//         doc.text('Verified by NEC Authority', pageWidth - margin - stampWidth, yPosition + 50);

//         // Save the PDF
//         doc.save('receipt.pdf');
//         console.log('Receipt generated successfully!');
//     } catch (error) {
//         console.error('Error generating receipt:', error);
//     }
// };





// const generatePDF = async (RegNo1, Name1, Degree1, Branch1, Semester1, Batchyear1, DOB1, Photo1, selectedFees1, totalAmount1, transactionId1, timestamp1, fines) => {
//   try {
//       const doc = new jsPDF();

//       let margin = 10; // Define margin
//       const pageWidth = doc.internal.pageSize.getWidth(); // Page width
//       const pageHeight = doc.internal.pageSize.getHeight(); // Page height

//       // Helper function to check if new page is needed
//       const checkPageOverflow = (yPosition) => {
//           if (yPosition > pageHeight - margin) {
//               doc.addPage();
//               return margin; // Reset yPosition for new page
//           }
//           return yPosition;
//       };

//       // Draw margins
//       doc.setDrawColor(0);
//       doc.setLineWidth(0.5);
//       doc.line(margin, margin, pageWidth - margin, margin); // Top
//       doc.line(margin, margin, margin, pageHeight - margin); // Left
//       doc.line(pageWidth - margin, margin, pageWidth - margin, pageHeight - margin); // Right
//       doc.line(margin, pageHeight - margin, pageWidth - margin, pageHeight - margin); // Bottom

//       // Add header
//       const headerBase64 = await loadImageAsBase64(headerPDF);
//       doc.addImage(headerBase64, 'JPEG', margin + 10, margin + 10, 170, 40);

//       // Receipt Title
//       let yPosition = margin + 60;
//       doc.setFont('helvetica', 'bold');
//       doc.setFontSize(16);
//       doc.text('Receipt for Payment', margin, yPosition);
//       doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
//       yPosition += 20;

//       // Student Details
//       doc.setFontSize(12);
//       doc.setFont('helvetica', 'normal');
//       const details = [
//           `Reg No: ${RegNo1}`,
//           `Name: ${Name1}`,
//           `Degree: ${Degree1}`,
//           `Branch: ${Branch1}`,
//           `Semester: ${Semester1}`,
//           `Batch Year: ${Batchyear1}`,
//           `Date of Birth: ${DOB1.substring(0, 2)}-${DOB1.substring(2, 4)}-${DOB1.substring(4, 8)}`
//       ];
//       details.forEach((detail) => {
//           doc.text(detail, margin, yPosition);
//           yPosition += 10;
//           yPosition = checkPageOverflow(yPosition);
//       });

//       // Fees and Fines
//       doc.setFont('helvetica', 'bold');
//       doc.text('Selected Fees:', margin, yPosition);
//       yPosition += 10;
//       yPosition = checkPageOverflow(yPosition);

//       doc.setFont('helvetica', 'normal');
//       selectedFees.forEach((fee, index) => {
//           const fineText = fines[index] > 0
//               ? `Fine Applied: ${fines[index]} ETH`
//               : `No Fine Applied`;

//           doc.text(`- ${fee}: ${selectedAmount[index]} ETH`, margin + 10, yPosition);
//           yPosition += 10;
//           doc.text(fineText, margin + 20, yPosition);
//           yPosition += 10;
//           yPosition = checkPageOverflow(yPosition);
//       });

//       // Total Amount
//       yPosition += 10;
//       doc.setFont('helvetica', 'bold');
//       doc.text(`Total Amount: ${totalAmount1} ETH`, margin, yPosition);
//       yPosition += 20;

//       // Footer (Stamp and Verification)
//       if (yPosition > pageHeight - 50) {
//           doc.addPage();
//           yPosition = margin;
//       }

//       const stampBase64 = await loadImageAsBase64(stamp);
//       const stampWidth = 40;
//       const stampHeight = 40;
//       const footerYPosition = pageHeight - margin - stampHeight - 10;

//       doc.addImage(stampBase64, 'JPEG', pageWidth - margin - stampWidth - 10, footerYPosition, stampWidth, stampHeight);
//       doc.setFont('helvetica', 'italic');
//       doc.text('Verified by NEC_Authority', pageWidth - margin - stampWidth - 10, footerYPosition + stampHeight + 10);

//       // Save the PDF
//       doc.save('receipt.pdf');
//       document.getElementById('receipt-download').innerHTML = 'Receipt generated successfully!';
//   } catch (error) {
//       console.log(error);
//       document.getElementById('receipt-download').innerHTML = 'Error generating receipt. Please check your storage.' + error;
//   }
// };