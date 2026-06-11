import { ReportStatusScreen } from '@/components/report-status-screen';

export default function AdminInProgressReportsScreen() {
  return (
    <ReportStatusScreen
      status="in_progress"
      scope="admin"
      title="İşleme Alınan Raporlar"
      description="Operasyon ekipleri tarafından üzerinde çalışılan kayıtlar."
    />
  );
}

