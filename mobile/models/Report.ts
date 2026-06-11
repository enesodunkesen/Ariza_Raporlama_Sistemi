export type WorkflowStatus = 'pending' | 'in_progress' | 'completed';

export interface Report {
  id: string;
  reportNumber: string;
  bantNumber: string;
  productCode: string;
  errorCode: string;
  description?: string;
  photos: string[];
  createdAt: Date;
  createdBy: string;
  status: WorkflowStatus;
}

export interface User {
  id: string;
  username: string;
  password: string;
  bantNumber: string;
  role: 'user' | 'admin' | 'chief';
  profileIcon?: string;
}

export interface Request {
  id: string;
  requestNumber: string;
  reportNumber: string;
  requestText: string;
  createdAt: Date;
  createdBy: string;
  status: WorkflowStatus;
}
