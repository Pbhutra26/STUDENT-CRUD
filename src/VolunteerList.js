import React, { useState, useEffect, useContext } from 'react';
import { VolunteerContext } from './VolunteerContext';
import { LoadingContext } from './LoadingContext';
import axios from 'axios';

function VolunteerList({ baseUrl }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState({});
  const [authKey, setAuthKey] = useState('');
  const { volunteers, setVolunteers } = useContext(VolunteerContext);
  const { setIsLoading } = useContext(LoadingContext);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get(`${baseUrl}/volunteers`);
      setVolunteers(response.data);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/volunteers`);
        setVolunteers(response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching volunteers:', error);
        return [];
      }
    };

    const fetchInitialAttendance = async (volunteers) => {
      const today = new Date();
      if (today.getDay() === 0) { // Check if today is Sunday
        const [date, month, year] = today.toLocaleDateString('en-GB').split('/');
        const formattedDate = `${date}-${month}-${year.slice(2)}`;
        try {
          const response = await axios.get(`${baseUrl}/sundays/${formattedDate}`);
          const presentVolunteers = response.data.volunteers;
          const initialAttendance = {};
          volunteers.forEach(volunteer => {
            initialAttendance[Number(volunteer.phone)] = presentVolunteers.includes(volunteer.phone.toString());
          });
          setAttendance(initialAttendance);
        } catch (error) {
          console.error('Error fetching initial attendance:', error);
        }
      }
    };

    const loadVolunteersAndAttendance = async () => {
      setIsLoading(true);
      const volunteers = await fetchVolunteers();
      await fetchInitialAttendance(volunteers);
      setIsLoading(false);
    };

    loadVolunteersAndAttendance();
  }, [baseUrl, setIsLoading, setVolunteers]);

  const isSunday = new Date().getDay() === 0;

  const handleAttendance = async (phone) => {
    if (authKey !== '1234567890') {
      alert('Invalid authentication key');
      return;
    }

    const [date, month, year] = new Date().toLocaleDateString('en-GB').split('/');
    const isPresent = attendance[Number(phone)];
    const today = `${date}-${month}-${year.slice(2)}`;

    try {
      setIsLoading(true);
      if (isPresent) {
        await axios.delete(`${baseUrl}/attendance/volunteers/remove/${today}/${phone}`);
      } else {
        await axios.get(`${baseUrl}/attendance/volunteers/add/${today}/${phone}`);
      }
      setIsLoading(false);
      setAttendance((prev) => ({ ...prev, [phone]: !isPresent }));
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const filteredVolunteers = volunteers.filter((volunteer) =>
    volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.phone.includes(searchTerm)
  );

  return (
    <div>
      <h2 className="text-xl font-semibold m-2">Volunteer List</h2>
      {authKey !== '1234567890' && (
        <input
          type="password"
          placeholder="Enter authentication key"
          value={authKey}
          onChange={(e) => setAuthKey(e.target.value)}
          className="mb-4 p-2 border rounded w-1/2"
        />
      )}
      {authKey === '1234567890' ? (
        <>
          <input
            type="text"
            placeholder="Search by name or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 p-2 border rounded w-1/2"
          />
          {filteredVolunteers.length === 0 ? (
            <p className="text-gray-500">No volunteers found.</p>
          ) : (
            <ul className="space-y-2">
              {filteredVolunteers.map((volunteer) => (
                <li key={volunteer.phone} className="border p-4 rounded-lg shadow flex items-center space-x-4 justify-between">
                  <div>
                    <p> {volunteer.name}</p>
                    {/* <p><strong>Phone:</strong> {volunteer.phone}</p> */}
                  </div>
                  {isSunday && (
                    <button
                      onClick={() => handleAttendance(volunteer.phone)}
                      className={`px-1 py-1 rounded font-bold text-xs text-white ${attendance[volunteer.phone] ? 'bg-green-500' : 'bg-red-500'}`}
                    >
                      {attendance[volunteer.phone] ? 'PRESENT' : 'ABSENT'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="text-red-500">Please enter a valid authentication key to view the volunteer list.</p>
      )}
    </div>
  );
}

export default VolunteerList;
