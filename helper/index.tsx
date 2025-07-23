import { Buffer } from "buffer"; // ensure this is imported
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from 'expo-file-system';
import { supabase } from "./supabaseClient";
global.Buffer = Buffer; 

export const uploadToSupabase = async (file: DocumentPicker.DocumentPickerAsset) => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}.${fileExt}`;
    const localUri = `${FileSystem.cacheDirectory}${file.name}`;
    await FileSystem.copyAsync({
      from: file.uri,
      to: localUri,
    });
    const base64File = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const contentType = file.mimeType || 'application/octet-stream';
    const fileBuffer = Buffer.from(base64File, 'base64');
    const { data, error } = await supabase.storage
      .from('uploads') // your bucket name
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      });
    if (error) {
      console.log("Upload Error:", error);
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: publicUrlData?.publicUrl,
    };
  } catch (e) {
    console.log("uploadToSupabase error", e);
    return null;
  }
};

export const listFiles = async () => {
  const { data, error } = await supabase
    .storage
    .from('uploads')
    .list('', {
      limit: 100,
      sortBy: { column: 'name', order: 'desc' },
    });

  if (error) {
    console.error('Error fetching file list:', error.message);
    return;
  }
  console.log('data ',data)
  return data;
};
