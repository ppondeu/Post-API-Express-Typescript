import { Request, Response } from "express-serve-static-core"
export const notFoundMiddleware = (_req: Request, res: Response) => {
    res.status(404).send("404 Not Found");
};

// import { z } from "zod";

// const test = z.object({
//     username: z.string().optional(),
//     password: z.string().optional(),
//     refreshToken: z.string().nullable().optional(),
// });

// // Infer the TypeScript type from the schema
// type Test = z.infer<typeof test>;

// // Test object to validate
// const testObj = {
//     refreshToken: null,
// };

// // Validate the test object
// const validated = test.safeParse(testObj);
// if (validated.success) {
//     console.log(validated.data);
// } else {
//     console.log(validated.error.message);
//     // Exit program on validation error
//     process.exit(1);
// }
// console.log(`validated`, validated.data);

// // Extract fields and values
// const fields = Object.keys(validated.data).filter((key) => key !== "id" && key !== "email");
// const values = Object.values(validated.data).filter((value) => value !== undefined);

// console.log(`fields`, fields);
// console.log(`values`, values);

// // Ensure there are fields to update
// if (fields.length === 0 || values.length === 0) {
//     console.log(`error on user service update user: no fields to update`);
//     throw new Error(`no fields to update`);
// }

// // Construct the SQL query string
// let queryString = `UPDATE users SET`;
// const updateParams: any[] = [];
// let paramIndex = 1;

// fields.forEach((field, index) => {
//     queryString += ` ${field} = $${paramIndex}`;
//     updateParams.push(values[index]);
//     paramIndex++;

//     if (index !== fields.length - 1) {
//         queryString += `,`;
//     }
// });

// console.log(`queryString`, queryString);
// console.log(`updateParams`, updateParams);
