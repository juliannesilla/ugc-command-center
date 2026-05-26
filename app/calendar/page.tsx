// A.14t T1-CALENDAR — /calendar route.
//
// Skills cited (HR-21): frontend-design (PRIMARY), vercel:nextjs,
// data:create-viz, refactoring-ui, superpowers:verification-before-completion.
//
// Server component. Imports the master DEADLINE_EVENTS pool from the same
// source that feeds /pipeline/deadlines (HR-2 PRESERVE — we do NOT introduce
// a parallel deadline model). Renders <Header> + <PageHeader> chrome for
// consistency with the rest of the app, then hands events + TODAY_ISO to the
// client-side <CalendarGrid>.

import { Header } from '@/components/ui/header';
import { PageHeader } from '@/components/ui';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { DEADLINE_EVENTS } from '@/lib/mock-data/deadline-events';
import { TODAY_ISO } from '@/lib/mock-data/deadlines';

export const metadata = { title: 'Calendar · UGC | Campaign HQ' };

export default function CalendarPage() {
  return (
    <>
      <Header
        pageEyebrow="Calendar"
        pageTitle="Campaign deadlines at a glance"
      />

      <main className="px-7 md:px-12 py-6 space-y-8">
        <PageHeader
          eyebrow="Monthly view"
          title="Calendar"
          subtitle="Filming · submissions · payments · follow-ups — month-at-a-glance. Click any day to expand, click any pin to jump to the campaign."
        />

        <div className="rise rise-1">
          <CalendarGrid events={DEADLINE_EVENTS} todayISO={TODAY_ISO} />
        </div>
      </main>
    </>
  );
}
