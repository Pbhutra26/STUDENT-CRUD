import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

import { PageContext } from './PageContext';

function StudentDetail({ baseUrl }) {
  const { rollNumber } = useParams();
  const navigate = useNavigate();
  const { page } = useContext(PageContext);
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [attendanceScore, setAttendanceScore] = useState(null);
  const [numSundays, setNumSundays] = useState(5);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`${baseUrl}/students/${rollNumber}`);
        setStudent(response.data);
      } catch (error) {
        alert('Error fetching student data:', error);
        navigate(-1);
        console.error('Error fetching student data:', error);
      }
    };
    fetchStudent();
  }, [rollNumber, baseUrl]);

  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/attendance/${numSundays}/${rollNumber}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Calculate attendance score non-blocking, whenever attendance changes
  useEffect(() => {
    if (!attendance || attendance.length === 0) {
      setAttendanceScore(null);
      return;
    }
    // Calculate attendance score with exponential weighting
    let score = 0;
    let totalWeight = 0;
    let weight = 1;
    for (let i = 0; i < attendance.length; i++) {
      if (i > 0 && i % 4 === 0) {
        weight /= 2;
      }
      totalWeight += weight;
      if (attendance[i]) score += weight;
    }
    setAttendanceScore(totalWeight === 0 ? null : (score / totalWeight) * 100);
  }, [attendance]);

  const handleEdit = () => {
    navigate(`/edit-student/${rollNumber}`);
  };

  // When navigating back, go to the correct page
  const handleBack = () => {
    navigate(`/`, { state: { page } });
  };

  if (!student) {
    return <p>Loading...</p>;
  }

  return (
    <div className="mt-8">
      <button onClick={handleBack} className="mb-4 px-3 py-1 bg-gray-200 rounded text-sm">Back to List</button>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Student Details</h2>
        <button
          onClick={handleEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
      </div>
      <div className="border p-4 rounded-lg shadow">
        <img
          src={student.imageUrl}
          alt={`${student.name}'s avatar`}
          className="w-32 h-32 rounded-full object-cover mb-4"
        />
        <p><strong>Roll Number:</strong> {student.rollNumber}</p>
        <p><strong>Name:</strong> {student.name}</p>
        <p><strong>Age:</strong> {student.age}</p>
        <p><strong>Phone:</strong> {student.phone}</p>
        <p><strong>Learning Level:</strong> {student.learningLevel}</p>
        <p><strong>Gender:</strong> {student.gender}</p>
        <p><strong>Guardian's Name:</strong> {student.guardianName}</p>
        <p><strong>Date of Birth:</strong> {student.dob}</p>
        <p><strong>School Name:</strong> {student.schoolName}</p>
        <p><strong>Class:</strong> {student.studentClass}</p>
        {student.metadata && Object.keys(student.metadata).length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <ul className="list-disc list-inside">
              {Object.entries(student.metadata).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center mb-2 space-x-2">
            <input
              type="text"
              value={numSundays}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setNumSundays(val);
              }}
              className="border rounded px-2 py-1 w-20"
              placeholder="1-20 Sundays"
              maxLength={2}
            />
            <button
              onClick={() => {
                const n = parseInt(numSundays, 10);
                if (!n || n < 1 || n > 20) {
                  alert('Please enter a valid number between 1 and 20.');
                  return;
                }
                setNumSundays(n); // ensure state is a number
                fetchAttendance();
              }}
              className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
              disabled={attendanceLoading}
            >
              {attendanceLoading ? 'Loading...' : `Show Attendance`}
            </button>
          </div>
          {attendance.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mt-2">Attendance</h3>
              <div className="flex space-x-2 mb-2">
                {attendance.map((present, index) => (
                  <div
                    key={index}
                    className={`w-5 h-5 rounded-full ${present ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                ))}
              </div>
              {attendanceScore !== null && (
                <div className="text-sm text-gray-700">Attendance Score: <span className="font-semibold">{attendanceScore.toFixed(1)}%</span></div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
