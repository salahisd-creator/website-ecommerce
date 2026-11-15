import React from 'react'
import { Link } from 'react-router-dom'

function BALMAIN() {
  return (
    <div id='BALMAIN'>
                 
                  <div  className="carpp-22">
                    <Link to="/order/BALMAIN" className="cap-22">
                      <img src="/luneimags/balmain.jpg" alt="BALMAIN" />
                      <div className="cap-22-info">
                        <h3>BALMAIN </h3>
                        <p>COLOR: ORANGE, high quality and elegant design.</p>
                      </div>
                    </Link>
                  </div>
    </div>
  )
}

export default BALMAIN;
