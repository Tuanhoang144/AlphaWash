import { createApi } from '../factory';
import { User } from '../../../type/user';

export const userApi = createApi<User>('/users');