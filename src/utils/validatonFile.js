export const validateEditProfile = (body) => {
  const fieldsAllowedToUpdate = [
    "firstName",
    "lastName",
    "password",
    "age",
    "phoneNumber",
    "about",
    "skills",
    "hobbies",
    "photo",
    "gender",
  ];

  const fieldsToUpdate = Object.keys(body);
  if (fieldsToUpdate.length === 0) return false;

  const isValidOperation = fieldsToUpdate.every((field) =>
    fieldsAllowedToUpdate.includes(field)
  );

  return isValidOperation;
};
