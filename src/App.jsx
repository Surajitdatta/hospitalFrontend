
import './App.css'
import {BrowserRouter as BR, Routes, Route} from "react-router-dom";
import Home from './components/Home/Home';
import Admin from './components/Admin/Admin';
import Contact from './components/Contacts/Contact';
import Department from './components/Department/Department';
import Doctor from './components/Doctor/Doctor';
import Jobs from './components/Jobs/Jobs';
import News from './components/News/News';
import Review from './components/Reviews/Review';
import User from './components/User/User';
import Header from './Header/Header';
import Footer from './components/Footer/Footer';
import Appoinment from './components/Appoinment/Appoinment';
// import Message from './components/Message/Message';
import Terms from './components/Terms/Terms';
import Edit from './components/Admin/Edit';
import Insurance from './components/Insurance/Insurance';
import HealthPackage from './components/HealthPackage/HealthPackage';
import EmergencyBed from './components/Emergency/EmergencyBed';
import Ambulance from './components/Ambulance/Ambulance';

function App() {

  return (
    <>
      <BR>
        <Header/>
        <Routes>
           <Route path = "/" element={<Home/>}  />
           <Route path = "/admin" element={<Admin/>} />
           <Route path = "/admin/contacts" element={<Contact/>} />
           <Route path="/admin/departments" element={<Department />} />
           <Route path="/admin/doctors" element={<Doctor />} />
           <Route path="/admin/jobs" element={<Jobs />} />
           <Route path="/admin/news-events" element={<News />} />
           <Route path="/admin/reviews" element={<Review />} />
           <Route path="/admin/users" element={<User />} />
           <Route path="/admin/appoinment" element={<Appoinment/>}/>
           <Route path="/admin/terms" element={<Terms/>}/>
           <Route path="/admin/edit" element={<Edit/>}/>
           <Route path="/admin/insurance" element={<Insurance/>}/>
           <Route path="/admin/healthpackage" element={<HealthPackage/>}/>
           <Route path="/admin/emergencybed" element={<EmergencyBed/>}/>
           <Route path="/admin/ambulance" element={<Ambulance/>}/>
        </Routes>
        <Footer/>
      </BR>
      
    </>
  )
}

export default App
