const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Username or email is required'),
    password: z.string().min(1, 'Password is required')
  })
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginSchema,
  validate
};
