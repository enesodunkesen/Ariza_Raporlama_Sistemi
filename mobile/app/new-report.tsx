import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import ReportService from '@/services/ReportService';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useMemo, useState, useCallback } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

export default function NewReportScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [bantNumber] = useState('BANT001');
  const [productCode, setProductCode] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const reportService = ReportService.getInstance();

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Validasyon
    if (!productCode.trim()) {
      Alert.alert('Hata', 'Ürün kodu zorunludur.');
      return;
    }
    if (!errorCode.trim()) {
      Alert.alert('Hata', 'Hata kodu zorunludur.');
      return;
    }
    if (photos.length === 0) {
      Alert.alert('Hata', 'En az bir fotoğraf eklemeniz zorunludur.');
      return;
    }

    setIsLoading(true);
    try {
      // Yeni rapor oluştur
      const newReport = await reportService.addReport({
        bantNumber: bantNumber.trim(),
        productCode: productCode.trim(),
        errorCode: errorCode.trim(),
        description: description.trim() || undefined,
        photos: photos,
      });

      if (newReport) {
        Alert.alert(
          'Başarılı',
          'Rapor başarıyla kaydedildi!',
          [
            {
              text: 'Tamam',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Hata', 'Rapor kaydedilirken bir sorun oluştu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Rapor kaydedilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPhoto = () => {
    if (!permission) {
      // Permission is still loading
      return;
    }

    if (!permission.granted) {
      // Permission is not granted yet
      requestPermission();
      return;
    }

    setShowCamera(true);
  };

  const handleShowBarcodeScanner = () => {
    if (!permission) {
      // Permission is still loading
      return;
    }

    if (!permission.granted) {
      // Permission is not granted yet
      requestPermission();
      return;
    }

    setShowBarcodeScanner(true);
  }

  const handleCloseCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  const handleCloseBarcodeScanner = useCallback(() => {
    setShowBarcodeScanner(false);
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        
        if (photo && photo.uri) {
          setPhotos([...photos, photo.uri]);
          setShowCamera(false);
          Alert.alert('Başarılı', 'Fotoğraf eklendi!');
        }
      } catch (error) {
        console.error('Failed to take picture:', error);
        Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const cameraRef = React.useRef<CameraView>(null);

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setProductCode(data);
    setShowBarcodeScanner(false);
    Alert.alert('Başarılı', 'Ürün kodu güncellendi!');
  };

  const themedStyles = useMemo(
    () => ({
      input: {
        backgroundColor: palette.surface,
        borderColor: palette.border,
        color: palette.text,
      },
      disabledInput: {
        backgroundColor: palette.surfaceMuted,
        color: palette.muted,
      },
      photoButton: {
        borderColor: palette.primary,
        backgroundColor: palette.primaryMuted,
      },
      photoButtonText: {
        color: palette.primary,
      },
      saveButton: {
        backgroundColor: palette.primary,
        shadowColor: palette.cardShadow,
      },
      saveButtonText: {
        color: palette.primaryText,
      },
      removePhotoButton: {
        backgroundColor: palette.danger,
      },
      removePhotoText: {
        color: palette.dangerText,
      },
      photosLabel: {
        color: palette.muted,
      },
      barcodeButton: {
        backgroundColor: palette.surface,
        borderColor: palette.border,
      },
      barcodeButtonText: {
        color: palette.text,
      },
    }),
    [palette]
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic">
        <View style={styles.form}>
          {/* Bant No */}
          <View style={styles.inputContainer}>
            <ThemedText type="default" style={styles.label}>
              Bant No *
            </ThemedText>
            <TextInput
              style={[styles.input, themedStyles.input, themedStyles.disabledInput]}
              value={bantNumber}
              editable={false}
            />
          </View>

          {/* Ürün Kodu */}
          <View style={styles.inputContainer}>
            <View style={styles.productCodeContainer}>
              <ThemedText type="default" style={styles.label}>
                Ürün Kodu *
              </ThemedText>
              <TouchableOpacity
                style={[styles.barcodeButton, themedStyles.barcodeButton]}
                onPress={handleShowBarcodeScanner}>
                <Text style={[styles.barcodeButtonText, themedStyles.barcodeButtonText]}>Barcode</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, themedStyles.input]}
              value={productCode}
              onChangeText={setProductCode}
              placeholder="Ürün kodunu girin veya barkod okutun"
              placeholderTextColor={palette.muted}
            />
          </View>

          {/* Hata Kodu */}
          <View style={styles.inputContainer}>
            <ThemedText type="default" style={styles.label}>
              Hata Kodu *
            </ThemedText>
            <TextInput
              style={[styles.input, themedStyles.input]}
              value={errorCode}
              onChangeText={setErrorCode}
              placeholder="Hata kodunu girin"
              placeholderTextColor={palette.muted}
            />
          </View>

          {/* Açıklama */}
          <View style={styles.inputContainer}>
            <ThemedText type="default" style={styles.label}>
              Açıklama
            </ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, themedStyles.input]}
              value={description}
              onChangeText={setDescription}
              placeholder="Açıklama girin (isteğe bağlı)"
              placeholderTextColor={palette.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Fotoğraf Ekleme */}
          <View style={styles.inputContainer}>
            <ThemedText type="default" style={styles.label}>
              Fotoğraf *
            </ThemedText>
            <TouchableOpacity style={[styles.photoButton, themedStyles.photoButton]} onPress={handleAddPhoto}>
              <Text style={[styles.photoButtonText, themedStyles.photoButtonText]}>📷 Fotoğraf Ekle</Text>
            </TouchableOpacity>
            
            {/* Eklenen Fotoğraflar */}
            {photos.length > 0 && (
              <View style={styles.photosContainer}>
                <ThemedText type="default" style={[styles.photosLabel, themedStyles.photosLabel]}>
                  Eklenen Fotoğraflar ({photos.length}):
                </ThemedText>
                <View style={styles.photosGrid}>
                  {photos.map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image 
                        source={photo}
                        style={styles.photoImage}
                        placeholder={require('@/assets/images/icon.png')}
                      />
                      <TouchableOpacity 
                        style={[styles.removePhotoButton, themedStyles.removePhotoButton]} 
                        onPress={() => removePhoto(index)}
                      >
                        <Text style={[styles.removePhotoText, themedStyles.removePhotoText]}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Kaydet Butonu */}
      <View style={[styles.footer, { paddingBottom: 20 + insets.bottom }]}>
        <TouchableOpacity style={[styles.saveButton, themedStyles.saveButton]} onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveButtonText, themedStyles.saveButtonText]}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>

      {/* Kamera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
              <Text style={styles.cameraButtonText}>🔄</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cameraButton} onPress={handleCloseCamera}>
              <Text style={styles.cameraButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barcode Scanner Modal */}
      <Modal visible={showBarcodeScanner} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cameraButton} onPress={handleCloseBarcodeScanner}>
              <Text style={styles.cameraButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  productCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
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
    height: 100,
    paddingTop: 12,
  },
  photoButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
  },
  barcodeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  barcodeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  photosContainer: {
    marginTop: 15,
  },
  photosLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoItem: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  photoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    paddingBottom: 20,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
  },
});
