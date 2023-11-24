import { Parser } from "expr-eval";
import { z } from "zod";
import { Tool } from "./tool";
import { t } from "i18next";
import useStore from "@store/store";
import { fetchNoCors } from "./fetch-no-cors";

function objectMap(object, mapFn) {
  return Object.keys(object).reduce((result, key) => {
     return new Promise(function() {
       result[key] = mapFn(object[key])
       return result
     });
  }, {})
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

            const res = await fetchNoCors(endpoint, {
                method: 'POST',
                body: {
                    prompt,
                    n,
                    size: "256x256",
                    response_format: "b64_json"
                },
                headers: headers
            });

            var urls = await Promise.all(objectMap(res.data, async function(element: any) {
                const res2 = await fetch("https://api.imgur.com/3/image", {
                    method: 'POST',
                    body: JSON.stringify({
                        image: element.b64_json
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Client-ID 047169aabbd6925"
                    }
                });
                var link = (await res2.json()).data.link;
                return link;
            }));

            return JSON.stringify(urls);
        } catch (error) {
            throw new Error("An error occured. It seems like openai are blocking some words so it's possible that one or more words from your query were blocked (https://harishgarg.com/writing/do-not-use-these-banned-words-in-dall-e-prompts/). Error: " + error);
        }
    };

    return new Tool<(typeof paramsSchema), z.ZodType<Promise<string>, any>>(paramsSchema, name, description, execute).tool;
}
