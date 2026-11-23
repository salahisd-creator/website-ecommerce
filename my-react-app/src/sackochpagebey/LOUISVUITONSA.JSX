import React from 'react'
import { Link } from 'react-router-dom'
import { CardActions, cardStyles } from '../ProductCard1';
const styles = `
 .LVsack-11 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 30px 20px 60px;
}
a.LVsack-12 {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  max-width: 750px;
  min-height: 220px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  color: var(--c-d1);
  transition: transform 0.25s, box-shadow 0.25s;
  box-sizing: border-box;
}
a.LVsack-12:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
a.LVsack-12 img {
  display: block;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  height: auto;
  object-fit: cover;
  border-radius: 0;
}
.LVsack-13 {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;
  text-align: center;
}
.LVsack-13 h3 { margin: 0 0 12px; font-size: 24px; color: var(--c-d1); }
.LVsack-13 p  { margin: 0; font-size: 16px; line-height: 1.7; color: var(--c-d1); }
@media (max-width: 560px) {
  a.LVsack-12 { flex-direction: column; }
  a.LVsack-12 img { width: 100%; min-width: 0; max-width: 100%; height: 200px; }
}
`;


function LOUISVUITONSA() {
  const { watches, loading } = useWatches("louisvuitonsa");
  const { favs, toggleFav } = useFavs();
  

  if (loading) return <p style={{ textAlign: 'center' }}>جاري التحميل...</p>;

  return (
    <div id='LOUISVUITONSA'>
      <style>{styles}</style>
      <style>{cardStyles}</style>
      {watches.map((w) => (
        <div className="LVsack-11" key={w.id}>
          <Link to={`/order/${w.slug}`} className="LVsack-12">
            <img src={w.images?.[0]} alt={w.name} loading="lazy" decoding="async" />
            <div className="LVsack-13">
              <h3>{w.name}</h3>
              <p>{w.bio}</p>
              <CardActions price={w.price} id={w.slug} favs={favs} toggleFav={toggleFav}/>
            </div>
          </Link>
        </div>
      ))}
      <div style={{ height: 60 }} />
    </div>
  )
}

export default LOUISVUITONSA