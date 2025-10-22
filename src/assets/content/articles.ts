import z from 'zod';

const attributeModules = import.meta.glob('./*.md', {
  import: 'attributes',
  eager: true,
});

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  path: z.string(),
  image: z.string(),
  published: z.string().nullable(),
  minutesToRead: z.number().min(1),
});

const articleAttributes: z.infer<typeof articleSchema>[] = [];
for (const modulePath in attributeModules) {
  const attrs = attributeModules[modulePath] as unknown;
  const parsedAttrs = articleSchema.safeParse(attrs);
  if (parsedAttrs.success) {
    articleAttributes.push(parsedAttrs.data);
  } else if (import.meta.env.DEV) {
    console.error(
      `Invalid article attributes in ${modulePath}:`,
      parsedAttrs.error
    );
  }
}

export default articleAttributes;
