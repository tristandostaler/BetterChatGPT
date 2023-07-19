import { Parser } from "expr-eval";
import { z } from "zod";
import { Tool } from "./tool";
import { t } from "i18next";
import useStore from "@store/store";

export function createImageCreator() {
    const paramsSchema = z.object({
        prompt: z.string(),
        n: z.number(),
        apiKey: z.string(),
    });
    const name = "createImage";
    const description = `Useful for creating images. This function will return an array of URLs of the generated images.
inputs are:
- Prompt: A text description of the desired image(s). The maximum length is 1000 characters.
- n: The number of images to generate. Must be between 1 and 10.
`;

    const execute = async (params: z.infer<typeof paramsSchema>) => {
        const { prompt, n, apiKey } = params;
        if (!apiKey || apiKey == "") throw new Error(t('noApiKeyWarning') as string);
        const endpoint = "https://api.openai.com/v1/images/generations;"
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        };
        try {

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    prompt,
                    n
                }),
            });
            return response.json();
        } catch (error) {
            throw error;
        }
    };

    return new Tool<(typeof paramsSchema), z.ZodType<Promise<string>, any>>(paramsSchema, name, description, execute).tool;
}
