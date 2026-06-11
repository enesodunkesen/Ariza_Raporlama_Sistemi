import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATUS_SHORTCUTS = [
  {
    title: 'Beklemede Olan Raporlar',
    description: 'İlk değerlendirme için sırada bekleyen kayıtlar.',
    path: '/admin/reports/pending',
    key: 'pending',
  },
  {
    title: 'İşleme Alınan Raporlar',
    description: 'Operasyon ekipleri tarafından üzerinde çalışılan kayıtlar.',
    path: '/admin/reports/in-progress',
    key: 'in_progress',
  },
  {
    title: 'Tamamlanan Raporlar',
    description: 'Sonuçlandırılmış ve doğrulanmış kayıtlar.',
    path: '/admin/reports/completed',
    key: 'completed',
  },
] as const;

export default function AdminReportsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Rapor Durumları
          </ThemedText>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Raporları süreç durumlarına göre görüntülemek için aşağıdaki kategorilerden birini seçin.
          </Text>
        </View>

        {STATUS_SHORTCUTS.map((shortcut) => (
          <TouchableOpacity
            key={shortcut.key}
            style={[
              styles.shortcutCard,
              {
                borderColor: palette.border,
                backgroundColor:
                  shortcut.key === 'pending'
                    ? palette.statusPendingBg
                    : shortcut.key === 'in_progress'
                    ? palette.statusInProgressBg
                    : palette.statusCompletedBg,
                shadowColor: palette.cardShadow,
              },
            ]}
            onPress={() => router.push(shortcut.path as any)}>
            <ThemedText type="subtitle" style={styles.shortcutTitle}>
              {shortcut.title}
            </ThemedText>
            <Text style={[styles.shortcutDescription, { color: palette.statusText }]}>{shortcut.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  shortcutCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  shortcutTitle: {
    fontSize: 18,
    marginBottom: 6,
  },
  shortcutDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

