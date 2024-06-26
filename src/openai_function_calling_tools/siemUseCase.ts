import { Tool } from './tool';
import { z } from 'zod';

export function createSIEMUseCaseMetadata() {
  const paramsSchema = z.object({
    description: z.string().array(),
    potentialFalsePositives: z.string().array(),
    mitreAttack: z.string().array(),
    reference: z.string(),
    tags: z.string().array(),
  });
  const name = 'SIEMUseCaseMetadata';
  const description = `useful for when you need to create a SIEM Use Case metadata. Keep the resulting format, NEVER rewrite the content.
inputs are:
- Description: An array of strings representing each required sentences of the description of the Use Case.
- PotentialFalsePositives: An array of strings describing potential false positives of this Use Case.
- MitreAttack: An array of strings for Mitre ATT&CK sub-techniques IDs related to the Use Case.
- Reference: A string representing ONE valid http URL including protocol.
- Tags: An array of strings representing relevant tags associated to each sub-technique of the MITRE ATT&CK.
`;

  const execute = async ({ description, potentialFalsePositives, mitreAttack, reference, tags }: z.infer<typeof paramsSchema>) => {
    try {


      return `\`\`\`markdown
Description: ${description.join("\n")}

Potential False Positives:
${potentialFalsePositives.map(element => "  - " + element).join("\n")}

MITRE ATT&CK: ${mitreAttack.join(", ")}
Reference: ${reference}
Tags: ${tags.join(", ")}
\`\`\``
    } catch (error) {
      return `Error generating the markdown: ${error}`;
    }
  };

  return new Tool<typeof paramsSchema, z.ZodType<Promise<string>, any>>(paramsSchema, name, description, execute).tool;
}
