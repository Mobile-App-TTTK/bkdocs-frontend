export type SubjectInfo = {
  name: string;
  imageUrl: string;
  document_count: number;
  followers_count: number;
  isFollowingSubject: boolean;
  types: SubjectType[];
}

export type SubjectType = {
  id: string;
  name: string;
  documents: SubjectDocument[];
};

export type SubjectDocument = {
  id: string;
  title: string;
  downloadCount: number;
  uploadDate: string;
  thumbnail: string;
  score: number | null;
  type: 'pdf' | 'docx' | 'pptx' | string;
};
