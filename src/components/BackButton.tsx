/* ===================================================================
   BackButton — زر رجوع موحّد عبر كل الصفحات.
   =================================================================== */

import { useLocation } from 'wouter';

interface BackButtonProps {
  to?: string; // وجهة محددة، أو رجوع للخلف في السجل افتراضياً
  label?: string;
}

export default function BackButton({ to, label = 'رجوع' }: BackButtonProps) {
  const [, navigate] = useLocation();

  const handleBack = () => {
    if (to) navigate(to);
    else window.history.back();
  };

  return (
    <button className="back-button" onClick={handleBack}>
      <span aria-hidden="true">→</span>
      <span>{label}</span>
    </button>
  );
}
