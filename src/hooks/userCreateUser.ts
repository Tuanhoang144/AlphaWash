// import { useState } from 'react';
// import { userApi } from '../common/api';

// export const useCreateUser = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<Error | null>(null);

//   const createUser = async (data: Omit<User, 'id'>) => {
//     setLoading(true);
//     try {
//       const newUser = await userApi.create(data);
//       return newUser;
//     } catch (err) {
//       setError(err as Error);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { createUser, loading, error };
// };