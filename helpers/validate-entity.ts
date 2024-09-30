// validate-entity.ts

import { Response } from 'express';

export async function validateEntity(
    model: any, // The model to validate (e.g., Workspace, Challenge)
    entityId: string, // The ID of the entity (e.g., workspaceId, challengeId)
    entityName: string, // The name of the entity for the response message
    res: Response // The Express response object for sending responses
): Promise<any | null> {
    if (!entityId) {
        res.status(422).json({ message: `Missing ${entityName} ID` });
        return null;
    }

    const entity = await model.find({ where: { id: entityId } });

    if (!entity) {
        res.status(404).json({ message: `${entityName} not found` });
        return null;
    }

    return entity;
}
