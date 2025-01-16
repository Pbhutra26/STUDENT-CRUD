import React, { useState, useEffect, useContext } from 'react';
import { VolunteerContext } from './VolunteerContext';
import { LoadingContext } from './LoadingContext';
import axios from 'axios';

function VolunteerList({ baseUrl }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState({});
  const [authKey, setAuthKey] = useState('');
  const [newVolunteer, setNewVolunteer] = useState({ name: '', phone: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const { volunteers, setVolunteers } = useContext(VolunteerContext);
  const { setIsLoading } = useContext(LoadingContext);

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

  const handleAddVolunteer = async () => {
    if (authKey !== '1234567890') {
      alert('Invalid authentication key');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${baseUrl}/volunteers`, newVolunteer);
      setVolunteers((prev) => [...prev,newVolunteer]);
      setNewVolunteer({ name: '', phone: '' });
      setShowAddForm(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error adding volunteer:', error);
      setIsLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter((volunteer) =>
    (volunteer.name && volunteer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (volunteer.phone && volunteer.phone.includes(searchTerm))
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
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded w-3/4"
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2 text-white rounded ml-4"
            >
              {showAddForm ? '✖️' : '➕'}
            </button>
          </div>
          {showAddForm && (
            <div className="mb-4 p-4 border rounded bg-gray-100">
              <input
                type="text"
                placeholder="Name"
                value={newVolunteer.name}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
                className="p-2 border rounded mr-2 mb-2 w-full"
              />
              <input
                type="text"
                placeholder="Phone"
                value={newVolunteer.phone}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
                className="p-2 border rounded mr-2 mb-2 w-full"
              />
              <button
                onClick={handleAddVolunteer}
                className="p-1 font-bold text-xs bg-green-500 text-white rounded"
              >
                SUBMIT
              </button>
            </div>
          )}
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
