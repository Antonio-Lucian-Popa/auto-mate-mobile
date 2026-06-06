import { apiRequest, apiUpload } from "@/services/api/client";
import type { CarDocument } from "@/types";

type BackendDocument = Omit<CarDocument, "imageUri"> & {
  imageUrl: string;
};

function mapDoc(d: BackendDocument): CarDocument {
  return { ...d, imageUri: d.imageUrl };
}

export const documentsService = {
  async list(carId?: string): Promise<CarDocument[]> {
    const qs = carId ? `?carId=${carId}` : "";
    const data = await apiRequest<BackendDocument[]>(`/documents${qs}`);
    return data.map(mapDoc);
  },

  async create(input: Omit<CarDocument, "id" | "createdAt">): Promise<CarDocument> {
    const formData = new FormData();
    formData.append("carId", input.carId);
    formData.append("type", input.type);
    formData.append("title", input.title);
    if (input.linkedCostId) formData.append("linkedCostId", input.linkedCostId);
    if (input.linkedReminderId) formData.append("linkedReminderId", input.linkedReminderId);

    // imageUri este un local file URI (din camera sau galerie)
    formData.append("file", {
      uri: input.imageUri,
      type: "image/jpeg",
      name: "document.jpg",
    } as unknown as Blob);

    const data = await apiUpload<BackendDocument>("/documents", formData);
    return mapDoc(data);
  },

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/documents/${id}`, { method: "DELETE" });
  },
};
