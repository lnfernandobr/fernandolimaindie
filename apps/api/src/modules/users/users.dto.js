export const toPublicUser = (user) =>
  user === null
    ? null
    : {
        id: String(user._id),
        name: user.name,
        username: user.username,
      };
