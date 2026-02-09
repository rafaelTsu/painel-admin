
import Joi from 'joi';

export const createSimulationSchema = Joi.object({
    inputValues: Joi.object().pattern(Joi.string(), Joi.any()).required(),
    outputFormat: Joi.string().valid('docx', 'pdf').required()
});
