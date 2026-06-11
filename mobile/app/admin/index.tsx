import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import ReportService from '@/services/ReportService';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ADMIN_ACTIONS = [
  {
    key: 'requests',
    title: 'Taleplerim',
    description: 'Saha ekiplerinden gelen tüm talepleri görüntüleyin.',
    badge: 'Görüntüle',
  },
  {
    key: 'create-request',
    title: 'Talep Oluştur',
    description: 'Yeni bir operasyon talebi oluşturup süreci başlatın.',
    badge: 'Oluştur',
  },
] as const;

const STATUS_SHORTCUTS = [
  {
    key: 'pending',
    title: 'Beklemede Olan Raporlar',
    description: 'İlk değerlendirme için sırada bekleyen kayıtlar.',
    path: '/admin/reports/pending',
  },
  {
    key: 'in_progress',
    title: 'İşleme Alınan Raporlar',
    description: 'Operasyon ekipleri tarafından üzerinde çalışılan kayıtlar.',
    path: '/admin/reports/in-progress',
  },
  {
    key: 'completed',
    title: 'Tamamlanan Raporlar',
    description: 'İşlemi tamamlanmış ve doğrulanan kayıtlar.',
    path: '/admin/reports/completed',
  },
] as const;

export default function AdminScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [todayCount, setTodayCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const reportService = ReportService.getInstance();
  const user = reportService.getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== 'chief') {
      router.replace('/(auth)/sign-in');
    }
  }, [user]);

  const updateStats = useCallback(async () => {
    if (user) {
      const stats = await reportService.getAdminDashboardStats();
      if (stats?.data) {
        setTodayCount(stats.data.todayCount || 0);
        setWeeklyCount(stats.data.pendingCount || 0); // Using PendingCount as Weekly is missing
        setTotalCount(stats.data.totalReports || 0);
      }
    }
  }, [reportService, user]);

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

  const navigateToRequests = () => {
    router.push('/admin/requests');
  };

  const navigateToReportsByStatus = (path: string) => {
    router.push(path as any);
  };

  const navigateToCreateRequest = () => {
    router.push('/admin/create-request');
  };

  const themedStyles = useMemo(() => {
    const quickActionBg = palette.quickActionBackground ?? palette.primaryMuted;
    const quickActionTitleColor = palette.quickActionText ?? palette.text;
    const quickActionDescriptionColor = palette.muted;
    const quickActionBadgeBg = colorScheme === 'dark' ? palette.surface : palette.primaryMuted;
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
        borderColor: palette.border,
        shadowColor: palette.cardShadow,
      },
      quickActionTitle: {
        color: quickActionTitleColor,
      },
      quickActionDescription: {
        color: quickActionDescriptionColor,
      },
      quickActionBadge: {
        backgroundColor: quickActionBadgeBg,
        borderColor: palette.border,
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
      statusTitle: {
        color: palette.statusText,
      },
      statusDescription: {
        color: palette.statusText,
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
      } as Record<'pending' | 'in_progress' | 'completed', { backgroundColor: string; borderColor: string; shadowColor: string }>,
    };
  }, [colorScheme, palette]);

  if (!user || user.role !== 'chief') {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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
                Bant Şefi: {user.bantNumber}
              </ThemedText>
            </View>
          </View>
        </View>

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
              Bekleyen Raporlar
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

        <View style={styles.statusButtonGroup}>
          {STATUS_SHORTCUTS.map((shortcut) => (
            <TouchableOpacity
              key={shortcut.key}
              style={[styles.statusButton, themedStyles.statusButtons[shortcut.key]]}
              onPress={() => navigateToReportsByStatus(shortcut.path)}>
              <View style={styles.statusButtonHeader}>
                <ThemedText type="subtitle" style={[styles.statusButtonTitle, themedStyles.statusTitle]}>
                  {shortcut.title}
                </ThemedText>
              </View>
              <Text style={[styles.statusButtonDescription, themedStyles.statusDescription]}>
                {shortcut.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {ADMIN_ACTIONS.map((action) => {
            const onPress =
              action.key === 'requests'
                ? navigateToRequests
                : navigateToCreateRequest;
            return (
              <TouchableOpacity
                key={action.key}
                style={[styles.statusButton, styles.quickActionButton, themedStyles.quickActionCard]}
                onPress={onPress}>
                <View style={styles.statusButtonHeader}>
                  <ThemedText type="subtitle" style={[styles.statusButtonTitle, themedStyles.quickActionTitle]}>
                    {action.title}
                  </ThemedText>
                  <View style={[styles.quickActionBadge, themedStyles.quickActionBadge]}>
                    <Text style={[styles.quickActionBadgeText, { color: palette.text }]}>{action.badge}</Text>
                  </View>
                </View>
                <Text style={[styles.statusButtonDescription, themedStyles.quickActionDescription]}>{action.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
    marginBottom: 6,
  },
  statusButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusButtonDescription: {
    fontSize: 13,
    lineHeight: 18,
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
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});



