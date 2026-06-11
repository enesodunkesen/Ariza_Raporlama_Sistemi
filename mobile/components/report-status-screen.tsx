import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Report, WorkflowStatus } from '@/models/Report';
import ReportService from '@/services/ReportService';

type Scope = 'user' | 'admin';

export type ReportStatusScreenProps = {
  status: WorkflowStatus;
  scope: Scope;
  title: string;
  description: string;
  showCreator?: boolean;
};

export function ReportStatusScreen({
  status,
  scope,
  title,
  description,
  showCreator = scope === 'admin',
}: ReportStatusScreenProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const router = useRouter();
  const reportService = useMemo(() => ReportService.getInstance(), []);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    const currentUser = reportService.getCurrentUser();
    if (!currentUser) {
      router.replace('/(auth)/sign-in');
      return;
    }

    let result: Report[] = [];
    if (scope === 'user') {
      result = await reportService.getReportsByStatus(status, currentUser.username);
    } else {
      result = await reportService.getReportsByStatus(status);
    }
    setReports(result || []);
  }, [reportService, router, scope, status]);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

  const themedStyles = useMemo(
    () => ({
      card: {
        backgroundColor: palette.surface,
        borderColor: palette.border,
        shadowColor: palette.cardShadow,
      },
      header: {
        borderBottomColor: palette.border,
      },
      reportNumber: {
        color: palette.primary,
      },
      photo: {
        borderColor: palette.border,
      },
      emptyText: {
        color: palette.muted,
      },
      statusConfig: {
        pending: {
          label: 'Beklemede',
          backgroundColor: palette.statusPendingBg,
        },
        in_progress: {
          label: 'İşleme Alındı',
          backgroundColor: palette.statusInProgressBg,
        },
        completed: {
          label: 'İşlem Tamamlandı',
          backgroundColor: palette.statusCompletedBg,
        },
      } as Record<WorkflowStatus, { label: string; backgroundColor: string }>,
    }),
    [palette]
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={styles.sectionTitle}>
            {title}
          </ThemedText>
          <Text style={[styles.sectionDescription, { color: palette.muted }]}>{description}</Text>
        </View>

        {reports.length === 0 ? (
          <View style={[styles.emptySection, { borderColor: palette.border, backgroundColor: palette.surfaceMuted }]}>
            <ThemedText type="default" style={[styles.emptySectionText, themedStyles.emptyText]}>
              Bu kategoride rapor bulunmuyor.
            </ThemedText>
          </View>
        ) : (
          reports.map((item) => {
            const statusMeta = themedStyles.statusConfig[item.status];
            return (
              <View key={item.id} style={[styles.reportCard, themedStyles.card]}>
                <View style={[styles.reportHeader, themedStyles.header]}>
                  <View>
                    <ThemedText type="subtitle" style={[styles.reportNumber, themedStyles.reportNumber]}>
                      {item.reportNumber}
                    </ThemedText>
                    <ThemedText type="default" style={styles.reportDate}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : ''}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusMeta?.backgroundColor ?? palette.surfaceMuted,
                        borderColor: palette.border,
                      },
                    ]}>
                    <Text style={[styles.statusText, { color: palette.statusText }]}>
                      {statusMeta?.label ?? 'Beklemede'}
                    </Text>
                  </View>
                </View>

                <View style={styles.reportDetails}>
                  <View style={styles.detailRow}>
                    <ThemedText type="default" style={styles.detailLabel}>
                      Bant No:
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                      {item.bantNumber}
                    </ThemedText>
                  </View>

                  <View style={styles.detailRow}>
                    <ThemedText type="default" style={styles.detailLabel}>
                      Ürün Kodu:
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                      {item.productCode}
                    </ThemedText>
                  </View>

                  <View style={styles.detailRow}>
                    <ThemedText type="default" style={styles.detailLabel}>
                      Hata Kodu:
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                      {item.errorCode}
                    </ThemedText>
                  </View>

                  {showCreator && (
                    <View style={styles.detailRow}>
                      <ThemedText type="default" style={styles.detailLabel}>
                        Oluşturan:
                      </ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                        {item.createdBy}
                      </ThemedText>
                    </View>
                  )}

                  {item.description && (
                    <View style={styles.descriptionContainer}>
                      <ThemedText type="default" style={styles.detailLabel}>
                        Açıklama:
                      </ThemedText>
                      <ThemedText type="default" style={styles.descriptionText}>
                        {item.description}
                      </ThemedText>
                    </View>
                  )}

                  {item.photos && item.photos.length > 0 && (
                    <View style={styles.photosContainer}>
                      <ThemedText type="default" style={styles.detailLabel}>
                        Fotoğraflar:
                      </ThemedText>
                      <View style={styles.photosGrid}>
                        {item.photos.map((photo, photoIndex) => (
                          <TouchableOpacity 
                            key={photoIndex} 
                            onPress={() => setSelectedImage(photo)}
                            activeOpacity={0.8}
                          >
                            <Image
                              source={{ uri: photo }}
                              style={[styles.photoThumbnail, themedStyles.photo]}
                              defaultSource={require('@/assets/images/icon.png')}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.fullScreenImage} 
              resizeMode="contain"
            />
          )}
        </SafeAreaView>
      </Modal>
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
    paddingBottom: 24,
    paddingTop: 12,
    gap: 16,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 22,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  reportCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  reportNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  reportDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  descriptionContainer: {
    marginTop: 5,
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 3,
    lineHeight: 20,
  },
  photosContainer: {
    marginTop: 5,
    gap: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptySection: {
    paddingVertical: 24,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  emptySectionText: {
    fontSize: 14,
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});

