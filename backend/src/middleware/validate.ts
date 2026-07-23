import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

/**
 * Middleware factory for validating incoming HTTP requests using Zod schemas.
 * Returns 400 Bad Request on failure with structured validation errors.
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Replace request inputs with the parsed/coerced versions from Zod
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Request validation failed",
          errors: error.errors.map(err => ({
            field: err.path.slice(1).join("."), // slice off "body", "query", etc.
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}
