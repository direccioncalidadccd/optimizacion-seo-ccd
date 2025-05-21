type ValidationError = {
    property: string;
    reason: string;
};

type PropertyValidator = (property: string, value: any) => ValidationError | undefined;
type SchemaValidator = (body: Record<string, any>) => ValidationError | undefined;

type ValidateRequestResult = ValidationError[];

const isValidationError = (value: any): value is ValidationError => {
    return typeof value?.property !== 'undefined' && typeof value?.reason !== 'undefined';
};

/* CURRIED VALIDATORS */
export const inNumberArray = (allowedNumbers: number[]): PropertyValidator => (property, value) => {
    if (typeof value === 'undefined') return;

    if (typeof value !== 'number' || isNaN(value)) {
        return {
            property,
            reason: `Value ${value} not allowed, must be of type number`,
        };
    }

    if (!allowedNumbers.includes(value)) {
        return {
            property,
            reason: `Value is not valid. Got ${value}, expected ${allowedNumbers}`,
        };
    }
};

export const isBetween = (min: number, max: number): PropertyValidator => (property, value) => {
    if (typeof value === 'undefined') return;

    if (typeof value !== 'number' || isNaN(value)) {
        return {
            property,
            reason: `Value ${value} not allowed, must be of type number`,
        };
    }

    if (value < min || value > max) {
        return {
            property,
            reason: `Value must be between ${min} and ${max}`,
        };
    }
};

export const isRequiredAllOrNone = (requiredKeys: string[]): SchemaValidator => (body) => {
    const presentKeys = Object.keys(body).filter((key) => typeof body[key] !== 'undefined');
    const isValid =
        requiredKeys.every((key) => presentKeys.includes(key)) || requiredKeys.every((key) => !presentKeys.includes(key));

    if (!isValid) {
        return {
            property: '$schema',
            reason: `If one of the following properties is present, all or none must be present: ${requiredKeys.join(', ')}`,
        };
    }
};

/* VALIDATION RUNNER */
export const validateRequest = (
    body: Record<string, any>,
    propertyValidator: Record<string, PropertyValidator | PropertyValidator[]>,
    schemaValidator: SchemaValidator[]
): ValidateRequestResult => {
    const schemaValidations = schemaValidator.map((validator) => validator(body));

    const propValidations = Object.keys(propertyValidator).flatMap((property) => {
        const value = body?.[property];
        const func = propertyValidator[property];
        const validations = Array.isArray(func)
            ? func.map((f) => f(property, value))
            : func?.(property, value);
        return Array.isArray(validations) ? validations : [validations];
    });

    return [...schemaValidations, ...propValidations].filter(isValidationError);
};
