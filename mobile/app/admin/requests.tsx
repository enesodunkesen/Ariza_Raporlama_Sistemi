import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Request } from '@/models/Report';
import ReportService from '@/services/ReportService';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function AdminRequestsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const [requests, setRequests] = useState<Request[]>([]);
  const reportService = ReportService.getInstance();

  useEffect(() => {
    const loadRequests = async () => {
      const allRequests = await reportService.getAllRequests();
      setRequests(allRequests || []);
    };
    loadRequests();
  }, []);

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
      number: {
        color: palette.primary,
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
          label: 'Tamamlandı',
          backgroundColor: palette.statusCompletedBg,
        },
      },
    }),
    [colorScheme]
  );

  const renderRequestCard = ({ item }: { item: Request }) => {
    const config = themedStyles.statusConfig[item.status];

    return (
      <View style={[styles.requestCard, themedStyles.card]}>
        <View style={[styles.requestHeader, themedStyles.header]}>
          <ThemedText type="subtitle" style={[styles.requestNumber, themedStyles.number]}>
          {item.requestNumber}
        </ThemedText>
          <ThemedText type="default" style={styles.requestDate}>
          {new Date(item.createdAt).toLocaleDateString('tr-TR')}
        </ThemedText>
        </View>
        
        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <ThemedText type="default" style={styles.detailLabel}>Rapor No:</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{item.reportNumber}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText type="default" style={styles.detailLabel}>Oluşturan:</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.detailValue}>{item.createdBy}</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText type="default" style={styles.detailLabel}>Durum:</ThemedText>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: config?.backgroundColor ?? palette.surfaceMuted,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.statusText, { color: palette.statusText }]}>
                {config?.label ?? 'Beklemede'}
              </Text>
            </View>
          </View>
          
          <View style={styles.descriptionContainer}>
            <ThemedText type="default" style={styles.detailLabel}>Talep Metni:</ThemedText>
            <ThemedText type="default" style={styles.descriptionText}>{item.requestText}</ThemedText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Requests List */}
      {requests.length > 0 ? (
        <FlatList
          data={requests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 12, paddingHorizontal: 0 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText type="subtitle" style={[styles.emptyText, themedStyles.emptyText]}>
            Henüz talep bulunmuyor
          </ThemedText>
          <ThemedText type="default" style={[styles.emptySubtext, themedStyles.emptyText]}>
            İlk talebinizi oluşturmak için "Talep Oluştur" butonunu kullanın.
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  
  list: {
    flex: 1,
  },
  requestCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  requestNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  requestDetails: {
    gap: 8,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});
