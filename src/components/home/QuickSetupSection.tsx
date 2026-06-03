import { QuickLink } from "./Shared";

export function QuickSetupSection({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <>
      <QuickLink icon="flask" title="Setup Goal" subtitle="Weight" />
      <QuickLink icon="cutlery" title="Start Logging" subtitle="Activity" />
    </>
  );
}
