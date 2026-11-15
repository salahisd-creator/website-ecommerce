import React from 'react'
import { Link } from 'react-router-dom'

function Hermes() {
  return (
    <div id='Hermes'>
                  <div  className="carpp-22">
                    <Link to="/order/Hermes" className="cap-22">
                      <img src="/Casketimages/hermesimg.jpg" alt="Hermes" />
                      <div className="cap-22-info">
                        <h3>Hermes </h3>
                        <p>COLOR: ORANGE, high quality and elegant design.</p>
                      </div>
                    </Link>
                  </div>
    </div>
  )
}
export default Hermes;