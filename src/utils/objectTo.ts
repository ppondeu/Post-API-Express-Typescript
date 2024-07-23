import { ID } from "../dtos/Id.dto";

export const objectTo = (id: ID, data: any, table: string): { queryString: string, updateParams: any[] } => {
    const fields = Object.keys(data).filter((key) => key !== "id");
    const values = Object.values(data).filter((value) => value !== undefined);

    if (fields.length === 0 || values.length === 0) {
        throw new Error(`no fields to update`);
    }
    console.log(`fields`, fields);
    console.log(`values`, values);

    let queryString = `UPDATE ${table} SET`;
    const updateParams = [];
    let paramIndex = 1;

    fields.forEach((field, index) => {
        queryString += ` ${field} = $${paramIndex}`;
        updateParams.push(values[index]);
        paramIndex++;

        if (index !== fields.length - 1) {
            queryString += `,`;
        }
    });

    queryString += ` WHERE id = $${paramIndex} RETURNING *`;
    updateParams.push(id);

    console.log(`queryString`, queryString);
    console.log(`updateParams`, updateParams);

    return { queryString, updateParams };
}