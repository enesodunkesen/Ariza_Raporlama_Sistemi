import { ReportStatusScreen } from '@/components/report-status-screen';

export default function CompletedReportsScreen() {
  return (
    <ReportStatusScreen
      status="completed"
      scope="user"
      title="İşlemi Tamamlanan Raporlar"
      description="Çözüm süreci tamamlanan ve kapatılan raporlar."
    />
  );
}

