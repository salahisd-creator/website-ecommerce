import React from 'react'
import { Link } from 'react-router-dom'

function carira() {
  return (
    <div id='carira'>
                  
                  <div  className="carpp-22">
                    <Link to="/order/carira" className="cap-22">
                      <img src="/luneimags/carira.jpg" alt="CARIRA" />
                      <div className="cap-22-info">
                        <h3>CARIRA </h3>
                        <p>COLOR: ORANGE, high quality and elegant design.</p>
                      </div>
                    </Link>
                  </div>
    </div>
  )
}

export default carira;
