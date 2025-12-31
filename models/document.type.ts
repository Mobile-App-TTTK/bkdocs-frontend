export interface UserDocument {
  id: string;
  title: string;
  description: string;
  faculties: string[];
  subject: string;
  uploader: {
    name: string;
    id: string;
    isVerified: boolean;
  };
  thumbnailUrl: string;
  fileUrl: string;
  fileType: string;
  documentType: string;
  downloadUrl: string;
  imageUrls: string[];
  uploadDate: string;
  downloadCount: number;
  overallRating?: number;
}

export interface UserDocumentsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: UserDocument[];
}
