import React from 'react'

import { Link } from 'react-router-dom'

function prada() {
  return (
    <div id='Prada'>
                  <div  className="carpp-22">
                    <Link to="/order/Prada" className="cap-22">
                      <img src="/Casketimages/pradaimg.jpg" alt="Prada" />
                      <div className="cap-22-info">
                        <h3>Prada </h3>
                        <p>COLOR: ORANGE, high quality and elegant design.</p>
                      </div>
                    </Link>
                  </div>
    </div>
  )
}
export default prada;