
//Home-Page//
import './App.css';
import tape from './tape';
import { Link,Route,Router, Routes} from 'react-router-dom'
import RolexPro from './RolexPro';
import Lunpage from './Lunpage';
import sackochpage from './sackochpage';
import casketpage from './casketpage';
import React from 'react'

function tape1 () {
  return (
    <div>
       <div>     
           <h1 id='titleh1'> ISD | +213 
           <button type="submit" className="user-btn">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <circle cx="12" cy="7" r="4" />
             <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2z" />
            </svg>
      </button>
      <button className="menu-btn" aria-label="القائمة">
         <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round">
         <line x1="4" y1="6" x2="20" y2="6" />
         <line x1="4" y1="12" x2="20" y2="12" />
         <line x1="4" y1="18" x2="20" y2="18" />
         </svg>
      </button>
      <a
        className="location-btn"
          href="https://maps.app.goo.gl/uXtenBHDi6aknz4q8?g_st=com.google.maps.preview.copy"
          target="_blank"
          rel="noreferrer"
          aria-label="Stor Location">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
          <circle cx="12" cy="10" r="2.5" />
         </svg>
       </a>
         <button className="search-btn" aria-label="بحث">
         <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <circle cx="11" cy="11" r="7" />
         <line x1="16.5" y1="16.5" x2="21" y2="21" />
         </svg>
      </button>
      <button className="heart-btn" aria-label="المفضلة">
         <svg width="40" height="40" viewBox="0 0 24 24" fill="#000000" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z" />
         </svg>
      </button>
      </h1>
      
    </div>
  </div>
  )
}
function Home() {
  return (
    <div>
      <p id='titleh2'> ISD : Every Watch Reflects the Personality of Its Wearer.</p>
      <p id='titleh2'> Choose Your Watch. Express Yourself </p>
      <div id='imgr10'>
        <Link to="/rolex" className='watch-link'>
          <img src="./imgr.webp" alt="image1"/>
          <div>
            <h3>Luxury Watches</h3>
            <p> Luxury Watches of high quality, available in a variety of colors, both authentic and high-quality replicas</p>
           </div>
        </Link>
      </div>
      <div id='imgl11'>
        <Link to="/lun" className='lun-link'>
          <img src="./lunimg.jpg" alt="image2"/>
          <div>
            <h3>Luxury Watches</h3>
            <p> Luxury Watches of high quality, available in a variety of colors, both authentic and high-quality replicas</p>
           </div>
        </Link>
      </div>
      <div id='imgsa11'>
        <Link to="/sackoch" className='sackochlink'>
          <img src="./sackochimg.jpeg" alt="image3"/>
          <div>
            <h3>Luxury Watches</h3>
            <p> Luxury Watches of high quality, available in a variety of colors, both authentic and high-quality replicas</p>
           </div>
        </Link>
      </div>
      <div id='imgca11'>
        <Link to="/casket" className='casketlink'>
          <img src="./casketimg.jpeg" alt="image3"/>
          <div>
            <h3>Luxury Watches</h3>
            <p> Luxury Watches of high quality, available in a variety of colors, both authentic and high-quality replicas</p>
           </div>
        </Link>
      </div>
    </div>
)}
function App () {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rolex" element={<RolexPro />} />
      </Routes>
    </div>
  )
}
function lun() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lun" element={<Lunpage />} />
      </Routes>
    </div>
  )
}
function sackoch() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sackoch" element={<sackochpage />} />
      </Routes>
    </div>
  )
}
function casket() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/casket" element={<casketpage />} />
      </Routes>
    </div>
  )
}

export default tape