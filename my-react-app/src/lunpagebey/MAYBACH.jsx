import React from 'react'
import { Link } from 'react-router-dom'

function MAYBACH() {
  return (
    <div id='MAYBACH'>
                  <div  className="carpp-22">
                    <Link to="/order/MAYBACH" className="cap-22">
                      <img src="/luneimags/maybach.jpg" alt="MAYBACH" />
                      <div className="cap-22-info">
                        <h3>MAYBACH </h3>
                        <p>COLOR: ORANGE, high quality and elegant design.</p>
                      </div>
                    </Link>
                  </div>
    </div>
  )
}

export default MAYBACH;
