import './App.css';
import { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import AddStudentForm from './AddStudentForm';
import StudentList from './StudentList';
import StudentDetail from './StudentDetail';
import LoadingScreen from './LoadingScreen';
import { LoadingContext, LoadingProvider } from './LoadingContext';
import NavBar from './NavBar';
import EditStudent from './EditStudent';
import Attendance from './Attendance';

function AppContent() {
  const baseUrl = process.env.REACT_APP_BASE_URL;

  const { isLoading } = useContext(LoadingContext);
  return (
    <>
      {isLoading && <LoadingScreen />}
      <NavBar />
      <div className="p-8">
        <Routes>
          <Route exact path="/" element={<StudentList baseUrl={baseUrl}/>} />
          <Route path="/students/:rollNumber" element={<StudentDetail baseUrl={baseUrl} />} />
          <Route path="/add-student" element={<AddStudentForm  baseUrl={baseUrl}/>} />
          <Route path="/edit-student/:rollNumber" element={<EditStudent baseUrl={baseUrl} />} />
          <Route path="/attendance" element={<Attendance baseUrl={baseUrl} />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <LoadingProvider>
      <Router>
        <AppContent />
      </Router>
    </LoadingProvider>
  );
}

export default App;
