let faculties: string[] = [];
let subjects: string[] = [];
let lists: string[] = [];
let images: string[] = [];
let coverImage: string | null = null;

export function setSelectedFaculties(list: string[]) {
  faculties = Array.isArray(list) ? [...list] : [];
}

export function getSelectedFaculties(): string[] {
  return faculties;
}

export function setSelectedSubjects(list: string[]) {
  subjects = Array.isArray(list) ? [...list] : [];
}

export function getSelectedSubjects(): string[] {
  return subjects;
}

export function setSelectedLists(list: string[]) {
  lists = Array.isArray(list) ? [...list] : [];
}

export function getSelectedLists(): string[] {
  return lists;
}

export function setSelectedImages(list: string[]) {
  images = Array.isArray(list) ? [...list] : [];
}

export function getSelectedImages(): string[] {
  return images;
}

export function setCoverImage(uri: string | null) {
  coverImage = uri || null;
}

export function getCoverImage(): string | null {
  return coverImage;
}

