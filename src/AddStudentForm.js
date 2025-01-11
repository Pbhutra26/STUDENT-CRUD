import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoadingContext } from './LoadingContext';

function AddStudentForm({ baseUrl}) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [learningLevel, setLearningLevel] = useState('');
  const [metadata, setMetadata] = useState([]);
  const [image, setImage] = useState(null);
  const [gender, setGender] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [dob, setDob] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const { setIsLoading } = useContext(LoadingContext);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
  };
 const navigate = useNavigate();
  const handleImageUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'upload_preset_prathamesh'); // Replace with your unsigned upload preset

    try {
      setIsLoading(true);
      const response = await axios.post('https://api.cloudinary.com/v1_1/prathamesh-cloud/image/upload', formData);
      return response.data.secure_url;  // Return the image URL from the Cloudinary response
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addField = () => {
    setMetadata([...metadata, { key: '', value: '' }]);
  };

  const deleteField = (index) => {
    const newMetadata = metadata.filter((_, i) => i !== index);
    setMetadata(newMetadata);
  };

  const handleInputChange = (index, event) => {
    const newMetadata = [...metadata];
    newMetadata[index][event.target.name] = event.target.value;
    setMetadata(newMetadata);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setIsLoading(true);
      const imageUrl = await handleImageUpload();
  
      const formattedMetadata = metadata.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {});
  
      const response = await axios.post(`${baseUrl}/students`, {
        name,
        age,
        phone,
        learningLevel,
        metadata: formattedMetadata,
        imageUrl,  // Include image URL
        gender,
        guardianName,
        dob,
        schoolName,
        studentClass
      });
      navigate('/');
      // alert(response.data.message);
    } catch (error) {
      alert('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700">
          Student Name:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="age" className="block text-gray-700">
          Age:
        </label>
        <input
          type="number"
          id="age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="phone" className="block text-gray-700">
          Phone Number:
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="image" className="block text-gray-700">
          Upload Image:
        </label>
        <input
          type="file"
          id="image"
          onChange={handleImageChange}
          className="w-full px-4 py-2 border rounded"
          capture="camera"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Gender:</label>
        <div>
          <label>
            <input
              type="radio"
              value="Male"
              checked={gender === 'Male'}
              onChange={(e) => setGender(e.target.value)}
            />
            Male
          </label>
          <label>
            <input
              type="radio"
              value="Female"
              checked={gender === 'Female'}
              onChange={(e) => setGender(e.target.value)}
            />
            Female
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="guardianName" className="block text-gray-700">
          Guardian's Name:
        </label>
        <input
          type="text"
          id="guardianName"
          value={guardianName}
          onChange={(e) => setGuardianName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="dob" className="block text-gray-700">
          Date of Birth:
        </label>
        <input
          type="date"
          id="dob"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="schoolName" className="block text-gray-700">
          School Name:
        </label>
        <input
          type="text"
          id="schoolName"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="studentClass" className="block text-gray-700">
          Class:
        </label>
        <input
          type="text"
          id="studentClass"
          value={studentClass}
          onChange={(e) => setStudentClass(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>

      {metadata.map((field, index) => (
        <div key={index} className="mb-4 flex items-center">
          <input
            type="text"
            name="key"
            value={field.key}
            onChange={(e) => handleInputChange(index, e)}
            placeholder="Key"
            className="w-2/5 px-4 py-2 border rounded mr-2"
            required
          />
          <input
            type="text"
            name="value"
            value={field.value}
            onChange={(e) => handleInputChange(index, e)}
            placeholder="Value"
            className="w-2/5 px-4 py-2 border rounded mr-2"
            required
          />
          <button
            type="button"
            onClick={() => deleteField(index)}
            className="px-2 py-1 bg-white text-red rounded-full"
          >
            &#10006;
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addField}
        className="m-1 px-2 py-1 bg-blue-500 text-white rounded-lg"
      >
        Add Field
      </button>

      <button type="submit" className="px-2 py-1 m-1 bg-green-500 text-white rounded-lg">
        Add Student
      </button>
    </form>
  );
}

export default AddStudentForm;
