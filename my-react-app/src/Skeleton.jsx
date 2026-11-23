/* هيكل تحميل هادئ بدل جملة «جاري التحميل...»: يظهر بعد لحظة فقط، فإن كان التحميل سريعاً لا يراه الزائر */
export default function Skeleton({ cards = 6 }) {
  return (
    <div className="sk-wrap" aria-busy="true" aria-live="polite">
      <div className="sk-grid">
        {Array.from({ length: cards }, (_, i) => (
          <div className="sk-card" key={i}><div className="sk-img" /><div className="sk-line" /><div className="sk-line s" /></div>
        ))}
      </div>
    </div>
  );
}
