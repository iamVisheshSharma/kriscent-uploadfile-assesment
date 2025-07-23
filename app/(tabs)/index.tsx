import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  Alert,
  Button,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

export default function HomeScreen() {
  const [fileInfo, setFileInfo] =
    useState<null | DocumentPicker.DocumentPickerAsset>(null);
  const [error, setError] = useState("");
  console.log(fileInfo)
  const pickFile = async () => {
    setError("");
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/png", "image/jpeg", "application/pdf"],
        copyToCacheDirectory: false,
        multiple: false,
      });

      if (result.canceled) {
        setError("No file selected.");
        return;
      }

      const file = result.assets[0];

      if (
        !ALLOWED_TYPES.includes(file.mimeType || "") ||
        file.size == undefined ||
        file.size > MAX_FILE_SIZE
      ) {
        setError("Only PNG/JPG/PDF under 5 MB allowed.");
        return;
      }
      setFileInfo(file);
      Alert.alert(
        "File is valid!",
        `Name: ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB`
      );
    } catch (err) {
      console.error(err);
      setError("Something went wrong while picking the file.");
    }
  };
  const openPDF = async () => {
    if (fileInfo?.uri) {
      const supported = await Linking.canOpenURL(fileInfo.uri);
      if (supported) {
        await Linking.openURL(fileInfo.uri);
      } else {
        Alert.alert("Unable to open PDF.");
      }
    }
  };
  return (
    <View style={styles.container}>
      <Button title="Select File" onPress={pickFile} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {fileInfo && (
        <View style={styles.infoBox}>
          <Text style={styles.label}>Selected File:</Text>
          <Text style={styles.infoText}>Name: {fileInfo.name}</Text>
          {fileInfo.size && <Text >Size: {(fileInfo.size / 1024 / 1024).toFixed(2)} MB</Text>}
          <Text style={styles.infoText}>Type: {fileInfo.mimeType}</Text>
          {fileInfo.mimeType?.startsWith("image/") && (
            <Image
              source={{ uri: fileInfo.uri }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          )}
          {fileInfo.mimeType === "application/pdf" && (
            <TouchableOpacity style={styles.openPdfButton} onPress={openPDF}>
              <Text style={styles.openPdfText}>Open PDF in Browser</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
    backgroundColor: '#fff'
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
    color: '#0d0d0d'
  },
  infoText: {
    color: '#0d0d0d'
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
});
