import { ReportStatusScreen } from '@/components/report-status-screen';

export default function AdminCompletedReportsScreen() {
  return (
    <ReportStatusScreen
      status="completed"
      scope="admin"
      title="İşlemi Tamamlanan Raporlar"
      description="Tamamlanmış, doğrulanmış ve kapatılmış kayıtlar."
    />
  );
}

