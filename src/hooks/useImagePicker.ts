import * as ImagePicker from "expo-image-picker";

declare const require: (name: string) => any;

export type PickedFile = {
  uri: string;
  name?: string;
  mimeType?: string;
  kind: "image" | "pdf";
};

function fileFromImageUri(uri: string): PickedFile {
  return { uri, kind: "image", mimeType: "image/jpeg", name: "document.jpg" };
}

/** Helper unificat camera / galerie pentru poze bonuri si documente */
export async function pickFromCamera(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: false });
  return res.canceled ? null : res.assets[0].uri;
}

export async function pickFromLibrary(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images });
  return res.canceled ? null : res.assets[0].uri;
}

export async function pickImageFromCamera(): Promise<PickedFile | null> {
  const uri = await pickFromCamera();
  return uri ? fileFromImageUri(uri) : null;
}

export async function pickImageFromLibrary(): Promise<PickedFile | null> {
  const uri = await pickFromLibrary();
  return uri ? fileFromImageUri(uri) : null;
}

export async function pickDocumentFile(): Promise<PickedFile | null> {
  let DocumentPicker: any;
  try {
    DocumentPicker = require("expo-document-picker");
    const res = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (res.canceled) return null;

    const asset = res.assets[0];
    const mimeType = asset.mimeType ?? (asset.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");
    return {
      uri: asset.uri,
      name: asset.name,
      mimeType,
      kind: mimeType === "application/pdf" ? "pdf" : "image",
    };
  } catch {
    throw new Error("PDF-urile necesită rebuild/reinstalare Android după instalarea modulului expo-document-picker. Pozele merg în continuare.");
  }
}
