export type Suggestion = {
  id: string;
  title: string;
  uploadDate: string;
  downloadCount: number;
};

export type subject = {
    id: string;
    name: string;
    description?: string;
}

export type faculty = {
    id: string;
    name: string;
    description?: string;
}

export type SearchResult = {
    id: string;
    title: string;
    description: string;
    fileKey: string;
    thumbnailKey: string;
    downloadCount: number;
    status: string;
    uploadDate: string;
    subject: subject;
    faculty: faculty;
};

export type FacultyAndSubject = {
    faculties: faculty[];
    subjects: subject[];
};

export type FilterOptions = {
    sortBy?: string;
    fileType?: string;
    faculty?: string;
    subject?: string;
}