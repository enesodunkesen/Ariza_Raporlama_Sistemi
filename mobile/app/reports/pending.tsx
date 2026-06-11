import { ReportStatusScreen } from '@/components/report-status-screen';

export default function PendingReportsScreen() {
  return (
    <ReportStatusScreen
      status="pending"
      scope="user"
      title="Beklemede Olan Raporlarım"
      description="Cevap bekleyen ve henüz incelenmemiş raporlar."
    />
  );
}

