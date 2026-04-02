export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture: string | null;
  status: string;
  createdAt: Date;
}
