import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function StudentDetail({ baseUrl }) {
  const { rollNumber } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`${baseUrl}/students/${rollNumber}`);
        setStudent(response.data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`${baseUrl}/attendance/5/${rollNumber}`);
        setAttendance(response.data);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchStudent();
    fetchAttendance();
  }, [rollNumber, baseUrl]);

  const handleEdit = () => {
    navigate(`/edit-student/${rollNumber}`);
  };

  if (!student) {
    return <p>Loading...</p>;
  }

  return (
    <div className="mt-8">
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
          <h3 className="text-lg font-semibold">Attendance</h3>
          <div className="flex space-x-2">
            {attendance.map((present, index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full ${present ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
