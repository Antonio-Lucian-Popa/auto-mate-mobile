import * as ImagePicker from "expo-image-picker";

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
