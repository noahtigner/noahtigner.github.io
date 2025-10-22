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

// const articleAttributes = {
//   reactConf2025: {
//     title: 'React Conf 2025 Highlights',
//     description:
//       'A summary of my key takeaways from React Conf 2025. Topics include the new React Compiler, React 19.2, Activity, ViewTransitions, and more.',
//     tags: ['react', 'conference', 'frontend'],
//     path: '/articles/react-conf-2025',
//     image: '/images/react-conf-2025.svg',
//     published: 'October 12, 2025',
//   },
//   // automerge: {
//   //   title: 'Building Collaborative Apps with Automerge',
//   //   description: '',
//   //   tags: [],
//   //   path: '',
//   //   image: '',
//   //   published: null,
//   // }
// };

export default articleAttributes;
