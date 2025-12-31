import { api } from "@/api/apiClient";
import { API_UPLOAD_DOCUMENT } from "@/api/apiRoutes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UploadDocumentParams {
  file: {
    uri: string;
    type: string;
    name: string;
  };
  facultyIds: string[];
  subjectId: string;
  documentTypeId: string;
  description: string;
  thumbnailFile?: {
    uri: string;
    type: string;
    name: string;
  };
  images?: {
    uri: string;
    type: string;
    name: string;
  }[];
  title?: string;
}

export const uploadDocument = async (data: UploadDocumentParams) => {
  const formData = new FormData();
  
  // Add main file
  formData.append('file', {
    uri: data.file.uri,
    type: data.file.type,
    name: data.file.name,
  } as any);
  
  // Add faculty IDs as comma-separated string (matching API expectation)
  formData.append('facultyIds', data.facultyIds.join(','));
  
  // Add subject ID
  formData.append('subjectId', data.subjectId);
  
  // Add document type ID
  formData.append('documentTypeId', data.documentTypeId);
  
  // Add description
  formData.append('description', data.description);
  
  // Add title if provided
  if (data.title) {
    formData.append('title', data.title);
  }
  
  // Add thumbnail if provided
  if (data.thumbnailFile) {
    formData.append('thumbnailFile', {
      uri: data.thumbnailFile.uri,
      type: data.thumbnailFile.type,
      name: data.thumbnailFile.name,
    } as any);
  }
  
  // Add images if provided (each as separate 'images' field)
  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('images', {
        uri: image.uri,
        type: image.type,
        name: image.name,
      } as any);
    });
  }

  console.log('Uploading document with data:', {
    file: data.file,
    facultyIds: data.facultyIds,
    subjectId: data.subjectId,
    documentTypeId: data.documentTypeId,
    description: data.description,
    title: data.title,
    thumbnailFile: data.thumbnailFile,
    images: data.images,
  });
  
  const res = await api.post(API_UPLOAD_DOCUMENT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return res.data;
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
    },
  });
};
