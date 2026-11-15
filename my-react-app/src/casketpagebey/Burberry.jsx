import React from 'react'
import { Link } from 'react-router-dom'

function Burberry() {
  return (
    <div id='Burberry'>
                  <div  className="carpp-22">
                    <Link to="/order/Burberry" className="cap-22">
                      <img src="/Casketimages/burberryimg.jpg" alt="Burberry" />
                      <div className="cap-22-info">
                        <h3>Burberry </h3>
                        <p>COLOR: ORANGE, high quality and elegant design.</p>
                      </div>
                    </Link>
                  </div>
    </div>
  )
}
export default Burberry;