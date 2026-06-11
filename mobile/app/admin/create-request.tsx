import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import ReportService from '@/services/ReportService';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateRequestScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const [reportNumber, setReportNumber] = useState('');
  const [requestText, setRequestText] = useState('');
  const reportService = ReportService.getInstance();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validasyon
    if (!reportNumber.trim()) {
      Alert.alert('Hata', 'Rapor numarası zorunludur.');
      return;
    }
    if (!requestText.trim()) {
      Alert.alert('Hata', 'Talep metni zorunludur.');
      return;
    }

    setIsLoading(true);
    try {
      // Talep oluştur
      const result = await reportService.addRequest(reportNumber.trim(), requestText.trim());

      if (result.success && result.data) {
        Alert.alert(
          'Başarılı',
          'Talep başarıyla oluşturuldu!',
          [
            {
              text: 'Tamam',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Hata', result.error || 'Talep oluşturulurken bir sorun oluştu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Talep oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const themedStyles = useMemo(
    () => ({
      input: {
        backgroundColor: palette.surface,
        borderColor: palette.border,
        color: palette.text,
      },
      submitButton: {
        backgroundColor: palette.primary,
        shadowColor: palette.cardShadow,
      },
      submitButtonText: {
        color: palette.primaryText,
      },
    }),
    [colorScheme]
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic">
        <View style={styles.form}>
          {/* Rapor No */}
          <View style={styles.inputContainer}>
            <ThemedText type="default" style={styles.label}>
              Rapor No *
            </ThemedText>
            <TextInput
              style={[styles.input, themedStyles.input]}
              value={reportNumber}
              onChangeText={setReportNumber}
              placeholder="Rapor numarasını girin"
              placeholderTextColor={palette.muted}
            />
          </View>

          {/* Talep Metni */}
          <View style={styles.inputContainer}>
            <ThemedText type="default" style={styles.label}>
              Talep Metni *
            </ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, themedStyles.input]}
              value={requestText}
              onChangeText={setRequestText}
              placeholder="Talep metninizi girin"
              placeholderTextColor={palette.muted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>
        </ScrollView>

        {/* Gönder Butonu */}
        <View style={[styles.footer, { paddingBottom: 20 + insets.bottom }]}>
          <TouchableOpacity style={[styles.submitButton, themedStyles.submitButton]} onPress={handleSubmit} disabled={isLoading}>
            <Text style={[styles.submitButtonText, themedStyles.submitButtonText]}>
              {isLoading ? 'Gönderiliyor...' : 'Gönder'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
  },
  form: {
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  footer: {
    paddingBottom: 20,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
