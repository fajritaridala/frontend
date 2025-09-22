export interface User {
  address: string;
  fullName: string;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Participant extends User {
  hash?: string;
  certificate?: string;
}

export interface TOEFLRegistration {
  address: string;
  fullName: string;
  email: string;
  nim: string;
  major: string;
  sessionTest: string;
  status: string;
  testDate: Date;
  listening?: number;
  swe?: number;
  reading?: number;
  scoreTotal?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (address: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  address: string;
  fullName: string;
  email: string;
  roleToken?: string;
}

export interface MetaMaskContextType {
  account: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
}

export interface ScoreInput {
  listening: number;
  swe: number;
  reading: number;
}

export interface CertificateData {
  cid: string;
  url: string;
  size: number;
}