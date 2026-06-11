import { ReportStatusScreen } from '@/components/report-status-screen';

export default function InProgressReportsScreen() {
  return (
    <ReportStatusScreen
      status="in_progress"
      scope="user"
      title="İşleme Alınan Raporlarım"
      description="Uzman ekipler tarafından üzerinde çalışılan raporlar."
    />
  );
}

