/* تحديث عنوان الصفحة ووصفها (للمتصفح وجوجل) من داخل التطبيق */
import { useEffect } from 'react';

function setMeta(sel, attr, name, content) {
  let el = document.head.querySelector(sel);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
export function useSeo({ title, description, image } = {}) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    }
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    }
    if (image) setMeta('meta[property="og:image"]', 'property', 'og:image', image);
    try {
      let l = document.head.querySelector('link[rel="canonical"]');
      if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); }
      l.href = window.location.origin + window.location.pathname;
    } catch { /* تجاهل */ }
  }, [title, description, image]);
}
