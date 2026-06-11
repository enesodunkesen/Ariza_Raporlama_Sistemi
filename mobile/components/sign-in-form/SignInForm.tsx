import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import ReportService from '@/services/ReportService';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInForm() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen kullanıcı adı ve şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    try {
      // Kullanıcı doğrulama (merkezî servis)
      const service = ReportService.getInstance();
      const user = await service.login(username.trim(), password.trim());

      if (user) {
        if (user.role === 'chief') {
          router.replace('/admin' as Href);
        } else {
          router.replace('/(tabs)' as Href);
        }
      } else {
        Alert.alert('Hata', 'Kullanıcı adı veya şifre hatalı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılırken bir sorun oluştu.');
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
      button: {
        backgroundColor: palette.primary,
        shadowColor: palette.cardShadow,
      },
      buttonText: {
        color: palette.primaryText,
      },
    }),
    [colorScheme]
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Arıza Raporlama Sistemi
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText type="default" style={styles.label}>
                Kullanıcı Adı
              </ThemedText>
              <TextInput
                style={[styles.input, themedStyles.input]}
                value={username}
                onChangeText={setUsername}
                placeholder="Kullanıcı adınızı girin"
                placeholderTextColor={palette.muted}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type="default" style={styles.label}>
                Şifre
              </ThemedText>
              <TextInput
                style={[styles.input, themedStyles.input]}
                value={password}
                onChangeText={setPassword}
                placeholder="Şifrenizi girin"
                placeholderTextColor={palette.muted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
            </View>

            <TouchableOpacity style={[styles.button, themedStyles.button]} onPress={handleSignIn} disabled={isLoading}>
              <Text style={[styles.buttonText, themedStyles.buttonText]}>
                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
