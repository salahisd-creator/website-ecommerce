import React from 'react'
import { Link } from 'react-router-dom'

function BOTTEGA() {
  return (
    <div id='BOTTEGA'>
                
                  <div  className="carpp-22">
                    <Link to="/order/BOTTEGA" className="cap-22">
                      <img src="/luneimags/bottega.jpg" alt="BOTTEGA" />
                      <div className="cap-22-info">
                        <h3>BOTTEGA </h3>
                        <p>COLOR: ORANGE, high quality and elegant design.</p>
                      </div>
                    </Link>
                  </div>
    </div>
  )
}

export default BOTTEGA;

