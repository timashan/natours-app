import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (type, updateData) => {
  try {
    const data = await axios(
      `/api/v1/users/${type === 'password' ? 'updateMyPassword' : 'updateMe'}`,
      {
        method: 'PATCH',
        data: updateData,
      }
    );

    if (data.data.status === 'success') {
      showAlert('success', 'Successfully updated ' + type);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
