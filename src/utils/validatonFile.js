export const validateEditProfile = (req, res) => {
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
  ];

  const fieldsToUpdate = Object.keys(req.body);
  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  const isValidOperation = fieldsToUpdate.every((field) => {
    return fieldsAllowedToUpdate.includes(field);
  });

  return isValidOperation;
};
