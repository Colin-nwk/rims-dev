import { createService, createQueryHooks } from '../lib/api';
import { User } from '../types';

// Create user service using factory
export const userService = createService<User>('/users');

// Generate hooks from service
export const {
  useList: useUsers,
  useById: useUser,
  useCreate: useCreateUser,
  useUpdate: useUpdateUser,
  usePatch: usePatchUser,
  useDelete: useDeleteUser,
  useUpload: useUploadUserFile,
  useUploadForItem: useUploadUserAvatar,
  queryKey: userQueryKey,
} = createQueryHooks(userService, 'users');
