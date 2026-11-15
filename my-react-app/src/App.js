
//Home-Page//
import './App.css';
import tape from './tape';
import { Link,Route,Router, Routes} from 'react-router-dom'
import RolexPro from './RolexPro';
import Lunpage from './Lunpage';
import Sackochpage from './Sackochpage';
import Casketpage from './casketpage';
import React from 'react'
import ROLEXX from './ROLEXMBEY/ROLEXX';
import PATEK from './ROLEXMBEY/PATEK'
import OMEGA from './ROLEXMBEY/OMEGA'
import AP from './ROLEXMBEY/AP'
import CARTIER from './ROLEXMBEY/CARTIER';
import TISSOT from './ROLEXMBEY/TISSOT';
import ProductPage from './ProductPage1';
import Favorites from './Favorites';
import { supabase } from './supabaseClient';
import Login from './login';
import { FaInstagram, FaFacebookF, FaWhatsapp, FaTelegram, FaViber } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaPhone, FaEnvelope, FaLocationDot, FaClock } from "react-icons/fa6";
import  CARTIERL2  from './lunpagebey/CARTIERL2';
import  CARTIERL1  from './lunpagebey/CARTIERL1';
import CARTIERL3  from './lunpagebey/CARTIERL3';
import LOUISVUITON from './lunpagebey/LOUISVUITON';
import carira from './lunpagebey/carira';
import BOTTEGA from './lunpagebey/BOTTEGA';
import BRUNELLO from './lunpagebey/BRUNELLO';
import ZENGA from './lunpagebey/ZENGA';
import GAZAL from './lunpagebey/GAZAL';
import MAYBACH from './lunpagebey/MAYBACH';
import BALMAIN from './lunpagebey/BALMAIN';
import LOROBIANA from './lunpagebey/LOROBIANA';
import LOUISVUITONSA from './sackochpagebey/LOUISVUITONSA.JSX';
import Burberry from './casketpagebey/Burberry';
import Hermes from './casketpagebey/Hermes';
import Prada from './casketpagebey/Prada';
import Burberry2 from './casketpagebey/Burberry2';



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
            <h3>Premium Frames Collection</h3>
            <p> Gold-tone rimless frames, lightweight and comfortable for all-day wear. Case included. Order now via WhatsApp.</p>
           </div>
        </Link>
      </div>
      <div id='imgsa11'>
        <Link to="/Sakochpage" className='sackochlink'>
          <img src="./sackochimg.jpeg" alt="image3"/>
          <div>
            <h3>Luxury Messenger Bag</h3>
            <p> Gold-tone rimless frames, lightweight and comfortable for all-day wear. Case included. Order now via WhatsApp.</p>
           </div>
        </Link>
      </div>
      <div id='imgca11'>
        <Link to="/casket" className='casketlink'>
          <img src="./casketimg.jpeg" alt="image3"/>
          <div>
            <h3>Luxury Checkered Cap</h3>
            <p> Premium checkered cap in a classic black pattern. Adjustable fit, comfortable all day, with a clean designer look.</p>
           </div>
        </Link>
      </div>
    </div>
)}
function App () {
  console.log("supabase:", supabase);
  const contacts = [
          { icon: <FaPhone />, label: "Phone ", value: "+213 555 00 00 00", href: "https://wa.me/213555000000" },
          { icon: <FaEnvelope />, label: "Email", value: "cheribetsal@gmail.com", href: "mailto:cheribetsalah@gmail.com" },
          { icon: <FaLocationDot />, label: "Location", value: "Alger, Algérie" },
          { icon: <FaClock />, label: "Working Hours", value: "09:00 - 21:00 · Sam - Jeu" },
];
  return (
    <div>
      <h1 id='titleh1'> ISD | +213 
        <img src="/Logoi.jpg" alt="isd +213" id='logoisdimg'/>
           <button type="submit" className="user-btn">
            <Link to="/login" >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <circle cx="12" cy="7" r="4" />
               <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2z" />
              </svg>
            </Link>
          
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
      <button className="heart-btn" aria-label="المفضلة" >
        < Link to="/favorites">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#000000" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z" />
           </svg>
        </Link>
      </button>
      </h1>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rolex" element={<RolexPro />} />
        <Route path="/ROLEXMBEY/ROLEXX" element={<ROLEXX />} />
        <Route path="/ROLEXMBEY/PATEK" element={<PATEK />} />
        <Route path="/ROLEXMBEY/OMEGA" element={<OMEGA />} />
        <Route path="/ROLEXMBEY/AP" element={<AP />} />
        <Route path="/ROLEXMBEY/CARTIER" element={<CARTIER />} />
        <Route path="/ROLEXMBEY/TISSOT" element={<TISSOT />} />
        <Route path="/lun" element={<Lunpage />} />
        <Route path="/Sakochpage" element={<Sackochpage />} />
        <Route path="/casket" element={<Casketpage />} />
        <Route path="/order/:productId" element={<ProductPage />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lunpagebey/CARTIERL2" element={<CARTIERL2 />} />
        <Route path="/lunpagebey/CARTIERL1" element={<CARTIERL1 />} />
        <Route path="/lunpagebey/CARTIERL3" element={<CARTIERL3 />} />
        <Route path="/lunpagebey/LOUISVUITON" element={<LOUISVUITON />} />
        <Route path="/lunpagebey/carira" element={<carira />} />
        <Route path="/lunpagebey/bottega" element={<BOTTEGA />} />
        <Route path="/lunpagebey/brunello" element={<BRUNELLO />} />
        <Route path="/lunpagebey/gazal" element={<GAZAL />} />
        <Route path="/lunpagebey/ZENGA" element={<ZENGA />} />
        <Route path="/lunpagebey/MAYBACH" element={<MAYBACH />} />
        <Route path="/lunpagebey/BALMAIN" element={<BALMAIN />} />
        <Route path="/lunpagebey/LOROBIANA" element={<LOROBIANA />} />
        <Route path="/sackochpagebey/LOUISVUITONSA" element={<LOUISVUITONSA />} />
        <Route path="/casketpagebey/Burberry" element={<Burberry />} />
        <Route path="/casketpagebey/Prada" element={<Prada />} />
        <Route path="/casketpagebey/Hermes" element={<Hermes />} />
        <Route path="/casketpagebey/Burberry2" element={<Burberry2 />} />
        
      </Routes>
      <div id='footer'>
       <footer className="footer">
        <img src="/Logoi.jpg" alt="isd +213" id='logoisdimgar'/>
        <h1 id="footer-title">ISD+213 </h1>

        <h3>Canaux Officiels</h3>
        <div className="socials">
         <a href="#"><FaInstagram /></a>
         <a href="#"><FaFacebookF /></a>
         <a href="#"><FaXTwitter /></a>
         <a href="#"><FaWhatsapp /></a>
         <a href="#"><FaTelegram /></a>
         <a href="#"><FaViber /></a>
        </div>
        <div className="contact-grid">
         {contacts.map((c) => {
          const Tag = c.href ? "a" : "div";
        return (
          <Tag key={c.label} className="contact-card" href={c.href} target="_blank" rel="noreferrer">
           <span className="contact-icon">{c.icon}</span>
           <span className="contact-text">
          <small>{c.label}</small>
          <strong>{c.value}</strong>
        </span>
      </Tag>
    );
  })}
</div>
       <p className="copy">© 2026 جميع الحقوق محفوظة (Created by Salah cheribet)</p>
       </footer>
       </div>



    
      
    </div>
  )
}

export default App