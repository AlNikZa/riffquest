export const getUserData = async (userAccessToken) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('❌ Error in getUserId function: ' + err);
    throw err;
  }
};
