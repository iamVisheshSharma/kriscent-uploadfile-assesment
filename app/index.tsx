import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { listFiles, uploadToSupabase } from "../helper";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const itemSize = screenWidth / numColumns - 4;

export default function HomeScreen() {
  const inset = useSafeAreaInsets();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any>([]);
  const [fileInfo, setFileInfo] =
    useState<null | DocumentPicker.DocumentPickerAsset>(null);
  const [error, setError] = useState("");

  const isImage = (mimeType: any) => mimeType && mimeType.startsWith("image");
  const pickFile = async () => {
    if (isUploading) return;
    setError("");
    setIsUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/png", "image/jpeg", "application/pdf"],
        copyToCacheDirectory: false,
        multiple: false,
      });

      if (result.canceled) {
        setIsUploading(false);
        setError("No file selected.");
        return;
      }

      const file = result.assets[0];

      if (
        !ALLOWED_TYPES.includes(file.mimeType || "") ||
        file.size == undefined ||
        file.size > MAX_FILE_SIZE
      ) {
        setIsUploading(false);
        setError("Only PNG/JPG/PDF under 5 MB allowed.");
        return;
      }
      const response = await uploadToSupabase(file);
      setIsUploading(false);
      if (!response) {
        setError("Upload failed");
        return;
      }
      setFileInfo({ ...file, uri: response.publicUrl });
      Alert.alert(
        "File is valid!",
        `Name: ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB`
      );
    } catch (err) {
      console.error(err);
      setError("Something went wrong while picking the file.");
    }
  };
  const openPDF = async (publicUrl: any) => {
    const supported = await Linking.canOpenURL(publicUrl);
    if (supported) {
      await Linking.openURL(publicUrl);
    } else {
      Alert.alert("Unable to open PDF.");
    }
  };
  React.useEffect(() => {
    listFiles()
      .then((response) => {
        setUploadedFiles(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [fileInfo?.uri]);
  const renderItem = ({ item }: any) => {
    const publicUrl = `https://jxkbupsmbujlotleyfwt.supabase.co/storage/v1/object/public/uploads/${item.name}`;

    return isImage(item.metadata?.mimetype) ? (
      <View style={styles.item}>
        <Image
          source={{ uri: publicUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    ) : (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.item}
        onPress={() => openPDF(publicUrl)}
      >
        <View style={styles.pdfPlaceholder}>
          <Image
            source={require("../assets/images/pdf-icon.png")}
            style={styles.pdfIcon}
          />
          <Text style={styles.pdfText}>PDF</Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={uploadedFiles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => {
          return (
            <View style={styles.emptyContainer}>
              <Image
                source={require("../assets/images/empty-box.jpg")}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyTitle}>No Files Found</Text>
              <Text style={styles.emptySubtitle}>
                Upload some images or PDFs to see them here.
              </Text>
            </View>
          );
        }}
      />
      {isUploading && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loaderText}>Uploading...</Text>
        </View>
      )}
      <View style={[styles.floatingButton, { bottom: inset.bottom + 10 }]}>
        <TouchableOpacity onPress={pickFile} style={styles.pickerButton}>
          <Ionicons name="add-outline" size={32} color={"#FFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    backgroundColor: "#fff",
  },
  error: {
    marginTop: 10,
    color: "red",
  },
  infoBox: {
    marginTop: 20,
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
  },
  label: {
    fontWeight: "bold",
    color: "#0d0d0d",
  },
  infoText: {
    color: "#0d0d0d",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  openPdfButton: {
    marginTop: 15,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 6,
  },
  openPdfText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    borderRadius: 50,
    backgroundColor: "#007bff",
    padding: 10,
  },
  pickerButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  loaderWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  loaderText: {
    marginTop: 10,
    color: "#007bff",
    fontWeight: "bold",
  },
  list: {
    padding: 4,
  },
  item: {
    width: itemSize - 8,
    margin: 4,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    zIndex: 999,
  },
  image: {
    width: "100%",
    height: itemSize - 20,
  },
  name: {
    fontSize: 12,
    padding: 4,
    textAlign: "center",
  },
  pdfPlaceholder: {
    width: "100%",
    height: itemSize - 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e4e4e4",
  },
  pdfIcon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  pdfText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    opacity: 0.6,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
