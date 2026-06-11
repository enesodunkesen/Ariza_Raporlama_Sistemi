import { ReportStatusScreen } from '@/components/report-status-screen';

export default function AdminPendingReportsScreen() {
  return (
    <ReportStatusScreen
      status="pending"
      scope="admin"
      title="Beklemede Olan Raporlar"
      description="İlk değerlendirme için sırada bekleyen kayıtlar."
    />
  );
}

