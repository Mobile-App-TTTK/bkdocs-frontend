export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: string;
  imageUrl: string;
  faculty: string;
  intakeYear: number;
  documentCount: number;
  numberFollowers: number;
  participationDays: number;
  isFollowed?: boolean;
};

export type FollowingUser = {
  id: string;
  name: string;
  documentCount: number;
  imageUrl: string;
};

export type SubscribedFaculty = {
  id: string;
  name: string;
  documentCount: number;
  imageUrl: string;
};

export type SubscribedSubject = {
  id: string;
  name: string;
  documentCount: number;
  imageUrl: string;
};

export type FollowListResponse = {
  followingUsers: FollowingUser[];
  subscribedFacultyIds: SubscribedFaculty[];
  subscribedSubjectIds: SubscribedSubject[];
};
