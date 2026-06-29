/* ===================================================================
   Settings.tsx — الإعدادات (منسّق): يجمّع أقسام الإعدادات المستقلة.
   كل قسم مكوّن مستقل في src/pages/settings/ يستدعي useCore بنفسه.
   التنبيه (hint) مركزي هنا ويُمرَّر للأقسام التي تحتاجه.
   =================================================================== */

import { useState } from 'react';
import BackButton from '../components/BackButton';
import ProfileSection from './settings/ProfileSection';
import AppearanceSection from './settings/AppearanceSection';
import NotificationsSection from './settings/NotificationsSection';
import BackupSection from './settings/BackupSection';
import AccountSection from './settings/AccountSection';
import SecuritySection from './settings/SecuritySection';
import AboutSection from './settings/AboutSection';

export default function Settings() {
  const [hint, setHint] = useState<string | null>(null);

  return (
    <div className="page">
      <BackButton />

      <h1 className="section-title">⚙️ الكواليس والأمان</h1>

      <ProfileSection setHint={setHint} />
      <AppearanceSection />
      <NotificationsSection setHint={setHint} />

      {hint && <div className="hint-msg ok">{hint}</div>}

      <BackupSection setHint={setHint} />
      <AccountSection />
      <SecuritySection setHint={setHint} />
      <AboutSection setHint={setHint} />
    </div>
  );
}
