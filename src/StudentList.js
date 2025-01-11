import React, { useState, useEffect,useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LoadingContext } from './LoadingContext';

function StudentList({baseUrl}) {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState({});
  const studentsPerPage = 5;
  const { setIsLoading } = useContext(LoadingContext);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/students`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchStudents();
  }, []);



  useEffect(() => {
    const fetchInitialAttendance = async () => {
      const today = new Date();
      if (today.getDay() === 0) { // Check if today is Sunday
        const [date, month, year] = today.toLocaleDateString('en-GB').split('/');
        const formattedDate = `${date}-${month}-${year.slice(2)}`;
        const baseUrl = process.env.REACT_APP_BASE_URL; // Get base URL from .env file
        try {
          const response = await axios.get(`${baseUrl}/sundays/${formattedDate}`);
          const presentStudents = response.data.numbers;
          const initialAttendance = {};
          students.forEach(student => {
            initialAttendance[Number(student.rollNumber)] = presentStudents.includes(Number(student.rollNumber));
          });
          setAttendance(initialAttendance);
        } catch (error) {
          console.error('Error fetching initial attendance:', error);
        }
      }
    };

    fetchInitialAttendance();
  }, [students]);

  const handleAttendance = async (rollNumber) => {
    const [date, month, year] = new Date().toLocaleDateString('en-GB').split('/');
    const isPresent = attendance[Number(rollNumber)];
    const today = `${date}-${month}-${year.slice(2)}`;
    const baseUrl = process.env.REACT_APP_BASE_URL; // Get base URL from .env file
    console.log(today);
    try {
      if (isPresent) {
        await axios.delete(`${baseUrl}/attendance/remove/${today}/${Number(rollNumber)}`);
      } else {
        await axios.get(`${baseUrl}/attendance/add/${today}/${Number(rollNumber)}`);
      }
      setAttendance(prev => ({ ...prev, [Number(rollNumber)]: !isPresent }));
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    if (!isNaN(searchTerm) && searchTerm.length <=3) {
      return student.rollNumber.toString().includes(searchTerm);
    } else if (!isNaN(searchTerm)) {
      return student.phone.toString().includes(searchTerm);
    } else {
      return student.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  // Calculate the indices of the students to display on the current page
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Determine the total number of pages
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Handler for page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handler for search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold m-2">Student List</h2>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-4 p-2 border rounded"
      />
      {filteredStudents.length === 0 ? (
        <p className="text-gray-500">No students found.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {currentStudents.map((student) => (
              <li key={student.rollNumber} className="border p-4 rounded-lg shadow flex items-center space-x-4 justify-between">
                <Link to={`/students/${student.rollNumber}`} className="flex items-center space-x-4">
                  <img
                    src={student.imageUrl}
                    alt={`${student.name}'s avatar`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p><strong>Roll Number:</strong> {student.rollNumber}</p>
                    <p><strong>Name:</strong> {student.name}</p>
                  </div>
                </Link>
                {new Date().getDay() === 0 && (
                  <button
                    onClick={() => handleAttendance(student.rollNumber)}
                    className={`px-2 py-1 rounded ${attendance[student.rollNumber] ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                  >
                    {attendance[student.rollNumber] ? 'Mark Absent' : 'Mark Present'}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <p>
              Page {currentPage} of {totalPages}
            </p>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentList;
