import { apiRequest, apiUpload } from "@/services/api/client";
import type { CarDocument } from "@/types";

type BackendDocument = Omit<CarDocument, "imageUri"> & {
  imageUrl: string;
};

type DocumentCreateInput = Omit<CarDocument, "id" | "createdAt">;

function mapDoc(d: BackendDocument): CarDocument {
  return { ...d, imageUri: d.imageUrl };
}

export const documentsService = {
  async list(carId?: string): Promise<CarDocument[]> {
    const qs = carId ? `?carId=${carId}` : "";
    const data = await apiRequest<BackendDocument[]>(`/documents${qs}`);
    return data.map(mapDoc);
  },

  async create(input: DocumentCreateInput): Promise<CarDocument> {
    const formData = new FormData();
    formData.append("carId", input.carId);
    formData.append("type", input.type);
    formData.append("title", input.title);
    if (input.linkedCostId) formData.append("linkedCostId", input.linkedCostId);
    if (input.linkedReminderId) formData.append("linkedReminderId", input.linkedReminderId);

    const mimeType = input.mimeType ?? "image/jpeg";
    const defaultName = mimeType === "application/pdf" ? "document.pdf" : "document.jpg";

    formData.append("file", {
      uri: input.imageUri,
      type: mimeType,
      name: input.fileName ?? defaultName,
    } as unknown as Blob);

    const data = await apiUpload<BackendDocument>("/documents", formData);
    return mapDoc(data);
  },

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/documents/${id}`, { method: "DELETE" });
  },
};
