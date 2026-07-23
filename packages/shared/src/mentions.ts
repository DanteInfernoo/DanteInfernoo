export interface MentionableMember {
  id: string;
  full_name: string | null;
  email: string;
}

/** Matches "@Some Name" or "@email@domain.com" tokens in note text against
 * workspace members, returning the ids of everyone mentioned. Longer names
 * are matched first so "@Jane Smith" doesn't shadow-match as "@Jane". */
export function parseMentions(
  body: string,
  members: MentionableMember[],
): string[] {
  const matched = new Set<string>();
  const sorted = [...members].sort(
    (a, b) => (b.full_name?.length ?? 0) - (a.full_name?.length ?? 0),
  );

  for (const member of sorted) {
    const needles = [member.full_name, member.email].filter(
      (v): v is string => Boolean(v),
    );
    for (const needle of needles) {
      if (body.includes(`@${needle}`)) {
        matched.add(member.id);
      }
    }
  }

  return [...matched];
}
