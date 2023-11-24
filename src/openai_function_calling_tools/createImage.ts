import { z } from "zod";
import { Tool } from "./tool";
import { t } from "i18next";
import { fetchNoCors } from "./fetch-no-cors";

function objectMap(object: any, mapFn: any): Promise<any>[] {
    return Object.keys(object).map(function (key: any) {
        return mapFn(object[key]);
    }, {});
}

export function createImageCreator() {
    const paramsSchema = z.object({
        prompt: z.string(),
        n: z.number(),
        apiKey: z.string(),
    });
    const name = "createImage";
    const description = `Useful for creating images. This function will return an array of base64 encoded images of the generated images.
inputs are:
- Prompt: A text description of the desired image(s). The maximum length is 1000 characters.
- n: The number of images to generate. Must be between 1 and 10.
`;

    const execute = async (params: z.infer<typeof paramsSchema>) => {
        const { prompt, n, apiKey } = params;
        if (!apiKey || apiKey == "") throw new Error(t('noApiKeyWarning') as string);
        const endpoint = "https://api.openai.com/v1/images/generations"
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        };
        try {

            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    model: "dall-e-3",
                    quality: "hd",
                    prompt,
                    n,
                    size: "1024x1024",
                    response_format: "url"
                }),
                headers: headers
            });

            return (await res.json()).data.map((element: any) => {
                return element.url;
            });
        } catch (error) {
            throw new Error("An error occured. It seems like openai are blocking some words so it's possible that one or more words from your query were blocked (https://harishgarg.com/writing/do-not-use-these-banned-words-in-dall-e-prompts/). Error: " + error);
        }
    };

    return new Tool<(typeof paramsSchema), z.ZodType<Promise<string>, any>>(paramsSchema, name, description, execute).tool;
}
