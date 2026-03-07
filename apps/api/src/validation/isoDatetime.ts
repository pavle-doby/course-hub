import z from 'zod';

export const isoDatetime = () => z.iso.datetime().transform((date) => new Date(date));
