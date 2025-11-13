export type FacultyInfo = {
  name: string;
  imageUrl: string;
  document_count: number;
  followers_count: number;
  isFollowingFaculty: boolean;
  subjects: Subject[];
}

export type Subject = {
  id: string;
  name: string;
  isFollowing: boolean;
  documents: DocumentItem[];
};

export type DocumentItem = {
  id: string;
  title: string;
  downloadCount: number;
  uploadDate: string;
  thumbnail: string;
  score: number | null;
  type: 'pdf' | 'docx' | 'pptx' | string;
};