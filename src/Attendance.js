import React, { useEffect, useState, useContext } from 'react';
import { LoadingContext } from './LoadingContext';
import jsPDF from 'jspdf';

function Attendance({ baseUrl }) {
  const [attendance, setAttendance] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/sundays`);
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('-');
    const fullYear = `20${year}`;
    const date = new Date(`${fullYear}-${month}-${day}`);
    const options = { day: '2-digit', month: 'short' };
    return date.toLocaleDateString(undefined, options);
  };

  const fetchNames = async (rollNumbers) => {
    try {
      const names = await Promise.all(
        rollNumbers.map(async (rollNumber) => {
          const response = await fetch(`${baseUrl}/students/${rollNumber}`);
          const data = await response.json();
          return data.name;
        })
      );
      return names;
    } catch (error) {
      console.error("Error fetching names:", error);
      return [];
    }
  };

  const fetchVolunteerNames = async (phoneNumbers) => {
    try {
      const names = await Promise.all(
        phoneNumbers.map(async (phoneNumber) => {
          const response = await fetch(`${baseUrl}/volunteers/${phoneNumber}`);
          const data = await response.json();
          return data.name;
        })
      );
      return names;
    } catch (error) {
      console.error("Error fetching volunteer names:", error);
      return [];
    }
  };

  const generatePDF = async (entry) => {
    const doc = new jsPDF();
    const studentNames = entry.numbers ? await fetchNames(entry.numbers) : [];
    const volunteerNames = entry.volunteers ? await fetchVolunteerNames(entry.volunteers) : [];
    doc.text(`Attendance for ${formatDate(entry.date)}`, 10, 10);
    let y = 20;
    doc.text('Roll Number', 10, y);
    doc.text('Name', 50, y);
    y += 10;
    entry.numbers && entry.numbers.forEach((rollNumber, index) => {
      if (y > 280) { // Check if we need to add a new page
        doc.addPage();
        y = 20;
      }
      doc.text(rollNumber.toString(), 10, y);
      doc.text(studentNames[index] || 'Unknown', 50, y);
      y += 10;
    });
    if (entry.volunteers && entry.volunteers.length > 0) {
      y += 10;
      doc.text('Volunteer Names', 20, y);
      y += 10;
      entry.volunteers.forEach((phoneNumber, index) => {
        if (y > 280) { // Check if we need to add a new page
          doc.addPage();
          y = 20;
        }
       
        doc.text(volunteerNames[index] || 'Unknown', 20, y);
        y += 10;
      });
    }
    doc.save(`attendance_${entry.date}.pdf`);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const itemsPerPage = 5;
  const paginatedAttendance = attendance.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {paginatedAttendance.map((entry, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-2">{formatDate(entry.date)}</h2>
                <p className="text-sm">{(entry.numbers ? entry.numbers.length : 0)} Student(s)</p>
                <p className="text-sm">{(entry.volunteers ? entry.volunteers.length : 0)} Volunteer(s)</p>
                <button
                  onClick={() => generatePDF(entry)}
                  className="bg-green-500 text-white px-2 py-1 rounded mt-2 text-sm"
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage * itemsPerPage >= attendance.length}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Attendance;
