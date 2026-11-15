import React from 'react'
import { Link } from 'react-router-dom'

function BRUNELLO() {
  return (
    <div id='BRUNELLO'>
                  <div  className="carpp-22">
                    <Link to="/order/BRUNELLO" className="cap-22">
                      <img src="/luneimags/brunello.jpg" alt="BRUNELLO" />
                      <div className="cap-22-info">
                        <h3>BRUNELLO </h3>
                        <p>COLOR: ORANGE, high quality and elegant design.</p>
                      </div>
                    </Link>
                  </div>
    </div>
  )
}

export default BRUNELLO;
