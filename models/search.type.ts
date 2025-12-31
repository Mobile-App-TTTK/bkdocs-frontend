import { SearchFileType, SearchSortOption } from "@/utils/constants";

export type Suggestion = {
  id: string;
  title: string;
  uploadDate: string;
  downloadCount: number;
};

export type SuggestioSubject = {
    id: string;
    name: string;
    count: number;
    imageUrl: string | null;
}

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
    documents: Document[];
    users: SearchUser[];
    subjects: SearchSubject[];
    faculties: SearchFaculty[];
}

export type Document = {
    id: string;
    title: string;
    downloadCount: number;
    uploadDate: string;
    subject: subject;
    faculty: faculty;
    thumbnail: string;
    score: number;
    type: string;
};

export type SearchUser = {
    id: string;
    name: string;
    image_url: string;
    followersCount: number;
    documentsCount: number;
    isFollowing: boolean;
}

export type SearchSubject = {
    id: string;
    name: string;
    count: number;
    image_url: string;
}

export type SearchFaculty = {
    id: string;
    name: string;
    count: number;
    image_url: string;
}

export type documentTypes ={
    id: string;
    name: string;
}

export type FacultyAndSubject = {
    faculties: faculty[];
    subjects: subject[];
    documentTypes: documentTypes[];
};

export type FilterOptions = {
    sort?: SearchSortOption;
    type?: SearchFileType;
    faculty?: string;
    subject?: string;
}