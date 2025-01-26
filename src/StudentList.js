import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LoadingContext } from './LoadingContext';
import { StudentContext } from './StudentContext';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import ExcelJS from 'exceljs';

function StudentList({ baseUrl }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState({});
  const [ageRange, setAgeRange] = useState([4, 15]);
  const studentsPerPage = 10; // 2 rows of 5 students each
  const { setIsLoading } = useContext(LoadingContext);
  const { students } = useContext(StudentContext);

  useEffect(() => {
    setIsLoading(true);

    const fetchInitialAttendance = async () => {
      const today = new Date();
      if (today.getDay() === 4) { // Check if today is Sunday
        const [date, month, year] = today.toLocaleDateString('en-GB').split('/');
        const formattedDate = `${date}-${month}-${year.slice(2)}`;
        try {
          const response = await axios.get(`${baseUrl}/sundays/${formattedDate}`);
          const presentStudents = response.data.numbers;
          const initialAttendance = {};
          students.forEach(student => {
            initialAttendance[Number(student.rollNumber)] = presentStudents.includes(student.rollNumber.toString());
          });
          setAttendance(initialAttendance);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching initial attendance:', error);
        }
      }
    };

    setIsLoading(true);
    fetchInitialAttendance();
    setIsLoading(false);
  }, []);

  const handleAttendance = async (rollNumber) => {
    const [date, month, year] = new Date().toLocaleDateString('en-GB').split('/');
    const isPresent = attendance[Number(rollNumber)];
    const today = `${date}-${month}-${year.slice(2)}`;
    const baseUrl = process.env.REACT_APP_BASE_URL; // Get base URL from .env file
    console.log(today);
    try {
      setIsLoading(true);
      if (isPresent) {
        await axios.delete(`${baseUrl}/attendance/remove/${today}/${Number(rollNumber)}`);
      } else {
        await axios.get(`${baseUrl}/attendance/add/${today}/${Number(rollNumber)}`);
      }
      setIsLoading(false);
      setAttendance(prev => ({ ...prev, [Number(rollNumber)]: !isPresent }));
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    worksheet.columns = [
      { header: 'Roll Number', key: 'rollNumber', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Age', key: 'age', width: 10 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Learning Level', key: 'learningLevel', width: 15 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Guardian Name', key: 'guardianName', width: 30 },
      { header: 'DOB', key: 'dob', width: 15 },
      { header: 'School Name', key: 'schoolName', width: 30 },
      { header: 'Class', key: 'studentClass', width: 10 },
    ];

    filteredStudents.forEach(student => {
      worksheet.addRow(student);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students.xlsx');
    document.body.appendChild(link);
    link.click();
  };

  // Filter students based on search term and age range
  const filteredStudents = students.filter(student => {
    const matchesSearchTerm = !isNaN(searchTerm) && searchTerm.length <= 3
      ? student.rollNumber.toString().includes(searchTerm)
      : !isNaN(searchTerm)
      ? student.phone.toString().includes(searchTerm)
      : student.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAgeRange = student.age >= ageRange[0] && student.age <= ageRange[1];

    return matchesSearchTerm && matchesAgeRange;
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

  // Handler for age range change
  const handleAgeRangeChange = (newRange) => {
    setAgeRange(newRange);
    setCurrentPage(1); // Reset to first page on filter change
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold m-2">Student List</h2>
        <button
          onClick={handleDownload}
          className="bg-gray-200 shadow-sm text-gray-800 px-3 py-1 font-extrabold text-sm rounded flex items-center"
        >
          ⬇️ EXCEL
        </button>
      </div>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-4 p-2 border rounded w-1/2"
      />
      <div className='flex-col items-center justify-center'>
      <div className="flex items-center mb-2 w-2/3">
        <Slider
          range
          min={4}
          max={15}
          value={ageRange}
          onChange={handleAgeRangeChange}
        />
        </div>
        <span>Ages: {ageRange[0]} to {ageRange[1]}</span>
      </div>
      <p className="text-gray-500 mb-4">Filtered Students: {filteredStudents.length}</p>
      {filteredStudents.length === 0 ? (
        <p className="text-gray-500">Download the excel sheet for student details</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            {currentStudents.map((student) => (
              <div key={student.rollNumber} className="border p-4 rounded-lg shadow flex items-center space-x-4 justify-between">
                <Link to={`/students/${student.rollNumber}`} className="flex items-center space-x-4">
                  {/* <img
                    src={student.imageUrl}
                    alt={`${student.name}'s avatar`}
                    className="w-16 h-16 rounded-full object-cover"
                  /> */}
                  <div>
                    <p className={` font-extrabold text-blue-900 uppercase ${student.name.length>16?'text-xxs':'text-xs'}`}>{student.name}</p>
                    <p className='text-xs'><strong>No.</strong> {student.rollNumber}</p>
                    <p className='text-xs'><strong>Age:</strong> {student.age}</p>

                  </div>
                </Link>
                {new Date().getDay() === 0 && (
                  <button
                    onClick={() => handleAttendance(student.rollNumber)}
                    className={`px-1 rounded text-xxs text-white ${attendance[student.rollNumber] ? 'bg-green-500' : 'bg-red-500  '}`}
                  >
                    {attendance[student.rollNumber] ? 'PRESENT' : 'ABSENT'}
                  </button>
                )}
              </div>
            ))}
          </div>

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
              {currentPage} of {totalPages}
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
