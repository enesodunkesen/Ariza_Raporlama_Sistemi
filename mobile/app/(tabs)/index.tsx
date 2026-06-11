import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { WorkflowStatus } from '@/models/Report';
import ReportService from '@/services/ReportService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const QUICK_ACTIONS = [
  {
    key: 'new-report',
    title: 'Yeni Rapor Ekle',
    description: 'Üretim hattındaki arızayı fotoğraflarla hızlıca bildir.',
    badge: 'Başlat',
  },
] as const;

const STATUS_SECTIONS: {
  key: WorkflowStatus;
  title: string;
  description: string;
  path: string;
}[] = [
  {
    key: 'pending',
    title: 'Beklemede Olan Raporlarım',
    description: 'Cevap bekleyen ve henüz incelenmemiş raporlar.',
    path: '/reports/pending',
  },
  {
    key: 'in_progress',
    title: 'İşleme Alınan Raporlarım',
    description: 'Uzman ekipler tarafından üzerinde çalışılan raporlar.',
    path: '/reports/in-progress',
  },
  {
    key: 'completed',
    title: 'İşlemi Tamamlanan Raporlar',
    description: 'Çözüm süreci tamamlanmış ve kapatılmış raporlar.',
    path: '/reports/completed',
  },
];

const INITIAL_STATUS_COUNTS: Record<WorkflowStatus, number> = {
  pending: 0,
  in_progress: 0,
  completed: 0,
};

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [todayCount, setTodayCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<WorkflowStatus, number>>(INITIAL_STATUS_COUNTS);
  const reportService = ReportService.getInstance();
  const user = reportService.getCurrentUser();

  useEffect(() => {
    // Kullanıcı yoksa giriş ekranına yönlendir.
    if (!user) {
      router.replace('/(auth)/sign-in');
    }
  }, [user]); // Bu effect, yalnızca 'user' değiştiğinde çalışır.

  const updateStats = useCallback(async () => {
    const currentUser = reportService.getCurrentUser();
    if (currentUser) {
      const stats = await reportService.getUserDashboardStats();
      if (stats?.data) {
        setTodayCount(stats.data.todayCount || 0);
        setWeeklyCount(stats.data.weeklyCount || 0);
        setTotalCount(stats.data.totalCount || 0);
        setStatusCounts({
          pending: stats.data.pendingCount || 0,
          in_progress: stats.data.inProgressCount || 0,
          completed: stats.data.completedCount || 0,
        });
      }
    } else {
      setTodayCount(0);
      setWeeklyCount(0);
      setTotalCount(0);
      setStatusCounts(INITIAL_STATUS_COUNTS);
    }
  }, [reportService]);

  useFocusEffect(
    useCallback(() => {
      updateStats();
    }, [updateStats])
  );

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        { 
          text: 'Evet', 
          style: 'destructive',
          onPress: () => {
            reportService.logout();
            router.replace('/(auth)/sign-in');
          }
        }
      ]
    );
  };

  const navigateToReportsByStatus = (status: WorkflowStatus) => {
    const target = STATUS_SECTIONS.find((section) => section.key === status);
    if (target) {
      router.push(target.path as any);
    }
  };

  const navigateToNewReport = () => {
    router.push('/new-report');
  };

  const themedStyles = useMemo(() => {
    const isLight = colorScheme === 'light';

    const quickActionBg = palette.quickActionBackground ?? palette.primaryMuted;
    const quickActionTitleColor = palette.quickActionText ?? palette.text;
    const quickActionDescriptionColor = palette.muted;
    const quickActionBadgeBg = colorScheme === 'dark' ? palette.surface : palette.primaryMuted;
    const quickActionBadgeTextColor = palette.quickActionText ?? palette.text;
    const quickActionBadgeBorderColor = palette.border;

    return {
      card: {
        backgroundColor: palette.surface,
        borderColor: palette.border,
        shadowColor: palette.cardShadow,
      },
      profileIcon: {
        backgroundColor: palette.primary,
      },
      statNumber: {
        color: palette.primary,
      },
      quickActionCard: {
        backgroundColor: quickActionBg,
        borderColor: isLight ? 'transparent' : palette.border,
        shadowColor: palette.cardShadow,
      },
      quickActionTitle: {
        color: quickActionTitleColor,
      },
      quickActionDescription: {
        color: quickActionDescriptionColor,
        opacity: isLight ? 0.9 : 1,
      },
      quickActionBadge: {
        backgroundColor: quickActionBadgeBg,
        borderColor: quickActionBadgeBorderColor,
      },
      quickActionBadgeText: {
        color: quickActionBadgeTextColor,
      },
      logoutWrapper: {
        backgroundColor: palette.surface,
        borderColor: palette.border,
        shadowColor: palette.cardShadow,
      },
      logoutButton: {
        borderColor: 'transparent',
        shadowColor: 'transparent',
      },
      logoutButtonText: {
        color: palette.danger,
      },
      statusButtons: {
        pending: {
          backgroundColor: palette.statusPendingBg,
          borderColor: palette.border,
          shadowColor: palette.cardShadow,
        },
        in_progress: {
          backgroundColor: palette.statusInProgressBg,
          borderColor: palette.border,
          shadowColor: palette.cardShadow,
        },
        completed: {
          backgroundColor: palette.statusCompletedBg,
          borderColor: palette.border,
          shadowColor: palette.cardShadow,
        },
      } as Record<WorkflowStatus, { backgroundColor: string; borderColor: string; shadowColor: string }>,
    };
  }, [colorScheme, palette]);

  // Kullanıcı yoksa, yönlendirme gerçekleşene kadar hiçbir şey render etme.
  if (!user) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profil Kartı */}
        <View style={[styles.profileCard, themedStyles.card]}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileIcon, themedStyles.profileIcon]}>
              <Text style={styles.profileIconText}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="subtitle" style={styles.welcomeText}>
                Hoş Geldiniz, {user.username}!
              </ThemedText>
              <ThemedText type="default" style={styles.bantNumber}>
                Bant No: {user.bantNumber}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* İstatistik Kartları */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, themedStyles.card]}>
            <ThemedText type="title" style={[styles.statNumber, themedStyles.statNumber]}>
              {todayCount}
            </ThemedText>
            <ThemedText type="default" style={styles.statLabel}>
              Bugünkü Raporlar
            </ThemedText>
          </View>
          
          <View style={[styles.statCard, themedStyles.card]}>
            <ThemedText type="title" style={[styles.statNumber, themedStyles.statNumber]}>
              {weeklyCount}
            </ThemedText>
            <ThemedText type="default" style={styles.statLabel}>
              Haftalık Toplam
            </ThemedText>
          </View>
          
          <View style={[styles.statCard, themedStyles.card]}>
            <ThemedText type="title" style={[styles.statNumber, themedStyles.statNumber]}>
              {totalCount}
            </ThemedText>
            <ThemedText type="default" style={styles.statLabel}>
              Toplam Rapor
            </ThemedText>
          </View>
        </View>

        {/* Durum Kısayolları */}
        <View style={styles.statusButtonGroup}>
          {STATUS_SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.key}
              style={[styles.statusButton, themedStyles.statusButtons[section.key]]}
              onPress={() => navigateToReportsByStatus(section.key)}>
              <View style={styles.statusButtonHeader}>
                <ThemedText type="subtitle" style={[styles.statusButtonTitle, { color: palette.statusText }]}>
                  {section.title}
                </ThemedText>
                <Text style={[styles.statusButtonCount, { color: palette.statusText }]}>
                  {statusCounts[section.key]} rapor
                </Text>
              </View>
              <Text style={[styles.statusButtonDescription, { color: palette.statusText }]}>
                {section.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Genel Buton */}
        <View style={styles.buttonContainer}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={[styles.statusButton, styles.quickActionButton, themedStyles.quickActionCard]}
              onPress={navigateToNewReport}>
              <View style={styles.statusButtonHeader}>
                <ThemedText type="subtitle" style={[styles.statusButtonTitle, themedStyles.quickActionTitle]}>
                  {action.title}
                </ThemedText>
                <View style={[styles.quickActionBadge, themedStyles.quickActionBadge]}>
                  <Text style={[styles.quickActionBadgeText, themedStyles.quickActionBadgeText]}>{action.badge}</Text>
                </View>
              </View>
              <Text style={[styles.statusButtonDescription, themedStyles.quickActionDescription]}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Çıkış Butonu */}
        <View style={{ height: 24 }} />
      </ScrollView>
      <View style={[styles.logoutContainer, { paddingBottom: 20 + insets.bottom }]}>
        <View style={[styles.logoutWrapper, themedStyles.logoutWrapper]}>
          <TouchableOpacity style={[styles.logoutButton, themedStyles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.logoutButtonText, themedStyles.logoutButtonText]}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: 60,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
  },
  profileCard: {
    borderRadius: 16,
    padding: 25,
    marginBottom: 25,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  profileIconText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  bantNumber: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 4,
    minHeight: 100,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    flexWrap: 'wrap',
    lineHeight: 16,
  },
  buttonContainer: {
    marginBottom: 25,
    gap: 12,
  },
  statusButtonGroup: {
    marginBottom: 25,
    gap: 12,
  },
  statusButton: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  statusButtonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusButtonCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusButtonDescription: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  quickActionButton: {
    gap: 8,
  },
  quickActionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  quickActionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 0,
  },
  logoutWrapper: {
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
